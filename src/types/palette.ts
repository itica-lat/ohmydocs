export const PALETTE_TOKENS = [
  "ink-deepest",
  "ink-deep",
  "accent",
  "accent-soft",
  "paper",
  "paper-soft",
  "rule",
  "mute",
  "ink-on-dark",
] as const;

export type PaletteToken = (typeof PALETTE_TOKENS)[number];
export type Palette = Record<PaletteToken, string>;

export const ETERNUM_PALETTE: Palette = {
  "ink-deepest": "#0F2854",
  "ink-deep": "#1C4D8D",
  accent: "#4988C4",
  "accent-soft": "#BDE8F5",
  paper: "#FFFFFF",
  "paper-soft": "#F7F9FC",
  rule: "#E2E8F0",
  mute: "#6B7B8C",
  "ink-on-dark": "#E8F0FA",
};
