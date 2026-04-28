# OhMyDocs! — Eternum Edition

> Documents that look like they were designed, not typed.

A local-first, offline-capable document editor that produces editorial-grade
technical documents in the visual style of the Eternum Team.

## Stack

- **Runtime**: Bun
- **Build**: Vite + `@vitejs/plugin-react-swc`
- **Language**: TypeScript (strict)
- **UI**: React 19
- **Styling**: TailwindCSS v4 + PostCSS + Autoprefixer
- **State**: Zustand (with `persist` → `localStorage`)
- **Validation**: Zod
- **Markdown**: unified + remark-parse + remark-gfm + remark-directive + remark-stringify
- **Drag-drop**: @dnd-kit
- **Icons**: lucide-react
- **Lint / format**: OxLint + OxFMT
- **Hooks**: husky pre-commit (lint, format, typecheck)

UI chrome uses the **DM** font family (`DM Sans`, `DM Serif Display`, `DM Mono`).
Document body uses the Eternum default fonts (`Playfair Display`, `Inter`,
`IBM Plex Mono`), swappable per branding profile.

## Setup

```bash
bun install
bun run dev
```

Open http://localhost:5173.

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
    markdown/          # unified pipeline (blocks ↔ markdown)
    export/            # HTML and Markdown exporters
    id.ts              # ULID prefixer
  styles/              # tokens.css, typography.css, page.css, print.css, app.css
  types/               # palette tokens, Zod schemas
samples/
  eternum-technical.md # round-trippable sample document
```

## Block model

The block model is a discriminated union exported from `src/blocks/types.ts`. All
17 block types are registered in `src/blocks/registry.ts`:

| Type              | Category   | Folder                    |
| ----------------- | ---------- | ------------------------- |
| `cover`           | structural | `blocks/cover/`           |
| `section`         | structural | `blocks/section/`         |
| `subsection`      | structural | `blocks/subsection/`      |
| `mono-label`      | structural | `blocks/mono-label/`      |
| `header-bar`      | structural | `blocks/header-bar/`      |
| `footer-bar`      | structural | `blocks/footer-bar/`      |
| `divider`         | structural | `blocks/divider/`         |
| `paragraph`       | content    | `blocks/paragraph/`       |
| `callout`         | content    | `blocks/callout/`         |
| `code-block`      | content    | `blocks/code-block/`      |
| `list`            | content    | `blocks/list/`            |
| `quote`           | content    | `blocks/quote/`           |
| `table`           | data       | `blocks/table/`           |
| `metadata-grid`   | data       | `blocks/metadata-grid/`   |
| `glossary-entry`  | data       | `blocks/glossary-entry/`  |
| `signature-block` | data       | `blocks/signature-block/` |
| `image`           | media      | `blocks/image/`           |

Each block module exports a `BlockDefinition<T>` containing schema, factory,
Renderer, Editor, serialize, deserialize. The spec calls for one file per
concern (5 files per block); we consolidated into a single `index.tsx` per
block type for readability — the contract is identical.

## Markdown directive spec

Block-level container directives (`:::name{attr=val}`):

- `:::cover{label="…" highlight="…"}` containing `# Title`, metadata paragraphs (`KEY: value`), optional `> callout`
- `:::section{number="01"}` containing `## Heading`, optional `> lead paragraph`
- `:::callout{variant="info" label="LABEL"}` containing free body
- `:::quote{by="…"}` containing free body
- `:::metadata` containing `KEY: value` paragraphs
- `:::glossary` containing `TERM | EXPANSION | CONTEXT` paragraphs
- `:::signatures` containing `NAME | ROLE | DESCRIPTION` paragraphs

Leaf directives (`::name{attr=val}`):

- `::header{left="…" right="…"}`
- `::footer{left="…" right="…"}`
- `::monolabel{text="…"}`

Standard markdown maps directly: `## Heading` → subsection, `### Heading` and
deeper degrade to subsection. Paragraphs, ordered/unordered lists, GFM tables,
fenced code blocks, thematic breaks, and images all round-trip.

## Export format

`exportToHtml` produces a single `.html` file with:

- inlined CSS resolved against the active branding palette and font stack
- Google Fonts `<link>` for the three document families
- `@page { size: letter; margin: 0 }` and `@media print` rules
- a `<script type="application/json" id="ohmydocs-source">` containing the full
  document JSON, so re-import is lossless

`exportToMarkdown` writes YAML frontmatter (`title`, `author`, `team`, `institution`, `date`)
followed by the directive-rich body.

## Default templates

Three read-only templates seeded in `src/features/templates/defaults.ts`:

1. **Eternum Technical Document** — cover, sections with decorative numerals,
   code, table, glossary, signatures, header/footer bars
2. **Eternum Brief** — prose-forward, no decorative numerals
3. **Eternum Internal Reglament** — formal Roman-numeral sections, signatures

Click `Use` in the Templates panel to instantiate a new document from a template.

## Branding

Open the **Branding** tab in the right panel. The Eternum default profile is
read-only; click `Clone` to make a writable copy. Nine palette tokens, three
Google Font families. WCAG AA contrast warnings appear inline.

## Keyboard shortcuts

| Key          | Action                          |
| ------------ | ------------------------------- |
| `/`          | Open the add-block menu         |
| `cmd/ctrl+s` | Export current document as JSON |
| `cmd/ctrl+d` | Duplicate the selected block    |
| `cmd/ctrl+⌫` | Delete the selected block       |
| `Esc`        | Close the add-block menu        |

## Phase status

- ✅ Phase 1 — Foundation (toolchain, palette, persistence, shell)
- ✅ Phase 2 — Core blocks (9), markdown round-trip, HTML export, sortable editor
- ✅ Phase 3 — Remaining blocks (8), three templates, branding panel, import pipeline, sample

## Limitations / deferred

- **Pagination engine**: documents render as one continuous `.page`; print uses
  CSS `page-break` only. A measurement-based engine that splits content into
  multiple `.page` containers in the live preview is not implemented.
- **Inline directives**: `:icon[name]` and inline `tag-pill` aren't yet exposed
  as editor affordances; emit them by writing the directive directly in
  paragraph content.
- **Shiki syntax highlighting**: code blocks render plain at this time.
- **Logo / banner upload** in branding: stubbed (palette + font swap fully working).
- **Sample HTML**: export from the app to obtain an HTML snapshot that exactly
  matches the runtime CSS.

## House rules

- No em dashes in user-facing copy or generated documents (commas, colons, parentheses instead).
- Every block consumes palette tokens; no hardcoded hex outside `lib/palette/defaults.ts` and variant accents in `callout`.
- All external input (file imports, hydrated localStorage) is parsed through Zod.
