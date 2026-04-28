import { Menu, SlidersHorizontal } from "lucide-react"
import { Sidebar } from "./Sidebar"
import { PreviewPane } from "./PreviewPane"
import { RightPanel } from "./RightPanel"
import { UnsupportedScreen } from "./UnsupportedScreen"
import { useSettingsStore } from "@/features/settings/store"
import { useViewport } from "@/hooks/useViewport"
import { useT } from "@/lib/i18n"

const TOP_BAR_HEIGHT = 52

function panelWidths(
  isTablet: boolean,
  sidebarCollapsed: boolean,
): { sidebar: number; right: number } {
  if (isTablet) {
    return {
      sidebar: sidebarCollapsed ? 48 : 280,
      right: 280,
    }
  }
  return {
    sidebar: sidebarCollapsed ? 48 : 280,
    right: 340,
  }
}

export function Shell() {
  const zenMode = useSettingsStore((s) => s.zenMode)
  const sidebarCollapsed = useSettingsStore((s) => s.sidebarCollapsed)
  const { category, isPortrait, isSplitView } = useViewport()

  // iPad Split View (< 500px): single-column editor with slide-over sidebar
  if (isSplitView) {
    return (
      <div
        className="app-shell h-full flex flex-col"
        style={{ background: "var(--ui-surface-soft)" }}
      >
        <PortraitTopBar showRightPanel={false} />
        <div className="flex-1 min-h-0">
          <PreviewPane />
        </div>
        <Sidebar />
      </div>
    )
  }

  // Phone (non split-view narrow screens): unsupported
  if (category === "phone") {
    return <UnsupportedScreen />
  }

  // Zen mode: editor only
  if (zenMode) {
    return (
      <div
        className="app-shell h-full"
        style={{ background: "var(--ui-surface-soft)" }}
      >
        <PreviewPane />
      </div>
    )
  }

  // Portrait tablet: overlay layout
  if (category === "tablet" && isPortrait) {
    return (
      <div
        className="app-shell h-full flex flex-col"
        style={{ background: "var(--ui-surface-soft)" }}
      >
        <PortraitTopBar showRightPanel />
        <div className="flex-1 min-h-0">
          <PreviewPane />
        </div>
        <Sidebar />
        <RightPanel />
      </div>
    )
  }

  // Landscape tablet or desktop: 3-panel grid
  const { sidebar, right } = panelWidths(category === "tablet", sidebarCollapsed)
  return (
    <div
      className="app-shell grid h-full"
      style={{ gridTemplateColumns: `${sidebar}px 1fr ${right}px` }}
    >
      <Sidebar />
      <PreviewPane />
      <RightPanel />
    </div>
  )
}

function PortraitTopBar({ showRightPanel }: { showRightPanel: boolean }) {
  const toggleDrawer = useSettingsStore((s) => s.toggleDrawer)
  const toggleRightSheet = useSettingsStore((s) => s.toggleRightSheet)
  const t = useT()

  return (
    <header
      style={{
        height: TOP_BAR_HEIGHT,
        flexShrink: 0,
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        paddingInline: 4,
        paddingTop: "env(safe-area-inset-top)",
        background: "var(--ui-surface)",
        borderBottom: "1px solid var(--ui-rule)",
      }}
    >
      <TopBarBtn onClick={toggleDrawer} aria-label={t("shell.documents")}>
        <Menu size={20} />
      </TopBarBtn>

      <div style={{ textAlign: "center", userSelect: "none" }}>
        <div
          style={{
            fontFamily: "var(--font-ui-mono)",
            fontSize: "0.5625rem",
            textTransform: "uppercase",
            letterSpacing: "0.12em",
            color: "var(--color-accent)",
            lineHeight: 1.3,
          }}
        >
          Eternum
        </div>
        <div
          style={{
            fontFamily: "var(--font-ui-serif)",
            fontSize: "1.125rem",
            fontStyle: "italic",
            color: "var(--ui-ink)",
            lineHeight: 1,
          }}
        >
          OhMyDocs!
        </div>
      </div>

      {showRightPanel ? (
        <TopBarBtn onClick={toggleRightSheet} aria-label={t("shell.properties")}>
          <SlidersHorizontal size={20} />
        </TopBarBtn>
      ) : (
        <div style={{ width: 44, flexShrink: 0 }} />
      )}
    </header>
  )
}

function TopBarBtn({
  onClick,
  children,
  "aria-label": ariaLabel,
}: {
  onClick: () => void
  children: React.ReactNode
  "aria-label": string
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={ariaLabel}
      style={{
        display: "inline-flex",
        alignItems: "center",
        justifyContent: "center",
        width: 44,
        height: 44,
        background: "transparent",
        border: "none",
        borderRadius: 8,
        color: "var(--ui-ink)",
        cursor: "pointer",
        flexShrink: 0,
      }}
    >
      {children}
    </button>
  )
}
