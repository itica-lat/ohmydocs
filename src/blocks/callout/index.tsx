import { z } from "zod";
import type { RootContent } from "mdast";
import type { ContainerDirective } from "mdast-util-directive";
import type { BlockDefinition } from "../registry";
import type { CalloutBlock, CalloutVariant } from "../types";
import { baseFields } from "../factory";
import { AlignButtons, nodeToText, textParagraph } from "../_shared";
import { useT } from "@/lib/i18n";

const variants: readonly CalloutVariant[] = ["info", "warning", "danger", "success"];

export const CalloutSchema = z.object({
  id: z.string(),
  type: z.literal("callout"),
  createdAt: z.string(),
  updatedAt: z.string(),
  variant: z.enum(["info", "warning", "danger", "success"]),
  label: z.string(),
  body: z.string(),
  align: z.enum(["left", "center", "right", "justify"]).optional(),
});

type VariantColor = {
  border: string;
  tint: string;
};

const variantColors: Record<CalloutVariant, VariantColor> = {
  info: { border: "var(--color-accent)", tint: "rgba(189,232,245,0.4)" },
  warning: { border: "#D9A441", tint: "rgba(217,164,65,0.12)" },
  danger: { border: "#C0556B", tint: "rgba(192,85,107,0.12)" },
  success: { border: "#5A9F7B", tint: "rgba(90,159,123,0.12)" },
};

export const callout: BlockDefinition<"callout"> = {
  type: "callout",
  label: "Callout",
  category: "content",
  iconName: "Info",
  schema: CalloutSchema,
  factory: (over) => ({
    ...baseFields("callout"),
    variant: "info",
    label: "NOTE",
    body: "",
    align: "left",
    ...over,
  }),
  Renderer: ({ block }) => {
    const c = variantColors[block.variant];
    const align = block.align ?? "left";
    return (
      <aside
        style={{
          borderLeft: `3px solid ${c.border}`,
          background: c.tint,
          padding: "1.25rem 1.5rem",
          borderRadius: "var(--radius-block)",
          margin: "1.75rem 0",
        }}
      >
        {block.label && (
          <strong
            className="mono-label"
            style={{
              color: "var(--color-ink-deep)",
              display: "block",
              marginBottom: "0.5rem",
              textAlign: align,
            }}
          >
            {block.label}
          </strong>
        )}
        <div style={{ whiteSpace: "pre-wrap", lineHeight: 1.65, textAlign: align }}>
          {block.body}
        </div>
      </aside>
    );
  },
  Editor: ({ block, onChange }) => {
    const t = useT();
    const update = (patch: Partial<CalloutBlock>) =>
      onChange({ ...block, ...patch, updatedAt: new Date().toISOString() });

    return (
      <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem" }}>
        <div style={{ display: "flex", gap: "0.5rem" }}>
          <select
            value={block.variant}
            onChange={(e) => update({ variant: e.target.value as CalloutVariant })}
            style={{
              fontFamily: "var(--font-ui-mono)",
              fontSize: "0.6875rem",
              textTransform: "uppercase",
              background: "var(--color-paper-soft)",
              border: "var(--rule)",
              padding: "0.25rem 0.5rem",
              borderRadius: "4px",
              color: "var(--color-ink-deep)",
            }}
          >
            {variants.map((v) => (
              <option key={v} value={v}>
                {v.toUpperCase()}
              </option>
            ))}
          </select>
          <input
            value={block.label}
            onChange={(e) => update({ label: e.target.value.toUpperCase() })}
            placeholder="LABEL"
            style={{
              flex: 1,
              border: "none",
              background: "transparent",
              outline: "none",
              fontFamily: "var(--font-doc-mono)",
              fontSize: "0.75rem",
              letterSpacing: "0.08em",
              textTransform: "uppercase",
              color: "var(--color-ink-deep)",
            }}
          />
        </div>
        <textarea
          value={block.body}
          onChange={(e) => update({ body: e.target.value })}
          placeholder={t("block.callout.body")}
          rows={3}
          style={{
            width: "100%",
            border: "none",
            background: "transparent",
            outline: "none",
            resize: "vertical",
            fontFamily: "var(--font-doc-sans)",
            fontSize: "0.9375rem",
            color: "var(--color-ink-deepest)",
            lineHeight: 1.65,
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
      name: "callout",
      attributes: { variant: block.variant, label: block.label },
      children: [textParagraph(block.body)],
    };
    return [dir as RootContent];
  },
  deserialize: (node, ctx) => {
    if (node.type !== "containerDirective") return null;
    const d = node as ContainerDirective;
    if (d.name !== "callout") return null;
    const variantAttr = d.attributes?.variant;
    const variant: CalloutVariant = variants.includes(variantAttr as CalloutVariant)
      ? (variantAttr as CalloutVariant)
      : "info";
    const body = d.children.map((c) => nodeToText(c)).join("\n\n");
    return {
      ...ctx.newBlockBase("callout"),
      variant,
      label: d.attributes?.label ?? "",
      body,
      align: "left",
    };
  },
};
