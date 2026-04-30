import { z } from "zod";
import type { List as MdastList, ListItem as MdastListItem, RootContent } from "mdast";
import type { BlockDefinition } from "../registry";
import type { ListBlock } from "../types";
import { baseFields } from "../factory";
import { AlignButtons, nodeToText } from "../_shared";

export const ListSchema = z.object({
  id: z.string(),
  type: z.literal("list"),
  createdAt: z.string(),
  updatedAt: z.string(),
  ordered: z.boolean(),
  items: z.array(z.string()),
  align: z.enum(["left", "center", "right", "justify"]).optional(),
});

export const list: BlockDefinition<"list"> = {
  type: "list",
  label: "List",
  category: "content",
  iconName: "List",
  schema: ListSchema,
  factory: (over) => ({
    ...baseFields("list"),
    ordered: false,
    items: ["First item"],
    align: "left",
    ...over,
  }),
  Renderer: ({ block }) => {
    const align = block.align ?? "left";
    const Tag = block.ordered ? "ol" : "ul";
    return (
      <Tag
        style={{
          margin: "1.25rem 0",
          padding: 0,
          listStyle: "none",
          color: "var(--color-ink-deepest)",
          display: "flex",
          flexDirection: "column",
        }}
      >
        {block.items.map((item, i) => (
          <li
            // eslint-disable-next-line react/no-array-index-key
            key={i}
            style={{
              display: "flex",
              gap: "0.75rem",
              padding: "0.25rem 0 0.25rem 1.5rem",
              lineHeight: 1.65,
            }}
          >
            <span
              aria-hidden
              style={{
                flexShrink: 0,
                marginTop: block.ordered ? 0 : "0.5em",
                width: block.ordered ? "auto" : "0.5em",
                height: block.ordered ? "auto" : "0.5em",
                background: block.ordered ? "transparent" : "var(--color-accent)",
                color: "var(--color-ink-deep)",
                fontFamily: block.ordered ? "var(--font-doc-mono)" : "inherit",
                fontSize: block.ordered ? "0.8125rem" : "inherit",
                minWidth: block.ordered ? "1.5rem" : undefined,
              }}
            >
              {block.ordered ? `${i + 1}.` : ""}
            </span>
            <span style={{ textAlign: align, flex: 1 }}>{item}</span>
          </li>
        ))}
      </Tag>
    );
  },
  Editor: ({ block, onChange }) => {
    const update = (patch: Partial<ListBlock>) =>
      onChange({ ...block, ...patch, updatedAt: new Date().toISOString() });

    return (
      <div style={{ display: "flex", flexDirection: "column", gap: "0.375rem" }}>
        <label
          style={{
            fontFamily: "var(--font-ui-mono)",
            fontSize: "0.6875rem",
            letterSpacing: "0.08em",
            textTransform: "uppercase",
            color: "var(--color-mute)",
            display: "flex",
            gap: "0.5rem",
            alignItems: "center",
          }}
        >
          <input
            type="checkbox"
            checked={block.ordered}
            onChange={(e) => update({ ordered: e.target.checked })}
          />
          Ordered
        </label>
        {block.items.map((it, i) => (
          // eslint-disable-next-line react/no-array-index-key
          <div key={i} style={{ display: "flex", gap: "0.5rem", alignItems: "center" }}>
            <input
              value={it}
              onChange={(e) => {
                const items = [...block.items];
                items[i] = e.target.value;
                update({ items });
              }}
              placeholder="Item"
              style={{
                flex: 1,
                border: "none",
                outline: "none",
                background: "transparent",
                fontFamily: "var(--font-doc-sans)",
                fontSize: "0.9375rem",
                color: "var(--color-ink-deepest)",
                textAlign: block.align ?? "left",
              }}
            />
            <button
              type="button"
              onClick={() => {
                const items = block.items.filter((_, j) => j !== i);
                update({ items: items.length ? items : [""] });
              }}
              style={{
                border: "var(--rule)",
                background: "transparent",
                color: "var(--color-mute)",
                borderRadius: "4px",
                padding: "0.125rem 0.4rem",
                fontSize: "0.6875rem",
              }}
            >
              ×
            </button>
          </div>
        ))}
        <div style={{ display: "flex", gap: "0.5rem", alignItems: "center" }}>
          <button
            type="button"
            onClick={() => update({ items: [...block.items, ""] })}
            style={{
              fontFamily: "var(--font-ui-mono)",
              fontSize: "0.6875rem",
              textTransform: "uppercase",
              letterSpacing: "0.08em",
              color: "var(--color-accent)",
              background: "transparent",
              border: "none",
              padding: "0.25rem 0",
              cursor: "pointer",
            }}
          >
            + Add item
          </button>
          <div style={{ flex: 1 }} />
          <AlignButtons value={block.align} onChange={(a) => update({ align: a })} />
        </div>
      </div>
    );
  },
  serialize: (block): RootContent[] => [
    {
      type: "list",
      ordered: block.ordered,
      spread: false,
      children: block.items.map(
        (text): MdastListItem => ({
          type: "listItem",
          spread: false,
          children: [{ type: "paragraph", children: [{ type: "text", value: text }] }],
        }),
      ),
    },
  ],
  deserialize: (node, ctx) => {
    if (node.type !== "list") return null;
    const l = node as MdastList;
    return {
      ...ctx.newBlockBase("list"),
      ordered: Boolean(l.ordered),
      items: l.children.map((c) => nodeToText(c)),
      align: "left",
    };
  },
};
