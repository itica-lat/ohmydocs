import { useReferenceStore } from "./ReferenceStore";

/**
 * Renders a numbered reference table for all links registered via <InlineLink>.
 * Intended to be used as a DocumentNode of type "reference-list" at the end of
 * the document. The pagination engine will keep it on the last content page if
 * it fits, or break it to a new page otherwise (normal flow — no special casing
 * required).
 */
export function ReferenceList() {
  const refs = useReferenceStore((s) => s.refs);

  if (refs.length === 0) {
    return null;
  }

  return (
    <section style={{ marginTop: "1.5rem" }}>
      <h2
        style={{
          fontFamily: "var(--font-doc-serif, 'DM Serif Display', serif)",
          fontSize: "1.125rem",
          fontWeight: 400,
          color: "var(--color-ink-deepest, #0F2854)",
          margin: "0 0 0.75rem",
          letterSpacing: "-0.01em",
        }}
      >
        Referencias
      </h2>

      <ol
        style={{
          listStyle: "none",
          margin: 0,
          padding: 0,
          display: "flex",
          flexDirection: "column",
          gap: "0.375rem",
        }}
      >
        {refs.map(({ id, label, url, refNumber }) => (
          <li
            key={id}
            style={{
              display: "flex",
              gap: "0.5rem",
              alignItems: "baseline",
              fontSize: "0.8125rem",
              lineHeight: 1.5,
            }}
          >
            <span
              style={{
                fontFamily: "var(--font-doc-mono, 'DM Mono', monospace)",
                fontSize: "0.6875rem",
                color: "var(--color-mute, #94a3b8)",
                minWidth: "1.75rem",
                flexShrink: 0,
              }}
            >
              [{refNumber}]
            </span>
            <span
              style={{
                fontFamily: "var(--font-doc-sans, 'DM Sans', sans-serif)",
                color: "var(--color-ink-deep, #1C4D8D)",
                flexShrink: 0,
              }}
            >
              {label}
            </span>
            <span
              style={{
                color: "var(--color-rule, #e2e8f0)",
                flexShrink: 0,
              }}
            >
              —
            </span>
            <a
              href={url}
              target="_blank"
              rel="noopener noreferrer"
              style={{
                fontFamily: "var(--font-doc-mono, 'DM Mono', monospace)",
                fontSize: "0.6875rem",
                color: "var(--color-accent, #1C4D8D)",
                textDecoration: "underline",
                textUnderlineOffset: "2px",
                textDecorationColor: "var(--color-accent-soft, #BDE8F5)",
                wordBreak: "break-all",
              }}
            >
              {url}
            </a>
          </li>
        ))}
      </ol>
    </section>
  );
}
