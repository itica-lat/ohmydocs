/**
 * Discriminated union for all blocks. Each block module also exports a Zod schema
 * that validates its own payload. The base type is shared.
 */

export interface BaseBlock<T extends string> {
  id: string;
  type: T;
  createdAt: string;
  updatedAt: string;
}

export type MetaPair = {
  label: string;
  value: string;
};

export type CoverBlock = BaseBlock<"cover"> & {
  label: string;
  title: string;
  highlightWord: string;
  metadata: MetaPair[];
  callout: string | null;
};

export type SectionBlock = BaseBlock<"section"> & {
  number: string;
  heading: string;
  lead: string;
  align?: TextAlign | undefined;
};

export type SubsectionBlock = BaseBlock<"subsection"> & {
  heading: string;
  align?: TextAlign | undefined;
};

export type MonoLabelBlock = BaseBlock<"mono-label"> & {
  text: string;
  align?: TextAlign | undefined;
};

export type TextAlign = "left" | "center" | "right" | "justify";

export type ParagraphBlock = BaseBlock<"paragraph"> & {
  text: string;
  align?: TextAlign | undefined;
};

export type CalloutVariant = "info" | "warning" | "danger" | "success";

export type CalloutBlock = BaseBlock<"callout"> & {
  variant: CalloutVariant;
  label: string;
  body: string;
  align?: TextAlign | undefined;
};

export type CodeBlock = BaseBlock<"code-block"> & {
  language: string;
  code: string;
};

export type DividerBlock = BaseBlock<"divider">;

export type ListBlock = BaseBlock<"list"> & {
  ordered: boolean;
  items: string[];
  align?: TextAlign | undefined;
};

export type TableBlock = BaseBlock<"table"> & {
  headers: string[];
  rows: string[][];
};

export type MetadataGridBlock = BaseBlock<"metadata-grid"> & {
  entries: MetaPair[];
};

export type ImageBlock = BaseBlock<"image"> & {
  src: string;
  alt: string;
  caption: string;
  bordered: boolean;
};

export type QuoteBlock = BaseBlock<"quote"> & {
  text: string;
  attribution: string;
  align?: TextAlign | undefined;
};

export type GlossaryEntry = {
  term: string;
  expansion: string;
  context: string;
};

export type GlossaryEntryBlock = BaseBlock<"glossary-entry"> & {
  entries: GlossaryEntry[];
};

export type SignatureSlot = {
  name: string;
  role: string;
  description: string;
};

export type SignatureBlock = BaseBlock<"signature-block"> & {
  slots: SignatureSlot[];
};

export type HeaderBarBlock = BaseBlock<"header-bar"> & {
  left: string;
  right: string;
};

export type FooterBarBlock = BaseBlock<"footer-bar"> & {
  left: string;
  right: string;
};

export type PageBreakBlock = BaseBlock<"page-break">;

export type IndexBlock = BaseBlock<"index">;

export type SpacerSize = "xs" | "sm" | "md" | "lg" | "xl";

export type SpacerBlock = BaseBlock<"spacer"> & {
  size: SpacerSize;
};

export type ReferenceListBlock = BaseBlock<"reference-list">;

export type Block =
  | CoverBlock
  | SectionBlock
  | SubsectionBlock
  | MonoLabelBlock
  | ParagraphBlock
  | CalloutBlock
  | CodeBlock
  | DividerBlock
  | ListBlock
  | TableBlock
  | MetadataGridBlock
  | ImageBlock
  | QuoteBlock
  | GlossaryEntryBlock
  | SignatureBlock
  | HeaderBarBlock
  | FooterBarBlock
  | PageBreakBlock
  | IndexBlock
  | SpacerBlock
  | ReferenceListBlock;

export type BlockType = Block["type"];
export type BlockOf<T extends BlockType> = Extract<Block, { type: T }>;
