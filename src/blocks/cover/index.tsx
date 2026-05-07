import { z } from "zod";
import type { RootContent, Heading, Paragraph as MdastParagraph } from "mdast";
import type { ContainerDirective } from "mdast-util-directive";
import type { BlockDefinition } from "../registry";
import type { CoverBlock, MetaPair } from "../types";
import { baseFields } from "../factory";
import { nodeToText, withAccent } from "../_shared";
import { useT } from "@/lib/i18n";

const MetaPair = z.object({ label: z.string(), value: z.string() });

export const CoverSchema: z.ZodType<CoverBlock> = z.object({
  id: z.string(),
  type: z.literal("cover"),
  createdAt: z.string(),
  updatedAt: z.string(),
  label: z.string(),
  title: z.string(),
  highlightWord: z.string(),
  metadata: z.array(MetaPair),
  callout: z.string().nullable(),
});

export const cover: BlockDefinition<"cover"> = {
  type: "cover",
  label: "Cover",
  category: "structural",
  iconName: "BookmarkPlus",
  schema: CoverSchema,
  factory: (over) => ({
    ...baseFields("cover"),
    label: "PROJECT · MODULE · DELIVERY",
    title: "Document title *highlight*",
    highlightWord: "highlight",
    metadata: [
      { label: "TEAM", value: "" },
      { label: "DATE", value: new Date().toISOString().slice(0, 10) },
    ],
    callout: null,
    ...over,
  }),
  Renderer: ({ block }) => {
    // Title may include the highlight word literally; render it accent-colored.
    const cleanTitle = block.title.replace(/[*]/g, "");
    return (
      <section
        style={{
          background: "var(--color-ink-deepest)",
          color: "var(--color-ink-on-dark)",
          margin: "calc(-1 * var(--page-padding)) calc(-1 * var(--page-padding)) 0",
          padding: "var(--page-padding)",
          minHeight: "1056px",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          pageBreakAfter: "always",
          breakAfter: "page",
        }}
      >
        <div>
          <div
            className="mono-label"
            style={{ color: "var(--color-accent)", letterSpacing: "0.12em" }}
          >
            {block.label}
          </div>
          <h1
            className="display-xl"
            style={{
              color: "var(--color-paper)",
              marginTop: "4rem",
              maxWidth: "14ch",
            }}
          >
            {withAccent(cleanTitle, block.highlightWord)}
          </h1>
        </div>
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "1fr 1fr",
            gap: "1.5rem 2rem",
          }}
        >
          {block.metadata.map((m, i) => (
            // eslint-disable-next-line react/no-array-index-key
            <div key={i}>
              <div
                className="mono-label"
                style={{
                  color: "var(--color-accent)",
                  marginBottom: "0.25rem",
                }}
              >
                {m.label}
              </div>
              <div style={{ color: "var(--color-ink-on-dark)" }}>{m.value}</div>
            </div>
          ))}
        </div>
        {block.callout && (
          <aside
            style={{
              borderLeft: "3px solid var(--color-accent)",
              background: "rgba(189,232,245,0.08)",
              padding: "1rem 1.25rem",
              marginTop: "2rem",
              borderRadius: "var(--radius-block)",
            }}
          >
            {block.callout}
          </aside>
        )}
      </section>
    );
  },
  Editor: ({ block, onChange }) => {
    const update = <K extends keyof CoverBlock>(k: K, v: CoverBlock[K]) =>
      onChange({ ...block, [k]: v, updatedAt: new Date().toISOString() });
    const t = useT();
    return (
      <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem" }}>
        <input
          value={block.label}
          onChange={(e) => update("label", e.target.value.toUpperCase())}
          placeholder={t("block.cover.label")}
          style={inputMono}
        />
        <input
          value={block.title}
          onChange={(e) => update("title", e.target.value)}
          placeholder={t("block.cover.title")}
          style={inputDisplay}
        />
        <input
          value={block.highlightWord}
          onChange={(e) => update("highlightWord", e.target.value)}
          placeholder={t("block.cover.highlight")}
          style={inputMono}
        />
        <div style={{ display: "flex", flexDirection: "column", gap: "0.25rem" }}>
          {block.metadata.map((m, i) => (
            // eslint-disable-next-line react/no-array-index-key
            <div key={i} style={{ display: "flex", gap: "0.5rem" }}>
              <input
                value={m.label}
                onChange={(e) => {
                  const meta = [...block.metadata];
                  meta[i] = { ...m, label: e.target.value.toUpperCase() };
                  update("metadata", meta);
                }}
                placeholder={t("block.metadata.label")}
                style={{ ...inputMono, width: "40%" }}
              />
              <input
                value={m.value}
                onChange={(e) => {
                  const meta = [...block.metadata];
                  meta[i] = { ...m, value: e.target.value };
                  update("metadata", meta);
                }}
                placeholder={t("block.metadata.value")}
                style={{ ...inputSans, flex: 1 }}
              />
              <button
                type="button"
                onClick={() =>
                  update(
                    "metadata",
                    block.metadata.filter((_, j) => j !== i),
                  )
                }
                style={removeBtn}
              >
                ×
              </button>
            </div>
          ))}
          <button
            type="button"
            onClick={() => update("metadata", [...block.metadata, { label: "", value: "" }])}
            style={addBtn}
          >
            + {t("block.metadata.addRow")}
          </button>
        </div>
        <textarea
          value={block.callout ?? ""}
          onChange={(e) => update("callout", e.target.value || null)}
          placeholder={t("block.cover.callout")}
          rows={2}
          style={{ ...inputSans, resize: "vertical" }}
        />
      </div>
    );
  },
  serialize: (block): RootContent[] => {
    const dir: ContainerDirective = {
      type: "containerDirective",
      name: "cover",
      attributes: { label: block.label, highlight: block.highlightWord },
      children: [
        {
          type: "heading",
          depth: 1,
          children: [{ type: "text", value: block.title }],
        },
        ...block.metadata.map(
          (m): MdastParagraph => ({
            type: "paragraph",
            children: [{ type: "text", value: `${m.label}: ${m.value}` }],
          }),
        ),
        ...(block.callout
          ? [
              {
                type: "blockquote" as const,
                children: [
                  {
                    type: "paragraph" as const,
                    children: [{ type: "text" as const, value: block.callout }],
                  },
                ],
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
    if (d.name !== "cover") return null;
    const heading = d.children.find((c) => c.type === "heading") as Heading | undefined;
    const metadata: MetaPair[] = [];
    let callout: string | null = null;
    for (const c of d.children) {
      if (c.type === "paragraph") {
        const text = nodeToText(c);
        const m = text.match(/^([^:]+):\s*(.*)$/);
        if (m)
          metadata.push({
            label: (m[1] ?? "").trim(),
            value: (m[2] ?? "").trim(),
          });
      } else if (c.type === "blockquote") {
        callout = nodeToText(c);
      }
    }
    return {
      ...ctx.newBlockBase("cover"),
      label: d.attributes?.label ?? "",
      title: heading ? nodeToText(heading) : "",
      highlightWord: d.attributes?.highlight ?? "",
      metadata,
      callout,
    };
  },
};

const inputBase: React.CSSProperties = {
  border: "var(--rule)",
  outline: "none",
  padding: "0.375rem 0.5rem",
  borderRadius: "4px",
  background: "var(--color-paper)",
};
const inputMono: React.CSSProperties = {
  ...inputBase,
  fontFamily: "var(--font-doc-mono)",
  fontSize: "0.75rem",
  letterSpacing: "0.08em",
  textTransform: "uppercase",
  color: "var(--color-ink-deep)",
};
const inputSans: React.CSSProperties = {
  ...inputBase,
  fontFamily: "var(--font-doc-sans)",
  fontSize: "0.875rem",
  color: "var(--color-ink-deepest)",
};
const inputDisplay: React.CSSProperties = {
  ...inputBase,
  fontFamily: "var(--font-doc-serif)",
  fontStyle: "italic",
  fontSize: "1.5rem",
  color: "var(--color-ink-deepest)",
};
const removeBtn: React.CSSProperties = {
  border: "var(--rule)",
  background: "transparent",
  color: "var(--color-mute)",
  borderRadius: "4px",
  padding: "0.125rem 0.4rem",
  fontSize: "0.6875rem",
};
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
};
