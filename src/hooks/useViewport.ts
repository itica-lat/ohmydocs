import { useEffect, useState } from "react"

export type ViewportCategory = "phone" | "tablet" | "desktop"

// phone  < 768px
// tablet 768px – 1199px
// desktop >= 1200px

function classify(w: number): ViewportCategory {
  if (w < 768) return "phone"
  if (w < 1200) return "tablet"
  return "desktop"
}

export function useViewport(): { width: number; category: ViewportCategory } {
  const [width, setWidth] = useState(() => window.innerWidth)

  useEffect(() => {
    const handler = () => setWidth(window.innerWidth)
    window.addEventListener("resize", handler)
    return () => window.removeEventListener("resize", handler)
  }, [])

  return { width, category: classify(width) }
}
