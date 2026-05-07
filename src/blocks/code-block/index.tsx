import { z } from "zod";
import type { Code, RootContent } from "mdast";
import type { BlockDefinition } from "../registry";
import type { CodeBlock as CodeBlockT } from "../types";
import { baseFields } from "../factory";
import { useT } from "@/lib/i18n";

export const CodeSchema: z.ZodType<CodeBlockT> = z.object({
  id: z.string(),
  type: z.literal("code-block"),
  createdAt: z.string(),
  updatedAt: z.string(),
  language: z.string(),
  code: z.string(),
});

export const codeBlock: BlockDefinition<"code-block"> = {
  type: "code-block",
  label: "Code",
  category: "content",
  iconName: "Code",
  schema: CodeSchema,
  factory: (over) => ({
    ...baseFields("code-block"),
    language: "bash",
    code: "",
    ...over,
  }),
  Renderer: ({ block }) => (
    <div
      style={{
        background: "var(--color-ink-deepest)",
        color: "var(--color-ink-on-dark)",
        padding: "1.5rem 1.75rem",
        borderRadius: "var(--radius-block)",
        margin: "1.5rem 0",
        position: "relative",
        fontFamily: "var(--font-doc-mono)",
        fontSize: "0.8125rem",
        lineHeight: 1.6,
        overflowX: "auto",
      }}
    >
      {block.language && (
        <span
          className="mono-meta"
          style={{
            position: "absolute",
            top: "0.75rem",
            right: "0.75rem",
            border: "1px solid var(--color-accent)",
            color: "var(--color-accent)",
            padding: "0.125rem 0.5rem",
            borderRadius: "var(--radius-pill)",
          }}
        >
          {block.language}
        </span>
      )}
      <pre style={{ margin: 0, fontFamily: "inherit", whiteSpace: "pre" }}>{block.code}</pre>
    </div>
  ),
  Editor: ({ block, onChange }) => {
    const t = useT();
    return (
      <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem" }}>
        <input
          value={block.language}
          onChange={(e) =>
            onChange({
              ...block,
              language: e.target.value,
              updatedAt: new Date().toISOString(),
            })
          }
          placeholder={t("block.code.language")}
          style={{
            width: "8rem",
            border: "var(--rule)",
            padding: "0.25rem 0.5rem",
            borderRadius: "4px",
            fontFamily: "var(--font-ui-mono)",
            fontSize: "0.75rem",
            color: "var(--color-ink-deep)",
          }}
        />
        <textarea
          value={block.code}
          onChange={(e) =>
            onChange({
              ...block,
              code: e.target.value,
              updatedAt: new Date().toISOString(),
            })
          }
          placeholder={t("block.code.placeholder")}
          rows={Math.max(4, block.code.split("\n").length)}
          spellCheck={false}
          style={{
            width: "100%",
            background: "var(--color-ink-deepest)",
            color: "var(--color-ink-on-dark)",
            border: "none",
            outline: "none",
            padding: "1rem 1.25rem",
            borderRadius: "var(--radius-block)",
            fontFamily: "var(--font-doc-mono)",
            fontSize: "0.8125rem",
            lineHeight: 1.6,
            resize: "vertical",
          }}
        />
      </div>
    );
  },
  serialize: (block): RootContent[] => [
    { type: "code", lang: block.language || null, value: block.code },
  ],
  deserialize: (node, ctx) => {
    if (node.type !== "code") return null;
    const c = node as Code;
    return {
      ...ctx.newBlockBase("code-block"),
      language: c.lang ?? "",
      code: c.value,
    };
  },
};
