export function UnsupportedScreen() {
  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        height: "100%",
        padding: "2rem",
        textAlign: "center",
        background: "var(--ui-surface-soft)",
        gap: "1rem",
      }}
    >
      <div>
        <p
          style={{
            fontFamily: "var(--font-ui-mono)",
            fontSize: "0.6875rem",
            textTransform: "uppercase",
            letterSpacing: "0.12em",
            color: "var(--color-accent)",
            marginBottom: "0.25rem",
          }}
        >
          Eternum
        </p>
        <h1
          style={{
            fontFamily: "var(--font-ui-serif)",
            fontSize: "2rem",
            fontStyle: "italic",
            color: "var(--ui-ink)",
            margin: 0,
          }}
        >
          OhMyDocs!
        </h1>
      </div>

      <div
        style={{
          width: 48,
          height: 1,
          background: "var(--ui-rule)",
        }}
      />

      <div style={{ maxWidth: 280 }}>
        <p
          style={{
            fontFamily: "var(--font-ui-sans)",
            fontSize: "0.9375rem",
            fontWeight: 500,
            color: "var(--ui-ink)",
            marginBottom: "0.5rem",
          }}
        >
          Desktop required
        </p>
        <p
          style={{
            fontFamily: "var(--font-ui-sans)",
            fontSize: "0.8125rem",
            color: "var(--ui-ink-mute)",
            lineHeight: 1.6,
            margin: 0,
          }}
        >
          OhMyDocs is a document editor built for larger screens. Open it on a desktop or tablet.
        </p>
      </div>
    </div>
  )
}
