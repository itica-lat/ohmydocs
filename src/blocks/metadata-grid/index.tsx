import { z } from "zod"
import type { RootContent } from "mdast"
import type { ContainerDirective } from "mdast-util-directive"
import type { BlockDefinition } from "../registry"
import type { MetadataGridBlock, MetaPair } from "../types"
import { baseFields } from "../factory"

export const MetadataGridSchema: z.ZodType<MetadataGridBlock> = z.object({
  id: z.string(),
  type: z.literal("metadata-grid"),
  createdAt: z.string(),
  updatedAt: z.string(),
  entries: z.array(z.object({ label: z.string(), value: z.string() })),
})

export const metadataGrid: BlockDefinition<"metadata-grid"> = {
  type: "metadata-grid",
  label: "Metadata grid",
  category: "data",
  iconName: "LayoutGrid",
  schema: MetadataGridSchema,
  factory: (over) => ({
    ...baseFields("metadata-grid"),
    entries: [
      { label: "TEAM", value: "Eternum" },
      { label: "DATE", value: new Date().toISOString().slice(0, 10) },
    ],
    ...over,
  }),
  Renderer: ({ block }) => (
    <div
      style={{
        display: "grid",
        gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))",
        gap: "1.25rem 2rem",
        margin: "1.5rem 0",
      }}
    >
      {block.entries.map((e, i) => (
        // eslint-disable-next-line react/no-array-index-key
        <div key={i}>
          <div
            className="mono-label"
            style={{ color: "var(--color-mute)", marginBottom: "0.25rem" }}
          >
            {e.label}
          </div>
          <div style={{ color: "var(--color-ink-deepest)" }}>{e.value}</div>
        </div>
      ))}
    </div>
  ),
  Editor: ({ block, onChange }) => (
    <div style={{ display: "flex", flexDirection: "column", gap: "0.25rem" }}>
      {block.entries.map((e, i) => (
        // eslint-disable-next-line react/no-array-index-key
        <div key={i} style={{ display: "flex", gap: "0.5rem" }}>
          <input
            value={e.label}
            onChange={(ev) => {
              const entries = [...block.entries]
              entries[i] = { ...e, label: ev.target.value.toUpperCase() }
              onChange({
                ...block,
                entries,
                updatedAt: new Date().toISOString(),
              })
            }}
            placeholder="LABEL"
            style={{
              ...inp,
              width: "40%",
              textTransform: "uppercase",
              fontFamily: "var(--font-doc-mono)",
            }}
          />
          <input
            value={e.value}
            onChange={(ev) => {
              const entries = [...block.entries]
              entries[i] = { ...e, value: ev.target.value }
              onChange({
                ...block,
                entries,
                updatedAt: new Date().toISOString(),
              })
            }}
            placeholder="value"
            style={{ ...inp, flex: 1 }}
          />
          <button
            type="button"
            onClick={() =>
              onChange({
                ...block,
                entries: block.entries.filter((_, j) => j !== i),
                updatedAt: new Date().toISOString(),
              })
            }
            style={delBtn}
          >
            ×
          </button>
        </div>
      ))}
      <button
        type="button"
        onClick={() =>
          onChange({
            ...block,
            entries: [...block.entries, { label: "", value: "" }],
            updatedAt: new Date().toISOString(),
          })
        }
        style={addBtn}
      >
        + Entry
      </button>
    </div>
  ),
  serialize: (block): RootContent[] => [
    {
      type: "containerDirective",
      name: "metadata",
      attributes: {},
      children: block.entries.map((e) => ({
        type: "paragraph",
        children: [{ type: "text", value: `${e.label}: ${e.value}` }],
      })),
    } as ContainerDirective as RootContent,
  ],
  deserialize: (node, ctx) => {
    if (node.type !== "containerDirective") return null
    const d = node as ContainerDirective
    if (d.name !== "metadata") return null
    const entries: MetaPair[] = []
    for (const c of d.children) {
      if (c.type !== "paragraph") continue
      const text = (c.children as { value?: string }[])
        .map((n) => n.value ?? "")
        .join("")
      const m = text.match(/^([^:]+):\s*(.*)$/)
      if (m)
        entries.push({ label: (m[1] ?? "").trim(), value: (m[2] ?? "").trim() })
    }
    return { ...ctx.newBlockBase("metadata-grid"), entries }
  },
}

const inp: React.CSSProperties = {
  border: "var(--rule)",
  padding: "0.35rem 0.5rem",
  borderRadius: "4px",
  fontFamily: "var(--font-doc-sans)",
  fontSize: "0.8125rem",
  color: "var(--color-ink-deepest)",
  background: "var(--color-paper)",
  outline: "none",
}
const addBtn: React.CSSProperties = {
  alignSelf: "flex-start",
  fontFamily: "var(--font-ui-mono)",
  fontSize: "0.6875rem",
  textTransform: "uppercase",
  letterSpacing: "0.08em",
  color: "var(--color-accent)",
  background: "transparent",
  border: "none",
  padding: "0.25rem 0",
  cursor: "pointer",
}
const delBtn: React.CSSProperties = {
  border: "var(--rule)",
  background: "transparent",
  color: "var(--color-mute)",
  borderRadius: "4px",
  padding: "0.125rem 0.4rem",
  fontSize: "0.6875rem",
}
