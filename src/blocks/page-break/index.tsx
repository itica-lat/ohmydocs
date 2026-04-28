import { z } from "zod";
import type { RootContent } from "mdast";
import type { LeafDirective } from "mdast-util-directive";
import type { BlockDefinition } from "../registry";
import type { PageBreakBlock } from "../types";
import { baseFields } from "../factory";

export const PageBreakSchema: z.ZodType<PageBreakBlock> = z.object({
  id: z.string(),
  type: z.literal("page-break"),
  createdAt: z.string(),
  updatedAt: z.string(),
});

const barStyle: React.CSSProperties = {
  flex: 1,
  borderTop: "2px dashed var(--color-rule)",
};

const labelStyle: React.CSSProperties = {
  fontFamily: "var(--font-ui-mono)",
  fontSize: "0.625rem",
  textTransform: "uppercase",
  letterSpacing: "0.1em",
  color: "var(--color-mute)",
  userSelect: "none",
};

const wrapperStyle: React.CSSProperties = {
  display: "flex",
  alignItems: "center",
  gap: "0.75rem",
  padding: "0.75rem 0",
  pageBreakAfter: "always",
};

export const pageBreak: BlockDefinition<"page-break"> = {
  type: "page-break",
  label: "Page Break",
  category: "structural",
  iconName: "Scissors",
  schema: PageBreakSchema,
  factory: (over) => ({ ...baseFields("page-break"), ...over }),
  Renderer: ({ mode }) => {
    if (mode === "read") {
      return <div className="page-break-block" style={{ pageBreakAfter: "always" }} />;
    }
    return (
      <div className="page-break-block" style={wrapperStyle}>
        <div style={barStyle} />
        <span style={labelStyle}>Page Break</span>
        <div style={barStyle} />
      </div>
    );
  },
  Editor: () => (
    <div style={wrapperStyle}>
      <div style={barStyle} />
      <span style={labelStyle}>Page Break</span>
      <div style={barStyle} />
    </div>
  ),
  serialize: (): RootContent[] => {
    const dir: LeafDirective = {
      type: "leafDirective",
      name: "page-break",
      attributes: {},
      children: [],
    };
    return [dir as unknown as RootContent];
  },
  deserialize: (node, ctx) => {
    if (node.type !== "leafDirective") return null;
    const d = node as LeafDirective;
    if (d.name !== "page-break") return null;
    return { ...ctx.newBlockBase("page-break") };
  },
};
