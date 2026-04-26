import { useEffect } from "react"
import { Shell } from "./Shell"
import { useBrandingStore } from "@/features/branding/store"
import { applyBranding } from "@/lib/palette/apply"
import { useSettingsStore } from "@/features/settings/store"

export function App() {
  const profiles = useBrandingStore((s) => s.profiles)
  const activeId = useBrandingStore((s) => s.activeId)
  const active = profiles[activeId]
  const colorScheme = useSettingsStore((s) => s.colorScheme)

  useEffect(() => {
    if (active) applyBranding(active)
  }, [active])

  useEffect(() => {
    document.documentElement.dataset["theme"] =
      colorScheme === "dark" ? "dark" : ""
  }, [colorScheme])

  return <Shell />
}
