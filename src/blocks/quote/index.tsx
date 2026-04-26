import { z } from "zod"
import type { RootContent } from "mdast"
import type { ContainerDirective } from "mdast-util-directive"
import type { BlockDefinition } from "../registry"
import type { QuoteBlock } from "../types"
import { baseFields } from "../factory"

export const QuoteSchema: z.ZodType<QuoteBlock> = z.object({
  id: z.string(),
  type: z.literal("quote"),
  createdAt: z.string(),
  updatedAt: z.string(),
  text: z.string(),
  attribution: z.string(),
})

export const quote: BlockDefinition<"quote"> = {
  type: "quote",
  label: "Quote",
  category: "content",
  iconName: "Quote",
  schema: QuoteSchema,
  factory: (over) => ({
    ...baseFields("quote"),
    text: "",
    attribution: "",
    ...over,
  }),
  Renderer: ({ block }) => (
    <blockquote
      style={{
        borderLeft: "2px solid var(--color-accent)",
        paddingLeft: "1.5rem",
        margin: "1.75rem 0",
      }}
    >
      <p
        style={{
          fontFamily: "var(--font-doc-serif)",
          fontStyle: "italic",
          fontSize: "1.125rem",
          color: "var(--color-ink-deep)",
          margin: 0,
          lineHeight: 1.6,
        }}
      >
        {block.text}
      </p>
      {block.attribution && (
        <div
          className="mono-label"
          style={{ color: "var(--color-mute)", marginTop: "0.5rem" }}
        >
          — {block.attribution}
        </div>
      )}
    </blockquote>
  ),
  Editor: ({ block, onChange }) => (
    <div style={{ display: "flex", flexDirection: "column", gap: "0.4rem" }}>
      <textarea
        value={block.text}
        onChange={(e) =>
          onChange({
            ...block,
            text: e.target.value,
            updatedAt: new Date().toISOString(),
          })
        }
        placeholder="Quote"
        rows={3}
        style={{
          ...inp,
          fontFamily: "var(--font-doc-serif)",
          fontStyle: "italic",
          fontSize: "1rem",
          resize: "vertical",
        }}
      />
      <input
        value={block.attribution}
        onChange={(e) =>
          onChange({
            ...block,
            attribution: e.target.value,
            updatedAt: new Date().toISOString(),
          })
        }
        placeholder="Attribution (optional)"
        style={{
          ...inp,
          fontFamily: "var(--font-doc-mono)",
          fontSize: "0.75rem",
          textTransform: "uppercase",
          letterSpacing: "0.08em",
        }}
      />
    </div>
  ),
  serialize: (block): RootContent[] => {
    const dir: ContainerDirective = {
      type: "containerDirective",
      name: "quote",
      attributes: block.attribution ? { by: block.attribution } : {},
      children: [
        { type: "paragraph", children: [{ type: "text", value: block.text }] },
      ],
    }
    return [dir as RootContent]
  },
  deserialize: (node, ctx) => {
    if (node.type !== "containerDirective") return null
    const d = node as ContainerDirective
    if (d.name !== "quote") return null
    const text = d.children
      .filter((c) => c.type === "paragraph")
      .map((p) =>
        (p.children as { value?: string }[]).map((n) => n.value ?? "").join(""),
      )
      .join("\n")
    return {
      ...ctx.newBlockBase("quote"),
      text,
      attribution: d.attributes?.by ?? "",
    }
  },
}

const inp: React.CSSProperties = {
  border: "var(--rule)",
  padding: "0.4rem 0.5rem",
  borderRadius: "4px",
  color: "var(--color-ink-deepest)",
  background: "var(--color-paper)",
  outline: "none",
}
