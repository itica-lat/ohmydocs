import { create } from "zustand"
import { persist, createJSONStorage } from "zustand/middleware"
import { safeLocalStorage, STORAGE_KEYS } from "@/lib/storage/persist"
import type { Locale } from "@/lib/i18n"

export type ViewMode = "edit" | "read"
export type ColorScheme = "light" | "dark"

interface SettingsState {
  viewMode: ViewMode
  zoom: number
  defaultAuthor: string
  pureMode: boolean
  colorScheme: ColorScheme
  locale: Locale
  setViewMode: (mode: ViewMode) => void
  setZoom: (zoom: number) => void
  setDefaultAuthor: (name: string) => void
  togglePureMode: () => void
  toggleColorScheme: () => void
  setLocale: (locale: Locale) => void
}

export const useSettingsStore = create<SettingsState>()(
  persist(
    (set) => ({
      viewMode: "edit",
      zoom: 1,
      defaultAuthor: "",
      pureMode: false,
      colorScheme: "light",
      locale: "en",
      setViewMode: (viewMode) => set({ viewMode }),
      setZoom: (zoom) => set({ zoom: Math.min(2, Math.max(0.5, zoom)) }),
      setDefaultAuthor: (defaultAuthor) => set({ defaultAuthor }),
      togglePureMode: () => set((s) => ({ pureMode: !s.pureMode })),
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
