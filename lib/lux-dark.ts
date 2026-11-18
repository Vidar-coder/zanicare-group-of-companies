// Luxury dark look shared by the lower sections (Details, Book of Guests, FAQ, Footer, Gallery) —
// the same black-and-gold vibe as the home hero, Welcome, About Us and Branches.
import type { CSSProperties } from "react"

export const LUX = {
  gold: "#E2B75A", // lettering, accents
  goldLine: "#C9A24A", // rules, frames, borders
  goldLight: "#F3D27A", // sheen
  white: "#F5F5F5", // headings
  ivory: "#EDE6D6", // soft headings, quotes
  body: "#DCDCDE", // paragraph text
  muted: "#B9B9BD", // small labels
  faint: "#8E8E93", // hints
  card: "#141416", // card surface
  cardDeep: "#0B0B0C",
} as const

/** Dark edge so lettering stays crisp over the pattern */
export const LUX_TEXT_SHADOW = "0 1px 2px rgb(0 0 0 / 85%), 0 0 14px rgb(0 0 0 / 55%)"

/** Card: near-black panel with a soft gold glow at the top and a fine gold edge */
export const LUX_CARD: CSSProperties = {
  background:
    "radial-gradient(110% 45% at 50% 0%, rgb(226 183 90 / 9%) 0%, transparent 70%), linear-gradient(180deg, #18181a 0%, #0f0f10 100%)",
  border: "1px solid rgb(201 162 74 / 40%)",
  boxShadow: "inset 0 1px 0 rgb(243 210 122 / 12%), 0 24px 50px -26px rgb(0 0 0 / 85%)",
}

/** Gold button (black lettering) */
export const LUX_GOLD_BUTTON = "linear-gradient(180deg, #F3D27A 0%, #E2B75A 45%, #B8862B 100%)"

/** Section ground: black with a soft gold glow top and bottom */
export const LUX_SECTION_BACKGROUND = [
  "radial-gradient(110% 30% at 50% 0%, rgb(226 183 90 / 9%) 0%, transparent 65%)",
  "radial-gradient(90% 25% at 50% 100%, rgb(226 183 90 / 6%) 0%, transparent 70%)",
  "linear-gradient(180deg, #0b0b0c 0%, #121214 50%, #0b0b0c 100%)",
].join(", ")

/** Gold monogram pattern tile (slightly visible) */
export const LUX_PATTERN = "/monogram/monogram-liner-gold.png"

/**
 * Theme colours re-pointed for dark sections. Set on the section wrapper so every
 * `var(--color-welcome-*)` / `var(--color-motif-*)` inside resolves to the dark palette.
 */
export const LUX_THEME_VARS = {
  "--color-welcome-navy": LUX.white,
  "--color-welcome-text": LUX.body,
  "--color-welcome-text-soft": LUX.muted,
  "--color-welcome-heading": LUX.gold,
  "--color-welcome-script": LUX.gold,
  "--color-welcome-bg-soft": LUX.card,
  "--color-motif-soft": LUX.card,
  "--color-motif-cream": LUX.card,
  "--color-motif-medium": LUX.goldLine,
  "--color-motif-yellow": LUX.goldLine,
  "--color-motif-accent": LUX.gold,
  "--color-motif-deep": LUX.gold,
  "--color-motif-blush": "#6B5A2E", // muted gold for card edges
  "--color-motif-silver": LUX.faint,
  "--invite-title": LUX.white,
  "--invite-body": LUX.body,
  "--invite-line": "rgb(201 162 74 / 60%)",
  "--invite-line-soft": "rgb(201 162 74 / 28%)",
} as CSSProperties
