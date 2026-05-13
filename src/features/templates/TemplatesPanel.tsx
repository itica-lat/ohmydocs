import { Download, FileUp, Plus, Trash2 } from "lucide-react";
import { useT } from "@/lib/i18n";
import type { CSSProperties } from "react";
import { useTemplatesStore } from "./store";
import { useDocumentsStore } from "@/features/editor/store";
import { saveTextFile, openTextFile } from "@/lib/storage/fs-access";
import { TemplateSchema, type Template } from "@/types/schemas";
import { importHtml } from "@/features/import/html";
import { importMarkdown } from "@/features/import/markdown";

export function TemplatesPanel() {
  const t = useT();
  const templates = useTemplatesStore((s) => s.templates);
  const upsertTpl = useTemplatesStore((s) => s.upsert);
  const removeTpl = useTemplatesStore((s) => s.remove);
  const instantiate = useTemplatesStore((s) => s.instantiate);
  const upsertDoc = useDocumentsStore((s) => s.upsertDocument);
  const setActive = useDocumentsStore((s) => s.setActive);

  const list = Object.values(templates).sort((a, b) => a.name.localeCompare(b.name));

  const applyTemplate = (id: string) => {
    const doc = instantiate(id);
    if (!doc) return;
    upsertDoc(doc);
    setActive(doc.id);
  };

  const exportTpl = async (t: Template) => {
    await saveTextFile(JSON.stringify(t, null, 2), {
      suggestedName: `${slug(t.name)}.ohmydocs-template.json`,
      types: [
        {
          description: "OhMyDocs template",
          accept: { "application/json": [".json"] },
        },
      ],
    });
  };

  const importTpl = async () => {
    const file = await openTextFile({
      types: [{ description: "Templates", accept: { "application/json": [".json"] } }],
    });
    if (!file) return;
    try {
      const parsed = JSON.parse(file.text);
      const result = TemplateSchema.safeParse(parsed);
      if (!result.success) {
        // eslint-disable-next-line no-alert
        alert(t("templates.invalidFile"));
        return;
      }
      upsertTpl(result.data);
    } catch {
      // eslint-disable-next-line no-alert
      alert(t("templates.couldNotParse"));
    }
  };

  const importDoc = async () => {
    const file = await openTextFile({
      types: [
        {
          description: "Markdown / HTML / OhMyDocs",
          accept: {
            "text/markdown": [".md"],
            "text/html": [".html"],
            "application/json": [".json"],
          },
        },
      ],
    });
    if (!file) return;
    if (file.name.endsWith(".html")) {
      const doc = importHtml(file.text);
      if (!doc) {
        // eslint-disable-next-line no-alert
        alert(t("templates.htmlImportNotSupported"));
        return;
      }
      upsertDoc(doc);
      setActive(doc.id);
      return;
    }
    if (file.name.endsWith(".json")) {
      try {
        const parsed = JSON.parse(file.text);
        // We allow document JSON here too
        if (parsed && typeof parsed === "object" && "blocks" in parsed) {
          upsertDoc(parsed as never);
          setActive((parsed as { id: string }).id);
        }
      } catch {
        // eslint-disable-next-line no-alert
        alert(t("templates.invalidJson"));
      }
      return;
    }
    const { document, warnings } = importMarkdown(file.text);
    upsertDoc(document);
    setActive(document.id);
    if (warnings.length) {
      // eslint-disable-next-line no-console
      console.warn("Markdown import warnings:", warnings);
    }
  };

  return (
    <div
      style={{
        padding: "1rem 1.25rem",
        display: "flex",
        flexDirection: "column",
        gap: "0.75rem",
      }}
    >
      <div style={{ display: "flex", gap: "0.5rem" }}>
        <button type="button" onClick={importTpl} style={btn}>
          <FileUp size={12} /> {t("templates.import")}
        </button>
        <button type="button" onClick={importDoc} style={btn}>
          <FileUp size={12} /> {t("templates.importDoc")}
        </button>
      </div>

      <ul
        style={{
          margin: 0,
          padding: 0,
          listStyle: "none",
          display: "flex",
          flexDirection: "column",
          gap: "0.4rem",
        }}
      >
        {list.map((tmpl) => (
          <li
            key={tmpl.id}
            style={{
              border: "var(--rule)",
              borderRadius: "var(--radius-block)",
              padding: "0.65rem 0.75rem",
              display: "flex",
              flexDirection: "column",
              gap: "0.4rem",
              background: "var(--color-paper)",
            }}
          >
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "baseline",
              }}
            >
              <strong
                style={{
                  fontFamily: "var(--font-ui-serif)",
                  fontStyle: "italic",
                  fontSize: "1rem",
                  color: "var(--color-ink-deepest)",
                }}
              >
                {tmpl.name}
              </strong>
              {tmpl.readOnly && (
                <span
                  style={{
                    fontFamily: "var(--font-ui-mono)",
                    fontSize: "0.625rem",
                    textTransform: "uppercase",
                    letterSpacing: "0.08em",
                    color: "var(--color-mute)",
                  }}
                >
                  {t("templates.readOnly")}
                </span>
              )}
            </div>
            <p
              style={{
                margin: 0,
                fontSize: "0.75rem",
                color: "var(--color-mute)",
                lineHeight: 1.4,
              }}
            >
              {tmpl.description}
            </p>
            <div style={{ display: "flex", gap: "0.4rem" }}>
              <button type="button" onClick={() => applyTemplate(tmpl.id)} style={primary}>
                <Plus size={12} /> {t("templates.use")}
              </button>
              <button type="button" onClick={() => exportTpl(tmpl)} style={btn}>
                <Download size={12} />
              </button>
              {!tmpl.readOnly && (
                <button
                  type="button"
                  onClick={() => removeTpl(tmpl.id)}
                  style={{ ...btn, color: "#C0556B" }}
                >
                  <Trash2 size={12} />
                </button>
              )}
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}

function slug(s: string): string {
  return (
    s
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-|-$/g, "") || "template"
  );
}

const btn: CSSProperties = {
  display: "inline-flex",
  alignItems: "center",
  gap: "0.25rem",
  padding: "0.3rem 0.6rem",
  background: "transparent",
  border: "var(--rule)",
  borderRadius: "4px",
  color: "var(--color-ink-deepest)",
  fontFamily: "var(--font-ui-sans)",
  fontSize: "0.75rem",
  cursor: "pointer",
};

const primary: CSSProperties = {
  ...btn,
  background: "var(--color-ink-deepest)",
  color: "var(--color-ink-on-dark)",
  border: "none",
};
