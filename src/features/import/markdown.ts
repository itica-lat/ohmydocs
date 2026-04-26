import type { OhmyDocument } from "@/types/schemas"
import { newId } from "@/lib/id"
import { ETERNUM_BRANDING_ID } from "@/lib/palette/defaults"
import { markdownToBlocks } from "@/lib/markdown"

type ImportResult = {
  document: OhmyDocument
  warnings: string[]
}

export function importMarkdown(text: string): ImportResult {
  const { meta, body } = splitFrontmatter(text)
  const { blocks, warnings } = markdownToBlocks(body)
  const now = new Date().toISOString()
  const document: OhmyDocument = {
    id: newId("doc"),
    title: meta.title ?? "Imported document",
    metadata: {
      author: meta.author ?? "",
      team: meta.team ?? "",
      institution: meta.institution ?? "",
      date: meta.date ?? now.slice(0, 10),
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
    blocks: blocks as OhmyDocument["blocks"],
    createdAt: now,
    updatedAt: now,
  }
  return { document, warnings }
}

type FrontmatterResult = {
  meta: Record<string, string>
  body: string
}

function splitFrontmatter(text: string): FrontmatterResult {
  const m = text.match(/^---\n([\s\S]*?)\n---\n?([\s\S]*)$/)
  if (!m) return { meta: {}, body: text }
  const meta: Record<string, string> = {}
  for (const line of (m[1] ?? "").split("\n")) {
    const idx = line.indexOf(":")
    if (idx < 0) continue
    const k = line.slice(0, idx).trim()
    const v = line.slice(idx + 1).trim()
    if (k) meta[k] = v
  }
  return { meta, body: m[2] ?? "" }
}
