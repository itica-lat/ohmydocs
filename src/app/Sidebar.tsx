import { useState, useRef, useEffect } from "react"
import { FileText, Plus, Trash2, Pencil, ChevronLeft, ChevronRight, X } from "lucide-react"
import { useDocumentsStore } from "@/features/editor/store"
import { useSettingsStore } from "@/features/settings/store"
import { useViewport } from "@/hooks/useViewport"
import { useT } from "@/lib/i18n"

// Detects preference once on mount — does not need to be reactive.
function prefersReducedMotion(): boolean {
  return typeof window !== "undefined" &&
    window.matchMedia("(prefers-reduced-motion: reduce)").matches
}

export function Sidebar() {
  const { isSplitView, isPortrait, category } = useViewport()

  if (isSplitView || (category === "tablet" && isPortrait)) {
    return <SidebarDrawer />
  }
  return <SidebarInline />
}

// ─── Portrait / Split-View: slide-over drawer ────────────────────────────────

function SidebarDrawer() {
  const drawerOpen = useSettingsStore((s) => s.drawerOpen)
  const closeDrawer = useSettingsStore((s) => s.closeDrawer)
  const documents = useDocumentsStore((s) => s.documents)
  const activeId = useDocumentsStore((s) => s.activeId)
  const setActive = useDocumentsStore((s) => s.setActive)
  const create = useDocumentsStore((s) => s.createDocument)
  const t = useT()
  const noMotion = prefersReducedMotion()

  const docs = Object.values(documents).sort((a, b) =>
    b.updatedAt.localeCompare(a.updatedAt),
  )

  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 50,
        pointerEvents: drawerOpen ? "auto" : "none",
      }}
      aria-hidden={!drawerOpen}
    >
      {/* Backdrop */}
      <div
        onClick={closeDrawer}
        aria-hidden="true"
        style={{
          position: "absolute",
          inset: 0,
          background: "rgba(15, 40, 84, 0.45)",
          backdropFilter: "blur(4px)",
          WebkitBackdropFilter: "blur(4px)",
          opacity: drawerOpen ? 1 : 0,
          transition: noMotion ? "none" : "opacity 200ms ease",
        } as React.CSSProperties}
      />

      {/* Drawer panel */}
      <nav
        role="dialog"
        aria-modal="true"
        aria-label={t("sidebar.documents")}
        style={{
          position: "absolute",
          top: 0,
          left: 0,
          bottom: 0,
          width: "min(85vw, 320px)",
          background: "var(--ui-surface)",
          display: "flex",
          flexDirection: "column",
          transform: drawerOpen ? "translateX(0)" : "translateX(-100%)",
          transition: noMotion ? "none" : "transform 300ms ease-out",
          overflowY: "auto",
          WebkitOverflowScrolling: "touch",
          paddingBottom: "env(safe-area-inset-bottom)",
        } as React.CSSProperties}
      >
        {/* Drawer header */}
        <header
          style={{
            padding: "16px 20px 12px",
            borderBottom: "1px solid var(--ui-rule)",
            display: "flex",
            alignItems: "flex-start",
            justifyContent: "space-between",
            flexShrink: 0,
          }}
        >
          <div>
            <div
              style={{
                fontFamily: "var(--font-ui-mono)",
                fontSize: "0.6875rem",
                textTransform: "uppercase",
                letterSpacing: "0.12em",
                color: "var(--color-accent)",
              }}
            >
              Eternum
            </div>
            <div
              style={{
                fontFamily: "var(--font-ui-serif)",
                fontSize: "1.5rem",
                fontStyle: "italic",
                color: "var(--ui-ink)",
                lineHeight: 1.1,
              }}
            >
              OhMyDocs!
            </div>
          </div>
          <button
            type="button"
            onClick={closeDrawer}
            aria-label={t("sidebar.close")}
            style={{
              display: "inline-flex",
              alignItems: "center",
              justifyContent: "center",
              width: 44,
              height: 44,
              marginTop: -8,
              marginRight: -12,
              background: "transparent",
              border: "none",
              borderRadius: 8,
              color: "var(--ui-ink-mute)",
              cursor: "pointer",
              flexShrink: 0,
            }}
          >
            <X size={20} />
          </button>
        </header>

        {/* Section label + New button */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            padding: "16px 20px 8px",
            flexShrink: 0,
          }}
        >
          <span
            style={{
              fontFamily: "var(--font-ui-mono)",
              fontSize: "0.6875rem",
              textTransform: "uppercase",
              letterSpacing: "0.08em",
              color: "var(--ui-ink-mute)",
            }}
          >
            {t("sidebar.documents")}
          </span>
          <button
            type="button"
            onClick={() => {
              create()
              closeDrawer()
            }}
            aria-label={t("sidebar.new")}
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: 4,
              minHeight: 44,
              padding: "0 14px",
              background: "var(--ui-ink)",
              color: "var(--ui-surface)",
              fontFamily: "var(--font-ui-sans)",
              fontSize: "0.8125rem",
              border: "none",
              borderRadius: 6,
              cursor: "pointer",
            }}
          >
            <Plus size={14} />
            {t("sidebar.new")}
          </button>
        </div>

        {/* Document list */}
        <div
          style={{
            flex: 1,
            overflowY: "auto",
            padding: "0 8px 8px",
            WebkitOverflowScrolling: "touch",
          } as React.CSSProperties}
        >
          {docs.length === 0 ? (
            <EmptyDocsState />
          ) : (
            <ul
              style={{
                listStyle: "none",
                margin: 0,
                padding: 0,
                display: "flex",
                flexDirection: "column",
                gap: 2,
              }}
            >
              {docs.map((d) => (
                <DocRow
                  key={d.id}
                  id={d.id}
                  title={d.title}
                  isActive={d.id === activeId}
                  onSelect={() => {
                    setActive(d.id)
                    closeDrawer()
                  }}
                  touchMode
                />
              ))}
            </ul>
          )}
        </div>
      </nav>
    </div>
  )
}

// ─── Landscape / Desktop: inline aside ───────────────────────────────────────

function SidebarInline() {
  const documents = useDocumentsStore((s) => s.documents)
  const activeId = useDocumentsStore((s) => s.activeId)
  const setActive = useDocumentsStore((s) => s.setActive)
  const create = useDocumentsStore((s) => s.createDocument)
  const sidebarCollapsed = useSettingsStore((s) => s.sidebarCollapsed)
  const toggleSidebarCollapsed = useSettingsStore((s) => s.toggleSidebarCollapsed)
  const { category } = useViewport()
  const isTablet = category === "tablet"
  const t = useT()

  if (sidebarCollapsed) {
    return (
      <aside
        className="sidebar flex flex-col items-center border-r py-4 gap-3"
        style={{ background: "var(--ui-surface)", borderColor: "var(--ui-rule)" }}
      >
        <button
          type="button"
          onClick={toggleSidebarCollapsed}
          aria-label={t("sidebar.expand")}
          title={t("sidebar.expand")}
          style={{
            display: "inline-flex",
            alignItems: "center",
            justifyContent: "center",
            width: isTablet ? 44 : 28,
            height: isTablet ? 44 : 28,
            background: "transparent",
            border: `1px solid var(--ui-rule)`,
            borderRadius: 4,
            color: "var(--ui-ink-mute)",
            cursor: "pointer",
          }}
        >
          <ChevronRight size={isTablet ? 18 : 14} />
        </button>
      </aside>
    )
  }

  const docs = Object.values(documents).sort((a, b) =>
    b.updatedAt.localeCompare(a.updatedAt),
  )

  return (
    <aside
      className="sidebar flex flex-col border-r"
      style={{ background: "var(--ui-surface)", borderColor: "var(--ui-rule)" }}
    >
      <header
        className="px-5 pt-5 pb-3 border-b"
        style={{ borderColor: "var(--ui-rule)" }}
      >
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
              style={{ color: "var(--ui-ink)", fontFamily: "var(--font-ui-serif)" }}
            >
              OhMyDocs!
            </div>
          </div>
          <button
            type="button"
            onClick={toggleSidebarCollapsed}
            aria-label={t("sidebar.collapse")}
            title={t("sidebar.collapse")}
            style={{
              display: "inline-flex",
              alignItems: "center",
              justifyContent: "center",
              width: isTablet ? 44 : 24,
              height: isTablet ? 44 : 24,
              background: "transparent",
              border: "none",
              borderRadius: 4,
              color: "var(--ui-ink-mute)",
              cursor: "pointer",
              marginTop: isTablet ? -8 : 4,
              marginRight: isTablet ? -12 : 0,
              flexShrink: 0,
            }}
          >
            <ChevronLeft size={isTablet ? 18 : 14} />
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
          aria-label={t("sidebar.new")}
          className="inline-flex items-center gap-1 rounded text-[0.75rem]"
          style={{
            minHeight: isTablet ? 44 : undefined,
            padding: isTablet ? "0 12px" : "4px 8px",
            background: "var(--ui-ink)",
            color: "var(--ui-surface)",
            fontFamily: "var(--font-ui-sans)",
            border: "none",
            cursor: "pointer",
            borderRadius: 6,
          }}
        >
          <Plus size={12} />
          {t("sidebar.new")}
        </button>
      </div>

      <nav
        className="flex-1 overflow-y-auto px-2"
        style={{ WebkitOverflowScrolling: "touch" } as React.CSSProperties}
      >
        {docs.length === 0 ? (
          <EmptyDocsState />
        ) : (
          <ul className="flex flex-col gap-0.5">
            {docs.map((d) => {
              const isActive = d.id === activeId
              return (
                <DocRow
                  key={d.id}
                  id={d.id}
                  title={d.title}
                  isActive={isActive}
                  onSelect={() => setActive(d.id)}
                  touchMode={isTablet}
                />
              )
            })}
          </ul>
        )}
      </nav>
    </aside>
  )
}

// ─── Shared sub-components ────────────────────────────────────────────────────

function DocRow({
  id,
  title,
  isActive,
  onSelect,
  touchMode = false,
}: {
  id: string
  title: string
  isActive: boolean
  onSelect: () => void
  touchMode?: boolean
}) {
  const rename = useDocumentsStore((s) => s.renameDocument)
  const remove = useDocumentsStore((s) => s.remove)
  const [editing, setEditing] = useState(false)
  const [draft, setDraft] = useState(title)
  const inputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    if (editing) {
      setDraft(title)
      inputRef.current?.select()
    }
  }, [editing, title])

  const commitRename = () => {
    const trimmed = draft.trim()
    if (trimmed && trimmed !== title) rename(id, trimmed)
    setEditing(false)
  }

  const rowMinHeight = touchMode ? 48 : undefined

  return (
    <li>
      <div
        className="group w-full flex items-center gap-2 px-3 rounded"
        style={{
          minHeight: rowMinHeight,
          padding: touchMode ? "0 12px" : "8px 12px",
          background: isActive ? "var(--ui-surface-soft)" : "transparent",
          color: "var(--ui-ink)",
          fontFamily: "var(--font-ui-sans)",
          borderLeft: isActive ? "3px solid var(--color-accent)" : "3px solid transparent",
        }}
      >
        <FileText
          size={touchMode ? 16 : 14}
          style={{ color: "var(--color-accent)", flexShrink: 0 }}
        />

        {editing ? (
          <input
            ref={inputRef}
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            onBlur={commitRename}
            onKeyDown={(e) => {
              if (e.key === "Enter") commitRename()
              if (e.key === "Escape") setEditing(false)
            }}
            className="flex-1 min-w-0 bg-transparent outline-none border-b"
            style={{
              fontSize: touchMode ? "0.9375rem" : "0.875rem",
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
            className="flex-1 min-w-0 text-left truncate"
            style={{
              fontSize: touchMode ? "0.9375rem" : "0.875rem",
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
            className={
              touchMode
                ? "flex items-center gap-0.5"
                : "flex items-center gap-0.5 opacity-0 group-hover:opacity-100"
            }
            style={{ flexShrink: 0 }}
          >
            <DocIconBtn
              onClick={() => setEditing(true)}
              aria-label="Rename"
              touchMode={touchMode}
            >
              <Pencil size={touchMode ? 14 : 11} />
            </DocIconBtn>
            <DocIconBtn
              onClick={() => remove(id)}
              aria-label="Delete"
              touchMode={touchMode}
            >
              <Trash2 size={touchMode ? 14 : 11} />
            </DocIconBtn>
          </span>
        )}
      </div>
    </li>
  )
}

function DocIconBtn({
  onClick,
  "aria-label": ariaLabel,
  touchMode = false,
  children,
}: {
  onClick: () => void
  "aria-label": string
  touchMode?: boolean
  children: React.ReactNode
}) {
  return (
    <button
      type="button"
      onClick={(e) => {
        e.stopPropagation()
        onClick()
      }}
      aria-label={ariaLabel}
      style={{
        display: "inline-flex",
        alignItems: "center",
        justifyContent: "center",
        width: touchMode ? 36 : undefined,
        height: touchMode ? 36 : undefined,
        padding: touchMode ? 0 : "3px",
        background: "transparent",
        border: "none",
        borderRadius: touchMode ? 6 : "3px",
        color: "var(--ui-ink-mute)",
        cursor: "pointer",
      }}
    >
      {children}
    </button>
  )
}

function EmptyDocsState() {
  const t = useT()
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
  )
}
