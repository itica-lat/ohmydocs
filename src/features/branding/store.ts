import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import type { BrandingProfile } from "@/types/schemas";
import { BrandingProfileSchema } from "@/types/schemas";
import { safeLocalStorage, STORAGE_KEYS } from "@/lib/storage/persist";
import { ETERNUM_BRANDING, ETERNUM_BRANDING_ID } from "@/lib/palette/defaults";

interface BrandingState {
  profiles: Record<string, BrandingProfile>;
  activeId: string;
  setActive: (id: string) => void;
  upsert: (profile: BrandingProfile) => void;
  remove: (id: string) => void;
}

export const useBrandingStore = create<BrandingState>()(
  persist(
    (set) => ({
      profiles: { [ETERNUM_BRANDING_ID]: ETERNUM_BRANDING },
      activeId: ETERNUM_BRANDING_ID,
      setActive: (id) => set({ activeId: id }),
      upsert: (profile) => set((s) => ({ profiles: { ...s.profiles, [profile.id]: profile } })),
      remove: (id) =>
        set((s) => {
          if (id === ETERNUM_BRANDING_ID) return s;
          const next = { ...s.profiles };
          delete next[id];
          return {
            profiles: next,
            activeId: s.activeId === id ? ETERNUM_BRANDING_ID : s.activeId,
          };
        }),
    }),
    {
      name: STORAGE_KEYS.branding,
      storage: createJSONStorage(() => safeLocalStorage),
      partialize: (s) => ({ profiles: s.profiles, activeId: s.activeId }),
      merge: (persisted, current) => {
        if (!persisted || typeof persisted !== "object") return current;
        const p = persisted as Partial<BrandingState>;
        const validated: Record<string, BrandingProfile> = {
          [ETERNUM_BRANDING_ID]: ETERNUM_BRANDING,
        };
        if (p.profiles) {
          for (const [id, raw] of Object.entries(p.profiles)) {
            const r = BrandingProfileSchema.safeParse(raw);
            if (r.success) validated[id] = r.data;
          }
        }
        return {
          ...current,
          profiles: validated,
          activeId: p.activeId && validated[p.activeId] ? p.activeId : ETERNUM_BRANDING_ID,
        };
      },
    },
  ),
);
