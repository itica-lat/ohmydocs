import { create } from "zustand"
import { persist, createJSONStorage } from "zustand/middleware"
import { safeLocalStorage, STORAGE_KEYS } from "@/lib/storage/persist"
import type { Locale } from "@/lib/i18n"

export type ViewMode = "edit" | "read" | "html"
export type ColorScheme = "light" | "dark"

interface SettingsState {
  // Persisted
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
  // Transient (not persisted): portrait overlay states
  drawerOpen: boolean
  rightSheetOpen: boolean
  openDrawer: () => void
  closeDrawer: () => void
  toggleDrawer: () => void
  openRightSheet: () => void
  closeRightSheet: () => void
  toggleRightSheet: () => void
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
      drawerOpen: false,
      rightSheetOpen: false,
      openDrawer: () => set({ drawerOpen: true }),
      closeDrawer: () => set({ drawerOpen: false }),
      toggleDrawer: () => set((s) => ({ drawerOpen: !s.drawerOpen })),
      openRightSheet: () => set({ rightSheetOpen: true }),
      closeRightSheet: () => set({ rightSheetOpen: false }),
      toggleRightSheet: () => set((s) => ({ rightSheetOpen: !s.rightSheetOpen })),
    }),
    {
      name: STORAGE_KEYS.settings,
      storage: createJSONStorage(() => safeLocalStorage),
      partialize: (state) => ({
        viewMode: state.viewMode,
        zoom: state.zoom,
        defaultAuthor: state.defaultAuthor,
        zenMode: state.zenMode,
        sidebarCollapsed: state.sidebarCollapsed,
        colorScheme: state.colorScheme,
        locale: state.locale,
      }),
    },
  ),
)
