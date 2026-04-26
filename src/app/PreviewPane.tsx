import { useDocumentsStore } from "@/features/editor/store"
import { useSettingsStore } from "@/features/settings/store"
import { Landing } from "./Landing"
import { BlockList } from "@/features/editor/BlockList"
import { Toolbar } from "@/features/editor/Toolbar"
import { useEditorShortcuts } from "@/features/editor/shortcuts"
import { blockRegistry } from "@/blocks/registry"
import type { Block } from "@/blocks/types"

export function PreviewPane() {
  const activeId = useDocumentsStore((s) => s.activeId)
  const documents = useDocumentsStore((s) => s.documents)
  const zoom = useSettingsStore((s) => s.zoom)
  const viewMode = useSettingsStore((s) => s.viewMode)
  const doc = activeId ? documents[activeId] : null
  useEditorShortcuts()

  return (
    <main
      className="preview-pane h-full overflow-auto"
      style={{ background: "var(--ui-surface-soft)" }}
    >
      <div className="py-12 px-8 flex flex-col items-center">
        {doc ? (
          <>
            <article
              className="page"
              style={{
                transform: `scale(${zoom})`,
                transformOrigin: "top center",
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
