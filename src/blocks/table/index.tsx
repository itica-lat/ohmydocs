import { z } from "zod";
import type { RootContent, Table as MdastTable } from "mdast";
import type { BlockDefinition } from "../registry";
import type { TableBlock } from "../types";
import type { CSSProperties } from "react";
import { baseFields } from "../factory";
import { nodeToText } from "../_shared";
import { useT } from "@/lib/i18n";

export const TableSchema: z.ZodType<TableBlock> = z.object({
  id: z.string(),
  type: z.literal("table"),
  createdAt: z.string(),
  updatedAt: z.string(),
  headers: z.array(z.string()),
  rows: z.array(z.array(z.string())),
});

export const table: BlockDefinition<"table"> = {
  type: "table",
  label: "Table",
  category: "data",
  iconName: "Table",
  schema: TableSchema,
  factory: (over) => ({
    ...baseFields("table"),
    headers: ["Column 1", "Column 2"],
    rows: [["", ""]],
    ...over,
  }),
  Renderer: ({ block }) => (
    <table
      style={{
        width: "100%",
        borderCollapse: "collapse",
        margin: "1.5rem 0",
        fontSize: "0.875rem",
      }}
    >
      <thead>
        <tr>
          {block.headers.map((h, i) => (
            // eslint-disable-next-line react/no-array-index-key
            <th
              key={i}
              className="mono-label"
              style={{
                background: "var(--color-ink-deepest)",
                color: "var(--color-ink-on-dark)",
                padding: "0.875rem 1rem",
                textAlign: "left",
                borderTop: "var(--rule)",
              }}
            >
              {h}
            </th>
          ))}
        </tr>
      </thead>
      <tbody>
        {block.rows.map((row, ri) => (
          // eslint-disable-next-line react/no-array-index-key
          <tr
            key={ri}
            style={{
              background: ri % 2 === 0 ? "transparent" : "var(--color-paper-soft)",
            }}
          >
            {row.map((cell, ci) => (
              // eslint-disable-next-line react/no-array-index-key
              <td
                key={ci}
                style={{
                  padding: "0.875rem 1rem",
                  fontFamily: ci === 0 ? "var(--font-doc-mono)" : "var(--font-doc-sans)",
                  fontSize: ci === 0 ? "0.8125rem" : "0.875rem",
                  color: "var(--color-ink-deepest)",
                  borderBottom: ri === block.rows.length - 1 ? "var(--rule)" : "none",
                }}
              >
                {cell}
              </td>
            ))}
          </tr>
        ))}
      </tbody>
    </table>
  ),
  Editor: ({ block, onChange }) => {
    const t = useT();
    const setCell = (ri: number, ci: number, v: string) => {
      const rows = block.rows.map((r) => [...r]);
      const row = rows[ri];
      if (!row) return;
      row[ci] = v;
      onChange({ ...block, rows, updatedAt: new Date().toISOString() });
    };
    return (
      <div style={{ display: "flex", flexDirection: "column", gap: "0.25rem" }}>
        <div style={{ display: "flex", gap: "0.25rem" }}>
          {block.headers.map((h, i) => (
            <input
              // eslint-disable-next-line react/no-array-index-key
              key={i}
              value={h}
              onChange={(e) => {
                const headers = [...block.headers];
                headers[i] = e.target.value;
                onChange({
                  ...block,
                  headers,
                  updatedAt: new Date().toISOString(),
                });
              }}
              style={{
                ...cellInput,
                fontFamily: "var(--font-doc-mono)",
                textTransform: "uppercase",
              }}
              placeholder={t("block.table.header")}
            />
          ))}
        </div>
        {block.rows.map((row, ri) => (
          // eslint-disable-next-line react/no-array-index-key
          <div key={ri} style={{ display: "flex", gap: "0.25rem" }}>
            {row.map((c, ci) => (
              <input
                // eslint-disable-next-line react/no-array-index-key
                key={ci}
                value={c}
                onChange={(e) => setCell(ri, ci, e.target.value)}
                style={cellInput}
                placeholder="cell"
              />
            ))}
          </div>
        ))}
        <div style={{ display: "flex", gap: "0.5rem" }}>
          <button
            type="button"
            style={smallBtn}
            onClick={() =>
              onChange({
                ...block,
                rows: [...block.rows, block.headers.map(() => "")],
                updatedAt: new Date().toISOString(),
              })
            }
          >
            + Row
          </button>
          <button
            type="button"
            style={smallBtn}
            onClick={() =>
              onChange({
                ...block,
                headers: [...block.headers, `Column ${block.headers.length + 1}`],
                rows: block.rows.map((r) => [...r, ""]),
                updatedAt: new Date().toISOString(),
              })
            }
          >
            + Column
          </button>
        </div>
      </div>
    );
  },
  serialize: (block): RootContent[] => [
    {
      type: "table",
      align: block.headers.map(() => null),
      children: [
        {
          type: "tableRow",
          children: block.headers.map((h) => ({
            type: "tableCell",
            children: [{ type: "text", value: h }],
          })),
        },
        ...block.rows.map((row) => ({
          type: "tableRow" as const,
          children: row.map((c) => ({
            type: "tableCell" as const,
            children: [{ type: "text" as const, value: c }],
          })),
        })),
      ],
    },
  ],
  deserialize: (node, ctx) => {
    if (node.type !== "table") return null;
    const t = node as MdastTable;
    const [headerRow, ...bodyRows] = t.children;
    if (!headerRow) return null;
    const headers = headerRow.children.map((c) => nodeToText(c));
    const rows = bodyRows.map((r) => r.children.map((c) => nodeToText(c)));
    return { ...ctx.newBlockBase("table"), headers, rows };
  },
};

const cellInput: CSSProperties = {
  flex: 1,
  border: "var(--rule)",
  padding: "0.4rem 0.5rem",
  borderRadius: "4px",
  fontFamily: "var(--font-doc-sans)",
  fontSize: "0.8125rem",
  color: "var(--color-ink-deepest)",
  background: "var(--color-paper)",
  outline: "none",
};
const smallBtn: CSSProperties = {
  fontFamily: "var(--font-ui-mono)",
  fontSize: "0.6875rem",
  textTransform: "uppercase",
  letterSpacing: "0.08em",
  color: "var(--color-accent)",
  background: "transparent",
  border: "var(--rule)",
  padding: "0.25rem 0.5rem",
  borderRadius: "4px",
  cursor: "pointer",
};
