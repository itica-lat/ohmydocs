import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";

export function registerContextTools(server: McpServer): void {
  server.tool(
    "get_domain_context",
    "Get comprehensive documentation about OhMyDocs document structure, all available block types with their properties, branding system, and recommended document flow. Use this to understand how to create, read, or modify documents.",
    {
      scope: z
        .enum(["all", "blocks", "branding", "document-shape"])
        .optional()
        .default("all")
        .describe(
          "What context to return. 'all' returns everything, 'blocks' returns only block schemas, 'branding' returns branding info, 'document-shape' returns document structure.",
        ),
      blockType: z
        .string()
        .optional()
        .describe(
          "Filter to a specific block type (e.g. 'cover', 'paragraph', 'section'). Returns detailed schema for that block only.",
        ),
    },
    async ({ scope, blockType }) => {
      const { BLOCK_SCHEMAS, BRANDING_CONTEXT, DOCUMENT_SHAPE } =
        await import("../resources/domain");
      let result: Record<string, unknown> = {};

      if (blockType) {
        const schema = (BLOCK_SCHEMAS as Record<string, unknown>)[blockType];
        if (!schema) {
          return {
            content: [
              {
                type: "text",
                text: `Error: unknown block type "${blockType}". Available types: ${Object.keys(BLOCK_SCHEMAS).join(", ")}`,
              },
            ],
            isError: true,
          };
        }
        return { content: [{ type: "text", text: JSON.stringify(schema, null, 2) }] };
      }

      if (scope === "all") {
        result = {
          blockSchemas: BLOCK_SCHEMAS,
          branding: BRANDING_CONTEXT,
          documentShape: DOCUMENT_SHAPE,
        };
      } else if (scope === "blocks") {
        result = { blockSchemas: BLOCK_SCHEMAS };
      } else if (scope === "branding") {
        result = { branding: BRANDING_CONTEXT };
      } else if (scope === "document-shape") {
        result = { documentShape: DOCUMENT_SHAPE };
      }

      return { content: [{ type: "text", text: JSON.stringify(result, null, 2) }] };
    },
  );

  server.tool(
    "get_block_schema",
    "Get the complete schema for a specific block type, including all required and optional fields",
    {
      type: z
        .enum([
          "cover",
          "section",
          "subsection",
          "mono-label",
          "paragraph",
          "callout",
          "code-block",
          "divider",
          "list",
          "table",
          "metadata-grid",
          "image",
          "quote",
          "glossary-entry",
          "signature-block",
          "header-bar",
          "footer-bar",
          "page-break",
          "index",
          "spacer",
          "reference-list",
        ])
        .describe("The block type to get the schema for"),
    },
    async ({ type }) => {
      const { BLOCK_SCHEMAS } = await import("../resources/domain");
      const schema = (BLOCK_SCHEMAS as Record<string, unknown>)[type];
      return { content: [{ type: "text", text: JSON.stringify(schema, null, 2) }] };
    },
  );

  server.tool(
    "render_document_as_markdown",
    "Render an OhMyDocs document as human-readable markdown for preview or export",
    {
      id: z.string().describe("Document ID to render"),
    },
    async ({ id }) => {
      const { stateManager } = await import("../state");
      const doc = stateManager.getDocument(id);
      if (!doc) {
        return {
          content: [{ type: "text", text: `Error: document "${id}" not found` }],
          isError: true,
        };
      }

      const { BLOCK_SCHEMAS } = await import("../resources/domain");
      const lines: string[] = [];

      // Title
      lines.push(`# ${doc.title}`);
      lines.push("");

      // Metadata summary
      if (doc.metadata.author || doc.metadata.team) {
        lines.push(`**Author:** ${doc.metadata.author || "(none)"}  `);
        lines.push(`**Team:** ${doc.metadata.team || "(none)"}  `);
        lines.push(`**Date:** ${doc.metadata.date}  `);
        lines.push("");
      }

      // Blocks
      for (const block of doc.blocks) {
        const def = (BLOCK_SCHEMAS as Record<string, unknown>)[block.type] as
          | { label?: string; description?: string }
          | undefined;
        const label = def?.label || block.type;
        lines.push(`### [${label}]`);

        // Render based on type
        switch (block.type) {
          case "cover": {
            const b = block as unknown as {
              title?: string;
              label?: string;
              metadata?: Array<{ label: string; value: string }>;
              callout?: string | null;
            };
            lines.push(`**${b.title || ""}**`);
            if (b.label) lines.push(`*${b.label}*`);
            if (b.metadata) {
              for (const m of b.metadata) {
                lines.push(`- ${m.label}: ${m.value}`);
              }
            }
            if (b.callout) lines.push(`> ${b.callout}`);
            break;
          }
          case "section": {
            const b = block as unknown as { number?: string; heading?: string; lead?: string };
            lines.push(`**${b.number || ""} — ${b.heading || ""}**`);
            if (b.lead) lines.push(b.lead);
            break;
          }
          case "subsection": {
            const b = block as unknown as { heading?: string };
            lines.push(`### ${b.heading || ""}`);
            break;
          }
          case "mono-label": {
            const b = block as unknown as { text?: string };
            lines.push(`\`${b.text || ""}\``);
            break;
          }
          case "paragraph": {
            const b = block as unknown as { text?: string };
            lines.push(b.text || "");
            break;
          }
          case "callout": {
            const b = block as unknown as { variant?: string; label?: string; body?: string };
            lines.push(`> **${b.variant?.toUpperCase()}**: ${b.label || ""}`);
            lines.push(`> ${b.body || ""}`);
            break;
          }
          case "code-block": {
            const b = block as unknown as { language?: string; code?: string };
            lines.push("```" + (b.language || ""));
            lines.push(b.code || "");
            lines.push("```");
            break;
          }
          case "list": {
            const b = block as unknown as { ordered?: boolean; items?: string[] };
            if (b.items) {
              for (let i = 0; i < b.items.length; i++) {
                lines.push(`${b.ordered ? `${i + 1}.` : "-"} ${b.items[i]}`);
              }
            }
            break;
          }
          case "table": {
            const b = block as unknown as { headers?: string[]; rows?: string[][] };
            if (b.headers) lines.push(`| ${b.headers.join(" | ")} |`);
            if (b.headers) lines.push(`| ${b.headers.map(() => "---").join(" | ")} |`);
            if (b.rows) {
              for (const row of b.rows) {
                lines.push(`| ${row.join(" | ")} |`);
              }
            }
            break;
          }
          case "quote": {
            const b = block as unknown as { text?: string; attribution?: string };
            lines.push(`> ${b.text || ""}`);
            if (b.attribution) lines.push(`> — ${b.attribution}`);
            break;
          }
          case "image": {
            const b = block as unknown as { src?: string; alt?: string; caption?: string };
            lines.push(`![${b.alt || ""}](${b.src || ""})`);
            if (b.caption) lines.push(`*${b.caption}*`);
            break;
          }
          case "signature-block": {
            const b = block as unknown as {
              slots?: Array<{ name: string; role: string; description: string }>;
            };
            if (b.slots) {
              for (const s of b.slots) {
                lines.push(`- **${s.role}**: ${s.name || "____"} — ${s.description}`);
              }
            }
            break;
          }
          case "glossary-entry": {
            const b = block as unknown as {
              entries?: Array<{ term: string; expansion: string; context: string }>;
            };
            if (b.entries) {
              for (const e of b.entries) {
                lines.push(`- **${e.term}**: ${e.expansion} — ${e.context}`);
              }
            }
            break;
          }
          case "header-bar":
          case "footer-bar": {
            const b = block as unknown as { left?: string; right?: string };
            lines.push(`[${b.left || ""} | ${b.right || ""}]`);
            break;
          }
          case "divider":
          case "page-break":
            lines.push("---");
            break;
          case "spacer": {
            const b = block as unknown as { size?: string };
            lines.push(`*spacer (${b.size || "md"})*`);
            break;
          }
          case "metadata-grid": {
            const b = block as unknown as { entries?: Array<{ label: string; value: string }> };
            if (b.entries) {
              for (const e of b.entries) {
                lines.push(`- ${e.label}: ${e.value}`);
              }
            }
            break;
          }
          default:
            lines.push(
              `*[${block.type} block with ${Object.keys(block).filter((k) => !["id", "type", "createdAt", "updatedAt"].includes(k)).length} fields]*`,
            );
        }
        lines.push("");
      }

      return { content: [{ type: "text", text: lines.join("\n") }] };
    },
  );
}
