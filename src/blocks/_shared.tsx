import type { ReactNode } from "react";
import { useT } from "@/lib/i18n";
import type { Paragraph, RootContent } from "mdast";
import { AlignCenter, AlignJustify, AlignLeft, AlignRight } from "lucide-react";
import type { TextAlign } from "./types";

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

const ALIGN_OPTIONS = [
  { value: "left" as const, icon: <AlignLeft size={12} />, titleKey: "block.alignLeft" },
  { value: "center" as const, icon: <AlignCenter size={12} />, titleKey: "block.alignCenter" },
  { value: "right" as const, icon: <AlignRight size={12} />, titleKey: "block.alignRight" },
  { value: "justify" as const, icon: <AlignJustify size={12} />, titleKey: "block.justify" },
] as const;

export function AlignButtons({
  value,
  onChange,
}: {
  value: TextAlign | undefined;
  onChange: (align: TextAlign) => void;
}) {
  const t = useT();
  const current = value ?? "left";
  return (
    <div style={{ display: "flex", gap: "0.25rem" }}>
      {ALIGN_OPTIONS.map(({ value: v, icon, titleKey }) => (
        <button
          key={v}
          type="button"
          title={t(titleKey)}
          onClick={() => onChange(v)}
          style={{
            display: "inline-flex",
            alignItems: "center",
            justifyContent: "center",
            width: 26,
            height: 22,
            border: "1px solid var(--color-rule)",
            borderRadius: "3px",
            background: current === v ? "var(--color-accent)" : "transparent",
            color: current === v ? "var(--color-ink-on-dark)" : "var(--color-mute)",
            cursor: "pointer",
          }}
        >
          {icon}
        </button>
      ))}
    </div>
  );
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
