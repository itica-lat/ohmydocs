import { buildGoogleFontsHref, type GoogleFontRef } from "./catalog";

/**
 * Inject (or replace) a <link> for the given font set under a stable id.
 * Use ids like "ohmydocs-ui-fonts" and "ohmydocs-doc-fonts" to keep UI and
 * document fonts independent.
 */
export function ensureFontLink(id: string, refs: GoogleFontRef[]): void {
  const href = buildGoogleFontsHref(refs);
  let link = document.getElementById(id) as HTMLLinkElement | null;
  if (!link) {
    link = document.createElement("link");
    link.id = id;
    link.rel = "stylesheet";
    document.head.appendChild(link);
  }
  if (link.href !== href) link.href = href;
}

type PreconnectTarget = {
  id: string;
  href: string;
  crossorigin?: boolean;
};

export function ensurePreconnects(): void {
  const targets: PreconnectTarget[] = [
    { id: "ohmydocs-pc-google", href: "https://fonts.googleapis.com" },
    {
      id: "ohmydocs-pc-gstatic",
      href: "https://fonts.gstatic.com",
      crossorigin: true,
    },
  ];
  for (const t of targets) {
    if (document.getElementById(t.id)) continue;
    const l = document.createElement("link");
    l.id = t.id;
    l.rel = "preconnect";
    l.href = t.href;
    if (t.crossorigin) l.crossOrigin = "anonymous";
    document.head.appendChild(l);
  }
}
