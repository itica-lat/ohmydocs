import { z } from "zod"
import type { RootContent } from "mdast"
import type { LeafDirective } from "mdast-util-directive"
import type { BlockDefinition } from "../registry"
import type { MonoLabelBlock } from "../types"
import { baseFields } from "../factory"

export const MonoLabelSchema: z.ZodType<MonoLabelBlock> = z.object({
  id: z.string(),
  type: z.literal("mono-label"),
  createdAt: z.string(),
  updatedAt: z.string(),
  text: z.string(),
})

export const monoLabel: BlockDefinition<"mono-label"> = {
  type: "mono-label",
  label: "Mono label",
  category: "structural",
  iconName: "Tag",
  schema: MonoLabelSchema,
  factory: (over) => ({ ...baseFields("mono-label"), text: "LABEL", ...over }),
  Renderer: ({ block }) => (
    <div
      className="mono-label"
      style={{ color: "var(--color-ink-deep)", margin: "1.5rem 0 0.5rem" }}
    >
      {block.text}
    </div>
  ),
  Editor: ({ block, onChange }) => (
    <input
      value={block.text}
      onChange={(e) =>
        onChange({
          ...block,
          text: e.target.value.toUpperCase(),
          updatedAt: new Date().toISOString(),
        })
      }
      placeholder="LABEL"
      style={{
        width: "100%",
        border: "none",
        outline: "none",
        background: "transparent",
        fontFamily: "var(--font-doc-mono)",
        fontSize: "0.75rem",
        letterSpacing: "0.08em",
        textTransform: "uppercase",
        color: "var(--color-ink-deep)",
      }}
    />
  ),
  serialize: (block): RootContent[] => [
    {
      type: "leafDirective",
      name: "monolabel",
      attributes: { text: block.text },
      children: [],
    } satisfies LeafDirective as RootContent,
  ],
  deserialize: (node, ctx) => {
    if (node.type !== "leafDirective") return null
    const d = node as LeafDirective
    if (d.name !== "monolabel") return null
    return { ...ctx.newBlockBase("mono-label"), text: d.attributes?.text ?? "" }
  },
}
