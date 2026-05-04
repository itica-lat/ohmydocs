import { useState, useEffect, useRef } from "react";
import { useReferenceStore } from "./ReferenceStore";

// ── Tooltip ───────────────────────────────────────────────────────────────────

interface TooltipProps {
  url: string;
  visible: boolean;
}

function Tooltip({ url, visible }: TooltipProps) {
  return (
    <span
      role="tooltip"
      style={{
        position: "absolute",
        bottom: "calc(100% + 6px)",
        left: "50%",
        transform: "translateX(-50%)",
        background: "#1C4D8D",
        color: "#fff",
        fontFamily: "var(--font-ui-mono, 'DM Mono', monospace)",
        fontSize: "0.6875rem",
        padding: "4px 8px",
        borderRadius: "4px",
        whiteSpace: "nowrap",
        pointerEvents: "none",
        opacity: visible ? 1 : 0,
        transition: "opacity 0.12s ease",
        zIndex: 100,
        maxWidth: "320px",
        overflow: "hidden",
        textOverflow: "ellipsis",
      }}
    >
      {url}
    </span>
  );
}

// ── External link icon (↗ style, inline SVG) ──────────────────────────────────

function ExternalLinkIcon() {
  return (
    <svg
      aria-hidden="true"
      width="10"
      height="10"
      viewBox="0 0 10 10"
      fill="none"
      style={{ display: "inline", verticalAlign: "middle", marginLeft: "2px" }}
    >
      <path
        d="M5.5 1.5H8.5V4.5M8.5 1.5L4 6M2 3.5H1.5A.5.5 0 001 4v4.5a.5.5 0 00.5.5H6a.5.5 0 00.5-.5V8"
        stroke="currentColor"
        strokeWidth="1.2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

// ── Public component ──────────────────────────────────────────────────────────

export interface InlineLinkProps {
  /** Display text for the link. */
  label: string;
  /** The destination URL. */
  url: string;
}

/**
 * Renders an anchor with an external-link icon and a numbered superscript.
 * Registers the link in the global ReferenceStore on mount so ReferenceList
 * can render the full reference table.
 */
export function InlineLink({ label, url }: InlineLinkProps) {
  const register = useReferenceStore((s) => s.register);
  const [refNumber, setRefNumber] = useState<number | null>(null);
  const [tooltipVisible, setTooltipVisible] = useState(false);
  const registeredRef = useRef(false);

  useEffect(() => {
    if (registeredRef.current) return;
    registeredRef.current = true;
    setRefNumber(register(label, url));
  }, [label, url, register]);

  return (
    <span style={{ position: "relative", display: "inline" }}>
      <a
        href={url}
        target="_blank"
        rel="noopener noreferrer"
        onMouseEnter={() => setTooltipVisible(true)}
        onMouseLeave={() => setTooltipVisible(false)}
        onFocus={() => setTooltipVisible(true)}
        onBlur={() => setTooltipVisible(false)}
        style={{
          color: "var(--color-accent, #1C4D8D)",
          textDecoration: "underline",
          textUnderlineOffset: "2px",
          textDecorationColor: "var(--color-accent-soft, #BDE8F5)",
        }}
      >
        {label}
        <ExternalLinkIcon />
        {refNumber !== null && (
          <sup
            style={{
              fontSize: "0.65em",
              marginLeft: "1px",
              color: "#4988C4",
              fontFamily: "var(--font-ui-mono, 'DM Mono', monospace)",
            }}
          >
            [{refNumber}]
          </sup>
        )}
      </a>
      <Tooltip url={url} visible={tooltipVisible} />
    </span>
  );
}
