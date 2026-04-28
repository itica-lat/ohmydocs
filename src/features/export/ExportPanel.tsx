import { useCallback } from "react"
import { FileDown, Download, FileText } from "lucide-react"
import { useDocumentsStore } from "@/features/editor/store"
import { useBrandingStore } from "@/features/branding/store"
import { exportToHtml } from "@/lib/export/html"
import { exportToMarkdown } from "@/lib/export/markdown"
import { saveTextFile } from "@/lib/storage/fs-access"
import { useT } from "@/lib/i18n"

function slug(s: string): string {
  return (
    s
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-|-$/g, "") || "document"
  )
}

export function ExportPanel() {
  const activeId = useDocumentsStore((s) => s.activeId)
  const documents = useDocumentsStore((s) => s.documents)
  const profiles = useBrandingStore((s) => s.profiles)
  const activeBrandingId = useBrandingStore((s) => s.activeId)
  const t = useT()

  const doc = activeId ? documents[activeId] : null
  const branding = doc
    ? (profiles[doc.brandingId] ?? profiles[activeBrandingId])
    : null

  const onExportHtml = useCallback(async () => {
    if (!doc || !branding) return
    const html = exportToHtml({ document: doc, branding })
    await saveTextFile(
      html,
      {
        suggestedName: `${slug(doc.title)}.html`,
        types: [{ description: "HTML", accept: { "text/html": [".html"] } }],
      },
      "text/html",
    )
  }, [doc, branding])

  const onExportMd = useCallback(async () => {
    if (!doc) return
    const md = exportToMarkdown(doc)
    await saveTextFile(
      md,
      {
        suggestedName: `${slug(doc.title)}.md`,
        types: [
          { description: "Markdown", accept: { "text/markdown": [".md"] } },
        ],
      },
      "text/markdown",
    )
  }, [doc])

  const onExportJson = useCallback(async () => {
    if (!doc) return
    await saveTextFile(JSON.stringify(doc, null, 2), {
      suggestedName: `${slug(doc.title)}.ohmydocs.json`,
      types: [
        {
          description: "OhMyDocs document",
          accept: { "application/json": [".json"] },
        },
      ],
    })
  }, [doc])

  if (!doc) {
    return (
      <NoDocHint />
    )
  }

  return (
    <div className="p-4 flex flex-col gap-2">
      <ExportBtn
        onClick={onExportHtml}
        icon={<FileDown size={14} />}
        label={t("export.html")}
        desc=".html with inline styles"
      />
      <ExportBtn
        onClick={onExportMd}
        icon={<FileDown size={14} />}
        label={t("export.md")}
        desc=".md with YAML frontmatter"
      />
      <ExportBtn
        onClick={onExportJson}
        icon={<Download size={14} />}
        label={t("export.json")}
        desc=".ohmydocs.json source"
      />
    </div>
  )
}

function ExportBtn({
  onClick,
  icon,
  label,
  desc,
}: {
  onClick: () => void
  icon: React.ReactNode
  label: string
  desc: string
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      style={{
        display: "flex",
        alignItems: "center",
        gap: "0.75rem",
        padding: "0.6rem 0.75rem",
        background: "var(--ui-surface-soft)",
        border: "1px solid var(--ui-rule)",
        borderRadius: 6,
        cursor: "pointer",
        textAlign: "left",
        width: "100%",
      }}
    >
      <span style={{ color: "var(--color-accent)", flexShrink: 0 }}>{icon}</span>
      <span>
        <span
          style={{
            display: "block",
            fontFamily: "var(--font-ui-sans)",
            fontSize: "0.8125rem",
            color: "var(--ui-ink)",
            fontWeight: 500,
          }}
        >
          {label}
        </span>
        <span
          style={{
            display: "block",
            fontFamily: "var(--font-ui-mono)",
            fontSize: "0.6875rem",
            color: "var(--ui-ink-mute)",
          }}
        >
          {desc}
        </span>
      </span>
    </button>
  )
}

function NoDocHint() {
  const t = useT()
  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        gap: "0.5rem",
        padding: "2rem 1rem",
        textAlign: "center",
        color: "var(--ui-ink-mute)",
      }}
    >
      <FileText size={20} style={{ color: "var(--ui-rule)" }} />
      <p
        style={{
          fontFamily: "var(--font-ui-sans)",
          fontSize: "0.8125rem",
          margin: 0,
        }}
      >
        {t("export.noDoc")}
      </p>
    </div>
  )
}
