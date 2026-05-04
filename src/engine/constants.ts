import type { PageConfig } from "./types";

// ── Paper dimensions ──────────────────────────────────────────────────────────
// A4 at 96 dpi: 210 mm × 297 mm → 794 px × 1122 px.
// To switch to US Letter (216 mm × 279 mm → 816 px × 1056 px):
//   change A4_WIDTH_PX to 816, A4_HEIGHT_PX to 1056, and update the label.
const A4_WIDTH_PX = 794;
const A4_HEIGHT_PX = 1122;

/**
 * Single source of truth for all page layout dimensions.
 * Every spacing value in the engine derives from this object.
 */
export const PAGE_CONFIG: PageConfig = {
  width: A4_WIDTH_PX,
  height: A4_HEIGHT_PX,
  marginTop: 80,
  marginBottom: 80,
  marginLeft: 64,
  marginRight: 64,
  // These heights are carved out of the respective margin areas.
  headerHeight: 40,
  footerHeight: 32,
};

/** Gap between page sheets in the screen preview (px). */
export const PAGE_GAP_PX = 32;

/** Eternum navy — background of the preview viewport. */
export const VIEWPORT_BG = "#0F2854";

/** Derive the usable content box from a PageConfig. */
export function contentDimensions(cfg: PageConfig): {
  contentWidth: number;
  contentHeight: number;
} {
  return {
    contentWidth: cfg.width - cfg.marginLeft - cfg.marginRight,
    contentHeight:
      cfg.height - cfg.marginTop - cfg.marginBottom - cfg.headerHeight - cfg.footerHeight,
  };
}
