import { create } from "zustand"
import { persist, createJSONStorage } from "zustand/middleware"
import type { Template, OhmyDocument } from "@/types/schemas"
import { TemplateSchema } from "@/types/schemas"
import { safeLocalStorage, STORAGE_KEYS } from "@/lib/storage/persist"
import { newId } from "@/lib/id"
import { DEFAULT_TEMPLATES } from "./defaults"

interface TemplatesState {
  templates: Record<string, Template>
  upsert: (template: Template) => void
  remove: (id: string) => void
  instantiate: (templateId: string) => OhmyDocument | null
}

const seeded: Record<string, Template> = Object.fromEntries(
  DEFAULT_TEMPLATES.map((t) => [t.id, t]),
)

export const useTemplatesStore = create<TemplatesState>()(
  persist(
    (set, get) => ({
      templates: seeded,
      upsert: (template) =>
        set((s) => ({
          templates: { ...s.templates, [template.id]: template },
        })),
      remove: (id) =>
        set((s) => {
          const t = s.templates[id]
          if (t?.readOnly) return s
          const next = { ...s.templates }
          delete next[id]
          return { templates: next }
        }),
      instantiate: (templateId) => {
        const tpl = get().templates[templateId]
        if (!tpl) return null
        const id = newId("doc")
        const now = new Date().toISOString()
        const doc: OhmyDocument = {
          id,
          title: tpl.name,
          metadata: {
            author: tpl.defaultMetadata.author ?? "",
            team: tpl.defaultMetadata.team ?? "",
            institution: tpl.defaultMetadata.institution ?? "",
            date: tpl.defaultMetadata.date ?? now.slice(0, 10),
            customFields: tpl.defaultMetadata.customFields ?? {},
            header: tpl.defaultMetadata.header ?? {
              left: "",
              right: "",
              showOnFirstPage: false,
              showPageNumber: true,
            },
            footer: tpl.defaultMetadata.footer ?? {
              left: "",
              right: "",
              showOnFirstPage: true,
              showPageNumber: true,
            },
          },
          brandingId: tpl.branding.id,
          templateId: tpl.id,
          blocks: tpl.blocks.map((b) => ({ ...b, id: newId("blk") })),
          createdAt: now,
          updatedAt: now,
        }
        return doc
      },
    }),
    {
      name: STORAGE_KEYS.templates,
      storage: createJSONStorage(() => safeLocalStorage),
      merge: (persisted, current) => {
        if (!persisted || typeof persisted !== "object") return current
        const p = persisted as Partial<TemplatesState>
        // Always re-seed read-only defaults; preserve user-created templates.
        const validated: Record<string, Template> = { ...seeded }
        if (p.templates) {
          for (const [id, raw] of Object.entries(p.templates)) {
            if (seeded[id]) continue
            const r = TemplateSchema.safeParse(raw)
            if (r.success) validated[id] = r.data
          }
        }
        return { ...current, templates: validated }
      },
    },
  ),
)
