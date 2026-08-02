# OhMyDocs

> Documents that look like they were designed, not typed.

OhMyDocs is a local-first, offline-capable document editor that produces editorial-grade technical documents. Content is composed from a block system, round-trips through Markdown, and renders with a fully customizable branding profile (palette and fonts). Everything persists in `localStorage` via Zustand, and files are read and written through the File System Access API, with fallbacks for browsers that do not support it. No backend, no account.

The workspace is a three-pane layout: a sidebar with the document list, a preview/editor pane, and a right panel with Metadata, Branding and Templates.

## Features

- **Block-based editing** — 21 block types across structural, content, data and media categories, registered in a type-safe registry
- **Markdown round-trip** — documents serialize to and from Markdown (with YAML frontmatter), including custom block directives
- **Branding profiles** — nine palette tokens and three Google Font families per profile, with WCAG AA contrast warnings; profiles can be cloned and edited
- **Three read-only templates** — instantiate a new document from a seeded template with one click
- **Export** — self-contained HTML (inlined CSS, print-ready `@page` rules, embedded JSON sidecar), Markdown, or raw JSON
- **Import** — re-import HTML snapshots (via the embedded JSON sidecar) or Markdown files
- **Editor conveniences** — `/` opens the add-block menu, block duplication and deletion shortcuts, sortable blocks
- **Local-first persistence** — documents, branding and templates stored in `localStorage` (`ohmydocs:documents`, `ohmydocs:branding`, `ohmydocs:templates`), validated through Zod on hydration

## Tech stack

- React 19 + TypeScript (strict, no unchecked indexing, exact optional property types)
- Vite + `@vitejs/plugin-react-swc`
- TailwindCSS v4 + PostCSS + Autoprefixer
- Zustand v5 with `persist` (localStorage)
- Zod (validation at system boundaries)
- unified + remark-parse + remark-gfm + remark-directive + remark-stringify (Markdown pipeline)
- `@dnd-kit` (sortable blocks)
- `@react-pdf/renderer` (PDF rendering support)
- `lucide-react` (icons)
- OxLint + OxFMT, Husky pre-commit (lint, format, typecheck)

## Getting started

Requires [Bun](https://bun.sh).

```bash
bun install
bun run dev
```

Open [http://localhost:5173](http://localhost:5173).

## Scripts

| Script                 | Purpose                           |
| ---------------------- | --------------------------------- |
| `bun run dev`          | Vite dev server                   |
| `bun run build`        | Type-check + production build     |
| `bun run preview`      | Preview the production build      |
| `bun run lint`         | OxLint                            |
| `bun run lint:fix`     | OxLint with autofix               |
| `bun run format`       | OxFMT (write)                     |
| `bun run format:check` | OxFMT (check, used in pre-commit) |
| `bun run typecheck`    | `tsc -b --noEmit`                 |

## Project layout

```
src/
  app/                 # App shell: Shell, Sidebar, PreviewPane, RightPanel, Landing
  blocks/              # one folder per block type, registered in registry.ts
    <type>/index.tsx   # schema + factory + Renderer + Editor + serialize/deserialize
    types.ts           # discriminated union for all blocks
    registry.ts        # type-safe block lookup
    factory.ts         # baseFields helper
    _shared.tsx        # render helpers (accent word, mdast text)
  features/
    branding/          # branding store + BrandingPanel UI
    editor/            # documents store + BlockList + Toolbar + InsertMenu + shortcuts
    metadata/          # MetadataPanel UI
    templates/         # templates store + defaults + TemplatesPanel UI
    settings/          # UI settings store
    import/            # MD and HTML importers (HTML reads embedded JSON sidecar)
  lib/
    fonts/             # Google Fonts catalog + dynamic <link> loader
    palette/           # defaults + applyBranding + WCAG contrast helpers
    storage/           # localStorage adapter, FS Access API wrapper
    markdown/          # unified pipeline (blocks <-> markdown)
    export/            # HTML and Markdown exporters
    id.ts              # ULID prefixer
  styles/              # tokens.css, typography.css, page.css, print.css, app.css
  types/               # palette tokens, Zod schemas
samples/
  eternum-technical.md # round-trippable sample document
```

## Block model

The block model is a discriminated union exported from `src/blocks/types.ts`. All 21 block types are registered in `src/blocks/registry.ts`:

| Type              | Category   | Folder                    |
| ----------------- | ---------- | ------------------------- |
| `cover`           | structural | `blocks/cover/`           |
| `section`         | structural | `blocks/section/`         |
| `subsection`      | structural | `blocks/subsection/`      |
| `mono-label`      | structural | `blocks/mono-label/`      |
| `header-bar`      | structural | `blocks/header-bar/`      |
| `footer-bar`      | structural | `blocks/footer-bar/`      |
| `divider`         | structural | `blocks/divider/`         |
| `page-break`      | structural | `blocks/page-break/`      |
| `spacer`          | structural | `blocks/spacer/`          |
| `index`           | structural | `blocks/index-block/`     |
| `paragraph`       | content    | `blocks/paragraph/`       |
| `callout`         | content    | `blocks/callout/`         |
| `code-block`      | content    | `blocks/code-block/`      |
| `list`            | content    | `blocks/list/`            |
| `quote`           | content    | `blocks/quote/`           |
| `reference-list`  | content    | `blocks/reference-list/`  |
| `table`           | data       | `blocks/table/`           |
| `metadata-grid`   | data       | `blocks/metadata-grid/`   |
| `glossary-entry`  | data       | `blocks/glossary-entry/`  |
| `signature-block` | data       | `blocks/signature-block/` |
| `image`           | media      | `blocks/image/`           |

Each block module exports a `BlockDefinition<T>` containing schema, factory, Renderer, Editor, serialize and deserialize, consolidated into a single `index.tsx` per block type.

## Markdown directive spec

Block-level container directives (`:::name{attr=val}`):

- `:::cover{label="..." highlight="..."}` containing `# Title`, metadata paragraphs (`KEY: value`), optional `> callout`
- `:::section{number="01"}` containing `## Heading`, optional `> lead paragraph`
- `:::callout{variant="info" label="LABEL"}` containing free body
- `:::quote{by="..."}` containing free body
- `:::metadata` containing `KEY: value` paragraphs
- `:::glossary` containing `TERM | EXPANSION | CONTEXT` paragraphs
- `:::signatures` containing `NAME | ROLE | DESCRIPTION` paragraphs

Leaf directives (`::name{attr=val}`):

- `::header{left="..." right="..."}`
- `::footer{left="..." right="..."}`
- `::monolabel{text="..."}`

Standard Markdown maps directly: `## Heading` becomes a subsection, and paragraphs, lists, GFM tables, fenced code blocks, thematic breaks and images all round-trip.

## Export format

`exportToHtml` produces a single `.html` file with:

- inlined CSS resolved against the active branding palette and font stack
- Google Fonts `<link>` for the three document families
- `@page { size: letter; margin: 0 }` and `@media print` rules
- a `<script type="application/json" id="ohmydocs-source">` containing the full document JSON, so re-import is lossless

`exportToMarkdown` writes YAML frontmatter (`title`, `author`, `team`, `institution`, `date`) followed by the directive-rich body. Documents can also be exported as raw JSON.

## Default templates

Three read-only templates are seeded in `src/features/templates/defaults.ts`:

1. **Eternum Technical Document** — cover, sections with decorative numerals, code, table, glossary, signatures, header/footer bars
2. **Eternum Brief** — prose-forward, no decorative numerals
3. **Eternum Internal Reglament** — formal Roman-numeral sections, signatures

Click `Use` in the Templates panel to instantiate a new document from a template.

## Branding

Open the **Branding** tab in the right panel. The default profile is read-only; click `Clone` to make a writable copy. Each profile defines nine palette tokens and three Google Font families, with WCAG AA contrast warnings shown inline.

## Keyboard shortcuts

| Key          | Action                          |
| ------------ | ------------------------------- |
| `/`          | Open the add-block menu         |
| `cmd/ctrl+s` | Export current document as JSON |
| `cmd/ctrl+d` | Duplicate the selected block    |
| `cmd/ctrl+⌫` | Delete the selected block       |
| `Esc`        | Close the add-block menu        |

## Status

- Phase 1 (Foundation): toolchain, palette, persistence, shell — complete
- Phase 2 (Core blocks): markdown round-trip, HTML export, sortable editor — complete
- Phase 3 (Remaining blocks): three templates, branding panel, import pipeline, sample — complete

## Limitations / deferred

- **Pagination engine**: documents render as one continuous `.page`; print uses CSS `page-break` only. A measurement-based engine that splits content into multiple `.page` containers in the live preview is not implemented.
- **Inline directives**: `:icon[name]` and inline `tag-pill` are not yet exposed as editor affordances; emit them by writing the directive directly in paragraph content.
- **Shiki syntax highlighting**: code blocks render plain at this time.
- **Logo / banner upload** in branding: stubbed (palette + font swap fully working).
- **Sample HTML**: export from the app to obtain an HTML snapshot that exactly matches the runtime CSS.

## House rules

- No em dashes in user-facing copy or generated documents (commas, colons, parentheses instead).
- Every block consumes palette tokens; no hardcoded hex outside `lib/palette/defaults.ts` and variant accents in `callout`.
- All external input (file imports, hydrated localStorage) is parsed through Zod.

---

Part of the OhMy suite: OhMyForms, OhMyDocs, OhMyMail, OhMyGrid, OhMyCharts, OhMyGantt. A family of small, focused web tools with a browser-only philosophy.
