import type { ReactNode } from "react";
import type { Block } from "@/blocks/types";
import type { DocumentNode, DocumentNodeType } from "@/engine/types";
import { getBlockDef } from "@/blocks/registry";
import { usePagination } from "@/engine/usePagination";
import { PageRenderer } from "@/engine/PageRenderer";
import { ReferenceList } from "@/engine/ReferenceList";
import { useReferenceStore } from "@/engine/ReferenceStore";
import { useEffect } from "react";

// ── Block-type to DocumentNode-type mapping ───────────────────────────────────

function blockToNodeType(block: Block): DocumentNodeType {
  switch (block.type) {
    case "section":
    case "subsection":
      return "heading";
    case "paragraph":
    case "quote":
    case "callout":
      return "paragraph";
    case "image":
      return "image";
    case "list":
    case "glossary-entry":
      return "list";
    case "code-block":
      return "code";
    case "divider":
    case "spacer":
    case "page-break":
      return "divider";
    case "reference-list":
      return "reference-list";
    default:
      return "paragraph";
  }
}

function isHeadingBlock(block: Block): boolean {
  return block.type === "section" || block.type === "subsection";
}

// ── Block to DocumentNode converter ──────────────────────────────────────────

function blockToDocumentNode(block: Block, allBlocks: Block[]): DocumentNode {
  const def = getBlockDef(block.type);
  const content: ReactNode = (
    <def.Renderer block={block as never} mode="read" allBlocks={allBlocks} />
  );

  return {
    id: block.id,
    type: blockToNodeType(block),
    content,
    keepWithNext: isHeadingBlock(block),
  };
}

// ── Public component ──────────────────────────────────────────────────────────

export interface DocumentEditorProps {
  blocks: Block[];
  title?: string;
  footer?: ReactNode;
  paginationOptions?: {
    marginTop?: number;
    marginBottom?: number;
    marginLeft?: number;
    marginRight?: number;
    headerHeight?: number;
    footerHeight?: number;
  };
}

/**
 * DocumentEditor
 *
 * Converts the document's Block[] into DocumentNode[], paginates them via the
 * JS pagination engine, and renders the result as a stack of A4 page sheets.
 *
 * The measurement container produced by usePagination is rendered as a hidden
 * sibling of the PageRenderer — it must be in the tree for useLayoutEffect to
 * read DOM heights.
 *
 * Usage:
 *   <DocumentEditor blocks={doc.blocks} title={doc.title} />
 */
export function DocumentEditor({
  blocks,
  title = "",
  footer,
  paginationOptions,
}: DocumentEditorProps) {
  const clear = useReferenceStore((s) => s.clear);

  // Reset the reference store whenever the document changes so reference
  // numbers stay consistent with the current content.
  useEffect(() => {
    clear();
  }, [blocks, clear]);

  // Append a ReferenceList node after all content blocks.
  // It renders from the ReferenceStore populated by <InlineLink> mounts.
  const hasRefList = blocks.some((b) => b.type === "reference-list");

  const nodes: DocumentNode[] = [
    ...blocks.map((b) => blockToDocumentNode(b, blocks)),
    ...(!hasRefList
      ? [
          {
            id: "engine-ref-list",
            type: "reference-list" as DocumentNodeType,
            content: <ReferenceList />,
            keepWithNext: false,
          },
        ]
      : []),
  ];

  const { pages, measurementContainer } = usePagination(nodes, paginationOptions ?? {});

  return (
    <div style={{ position: "relative" }}>
      {/* Hidden measurement container: must be in the tree before PageRenderer */}
      {measurementContainer}
      <PageRenderer pages={pages} title={title} footer={footer} />
    </div>
  );
}
