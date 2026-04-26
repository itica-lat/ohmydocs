import { DocumentSchema, type OhmyDocument } from "@/types/schemas"

/**
 * Read an OhMyDocs-generated HTML file by extracting the embedded JSON sidecar.
 * For unknown HTML, return null and let callers fall back to markdown import or
 * surface a "best-effort heuristic" warning to the user.
 */
export function importHtml(html: string): OhmyDocument | null {
  const match = html.match(
    /<script[^>]*id=["']ohmydocs-source["'][^>]*>([\s\S]*?)<\/script>/i,
  )
  if (!match) return null
  const json = (match[1] ?? "").replace(/\\u003c/g, "<")
  try {
    const parsed = JSON.parse(json)
    const result = DocumentSchema.safeParse(parsed)
    return result.success ? result.data : null
  } catch {
    return null
  }
}

export function isOhmyDocsGenerated(html: string): boolean {
  return /name=["']generator["']\s+content=["']OhMyDocs/i.test(html)
}
