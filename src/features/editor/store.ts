import { create } from "zustand"
import { persist, createJSONStorage } from "zustand/middleware"
import type { OhmyDocument } from "@/types/schemas"
import { DocumentSchema } from "@/types/schemas"
import { safeLocalStorage, STORAGE_KEYS } from "@/lib/storage/persist"
import { newId } from "@/lib/id"
import { ETERNUM_BRANDING_ID } from "@/lib/palette/defaults"

function emptyDocument(id: string, title = "Untitled document"): OhmyDocument {
  const now = new Date().toISOString()
  return {
    id,
    title,
    metadata: {
      author: "",
      team: "",
      institution: "",
      date: now.slice(0, 10),
      customFields: {},
      header: {
        left: "",
        right: "",
        showOnFirstPage: false,
        showPageNumber: true,
      },
      footer: {
        left: "",
        right: "",
        showOnFirstPage: true,
        showPageNumber: true,
      },
    },
    brandingId: ETERNUM_BRANDING_ID,
    templateId: null,
    blocks: [],
    createdAt: now,
    updatedAt: now,
  }
}

interface DocumentsState {
  documents: Record<string, OhmyDocument>
  activeId: string | null
  selectedBlockId: string | null
  createDocument: (title?: string) => string
  setActive: (id: string | null) => void
  selectBlock: (id: string | null) => void
  upsertDocument: (doc: OhmyDocument) => void
  renameDocument: (id: string, title: string) => void
  remove: (id: string) => void
}

export const useDocumentsStore = create<DocumentsState>()(
  persist(
    (set) => ({
      documents: {},
      activeId: null,
      selectedBlockId: null,
      createDocument: (title) => {
        const id = newId("doc")
        const doc = emptyDocument(id, title)
        set((s) => ({ documents: { ...s.documents, [id]: doc }, activeId: id }))
        return id
      },
      setActive: (id) => set({ activeId: id, selectedBlockId: null }),
      selectBlock: (id) => set({ selectedBlockId: id }),
      upsertDocument: (doc) =>
        set((s) => ({ documents: { ...s.documents, [doc.id]: doc } })),
      renameDocument: (id, title) =>
        set((s) => {
          const doc = s.documents[id]
          if (!doc) return s
          return {
            documents: {
              ...s.documents,
              [id]: { ...doc, title, updatedAt: new Date().toISOString() },
            },
          }
        }),
      remove: (id) =>
        set((s) => {
          const next = { ...s.documents }
          delete next[id]
          return {
            documents: next,
            activeId: s.activeId === id ? null : s.activeId,
            selectedBlockId: s.activeId === id ? null : s.selectedBlockId,
          }
        }),
    }),
    {
      name: STORAGE_KEYS.documents,
      storage: createJSONStorage(() => safeLocalStorage),
      partialize: (s) => ({ documents: s.documents, activeId: s.activeId }),
      merge: (persisted, current) => {
        if (!persisted || typeof persisted !== "object") return current
        const p = persisted as Partial<DocumentsState>
        const validated: Record<string, OhmyDocument> = {}
        if (p.documents) {
          for (const [id, raw] of Object.entries(p.documents)) {
            const r = DocumentSchema.safeParse(raw)
            if (r.success) validated[id] = r.data
          }
        }
        return {
          ...current,
          documents: validated,
          activeId: p.activeId && validated[p.activeId] ? p.activeId : null,
        }
      },
    },
  ),
)
