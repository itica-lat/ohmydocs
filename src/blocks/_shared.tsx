import type { ReactNode } from "react";
import type { Paragraph, RootContent } from "mdast";

/** Plain string → paragraph mdast node. */
export function textParagraph(text: string): Paragraph {
  return {
    type: "paragraph",
    children: text ? [{ type: "text", value: text }] : [],
  };
}

export function nodeToText(node: RootContent | undefined): string {
  if (!node) return "";
  type AnyNode = {
    value?: string;
    children?: AnyNode[];
  };
  const walk = (n: AnyNode): string => {
    if (typeof n.value === "string") return n.value;
    if (Array.isArray(n.children)) return n.children.map(walk).join("");
    return "";
  };
  return walk(node as AnyNode);
}

/** Wrap occurrences of `accentWord` in an accent-colored span. */
export function withAccent(text: string, accentWord: string): ReactNode {
  if (!accentWord) return text;
  const parts = text.split(accentWord);
  if (parts.length === 1) return text;
  const out: ReactNode[] = [];
  parts.forEach((p, i) => {
    if (i > 0) {
      out.push(
        <span key={`hl-${i}`} style={{ color: "var(--color-accent)" }}>
          {accentWord}
        </span>,
      );
    }
    out.push(p);
  });
  return out;
}
