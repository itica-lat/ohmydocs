import { z } from "zod";
import type { RootContent } from "mdast";
import type { LeafDirective } from "mdast-util-directive";
import type { BlockDefinition } from "../registry";
import type { SpacerBlock, SpacerSize } from "../types";
import type { CSSProperties } from "react";
import { baseFields } from "../factory";

const SIZES: Record<SpacerSize, string> = {
  xs: "1rem",
  sm: "2rem",
  md: "4rem",
  lg: "6rem",
  xl: "10rem",
};

const SIZE_LABELS: Record<SpacerSize, string> = {
  xs: "XS",
  sm: "S",
  md: "M",
  lg: "L",
  xl: "XL",
};

export const SpacerSchema: z.ZodType<SpacerBlock> = z.object({
  id: z.string(),
  type: z.literal("spacer"),
  createdAt: z.string(),
  updatedAt: z.string(),
  size: z.enum(["xs", "sm", "md", "lg", "xl"]),
});

const editorStyle: CSSProperties = {
  display: "flex",
  alignItems: "center",
  gap: "0.5rem",
  padding: "0.25rem 0",
};

const labelStyle: CSSProperties = {
  fontFamily: "var(--font-ui-mono)",
  fontSize: "0.625rem",
  textTransform: "uppercase",
  letterSpacing: "0.1em",
  color: "var(--color-mute)",
  userSelect: "none",
};

const lineStyle: CSSProperties = {
  flex: 1,
  borderTop: "1px dashed var(--color-rule)",
  opacity: 0.5,
};

const SIZE_OPTIONS: SpacerSize[] = ["xs", "sm", "md", "lg", "xl"];

export const spacer: BlockDefinition<"spacer"> = {
  type: "spacer",
  label: "Spacer",
  category: "structural",
  iconName: "AlignVerticalJustifyCenter",
  schema: SpacerSchema,
  factory: (over) => ({ ...baseFields("spacer"), size: "md" as SpacerSize, ...over }),
  Renderer: ({ block, mode }) => {
    const height = SIZES[block.size];
    if (mode === "read") {
      return <div style={{ height }} />;
    }
    return (
      <div style={{ height, position: "relative", display: "flex", alignItems: "center" }}>
        <div style={lineStyle} />
        <span style={{ ...labelStyle, margin: "0 0.5rem" }}>Spacer {SIZE_LABELS[block.size]}</span>
        <div style={lineStyle} />
      </div>
    );
  },
  Editor: ({ block, onChange }) => (
    <div style={editorStyle}>
      <span style={labelStyle}>Spacer size</span>
      {SIZE_OPTIONS.map((s) => (
        <button
          key={s}
          type="button"
          onClick={() => onChange({ ...block, size: s })}
          style={{
            fontFamily: "var(--font-ui-mono)",
            fontSize: "0.625rem",
            textTransform: "uppercase",
            letterSpacing: "0.08em",
            padding: "0.2rem 0.45rem",
            border: `1px solid ${block.size === s ? "var(--color-accent)" : "var(--color-rule)"}`,
            borderRadius: "3px",
            background: block.size === s ? "var(--color-accent-soft)" : "transparent",
            color: block.size === s ? "var(--color-accent)" : "var(--color-mute)",
            cursor: "pointer",
          }}
        >
          {s.toUpperCase()}
        </button>
      ))}
    </div>
  ),
  serialize: (block): RootContent[] => {
    const dir: LeafDirective = {
      type: "leafDirective",
      name: "spacer",
      attributes: { size: block.size },
      children: [],
    };
    return [dir as unknown as RootContent];
  },
  deserialize: (node, ctx) => {
    if (node.type !== "leafDirective") return null;
    const d = node as LeafDirective;
    if (d.name !== "spacer") return null;
    const size = (d.attributes?.size ?? "md") as SpacerSize;
    return { ...ctx.newBlockBase("spacer"), size };
  },
};
