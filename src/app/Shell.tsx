import { Sidebar } from "./Sidebar"
import { PreviewPane } from "./PreviewPane"
import { RightPanel } from "./RightPanel"
import { UnsupportedScreen } from "./UnsupportedScreen"
import { useSettingsStore } from "@/features/settings/store"
import { useViewport } from "@/hooks/useViewport"

// On tablet the side panels shrink so the preview pane keeps as much room as
// possible instead of scaling the document canvas down aggressively.
function panelWidths(
  viewportWidth: number,
  isTablet: boolean,
  sidebarCollapsed: boolean,
): { sidebar: number; right: number } {
  if (isTablet) {
    const sidebar = sidebarCollapsed ? 48 : Math.min(200, Math.floor(viewportWidth * 0.19))
    // right panel: floor at 220px, cap at 280px
    const right = Math.min(280, Math.max(220, Math.floor(viewportWidth * 0.27)))
    return { sidebar, right }
  }
  return {
    sidebar: sidebarCollapsed ? 48 : 280,
    right: 340,
  }
}

export function Shell() {
  const zenMode = useSettingsStore((s) => s.zenMode)
  const sidebarCollapsed = useSettingsStore((s) => s.sidebarCollapsed)
  const { width: viewportWidth, category } = useViewport()

  if (category === "phone") {
    return <UnsupportedScreen />
  }

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

  const { sidebar, right } = panelWidths(viewportWidth, category === "tablet", sidebarCollapsed)

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
