import { useState, useLayoutEffect, useRef, useMemo, type ReactNode } from "react";
import { createRoot } from "react-dom/client";
import { flushSync } from "react-dom";
import { ulid } from "ulid";
import type { DocumentNode, Page, PaginationOptions } from "./types";
import { PAGE_CONFIG, contentDimensions } from "./constants";

// ── Config resolution ─────────────────────────────────────────────────────────

function resolvedConfig(opts: PaginationOptions) {
  const base = {
    ...PAGE_CONFIG,
    ...(opts.marginTop !== undefined && { marginTop: opts.marginTop }),
    ...(opts.marginBottom !== undefined && { marginBottom: opts.marginBottom }),
    ...(opts.marginLeft !== undefined && { marginLeft: opts.marginLeft }),
    ...(opts.marginRight !== undefined && { marginRight: opts.marginRight }),
    ...(opts.headerHeight !== undefined && { headerHeight: opts.headerHeight }),
    ...(opts.footerHeight !== undefined && { footerHeight: opts.footerHeight }),
  };
  return { ...base, ...contentDimensions(base) };
}

// ── Synchronous off-screen measurement ───────────────────────────────────────
//
// Creates a detached React root, renders into it with flushSync (synchronous),
// reads the height, and immediately cleans up. Safe to call inside
// useLayoutEffect. Do NOT call during the React render phase.

function measureReactNode(content: ReactNode, width: number): number {
  const container = document.createElement("div");
  container.style.cssText = `position:fixed;top:-9999px;left:-9999px;width:${width}px;visibility:hidden;pointer-events:none;`;
  document.body.appendChild(container);
  const root = createRoot(container);
  flushSync(() => {
    root.render(<>{content}</>);
  });
  const h = container.getBoundingClientRect().height;
  root.unmount();
  document.body.removeChild(container);
  return h;
}

// ── String-content bisection splitter ────────────────────────────────────────
//
// For paragraph nodes: splits on whitespace tokens.
// For code nodes: splits on newlines (preserving lines).
// Uses binary search to find how many tokens fit within maxHeight, then
// recurses on the remainder until all content is placed.

function splitStringContent(
  node: DocumentNode,
  text: string,
  maxHeight: number,
  contentWidth: number,
): DocumentNode[] {
  const isCode = node.type === "code";
  const tokens = isCode ? text.split("\n") : text.split(/\s+/).filter(Boolean);
  const separator = isCode ? "\n" : " ";
  const result: DocumentNode[] = [];
  let remaining = [...tokens];
  let partIdx = 0;

  while (remaining.length > 0) {
    if (remaining.length === 1) {
      result.push({
        ...node,
        id: `${node.id}~${partIdx}`,
        content: remaining[0] ?? "",
      });
      break;
    }

    let lo = 1;
    let hi = remaining.length;
    let best = 1;

    while (lo <= hi) {
      const mid = (lo + hi) >> 1;
      const partial = remaining.slice(0, mid).join(separator);
      const h = measureReactNode(partial, contentWidth);
      if (h <= maxHeight) {
        best = mid;
        lo = mid + 1;
      } else {
        hi = mid - 1;
      }
    }

    const chunk = remaining.slice(0, best).join(separator);
    result.push({ ...node, id: `${node.id}~${partIdx}`, content: chunk });
    remaining = remaining.slice(best);
    partIdx += 1;

    if (partIdx > 500) break; // safety: prevent runaway loops on degenerate input
  }

  return result;
}

// ── Core pagination algorithm ─────────────────────────────────────────────────
//
// 1. Expand oversized string nodes via bisection.
// 2. Non-splittable oversized nodes get their own page.
// 3. keepWithNext (including headings) prevents orphans.

interface NodeFragment {
  node: DocumentNode;
  height: number;
}

function runPagination(
  nodes: DocumentNode[],
  initialHeights: Map<string, number>,
  contentHeight: number,
  contentWidth: number,
): Page[] {
  // Pass 1: expand oversized nodes into page-sized fragments
  const fragments: NodeFragment[] = [];

  for (const node of nodes) {
    const h = initialHeights.get(node.id) ?? 0;

    if (h > contentHeight && typeof node.content === "string") {
      const splits = splitStringContent(node, node.content, contentHeight, contentWidth);
      for (const frag of splits) {
        const fragH = measureReactNode(frag.content as ReactNode, contentWidth);
        fragments.push({ node: frag, height: Math.min(fragH, contentHeight) });
      }
    } else if (h > contentHeight) {
      // ReactNode too tall to split: give it a full page and accept overflow
      fragments.push({ node, height: contentHeight });
    } else {
      fragments.push({ node, height: h });
    }
  }

  // Pass 2: sequential placement with keepWithNext / orphan prevention
  const pages: Page[] = [];
  let bucket: DocumentNode[] = [];
  let remaining = contentHeight;

  const flush = () => {
    if (bucket.length > 0) {
      pages.push({ id: ulid(), number: pages.length + 1, nodes: bucket });
      bucket = [];
      remaining = contentHeight;
    }
  };

  for (let i = 0; i < fragments.length; i++) {
    const entry = fragments[i];
    if (entry === undefined) continue;
    const { node, height: h } = entry;

    // Headings carry implicit keepWithNext unless the caller overrides to false
    const keepWith = node.keepWithNext ?? node.type === "heading";
    const nextEntry = fragments[i + 1];

    if (keepWith && nextEntry !== undefined) {
      // Heading fits in remaining space but its sibling would overflow: orphan.
      // Flush the current page and start both on the next one.
      if (h <= remaining && h + nextEntry.height > remaining) {
        flush();
        bucket.push(node);
        remaining -= h;
        continue;
      }
    }

    if (h <= remaining) {
      bucket.push(node);
      remaining -= h;
    } else {
      flush();
      bucket.push(node);
      remaining = contentHeight - h;
    }
  }

  flush();

  // Always return at least one (empty) page so the renderer has something to show
  if (pages.length === 0) {
    pages.push({ id: ulid(), number: 1, nodes: [] });
  }

  return pages;
}

// ── Public hook ───────────────────────────────────────────────────────────────

export interface UsePaginationResult {
  pages: Page[];
  /**
   * A hidden container that must be rendered somewhere in the React tree
   * (e.g. as a sibling of <PageRenderer>). The engine uses it to measure
   * node heights before placing them on pages.
   */
  measurementContainer: ReactNode;
}

/**
 * usePagination(nodes, options?)
 *
 * Returns the paginated pages and a measurement container that the caller
 * must render (hidden). Re-paginates only when the nodes array reference
 * or a config value changes.
 *
 * The parent component must be positioned (position: relative / absolute /
 * fixed) so that the measurement container's fixed positioning is correct.
 */
export function usePagination(
  nodes: DocumentNode[],
  options: PaginationOptions = {},
): UsePaginationResult {
  const [pages, setPages] = useState<Page[]>([]);
  const nodeRefs = useRef<Map<string, HTMLDivElement>>(new Map());

  const config = useMemo(
    () => resolvedConfig(options),
    // Individual fields as deps so a new options object reference doesn't
    // cause unnecessary re-pagination when values haven't changed.
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [
      options.marginTop,
      options.marginBottom,
      options.marginLeft,
      options.marginRight,
      options.headerHeight,
      options.footerHeight,
    ],
  );

  // Rendered by the caller; hidden off-screen so heights can be read by
  // useLayoutEffect without flicker.
  const measurementContainer = (
    <div
      aria-hidden="true"
      style={{
        position: "fixed",
        top: 0,
        left: "-9999px",
        width: `${config.contentWidth}px`,
        visibility: "hidden",
        pointerEvents: "none",
        overflow: "hidden",
        zIndex: -1,
      }}
    >
      {nodes.map((node) => (
        <div
          key={node.id}
          ref={(el) => {
            if (el !== null) {
              nodeRefs.current.set(node.id, el);
            } else {
              nodeRefs.current.delete(node.id);
            }
          }}
        >
          {node.content}
        </div>
      ))}
    </div>
  );

  useLayoutEffect(() => {
    const heights = new Map<string, number>();
    for (const node of nodes) {
      const el = nodeRefs.current.get(node.id);
      if (el !== undefined) {
        heights.set(node.id, el.getBoundingClientRect().height);
      }
    }
    const computed = runPagination(nodes, heights, config.contentHeight, config.contentWidth);
    setPages(computed);
  }, [nodes, config.contentHeight, config.contentWidth]);

  return { pages, measurementContainer };
}
