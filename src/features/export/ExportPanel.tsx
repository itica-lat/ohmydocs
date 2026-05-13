import { useCallback, useState, type ReactNode } from "react";
import { FileDown, Download, FileText, Bug } from "lucide-react";
import { useDocumentsStore } from "@/features/editor/store";
import { useBrandingStore } from "@/features/branding/store";
import { exportToHtml } from "@/lib/export/html";
import { exportToMarkdown } from "@/lib/export/markdown";
import { exportToPdf } from "@/lib/export/pdf";
import { saveTextFile } from "@/lib/storage/fs-access";
import { useT } from "@/lib/i18n";

const DEV = typeof import.meta !== "undefined" ? import.meta.env.DEV : false;

function slug(s: string): string {
  return (
    s
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-|-$/g, "") || "document"
  );
}

export function ExportPanel() {
  const activeId = useDocumentsStore((s) => s.activeId);
  const documents = useDocumentsStore((s) => s.documents);
  const profiles = useBrandingStore((s) => s.profiles);
  const activeBrandingId = useBrandingStore((s) => s.activeId);
  const t = useT();
  const [pdfLoading, setPdfLoading] = useState(false);
  const [pdfError, setPdfError] = useState<{
    message: string;
    name?: string;
    stack?: string;
  } | null>(null);

  const doc = activeId ? documents[activeId] : null;
  const branding = doc ? (profiles[activeBrandingId] ?? profiles[doc.brandingId]) : null;

  const onExportHtml = useCallback(async () => {
    if (!doc || !branding) return;
    const html = exportToHtml({ document: doc, branding });
    await saveTextFile(
      html,
      {
        suggestedName: `${slug(doc.title)}.html`,
        types: [{ description: "HTML", accept: { "text/html": [".html"] } }],
      },
      "text/html",
    );
  }, [doc, branding]);

  const onExportMd = useCallback(async () => {
    if (!doc) return;
    const md = exportToMarkdown(doc);
    await saveTextFile(
      md,
      {
        suggestedName: `${slug(doc.title)}.md`,
        types: [{ description: "Markdown", accept: { "text/markdown": [".md"] } }],
      },
      "text/markdown",
    );
  }, [doc]);

  const onExportPdf = useCallback(async () => {
    if (!doc || !branding) return;
    setPdfLoading(true);
    setPdfError(null);
    try {
      const blob = await exportToPdf(doc, branding);
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `${slug(doc.title)}.pdf`;
      a.click();
      URL.revokeObjectURL(url);
    } catch (err) {
      if (err instanceof Error) {
        setPdfError(
          err.stack
            ? { message: err.message, name: err.name, stack: err.stack }
            : { message: err.message, name: err.name },
        );
      } else {
        setPdfError({ message: String(err) });
      }
      // eslint-disable-next-line no-console
      console.error("[PDF export]", err);
    } finally {
      setPdfLoading(false);
    }
  }, [doc, branding]);

  const onExportJson = useCallback(async () => {
    if (!doc) return;
    await saveTextFile(JSON.stringify(doc, null, 2), {
      suggestedName: `${slug(doc.title)}.ohmydocs.json`,
      types: [
        {
          description: "OhMyDocs document",
          accept: { "application/json": [".json"] },
        },
      ],
    });
  }, [doc]);

  if (!doc) {
    return <NoDocHint />;
  }

  return (
    <div className="p-4 flex flex-col gap-2">
      <ExportBtn
        onClick={onExportHtml}
        icon={<FileDown size={14} />}
        label={t("export.html")}
        desc=".html with inline styles"
      />
      <ExportBtn
        onClick={onExportMd}
        icon={<FileDown size={14} />}
        label={t("export.md")}
        desc=".md with YAML frontmatter"
      />
      <ExportBtn
        onClick={onExportJson}
        icon={<Download size={14} />}
        label={t("export.json")}
        desc=".ohmydocs.json source"
      />
      <ExportBtn
        onClick={onExportPdf}
        icon={<FileDown size={14} />}
        label={pdfLoading ? t("export.pdf.loading") : t("export.pdf")}
        desc=".pdf client-side, no server"
        disabled={pdfLoading}
      />
      {pdfError && <PdfErrorDisplay error={pdfError} />}
    </div>
  );
}

function ExportBtn({
  onClick,
  icon,
  label,
  desc,
  disabled = false,
}: {
  onClick: () => void;
  icon: ReactNode;
  label: string;
  desc: string;
  disabled?: boolean;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      style={{
        display: "flex",
        alignItems: "center",
        gap: "0.75rem",
        padding: "0.6rem 0.75rem",
        background: "var(--ui-surface-soft)",
        border: "1px solid var(--ui-rule)",
        borderRadius: 6,
        cursor: disabled ? "not-allowed" : "pointer",
        opacity: disabled ? 0.6 : 1,
        textAlign: "left",
        width: "100%",
      }}
    >
      <span style={{ color: "var(--color-accent)", flexShrink: 0 }}>{icon}</span>
      <span>
        <span
          style={{
            display: "block",
            fontFamily: "var(--font-ui-sans)",
            fontSize: "0.8125rem",
            color: "var(--ui-ink)",
            fontWeight: 500,
          }}
        >
          {label}
        </span>
        <span
          style={{
            display: "block",
            fontFamily: "var(--font-ui-mono)",
            fontSize: "0.6875rem",
            color: "var(--ui-ink-mute)",
          }}
        >
          {desc}
        </span>
      </span>
    </button>
  );
}

function PdfErrorDisplay({ error }: { error: { message: string; name?: string; stack?: string } }) {
  const [expanded, setExpanded] = useState(false);
  const { message, name, stack } = error;

  const details = {
    name: name ?? "Error",
    message,
    stack: stack ?? "(no stack)",
    userAgent: navigator.userAgent,
    url: location.href,
    time: new Date().toISOString(),
  };

  return (
    <div
      style={{
        fontFamily: "var(--font-ui-mono)",
        fontSize: "0.6875rem",
        color: DEV ? "var(--color-accent)" : "var(--ui-ink-mute)",
        margin: "0 0.25rem",
        padding: DEV ? "0.5rem" : 0,
        background: DEV ? "var(--color-paper-soft)" : "transparent",
        borderRadius: DEV ? 4 : 0,
        border: DEV ? "1px solid var(--color-rule)" : "none",
        lineHeight: 1.4,
      }}
    >
      <div style={{ display: "flex", gap: "0.5rem", alignItems: "flex-start" }}>
        <span style={{ flex: 1, wordBreak: "break-word" }}>{message}</span>
        {DEV && (
          <button
            type="button"
            onClick={() => setExpanded(!expanded)}
            style={{
              background: "none",
              border: "1px solid var(--color-rule)",
              borderRadius: 4,
              padding: "0.2rem 0.4rem",
              cursor: "pointer",
              color: "var(--color-mute)",
              fontSize: "0.625rem",
              fontFamily: "var(--font-ui-mono)",
              whiteSpace: "nowrap",
              flexShrink: 0,
            }}
          >
            <Bug size={12} style={{ verticalAlign: "middle", marginRight: 4 }} />
            {expanded ? "collapse" : "debug"}
          </button>
        )}
      </div>

      {DEV && expanded && (
        <div style={{ marginTop: "0.5rem", fontSize: "0.625rem", color: "var(--color-mute)" }}>
          <div
            style={{
              background: "var(--color-paper)",
              padding: "0.5rem",
              borderRadius: 4,
              overflow: "auto",
              maxHeight: 200,
              whiteSpace: "pre-wrap",
              wordBreak: "break-all",
            }}
          >
            {JSON.stringify(details, null, 2)}
          </div>
          <button
            type="button"
            onClick={() => navigator.clipboard.writeText(JSON.stringify(details, null, 2))}
            style={{
              marginTop: "0.3rem",
              background: "none",
              border: "1px solid var(--color-rule)",
              borderRadius: 4,
              padding: "0.2rem 0.4rem",
              cursor: "pointer",
              color: "var(--color-mute)",
              fontSize: "0.625rem",
              fontFamily: "var(--font-ui-mono)",
            }}
          >
            Copy error details
          </button>
        </div>
      )}
    </div>
  );
}

function NoDocHint() {
  const t = useT();
  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        gap: "0.5rem",
        padding: "2rem 1rem",
        textAlign: "center",
        color: "var(--ui-ink-mute)",
      }}
    >
      <FileText size={20} style={{ color: "var(--ui-rule)" }} />
      <p
        style={{
          fontFamily: "var(--font-ui-sans)",
          fontSize: "0.8125rem",
          margin: 0,
        }}
      >
        {t("export.noDoc")}
      </p>
    </div>
  );
}
