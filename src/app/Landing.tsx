import { Sparkles } from "lucide-react"
import { useDocumentsStore } from "@/features/editor/store"

export function Landing() {
  const create = useDocumentsStore((s) => s.createDocument)
  return (
    <div
      className="flex flex-col items-center text-center max-w-xl pt-24 px-6"
      style={{ color: "var(--color-ink-deepest)" }}
    >
      <div
        className="mb-6"
        style={{
          fontFamily: "var(--font-ui-mono)",
          fontSize: "0.6875rem",
          letterSpacing: "0.12em",
          textTransform: "uppercase",
          color: "var(--color-accent)",
        }}
      >
        Eternum Edition · v0.1
      </div>
      <h1
        className="italic leading-[1.05]"
        style={{
          fontFamily: "var(--font-ui-serif)",
          fontSize: "3rem",
          color: "var(--color-ink-deepest)",
          margin: 0,
        }}
      >
        OhMyDocs!
      </h1>
      <p
        className="italic mt-4 mb-10"
        style={{
          fontFamily: "var(--font-ui-serif)",
          fontSize: "1.125rem",
          color: "var(--color-mute)",
          maxWidth: "38ch",
        }}
      >
        Documents that look like they were designed, not typed.
      </p>
      <button
        type="button"
        onClick={() => create()}
        className="inline-flex items-center gap-2 px-5 py-2.5 rounded"
        style={{
          background: "var(--color-ink-deepest)",
          color: "var(--color-ink-on-dark)",
          fontFamily: "var(--font-ui-sans)",
          fontWeight: 500,
        }}
      >
        <Sparkles size={16} />
        Start a new document
      </button>
    </div>
  )
}
