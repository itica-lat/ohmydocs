import { useMemo, useState } from "react";
import { AlertTriangle, Plus, Trash2 } from "lucide-react";
import { useT } from "@/lib/i18n";
import { useBrandingStore } from "./store";
import type { BrandingProfile } from "@/types/schemas";
import { PALETTE_TOKENS, type PaletteToken } from "@/types/palette";
import { meetsAA } from "@/lib/palette/contrast";
import { newId } from "@/lib/id";

export function BrandingPanel() {
  const t = useT();
  const profiles = useBrandingStore((s) => s.profiles);
  const activeId = useBrandingStore((s) => s.activeId);
  const setActive = useBrandingStore((s) => s.setActive);
  const upsert = useBrandingStore((s) => s.upsert);
  const remove = useBrandingStore((s) => s.remove);

  const active = profiles[activeId];
  const [editing, setEditing] = useState<BrandingProfile | null>(null);
  const draft = editing ?? active;

  const warnings = useMemo(() => {
    if (!draft) return [];
    const out: string[] = [];
    const checks: [PaletteToken, PaletteToken][] = [
      ["ink-deepest", "paper"],
      ["ink-deep", "paper"],
      ["accent", "paper"],
      ["ink-on-dark", "ink-deepest"],
      ["mute", "paper"],
    ];
    for (const [fg, bg] of checks) {
      if (!meetsAA(draft.palette[fg], draft.palette[bg])) {
        out.push(t("branding.lowContrast").replace("{fg}", fg).replace("{bg}", bg));
      }
    }
    return out;
  }, [draft, t]);

  if (!draft) return null;

  const isReadOnly = Boolean(draft.readOnly);
  const startEditing = () => setEditing({ ...draft });
  const save = () => {
    if (!editing) return;
    upsert(editing);
    setEditing(null);
  };
  const cancel = () => setEditing(null);

  const updatePalette = (token: PaletteToken, value: string) => {
    if (!editing) return;
    setEditing({ ...editing, palette: { ...editing.palette, [token]: value } });
  };

  const cloneAsNew = () => {
    const id = newId("branding");
    const clone: BrandingProfile = {
      ...draft,
      id,
      name: `${draft.name} (copy)`,
      readOnly: false,
    };
    upsert(clone);
    setActive(id);
    setEditing(clone);
  };

  return (
    <div
      style={{
        padding: "0.75rem 1rem",
        display: "flex",
        flexDirection: "column",
        gap: "0.75rem",
      }}
    >
      <div style={{ display: "flex", flexDirection: "column", gap: "0.4rem" }}>
        <select
          value={activeId}
          onChange={(e) => {
            setActive(e.target.value);
            setEditing(null);
          }}
          style={selectStyle}
        >
          {Object.values(profiles).map((p) => (
            <option key={p.id} value={p.id}>
              {p.name}
              {p.readOnly ? ` · ${t("branding.readOnly")}` : ""}
            </option>
          ))}
        </select>
        {editing && (
          <input
            type="text"
            value={editing.name}
            onChange={(e) => setEditing({ ...editing, name: e.target.value })}
            placeholder={t("rightPanel.brandingNamePlaceholder")}
            style={selectStyle}
          />
        )}
      </div>

      {warnings.length > 0 && (
        <div
          style={{
            display: "flex",
            gap: "0.5rem",
            alignItems: "flex-start",
            padding: "0.5rem 0.75rem",
            border: "1px solid #D9A441",
            background: "rgba(217,164,65,0.12)",
            borderRadius: "var(--radius-block)",
            color: "var(--color-ink-deepest)",
            fontSize: "0.75rem",
          }}
        >
          <AlertTriangle size={14} style={{ color: "#D9A441", marginTop: 2 }} />
          <ul style={{ margin: 0, paddingLeft: "1rem" }}>
            {warnings.map((w) => (
              <li key={w}>{w}</li>
            ))}
          </ul>
        </div>
      )}

      <div style={{ display: "flex", flexDirection: "column", gap: "0.3rem" }}>
        {PALETTE_TOKENS.map((token) => (
          <label key={token} style={{ display: "flex", gap: "0.4rem", alignItems: "center" }}>
            <input
              type="color"
              value={draft.palette[token]}
              disabled={isReadOnly && !editing}
              onChange={(e) => updatePalette(token, e.target.value.toUpperCase())}
              title={token}
              style={{
                flexShrink: 0,
                width: 20,
                height: 20,
                border: "var(--rule)",
                background: "transparent",
                borderRadius: "3px",
                padding: 0,
                cursor: isReadOnly && !editing ? "default" : "pointer",
              }}
            />
            <span
              style={{
                fontFamily: "var(--font-ui-mono)",
                fontSize: "0.5625rem",
                textTransform: "uppercase",
                letterSpacing: "0.04em",
                color: "var(--color-mute)",
                flex: "0 0 7rem",
                overflow: "hidden",
                textOverflow: "ellipsis",
                whiteSpace: "nowrap",
              }}
            >
              {token}
            </span>
            <input
              type="text"
              value={draft.palette[token]}
              disabled={isReadOnly && !editing}
              onChange={(e) => updatePalette(token, e.target.value.toUpperCase())}
              style={{
                flex: 1,
                minWidth: 0,
                fontFamily: "var(--font-ui-mono)",
                fontSize: "0.5625rem",
                border: "var(--rule)",
                padding: "0.15rem 0.3rem",
                borderRadius: "3px",
                color: "var(--color-ink-deepest)",
                background: "var(--color-paper)",
                outline: "none",
              }}
            />
          </label>
        ))}
      </div>

      <FontEditor
        profile={draft}
        readOnly={isReadOnly && !editing}
        onChange={(p) => editing && setEditing({ ...editing, ...p })}
      />

      <div style={{ display: "flex", gap: "0.5rem" }}>
        {!editing && !isReadOnly && (
          <button type="button" onClick={startEditing} style={primaryBtn}>
            {t("branding.edit")}
          </button>
        )}
        {!editing && isReadOnly && (
          <button type="button" onClick={cloneAsNew} style={primaryBtn}>
            <Plus size={12} /> {t("branding.duplicate")}
          </button>
        )}
        {editing && (
          <>
            <button type="button" onClick={save} style={primaryBtn}>
              {t("branding.save")}
            </button>
            <button type="button" onClick={cancel} style={secondaryBtn}>
              {t("branding.cancel")}
            </button>
            {!isReadOnly && (
              <button
                type="button"
                onClick={() => {
                  remove(draft.id);
                  setEditing(null);
                }}
                style={{ ...secondaryBtn, color: "#C0556B" }}
              >
                <Trash2 size={12} /> {t("branding.delete")}
              </button>
            )}
          </>
        )}
      </div>
    </div>
  );
}

function FontEditor({
  profile,
  readOnly,
  onChange,
}: {
  profile: BrandingProfile;
  readOnly: boolean;
  onChange: (p: Partial<BrandingProfile>) => void;
}) {
  const t = useT();
  const set = (cat: "serif" | "sans" | "mono", family: string) =>
    onChange({
      fonts: {
        ...profile.fonts,
        [cat]: { ...profile.fonts[cat], family },
      },
    });
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "0.3rem" }}>
      <span
        style={{
          fontFamily: "var(--font-ui-mono)",
          fontSize: "0.625rem",
          textTransform: "uppercase",
          letterSpacing: "0.08em",
          color: "var(--color-mute)",
        }}
      >
        {t("branding.documentFonts")}
      </span>
      {(["serif", "sans", "mono"] as const).map((cat) => (
        <label key={cat} style={{ display: "flex", gap: "0.5rem", alignItems: "center" }}>
          <span
            style={{
              width: 60,
              fontFamily: "var(--font-ui-mono)",
              fontSize: "0.6875rem",
              color: "var(--color-mute)",
            }}
          >
            {cat.toUpperCase()}
          </span>
          <input
            value={profile.fonts[cat].family}
            disabled={readOnly}
            onChange={(e) => set(cat, e.target.value)}
            style={{
              flex: 1,
              fontFamily: "var(--font-ui-sans)",
              fontSize: "0.8125rem",
              border: "var(--rule)",
              padding: "0.25rem 0.5rem",
              borderRadius: "4px",
              color: "var(--color-ink-deepest)",
              background: "var(--color-paper)",
              outline: "none",
            }}
          />
        </label>
      ))}
    </div>
  );
}

const selectStyle: React.CSSProperties = {
  width: "100%",
  border: "var(--rule)",
  padding: "0.4rem 0.5rem",
  borderRadius: "4px",
  background: "var(--color-paper)",
  fontFamily: "var(--font-ui-sans)",
  fontSize: "0.8125rem",
  color: "var(--color-ink-deepest)",
};

const primaryBtn: React.CSSProperties = {
  display: "inline-flex",
  alignItems: "center",
  gap: "0.3rem",
  padding: "0.4rem 0.75rem",
  background: "var(--color-ink-deepest)",
  color: "var(--color-ink-on-dark)",
  border: "none",
  borderRadius: "4px",
  fontFamily: "var(--font-ui-sans)",
  fontSize: "0.8125rem",
  cursor: "pointer",
};

const secondaryBtn: React.CSSProperties = {
  ...primaryBtn,
  background: "transparent",
  color: "var(--color-ink-deepest)",
  border: "var(--rule)",
};
