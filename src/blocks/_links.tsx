import type { ReactNode } from "react";
import { ExternalLink } from "lucide-react";
import type { Block } from "./types";

const LINK_RE_SOURCE = String.raw`\[([^\]]+)\]\(([^)]+)\)`;

type LinkRef = { text: string; url: string };

function extractLinksFromText(text: string): LinkRef[] {
  const refs: LinkRef[] = [];
  const re = new RegExp(LINK_RE_SOURCE, "g");
  let m: RegExpExecArray | null;
  while ((m = re.exec(text)) !== null) {
    refs.push({ text: m[1] ?? "", url: m[2] ?? "" });
  }
  return refs;
}

/** Scan all text-bearing blocks in document order; deduplicate by URL. */
export function extractDocumentLinks(blocks: Block[]): LinkRef[] {
  const seen = new Set<string>();
  const refs: LinkRef[] = [];
  for (const block of blocks) {
    let texts: string[] = [];
    if (block.type === "paragraph") texts = [block.text];
    else if (block.type === "quote") texts = [block.text];
    else if (block.type === "callout") texts = [block.body];
    for (const text of texts) {
      for (const ref of extractLinksFromText(text)) {
        if (!seen.has(ref.url)) {
          seen.add(ref.url);
          refs.push(ref);
        }
      }
    }
  }
  return refs;
}

/**
 * Parse `[text](url)` patterns in a string and return React nodes.
 * Pass `linkIndex` to show numbered superscripts; null = icon only.
 */
export function renderInlineText(text: string, linkIndex: Map<string, number> | null): ReactNode[] {
  const re = new RegExp(LINK_RE_SOURCE, "g");
  const parts: ReactNode[] = [];
  let lastIndex = 0;
  let m: RegExpExecArray | null;

  while ((m = re.exec(text)) !== null) {
    const [full, linkText = "", url = ""] = m;
    if (m.index > lastIndex) parts.push(text.slice(lastIndex, m.index));
    const n = linkIndex?.get(url);
    parts.push(
      <a
        key={`lnk-${m.index}`}
        href={url}
        target="_blank"
        rel="noopener noreferrer"
        style={{
          color: "var(--color-accent)",
          textDecoration: "underline",
          textUnderlineOffset: "2px",
          textDecorationColor: "var(--color-accent-soft)",
        }}
      >
        {linkText}
        <ExternalLink
          className="link-ext-icon"
          size={10}
          style={{
            display: "inline",
            verticalAlign: "middle",
            marginLeft: "2px",
            marginBottom: "2px",
          }}
        />
        {n !== undefined && (
          <sup style={{ fontSize: "0.65em", marginLeft: "1px", color: "var(--color-mute)" }}>
            [{n + 1}]
          </sup>
        )}
      </a>,
    );
    lastIndex = m.index + full.length;
  }

  if (lastIndex < text.length) parts.push(text.slice(lastIndex));
  return parts.length > 0 ? parts : [text];
}
