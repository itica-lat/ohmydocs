import { useState } from "react";
import { Palette, Settings, Layout, FileText, Download, SlidersHorizontal } from "lucide-react";
import { BrandingPanel } from "@/features/branding/BrandingPanel";
import { MetadataPanel } from "@/features/metadata/MetadataPanel";
import { TemplatesPanel } from "@/features/templates/TemplatesPanel";
import { ExportPanel } from "@/features/export/ExportPanel";
import { ConfigPanel } from "@/features/settings/ConfigPanel";
import { useDocumentsStore } from "@/features/editor/store";
import { useT } from "@/lib/i18n";

type TabId = "metadata" | "branding" | "templates" | "export" | "config";

export function RightPanel() {
  const activeDocId = useDocumentsStore((s) => s.activeId);
  const [tab, setTab] = useState<TabId>(activeDocId ? "metadata" : "templates");
  const t = useT();

  return (
    <aside
      className="right-panel flex flex-col border-l overflow-hidden"
      style={{ background: "var(--ui-surface)", borderColor: "var(--ui-rule)" }}
    >
      <nav
        className="flex flex-wrap"
        style={{
          borderBottom: `1px solid var(--ui-rule)`,
          background: "var(--ui-surface-soft)",
        }}
      >
        <TabBtn id="metadata" current={tab} onClick={setTab} icon={<Settings size={12} />}>
          {t("rightPanel.metadata")}
        </TabBtn>
        <TabBtn id="branding" current={tab} onClick={setTab} icon={<Palette size={12} />}>
          {t("rightPanel.branding")}
        </TabBtn>
        <TabBtn id="templates" current={tab} onClick={setTab} icon={<Layout size={12} />}>
          {t("rightPanel.templates")}
        </TabBtn>
        <TabBtn id="export" current={tab} onClick={setTab} icon={<Download size={12} />}>
          {t("rightPanel.export")}
        </TabBtn>
        <TabBtn id="config" current={tab} onClick={setTab} icon={<SlidersHorizontal size={12} />}>
          {t("rightPanel.config")}
        </TabBtn>
      </nav>

      <div className="flex-1 overflow-y-auto min-h-0">
        {tab === "metadata" &&
          (activeDocId ? <MetadataPanel /> : <NoDocHint icon={<FileText size={20} />} />)}
        {tab === "branding" && <BrandingPanel />}
        {tab === "templates" && <TemplatesPanel />}
        {tab === "export" && <ExportPanel />}
        {tab === "config" && <ConfigPanel />}
      </div>

      <footer
        className="p-4 border-t"
        style={{ borderColor: "var(--ui-rule)", color: "var(--ui-ink-mute)" }}
      >
        <p
          className="text-[0.6875rem] uppercase tracking-[0.08em]"
          style={{ fontFamily: "var(--font-ui-mono)" }}
        >
          OhMyDocs · Eternum
        </p>
      </footer>
    </aside>
  );
}

function TabBtn({
  id,
  current,
  onClick,
  icon,
  children,
}: {
  id: TabId;
  current: TabId;
  onClick: (id: TabId) => void;
  icon: React.ReactNode;
  children: React.ReactNode;
}) {
  const isActive = id === current;
  return (
    <button
      type="button"
      onClick={() => onClick(id)}
      style={{
        flex: "1 1 auto",
        display: "inline-flex",
        alignItems: "center",
        justifyContent: "center",
        gap: "0.3rem",
        padding: "0.5rem 0.4rem",
        background: "transparent",
        border: "none",
        borderBottom: isActive ? "2px solid var(--color-accent)" : "2px solid transparent",
        color: isActive ? "var(--ui-ink)" : "var(--ui-ink-mute)",
        fontFamily: "var(--font-ui-mono)",
        fontSize: "0.6rem",
        textTransform: "uppercase",
        letterSpacing: "0.06em",
        cursor: "pointer",
      }}
    >
      {icon}
      {children}
    </button>
  );
}

function NoDocHint({ icon }: { icon: React.ReactNode }) {
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
      <div style={{ color: "var(--ui-rule)" }}>{icon}</div>
      <p
        style={{
          fontFamily: "var(--font-ui-sans)",
          fontSize: "0.8125rem",
          margin: 0,
        }}
      >
        {t("rightPanel.noDoc")}
      </p>
    </div>
  );
}
