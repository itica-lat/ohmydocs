import { useCallback } from "react"
import {
  Download,
  FileDown,
  FileText,
  Minus,
  Plus,
  ZoomIn,
  ZoomOut,
  Moon,
  Sun,
  Maximize2,
  Minimize2,
  Languages,
} from "lucide-react"
import { useDocumentsStore } from "./store"
import { useSettingsStore } from "@/features/settings/store"
import { useBrandingStore } from "@/features/branding/store"
import { InsertMenu } from "./InsertMenu"
import type { BlockType } from "@/blocks/types"
import { insertBlock, withBlocks } from "./helpers"
import { exportToHtml } from "@/lib/export/html"
import { exportToMarkdown } from "@/lib/export/markdown"
import { saveTextFile } from "@/lib/storage/fs-access"
import { useT } from "@/lib/i18n"

export function Toolbar() {
  const activeId = useDocumentsStore((s) => s.activeId)
  const documents = useDocumentsStore((s) => s.documents)
  const upsert = useDocumentsStore((s) => s.upsertDocument)
  const zoom = useSettingsStore((s) => s.zoom)
  const setZoom = useSettingsStore((s) => s.setZoom)
  const viewMode = useSettingsStore((s) => s.viewMode)
  const setViewMode = useSettingsStore((s) => s.setViewMode)
  const pureMode = useSettingsStore((s) => s.pureMode)
  const togglePureMode = useSettingsStore((s) => s.togglePureMode)
  const colorScheme = useSettingsStore((s) => s.colorScheme)
  const toggleColorScheme = useSettingsStore((s) => s.toggleColorScheme)
  const locale = useSettingsStore((s) => s.locale)
  const setLocale = useSettingsStore((s) => s.setLocale)
  const profiles = useBrandingStore((s) => s.profiles)
  const activeBrandingId = useBrandingStore((s) => s.activeId)
  const t = useT()

  const doc = activeId ? documents[activeId] : null
  const branding = doc
    ? (profiles[doc.brandingId] ?? profiles[activeBrandingId])
    : null

  const onInsert = useCallback(
    (type: BlockType) => {
      if (!doc) return
      upsert(
        withBlocks(
          doc,
          insertBlock(doc.blocks as never, type, doc.blocks.length),
        ),
      )
    },
    [doc, upsert],
  )

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

  if (!doc) return null

  return (
    <div
      className="toolbar"
      style={{
        position: "sticky",
        bottom: "1rem",
        margin: "1rem auto 0",
        display: "flex",
        gap: "0.5rem",
        padding: "0.5rem",
        background: "var(--ui-surface)",
        border: `1px solid var(--ui-rule)`,
        borderRadius: "var(--radius-block)",
        boxShadow: "0 4px 12px rgba(15,40,84,0.08)",
        width: "fit-content",
        alignItems: "center",
      }}
    >
      <InsertMenu onInsert={onInsert} />
      <Divider />
      <Button
        onClick={() => setZoom(zoom - 0.1)}
        icon={<ZoomOut size={14} />}
        title={t("toolbar.zoomOut")}
      />
      <span
        style={{
          fontFamily: "var(--font-ui-mono)",
          fontSize: "0.75rem",
          minWidth: 36,
          textAlign: "center",
          color: "var(--ui-ink)",
        }}
      >
        {Math.round(zoom * 100)}%
      </span>
      <Button
        onClick={() => setZoom(zoom + 0.1)}
        icon={<ZoomIn size={14} />}
        title={t("toolbar.zoomIn")}
      />
      <Divider />
      <Button
        onClick={() => setViewMode(viewMode === "edit" ? "read" : "edit")}
        icon={viewMode === "edit" ? <FileText size={14} /> : <Plus size={14} />}
        label={viewMode === "edit" ? t("toolbar.read") : t("toolbar.edit")}
      />
      <Button
        onClick={togglePureMode}
        icon={pureMode ? <Minimize2 size={14} /> : <Maximize2 size={14} />}
        label={pureMode ? t("toolbar.exitPure") : t("toolbar.pure")}
      />
      <Divider />
      <Button
        onClick={onExportHtml}
        icon={<FileDown size={14} />}
        label={t("toolbar.exportHtml")}
      />
      <Button
        onClick={onExportMd}
        icon={<FileDown size={14} />}
        label={t("toolbar.exportMd")}
      />
      <Button
        onClick={onExportJson}
        icon={<Download size={14} />}
        label={t("toolbar.exportJson")}
      />
      <Divider />
      <Button
        onClick={toggleColorScheme}
        icon={colorScheme === "dark" ? <Sun size={14} /> : <Moon size={14} />}
        title={
          colorScheme === "dark"
            ? t("toolbar.lightMode")
            : t("toolbar.darkMode")
        }
      />
      <Button
        onClick={() => setLocale(locale === "en" ? "es" : "en")}
        icon={<Languages size={14} />}
        label={locale === "en" ? "ES" : "EN"}
        title="Toggle language"
      />
    </div>
  )
}

function Button({
  onClick,
  icon,
  label,
  title,
}: {
  onClick: () => void
  icon: React.ReactNode
  label?: string
  title?: string
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      title={title ?? label}
      style={{
        display: "inline-flex",
        alignItems: "center",
        gap: "0.35rem",
        padding: "0.4rem 0.65rem",
        background: "transparent",
        border: `1px solid var(--ui-rule)`,
        borderRadius: "4px",
        color: "var(--ui-ink)",
        fontFamily: "var(--font-ui-sans)",
        fontSize: "0.8125rem",
        cursor: "pointer",
      }}
    >
      {icon}
      {label}
    </button>
  )
}

function Divider() {
  return (
    <span style={{ width: 1, height: 18, background: "var(--ui-rule)" }}>
      <Minus size={0} />
    </span>
  )
}

function slug(s: string): string {
  return (
    s
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-|-$/g, "") || "document"
  )
}
