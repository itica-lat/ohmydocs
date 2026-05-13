import { z } from "zod";
import { PALETTE_TOKENS } from "./palette";

export const PaletteSchema = z.object(
  Object.fromEntries(
    PALETTE_TOKENS.map((k) => [k, z.string().regex(/^#[0-9a-fA-F]{6}$/)]),
  ) as Record<(typeof PALETTE_TOKENS)[number], z.ZodString>,
);

export const GoogleFontRefSchema = z.object({
  family: z.string().min(1),
  weights: z.array(z.number().int().min(100).max(900)),
  italics: z.boolean(),
  category: z.enum(["serif", "sans", "mono"]),
});

export const BrandingProfileSchema = z.object({
  id: z.string().min(1),
  name: z.string().min(1),
  palette: PaletteSchema,
  fonts: z.object({
    serif: GoogleFontRefSchema,
    sans: GoogleFontRefSchema,
    mono: GoogleFontRefSchema,
  }),
  logo: z
    .object({
      dataUrl: z.string(),
      width: z.number(),
      height: z.number(),
    })
    .nullable(),
  banner: z
    .object({
      dataUrl: z.string(),
      width: z.number(),
      height: z.number(),
    })
    .nullable(),
  readOnly: z.boolean().optional(),
});

export const HeaderConfigSchema = z.object({
  left: z.string(),
  right: z.string(),
  showOnFirstPage: z.boolean(),
  showPageNumber: z.boolean(),
});

const FooterConfigSchema = HeaderConfigSchema;

export const DocumentMetadataSchema = z.object({
  author: z.string(),
  team: z.string(),
  institution: z.string(),
  date: z.string(),
  customFields: z.record(z.string(), z.string()),
  header: HeaderConfigSchema,
  footer: FooterConfigSchema,
});

/**
 * Block schema is intentionally permissive in Phase 1: each block type's
 * payload is validated by its own folder under src/blocks in Phase 2.
 */
export const BaseBlockSchema = z.object({
  id: z.string().min(1),
  type: z.string().min(1),
  createdAt: z.string(),
  updatedAt: z.string(),
});

export const BlockSchema = BaseBlockSchema.passthrough();

export const DocumentSchema = z.object({
  id: z.string().min(1),
  title: z.string(),
  metadata: DocumentMetadataSchema,
  brandingId: z.string(),
  templateId: z.string().nullable(),
  blocks: z.array(BlockSchema),
  htmlContent: z.string().optional(),
  createdAt: z.string(),
  updatedAt: z.string(),
});

export const TemplateSchema = z.object({
  id: z.string().min(1),
  name: z.string(),
  description: z.string(),
  blocks: z.array(BlockSchema),
  branding: BrandingProfileSchema,
  defaultMetadata: DocumentMetadataSchema.partial(),
  readOnly: z.boolean().optional(),
  createdAt: z.string(),
  updatedAt: z.string(),
});

export type BrandingProfile = z.infer<typeof BrandingProfileSchema>;
export type DocumentMetadata = z.infer<typeof DocumentMetadataSchema>;
export type HeaderConfig = z.infer<typeof HeaderConfigSchema>;
export type FooterConfig = z.infer<typeof FooterConfigSchema>;
export type BaseBlock = z.infer<typeof BaseBlockSchema>;
export type Block = z.infer<typeof BlockSchema>;
export type OhmyDocument = z.infer<typeof DocumentSchema>;
export type Template = z.infer<typeof TemplateSchema>;
