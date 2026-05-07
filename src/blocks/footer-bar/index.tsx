import { z } from "zod";
import type { RootContent } from "mdast";
import type { LeafDirective } from "mdast-util-directive";
import type { BlockDefinition } from "../registry";
import type { FooterBarBlock } from "../types";
import { baseFields } from "../factory";
import { useT } from "@/lib/i18n";

export const FooterBarSchema: z.ZodType<FooterBarBlock> = z.object({
  id: z.string(),
  type: z.literal("footer-bar"),
  createdAt: z.string(),
  updatedAt: z.string(),
  left: z.string(),
  right: z.string(),
});

export const footerBar: BlockDefinition<"footer-bar"> = {
  type: "footer-bar",
  label: "Footer bar",
  category: "structural",
  iconName: "PanelBottom",
  schema: FooterBarSchema,
  factory: (over) => ({
    ...baseFields("footer-bar"),
    left: "ETERNUM TEAM",
    right: "INTERNAL",
    ...over,
  }),
  Renderer: ({ block }) => (
    <div
      className="footer-bar"
      style={{
        display: "flex",
        justifyContent: "space-between",
        borderTop: "var(--rule)",
        paddingTop: "0.5rem",
        margin: "3rem 0 0",
      }}
    >
      <span className="mono-meta" style={{ color: "var(--color-mute)" }}>
        {block.left}
      </span>
      <span className="mono-meta" style={{ color: "var(--color-mute)" }}>
        {block.right}
      </span>
    </div>
  ),
  Editor: ({ block, onChange }) => {
    const t = useT();
    return (
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
          placeholder={t("block.footerBar.left")}
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
          placeholder={t("block.footerBar.right")}
          style={inp}
        />
      </div>
    );
  },
  serialize: (block): RootContent[] => [
    {
      type: "leafDirective",
      name: "footer",
      attributes: { left: block.left, right: block.right },
      children: [],
    } satisfies LeafDirective as RootContent,
  ],
  deserialize: (node, ctx) => {
    if (node.type !== "leafDirective") return null;
    const d = node as LeafDirective;
    if (d.name !== "footer") return null;
    return {
      ...ctx.newBlockBase("footer-bar"),
      left: d.attributes?.left ?? "",
      right: d.attributes?.right ?? "",
    };
  },
};

const inp: React.CSSProperties = {
  flex: 1,
  border: "var(--rule)",
  padding: "0.35rem 0.5rem",
  borderRadius: "4px",
  fontFamily: "var(--font-doc-mono)",
  fontSize: "0.6875rem",
  letterSpacing: "0.08em",
  textTransform: "uppercase",
  color: "var(--color-mute)",
  background: "var(--color-paper)",
  outline: "none",
};
