import { useDocumentsStore } from "./store"

const STARTER = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Document</title>
  <style>
    body { font-family: sans-serif; max-width: 820px; margin: 0 auto; padding: 2rem; line-height: 1.6; }
    h1, h2, h3 { font-weight: 600; }
  </style>
</head>
<body>
  <h1>Hello, world!</h1>
  <p>Start writing your HTML document here.</p>
</body>
</html>`

export function HtmlEditor() {
  const activeId = useDocumentsStore((s) => s.activeId)
  const documents = useDocumentsStore((s) => s.documents)
  const upsert = useDocumentsStore((s) => s.upsertDocument)
  const doc = activeId ? documents[activeId] : null

  if (!doc) return null

  const html = doc.htmlContent ?? STARTER

  const handleChange = (value: string) => {
    upsert({ ...doc, htmlContent: value, updatedAt: new Date().toISOString() })
  }

  return (
    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", height: "100%" }}>
      <textarea
        value={html}
        onChange={(e) => handleChange(e.target.value)}
        spellCheck={false}
        style={{
          width: "100%",
          height: "100%",
          padding: "1.25rem",
          fontFamily: "var(--font-ui-mono)",
          fontSize: "0.8125rem",
          lineHeight: 1.6,
          background: "var(--ui-surface)",
          color: "var(--ui-ink)",
          border: "none",
          borderRight: "1px solid var(--ui-rule)",
          resize: "none",
          outline: "none",
          boxSizing: "border-box",
        }}
      />
      <iframe
        srcDoc={html}
        title="HTML Preview"
        style={{ width: "100%", height: "100%", border: "none" }}
        sandbox="allow-same-origin"
      />
    </div>
  )
}
