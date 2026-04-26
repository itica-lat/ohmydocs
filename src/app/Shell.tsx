import { Sidebar } from "./Sidebar"
import { PreviewPane } from "./PreviewPane"
import { RightPanel } from "./RightPanel"
import { useSettingsStore } from "@/features/settings/store"

export function Shell() {
  const pureMode = useSettingsStore((s) => s.pureMode)

  if (pureMode) {
    return (
      <div
        className="app-shell h-full"
        style={{ background: "var(--ui-surface-soft)" }}
      >
        <PreviewPane />
      </div>
    )
  }

  return (
    <div
      className="app-shell grid h-full"
      style={{ gridTemplateColumns: "280px 1fr 340px" }}
    >
      <Sidebar />
      <PreviewPane />
      <RightPanel />
    </div>
  )
}
