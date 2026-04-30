import { renderToStaticMarkup } from "react-dom/server";
import type { OhmyDocument, BrandingProfile } from "@/types/schemas";
import { blockRegistry } from "@/blocks/registry";
import type { Block } from "@/blocks/types";
import { buildGoogleFontsHref } from "@/lib/fonts/catalog";

interface ExportInput {
  document: OhmyDocument;
  branding: BrandingProfile;
}

export function exportToHtml({ document: doc, branding }: ExportInput): string {
  const allBlocks = doc.blocks as Block[];
  const blocksHtml = allBlocks.map((block) => renderBlock(block, allBlocks)).join("\n");

  const fontsHref = buildGoogleFontsHref([
    branding.fonts.serif,
    branding.fonts.sans,
    branding.fonts.mono,
  ]);

  const css = inlineCss(branding);
  const sidecar = JSON.stringify(doc).replace(/</g, "\\u003c");

  return `<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="generator" content="OhMyDocs/1.0">
<meta name="theme-color" content="${branding.palette["ink-deepest"]}">
<title>${escapeHtml(doc.title)}</title>
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="${fontsHref}" rel="stylesheet">
<style>${css}</style>
<script type="application/json" id="ohmydocs-source">${sidecar}</script>
</head>
<body>
<article class="page">
${blocksHtml}
</article>
</body>
</html>
`;
}

function renderBlock(block: Block, allBlocks: Block[]): string {
  const def = blockRegistry[block.type];
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const Renderer = def.Renderer as any;
  return renderToStaticMarkup(<Renderer block={block} mode="read" allBlocks={allBlocks} />);
}

function escapeHtml(s: string): string {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

function inlineCss(b: BrandingProfile): string {
  const p = b.palette;
  const sf = b.fonts.serif.family;
  const sn = b.fonts.sans.family;
  const mn = b.fonts.mono.family;
  return `
:root {
  --color-ink-deepest: ${p["ink-deepest"]};
  --color-ink-deep: ${p["ink-deep"]};
  --color-accent: ${p.accent};
  --color-accent-soft: ${p["accent-soft"]};
  --color-paper: ${p.paper};
  --color-paper-soft: ${p["paper-soft"]};
  --color-rule: ${p.rule};
  --color-mute: ${p.mute};
  --color-ink-on-dark: ${p["ink-on-dark"]};
  --font-doc-serif: '${sf}', Georgia, serif;
  --font-doc-sans: '${sn}', system-ui, sans-serif;
  --font-doc-mono: '${mn}', ui-monospace, monospace;
  --page-width: 816px;
  --page-padding: 96px;
  --rule: 1px solid var(--color-rule);
  --radius-block: 8px;
  --radius-pill: 4px;
}
* { box-sizing: border-box; }
html, body { margin: 0; padding: 0; background: var(--color-paper-soft); }
body { font-family: var(--font-doc-sans); color: var(--color-ink-deepest); line-height: 1.65; }
.page {
  width: var(--page-width);
  padding: var(--page-padding);
  margin: 32px auto;
  background: var(--color-paper);
  box-shadow: 0 1px 3px rgba(15,40,84,0.06);
  font-family: var(--font-doc-sans);
}
.display-xl { font-family: var(--font-doc-serif); font-style: italic; font-size: 3.75rem; line-height: 1.05; font-weight: 400; }
.display-lg { font-family: var(--font-doc-serif); font-style: italic; font-size: 2.5rem; line-height: 1.1; font-weight: 400; }
.display-md { font-family: var(--font-doc-serif); font-style: italic; font-size: 1.75rem; line-height: 1.15; font-weight: 400; }
.lead { font-family: var(--font-doc-serif); font-style: italic; font-size: 1.125rem; color: var(--color-mute); line-height: 1.55; }
.mono-label { font-family: var(--font-doc-mono); font-size: 0.75rem; font-weight: 500; letter-spacing: 0.08em; text-transform: uppercase; }
.mono-meta { font-family: var(--font-doc-mono); font-size: 0.6875rem; letter-spacing: 0.08em; text-transform: uppercase; }
@page :first { size: letter; margin: 0; }
@page { size: letter; margin: 96px 0; }
@media print {
  * { -webkit-print-color-adjust: exact; print-color-adjust: exact; }
  html, body { background: #fff !important; }
  .page { width: 816px; margin: 0; box-shadow: none; }
  h1, h2, h3, h4, h5, h6 { break-after: avoid; }
  section { break-inside: avoid; }
  p { break-inside: avoid; }
  blockquote { break-inside: avoid; }
  table { break-inside: avoid; }
  pre { break-inside: avoid; }
  figure { break-inside: avoid; }
  .page-break-block { break-after: page; height: 0; display: block; }
}
`;
}
