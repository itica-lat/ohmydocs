import type { OhmyDocument } from "@/types/schemas";
import type { Block, BlockType } from "@/blocks/types";
import { blockRegistry } from "@/blocks/registry";

export function withBlocks(doc: OhmyDocument, blocks: Block[]): OhmyDocument {
  return {
    ...doc,
    blocks: blocks as OhmyDocument["blocks"],
    updatedAt: new Date().toISOString(),
  };
}

export function insertBlock(blocks: Block[], type: BlockType, atIndex: number): Block[] {
  const def = blockRegistry[type];
  const next = def.factory();
  const out = [...blocks];
  out.splice(atIndex, 0, next as Block);
  return out;
}

export function moveBlock(blocks: Block[], fromId: string, toId: string): Block[] {
  if (fromId === toId) return blocks;
  const fromIdx = blocks.findIndex((b) => b.id === fromId);
  const toIdx = blocks.findIndex((b) => b.id === toId);
  if (fromIdx < 0 || toIdx < 0) return blocks;
  const next = [...blocks];
  const [moved] = next.splice(fromIdx, 1);
  if (!moved) return blocks;
  next.splice(toIdx, 0, moved);
  return next;
}

export function duplicateBlock(blocks: Block[], id: string): Block[] {
  const idx = blocks.findIndex((b) => b.id === id);
  if (idx < 0) return blocks;
  const original = blocks[idx];
  if (!original) return blocks;
  const def = blockRegistry[original.type];
  const dup = def.factory({ ...original } as never) as Block;
  const out = [...blocks];
  out.splice(idx + 1, 0, dup);
  return out;
}

export function removeBlock(blocks: Block[], id: string): Block[] {
  return blocks.filter((b) => b.id !== id);
}

export function replaceBlock(blocks: Block[], next: Block): Block[] {
  return blocks.map((b) => (b.id === next.id ? next : b));
}

export function shiftBlock(blocks: Block[], id: string, dir: -1 | 1): Block[] {
  const idx = blocks.findIndex((b) => b.id === id);
  const target = idx + dir;
  if (idx < 0 || target < 0 || target >= blocks.length) return blocks;
  const a = blocks[idx];
  const b = blocks[target];
  if (!a || !b) return blocks;
  const next = [...blocks];
  next[idx] = b;
  next[target] = a;
  return next;
}
