import { Sparkles } from "lucide-react";
import { useDocumentsStore } from "@/features/editor/store";
import { useT } from "@/lib/i18n";

export function Landing() {
  const create = useDocumentsStore((s) => s.createDocument);
  const t = useT();
  return (
    <div
      className="flex flex-col items-center text-center max-w-xl pt-24 px-6"
      style={{ color: "var(--color-ink-deepest)" }}
    >
      <h1
        className="italic leading-[1.05]"
        style={{
          fontFamily: "var(--font-ui-serif)",
          fontSize: "3rem",
          color: "var(--color-ink-deepest)",
          margin: 0,
          marginBottom: "1rem",
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
        {t("landing.subtitle")}
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
        {t("landing.startTyping")}
      </button>
    </div>
  );
}
