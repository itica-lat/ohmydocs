import { unified } from "unified"
import remarkParse from "remark-parse"
import remarkGfm from "remark-gfm"
import remarkDirective from "remark-directive"
import remarkStringify from "remark-stringify"
import type { Root, RootContent } from "mdast"
import type { Block, BlockType } from "@/blocks/types"
import { blockRegistry, ensureRoot } from "@/blocks/registry"
import { baseFields } from "@/blocks/factory"

const parser = unified().use(remarkParse).use(remarkGfm).use(remarkDirective)
const serializer = unified()
  .use(remarkStringify, { bullet: "-", listItemIndent: "one", fences: true })
  .use(remarkGfm)
  .use(remarkDirective)

export function blocksToMarkdown(blocks: Block[]): string {
  const children: RootContent[] = []
  for (const block of blocks) {
    const def = blockRegistry[block.type]
    children.push(...def.serialize(block))
  }
  const root = ensureRoot(children)
  return serializer.stringify(root as Root)
}

type BlocksResult = {
  blocks: Block[]
  warnings: string[]
}

export function markdownToBlocks(markdown: string): BlocksResult {
  const tree = parser.parse(markdown) as Root
  const blocks: Block[] = []
  const warnings: string[] = []

  const ctx = {
    newBlockBase: <T extends BlockType>(type: T) => baseFields(type),
  }

  for (const node of tree.children) {
    let matched = false
    for (const def of Object.values(blockRegistry)) {
      if (!def.deserialize) continue
      const out = def.deserialize(node, ctx)
      if (out) {
        blocks.push(out as Block)
        matched = true
        break
      }
    }
    if (!matched) {
      // Degrade unknown to paragraph with a warning badge so nothing is silently lost.
      const fallback = blockRegistry.paragraph.factory({
        text: stringifyNode(node),
      }) as Block
      blocks.push(fallback)
      warnings.push(`Unknown node type "${node.type}" degraded to paragraph.`)
    }
  }

  return { blocks, warnings }
}

function stringifyNode(node: RootContent): string {
  try {
    return serializer.stringify(ensureRoot([node]) as Root).trim()
  } catch {
    return `[unparsable ${node.type}]`
  }
}

/** Deterministic checksum for round-trip verification (dev-only). */
export function roundTripChecksum(blocks: Block[]): string {
  const canonical = JSON.stringify(blocks, (k, v) =>
    k === "createdAt" || k === "updatedAt" || k === "id" ? undefined : v,
  )
  let h = 0
  for (let i = 0; i < canonical.length; i++)
    h = ((h << 5) - h + canonical.charCodeAt(i)) | 0
  return h.toString(16)
}
