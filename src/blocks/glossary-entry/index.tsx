import { z } from "zod"
import type { RootContent } from "mdast"
import type { ContainerDirective } from "mdast-util-directive"
import type { BlockDefinition } from "../registry"
import type { GlossaryEntryBlock, GlossaryEntry } from "../types"
import { baseFields } from "../factory"

const Entry = z.object({
  term: z.string(),
  expansion: z.string(),
  context: z.string(),
})

export const GlossarySchema: z.ZodType<GlossaryEntryBlock> = z.object({
  id: z.string(),
  type: z.literal("glossary-entry"),
  createdAt: z.string(),
  updatedAt: z.string(),
  entries: z.array(Entry),
})

export const glossaryEntry: BlockDefinition<"glossary-entry"> = {
  type: "glossary-entry",
  label: "Glossary",
  category: "data",
  iconName: "BookA",
  schema: GlossarySchema,
  factory: (over) => ({
    ...baseFields("glossary-entry"),
    entries: [{ term: "TERM", expansion: "Expansion", context: "Context" }],
    ...over,
  }),
  Renderer: ({ block }) => (
    <dl style={{ margin: "1.5rem 0" }}>
      {block.entries.map((e, i) => (
        // eslint-disable-next-line react/no-array-index-key
        <div
          key={i}
          style={{
            display: "grid",
            gridTemplateColumns: "120px 1fr 1.5fr",
            gap: "1rem",
            padding: "0.75rem 0",
            borderTop: i === 0 ? "var(--rule)" : "none",
            borderBottom: "var(--rule)",
          }}
        >
          <dt className="mono-label" style={{ color: "var(--color-ink-deep)" }}>
            {e.term}
          </dt>
          <dd style={{ margin: 0, color: "var(--color-ink-deepest)" }}>
            {e.expansion}
          </dd>
          <dd style={{ margin: 0, color: "var(--color-mute)" }}>{e.context}</dd>
        </div>
      ))}
    </dl>
  ),
  Editor: ({ block, onChange }) => (
    <div style={{ display: "flex", flexDirection: "column", gap: "0.25rem" }}>
      {block.entries.map((e, i) => (
        // eslint-disable-next-line react/no-array-index-key
        <div
          key={i}
          style={{
            display: "grid",
            gridTemplateColumns: "120px 1fr 1.5fr auto",
            gap: "0.4rem",
          }}
        >
          <input
            value={e.term}
            onChange={(ev) => {
              const entries = [...block.entries]
              entries[i] = { ...e, term: ev.target.value.toUpperCase() }
              onChange({
                ...block,
                entries,
                updatedAt: new Date().toISOString(),
              })
            }}
            placeholder="TERM"
            style={{
              ...inp,
              fontFamily: "var(--font-doc-mono)",
              textTransform: "uppercase",
            }}
          />
          <input
            value={e.expansion}
            onChange={(ev) => {
              const entries = [...block.entries]
              entries[i] = { ...e, expansion: ev.target.value }
              onChange({
                ...block,
                entries,
                updatedAt: new Date().toISOString(),
              })
            }}
            placeholder="Expansion"
            style={inp}
          />
          <input
            value={e.context}
            onChange={(ev) => {
              const entries = [...block.entries]
              entries[i] = { ...e, context: ev.target.value }
              onChange({
                ...block,
                entries,
                updatedAt: new Date().toISOString(),
              })
            }}
            placeholder="Context"
            style={inp}
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
            entries: [
              ...block.entries,
              { term: "", expansion: "", context: "" },
            ],
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
      name: "glossary",
      attributes: {},
      children: block.entries.map((e) => ({
        type: "paragraph",
        children: [
          { type: "text", value: `${e.term} | ${e.expansion} | ${e.context}` },
        ],
      })),
    } as ContainerDirective as RootContent,
  ],
  deserialize: (node, ctx) => {
    if (node.type !== "containerDirective") return null
    const d = node as ContainerDirective
    if (d.name !== "glossary") return null
    const entries: GlossaryEntry[] = []
    for (const c of d.children) {
      if (c.type !== "paragraph") continue
      const text = (c.children as { value?: string }[])
        .map((n) => n.value ?? "")
        .join("")
      const parts = text.split("|").map((p) => p.trim())
      entries.push({
        term: parts[0] ?? "",
        expansion: parts[1] ?? "",
        context: parts[2] ?? "",
      })
    }
    return { ...ctx.newBlockBase("glossary-entry"), entries }
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
