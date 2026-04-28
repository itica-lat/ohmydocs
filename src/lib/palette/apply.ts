import type { BrandingProfile } from "@/types/schemas";
import { ensureFontLink } from "@/lib/fonts/loader";

/**
 * Push palette and font choices from a branding profile onto the document.
 * UI fonts are loaded once in index.html — this only touches document fonts.
 */
export function applyBranding(profile: BrandingProfile): void {
  const root = document.documentElement;
  const tokenMap: Record<string, string> = {
    "--color-ink-deepest": profile.palette["ink-deepest"],
    "--color-ink-deep": profile.palette["ink-deep"],
    "--color-accent": profile.palette.accent,
    "--color-accent-soft": profile.palette["accent-soft"],
    "--color-paper": profile.palette.paper,
    "--color-paper-soft": profile.palette["paper-soft"],
    "--color-rule": profile.palette.rule,
    "--color-mute": profile.palette.mute,
    "--color-ink-on-dark": profile.palette["ink-on-dark"],
    "--font-doc-serif": `'${profile.fonts.serif.family}', Georgia, serif`,
    "--font-doc-sans": `'${profile.fonts.sans.family}', system-ui, sans-serif`,
    "--font-doc-mono": `'${profile.fonts.mono.family}', ui-monospace, monospace`,
  };
  for (const [k, v] of Object.entries(tokenMap)) root.style.setProperty(k, v);

  ensureFontLink("ohmydocs-doc-fonts", [
    profile.fonts.serif,
    profile.fonts.sans,
    profile.fonts.mono,
  ]);
}
