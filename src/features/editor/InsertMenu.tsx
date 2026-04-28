import { useEffect, useMemo, useRef, useState } from "react";
import * as Icons from "lucide-react";
import { listBlockDefs } from "@/blocks/registry";
import type { BlockType } from "@/blocks/types";

interface Props {
  onInsert: (type: BlockType) => void;
}

export function InsertMenu({ onInsert }: Props) {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);
  const defs = useMemo(() => listBlockDefs(), []);
  const filtered = useMemo(
    () => defs.filter((d) => d.label.toLowerCase().includes(query.toLowerCase())),
    [defs, query],
  );

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "/" && !isTyping(e.target)) {
        e.preventDefault();
        setOpen(true);
        setQuery("");
      } else if (e.key === "Escape") {
        setOpen(false);
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  useEffect(() => {
    if (open) inputRef.current?.focus();
  }, [open]);

  const grouped = useMemo(() => {
    const out: Record<string, typeof defs> = {};
    for (const d of filtered) {
      out[d.category] ??= [];
      out[d.category]!.push(d);
    }
    return out;
  }, [filtered]);

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        style={{
          display: "inline-flex",
          alignItems: "center",
          gap: "0.4rem",
          padding: "0.4rem 0.75rem",
          background: "var(--color-ink-deepest)",
          color: "var(--color-ink-on-dark)",
          border: "none",
          borderRadius: "4px",
          fontFamily: "var(--font-ui-sans)",
          fontSize: "0.8125rem",
          cursor: "pointer",
        }}
      >
        <Icons.Plus size={14} />
        Add block
      </button>

      {open && (
        <div
          role="dialog"
          onClick={() => setOpen(false)}
          style={{
            position: "fixed",
            inset: 0,
            background: "rgba(15,40,84,0.35)",
            display: "grid",
            placeItems: "center",
            zIndex: 50,
          }}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            style={{
              width: 480,
              background: "var(--color-paper)",
              border: "var(--rule)",
              borderRadius: "var(--radius-block)",
              padding: "1rem",
              boxShadow: "0 12px 32px rgba(15,40,84,0.18)",
            }}
          >
            <input
              ref={inputRef}
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search blocks…"
              style={{
                width: "100%",
                padding: "0.5rem 0.75rem",
                border: "var(--rule)",
                borderRadius: "4px",
                background: "var(--color-paper-soft)",
                outline: "none",
                fontFamily: "var(--font-ui-sans)",
                marginBottom: "0.75rem",
              }}
            />
            {Object.entries(grouped).map(([cat, items]) => (
              <div key={cat} style={{ marginBottom: "0.75rem" }}>
                <div
                  style={{
                    fontFamily: "var(--font-ui-mono)",
                    fontSize: "0.6875rem",
                    color: "var(--color-mute)",
                    textTransform: "uppercase",
                    letterSpacing: "0.08em",
                    margin: "0.25rem 0",
                  }}
                >
                  {cat}
                </div>
                <div
                  style={{
                    display: "grid",
                    gridTemplateColumns: "1fr 1fr",
                    gap: "4px",
                  }}
                >
                  {items.map((d) => {
                    const Icon =
                      // eslint-disable-next-line @typescript-eslint/no-explicit-any
                      (Icons as any)[d.iconName] ?? Icons.Square;
                    return (
                      <button
                        key={d.type}
                        type="button"
                        onClick={() => {
                          onInsert(d.type);
                          setOpen(false);
                        }}
                        style={{
                          display: "flex",
                          alignItems: "center",
                          gap: "0.5rem",
                          padding: "0.5rem 0.75rem",
                          background: "transparent",
                          border: "var(--rule)",
                          borderRadius: "4px",
                          cursor: "pointer",
                          color: "var(--color-ink-deepest)",
                          fontFamily: "var(--font-ui-sans)",
                          fontSize: "0.8125rem",
                          textAlign: "left",
                        }}
                      >
                        <Icon size={14} style={{ color: "var(--color-accent)" }} />
                        {d.label}
                      </button>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </>
  );
}

function isTyping(target: EventTarget | null): boolean {
  if (!(target instanceof HTMLElement)) return false;
  const tag = target.tagName;
  return tag === "INPUT" || tag === "TEXTAREA" || target.isContentEditable;
}
