import { useEffect, type ReactNode } from "react";
import type { Page } from "./types";
import { PAGE_CONFIG, PAGE_GAP_PX, VIEWPORT_BG, contentDimensions } from "./constants";

// ── Print styles (self-contained, injected on mount) ─────────────────────────

const PRINT_STYLE_ID = "ohmydocs-pagination-print";

const PRINT_CSS = `
@media print {
  .ohmydocs-viewport {
    background: #fff !important;
    padding: 0 !important;
    gap: 0 !important;
    min-height: unset !important;
  }
  .ohmydocs-page-sheet {
    box-shadow: none !important;
    page-break-after: always;
    break-after: page;
  }
  .ohmydocs-page-sheet:last-child {
    page-break-after: auto;
    break-after: auto;
  }
  .ohmydocs-page-header,
  .ohmydocs-page-footer {
    border-color: #ccc !important;
  }
}
`;

function usePrintStyles() {
  useEffect(() => {
    if (document.getElementById(PRINT_STYLE_ID)) return;
    const style = document.createElement("style");
    style.id = PRINT_STYLE_ID;
    style.textContent = PRINT_CSS;
    document.head.appendChild(style);
    return () => {
      document.getElementById(PRINT_STYLE_ID)?.remove();
    };
  }, []);
}

// ── Single page sheet ─────────────────────────────────────────────────────────

interface PageSheetProps {
  page: Page;
  total: number;
  title: string;
  footer: ReactNode;
}

function PageSheet({ page, total, title, footer }: PageSheetProps) {
  const cfg = PAGE_CONFIG;
  const { contentWidth } = contentDimensions(cfg);

  // Header sits in the top margin, pinned to just above the content area.
  const headerTop = cfg.marginTop - cfg.headerHeight;
  // Footer sits in the bottom margin, pinned to just below the content area.
  const footerBottom = cfg.marginBottom - cfg.footerHeight;

  return (
    <div
      className="ohmydocs-page-sheet"
      style={{
        width: `${cfg.width}px`,
        height: `${cfg.height}px`,
        background: "#fff",
        boxShadow: "0 4px 32px rgba(0,0,0,0.22), 0 1px 6px rgba(0,0,0,0.12)",
        position: "relative",
        flexShrink: 0,
        overflow: "hidden",
      }}
    >
      {/* Header */}
      <div
        className="ohmydocs-page-header"
        style={{
          position: "absolute",
          top: `${headerTop}px`,
          left: `${cfg.marginLeft}px`,
          width: `${contentWidth}px`,
          height: `${cfg.headerHeight}px`,
          display: "flex",
          alignItems: "flex-end",
          justifyContent: "space-between",
          paddingBottom: "8px",
          borderBottom: "1px solid var(--color-rule, #e2e8f0)",
          boxSizing: "border-box",
        }}
      >
        <span
          style={{
            fontFamily: "var(--font-ui-sans, 'DM Sans', sans-serif)",
            fontSize: "0.6875rem",
            color: "var(--color-mute, #94a3b8)",
            letterSpacing: "0.02em",
            overflow: "hidden",
            textOverflow: "ellipsis",
            whiteSpace: "nowrap",
            maxWidth: "60%",
          }}
        >
          {title}
        </span>
        <span
          style={{
            fontFamily: "var(--font-ui-mono, 'DM Mono', monospace)",
            fontSize: "0.6875rem",
            color: "var(--color-mute, #94a3b8)",
            whiteSpace: "nowrap",
          }}
        >
          {page.number} / {total}
        </span>
      </div>

      {/* Content area */}
      <div
        style={{
          position: "absolute",
          top: `${cfg.marginTop}px`,
          bottom: `${cfg.marginBottom}px`,
          left: `${cfg.marginLeft}px`,
          width: `${contentWidth}px`,
          overflow: "hidden",
        }}
      >
        {page.nodes.map((node) => (
          <div key={node.id}>{node.content}</div>
        ))}
      </div>

      {/* Footer */}
      {footer !== null && footer !== undefined && (
        <div
          className="ohmydocs-page-footer"
          style={{
            position: "absolute",
            bottom: `${footerBottom}px`,
            left: `${cfg.marginLeft}px`,
            width: `${contentWidth}px`,
            height: `${cfg.footerHeight}px`,
            display: "flex",
            alignItems: "flex-start",
            paddingTop: "6px",
            borderTop: "1px solid var(--color-rule, #e2e8f0)",
            boxSizing: "border-box",
          }}
        >
          {footer}
        </div>
      )}
    </div>
  );
}

// ── Public component ──────────────────────────────────────────────────────────

export interface PageRendererProps {
  pages: Page[];
  /** Shown on the left side of every page header. */
  title?: string;
  /** Optional slot rendered in every page footer. Accepts any ReactNode. */
  footer?: ReactNode;
}

export function PageRenderer({ pages, title = "", footer = null }: PageRendererProps) {
  usePrintStyles();

  return (
    <div
      className="ohmydocs-viewport"
      style={{
        background: VIEWPORT_BG,
        padding: `${PAGE_GAP_PX}px`,
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        gap: `${PAGE_GAP_PX}px`,
        minHeight: "100vh",
        boxSizing: "border-box",
      }}
    >
      {pages.map((page) => (
        <PageSheet key={page.id} page={page} total={pages.length} title={title} footer={footer} />
      ))}
    </div>
  );
}
