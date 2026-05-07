import { z } from "zod";
import type { RootContent } from "mdast";
import type { LeafDirective } from "mdast-util-directive";
import type { BlockDefinition } from "../registry";
import type { MonoLabelBlock } from "../types";
import { baseFields } from "../factory";
import { AlignButtons } from "../_shared";
import { useT } from "@/lib/i18n";

export const MonoLabelSchema = z.object({
  id: z.string(),
  type: z.literal("mono-label"),
  createdAt: z.string(),
  updatedAt: z.string(),
  text: z.string(),
  align: z.enum(["left", "center", "right", "justify"]).optional(),
});

export const monoLabel: BlockDefinition<"mono-label"> = {
  type: "mono-label",
  label: "Mono label",
  category: "structural",
  iconName: "Tag",
  schema: MonoLabelSchema,
  factory: (over) => ({ ...baseFields("mono-label"), text: "LABEL", align: "left", ...over }),
  Renderer: ({ block }) => (
    <div
      className="mono-label"
      style={{
        color: "var(--color-ink-deep)",
        margin: "1.5rem 0 0.5rem",
        textAlign: block.align ?? "left",
      }}
    >
      {block.text}
    </div>
  ),
  Editor: ({ block, onChange }) => {
    const update = (patch: Partial<MonoLabelBlock>) =>
      onChange({ ...block, ...patch, updatedAt: new Date().toISOString() });
    const t = useT();

    return (
      <div style={{ display: "flex", flexDirection: "column", gap: "0.4rem" }}>
        <input
          value={block.text}
          onChange={(e) => update({ text: e.target.value.toUpperCase() })}
          placeholder={t("block.monoLabel.label")}
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
            textAlign: block.align ?? "left",
          }}
        />
        <AlignButtons value={block.align} onChange={(a) => update({ align: a })} />
      </div>
    );
  },
  serialize: (block): RootContent[] => [
    {
      type: "leafDirective",
      name: "monolabel",
      attributes: { text: block.text },
      children: [],
    } satisfies LeafDirective as RootContent,
  ],
  deserialize: (node, ctx) => {
    if (node.type !== "leafDirective") return null;
    const d = node as LeafDirective;
    if (d.name !== "monolabel") return null;
    return { ...ctx.newBlockBase("mono-label"), text: d.attributes?.text ?? "", align: "left" };
  },
};
