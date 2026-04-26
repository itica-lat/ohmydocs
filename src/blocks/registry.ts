import type { ComponentType } from "react"
import type { z } from "zod"
import type { Block, BlockType, BlockOf } from "./types"
import type { Root, RootContent } from "mdast"

import * as all from "./all"

export type RendererProps<T extends BlockType,> = {
  block: BlockOf<T>
  mode: "edit" | "read"
}

export interface BlockDefinition<T extends BlockType> {
  type: T
  label: string
  category: "structural" | "content" | "data" | "media"
  iconName: string
  schema: z.ZodType<BlockOf<T>>
  factory: (overrides?: Partial<BlockOf<T>>) => BlockOf<T>
  Renderer: ComponentType<RendererProps<T>>
  Editor: ComponentType<{
    block: BlockOf<T>
    onChange: (next: BlockOf<T>) => void
  }>
  serialize: (block: BlockOf<T>) => RootContent[]
  deserialize?: (
    node: RootContent,
    ctx: DeserializeContext,
  ) => BlockOf<T> | null
}

export interface DeserializeContext {
  newBlockBase: <T extends BlockType>(type: T) => BaseFields<T>
}

export interface BaseFields<T extends BlockType> {
  id: string
  type: T
  createdAt: string
  updatedAt: string
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const blockRegistry: Record<BlockType, BlockDefinition<any>> = {
  cover: all.cover,
  section: all.section,
  subsection: all.subsection,
  "mono-label": all.monoLabel,
  paragraph: all.paragraph,
  callout: all.callout,
  "code-block": all.codeBlock,
  divider: all.divider,
  list: all.list,
  table: all.table,
  "metadata-grid": all.metadataGrid,
  image: all.image,
  quote: all.quote,
  "glossary-entry": all.glossaryEntry,
  "signature-block": all.signatureBlock,
  "header-bar": all.headerBar,
  "footer-bar": all.footerBar,
}

export function getBlockDef<T extends BlockType>(type: T): BlockDefinition<T> {
  const def = blockRegistry[type] as BlockDefinition<T> | undefined
  if (!def) throw new Error(`Unknown block type: ${type}`)
  return def
}

export function listBlockDefs(): BlockDefinition<BlockType>[] {
  return Object.values(blockRegistry)
}

export function ensureRoot(content: RootContent[]): Root {
  return { type: "root", children: content }
}

export type { Block, BlockType }
