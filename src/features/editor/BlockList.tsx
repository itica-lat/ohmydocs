import { useMemo, useEffect, useRef, useCallback, useState } from "react";
import {
  DndContext,
  PointerSensor,
  closestCenter,
  useSensor,
  useSensors,
  type DragEndEvent,
} from "@dnd-kit/core";
import {
  SortableContext,
  arrayMove,
  useSortable,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { Copy, GripVertical, Plus, Trash2 } from "lucide-react";
import { useDocumentsStore } from "./store";
import { useSettingsStore } from "@/features/settings/store";
import { blockRegistry } from "@/blocks/registry";
import type { Block, BlockType } from "@/blocks/types";
import { duplicateBlock, insertBlock, removeBlock, replaceBlock, withBlocks } from "./helpers";
import { InsertMenu } from "./InsertMenu";
import { useT } from "@/lib/i18n";

/** In edit mode, all blocks show their inline editor (Apple Pages-style) */

export function BlockList() {
  const activeId = useDocumentsStore((s) => s.activeId);
  const documents = useDocumentsStore((s) => s.documents);
  const upsert = useDocumentsStore((s) => s.upsertDocument);
  const select = useDocumentsStore((s) => s.selectBlock);
  const selected = useDocumentsStore((s) => s.selectedBlockId);
  const viewMode = useSettingsStore((s) => s.viewMode);

  const doc = activeId ? documents[activeId] : null;
  const sensors = useSensors(useSensor(PointerSensor, { activationConstraint: { distance: 4 } }));
  const blocks = useMemo(() => (doc?.blocks ?? []) as Block[], [doc?.blocks]);
  const ids = useMemo(() => blocks.map((b) => b.id), [blocks]);

  const addParagraph = useCallback(() => {
    if (!doc) return;
    const def = blockRegistry["paragraph"];
    const newBlock = def.factory() as Block;
    const next = [...blocks, newBlock];
    upsert(withBlocks(doc, next));
    select(newBlock.id);
    // Focus the new block after render
    requestAnimationFrame(() => {
      const el = document.getElementById(`block-${newBlock.id}`);
      el?.scrollIntoView({ behavior: "smooth", block: "center" });
      // Focus the editor element inside the new block
      const editorEl = el?.querySelector<HTMLElement>(
        'input:not([type="hidden"]), textarea, [contenteditable]',
      );
      editorEl?.focus();
    });
  }, [doc, blocks, upsert, select]);

  const onInsertAtEnd = useCallback(
    (type: BlockType) => {
      if (!doc) return;
      const next = insertBlock(blocks, type, blocks.length);
      upsert(withBlocks(doc, next));
    },
    [doc, blocks, upsert],
  );

  if (!doc) return null;

  const onDragEnd = (e: DragEndEvent) => {
    const fromId = String(e.active.id);
    const overId = e.over ? String(e.over.id) : null;
    if (!overId || fromId === overId) return;
    const fromIdx = ids.indexOf(fromId);
    const toIdx = ids.indexOf(overId);
    if (fromIdx < 0 || toIdx < 0) return;
    upsert(withBlocks(doc, arrayMove(blocks, fromIdx, toIdx)));
  };

  return (
    <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={onDragEnd}>
      <SortableContext items={ids} strategy={verticalListSortingStrategy}>
        <div style={{ display: "flex", flexDirection: "column", minHeight: "100%" }}>
          {blocks.length === 0 ? (
            <EmptyDocumentHint onStart={addParagraph} />
          ) : (
            blocks.map((block, i) => (
              <SortableBlockRow
                key={block.id}
                block={block}
                isSelected={selected === block.id}
                isEditMode={viewMode === "edit"}
                onSelect={() => select(block.id)}
                onChange={(next) => upsert(withBlocks(doc, replaceBlock(blocks, next)))}
                onDuplicate={() => upsert(withBlocks(doc, duplicateBlock(blocks, block.id)))}
                onRemove={() => {
                  upsert(withBlocks(doc, removeBlock(blocks, block.id)));
                  if (selected === block.id) select(null);
                }}
                onAddAfter={() => {
                  const def = blockRegistry["paragraph"];
                  const newBlock = def.factory() as Block;
                  const next = [...blocks];
                  next.splice(i + 1, 0, newBlock);
                  upsert(withBlocks(doc, next));
                  select(newBlock.id);
                }}
              />
            ))
          )}

          {/* Add block area — click to choose which block to insert */}
          <InsertMenu onInsert={onInsertAtEnd} />
        </div>
      </SortableContext>
    </DndContext>
  );
}

// ── Empty document hint ──────────────────────────────────────────────────────

function EmptyDocumentHint({ onStart }: { onStart: () => void }) {
  const ref = useRef<HTMLDivElement>(null);
  const t = useT();

  useEffect(() => {
    ref.current?.focus();
  }, []);

  return (
    <div
      ref={ref}
      tabIndex={0}
      onClick={onStart}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          onStart();
        }
      }}
      role="button"
      aria-label={t("landing.startTyping")}
      style={{
        cursor: "text",
        padding: "3rem 0",
        textAlign: "center",
        color: "var(--color-mute)",
        outline: "none",
      }}
    >
      <p className="lead" style={{ marginBottom: "0.75rem" }}>
        {t("landing.clickToStart")}
      </p>
      <p
        style={{
          fontFamily: "var(--font-ui-mono)",
          fontSize: "0.6875rem",
          textTransform: "uppercase",
          letterSpacing: "0.08em",
          opacity: 0.6,
        }}
      >
        {t("landing.orPressSlash")}
      </p>
    </div>
  );
}

// ── Sortable block row ───────────────────────────────────────────────────────

function SortableBlockRow({
  block,
  isSelected,
  isEditMode,
  onSelect,
  onChange,
  onDuplicate,
  onRemove,
  onAddAfter,
}: {
  block: Block;
  isSelected: boolean;
  isEditMode: boolean;
  onSelect: () => void;
  onChange: (next: Block) => void;
  onDuplicate: () => void;
  onRemove: () => void;
  onAddAfter: () => void;
}) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id: block.id,
  });
  const def = blockRegistry[block.type];
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const Renderer = def.Renderer as any;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const Editor = def.Editor as any;
  const editorRef = useRef<HTMLDivElement>(null);
  const [showAddAfter, setShowAddAfter] = useState(false);
  const t = useT();

  /** Focus the first focusable element inside the editor */
  const focusEditor = useCallback(() => {
    if (!editorRef.current) return;
    const el = editorRef.current.querySelector<HTMLElement>(
      'input:not([type="hidden"]), textarea, [contenteditable]',
    );
    el?.focus();
  }, []);

  /** Handle click on the editor: select the block and focus the editor element */
  const handleEditorClick = useCallback(() => {
    onSelect();
    // Use RAF to ensure the DOM is ready after state update
    requestAnimationFrame(focusEditor);
  }, [onSelect, focusEditor]);

  // Auto-focus editor when block is selected (for programmatic selection like addParagraph)
  useEffect(() => {
    if (isSelected) {
      requestAnimationFrame(focusEditor);
    }
  }, [isSelected, focusEditor]);

  const showEditor = isEditMode;

  return (
    <div
      id={`block-${block.id}`}
      ref={setNodeRef}
      style={{
        transform: CSS.Transform.toString(transform),
        transition,
        opacity: isDragging ? 0.6 : 1,
        position: "relative",
        padding: "0.125rem 0",
        borderLeft: isSelected ? "2px solid var(--color-accent)" : "2px solid transparent",
        borderBottom: showAddAfter ? "2px solid var(--color-accent)" : "2px solid transparent",
        borderRadius: 0,
      }}
      onMouseEnter={() => setShowAddAfter(true)}
      onMouseLeave={() => setShowAddAfter(false)}
    >
      {/* Block toolbar — visible on hover OR when selected */}
      <div
        className="block-toolbar"
        style={{
          position: "absolute",
          top: "-12px",
          right: "4px",
          display: isSelected || showAddAfter ? "flex" : "none",
          gap: "2px",
          zIndex: 5,
        }}
      >
        <button
          type="button"
          {...attributes}
          {...listeners}
          style={iconBtn}
          title={t("block.drag")}
        >
          <GripVertical size={12} />
        </button>
        <button type="button" onClick={onDuplicate} style={iconBtn} title={t("block.duplicate")}>
          <Copy size={12} />
        </button>
        <button type="button" onClick={onRemove} style={iconBtn} title={t("block.delete")}>
          <Trash2 size={12} />
        </button>
      </div>

      {/* Editor (edit mode) or Renderer (read mode) */}
      {/* Clicking the editor area selects the block for toolbar visibility
          AND focuses the editor element for immediate typing */}
      {showEditor ? (
        <div ref={editorRef} onClick={handleEditorClick}>
          <Editor block={block} onChange={onChange} />
        </div>
      ) : (
        <div onClick={onSelect} style={{ cursor: isEditMode ? "pointer" : "default" }}>
          <Renderer block={block} mode={isEditMode ? "edit" : "read"} />
        </div>
      )}

      {/* Inline add-below button — appears on hover between blocks */}
      {showAddAfter && !isDragging && (
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            onAddAfter();
          }}
          style={{
            position: "absolute",
            bottom: "-11px",
            left: "50%",
            transform: "translateX(-50%)",
            width: 28,
            height: 28,
            borderRadius: "50%",
            background: "var(--color-accent)",
            color: "#fff",
            border: "2px solid var(--color-paper)",
            cursor: "pointer",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            zIndex: 6,
            opacity: 0.9,
            boxShadow: "0 1px 3px rgba(0,0,0,0.2)",
            transition: "opacity 0.15s, transform 0.15s",
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.opacity = "1";
            e.currentTarget.style.transform = "translateX(-50%) scale(1.1)";
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.opacity = "0.9";
            e.currentTarget.style.transform = "translateX(-50%) scale(1)";
          }}
          title={t("block.addBelow")}
        >
          <Plus size={16} strokeWidth={3} />
        </button>
      )}
    </div>
  );
}

const iconBtn: React.CSSProperties = {
  background: "var(--color-paper)",
  border: "1px solid var(--color-rule)",
  color: "var(--color-ink-deep)",
  borderRadius: "4px",
  padding: "4px 6px",
  cursor: "pointer",
  display: "flex",
  alignItems: "center",
};
