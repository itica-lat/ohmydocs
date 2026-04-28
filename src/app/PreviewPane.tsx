import { useDocumentsStore } from "@/features/editor/store"
import { useSettingsStore } from "@/features/settings/store"
import { Landing } from "./Landing"
import { BlockList } from "@/features/editor/BlockList"
import { HtmlEditor } from "@/features/editor/HtmlEditor"
import { Toolbar } from "@/features/editor/Toolbar"
import { useEditorShortcuts } from "@/features/editor/shortcuts"
import { blockRegistry } from "@/blocks/registry"
import type { Block } from "@/blocks/types"
import { useEffect, useRef, useState } from "react"

const PAGE_WIDTH = 816
const PANE_PADDING = 64

export function PreviewPane() {
  const activeId = useDocumentsStore((s) => s.activeId)
  const documents = useDocumentsStore((s) => s.documents)
  const zoom = useSettingsStore((s) => s.zoom)
  const viewMode = useSettingsStore((s) => s.viewMode)
  const doc = activeId ? documents[activeId] : null
  useEditorShortcuts()

  const containerRef = useRef<HTMLDivElement>(null)
  const articleRef = useRef<HTMLElement>(null)
  const [fitScale, setFitScale] = useState(1)
  const [articleHeight, setArticleHeight] = useState(1056)

  useEffect(() => {
    const el = containerRef.current
    if (!el) return
    const obs = new ResizeObserver(([entry]) => {
      const available = (entry?.contentRect.width ?? el.clientWidth) - PANE_PADDING
      setFitScale(Math.min(1, available / PAGE_WIDTH))
    })
    obs.observe(el)
    return () => obs.disconnect()
  }, [])

  useEffect(() => {
    const el = articleRef.current
    if (!el) return
    const obs = new ResizeObserver(([entry]) => {
      setArticleHeight(entry?.contentRect.height ?? el.clientHeight)
    })
    obs.observe(el)
    return () => obs.disconnect()
  }, [])

  const effectiveZoom = zoom * fitScale

  if (viewMode === "html") {
    return (
      <div className="preview-pane h-full flex flex-col" style={{ background: "var(--ui-surface-soft)" }}>
        <div className="flex-1 min-h-0">
          <HtmlEditor />
        </div>
        <div className="flex justify-center py-3 border-t" style={{ borderColor: "var(--ui-rule)" }}>
          <Toolbar />
        </div>
      </div>
    )
  }

  return (
    <main
      ref={containerRef}
      className="preview-pane h-full overflow-y-auto"
      style={{ background: "var(--ui-surface-soft)" }}
    >
      <div className="py-12 px-8 flex flex-col items-center" style={{ minHeight: "100%" }}>
        {doc ? (
          <>
            {/*
              Wrapper sized to the visual footprint of the scaled article.
              This gives flex items-center a correctly-sized child to center,
              avoiding the overflow-x clipping issue.
            */}
            <div
              style={{
                width: PAGE_WIDTH * effectiveZoom,
                height: articleHeight * effectiveZoom,
                position: "relative",
                flexShrink: 0,
              }}
            >
              <article
                ref={articleRef}
                className="page"
                style={{
                  position: "absolute",
                  top: 0,
                  left: 0,
                  transform: `scale(${effectiveZoom})`,
                  transformOrigin: "top left",
                }}
              >
                {doc.blocks.length === 0 ? (
                  <EmptyDocument />
                ) : viewMode === "read" ? (
                  <ReadOnlyBlocks blocks={doc.blocks as Block[]} />
                ) : (
                  <BlockList />
                )}
              </article>
            </div>
            <Toolbar />
          </>
        ) : (
          <Landing />
        )}
      </div>
    </main>
  )
}

function EmptyDocument() {
  return (
    <div
      style={{
        textAlign: "center",
        padding: "4rem 0",
        color: "var(--color-mute)",
      }}
    >
      <p className="lead" style={{ marginBottom: "1.5rem" }}>
        Press <strong style={{ color: "var(--color-ink-deep)" }}>/</strong> or
        click <em>Add block</em> in the toolbar.
      </p>
      <p
        style={{
          fontFamily: "var(--font-ui-mono)",
          fontSize: "0.6875rem",
          textTransform: "uppercase",
          letterSpacing: "0.08em",
        }}
      >
        Cover · Section · Paragraph · Callout · Code · List · Divider
      </p>
    </div>
  )
}

function ReadOnlyBlocks({ blocks }: { blocks: Block[] }) {
  return (
    <>
      {blocks.map((block) => {
        const def = blockRegistry[block.type]
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const Renderer = def.Renderer as any
        return <Renderer key={block.id} block={block} mode="read" />
      })}
    </>
  )
}
