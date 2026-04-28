import { Moon, Sun, Languages } from "lucide-react";
import { useSettingsStore } from "./store";
import { useT } from "@/lib/i18n";

export function ConfigPanel() {
  const colorScheme = useSettingsStore((s) => s.colorScheme);
  const toggleColorScheme = useSettingsStore((s) => s.toggleColorScheme);
  const locale = useSettingsStore((s) => s.locale);
  const setLocale = useSettingsStore((s) => s.setLocale);
  const t = useT();

  return (
    <div className="p-4 flex flex-col gap-5">
      <Section label={t("config.theme")}>
        <ToggleRow
          active={colorScheme === "dark"}
          onToggle={toggleColorScheme}
          icon={colorScheme === "dark" ? <Sun size={14} /> : <Moon size={14} />}
          label={colorScheme === "dark" ? t("config.light") : t("config.dark")}
        />
      </Section>

      <Section label={t("config.language")}>
        <ToggleRow
          active={locale === "es"}
          onToggle={() => setLocale(locale === "en" ? "es" : "en")}
          icon={<Languages size={14} />}
          label={locale === "en" ? "Español" : "English"}
        />
      </Section>
    </div>
  );
}

function Section({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="flex flex-col gap-2">
      <span
        style={{
          fontFamily: "var(--font-ui-mono)",
          fontSize: "0.6875rem",
          textTransform: "uppercase",
          letterSpacing: "0.08em",
          color: "var(--ui-ink-mute)",
        }}
      >
        {label}
      </span>
      {children}
    </div>
  );
}

function ToggleRow({
  active,
  onToggle,
  icon,
  label,
}: {
  active: boolean;
  onToggle: () => void;
  icon: React.ReactNode;
  label: string;
}) {
  return (
    <button
      type="button"
      onClick={onToggle}
      style={{
        display: "flex",
        alignItems: "center",
        gap: "0.6rem",
        padding: "0.5rem 0.75rem",
        background: active ? "var(--color-accent-soft)" : "var(--ui-surface-soft)",
        border: `1px solid ${active ? "var(--color-accent)" : "var(--ui-rule)"}`,
        borderRadius: 6,
        cursor: "pointer",
        fontFamily: "var(--font-ui-sans)",
        fontSize: "0.8125rem",
        color: active ? "var(--color-ink-deep)" : "var(--ui-ink)",
        width: "100%",
        textAlign: "left",
      }}
    >
      <span
        style={{
          color: active ? "var(--color-accent)" : "var(--ui-ink-mute)",
          flexShrink: 0,
        }}
      >
        {icon}
      </span>
      {label}
    </button>
  );
}
