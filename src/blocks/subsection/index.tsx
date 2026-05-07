import { z } from "zod";
import type { Heading, RootContent } from "mdast";
import type { BlockDefinition } from "../registry";
import type { SubsectionBlock } from "../types";
import { baseFields } from "../factory";
import { AlignButtons, nodeToText } from "../_shared";
import { useT } from "@/lib/i18n";

export const SubsectionSchema = z.object({
  id: z.string(),
  type: z.literal("subsection"),
  createdAt: z.string(),
  updatedAt: z.string(),
  heading: z.string(),
  align: z.enum(["left", "center", "right", "justify"]).optional(),
});

export const subsection: BlockDefinition<"subsection"> = {
  type: "subsection",
  label: "Subsection",
  category: "structural",
  iconName: "Heading3",
  schema: SubsectionSchema,
  factory: (over) => ({
    ...baseFields("subsection"),
    heading: "Subsection title",
    align: "left",
    ...over,
  }),
  Renderer: ({ block }) => (
    <div
      style={{
        margin: "2rem 0 0.75rem",
        borderBottom: "var(--rule)",
        paddingBottom: "0.5rem",
      }}
    >
      <h3
        className="display-md"
        style={{ color: "var(--color-ink-deep)", margin: 0, textAlign: block.align ?? "left" }}
      >
        {block.heading}
      </h3>
    </div>
  ),
  Editor: ({ block, onChange }) => {
    const update = (patch: Partial<SubsectionBlock>) =>
      onChange({ ...block, ...patch, updatedAt: new Date().toISOString() });
    const t = useT();

    return (
      <div style={{ display: "flex", flexDirection: "column", gap: "0.4rem" }}>
        <input
          value={block.heading}
          onChange={(e) => update({ heading: e.target.value })}
          placeholder={t("block.subsection.title")}
          style={{
            width: "100%",
            border: "none",
            outline: "none",
            background: "transparent",
            fontFamily: "var(--font-doc-serif)",
            fontStyle: "italic",
            fontSize: "1.75rem",
            color: "var(--color-ink-deep)",
            textAlign: block.align ?? "left",
          }}
        />
        <AlignButtons value={block.align} onChange={(a) => update({ align: a })} />
      </div>
    );
  },
  serialize: (block): RootContent[] => [
    {
      type: "heading",
      depth: 3,
      children: [{ type: "text", value: block.heading }],
    },
  ],
  deserialize: (node, ctx) => {
    if (node.type !== "heading") return null;
    const h = node as Heading;
    if (h.depth !== 3) return null;
    return { ...ctx.newBlockBase("subsection"), heading: nodeToText(h), align: "left" };
  },
};
