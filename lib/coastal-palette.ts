import type { CSSProperties } from "react"

/** Reference palette — peach, blush, midnight navy, slate navy and white. */
export const coastalPalette = {
  peach: "#D9A08C",
  lavenderBlue: "#FFF8F2",
  blueGray: "#C5BDB5",
  dustyRose: "#1C1C1E",
  teal: "#1C1C1E",
  body: "#1C1C1E",
  title: "#1C1C1E",
  deep: "#1C1C1E",
  cream: "#FFF8F2",
} as const

export const displayScript: CSSProperties = {
  fontFamily: "'Brightwall', cursive",
  fontWeight: 400,
}

export const coastalLightBg = coastalPalette.lavenderBlue
export const coastalDarkBg = coastalPalette.teal

export const coastalLightGradient = coastalLightBg
export const coastalDarkGradient = coastalDarkBg

export const coastalCardShadow = `0 16px 48px color-mix(in srgb, ${coastalPalette.teal} 14%, transparent), inset 0 1px 0 rgba(255, 255, 255, 0.72)`

export const coastalTitleShadow =
  "0 2px 4px rgba(255, 255, 255, 0.85), 0 0 16px rgba(197, 189, 181, 0.45)"
