import { z } from "zod"
import type { RootContent } from "mdast"
import type { LeafDirective } from "mdast-util-directive"
import type { BlockDefinition } from "../registry"
import type { HeaderBarBlock } from "../types"
import { baseFields } from "../factory"

export const HeaderBarSchema: z.ZodType<HeaderBarBlock> = z.object({
  id: z.string(),
  type: z.literal("header-bar"),
  createdAt: z.string(),
  updatedAt: z.string(),
  left: z.string(),
  right: z.string(),
})

export const headerBar: BlockDefinition<"header-bar"> = {
  type: "header-bar",
  label: "Header bar",
  category: "structural",
  iconName: "PanelTop",
  schema: HeaderBarSchema,
  factory: (over) => ({
    ...baseFields("header-bar"),
    left: "PROJECT · MODULE · TOPIC",
    right: "INTRODUCTION",
    ...over,
  }),
  Renderer: ({ block }) => (
    <div
      className="header-bar"
      style={{
        display: "flex",
        justifyContent: "space-between",
        borderBottom: "var(--rule)",
        paddingBottom: "0.5rem",
        margin: "0 0 1.5rem",
      }}
    >
      <span className="mono-label" style={{ color: "var(--color-mute)" }}>
        {block.left}
      </span>
      <span className="mono-label" style={{ color: "var(--color-ink-deep)" }}>
        {block.right}
      </span>
    </div>
  ),
  Editor: ({ block, onChange }) => (
    <div style={{ display: "flex", gap: "0.5rem" }}>
      <input
        value={block.left}
        onChange={(e) =>
          onChange({
            ...block,
            left: e.target.value.toUpperCase(),
            updatedAt: new Date().toISOString(),
          })
        }
        placeholder="LEFT"
        style={inp}
      />
      <input
        value={block.right}
        onChange={(e) =>
          onChange({
            ...block,
            right: e.target.value.toUpperCase(),
            updatedAt: new Date().toISOString(),
          })
        }
        placeholder="RIGHT"
        style={inp}
      />
    </div>
  ),
  serialize: (block): RootContent[] => [
    {
      type: "leafDirective",
      name: "header",
      attributes: { left: block.left, right: block.right },
      children: [],
    } satisfies LeafDirective as RootContent,
  ],
  deserialize: (node, ctx) => {
    if (node.type !== "leafDirective") return null
    const d = node as LeafDirective
    if (d.name !== "header") return null
    return {
      ...ctx.newBlockBase("header-bar"),
      left: d.attributes?.left ?? "",
      right: d.attributes?.right ?? "",
    }
  },
}

const inp: React.CSSProperties = {
  flex: 1,
  border: "var(--rule)",
  padding: "0.35rem 0.5rem",
  borderRadius: "4px",
  fontFamily: "var(--font-doc-mono)",
  fontSize: "0.75rem",
  letterSpacing: "0.08em",
  textTransform: "uppercase",
  color: "var(--color-ink-deep)",
  background: "var(--color-paper)",
  outline: "none",
}
