import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";

export function registerBrandingTools(server: McpServer): void {
  server.tool(
    "list_branding_profiles",
    "List all branding profiles with id, name, and readOnly status",
    {},
    async () => {
      // dynamic import to avoid circular deps at parse time
      const { stateManager } = await import("../state");
      const profiles = stateManager.listBrandingProfiles();
      if (profiles.length === 0) {
        return { content: [{ type: "text", text: "No branding profiles." }] };
      }
      const summary = profiles
        .map(
          (p) =>
            `[${p.id}] "${p.name}"${p.readOnly ? " (read-only)" : ""}`,
        )
        .join("\n");
      return {
        content: [{ type: "text", text: `Branding profiles (${profiles.length}):\n${summary}` }],
      };
    },
  );

  server.tool(
    "get_branding_profile",
    "Get a branding profile by its ID with all palette and font details",
    {
      id: z.string().describe("Branding profile ID"),
    },
    async ({ id }) => {
      const { stateManager } = await import("../state");
      const profile = stateManager.getBrandingProfile(id);
      if (!profile) {
        return {
          content: [{ type: "text", text: `Error: branding profile "${id}" not found` }],
          isError: true,
        };
      }
      return { content: [{ type: "text", text: JSON.stringify(profile, null, 2) }] };
    },
  );

  server.tool(
    "create_branding_profile",
    "Create a new branding profile with palette colors, fonts, and optional logo",
    {
      name: z.string().min(1).describe("Profile name"),
      palette: z
        .record(z.string(), z.string())
        .optional()
        .describe("Custom palette tokens (hex colors). Keys like: color-ink-deepest, color-accent, color-paper"),
      fontFamily: z.string().optional().describe("Primary sans font family name (e.g. 'Inter')"),
      serifFont: z.string().optional().describe("Serif font family name"),
      monoFont: z.string().optional().describe("Mono font family name"),
    },
    async ({ name, palette, fontFamily, serifFont, monoFont }) => {
      const { stateManager, ulid, ETERNUM_BRANDING } = await import("../state");
      const id = `branding:${ulid().toLowerCase()}`;
      const profile = {
        id,
        name,
        palette: palette || { ...ETERNUM_BRANDING.palette },
        fonts: {
          serif: ETERNUM_BRANDING.fonts.serif,
          sans: {
            family: fontFamily || ETERNUM_BRANDING.fonts.sans.family,
            weights: [400, 500, 700],
            italics: true,
            category: "sans" as const,
          },
          mono: {
            family: monoFont || ETERNUM_BRANDING.fonts.mono.family,
            weights: [400, 500],
            italics: false,
            category: "mono" as const,
          },
        },
        logo: null,
        banner: null,
        readOnly: false,
      };
      if (serifFont) {
        profile.fonts.serif = {
          family: serifFont,
          weights: [400],
          italics: false,
          category: "serif" as const,
        };
      }
      stateManager.upsertBrandingProfile(profile);
      return {
        content: [{ type: "text", text: `Branding profile "${name}" created [${id}]` }],
      };
    },
  );

  server.tool(
    "update_branding_profile",
    "Update palette colors or font settings of a branding profile",
    {
      id: z.string().describe("Branding profile ID"),
      name: z.string().optional().describe("New profile name"),
      palette: z
        .record(z.string(), z.string())
        .optional()
        .describe("Partial palette tokens to update (hex colors)"),
      fontFamily: z.string().optional().describe("Sans font family name"),
      serifFont: z.string().optional().describe("Serif font family name"),
      monoFont: z.string().optional().describe("Mono font family name"),
    },
    async ({ id, name, palette, fontFamily, serifFont, monoFont }) => {
      const { stateManager } = await import("../state");
      const existing = stateManager.getBrandingProfile(id);
      if (!existing) {
        return {
          content: [{ type: "text", text: `Error: branding profile "${id}" not found` }],
          isError: true,
        };
      }
      if (existing.readOnly) {
        return {
          content: [{ type: "text", text: `Error: branding profile "${id}" is read-only` }],
          isError: true,
        };
      }
      const updates: Record<string, unknown> = {};
      if (name !== undefined) updates.name = name;
      if (palette !== undefined) {
        updates.palette = { ...existing.palette, ...palette };
      }
      if (fontFamily !== undefined || serifFont !== undefined || monoFont !== undefined) {
        const fonts = { ...existing.fonts };
        if (fontFamily !== undefined) {
          fonts.sans = { ...fonts.sans, family: fontFamily };
        }
        if (serifFont !== undefined) {
          fonts.serif = { ...fonts.serif, family: serifFont };
        }
        if (monoFont !== undefined) {
          fonts.mono = { ...fonts.mono, family: monoFont };
        }
        updates.fonts = fonts;
      }
      stateManager.upsertBrandingProfile({ ...existing, ...updates });
      return {
        content: [{ type: "text", text: `Branding profile "${id}" updated.` }],
      };
    },
  );

  server.tool(
    "delete_branding_profile",
    "Delete a custom branding profile (cannot delete the default Eternum profile)",
    {
      id: z.string().describe("Branding profile ID to delete"),
    },
    async ({ id }) => {
      const { stateManager } = await import("../state");
      const deleted = stateManager.deleteBrandingProfile(id);
      if (!deleted) {
        return {
          content: [
            {
              type: "text",
              text: `Error: cannot delete "${id}". It may be read-only or not found.`,
            },
          ],
          isError: true,
        };
      }
      return { content: [{ type: "text", text: `Branding profile "${id}" deleted.` }] };
    },
  );
}
