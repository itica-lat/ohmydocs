export type FontCategory = "serif" | "sans" | "mono";

export interface GoogleFontRef {
  family: string;
  weights: number[];
  italics: boolean;
  category: FontCategory;
}

export const ETERNUM_DOC_FONTS = {
  serif: {
    family: "Playfair Display",
    weights: [400, 700],
    italics: true,
    category: "serif",
  },
  sans: {
    family: "Inter",
    weights: [400, 500, 600],
    italics: false,
    category: "sans",
  },
  mono: {
    family: "IBM Plex Mono",
    weights: [400, 500],
    italics: false,
    category: "mono",
  },
} as const satisfies Record<FontCategory, GoogleFontRef>;

export const UI_FONTS = {
  serif: {
    family: "DM Serif Display",
    weights: [400],
    italics: true,
    category: "serif",
  },
  sans: {
    family: "DM Sans",
    weights: [400, 500, 600, 700],
    italics: false,
    category: "sans",
  },
  mono: {
    family: "DM Mono",
    weights: [400, 500],
    italics: true,
    category: "mono",
  },
} as const satisfies Record<FontCategory, GoogleFontRef>;

export function buildGoogleFontsHref(refs: GoogleFontRef[]): string {
  const families = refs
    .map((ref) => {
      const axes: string[] = [];
      if (ref.italics) axes.push("ital");
      axes.push("wght");
      const tuples: string[] = [];
      if (ref.italics) {
        for (const w of ref.weights) tuples.push(`0,${w}`);
        for (const w of ref.weights) tuples.push(`1,${w}`);
      } else {
        for (const w of ref.weights) tuples.push(`${w}`);
      }
      const family = ref.family.replace(/\s+/g, "+");
      return `family=${family}:${axes.join(",")}@${tuples.join(";")}`;
    })
    .join("&");
  return `https://fonts.googleapis.com/css2?${families}&display=swap`;
}
