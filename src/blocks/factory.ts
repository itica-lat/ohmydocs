import { newId } from "@/lib/id";
import type { BlockType, BaseBlock } from "./types";

export function baseFields<T extends BlockType>(type: T): BaseBlock<T> {
  const now = new Date().toISOString();
  return { id: newId("blk"), type, createdAt: now, updatedAt: now };
}
