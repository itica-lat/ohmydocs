import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";

// ─── Block schema definitions (extracted from src/blocks/) ──────────────
// Each entry describes the block shape, properties, and usage context.

const BLOCK_SCHEMAS = {
  cover: {
    type: "cover",
    label: "Cover",
    category: "structural",
    icon: "BookOpen",
    description:
      "Document cover page with label, title with accent highlight, metadata pairs, and optional callout.",
    properties: {
      label: {
        type: "string",
        description:
          "Document type label (e.g. 'ADMINISTRATION OF OPERATING SYSTEMS · FIRST DELIVERY')",
      },
      title: {
        type: "string",
        description:
          "Main title. Use *word* syntax to highlight a word in accent color (e.g. 'Management and administration *of operating system packages*')",
      },
      highlightWord: {
        type: "string",
        description: "The word inside *asterisks* in title that gets accent-colored",
      },
      metadata: {
        type: "MetaPair[]",
        description:
          "Array of { label, value } pairs shown as metadata rows (e.g. SYSTEM, TEAM, OS, DELIVERY)",
      },
      callout: {
        type: "string | null",
        description: "Optional callout text displayed below metadata",
      },
    },
    usage: "Should be the FIRST block in any formal document. Sets the document's visual identity.",
    markdownDirective: "::cover{label='...' title='...' highlightWord='...'}",
  },
  section: {
    type: "section",
    label: "Section",
    category: "structural",
    icon: "Heading1",
    description:
      "Major section with decorative number, heading with accent highlight, and lead paragraph.",
    properties: {
      number: {
        type: "string",
        description:
          "Section number (e.g. '01', 'I', 'A'). Displayed as a large decorative numeral.",
      },
      heading: { type: "string", description: "Section heading. Supports *word* accent syntax." },
      lead: { type: "string", description: "Lead paragraph text below heading. Can be empty." },
      align: { type: "'left' | 'center' | 'right' | 'justify'", optional: true },
    },
    usage:
      "Use for top-level document divisions. Each section starts a new logical part of the document.",
    markdownDirective: ":::section{number='01' heading='...' lead='...'}\n:::\n",
  },
  subsection: {
    type: "subsection",
    label: "Subsection",
    category: "structural",
    icon: "Heading2",
    description: "Sub-section heading, lighter weight without numbering or lead paragraph.",
    properties: {
      heading: { type: "string", description: "Subsection heading text." },
      align: { type: "'left' | 'center' | 'right' | 'justify'", optional: true },
    },
    usage: "Use inside a section to break it into sub-topics.",
    markdownDirective: ":::subsection{heading='...'}\n:::\n",
  },
  "mono-label": {
    type: "mono-label",
    label: "Mono label",
    category: "structural",
    icon: "Hash",
    description:
      "A monospace label/tag line, typically used at the top of documents as a classification tag.",
    properties: {
      text: { type: "string", description: "Monospace label text (e.g. 'ETERNUM · BRIEF')" },
      align: { type: "'left' | 'center' | 'right' | 'justify'", optional: true },
    },
    usage: "Useful as a document category indicator (e.g. DRAFT, INTERNAL, CONFIDENTIAL).",
    markdownDirective: "::mono-label{text='ETERNUM · BRIEF'}",
  },
  paragraph: {
    type: "paragraph",
    label: "Paragraph",
    category: "content",
    icon: "Type",
    description: "Standard body text paragraph. The most common block type for prose content.",
    properties: {
      text: { type: "string", description: "Paragraph body text." },
      align: { type: "'left' | 'center' | 'right' | 'justify'", optional: true },
    },
    usage: "Use for body text, explanations, descriptions, and narrative content.",
    markdownDirective: "::paragraph{text='...'}",
  },
  callout: {
    type: "callout",
    label: "Callout",
    category: "content",
    icon: "AlertCircle",
    description:
      "Highlighted callout box with variant styling. Can be info, warning, danger, or success.",
    properties: {
      variant: {
        type: "'info' | 'warning' | 'danger' | 'success'",
        description: "Visual variant determining color scheme",
      },
      label: { type: "string", description: "Callout header label (e.g. 'NOTE', 'WARNING')" },
      body: { type: "string", description: "Callout body text." },
      align: { type: "'left' | 'center' | 'right' | 'justify'", optional: true },
    },
    usage:
      "Use for important notes, warnings, tips, or side information that stands out from body text.",
    markdownDirective: ":::callout{variant='info' label='NOTE' body='...'}\n:::\n",
  },
  "code-block": {
    type: "code-block",
    label: "Code",
    category: "content",
    icon: "Code",
    description: "Syntax-highlighted code block with language label.",
    properties: {
      language: {
        type: "string",
        description: "Programming language (e.g. 'bash', 'typescript', 'python', 'yaml')",
      },
      code: { type: "string", description: "The source code content." },
    },
    usage: "Use for code snippets, configuration files, terminal commands.",
    markdownDirective: ":::code-block{language='bash' code='...'}\n:::\n",
  },
  divider: {
    type: "divider",
    label: "Divider",
    category: "structural",
    icon: "Minus",
    description: "Horizontal rule / thematic break between sections.",
    properties: {},
    usage: "Use to visually separate content sections without a heading.",
    markdownDirective: "::divider",
  },
  list: {
    type: "list",
    label: "List",
    category: "content",
    icon: "List",
    description: "Ordered or unordered list of items.",
    properties: {
      ordered: { type: "boolean", description: "True for numbered list, false for bullet list" },
      items: { type: "string[]", description: "Array of list item texts." },
      align: { type: "'left' | 'center' | 'right' | 'justify'", optional: true },
    },
    usage: "Use for enumerating items, steps, or bullet points.",
    markdownDirective: ":::list{ordered=true items=['Item 1','Item 2']}\n:::\n",
  },
  table: {
    type: "table",
    label: "Table",
    category: "data",
    icon: "Table",
    description: "Data table with header row and body rows.",
    properties: {
      headers: { type: "string[]", description: "Column header labels." },
      rows: {
        type: "string[][]",
        description: "Array of rows, each row is an array of cell values.",
      },
    },
    usage: "Use for structured data, comparisons, specifications.",
    markdownDirective: ":::table{headers=['Col1','Col2'] rows=[['A','B']]}\n:::\n",
  },
  "metadata-grid": {
    type: "metadata-grid",
    label: "Metadata grid",
    category: "data",
    icon: "Grid3x3",
    description: "Grid of key-value metadata pairs, typically on cover or final pages.",
    properties: {
      entries: { type: "MetaPair[]", description: "Array of { label, value } pairs." },
    },
    usage: "Use for showing document metadata (dates, versions, authors).",
    markdownDirective: ":::metadata-grid{entries=[{label='Version',value='1.0'}]}\n:::\n",
  },
  image: {
    type: "image",
    label: "Image",
    category: "media",
    icon: "Image",
    description: "Embedded image with optional caption and border.",
    properties: {
      src: { type: "string", description: "Image source URL or data URI." },
      alt: { type: "string", description: "Alternative text." },
      caption: { type: "string", description: "Image caption displayed below." },
      bordered: { type: "boolean", description: "Whether to show a border around the image." },
      width: { type: "25 | 50 | 75 | 100", description: "Width percentage of the page." },
    },
    usage: "Use for diagrams, screenshots, illustrations.",
    markdownDirective: "::image{src='...' alt='...' caption='...' bordered=false width=100}",
  },
  quote: {
    type: "quote",
    label: "Quote",
    category: "content",
    icon: "Quote",
    description: "Blockquote with attribution.",
    properties: {
      text: { type: "string", description: "Quoted text." },
      attribution: { type: "string", description: "Source attribution / author." },
      align: { type: "'left' | 'center' | 'right' | 'justify'", optional: true },
    },
    usage: "Use for cited material, testimonials, highlighted excerpts.",
    markdownDirective: ":::quote{text='...' attribution='Source'}\n:::\n",
  },
  "glossary-entry": {
    type: "glossary-entry",
    label: "Glossary",
    category: "data",
    icon: "BookMarked",
    description: "Glossary/terminology list with term, expansion, and context.",
    properties: {
      entries: {
        type: "GlossaryEntry[]",
        description: "Array of { term, expansion, context } entries.",
      },
    },
    usage: "Use at the end of documents to define terms and abbreviations.",
    markdownDirective:
      ":::glossary-entry{entries=[{term='API',expansion='Application Programming Interface',context='context description'}]}\n:::\n",
  },
  "signature-block": {
    type: "signature-block",
    label: "Signatures",
    category: "data",
    icon: "PenTool",
    description:
      "Signature block with multiple signatory slots. Each slot has name, role, and description.",
    properties: {
      slots: {
        type: "SignatureSlot[]",
        description: "Array of { name, role, description } signature slots.",
      },
    },
    usage: "Use at the end of formal documents for approvals and sign-offs.",
    markdownDirective:
      ":::signature-block{slots=[{name='',role='TEAM LEAD',description='Operations'}]}\n:::\n",
  },
  "header-bar": {
    type: "header-bar",
    label: "Header bar",
    category: "structural",
    icon: "PanelTop",
    description: "Document header bar shown at the top of each page with left/right text.",
    properties: {
      left: { type: "string", description: "Left-aligned header text." },
      right: { type: "string", description: "Right-aligned header text." },
    },
    usage: "Place after cover or at section starts. Repeats in PDF export headers.",
    markdownDirective: "::header-bar{left='ETERNUM' right='CONTEXT'}",
  },
  "footer-bar": {
    type: "footer-bar",
    label: "Footer bar",
    category: "structural",
    icon: "PanelBottom",
    description: "Document footer bar shown at the bottom of each page with left/right text.",
    properties: {
      left: { type: "string", description: "Left-aligned footer text." },
      right: { type: "string", description: "Right-aligned footer text." },
    },
    usage: "Place before signatures or at document end. Repeats in PDF export footers.",
    markdownDirective: "::footer-bar{left='ETERNUM TEAM' right='INTERNAL'}",
  },
  "page-break": {
    type: "page-break",
    label: "Page break",
    category: "structural",
    icon: "SeparatorHorizontal",
    description: "Forces a page break in PDF export.",
    properties: {},
    usage: "Use to control pagination in PDF output.",
    markdownDirective: "::page-break",
  },
  index: {
    type: "index",
    label: "Index auto",
    category: "structural",
    icon: "BookUp",
    description: "Automatically generated table of contents / index.",
    properties: {},
    usage: "Auto-generates a TOC from section/subsection headings in the document.",
    markdownDirective: "::index",
  },
  spacer: {
    type: "spacer",
    label: "Spacer",
    category: "structural",
    icon: "MoveVertical",
    description: "Vertical spacing block with configurable size.",
    properties: {
      size: {
        type: "'xs' | 'sm' | 'md' | 'lg' | 'xl'",
        description: "Spacer size. xs=1rem, sm=2rem, md=4rem, lg=6rem, xl=10rem",
      },
    },
    usage: "Use to add breathing room between sections.",
    markdownDirective: "::spacer{size='md'}",
  },
  "reference-list": {
    type: "reference-list",
    label: "Reference list",
    category: "data",
    icon: "FileText",
    description: "Automatically generated list of reference links from document content.",
    properties: {},
    usage: "Use at the end of documents to list all referenced documents.",
    markdownDirective: "::reference-list",
  },
} as const;

// ─── Branding schema ────────────────────────────────────────────────────

const BRANDING_CONTEXT = {
  description:
    "Branding profiles define the visual identity of a document: colors, fonts, logo, and banner.",
  paletteTokens: [
    { token: "--color-ink-deepest", description: "Darkest text/ink color (near-black)" },
    { token: "--color-ink-deep", description: "Deep ink color for headings" },
    { token: "--color-accent", description: "Primary accent/highlight color" },
    { token: "--color-accent-soft", description: "Soft variant of accent" },
    { token: "--color-paper", description: "Page background (white)" },
    { token: "--color-paper-soft", description: "Subtle background variant" },
    { token: "--color-rule", description: "Border/rule color" },
    { token: "--color-mute", description: "Muted/secondary text color" },
    { token: "--color-ink-on-dark", description: "Text color for dark backgrounds" },
  ],
  fontCategories: {
    serif: {
      description: "Serif font for document body (e.g. DM Serif Display)",
      default: "DM Serif Display",
    },
    sans: { description: "Sans-serif font for UI and headings (e.g. DM Sans)", default: "DM Sans" },
    mono: { description: "Monospace font for code (e.g. DM Mono)", default: "DM Mono" },
  },
  brandingIdFormat: "branding:<slug>",
  defaultBrandingId: "branding:eternum-default",
  readOnlyProfiles: ["branding:eternum-default"],
} as const;

// ─── Document shape ─────────────────────────────────────────────────────

const DOCUMENT_SHAPE = {
  description: "A complete OhMyDocs document is a JSON object with the following top-level fields.",
  fields: {
    id: { type: "string", description: "Unique document ID (prefix: doc_)", format: "doc_<ulid>" },
    title: { type: "string", description: "Document title" },
    metadata: {
      type: "DocumentMetadata",
      description: "Document metadata including author, team, dates, header/footer config",
      fields: {
        author: { type: "string" },
        team: { type: "string" },
        institution: { type: "string" },
        date: { type: "string", format: "YYYY-MM-DD" },
        customFields: { type: "Record<string, string>" },
        header: {
          type: "HeaderConfig",
          fields: {
            left: "string",
            right: "string",
            showOnFirstPage: "boolean",
            showPageNumber: "boolean",
          },
        },
        footer: {
          type: "FooterConfig",
          fields: {
            left: "string",
            right: "string",
            showOnFirstPage: "boolean",
            showPageNumber: "boolean",
          },
        },
      },
    },
    brandingId: { type: "string", description: "Branding profile ID for visual styling" },
    templateId: { type: "string | null", description: "Template ID if created from a template" },
    blocks: {
      type: "Block[]",
      description: "Ordered array of content blocks. The document content.",
    },
    htmlContent: { type: "string (optional)", description: "Pre-rendered HTML" },
    createdAt: { type: "string", format: "ISO 8601" },
    updatedAt: { type: "string", format: "ISO 8601" },
  },
  blockCategories: [
    {
      category: "structural",
      description: "Document structure (cover, sections, headers, footers)",
      blocks: [
        "cover",
        "section",
        "subsection",
        "mono-label",
        "header-bar",
        "footer-bar",
        "divider",
        "page-break",
        "index",
        "spacer",
      ],
    },
    {
      category: "content",
      description: "Prose content (paragraphs, lists, quotes, code, callouts)",
      blocks: ["paragraph", "callout", "code-block", "list", "quote"],
    },
    {
      category: "data",
      description: "Data displays (tables, metadata, glossary, signatures, references)",
      blocks: ["table", "metadata-grid", "glossary-entry", "signature-block", "reference-list"],
    },
    { category: "media", description: "Media (images)", blocks: ["image"] },
  ],
  typicalDocumentFlow: [
    "1. cover (optional) — title page with metadata",
    "2. header-bar — page header with document info",
    "3. section -> subsection -> paragraph/callout/list... — main content",
    "4. divider or page-break — separation between major parts",
    "5. glossary-entry — term definitions (optional)",
    "6. reference-list — auto-generated references (optional)",
    "7. signature-block — sign-off slots (optional)",
    "8. footer-bar — final page footer",
  ],
  accentSyntax:
    "Use *word* syntax (asterisks) in heading fields (cover.title, section.heading, subsection.heading) to highlight a word in the accent color. The matching field 'highlightWord' on cover or the *word* in section/subsection get accented rendering.",
  idGeneration:
    "Block IDs use prefix 'blk_' with ULID. Document IDs use prefix 'doc_' with ULID. Never construct IDs manually.",
  validation:
    "Documents are validated through Zod schemas at import boundaries. Internal code trusts TypeScript types.",
} as const;

// ─── Resource registration ──────────────────────────────────────────────

export function registerDomainResources(server: McpServer): void {
  // Block schemas: detailed spec for each block type
  server.resource("block-schemas", "ohmydocs://blocks", async (uri) => ({
    contents: [
      {
        uri: uri.href,
        text: JSON.stringify(BLOCK_SCHEMAS, null, 2),
        mimeType: "application/json",
      },
    ],
  }));

  // Branding context
  server.resource("branding-context", "ohmydocs://branding", async (uri) => ({
    contents: [
      {
        uri: uri.href,
        text: JSON.stringify(BRANDING_CONTEXT, null, 2),
        mimeType: "application/json",
      },
    ],
  }));

  // Document shape
  server.resource("document-shape", "ohmydocs://document-shape", async (uri) => ({
    contents: [
      {
        uri: uri.href,
        text: JSON.stringify(DOCUMENT_SHAPE, null, 2),
        mimeType: "application/json",
      },
    ],
  }));

  // Quick reference (all in one)
  server.resource("full-context", "ohmydocs://context", async (uri) => ({
    contents: [
      {
        uri: uri.href,
        text: JSON.stringify(
          {
            blockSchemas: BLOCK_SCHEMAS,
            branding: BRANDING_CONTEXT,
            documentShape: DOCUMENT_SHAPE,
          },
          null,
          2,
        ),
        mimeType: "application/json",
      },
    ],
  }));
}

// Export plain data so tools can use it too
export { BLOCK_SCHEMAS, BRANDING_CONTEXT, DOCUMENT_SHAPE };
