import type { OhmyDocument } from "@/types/schemas";
import type { Block } from "@/blocks/types";
import { blocksToMarkdown } from "@/lib/markdown";

export function exportToMarkdown(doc: OhmyDocument): string {
  const fm = [
    "---",
    `title: ${escape(doc.title)}`,
    `author: ${escape(doc.metadata.author)}`,
    `team: ${escape(doc.metadata.team)}`,
    `institution: ${escape(doc.metadata.institution)}`,
    `date: ${escape(doc.metadata.date)}`,
    "---",
    "",
  ].join("\n");
  return fm + blocksToMarkdown(doc.blocks as Block[]);
}

function escape(s: string): string {
  return s.replace(/[\n\r"]/g, " ").trim();
}
