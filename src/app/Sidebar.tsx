import { useState, useRef, useEffect } from "react";
import { FileText, Plus, Trash2, Pencil, ChevronLeft, ChevronRight } from "lucide-react";
import { useDocumentsStore } from "@/features/editor/store";
import { useSettingsStore } from "@/features/settings/store";
import { useT } from "@/lib/i18n";

export function Sidebar() {
  const documents = useDocumentsStore((s) => s.documents);
  const activeId = useDocumentsStore((s) => s.activeId);
  const setActive = useDocumentsStore((s) => s.setActive);
  const create = useDocumentsStore((s) => s.createDocument);
  const sidebarCollapsed = useSettingsStore((s) => s.sidebarCollapsed);
  const toggleSidebarCollapsed = useSettingsStore((s) => s.toggleSidebarCollapsed);
  const t = useT();

  if (sidebarCollapsed) {
    return (
      <aside
        className="sidebar flex flex-col items-center border-r py-4 gap-3"
        style={{
          background: "var(--ui-surface)",
          borderColor: "var(--ui-rule)",
        }}
      >
        <button
          type="button"
          onClick={toggleSidebarCollapsed}
          title={t("sidebar.expand")}
          style={{
            display: "inline-flex",
            alignItems: "center",
            justifyContent: "center",
            width: 28,
            height: 28,
            background: "transparent",
            border: `1px solid var(--ui-rule)`,
            borderRadius: 4,
            color: "var(--ui-ink-mute)",
            cursor: "pointer",
          }}
        >
          <ChevronRight size={14} />
        </button>
      </aside>
    );
  }

  const docs = Object.values(documents).sort((a, b) => b.updatedAt.localeCompare(a.updatedAt));

  return (
    <aside
      className="sidebar flex flex-col border-r"
      style={{ background: "var(--ui-surface)", borderColor: "var(--ui-rule)" }}
    >
      <header className="px-5 pt-5 pb-3 border-b" style={{ borderColor: "var(--ui-rule)" }}>
        <div className="flex items-start justify-between">
          <div>
            <div
              className="text-[0.6875rem] uppercase tracking-[0.12em]"
              style={{
                color: "var(--color-accent)",
                fontFamily: "var(--font-ui-mono)",
              }}
            >
              Eternum
            </div>
            <div
              className="text-[1.5rem] italic leading-tight"
              style={{
                color: "var(--ui-ink)",
                fontFamily: "var(--font-ui-serif)",
              }}
            >
              OhMyDocs!
            </div>
          </div>
          <button
            type="button"
            onClick={toggleSidebarCollapsed}
            title={t("sidebar.collapse")}
            style={{
              display: "inline-flex",
              alignItems: "center",
              justifyContent: "center",
              width: 24,
              height: 24,
              background: "transparent",
              border: "none",
              borderRadius: 4,
              color: "var(--ui-ink-mute)",
              cursor: "pointer",
              marginTop: 4,
              flexShrink: 0,
            }}
          >
            <ChevronLeft size={14} />
          </button>
        </div>
      </header>

      <div className="flex items-center justify-between px-5 pt-4 pb-2">
        <span
          className="text-[0.6875rem] uppercase tracking-[0.08em]"
          style={{
            color: "var(--ui-ink-mute)",
            fontFamily: "var(--font-ui-mono)",
          }}
        >
          {t("sidebar.documents")}
        </span>
        <button
          type="button"
          onClick={() => create()}
          className="inline-flex items-center gap-1 px-2 py-1 rounded text-[0.75rem]"
          style={{
            background: "var(--ui-ink)",
            color: "var(--ui-surface)",
            fontFamily: "var(--font-ui-sans)",
          }}
        >
          <Plus size={12} />
          {t("sidebar.new")}
        </button>
      </div>

      <nav className="flex-1 overflow-y-auto px-2">
        {docs.length === 0 ? (
          <EmptyDocsState />
        ) : (
          <ul className="flex flex-col gap-0.5">
            {docs.map((d) => {
              const isActive = d.id === activeId;
              return (
                <DocRow
                  key={d.id}
                  id={d.id}
                  title={d.title}
                  isActive={isActive}
                  onSelect={() => setActive(d.id)}
                />
              );
            })}
          </ul>
        )}
      </nav>
    </aside>
  );
}

function DocRow({
  id,
  title,
  isActive,
  onSelect,
}: {
  id: string;
  title: string;
  isActive: boolean;
  onSelect: () => void;
}) {
  const rename = useDocumentsStore((s) => s.renameDocument);
  const remove = useDocumentsStore((s) => s.remove);
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState(title);
  const inputRef = useRef<HTMLInputElement>(null);
  const t = useT();

  useEffect(() => {
    if (editing) {
      setDraft(title);
      inputRef.current?.select();
    }
  }, [editing, title]);

  const commitRename = () => {
    const trimmed = draft.trim();
    if (trimmed && trimmed !== title) rename(id, trimmed);
    setEditing(false);
  };

  return (
    <li>
      <div
        className="group w-full flex items-center gap-2 px-3 py-2 rounded"
        style={{
          background: isActive ? "var(--ui-surface-soft)" : "transparent",
          color: "var(--ui-ink)",
          fontFamily: "var(--font-ui-sans)",
        }}
      >
        <FileText size={14} style={{ color: "var(--color-accent)", flexShrink: 0 }} />

        {editing ? (
          <input
            ref={inputRef}
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            onBlur={commitRename}
            onKeyDown={(e) => {
              if (e.key === "Enter") commitRename();
              if (e.key === "Escape") setEditing(false);
            }}
            className="flex-1 min-w-0 text-[0.875rem] bg-transparent outline-none border-b"
            style={{
              borderColor: "var(--color-accent)",
              color: "var(--ui-ink)",
              fontFamily: "var(--font-ui-sans)",
            }}
            autoFocus
          />
        ) : (
          <button
            type="button"
            onClick={onSelect}
            onDoubleClick={() => setEditing(true)}
            className="flex-1 min-w-0 text-left text-[0.875rem] truncate"
            style={{
              fontWeight: isActive ? 500 : 400,
              color: "inherit",
              background: "none",
              border: "none",
              padding: 0,
              cursor: "pointer",
            }}
          >
            {title}
          </button>
        )}

        {!editing && (
          <span
            className="flex items-center gap-0.5 opacity-0 group-hover:opacity-100"
            style={{ flexShrink: 0 }}
          >
            <IconBtn onClick={() => setEditing(true)} title={t("sidebar.rename")}>
              <Pencil size={11} />
            </IconBtn>
            <IconBtn onClick={() => remove(id)} title={t("sidebar.delete")}>
              <Trash2 size={11} />
            </IconBtn>
          </span>
        )}
      </div>
    </li>
  );
}

function IconBtn({
  onClick,
  title,
  children,
}: {
  onClick: () => void;
  title: string;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={(e) => {
        e.stopPropagation();
        onClick();
      }}
      title={title}
      style={{
        display: "inline-flex",
        alignItems: "center",
        justifyContent: "center",
        padding: "3px",
        background: "transparent",
        border: "none",
        borderRadius: "3px",
        color: "var(--ui-ink-mute)",
        cursor: "pointer",
      }}
    >
      {children}
    </button>
  );
}

function EmptyDocsState() {
  const t = useT();
  return (
    <div className="flex flex-col items-center text-center px-6 py-10 gap-2">
      <FileText size={28} style={{ color: "var(--ui-rule)" }} />
      <p
        className="text-[0.875rem]"
        style={{
          color: "var(--ui-ink-mute)",
          fontFamily: "var(--font-ui-sans)",
        }}
      >
        {t("sidebar.empty")}
      </p>
      <p
        className="text-[0.75rem] leading-snug"
        style={{
          color: "var(--ui-ink-mute)",
          fontFamily: "var(--font-ui-sans)",
        }}
      >
        {t("sidebar.emptyHint")}
      </p>
    </div>
  );
}
