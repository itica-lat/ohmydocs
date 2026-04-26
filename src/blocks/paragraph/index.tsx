import { z } from "zod"
import type { Paragraph as MdastParagraph, RootContent } from "mdast"
import type { BlockDefinition } from "../registry"
import type { ParagraphBlock } from "../types"
import { baseFields } from "../factory"
import { nodeToText, textParagraph } from "../_shared"

export const ParagraphSchema: z.ZodType<ParagraphBlock> = z.object({
  id: z.string(),
  type: z.literal("paragraph"),
  createdAt: z.string(),
  updatedAt: z.string(),
  text: z.string(),
})

export const paragraph: BlockDefinition<"paragraph"> = {
  type: "paragraph",
  label: "Paragraph",
  category: "content",
  iconName: "Type",
  schema: ParagraphSchema,
  factory: (over) => ({ ...baseFields("paragraph"), text: "", ...over }),
  Renderer: ({ block }) => (
    <p
      style={{
        maxWidth: "65ch",
        lineHeight: 1.65,
        color: "var(--color-ink-deepest)",
        margin: "0 0 1.25rem",
        opacity: 0.9,
      }}
    >
      {block.text}
    </p>
  ),
  Editor: ({ block, onChange }) => (
    <textarea
      value={block.text}
      onChange={(e) =>
        onChange({
          ...block,
          text: e.target.value,
          updatedAt: new Date().toISOString(),
        })
      }
      placeholder="Write a paragraph…"
      rows={Math.max(2, block.text.split("\n").length)}
      style={{
        width: "100%",
        background: "transparent",
        border: "none",
        outline: "none",
        resize: "vertical",
        font: "inherit",
        color: "var(--color-ink-deepest)",
        lineHeight: 1.65,
      }}
    />
  ),
  serialize: (block): RootContent[] => [textParagraph(block.text)],
  deserialize: (node, ctx) => {
    if (node.type !== "paragraph") return null
    return {
      ...ctx.newBlockBase("paragraph"),
      text: nodeToText(node as MdastParagraph),
    }
  },
}
