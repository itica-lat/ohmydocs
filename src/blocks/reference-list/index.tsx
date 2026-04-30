import { z } from "zod";
import type { RootContent } from "mdast";
import type { LeafDirective } from "mdast-util-directive";
import type { BlockDefinition } from "../registry";
import type { Block, ReferenceListBlock } from "../types";
import { baseFields } from "../factory";
import { useDocumentsStore } from "@/features/editor/store";
import { extractDocumentLinks } from "../_links";
import { ExternalLink } from "lucide-react";

export const ReferenceListSchema: z.ZodType<ReferenceListBlock> = z.object({
  id: z.string(),
  type: z.literal("reference-list"),
  createdAt: z.string(),
  updatedAt: z.string(),
});

function ReferenceListRenderer({
  mode,
  allBlocks: allBlocksProp,
}: {
  block: ReferenceListBlock;
  mode: "edit" | "read";
  allBlocks?: Block[];
}) {
  const activeId = useDocumentsStore((s) => s.activeId);
  const documents = useDocumentsStore((s) => s.documents);
  const doc = activeId ? documents[activeId] : null;
  const sourceBlocks: Block[] = allBlocksProp ?? ((doc?.blocks ?? []) as Block[]);

  const refs = extractDocumentLinks(sourceBlocks);

  if (refs.length === 0) {
    return (
      <div
        style={{
          color: "var(--color-mute)",
          fontFamily: "var(--font-ui-mono)",
          fontSize: "0.75rem",
          textTransform: "uppercase",
          letterSpacing: "0.08em",
          padding: "1rem 0",
        }}
      >
        {mode === "edit" ? "References — add [text](url) links in paragraphs to populate" : ""}
      </div>
    );
  }

  return (
    <div style={{ margin: "1.5rem 0" }}>
      <div
        style={{
          fontFamily: "var(--font-doc-mono)",
          fontSize: "0.75rem",
          textTransform: "uppercase",
          letterSpacing: "0.08em",
          color: "var(--color-mute)",
          marginBottom: "0.75rem",
        }}
      >
        References
      </div>
      <ol
        style={{
          listStyle: "none",
          margin: 0,
          padding: 0,
          display: "flex",
          flexDirection: "column",
          gap: "0.4rem",
        }}
      >
        {refs.map(({ text, url }, i) => (
          <li
            key={url}
            style={{
              display: "flex",
              gap: "0.5rem",
              alignItems: "baseline",
              fontSize: "0.8125rem",
              lineHeight: 1.5,
              color: "var(--color-ink-deep)",
            }}
          >
            <span
              style={{
                fontFamily: "var(--font-doc-mono)",
                fontSize: "0.6875rem",
                color: "var(--color-mute)",
                minWidth: "1.5rem",
                flexShrink: 0,
              }}
            >
              [{i + 1}]
            </span>
            <span style={{ fontFamily: "var(--font-doc-sans)" }}>{text}</span>
            <span style={{ color: "var(--color-rule)" }}>—</span>
            <a
              href={url}
              target="_blank"
              rel="noopener noreferrer"
              style={{
                fontFamily: "var(--font-doc-mono)",
                fontSize: "0.6875rem",
                color: "var(--color-accent)",
                textDecoration: "underline",
                textUnderlineOffset: "2px",
                textDecorationColor: "var(--color-accent-soft)",
                wordBreak: "break-all",
                display: "inline-flex",
                alignItems: "center",
                gap: "3px",
              }}
            >
              {url}
              <ExternalLink className="link-ext-icon" size={9} style={{ flexShrink: 0 }} />
            </a>
          </li>
        ))}
      </ol>
    </div>
  );
}

export const referenceList: BlockDefinition<"reference-list"> = {
  type: "reference-list",
  label: "References",
  category: "content",
  iconName: "BookMarked",
  schema: ReferenceListSchema,
  factory: (over) => ({ ...baseFields("reference-list"), ...over }),
  Renderer: ReferenceListRenderer,
  Editor: () => (
    <div
      style={{
        padding: "0.375rem 0",
        color: "var(--color-mute)",
        fontFamily: "var(--font-ui-mono)",
        fontSize: "0.6875rem",
        textTransform: "uppercase",
        letterSpacing: "0.08em",
      }}
    >
      References (auto-generated from inline links)
    </div>
  ),
  serialize: (): RootContent[] => {
    const dir: LeafDirective = {
      type: "leafDirective",
      name: "reference-list",
      attributes: {},
      children: [],
    };
    return [dir as unknown as RootContent];
  },
  deserialize: (node, ctx) => {
    if (node.type !== "leafDirective") return null;
    const d = node as LeafDirective;
    if (d.name !== "reference-list") return null;
    return { ...ctx.newBlockBase("reference-list") };
  },
};
