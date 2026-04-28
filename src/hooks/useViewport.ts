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

interface ViewportState {
  width: number
  height: number
  category: ViewportCategory
  isLandscape: boolean
  isPortrait: boolean
  // iPad Split View or very narrow context (< 500px)
  isSplitView: boolean
}

export function useViewport(): ViewportState {
  const [size, setSize] = useState(() => ({
    width: window.innerWidth,
    height: window.innerHeight,
  }))

  useEffect(() => {
    const handler = () =>
      setSize({ width: window.innerWidth, height: window.innerHeight })
    window.addEventListener("resize", handler)
    return () => window.removeEventListener("resize", handler)
  }, [])

  const { width, height } = size
  return {
    width,
    height,
    category: classify(width),
    isLandscape: width > height,
    isPortrait: width <= height,
    isSplitView: width < 500,
  }
}
