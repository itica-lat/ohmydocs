import { z } from "zod";
import type { RootContent } from "mdast";
import type { BlockDefinition } from "../registry";
import type { DividerBlock } from "../types";
import { baseFields } from "../factory";

export const DividerSchema: z.ZodType<DividerBlock> = z.object({
  id: z.string(),
  type: z.literal("divider"),
  createdAt: z.string(),
  updatedAt: z.string(),
});

export const divider: BlockDefinition<"divider"> = {
  type: "divider",
  label: "Divider",
  category: "structural",
  iconName: "Minus",
  schema: DividerSchema,
  factory: (over) => ({ ...baseFields("divider"), ...over }),
  Renderer: () => (
    <hr
      style={{
        border: 0,
        borderTop: "var(--rule)",
        margin: "2.5rem 0",
      }}
    />
  ),
  Editor: () => (
    <div
      style={{
        padding: "0.5rem 0",
        color: "var(--color-mute)",
        fontSize: "0.75rem",
        fontFamily: "var(--font-ui-mono)",
        textTransform: "uppercase",
        letterSpacing: "0.08em",
      }}
    >
      Divider
    </div>
  ),
  serialize: (): RootContent[] => [{ type: "thematicBreak" }],
  deserialize: (node, ctx) => {
    if (node.type !== "thematicBreak") return null;
    return { ...ctx.newBlockBase("divider") };
  },
};
