function srgbToLin(c: number): number {
  const s = c / 255
  return s <= 0.03928 ? s / 12.92 : ((s + 0.055) / 1.055) ** 2.4
}

export function relativeLuminance(hex: string): number {
  const m = /^#?([\da-f]{2})([\da-f]{2})([\da-f]{2})$/i.exec(hex)
  if (!m) return 0
  const [, r, g, b] = m
  const [rr, gg, bb] = [r, g, b].map((x) => srgbToLin(parseInt(x ?? "00", 16)))
  return 0.2126 * (rr ?? 0) + 0.7152 * (gg ?? 0) + 0.0722 * (bb ?? 0)
}

export function contrastRatio(a: string, b: string): number {
  const l1 = relativeLuminance(a)
  const l2 = relativeLuminance(b)
  const [hi, lo] = l1 > l2 ? [l1, l2] : [l2, l1]
  return (hi + 0.05) / (lo + 0.05)
}

export function meetsAA(fg: string, bg: string, large = false): boolean {
  return contrastRatio(fg, bg) >= (large ? 3 : 4.5)
}
