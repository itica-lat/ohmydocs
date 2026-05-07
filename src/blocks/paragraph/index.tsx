import { z } from "zod";
import type { Paragraph as MdastParagraph, RootContent } from "mdast";
import type { BlockDefinition } from "../registry";
import type { Block, ParagraphBlock } from "../types";
import { baseFields } from "../factory";
import { AlignButtons, nodeToText, textParagraph } from "../_shared";
import { extractDocumentLinks, renderInlineText } from "../_links";
import { useDocumentsStore } from "@/features/editor/store";
import { useT } from "@/lib/i18n";

export const ParagraphSchema = z.object({
  id: z.string(),
  type: z.literal("paragraph"),
  createdAt: z.string(),
  updatedAt: z.string(),
  text: z.string(),
  align: z.enum(["left", "center", "right", "justify"]).optional(),
});

function ParagraphRenderer({
  block,
  allBlocks: allBlocksProp,
}: {
  block: ParagraphBlock;
  mode: "edit" | "read";
  allBlocks?: Block[];
}) {
  const activeId = useDocumentsStore((s) => s.activeId);
  const documents = useDocumentsStore((s) => s.documents);
  const doc = activeId ? documents[activeId] : null;
  const sourceBlocks: Block[] = allBlocksProp ?? ((doc?.blocks ?? []) as Block[]);

  const hasRefList = sourceBlocks.some((b) => b.type === "reference-list");
  const allLinks = extractDocumentLinks(sourceBlocks);
  const linkIndex: Map<string, number> | null = hasRefList
    ? new Map(allLinks.map(({ url }, i) => [url, i]))
    : null;

  const align = block.align ?? "left";
  const lines = block.text.split("\n");

  return (
    <p
      style={{
        maxWidth: align === "center" || align === "right" ? undefined : "65ch",
        width: align === "center" || align === "right" ? "100%" : undefined,
        lineHeight: 1.65,
        color: "var(--color-ink-deepest)",
        margin: "0 0 1.25rem",
        opacity: 0.9,
        textAlign: align,
      }}
    >
      {lines.map((line, i) => (
        <span key={i}>
          {renderInlineText(line, linkIndex)}
          {i < lines.length - 1 && <br />}
        </span>
      ))}
    </p>
  );
}

export const paragraph: BlockDefinition<"paragraph"> = {
  type: "paragraph",
  label: "Paragraph",
  category: "content",
  iconName: "Type",
  schema: ParagraphSchema,
  factory: (over) => ({ ...baseFields("paragraph"), text: "", align: "left", ...over }),
  Renderer: ParagraphRenderer,
  Editor: ({ block, onChange }) => {
    const align = block.align ?? "left";
    const t = useT();
    const update = (patch: Partial<ParagraphBlock>) =>
      onChange({ ...block, ...patch, updatedAt: new Date().toISOString() });

    return (
      <div style={{ display: "flex", flexDirection: "column", gap: "0.4rem" }}>
        <textarea
          value={block.text}
          onChange={(e) => update({ text: e.target.value })}
          placeholder={t("block.paragraph.placeholder")}
          rows={Math.max(2, block.text.split("\n").length)}
          style={{
            width: "100%",
            background: "transparent",
            border: "none",
            outline: "none",
            resize: "vertical",
            font: "inherit",
            color: "var(--color-ink-deepest)",
            lineHeight: 1.65,
            textAlign: align,
          }}
        />
        <AlignButtons value={block.align} onChange={(a) => update({ align: a })} />
      </div>
    );
  },
  serialize: (block): RootContent[] => [textParagraph(block.text)],
  deserialize: (node, ctx) => {
    if (node.type !== "paragraph") return null;
    return {
      ...ctx.newBlockBase("paragraph"),
      text: nodeToText(node as MdastParagraph),
      align: "left",
    };
  },
};
