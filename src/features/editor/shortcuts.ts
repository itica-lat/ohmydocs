import { useEffect } from "react";
import { useDocumentsStore } from "./store";
import { duplicateBlock, removeBlock, shiftBlock, withBlocks } from "./helpers";
import { saveTextFile } from "@/lib/storage/fs-access";
import type { Block } from "@/blocks/types";

export function useEditorShortcuts(): void {
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const meta = e.metaKey || e.ctrlKey;
      if (!meta) return;
      const state = useDocumentsStore.getState();
      const doc = state.activeId ? state.documents[state.activeId] : null;
      if (!doc) return;
      const blocks = doc.blocks as Block[];
      const selectedId = state.selectedBlockId;

      if (e.key.toLowerCase() === "s") {
        e.preventDefault();
        downloadJson(doc);
        return;
      }
      if (e.key === "Escape") {
        state.selectBlock(null);
        return;
      }
      if (!selectedId) return;
      if (e.key.toLowerCase() === "d") {
        e.preventDefault();
        state.upsertDocument(withBlocks(doc, duplicateBlock(blocks, selectedId)));
      } else if (e.key === "Backspace") {
        e.preventDefault();
        state.upsertDocument(withBlocks(doc, removeBlock(blocks, selectedId)));
        state.selectBlock(null);
      } else if (e.key === "ArrowUp") {
        e.preventDefault();
        state.upsertDocument(withBlocks(doc, shiftBlock(blocks, selectedId, -1)));
      } else if (e.key === "ArrowDown") {
        e.preventDefault();
        state.upsertDocument(withBlocks(doc, shiftBlock(blocks, selectedId, 1)));
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);
}

function downloadJson(doc: { title: string }): void {
  void saveTextFile(JSON.stringify(doc, null, 2), {
    suggestedName: `${slug(doc.title)}.ohmydocs.json`,
    types: [
      {
        description: "OhMyDocs document",
        accept: { "application/json": [".json"] },
      },
    ],
  });
}

function slug(s: string): string {
  return (
    s
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-|-$/g, "") || "document"
  );
}
