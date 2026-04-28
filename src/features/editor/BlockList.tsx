import { useMemo, useEffect, useRef } from "react";
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
import { Copy, GripVertical, Trash2 } from "lucide-react";
import { useDocumentsStore } from "./store";
import { blockRegistry } from "@/blocks/registry";
import type { Block } from "@/blocks/types";
import { duplicateBlock, removeBlock, replaceBlock, withBlocks } from "./helpers";

export function BlockList() {
  const activeId = useDocumentsStore((s) => s.activeId);
  const documents = useDocumentsStore((s) => s.documents);
  const upsert = useDocumentsStore((s) => s.upsertDocument);
  const select = useDocumentsStore((s) => s.selectBlock);
  const selected = useDocumentsStore((s) => s.selectedBlockId);

  const doc = activeId ? documents[activeId] : null;
  const sensors = useSensors(useSensor(PointerSensor, { activationConstraint: { distance: 4 } }));
  const blocks = useMemo(() => (doc?.blocks ?? []) as Block[], [doc?.blocks]);
  const ids = useMemo(() => blocks.map((b) => b.id), [blocks]);

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
        <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem" }}>
          {blocks.map((block) => (
            <SortableBlockRow
              key={block.id}
              block={block}
              isSelected={selected === block.id}
              onSelect={() => select(block.id)}
              onChange={(next) => upsert(withBlocks(doc, replaceBlock(blocks, next)))}
              onDuplicate={() => upsert(withBlocks(doc, duplicateBlock(blocks, block.id)))}
              onRemove={() => {
                upsert(withBlocks(doc, removeBlock(blocks, block.id)));
                if (selected === block.id) select(null);
              }}
            />
          ))}
        </div>
      </SortableContext>
    </DndContext>
  );
}

function SortableBlockRow({
  block,
  isSelected,
  onSelect,
  onChange,
  onDuplicate,
  onRemove,
}: {
  block: Block;
  isSelected: boolean;
  onSelect: () => void;
  onChange: (next: Block) => void;
  onDuplicate: () => void;
  onRemove: () => void;
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

  useEffect(() => {
    if (isSelected && editorRef.current) {
      const el = editorRef.current.querySelector<HTMLElement>(
        'input:not([type="hidden"]), textarea, [contenteditable]',
      );
      el?.focus();
    }
  }, [isSelected]);

  return (
    <div
      ref={setNodeRef}
      style={{
        transform: CSS.Transform.toString(transform),
        transition,
        opacity: isDragging ? 0.6 : 1,
        position: "relative",
        padding: "0.25rem",
        border: isSelected ? "1px dashed var(--color-accent)" : "1px dashed transparent",
        borderRadius: "4px",
      }}
      onClick={onSelect}
    >
      <div
        className="block-toolbar"
        style={{
          position: "absolute",
          top: "-12px",
          right: "-12px",
          display: isSelected ? "flex" : "none",
          gap: "4px",
          zIndex: 5,
        }}
      >
        <button {...attributes} {...listeners} style={iconBtn} title="Drag">
          <GripVertical size={12} />
        </button>
        <button type="button" onClick={onDuplicate} style={iconBtn} title="Duplicate">
          <Copy size={12} />
        </button>
        <button type="button" onClick={onRemove} style={iconBtn} title="Delete">
          <Trash2 size={12} />
        </button>
      </div>
      {isSelected ? (
        <div ref={editorRef}>
          <Editor block={block} onChange={onChange} />
        </div>
      ) : (
        <Renderer block={block} mode="edit" />
      )}
    </div>
  );
}

const iconBtn: React.CSSProperties = {
  background: "var(--color-paper)",
  border: "var(--rule)",
  color: "var(--color-ink-deep)",
  borderRadius: "4px",
  padding: "4px 6px",
  cursor: "pointer",
};
