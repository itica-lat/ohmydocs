import { create } from "zustand"
import { persist, createJSONStorage } from "zustand/middleware"
import { safeLocalStorage, STORAGE_KEYS } from "@/lib/storage/persist"
import type { Locale } from "@/lib/i18n"

export type ViewMode = "edit" | "read" | "html"
export type ColorScheme = "light" | "dark"

interface SettingsState {
  viewMode: ViewMode
  zoom: number
  defaultAuthor: string
  zenMode: boolean
  sidebarCollapsed: boolean
  colorScheme: ColorScheme
  locale: Locale
  setViewMode: (mode: ViewMode) => void
  setZoom: (zoom: number) => void
  setDefaultAuthor: (name: string) => void
  toggleZenMode: () => void
  toggleSidebarCollapsed: () => void
  toggleColorScheme: () => void
  setLocale: (locale: Locale) => void
}

export const useSettingsStore = create<SettingsState>()(
  persist(
    (set) => ({
      viewMode: "edit",
      zoom: 1,
      defaultAuthor: "",
      zenMode: false,
      sidebarCollapsed: false,
      colorScheme: "light",
      locale: "en",
      setViewMode: (viewMode) => set({ viewMode }),
      setZoom: (zoom) => set({ zoom: Math.min(2, Math.max(0.5, zoom)) }),
      setDefaultAuthor: (defaultAuthor) => set({ defaultAuthor }),
      toggleZenMode: () => set((s) => ({ zenMode: !s.zenMode })),
      toggleSidebarCollapsed: () => set((s) => ({ sidebarCollapsed: !s.sidebarCollapsed })),
      toggleColorScheme: () =>
        set((s) => ({
          colorScheme: s.colorScheme === "light" ? "dark" : "light",
        })),
      setLocale: (locale) => set({ locale }),
    }),
    {
      name: STORAGE_KEYS.settings,
      storage: createJSONStorage(() => safeLocalStorage),
    },
  ),
)
