import { z } from "zod"
import type { Image as MdastImage, RootContent } from "mdast"
import type { BlockDefinition } from "../registry"
import type { ImageBlock } from "../types"
import { baseFields } from "../factory"

export const ImageSchema: z.ZodType<ImageBlock> = z.object({
  id: z.string(),
  type: z.literal("image"),
  createdAt: z.string(),
  updatedAt: z.string(),
  src: z.string(),
  alt: z.string(),
  caption: z.string(),
  bordered: z.boolean(),
})

export const image: BlockDefinition<"image"> = {
  type: "image",
  label: "Image",
  category: "media",
  iconName: "Image",
  schema: ImageSchema,
  factory: (over) => ({
    ...baseFields("image"),
    src: "",
    alt: "",
    caption: "",
    bordered: false,
    ...over,
  }),
  Renderer: ({ block }) => (
    <figure style={{ margin: "2rem 0", textAlign: "center" }}>
      {block.src ? (
        <img
          src={block.src}
          alt={block.alt}
          style={{
            maxWidth: "100%",
            height: "auto",
            border: block.bordered ? "var(--rule)" : "none",
            borderRadius: block.bordered ? "4px" : 0,
          }}
        />
      ) : (
        <div
          style={{
            border: "1px dashed var(--color-rule)",
            padding: "3rem",
            color: "var(--color-mute)",
            fontFamily: "var(--font-doc-mono)",
            fontSize: "0.75rem",
            textTransform: "uppercase",
            letterSpacing: "0.08em",
          }}
        >
          No image source
        </div>
      )}
      {block.caption && (
        <figcaption
          style={{
            fontFamily: "var(--font-doc-sans)",
            fontStyle: "italic",
            fontSize: "0.8125rem",
            color: "var(--color-mute)",
            marginTop: "0.5rem",
          }}
        >
          {block.caption}
        </figcaption>
      )}
    </figure>
  ),
  Editor: ({ block, onChange }) => (
    <div style={{ display: "flex", flexDirection: "column", gap: "0.4rem" }}>
      <input
        value={block.src}
        onChange={(e) =>
          onChange({
            ...block,
            src: e.target.value,
            updatedAt: new Date().toISOString(),
          })
        }
        placeholder="Image URL or data:"
        style={inp}
      />
      <input
        value={block.alt}
        onChange={(e) =>
          onChange({
            ...block,
            alt: e.target.value,
            updatedAt: new Date().toISOString(),
          })
        }
        placeholder="Alt text"
        style={inp}
      />
      <input
        value={block.caption}
        onChange={(e) =>
          onChange({
            ...block,
            caption: e.target.value,
            updatedAt: new Date().toISOString(),
          })
        }
        placeholder="Caption (optional)"
        style={inp}
      />
      <label
        style={{
          fontFamily: "var(--font-ui-mono)",
          fontSize: "0.6875rem",
          letterSpacing: "0.08em",
          textTransform: "uppercase",
          color: "var(--color-mute)",
          display: "flex",
          gap: "0.5rem",
          alignItems: "center",
        }}
      >
        <input
          type="checkbox"
          checked={block.bordered}
          onChange={(e) =>
            onChange({
              ...block,
              bordered: e.target.checked,
              updatedAt: new Date().toISOString(),
            })
          }
        />
        Border
      </label>
    </div>
  ),
  serialize: (block): RootContent[] => [
    {
      type: "paragraph",
      children: [
        {
          type: "image",
          url: block.src,
          alt: block.alt,
          title: block.caption || null,
        },
      ],
    },
  ],
  deserialize: (node, ctx) => {
    if (node.type !== "paragraph") return null
    const first = node.children[0]
    if (!first || first.type !== "image") return null
    const img = first as MdastImage
    return {
      ...ctx.newBlockBase("image"),
      src: img.url,
      alt: img.alt ?? "",
      caption: img.title ?? "",
      bordered: false,
    }
  },
}

const inp: React.CSSProperties = {
  border: "var(--rule)",
  padding: "0.4rem 0.5rem",
  borderRadius: "4px",
  fontFamily: "var(--font-doc-sans)",
  fontSize: "0.8125rem",
  color: "var(--color-ink-deepest)",
  background: "var(--color-paper)",
  outline: "none",
}
