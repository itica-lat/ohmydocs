import { create } from "zustand";
import type { LinkRef } from "./types";

interface ReferenceState {
  refs: LinkRef[];
  nextNumber: number;
  /**
   * Register a link and return its reference number.
   * Re-registering the same URL returns the existing number (idempotent).
   */
  register: (label: string, url: string) => number;
  /** Reset the store — call this before re-rendering a document. */
  clear: () => void;
}

export const useReferenceStore = create<ReferenceState>()((set, get) => ({
  refs: [],
  nextNumber: 1,
  register: (label, url) => {
    const existing = get().refs.find((r) => r.url === url);
    if (existing !== undefined) return existing.refNumber;
    const n = get().nextNumber;
    const ref: LinkRef = { id: `ref-${n}`, label, url, refNumber: n };
    set((s) => ({ refs: [...s.refs, ref], nextNumber: s.nextNumber + 1 }));
    return n;
  },
  clear: () => set({ refs: [], nextNumber: 1 }),
}));
