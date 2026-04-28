import type { StateStorage } from "zustand/middleware";

/**
 * Zustand storage adapter that wraps localStorage and surfaces quota errors
 * to the rest of the app. Surface quota events via window CustomEvent so
 * UI can prompt the user to export and clear.
 */
export const safeLocalStorage: StateStorage = {
  getItem: (name) => {
    try {
      return globalThis.localStorage.getItem(name);
    } catch {
      return null;
    }
  },
  setItem: (name, value) => {
    try {
      globalThis.localStorage.setItem(name, value);
    } catch (err) {
      if (err instanceof DOMException && err.name === "QuotaExceededError") {
        window.dispatchEvent(new CustomEvent("ohmydocs:quota-exceeded", { detail: { name } }));
      }
      throw err;
    }
  },
  removeItem: (name) => {
    try {
      globalThis.localStorage.removeItem(name);
    } catch {
      /* ignore */
    }
  },
};

export const STORAGE_KEYS = {
  documents: "ohmydocs:documents",
  templates: "ohmydocs:templates",
  branding: "ohmydocs:branding",
  settings: "ohmydocs:settings",
} as const;
