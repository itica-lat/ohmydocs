import { Plus, Trash2 } from "lucide-react"
import { useDocumentsStore } from "@/features/editor/store"
import type { OhmyDocument } from "@/types/schemas"

export function MetadataPanel() {
  const activeId = useDocumentsStore((s) => s.activeId)
  const documents = useDocumentsStore((s) => s.documents)
  const upsert = useDocumentsStore((s) => s.upsertDocument)
  const doc = activeId ? documents[activeId] : null
  if (!doc) return null

  const update = (patch: Partial<OhmyDocument>) =>
    upsert({ ...doc, ...patch, updatedAt: new Date().toISOString() })
  const updateMeta = (patch: Partial<OhmyDocument["metadata"]>) =>
    update({ metadata: { ...doc.metadata, ...patch } })

  return (
    <div
      style={{
        padding: "1rem 1.25rem",
        display: "flex",
        flexDirection: "column",
        gap: "0.5rem",
      }}
    >
      <Field label="Title">
        <input
          value={doc.title}
          onChange={(e) => update({ title: e.target.value })}
          style={inp}
        />
      </Field>
      <Field label="Author">
        <input
          value={doc.metadata.author}
          onChange={(e) => updateMeta({ author: e.target.value })}
          style={inp}
        />
      </Field>
      <Field label="Team">
        <input
          value={doc.metadata.team}
          onChange={(e) => updateMeta({ team: e.target.value })}
          style={inp}
        />
      </Field>
      <Field label="Institution">
        <input
          value={doc.metadata.institution}
          onChange={(e) => updateMeta({ institution: e.target.value })}
          style={inp}
        />
      </Field>
      <Field label="Date">
        <input
          type="date"
          value={doc.metadata.date}
          onChange={(e) => updateMeta({ date: e.target.value })}
          style={inp}
        />
      </Field>

      <CustomFields
        fields={doc.metadata.customFields}
        onChange={(customFields) => updateMeta({ customFields })}
      />
    </div>
  )
}

function CustomFields({
  fields,
  onChange,
}: {
  fields: Record<string, string>
  onChange: (next: Record<string, string>) => void
}) {
  const entries = Object.entries(fields)
  const setKey = (oldKey: string, newKey: string) => {
    if (!newKey || oldKey === newKey) return
    const next = { ...fields }
    next[newKey] = next[oldKey] ?? ""
    delete next[oldKey]
    onChange(next)
  }
  const setVal = (key: string, val: string) =>
    onChange({ ...fields, [key]: val })
  const remove = (key: string) => {
    const next = { ...fields }
    delete next[key]
    onChange(next)
  }
  const add = () => onChange({ ...fields, [`field${entries.length + 1}`]: "" })

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "0.25rem" }}>
      <span
        style={{
          fontFamily: "var(--font-ui-mono)",
          fontSize: "0.625rem",
          textTransform: "uppercase",
          letterSpacing: "0.08em",
          color: "var(--color-mute)",
          marginTop: "0.5rem",
        }}
      >
        Custom fields
      </span>
      {entries.map(([k, v]) => (
        <div key={k} style={{ display: "flex", gap: "0.25rem" }}>
          <input
            defaultValue={k}
            onBlur={(e) => setKey(k, e.target.value)}
            style={{ ...inp, flex: 1, fontFamily: "var(--font-ui-mono)" }}
          />
          <input
            value={v}
            onChange={(e) => setVal(k, e.target.value)}
            style={{ ...inp, flex: 1 }}
          />
          <button type="button" onClick={() => remove(k)} style={delBtn}>
            <Trash2 size={12} />
          </button>
        </div>
      ))}
      <button type="button" onClick={add} style={addBtn}>
        <Plus size={12} /> Field
      </button>
    </div>
  )
}

function Field({
  label,
  children,
}: {
  label: string
  children: React.ReactNode
}) {
  return (
    <label style={{ display: "flex", flexDirection: "column", gap: "0.2rem" }}>
      <span
        style={{
          fontFamily: "var(--font-ui-mono)",
          fontSize: "0.625rem",
          textTransform: "uppercase",
          letterSpacing: "0.08em",
          color: "var(--color-mute)",
        }}
      >
        {label}
      </span>
      {children}
    </label>
  )
}

const inp: React.CSSProperties = {
  border: "var(--rule)",
  padding: "0.35rem 0.5rem",
  borderRadius: "4px",
  fontFamily: "var(--font-ui-sans)",
  fontSize: "0.8125rem",
  color: "var(--color-ink-deepest)",
  background: "var(--color-paper)",
  outline: "none",
}
const addBtn: React.CSSProperties = {
  alignSelf: "flex-start",
  display: "inline-flex",
  gap: "0.3rem",
  alignItems: "center",
  fontFamily: "var(--font-ui-mono)",
  fontSize: "0.6875rem",
  textTransform: "uppercase",
  letterSpacing: "0.08em",
  color: "var(--color-accent)",
  background: "transparent",
  border: "none",
  cursor: "pointer",
  padding: "0.25rem 0",
}
const delBtn: React.CSSProperties = {
  border: "var(--rule)",
  background: "transparent",
  color: "var(--color-mute)",
  borderRadius: "4px",
  padding: "0.25rem 0.4rem",
  cursor: "pointer",
}
