import { z } from "zod";
import type { RootContent } from "mdast";
import type { ContainerDirective } from "mdast-util-directive";
import type { BlockDefinition } from "../registry";
import type { SectionBlock } from "../types";
import { baseFields } from "../factory";
import { AlignButtons, nodeToText, textParagraph, withAccent } from "../_shared";

export const SectionSchema = z.object({
  id: z.string(),
  type: z.literal("section"),
  createdAt: z.string(),
  updatedAt: z.string(),
  number: z.string(),
  heading: z.string(),
  lead: z.string(),
  align: z.enum(["left", "center", "right", "justify"]).optional(),
});

type AccentParts = {
  plain: string;
  accent: string;
};

function parseAccent(heading: string): AccentParts {
  const m = heading.match(/^(.*?)\*([^*]+)\*(.*)$/);
  if (!m) return { plain: heading, accent: "" };
  const [, before, word, after] = m;
  return {
    plain: `${before ?? ""}${word ?? ""}${after ?? ""}`,
    accent: word ?? "",
  };
}

export const section: BlockDefinition<"section"> = {
  type: "section",
  label: "Section",
  category: "structural",
  iconName: "Hash",
  schema: SectionSchema,
  factory: (over) => ({
    ...baseFields("section"),
    number: "01",
    heading: "Section *title*",
    lead: "",
    align: "left",
    ...over,
  }),
  Renderer: ({ block }) => {
    const parsed = parseAccent(block.heading);
    const align = block.align ?? "left";
    return (
      <section style={{ margin: "1rem 0 1.5rem", paddingTop: "3rem", position: "relative" }}>
        <span
          aria-hidden
          style={{
            position: "absolute",
            top: "0",
            left: "-1rem",
            fontFamily: "var(--font-doc-serif)",
            fontStyle: "italic",
            fontSize: "6rem",
            color: "var(--color-rule)",
            opacity: 0.6,
            lineHeight: 1,
            pointerEvents: "none",
            userSelect: "none",
          }}
        >
          {block.number}
        </span>
        <h2
          className="display-lg"
          style={{
            color: "var(--color-ink-deepest)",
            margin: 0,
            position: "relative",
            textAlign: align,
          }}
        >
          {withAccent(parsed.plain, parsed.accent)}
        </h2>
        {block.lead && (
          <p className="lead" style={{ marginTop: "1rem", maxWidth: "60ch", textAlign: align }}>
            {block.lead}
          </p>
        )}
      </section>
    );
  },
  Editor: ({ block, onChange }) => {
    const update = (patch: Partial<SectionBlock>) =>
      onChange({ ...block, ...patch, updatedAt: new Date().toISOString() });

    return (
      <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem" }}>
        <div style={{ display: "flex", gap: "0.75rem", alignItems: "baseline" }}>
          <input
            value={block.number}
            onChange={(e) => update({ number: e.target.value })}
            placeholder="01"
            style={{
              width: "4rem",
              border: "none",
              background: "transparent",
              outline: "none",
              fontFamily: "var(--font-doc-mono)",
              fontSize: "0.75rem",
              letterSpacing: "0.08em",
              color: "var(--color-mute)",
            }}
          />
          <input
            value={block.heading}
            onChange={(e) => update({ heading: e.target.value })}
            placeholder="Section *title*"
            style={{
              flex: 1,
              border: "none",
              background: "transparent",
              outline: "none",
              fontFamily: "var(--font-doc-serif)",
              fontStyle: "italic",
              fontSize: "2.5rem",
              color: "var(--color-ink-deepest)",
              textAlign: block.align ?? "left",
            }}
          />
        </div>
        <textarea
          value={block.lead}
          onChange={(e) => update({ lead: e.target.value })}
          placeholder="Lead paragraph (italic)"
          rows={2}
          style={{
            width: "100%",
            border: "none",
            background: "transparent",
            outline: "none",
            resize: "vertical",
            fontFamily: "var(--font-doc-serif)",
            fontStyle: "italic",
            fontSize: "1.125rem",
            color: "var(--color-mute)",
            lineHeight: 1.55,
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
      name: "section",
      attributes: { number: block.number },
      children: [
        {
          type: "heading",
          depth: 2,
          children: [{ type: "text", value: block.heading }],
        },
        ...(block.lead
          ? [
              {
                type: "blockquote" as const,
                children: [textParagraph(block.lead)],
              },
            ]
          : []),
      ],
    };
    return [dir as RootContent];
  },
  deserialize: (node, ctx) => {
    if (node.type !== "containerDirective") return null;
    const d = node as ContainerDirective;
    if (d.name !== "section") return null;
    const heading = d.children.find((c) => c.type === "heading");
    const quote = d.children.find((c) => c.type === "blockquote");
    return {
      ...ctx.newBlockBase("section"),
      number: d.attributes?.number ?? "",
      heading: heading ? nodeToText(heading) : "",
      lead: quote ? nodeToText(quote) : "",
      align: "left",
    };
  },
};
