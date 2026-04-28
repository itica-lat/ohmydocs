import { useCallback } from "react";
import { Minus, Plus, ZoomIn, ZoomOut, FileText, Code2, Maximize2, Minimize2 } from "lucide-react";
import { useDocumentsStore } from "./store";
import { useSettingsStore } from "@/features/settings/store";
import { InsertMenu } from "./InsertMenu";
import type { BlockType } from "@/blocks/types";
import { insertBlock, withBlocks } from "./helpers";
import { useT } from "@/lib/i18n";

export function Toolbar() {
  const activeId = useDocumentsStore((s) => s.activeId);
  const documents = useDocumentsStore((s) => s.documents);
  const upsert = useDocumentsStore((s) => s.upsertDocument);
  const zoom = useSettingsStore((s) => s.zoom);
  const setZoom = useSettingsStore((s) => s.setZoom);
  const viewMode = useSettingsStore((s) => s.viewMode);
  const setViewMode = useSettingsStore((s) => s.setViewMode);
  const zenMode = useSettingsStore((s) => s.zenMode);
  const toggleZenMode = useSettingsStore((s) => s.toggleZenMode);
  const t = useT();

  const doc = activeId ? documents[activeId] : null;

  const onInsert = useCallback(
    (type: BlockType) => {
      if (!doc) return;
      upsert(withBlocks(doc, insertBlock(doc.blocks as never, type, doc.blocks.length)));
    },
    [doc, upsert],
  );

  if (!doc) return null;

  const isHtml = viewMode === "html";

  return (
    <div
      className="toolbar"
      style={{
        position: "sticky",
        bottom: "1rem",
        margin: "1rem auto 0",
        display: "flex",
        gap: "0.5rem",
        padding: "0.5rem",
        background: "var(--ui-surface)",
        border: `1px solid var(--ui-rule)`,
        borderRadius: "var(--radius-block)",
        boxShadow: "0 4px 12px rgba(15,40,84,0.08)",
        width: "fit-content",
        alignItems: "center",
      }}
    >
      {!isHtml && <InsertMenu onInsert={onInsert} />}
      {!isHtml && <Divider />}
      {!isHtml && (
        <>
          <Button
            onClick={() => setZoom(zoom - 0.1)}
            icon={<ZoomOut size={14} />}
            title={t("toolbar.zoomOut")}
          />
          <span
            style={{
              fontFamily: "var(--font-ui-mono)",
              fontSize: "0.75rem",
              minWidth: 36,
              textAlign: "center",
              color: "var(--ui-ink)",
            }}
          >
            {Math.round(zoom * 100)}%
          </span>
          <Button
            onClick={() => setZoom(zoom + 0.1)}
            icon={<ZoomIn size={14} />}
            title={t("toolbar.zoomIn")}
          />
          <Divider />
        </>
      )}

      {isHtml ? (
        <Button
          onClick={() => setViewMode("edit")}
          icon={<FileText size={14} />}
          label={t("toolbar.blocks")}
        />
      ) : (
        <>
          <Button
            onClick={() => setViewMode(viewMode === "edit" ? "read" : "edit")}
            icon={viewMode === "edit" ? <FileText size={14} /> : <Plus size={14} />}
            label={viewMode === "edit" ? t("toolbar.read") : t("toolbar.edit")}
          />
          <Button
            onClick={() => setViewMode("html")}
            icon={<Code2 size={14} />}
            label={t("toolbar.html")}
          />
        </>
      )}

      <Divider />
      <Button
        onClick={toggleZenMode}
        icon={zenMode ? <Minimize2 size={14} /> : <Maximize2 size={14} />}
        label={zenMode ? t("toolbar.exitZen") : t("toolbar.zen")}
      />
    </div>
  );
}

function Button({
  onClick,
  icon,
  label,
  title,
}: {
  onClick: () => void;
  icon: React.ReactNode;
  label?: string;
  title?: string;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      title={title ?? label}
      style={{
        display: "inline-flex",
        alignItems: "center",
        gap: "0.35rem",
        padding: "0.4rem 0.65rem",
        background: "transparent",
        border: `1px solid var(--ui-rule)`,
        borderRadius: "4px",
        color: "var(--ui-ink)",
        fontFamily: "var(--font-ui-sans)",
        fontSize: "0.8125rem",
        cursor: "pointer",
      }}
    >
      {icon}
      {label}
    </button>
  );
}

function Divider() {
  return (
    <span style={{ width: 1, height: 18, background: "var(--ui-rule)" }}>
      <Minus size={0} />
    </span>
  );
}
