import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";
import type { Block, Template } from "../state";

export function registerTemplateTools(server: McpServer): void {
  server.tool(
    "list_templates",
    "List all available templates with name, description, and block count",
    {},
    async () => {
      const { stateManager } = await import("../state");
      const templates = stateManager.listTemplates();
      if (templates.length === 0) {
        return { content: [{ type: "text", text: "No templates available." }] };
      }
      const summary = templates
        .map(
          (t) =>
            `[${t.id}] "${t.name}" — ${t.description} (${t.blocks.length} blocks)${t.readOnly ? " [read-only]" : ""}`,
        )
        .join("\n");
      return {
        content: [{ type: "text", text: `Templates (${templates.length}):\n${summary}` }],
      };
    },
  );

  server.tool(
    "get_template",
    "Get a complete template by its ID with all blocks and branding",
    {
      id: z.string().describe("Template ID"),
    },
    async ({ id }) => {
      const { stateManager } = await import("../state");
      const tpl = stateManager.getTemplate(id);
      if (!tpl) {
        return {
          content: [{ type: "text", text: `Error: template "${id}" not found` }],
          isError: true,
        };
      }
      return { content: [{ type: "text", text: JSON.stringify(tpl, null, 2) }] };
    },
  );

  server.tool(
    "instantiate_template",
    "Create a new document from a template, copying its blocks and branding",
    {
      templateId: z.string().describe("Template ID to instantiate"),
      title: z.string().optional().describe("Optional override document title"),
    },
    async ({ templateId, title }) => {
      const { stateManager } = await import("../state");
      const doc = stateManager.instantiateTemplate(templateId);
      if (!doc) {
        return {
          content: [{ type: "text", text: `Error: template "${templateId}" not found` }],
          isError: true,
        };
      }
      if (title) {
        stateManager.updateDocument(doc.id, { title });
        doc.title = title;
      }
      return {
        content: [
          {
            type: "text",
            text: `Document "${doc.title}" created from template "${templateId}" [${doc.id}] with ${doc.blocks.length} blocks.`,
          },
        ],
      };
    },
  );

  server.tool(
    "create_template",
    "Create a new template from an existing document or from scratch",
    {
      name: z.string().min(1).describe("Template name"),
      description: z.string().default("").describe("Template description"),
      sourceDocumentId: z
        .string()
        .optional()
        .describe("Document ID to copy blocks and branding from"),
      blocks: z
        .array(z.record(z.string(), z.unknown()))
        .optional()
        .describe("Blocks array (if not copying from a document)"),
    },
    async ({ name, description, sourceDocumentId, blocks }) => {
      const { stateManager, ulid, ETERNUM_BRANDING, nowISO } = await import("../state");
      const id = `tpl:custom-${ulid().toLowerCase()}`;
      const now = nowISO();

      let tplBlocks: Block[];
      let branding = ETERNUM_BRANDING;
      let defaultMetadata: Record<string, unknown> = {};

      if (sourceDocumentId) {
        const doc = stateManager.getDocument(sourceDocumentId);
        if (!doc) {
          return {
            content: [
              { type: "text", text: `Error: source document "${sourceDocumentId}" not found` },
            ],
            isError: true,
          };
        }
        tplBlocks = doc.blocks.map((b) => ({ ...b }));
        const br = stateManager.getBrandingProfile(doc.brandingId);
        if (br) branding = br;
        defaultMetadata = {
          team: doc.metadata.team,
          institution: doc.metadata.institution,
          customFields: doc.metadata.customFields,
        };
      } else if (blocks) {
        tplBlocks = blocks.map((b) => ({
          id: `blk_${ulid()}`,
          type: (b.type as string) || "paragraph",
          createdAt: now,
          updatedAt: now,
          ...b,
        })) as unknown as Block[];
      } else {
        return {
          content: [
            {
              type: "text",
              text: "Error: provide either sourceDocumentId or blocks to create a template.",
            },
          ],
          isError: true,
        };
      }

      const tpl = {
        id,
        name,
        description,
        blocks: tplBlocks,
        branding,
        defaultMetadata: defaultMetadata as Record<string, unknown> as Template["defaultMetadata"],
        readOnly: false,
        createdAt: now,
        updatedAt: now,
      };
      stateManager.upsertTemplate(tpl as unknown as Template);
      return {
        content: [
          {
            type: "text",
            text: `Template "${name}" created [${id}] with ${tplBlocks.length} blocks.`,
          },
        ],
      };
    },
  );

  server.tool(
    "delete_template",
    "Delete a custom template (cannot delete built-in read-only templates)",
    {
      id: z.string().describe("Template ID to delete"),
    },
    async ({ id }) => {
      const { stateManager } = await import("../state");
      const deleted = stateManager.deleteTemplate(id);
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
      return { content: [{ type: "text", text: `Template "${id}" deleted.` }] };
    },
  );
}
