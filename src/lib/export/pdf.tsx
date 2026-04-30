import { Document, Font, Image, Page, StyleSheet, Text, View, pdf } from "@react-pdf/renderer";
import type { OhmyDocument, BrandingProfile } from "@/types/schemas";
import type {
  Block,
  CalloutBlock,
  CalloutVariant,
  CodeBlock,
  CoverBlock,
  FooterBarBlock,
  GlossaryEntryBlock,
  HeaderBarBlock,
  ImageBlock,
  ListBlock,
  MetadataGridBlock,
  MonoLabelBlock,
  ParagraphBlock,
  QuoteBlock,
  SectionBlock,
  SignatureBlock,
  SpacerBlock,
  SpacerSize,
  SubsectionBlock,
  TableBlock,
} from "@/blocks/types";

// --- Font registration --------------------------------------------------------
// Fonts served via jsDelivr @fontsource CDN — direct .woff2 URLs (not CSS).
const CDN = "https://cdn.jsdelivr.net/npm";

Font.register({
  family: "Playfair Display",
  fonts: [
    { src: `${CDN}/@fontsource/playfair-display@5/files/playfair-display-latin-400-normal.woff2` },
    {
      src: `${CDN}/@fontsource/playfair-display@5/files/playfair-display-latin-400-italic.woff2`,
      fontStyle: "italic",
    },
    {
      src: `${CDN}/@fontsource/playfair-display@5/files/playfair-display-latin-700-normal.woff2`,
      fontWeight: 700,
    },
    {
      src: `${CDN}/@fontsource/playfair-display@5/files/playfair-display-latin-700-italic.woff2`,
      fontWeight: 700,
      fontStyle: "italic",
    },
  ],
});

Font.register({
  family: "Inter",
  fonts: [
    { src: `${CDN}/@fontsource/inter@4/files/inter-latin-400-normal.woff2` },
    {
      src: `${CDN}/@fontsource/inter@4/files/inter-latin-400-normal.woff2`,
      fontStyle: "italic",
    },
    { src: `${CDN}/@fontsource/inter@4/files/inter-latin-500-normal.woff2`, fontWeight: 500 },
    {
      src: `${CDN}/@fontsource/inter@4/files/inter-latin-500-normal.woff2`,
      fontWeight: 500,
      fontStyle: "italic",
    },
    { src: `${CDN}/@fontsource/inter@4/files/inter-latin-600-normal.woff2`, fontWeight: 600 },
    {
      src: `${CDN}/@fontsource/inter@4/files/inter-latin-600-normal.woff2`,
      fontWeight: 600,
      fontStyle: "italic",
    },
    { src: `${CDN}/@fontsource/inter@4/files/inter-latin-700-normal.woff2`, fontWeight: 700 },
    {
      src: `${CDN}/@fontsource/inter@4/files/inter-latin-700-normal.woff2`,
      fontWeight: 700,
      fontStyle: "italic",
    },
  ],
});

Font.register({
  family: "IBM Plex Mono",
  fonts: [
    { src: `${CDN}/@fontsource/ibm-plex-mono@5/files/ibm-plex-mono-latin-400-normal.woff2` },
    {
      src: `${CDN}/@fontsource/ibm-plex-mono@5/files/ibm-plex-mono-latin-400-normal.woff2`,
      fontStyle: "italic",
    },
    {
      src: `${CDN}/@fontsource/ibm-plex-mono@5/files/ibm-plex-mono-latin-500-normal.woff2`,
      fontWeight: 500,
    },
    {
      src: `${CDN}/@fontsource/ibm-plex-mono@5/files/ibm-plex-mono-latin-500-normal.woff2`,
      fontWeight: 500,
      fontStyle: "italic",
    },
  ],
});

// --- Style factory ------------------------------------------------------------
// All sizes in pt. Page padding = 72pt = 1 inch (US Letter standard margin).

type Palette = BrandingProfile["palette"];

function makeStyles(p: Palette) {
  return StyleSheet.create({
    page: {
      fontFamily: "Inter",
      fontSize: 12,
      color: p["ink-deepest"],
      backgroundColor: p.paper,
      paddingTop: 72,
      paddingBottom: 72,
      paddingLeft: 72,
      paddingRight: 72,
      lineHeight: 1.65,
    },

    // Cover
    cover: {
      backgroundColor: p["ink-deepest"],
      paddingTop: 48,
      paddingLeft: 48,
      paddingRight: 48,
      paddingBottom: 48,
      marginBottom: 36,
      borderRadius: 4,
    },
    coverLabel: {
      fontFamily: "IBM Plex Mono",
      fontSize: 9,
      color: p.accent,
      textTransform: "uppercase",
      marginBottom: 32,
    },
    coverTitle: {
      fontFamily: "Playfair Display",
      fontStyle: "italic",
      fontSize: 44,
      color: p.paper,
      lineHeight: 1.05,
      marginBottom: 24,
    },
    coverCalloutBar: {
      borderLeftWidth: 3,
      borderLeftColor: p.accent,
      borderStyle: "solid",
      paddingLeft: 12,
      marginTop: 16,
    },
    coverCalloutText: {
      fontFamily: "Playfair Display",
      fontSize: 11,
      color: p["ink-on-dark"],
      fontStyle: "italic",
    },
    coverMetaGrid: {
      flexDirection: "row",
      flexWrap: "wrap",
      marginTop: 32,
    },
    coverMetaCell: {
      width: "48%",
      marginBottom: 12,
      marginRight: 8,
    },
    coverMetaLabel: {
      fontFamily: "IBM Plex Mono",
      fontSize: 8,
      color: p.mute,
      textTransform: "uppercase",
      marginBottom: 2,
    },
    coverMetaValue: {
      fontSize: 11,
      color: p["ink-on-dark"],
    },

    // Section (wrap=false keeps heading + lead on the same page)
    section: {
      marginTop: 36,
      marginBottom: 18,
    },
    sectionNumber: {
      fontFamily: "IBM Plex Mono",
      fontSize: 9,
      color: p.mute,
      textTransform: "uppercase",
      marginBottom: 6,
    },
    sectionHeading: {
      fontFamily: "Playfair Display",
      fontStyle: "italic",
      fontSize: 30,
      color: p["ink-deepest"],
      lineHeight: 1.1,
      marginBottom: 8,
    },
    sectionLead: {
      fontFamily: "Playfair Display",
      fontStyle: "italic",
      fontSize: 13.5,
      color: p.mute,
      lineHeight: 1.55,
    },

    // Subsection
    subsection: {
      marginTop: 24,
      marginBottom: 8,
    },
    subsectionHeading: {
      fontFamily: "Playfair Display",
      fontStyle: "italic",
      fontSize: 21,
      color: p["ink-deepest"],
      lineHeight: 1.15,
    },

    // Mono label
    monoLabel: {
      fontFamily: "IBM Plex Mono",
      fontSize: 9,
      fontWeight: 500,
      textTransform: "uppercase",
      color: p["ink-deep"],
      marginBottom: 8,
      marginTop: 8,
    },

    // Paragraph
    paragraph: {
      fontSize: 12,
      lineHeight: 1.65,
      marginBottom: 14,
    },

    // Callout
    calloutBase: {
      paddingTop: 12,
      paddingBottom: 12,
      paddingLeft: 16,
      paddingRight: 16,
      borderRadius: 4,
      marginTop: 14,
      marginBottom: 14,
      borderLeftWidth: 3,
      borderStyle: "solid",
    },
    calloutLabel: {
      fontFamily: "IBM Plex Mono",
      fontSize: 8,
      fontWeight: 500,
      textTransform: "uppercase",
      color: p["ink-deep"],
      marginBottom: 6,
    },
    calloutBody: {
      fontSize: 11,
      lineHeight: 1.6,
    },

    // Code block
    codeBlock: {
      backgroundColor: p["paper-soft"],
      borderRadius: 4,
      paddingTop: 10,
      paddingBottom: 10,
      paddingLeft: 14,
      paddingRight: 14,
      marginTop: 10,
      marginBottom: 14,
    },
    codeLanguage: {
      fontFamily: "IBM Plex Mono",
      fontSize: 8,
      color: p.mute,
      textTransform: "uppercase",
      marginBottom: 6,
    },
    codeContent: {
      fontFamily: "IBM Plex Mono",
      fontSize: 10,
      lineHeight: 1.5,
      color: p["ink-deep"],
    },

    // Divider
    divider: {
      borderBottomWidth: 1,
      borderBottomColor: p.rule,
      borderStyle: "solid",
      marginTop: 24,
      marginBottom: 24,
    },

    // List
    listContainer: {
      marginBottom: 14,
    },
    listItem: {
      flexDirection: "row",
      marginBottom: 5,
    },
    listBullet: {
      width: 16,
      fontSize: 12,
      color: p.accent,
    },
    listText: {
      flex: 1,
      fontSize: 12,
      lineHeight: 1.65,
    },

    // Table
    tableContainer: {
      marginTop: 10,
      marginBottom: 14,
    },
    tableHeaderRow: {
      flexDirection: "row",
      borderBottomWidth: 2,
      borderBottomColor: p["ink-deep"],
      borderStyle: "solid",
      backgroundColor: p["paper-soft"],
      paddingTop: 4,
      paddingBottom: 4,
    },
    tableRow: {
      flexDirection: "row",
      borderBottomWidth: 1,
      borderBottomColor: p.rule,
      borderStyle: "solid",
      paddingTop: 4,
      paddingBottom: 4,
    },
    tableHeaderCell: {
      flex: 1,
      paddingLeft: 8,
      paddingRight: 8,
      fontFamily: "IBM Plex Mono",
      fontSize: 9,
      fontWeight: 500,
      textTransform: "uppercase",
      color: p["ink-deep"],
    },
    tableCell: {
      flex: 1,
      paddingLeft: 8,
      paddingRight: 8,
      fontSize: 11,
    },

    // Quote
    quote: {
      borderLeftWidth: 3,
      borderLeftColor: p.rule,
      borderStyle: "solid",
      paddingLeft: 16,
      paddingTop: 4,
      paddingBottom: 4,
      marginTop: 14,
      marginBottom: 14,
    },
    quoteText: {
      fontFamily: "Playfair Display",
      fontStyle: "italic",
      fontSize: 13.5,
      color: p["ink-deep"],
      lineHeight: 1.55,
    },
    quoteAttribution: {
      fontFamily: "IBM Plex Mono",
      fontSize: 9,
      color: p.mute,
      textTransform: "uppercase",
      marginTop: 6,
    },

    // Metadata grid
    metaContainer: {
      marginTop: 10,
      marginBottom: 14,
    },
    metaRow: {
      flexDirection: "row",
      borderBottomWidth: 1,
      borderBottomColor: p.rule,
      borderStyle: "solid",
      paddingTop: 6,
      paddingBottom: 6,
    },
    metaLabel: {
      fontFamily: "IBM Plex Mono",
      fontSize: 9,
      color: p.mute,
      textTransform: "uppercase",
      width: "40%",
    },
    metaValue: {
      flex: 1,
      fontSize: 11,
      color: p["ink-deepest"],
    },

    // Glossary
    glossaryEntry: {
      marginBottom: 12,
    },
    glossaryTerm: {
      fontFamily: "IBM Plex Mono",
      fontSize: 10,
      fontWeight: 500,
      color: p["ink-deepest"],
      marginBottom: 2,
    },
    glossaryExpansion: {
      fontSize: 12,
      color: p["ink-deep"],
      marginBottom: 2,
    },
    glossaryContext: {
      fontFamily: "Playfair Display",
      fontSize: 10,
      color: p.mute,
      fontStyle: "italic",
    },

    // Signature block
    signatureRow: {
      flexDirection: "row",
      flexWrap: "wrap",
      marginTop: 12,
      marginBottom: 14,
    },
    signatureSlot: {
      width: "30%",
      marginRight: 12,
      borderTopWidth: 1,
      borderTopColor: p["ink-deep"],
      borderStyle: "solid",
      paddingTop: 8,
      marginTop: 8,
    },
    signatureName: {
      fontSize: 11,
      fontWeight: 500,
      color: p["ink-deepest"],
    },
    signatureRole: {
      fontFamily: "IBM Plex Mono",
      fontSize: 9,
      color: p.mute,
      textTransform: "uppercase",
      marginTop: 2,
    },
    signatureDesc: {
      fontSize: 10,
      color: p.mute,
      marginTop: 2,
    },

    // Header / footer bars
    headerBar: {
      flexDirection: "row",
      justifyContent: "space-between",
      borderBottomWidth: 1,
      borderBottomColor: p.rule,
      borderStyle: "solid",
      paddingBottom: 8,
      marginBottom: 16,
    },
    footerBar: {
      flexDirection: "row",
      justifyContent: "space-between",
      borderTopWidth: 1,
      borderTopColor: p.rule,
      borderStyle: "solid",
      paddingTop: 8,
      marginTop: 16,
    },
    barText: {
      fontFamily: "IBM Plex Mono",
      fontSize: 8,
      color: p.mute,
      textTransform: "uppercase",
    },

    // Index (table of contents)
    indexContainer: {
      marginTop: 10,
      marginBottom: 14,
    },
    indexTitle: {
      fontFamily: "Playfair Display",
      fontStyle: "italic",
      fontSize: 21,
      color: p["ink-deepest"],
      marginBottom: 16,
    },
    indexEntry: {
      flexDirection: "row",
      justifyContent: "space-between",
      borderBottomWidth: 1,
      borderBottomColor: p.rule,
      borderStyle: "solid",
      paddingTop: 6,
      paddingBottom: 6,
    },
    indexEntryLabel: {
      fontFamily: "IBM Plex Mono",
      fontSize: 9,
      color: p.mute,
      textTransform: "uppercase",
      marginRight: 8,
      paddingTop: 2,
    },
    indexEntryText: {
      flex: 1,
      fontSize: 12,
      color: p["ink-deepest"],
    },
  });
}

type S = ReturnType<typeof makeStyles>;

// --- Block renderers ----------------------------------------------------------

const calloutColors: Record<CalloutVariant, { border: string; bg: string }> = {
  info: { border: "#5BA4CF", bg: "#EBF5FB" },
  warning: { border: "#D9A441", bg: "#FDF6E3" },
  danger: { border: "#C0556B", bg: "#FDECEA" },
  success: { border: "#5A9F7B", bg: "#EBF5EF" },
};

const spacerHeights: Record<SpacerSize, number> = {
  xs: 8,
  sm: 16,
  md: 32,
  lg: 48,
  xl: 72,
};

function CoverPDF({ block, s }: { block: CoverBlock; s: S }) {
  return (
    <View style={s.cover} wrap={false}>
      {block.label ? <Text style={s.coverLabel}>{block.label}</Text> : null}
      <Text style={s.coverTitle}>{block.title}</Text>
      {block.callout ? (
        <View style={s.coverCalloutBar}>
          <Text style={s.coverCalloutText}>{block.callout}</Text>
        </View>
      ) : null}
      {block.metadata.length > 0 ? (
        <View style={s.coverMetaGrid}>
          {block.metadata.map((pair, i) => (
            <View key={i} style={s.coverMetaCell}>
              <Text style={s.coverMetaLabel}>{pair.label}</Text>
              <Text style={s.coverMetaValue}>{pair.value}</Text>
            </View>
          ))}
        </View>
      ) : null}
    </View>
  );
}

function SectionPDF({ block, s }: { block: SectionBlock; s: S }) {
  return (
    // wrap=false keeps the number + heading + lead together — no orphaned headings
    <View style={s.section} wrap={false}>
      {block.number ? <Text style={s.sectionNumber}>{block.number}</Text> : null}
      <Text style={s.sectionHeading}>{block.heading}</Text>
      {block.lead ? <Text style={s.sectionLead}>{block.lead}</Text> : null}
    </View>
  );
}

function SubsectionPDF({ block, s }: { block: SubsectionBlock; s: S }) {
  return (
    <View style={s.subsection} wrap={false}>
      <Text style={s.subsectionHeading}>{block.heading}</Text>
    </View>
  );
}

function MonoLabelPDF({ block, s }: { block: MonoLabelBlock; s: S }) {
  return <Text style={s.monoLabel}>{block.text}</Text>;
}

function ParagraphPDF({ block, s }: { block: ParagraphBlock; s: S }) {
  return <Text style={[s.paragraph, { textAlign: block.align ?? "left" }]}>{block.text}</Text>;
}

function CalloutPDF({ block, s }: { block: CalloutBlock; s: S }) {
  const c = calloutColors[block.variant];
  return (
    <View
      style={[s.calloutBase, { borderLeftColor: c.border, backgroundColor: c.bg }]}
      wrap={false}
    >
      {block.label ? <Text style={s.calloutLabel}>{block.label}</Text> : null}
      <Text style={[s.calloutBody, { textAlign: block.align ?? "left" }]}>{block.body}</Text>
    </View>
  );
}

function CodeBlockPDF({ block, s }: { block: CodeBlock; s: S }) {
  return (
    <View style={s.codeBlock} wrap={false}>
      {block.language ? <Text style={s.codeLanguage}>{block.language}</Text> : null}
      <Text style={s.codeContent}>{block.code}</Text>
    </View>
  );
}

function ListPDF({ block, s }: { block: ListBlock; s: S }) {
  return (
    <View style={s.listContainer}>
      {block.items.map((item, i) => (
        <View key={i} style={s.listItem}>
          <Text style={s.listBullet}>{block.ordered ? `${i + 1}.` : "•"}</Text>
          <Text style={[s.listText, { textAlign: block.align ?? "left" }]}>{item}</Text>
        </View>
      ))}
    </View>
  );
}

function TablePDF({ block, s }: { block: TableBlock; s: S }) {
  return (
    <View style={s.tableContainer}>
      <View style={s.tableHeaderRow}>
        {block.headers.map((h, i) => (
          <Text key={i} style={s.tableHeaderCell}>
            {h}
          </Text>
        ))}
      </View>
      {block.rows.map((row, ri) => (
        <View key={ri} style={s.tableRow} wrap={false}>
          {row.map((cell, ci) => (
            <Text key={ci} style={s.tableCell}>
              {cell}
            </Text>
          ))}
        </View>
      ))}
    </View>
  );
}

function MetadataGridPDF({ block, s }: { block: MetadataGridBlock; s: S }) {
  return (
    <View style={s.metaContainer}>
      {block.entries.map((entry, i) => (
        <View key={i} style={s.metaRow} wrap={false}>
          <Text style={s.metaLabel}>{entry.label}</Text>
          <Text style={s.metaValue}>{entry.value}</Text>
        </View>
      ))}
    </View>
  );
}

function ImagePDF({ block }: { block: ImageBlock }) {
  if (!block.src) return null;
  return (
    <View style={{ marginTop: 10, marginBottom: 14 }}>
      <Image src={block.src} style={{ borderRadius: block.bordered ? 4 : 0, maxWidth: "100%" }} />
      {block.caption ? (
        <Text
          style={{
            fontFamily: "IBM Plex Mono",
            fontSize: 9,
            color: "#888",
            marginTop: 6,
          }}
        >
          {block.caption}
        </Text>
      ) : null}
    </View>
  );
}

function QuotePDF({ block, s }: { block: QuoteBlock; s: S }) {
  return (
    <View
      style={[s.quote, { alignItems: block.align === "center" ? "center" : "flex-start" }]}
      wrap={false}
    >
      <Text style={[s.quoteText, { textAlign: block.align ?? "left" }]}>{block.text}</Text>
      {block.attribution ? (
        <Text style={[s.quoteAttribution, { textAlign: block.align ?? "left" }]}>
          {block.attribution}
        </Text>
      ) : null}
    </View>
  );
}

function GlossaryPDF({ block, s }: { block: GlossaryEntryBlock; s: S }) {
  return (
    <View style={{ marginBottom: 14 }}>
      {block.entries.map((entry, i) => (
        <View key={i} style={s.glossaryEntry} wrap={false}>
          <Text style={s.glossaryTerm}>{entry.term}</Text>
          <Text style={s.glossaryExpansion}>{entry.expansion}</Text>
          {entry.context ? <Text style={s.glossaryContext}>{entry.context}</Text> : null}
        </View>
      ))}
    </View>
  );
}

function SignaturePDF({ block, s }: { block: SignatureBlock; s: S }) {
  return (
    <View style={s.signatureRow}>
      {block.slots.map((slot, i) => (
        <View key={i} style={s.signatureSlot}>
          <Text style={s.signatureName}>{slot.name}</Text>
          <Text style={s.signatureRole}>{slot.role}</Text>
          {slot.description ? <Text style={s.signatureDesc}>{slot.description}</Text> : null}
        </View>
      ))}
    </View>
  );
}

function HeaderBarPDF({ block, s }: { block: HeaderBarBlock; s: S }) {
  return (
    <View style={s.headerBar}>
      <Text style={s.barText}>{block.left}</Text>
      <Text style={s.barText}>{block.right}</Text>
    </View>
  );
}

function FooterBarPDF({ block, s }: { block: FooterBarBlock; s: S }) {
  return (
    <View style={s.footerBar}>
      <Text style={s.barText}>{block.left}</Text>
      <Text style={s.barText}>{block.right}</Text>
    </View>
  );
}

function IndexPDF({ allBlocks, s }: { allBlocks: Block[]; s: S }) {
  const sections = allBlocks.filter((b): b is SectionBlock => b.type === "section");
  return (
    <View style={s.indexContainer}>
      <Text style={s.indexTitle}>Contents</Text>
      {sections.map((sec, i) => (
        <View key={i} style={s.indexEntry} wrap={false}>
          <Text style={s.indexEntryLabel}>{sec.number}</Text>
          <Text style={s.indexEntryText}>{sec.heading}</Text>
        </View>
      ))}
    </View>
  );
}

function SpacerPDF({ block }: { block: SpacerBlock }) {
  return <View style={{ height: spacerHeights[block.size] }} />;
}

// --- Block dispatcher ---------------------------------------------------------

function BlockPDF({ block, allBlocks, s }: { block: Block; allBlocks: Block[]; s: S }) {
  switch (block.type) {
    case "cover":
      return <CoverPDF block={block} s={s} />;
    case "section":
      return <SectionPDF block={block} s={s} />;
    case "subsection":
      return <SubsectionPDF block={block} s={s} />;
    case "mono-label":
      return <MonoLabelPDF block={block} s={s} />;
    case "paragraph":
      return <ParagraphPDF block={block} s={s} />;
    case "callout":
      return <CalloutPDF block={block} s={s} />;
    case "code-block":
      return <CodeBlockPDF block={block} s={s} />;
    case "divider":
      return <View style={s.divider} />;
    case "list":
      return <ListPDF block={block} s={s} />;
    case "table":
      return <TablePDF block={block} s={s} />;
    case "metadata-grid":
      return <MetadataGridPDF block={block} s={s} />;
    case "image":
      return <ImagePDF block={block} />;
    case "quote":
      return <QuotePDF block={block} s={s} />;
    case "glossary-entry":
      return <GlossaryPDF block={block} s={s} />;
    case "signature-block":
      return <SignaturePDF block={block} s={s} />;
    case "header-bar":
      return <HeaderBarPDF block={block} s={s} />;
    case "footer-bar":
      return <FooterBarPDF block={block} s={s} />;
    case "page-break":
      return <View break />;
    case "index":
      return <IndexPDF allBlocks={allBlocks} s={s} />;
    case "spacer":
      return <SpacerPDF block={block} />;
  }
}

// --- Document root ------------------------------------------------------------

function DocumentPDF({ doc, branding }: { doc: OhmyDocument; branding: BrandingProfile }) {
  const blocks = doc.blocks as Block[];
  const s = makeStyles(branding.palette);

  return (
    <Document title={doc.title} author="OhMyDocs">
      <Page size="LETTER" style={s.page}>
        {blocks.map((block) => (
          <BlockPDF key={block.id} block={block} allBlocks={blocks} s={s} />
        ))}
      </Page>
    </Document>
  );
}

// --- Public API ---------------------------------------------------------------

export async function exportToPdf(doc: OhmyDocument, branding: BrandingProfile): Promise<Blob> {
  return pdf(<DocumentPDF doc={doc} branding={branding} />).toBlob();
}
