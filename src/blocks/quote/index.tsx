import { z } from "zod";
import type { RootContent } from "mdast";
import type { ContainerDirective } from "mdast-util-directive";
import type { BlockDefinition } from "../registry";
import type { QuoteBlock } from "../types";
import { baseFields } from "../factory";
import { AlignButtons } from "../_shared";

export const QuoteSchema = z.object({
  id: z.string(),
  type: z.literal("quote"),
  createdAt: z.string(),
  updatedAt: z.string(),
  text: z.string(),
  attribution: z.string(),
  align: z.enum(["left", "center", "right", "justify"]).optional(),
});

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
    align: "left",
    ...over,
  }),
  Renderer: ({ block }) => {
    const align = block.align ?? "left";
    return (
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
            textAlign: align,
          }}
        >
          {block.text}
        </p>
        {block.attribution && (
          <div
            className="mono-label"
            style={{ color: "var(--color-mute)", marginTop: "0.5rem", textAlign: align }}
          >
            — {block.attribution}
          </div>
        )}
      </blockquote>
    );
  },
  Editor: ({ block, onChange }) => {
    const update = (patch: Partial<QuoteBlock>) =>
      onChange({ ...block, ...patch, updatedAt: new Date().toISOString() });

    return (
      <div style={{ display: "flex", flexDirection: "column", gap: "0.4rem" }}>
        <textarea
          value={block.text}
          onChange={(e) => update({ text: e.target.value })}
          placeholder="Quote"
          rows={3}
          style={{
            ...inp,
            fontFamily: "var(--font-doc-serif)",
            fontStyle: "italic",
            fontSize: "1rem",
            resize: "vertical",
            textAlign: block.align ?? "left",
          }}
        />
        <input
          value={block.attribution}
          onChange={(e) => update({ attribution: e.target.value })}
          placeholder="Attribution (optional)"
          style={{
            ...inp,
            fontFamily: "var(--font-doc-mono)",
            fontSize: "0.75rem",
            textTransform: "uppercase",
            letterSpacing: "0.08em",
            textAlign: block.align ?? "left",
          }}
        />
        <AlignButtons value={block.align} onChange={(a) => update({ align: a })} />
      </div>
    );
  },
  serialize: (block): RootContent[] => {
    const dir: ContainerDirective = {
      type: "containerDirective",
      name: "quote",
      attributes: block.attribution ? { by: block.attribution } : {},
      children: [{ type: "paragraph", children: [{ type: "text", value: block.text }] }],
    };
    return [dir as RootContent];
  },
  deserialize: (node, ctx) => {
    if (node.type !== "containerDirective") return null;
    const d = node as ContainerDirective;
    if (d.name !== "quote") return null;
    const text = d.children
      .filter((c) => c.type === "paragraph")
      .map((p) => (p.children as { value?: string }[]).map((n) => n.value ?? "").join(""))
      .join("\n");
    return {
      ...ctx.newBlockBase("quote"),
      text,
      attribution: d.attributes?.by ?? "",
      align: "left",
    };
  },
};

const inp: React.CSSProperties = {
  border: "var(--rule)",
  padding: "0.4rem 0.5rem",
  borderRadius: "4px",
  color: "var(--color-ink-deepest)",
  background: "var(--color-paper)",
  outline: "none",
};
