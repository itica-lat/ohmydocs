# CLAUDE.md — OhMyDocs! Eternum Edition

Codebase guide for Claude Code.

## Quick orientation

Local-first SPA document editor. No backend. All persistence is `localStorage` via Zustand `persist`. Files are read/written through the File System Access API (with `<a download>` / `<input>` fallback for Firefox).

Three-pane layout: Sidebar (document list) | Preview/Editor | Right panel (Metadata / Branding / Templates).

## Commands

```bash
bun install          # install deps
bun run dev          # dev server → http://localhost:5173
bun run build        # tsc -b + vite build (fails on type errors)
bun run typecheck    # tsc -b --noEmit (no emit, fast)
bun run lint         # oxlint
bun run lint:fix     # oxlint --fix
bun run format       # oxfmt . (writes)
bun run format:check # oxfmt --check (pre-commit)
```

Pre-commit hook (husky) runs lint, format:check, typecheck. Fix all three before committing.

## Path alias

`@/*` resolves to `./src/*`. Configured in both `vite.config.ts` (`resolve.alias`) and `tsconfig.app.json` (`paths`). Do not use relative paths that cross feature boundaries.

## Block system

The core abstraction. Every content unit is a block.

### Adding a new block type

1. Add the type to the discriminated union in [src/blocks/types.ts](src/blocks/types.ts)
2. Create `src/blocks/<type>/index.tsx` exporting a `BlockDefinition<'<type>'>` (see existing blocks for the shape)
3. Register it in [src/blocks/all.ts](src/blocks/all.ts) and [src/blocks/registry.ts](src/blocks/registry.ts)
4. Write a Zod schema, factory, Renderer, Editor, serialize, and optionally deserialize

`BlockDefinition<T>` shape (from [src/blocks/registry.ts](src/blocks/registry.ts)):

```ts
{
  type: T
  label: string
  category: 'structural' | 'content' | 'data' | 'media'
  iconName: string          // lucide-react icon name
  schema: z.ZodType<...>
  factory: (overrides) => Block
  Renderer: React.FC<{ block: Block; branding?: BrandingProfile }>
  Editor: React.FC<{ block: Block; onChange: (b: Block) => void }>
  serialize: (block) => RootContent[]   // mdast nodes
  deserialize?: (node, ctx) => Block | null
}
```

### Markdown directive mapping

Blocks that don't map to standard markdown use remark-directive syntax:

- Container (`:::name{attrs}\n...\n:::`) for structural blocks with children
- Leaf (`::name{attrs}`) for inline/single-line blocks

When writing `serialize`, produce the directive as a `ContainerDirective` or `LeafDirective` from `mdast-util-directive`. The `children` type of `ContainerDirective` is `(BlockContent | DefinitionContent)[]`, not `RootContent[]` — use `textParagraph()` from [src/blocks/_shared.tsx](src/blocks/_shared.tsx) which returns `Paragraph` (not `RootContent`).

### Key shared helpers ([src/blocks/_shared.tsx](src/blocks/_shared.tsx))

- `textParagraph(text)` — returns a typed `Paragraph` mdast node
- `nodeToText(node)` — recursive mdast text extraction
- `withAccent(text, word)` — wraps `word` in `<span style="color: var(--color-accent)">` in the rendered output. Heading fields support `*word*` syntax (parsed by the block's own `parseAccent`).

## State management

Three Zustand stores, all persisted:

| Store | Key | File |
|---|---|---|
| Documents | `ohmydocs:documents` | [src/features/editor/store.ts](src/features/editor/store.ts) |
| Branding | `ohmydocs:branding` | [src/features/branding/store.ts](src/features/branding/store.ts) |
| Templates | `ohmydocs:templates` | [src/features/templates/store.ts](src/features/templates/store.ts) |

On hydration, each store validates incoming data through Zod and re-seeds defaults (the Eternum branding profile and three templates always exist).

`useDocumentsStore.getState()` is used in the keyboard shortcut handler to avoid closure staleness — this is intentional.

## Palette / branding

CSS custom properties drive all color. Never write hex values outside:
- [src/lib/palette/defaults.ts](src/lib/palette/defaults.ts) — Eternum default values
- Variant accent maps in `callout/index.tsx` — per-variant colors

`applyBranding()` in [src/lib/palette/apply.ts](src/lib/palette/apply.ts) writes all 9 palette vars + 3 font vars to `document.documentElement.style`. It is called once on app load and whenever the active branding changes.

Token names: `--color-ink-deepest`, `--color-ink-deep`, `--color-accent`, `--color-accent-soft`, `--color-paper`, `--color-paper-soft`, `--color-rule`, `--color-mute`, `--color-ink-on-dark`.

Font vars: `--font-doc-serif`, `--font-doc-sans`, `--font-doc-mono` (document body). `--font-ui-sans`, `--font-ui-serif`, `--font-ui-mono` (chrome — DM family, not swappable).

## Validation boundary

Zod is only used at system boundaries:
- localStorage hydration (Zustand persist merge)
- File imports (JSON, HTML sidecar, markdown)

Internal code trusts TypeScript types. Do not add Zod parsing to internal functions.

## Export pipeline

- **JSON**: `downloadJson()` in [src/features/editor/shortcuts.ts](src/features/editor/shortcuts.ts) — raw `JSON.stringify` of the document store entry
- **Markdown**: [src/lib/export/markdown.ts](src/lib/export/markdown.ts) — YAML frontmatter + unified pipeline
- **HTML**: [src/lib/export/html.tsx](src/lib/export/html.tsx) — `renderToStaticMarkup` per block, inlined CSS, embedded JSON sidecar in `<script type="application/json" id="ohmydocs-source">`

## Import pipeline

- HTML: [src/features/import/html.ts](src/features/import/html.ts) — reads the `ohmydocs-source` script tag
- Markdown: [src/features/import/markdown.ts](src/features/import/markdown.ts) — splits frontmatter, calls `markdownToBlocks()`

## Font loading

[src/lib/fonts/catalog.ts](src/lib/fonts/catalog.ts) builds Google Fonts URLs. [src/lib/fonts/loader.ts](src/lib/fonts/loader.ts) injects/updates `<link>` tags. Called by `applyBranding()`.

## Key invariants

- No em dashes anywhere (not in code, comments, or user-facing strings). Use commas, colons, or parentheses.
- No hardcoded hex outside `lib/palette/defaults.ts` and callout variant maps.
- All external input goes through Zod.
- Block IDs are ULIDs via `newId(prefix)` in [src/lib/id.ts](src/lib/id.ts). Never construct IDs manually.
- The Eternum branding profile (`ETERNUM_BRANDING_ID`) cannot be deleted or modified; the branding store enforces this.
- Template entries with `readOnly: true` cannot be deleted through the UI.
- `textParagraph()` must return `Paragraph`, not `RootContent`, to satisfy `ContainerDirective.children` type constraints.

## TypeScript config

`tsconfig.app.json` uses TypeScript 6.0 strict mode: `strict`, `noImplicitAny`, `strictNullChecks`, `noUncheckedIndexedAccess`, `exactOptionalPropertyTypes`. No `baseUrl` (deprecated in TS 6). Paths only via `"paths": { "@/*": ["./src/*"] }`.

## Linting

OxLint with `correctness`/`suspicious` as deny, `perf` as warn, `style` off. See [.oxlintrc.json](.oxlintrc.json) for disabled rules. Notable: `react/react-in-jsx-scope` is off (React 19 automatic JSX), `unicorn/no-null` is off (null is used intentionally), `typescript/no-non-null-assertion` is off.

## `.page` container

The document canvas. Width: 816px (US Letter at 96dpi). Padding: 96px all sides. Typography scale (display-xl through lead, mono-label) applies only inside `.page`. Defined in [src/styles/typography.css](src/styles/typography.css).

## Templates

Three read-only templates in [src/features/templates/defaults.ts](src/features/templates/defaults.ts). `fix()` assigns deterministic seed IDs (`seed-<type>-<index>`) and returns `Template['blocks']` (not `Block[]`) to satisfy the Zod passthrough index signature.

`instantiate(templateId)` in the templates store creates a new document, replacing all seed IDs with fresh ULIDs.
