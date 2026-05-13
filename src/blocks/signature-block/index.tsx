import { z } from "zod";
import type { RootContent } from "mdast";
import type { ContainerDirective } from "mdast-util-directive";
import type { BlockDefinition } from "../registry";
import type { SignatureBlock, SignatureSlot } from "../types";
import type { CSSProperties } from "react";
import { baseFields } from "../factory";
import { useT } from "@/lib/i18n";

const Slot = z.object({
  name: z.string(),
  role: z.string(),
  description: z.string(),
});

export const SignatureSchema: z.ZodType<SignatureBlock> = z.object({
  id: z.string(),
  type: z.literal("signature-block"),
  createdAt: z.string(),
  updatedAt: z.string(),
  slots: z.array(Slot),
});

export const signatureBlock: BlockDefinition<"signature-block"> = {
  type: "signature-block",
  label: "Signatures",
  category: "data",
  iconName: "PenLine",
  schema: SignatureSchema,
  factory: (over) => ({
    ...baseFields("signature-block"),
    slots: [
      { name: "", role: "TEAM LEAD", description: "Operations & delivery" },
      { name: "", role: "EDITOR", description: "Editorial sign-off" },
    ],
    ...over,
  }),
  Renderer: ({ block }) => (
    <div
      style={{
        display: "grid",
        gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
        gap: "2rem",
        margin: "3rem 0 1rem",
      }}
    >
      {block.slots.map((s, i) => (
        // eslint-disable-next-line react/no-array-index-key
        <div key={i}>
          <div
            style={{
              borderTop: "1px solid var(--color-ink-deepest)",
              paddingTop: "0.5rem",
            }}
          >
            <div className="mono-label" style={{ color: "var(--color-ink-deepest)" }}>
              {s.name || " "}
            </div>
            <div
              className="mono-label"
              style={{ color: "var(--color-accent)", marginTop: "0.125rem" }}
            >
              {s.role}
            </div>
            <div
              style={{
                fontSize: "0.8125rem",
                color: "var(--color-mute)",
                marginTop: "0.25rem",
              }}
            >
              {s.description}
            </div>
          </div>
        </div>
      ))}
    </div>
  ),
  Editor: ({ block, onChange }) => {
    const t = useT();
    return (
      <div style={{ display: "flex", flexDirection: "column", gap: "0.25rem" }}>
        {block.slots.map((s, i) => (
          // eslint-disable-next-line react/no-array-index-key
          <div
            key={i}
            style={{
              display: "grid",
              gridTemplateColumns: "1fr 1fr 1.5fr auto",
              gap: "0.4rem",
            }}
          >
            <input
              value={s.name}
              onChange={(ev) => {
                const slots = [...block.slots];
                slots[i] = { ...s, name: ev.target.value };
                onChange({ ...block, slots, updatedAt: new Date().toISOString() });
              }}
              placeholder={t("block.signature.name")}
              style={inp}
            />
            <input
              value={s.role}
              onChange={(ev) => {
                const slots = [...block.slots];
                slots[i] = { ...s, role: ev.target.value.toUpperCase() };
                onChange({ ...block, slots, updatedAt: new Date().toISOString() });
              }}
              placeholder="ROLE"
              style={{
                ...inp,
                fontFamily: "var(--font-doc-mono)",
                textTransform: "uppercase",
              }}
            />
            <input
              value={s.description}
              onChange={(ev) => {
                const slots = [...block.slots];
                slots[i] = { ...s, description: ev.target.value };
                onChange({ ...block, slots, updatedAt: new Date().toISOString() });
              }}
              placeholder={t("block.signature.role")}
              style={inp}
            />
            <button
              type="button"
              onClick={() =>
                onChange({
                  ...block,
                  slots: block.slots.filter((_, j) => j !== i),
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
              slots: [...block.slots, { name: "", role: "", description: "" }],
              updatedAt: new Date().toISOString(),
            })
          }
          style={addBtn}
        >
          + Signature
        </button>
      </div>
    );
  },
  serialize: (block): RootContent[] => [
    {
      type: "containerDirective",
      name: "signatures",
      attributes: {},
      children: block.slots.map((s) => ({
        type: "paragraph",
        children: [{ type: "text", value: `${s.name} | ${s.role} | ${s.description}` }],
      })),
    } as ContainerDirective as RootContent,
  ],
  deserialize: (node, ctx) => {
    if (node.type !== "containerDirective") return null;
    const d = node as ContainerDirective;
    if (d.name !== "signatures") return null;
    const slots: SignatureSlot[] = [];
    for (const c of d.children) {
      if (c.type !== "paragraph") continue;
      const text = (c.children as { value?: string }[]).map((n) => n.value ?? "").join("");
      const parts = text.split("|").map((p) => p.trim());
      slots.push({
        name: parts[0] ?? "",
        role: parts[1] ?? "",
        description: parts[2] ?? "",
      });
    }
    return { ...ctx.newBlockBase("signature-block"), slots };
  },
};

const inp: CSSProperties = {
  border: "var(--rule)",
  padding: "0.35rem 0.5rem",
  borderRadius: "4px",
  fontFamily: "var(--font-doc-sans)",
  fontSize: "0.8125rem",
  color: "var(--color-ink-deepest)",
  background: "var(--color-paper)",
  outline: "none",
};
const addBtn: CSSProperties = {
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
};
const delBtn: CSSProperties = {
  border: "var(--rule)",
  background: "transparent",
  color: "var(--color-mute)",
  borderRadius: "4px",
  padding: "0.125rem 0.4rem",
  fontSize: "0.6875rem",
};
