import { z } from "zod";
import type { RootContent } from "mdast";
import type { LeafDirective } from "mdast-util-directive";
import type { BlockDefinition } from "../registry";
import type { IndexBlock, SectionBlock, SubsectionBlock } from "../types";
import { baseFields } from "../factory";
import { useDocumentsStore } from "@/features/editor/store";
import type { Block } from "../types";

export const IndexSchema: z.ZodType<IndexBlock> = z.object({
  id: z.string(),
  type: z.literal("index"),
  createdAt: z.string(),
  updatedAt: z.string(),
});

type Entry = {
  kind: "section" | "subsection";
  number: string;
  heading: string;
};

function stripAccent(text: string): string {
  return text.replace(/\*([^*]+)\*/g, "$1");
}

function IndexRenderer({ mode }: { block: IndexBlock; mode: "edit" | "read" }) {
  const activeId = useDocumentsStore((s) => s.activeId);
  const documents = useDocumentsStore((s) => s.documents);
  const doc = activeId ? documents[activeId] : null;

  const entries: Entry[] = [];
  for (const block of (doc?.blocks ?? []) as Block[]) {
    if (block.type === "section") {
      const b = block as SectionBlock;
      entries.push({
        kind: "section",
        number: b.number,
        heading: stripAccent(b.heading),
      });
    } else if (block.type === "subsection") {
      const b = block as SubsectionBlock;
      entries.push({
        kind: "subsection",
        number: "",
        heading: stripAccent(b.heading),
      });
    }
  }

  if (entries.length === 0) {
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
        {mode === "edit" ? "Index — add Sections to populate" : ""}
      </div>
    );
  }

  return (
    <div style={{ margin: "1.5rem 0" }}>
      {entries.map((entry, i) => (
        <div
          // eslint-disable-next-line react/no-array-index-key
          key={i}
          style={{
            display: "flex",
            alignItems: "baseline",
            gap: "0.5rem",
            padding: entry.kind === "section" ? "0.375rem 0" : "0.2rem 0 0.2rem 2rem",
          }}
        >
          {entry.kind === "section" && (
            <span
              style={{
                fontFamily: "var(--font-doc-mono)",
                fontSize: "0.75rem",
                color: "var(--color-mute)",
                minWidth: "2rem",
                flexShrink: 0,
              }}
            >
              {entry.number}
            </span>
          )}
          <span
            style={{
              fontFamily:
                entry.kind === "section" ? "var(--font-doc-serif)" : "var(--font-doc-sans)",
              fontStyle: entry.kind === "section" ? "italic" : "normal",
              fontSize: entry.kind === "section" ? "1rem" : "0.875rem",
              color: "var(--color-ink-deepest)",
              flexShrink: 0,
            }}
          >
            {entry.heading}
          </span>
          <div
            style={{
              flex: 1,
              borderBottom: "1px dotted var(--color-rule)",
              marginBottom: "0.2em",
              minWidth: "1rem",
            }}
          />
        </div>
      ))}
    </div>
  );
}

export const indexBlock: BlockDefinition<"index"> = {
  type: "index",
  label: "Index",
  category: "structural",
  iconName: "BookOpen",
  schema: IndexSchema,
  factory: (over) => ({ ...baseFields("index"), ...over }),
  Renderer: IndexRenderer,
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
      Index (auto-generated from Sections)
    </div>
  ),
  serialize: (): RootContent[] => {
    const dir: LeafDirective = {
      type: "leafDirective",
      name: "index",
      attributes: {},
      children: [],
    };
    return [dir as unknown as RootContent];
  },
  deserialize: (node, ctx) => {
    if (node.type !== "leafDirective") return null;
    const d = node as LeafDirective;
    if (d.name !== "index") return null;
    return { ...ctx.newBlockBase("index") };
  },
};
