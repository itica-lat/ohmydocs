# Cover Export Margin Bug — Diagnosis

## Overview

The cover block fails to render as a full-bleed page (edge-to-edge dark background) when exported. Two export paths exist, each with different problems.

---

## Files Analyzed

| File                         | Role                                                                                                                                                     |
| ---------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `src/blocks/cover/index.tsx` | Cover renderer — inline `margin: calc(-1 * var(--page-padding)) calc(-1 * var(--page-padding)) 0` + `padding: var(--page-padding)` + `minHeight: 1056px` |
| `src/lib/export/html.tsx`    | HTML export — generates `@page :first { margin: 0 }` / `@page { margin: 1in 0 }` and `@media print { .page { width: 100%; margin: 0; } }`                |
| `src/lib/export/pdf.tsx`     | Direct PDF export via `@react-pdf/renderer` — separate cover rendering with `padding: 48pt`, not full-bleed                                              |
| `src/engine/exportToPDF.ts`  | App-level `window.print()` trigger (Ctrl+P within app)                                                                                                   |
| `src/styles/print.css`       | App-level print styles — includes `@page { margin: 0 }` and `.page section { break-after: avoid }`                                                       |
| `src/styles/page.css`        | `.page` styles — `width: 816px`, `padding: 96px`, `min-height: 1056px`                                                                                   |
| `src/styles/tokens.css`      | CSS var definitions — `--page-padding: 96px`, `--page-width: 816px`                                                                                      |

---

## Bug 1: `@page :first` — Browser Inconsistency (PRIMARY ROOT CAUSE)

**Location**: `src/lib/export/html.tsx`, lines 105-106

```css
@page :first {
  size: letter;
  margin: 0;
}
@page {
  size: letter;
  margin: 1in 0;
}
```

**Problem**: `@page :first` is inconsistently supported across browsers, especially in Chromium. When the `:first` pseudo-class is ignored:

- The first page gets `margin: 1in 0` = 96px top and bottom
- The cover's `margin: -96px -96px 0` only compensates top (-96px) but NOT bottom (0)
- The cover has `minHeight: 1056px` but the available content height is 1056 - 192 = **864px**
- Result: cover overflows the page by 192px and doesn't reach the bottom edge

**Geometry when `@page :first` fails:**

```
┌─────────────────────────────────┐  ← page top edge
│  margin: 1in (96px)             │
│  ┌───────────────────────────┐  │
│  │ .page content area        │  │
│  │ (864px tall)              │  │
│  │                           │  │
│  │ Cover: minHeight 1056px   │  │
│  │ ===== OVERFLOW =====      │  │
│  └───────────────────────────┘  │
│                    margin: 0  ←  ╳ cover bottom doesn't reach here
└─────────────────────────────────┘  ← page bottom edge
```

---

## Bug 2: Cover `minHeight` Mismatch with Page Margins

**Location**: `src/blocks/cover/index.tsx`, line 52

```tsx
minHeight: "1056px", // = full US Letter height at 96dpi
```

**Problem**: `1056px` is the full page height. With `@page { margin: 1in 0; }` (96px top + 96px bottom = 192px), the content area is only **864px**. The cover cannot fit, and because `margin-bottom: 0`, it doesn't extend to fill the gap at the bottom.

**Fix needed**: The cover's height strategy must account for page margins:

- With `@page :first { margin: 0 }`: height = 1056px (correct)
- Without: height = 864px (wrong)
- Using `height: 100vh` in `@media print` would adapt automatically, but 100vh includes margins, so it doesn't fix the bleed.

---

## Bug 3: `.page` Container Lacks Explicit Height in Print

**Location**: `src/lib/export/html.tsx`, line 118

```css
@media print {
  .page {
    width: 100%;
    margin: 0;
    box-shadow: none;
  }
}
```

**Problem**: No `height` or `min-height` is set on `.page` in print mode. The browser paginates by flowing content across pages. The cover's `minHeight: 1056px` makes it overflow the content area when margins exist, and the browser doesn't know how to handle the overflow.

---

## Bug 4: Conflicting `break-after` Rules

**Location**: `src/styles/print.css`, line 86

```css
.page section {
  break-inside: avoid;
  break-after: avoid;
}
```

**Problem**: The cover has `pageBreakAfter: always` / `breakAfter: page` as an inline style, but `print.css` says `.page section { break-after: avoid; }`. While inline styles should win on specificity, the general `break-after: avoid` can interfere in some browser implementations.

---

## Bug 5: Direct PDF Export Never Attempts Full-Bleed Cover

**Location**: `src/lib/export/pdf.tsx`, lines 111-133

```tsx
page: { paddingTop: 72, paddingBottom: 72, paddingLeft: 72, paddingRight: 72, ... },
cover: {
  paddingTop: 48, paddingLeft: 48, paddingRight: 48, paddingBottom: 48,
  marginBottom: 36, borderRadius: 4,
}
```

**Problem**: The react-pdf cover is rendered as a rounded-corner box INSIDE the page margins. The total top inset is 72pt (page padding) + 48pt (cover padding) = **120pt** from the page edge. The cover never bleeds to any edge. This is architecturally different from the HTML export cover design (which is supposed to be full-bleed).

---

## Root Cause Summary

1. **`@page :first` is unreliable** — this is the primary root cause. The entire full-bleed strategy depends on it.
2. **The negative-margin strategy is fragile** — it chains `--page-padding`, `@page :first`, and `.page` dimensions together; any break in the chain causes the cover to not bleed.
3. **No explicit cover print styles** — the HTML export has no `@media print` rules that specifically target the cover element to enforce full-bleed behavior.
4. **Direct PDF uses a different (non-bleeding) design** — inconsistent with the HTML export cover.

---

## Recommended Fix Strategy

### Fix for HTML Export (`src/lib/export/html.tsx`)

Add explicit cover print styles in the `@media print` block:

```css
/* Override first-page .page container for reliable full-bleed cover.
   Uses :first-of-type + page-break to ensure we target only the cover
   section on the first page without relying on @page :first. */
section:first-of-type {
  position: absolute !important;
  top: 0 !important;
  left: 0 !important;
  width: 100% !important;
  height: 100% !important;
  margin: 0 !important;
}
```

Or, more conservatively, restructure the HTML export to pull the cover out of the `.page` container and render it as a standalone element:

```html
<div style="height: 100vh; page-break-after: always; ...">
  <!-- cover content -->
</div>
<article class="page">
  <!-- rest of content -->
</article>
```

### Fix for Direct PDF Export (`src/lib/export/pdf.tsx`)

Add a dedicated full-bleed cover page (using `@react-pdf/renderer`'s page-level styling):

```tsx
<Page size="LETTER" style={{ margin: 0, padding: 0, backgroundColor: p["ink-deepest"] }}>
  <CoverPDF ... />
</Page>
<Page size="LETTER" style={s.page}>
  {/* remaining blocks */}
</Page>
```

### Fix for Cover Component (`src/blocks/cover/index.tsx`)

Replace `minHeight: 1056px` with a more adaptive approach:

```tsx
minHeight: "100vh",
```

Or better, use CSS `@media print` to set the cover height to `100vh` for the printed version while keeping `1056px` for screen display.
