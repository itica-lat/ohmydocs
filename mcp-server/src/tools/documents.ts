import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";
import type { Block, OhmyDocument } from "../state";

export function registerDocumentTools(server: McpServer): void {
  server.tool(
    "list_documents",
    "List all documents with title, author, team, and updated date",
    {
      includeDetails: z
        .boolean()
        .optional()
        .default(false)
        .describe("Set true to return full document content, not just metadata"),
    },
    async ({ includeDetails }) => {
      const { stateManager: sm } = await import("../state");
      const docs = sm.listDocuments();
      if (docs.length === 0) {
        return { content: [{ type: "text", text: "No documents." }] };
      }
      if (includeDetails) {
        return {
          content: [{ type: "text", text: JSON.stringify(docs, null, 2) }],
        };
      }
      const summary = docs
        .map(
          (d) =>
            `[${d.id}] "${d.title}" — Author: ${d.metadata.author || "(none)"}, Team: ${d.metadata.team || "(none)"}, Blocks: ${d.blocks.length}, Updated: ${d.updatedAt.slice(0, 10)}`,
        )
        .join("\n");
      return {
        content: [{ type: "text", text: `Documents (${docs.length}):\n${summary}` }],
      };
    },
  );

  server.tool(
    "get_document",
    "Get a complete document by its ID with all blocks, metadata, and branding",
    {
      id: z.string().describe("The document ID (e.g. doc_XXXX)"),
    },
    async ({ id }) => {
      const { stateManager: sm } = await import("../state");
      const doc = sm.getDocument(id);
      if (!doc) {
        return {
          content: [{ type: "text", text: `Error: document "${id}" not found` }],
          isError: true,
        };
      }
      return { content: [{ type: "text", text: JSON.stringify(doc, null, 2) }] };
    },
  );

  server.tool(
    "create_document",
    "Create a new empty document with optional title",
    {
      title: z.string().optional().default("Untitled document").describe("Document title"),
    },
    async ({ title }) => {
      const { stateManager: sm } = await import("../state");
      const doc = sm.createDocument(title);
      return {
        content: [
          {
            type: "text",
            text: `Document created: "${doc.title}" [${doc.id}]`,
          },
        ],
      };
    },
  );

  server.tool(
    "update_document_metadata",
    "Update a document's title and/or metadata fields",
    {
      id: z.string().describe("Document ID"),
      title: z.string().optional().describe("New title"),
      author: z.string().optional().describe("Author name"),
      team: z.string().optional().describe("Team name"),
      institution: z.string().optional().describe("Institution name"),
      date: z.string().optional().describe("Document date (YYYY-MM-DD)"),
      brandingId: z.string().optional().describe("Branding profile ID"),
    },
    async ({ id, ...meta }) => {
      const { stateManager: sm } = await import("../state");
      const doc = sm.getDocument(id);
      if (!doc) {
        return {
          content: [{ type: "text", text: `Error: document "${id}" not found` }],
          isError: true,
        };
      }
      const updates: Record<string, unknown> = {};
      if (meta.title !== undefined) updates.title = meta.title;
      if (meta.brandingId !== undefined) updates.brandingId = meta.brandingId;

      const metadataUpdates: Record<string, unknown> = {};
      if (meta.author !== undefined) metadataUpdates.author = meta.author;
      if (meta.team !== undefined) metadataUpdates.team = meta.team;
      if (meta.institution !== undefined) metadataUpdates.institution = meta.institution;
      if (meta.date !== undefined) metadataUpdates.date = meta.date;

      if (Object.keys(metadataUpdates).length > 0) {
        updates.metadata = { ...doc.metadata, ...metadataUpdates };
      }

      if (Object.keys(updates).length === 0) {
        return { content: [{ type: "text", text: "No fields to update." }] };
      }

      sm.updateDocument(id, updates as Partial<typeof doc>);
      const updated = sm.getDocument(id)!;
      return {
        content: [
          {
            type: "text",
            text: `Document "${updated.title}" [${id}] updated.\nChanged: ${Object.keys({ ...meta })
              .filter((k) => meta[k as keyof typeof meta] !== undefined)
              .join(", ")}`,
          },
        ],
      };
    },
  );

  server.tool(
    "set_document_blocks",
    "Replace all blocks in a document with a new set of blocks",
    {
      id: z.string().describe("Document ID"),
      blocks: z
        .array(z.record(z.string(), z.unknown()))
        .describe("Array of block objects, each must have { id, type }"),
    },
    async ({ id, blocks }) => {
      const { stateManager: sm, ulid, nowISO } = await import("../state");
      const doc = sm.getDocument(id);
      if (!doc) {
        return {
          content: [{ type: "text", text: `Error: document "${id}" not found` }],
          isError: true,
        };
      }
      const now = nowISO();
      const typedBlocks = blocks.map((b) => ({
        id: (b.id as string) || `blk_${ulid()}`,
        type: (b.type as string) || "paragraph",
        createdAt: (b.createdAt as string) || now,
        updatedAt: now,
        ...b,
      })) as unknown as Block[];
      sm.updateDocument(id, { blocks: typedBlocks } as Partial<OhmyDocument>);
      return {
        content: [{ type: "text", text: `Document ${id}: ${typedBlocks.length} blocks updated.` }],
      };
    },
  );

  server.tool(
    "delete_document",
    "Delete a document by its ID",
    {
      id: z.string().describe("Document ID to delete"),
    },
    async ({ id }) => {
      const { stateManager: sm } = await import("../state");
      const deleted = sm.deleteDocument(id);
      if (!deleted) {
        return {
          content: [{ type: "text", text: `Error: document "${id}" not found` }],
          isError: true,
        };
      }
      return { content: [{ type: "text", text: `Document ${id} deleted.` }] };
    },
  );
}
