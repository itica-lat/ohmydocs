// deps needed before running: bun add elysia @react-pdf/renderer
import { Elysia, t } from "elysia";
import { renderDocumentToPdf } from "./pdf-renderer";
import type { OhmyDocument, BrandingProfile } from "../src/types/schemas";

const PORT = 3001;

const app = new Elysia()
  .post(
    "/api/export/pdf",
    async ({ body }) => {
      const {
        document: doc,
        branding,
        filename = "document.pdf",
      } = body as {
        document: OhmyDocument;
        branding: BrandingProfile;
        filename?: string;
      };

      let pdf: Buffer;
      try {
        pdf = await renderDocumentToPdf(doc, branding);
      } catch (err) {
        const msg = err instanceof Error ? err.message : String(err);
        console.error("[pdf] render error:", msg);
        return new Response(JSON.stringify({ error: msg }), {
          status: 500,
          headers: { "Content-Type": "application/json" },
        });
      }

      return new Response(pdf, {
        headers: {
          "Content-Type": "application/pdf",
          "Content-Disposition": `attachment; filename="${filename}"`,
        },
      });
    },
    {
      body: t.Object({
        document: t.Any(),
        branding: t.Any(),
        filename: t.Optional(t.String()),
      }),
    },
  )
  .listen(PORT);

console.log(`PDF server listening on http://localhost:${PORT}`);
export type App = typeof app;
