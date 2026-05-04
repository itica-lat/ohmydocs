import type { ReactNode } from "react";

export type DocumentNodeType =
  | "heading"
  | "paragraph"
  | "image"
  | "list"
  | "code"
  | "divider"
  | "reference-list";

export interface DocumentNode {
  id: string;
  type: DocumentNodeType;
  content: string | ReactNode;
  meta?: Record<string, unknown>;
  /**
   * When true, this node and the immediately following node are treated as
   * an atomic unit: neither will be placed on a page without the other.
   * Heading nodes have this set to true by default inside the engine.
   */
  keepWithNext?: boolean;
}

export interface Page {
  id: string;
  number: number;
  nodes: DocumentNode[];
}

export interface PaginationOptions {
  marginTop?: number;
  marginBottom?: number;
  marginLeft?: number;
  marginRight?: number;
  headerHeight?: number;
  footerHeight?: number;
}

export interface PageConfig {
  width: number;
  height: number;
  marginTop: number;
  marginBottom: number;
  marginLeft: number;
  marginRight: number;
  headerHeight: number;
  footerHeight: number;
}

export interface LinkRef {
  id: string;
  label: string;
  url: string;
  refNumber: number;
}
