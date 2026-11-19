import localFont from "next/font/local"

/*
 * Google Fonts, self-hosted (files in /Font/google, Latin subset, from fonts.google.com — all
 * under the SIL Open Font License).
 *
 * These used to be loaded with `next/font/google`, which downloads the font files from Google
 * during every build. When Google's response from the build server didn't match what Next
 * expects, Vercel builds failed ("An error occurred in `next/font` … reading '1'"). Shipping
 * the files with the project makes builds independent of Google.
 *
 * Every font is defined once here and imported where needed (one @font-face per family).
 * Variants with a single weight or style keep it in their class, like the Google versions did.
 */

// ── Inter (variable, 100–900) ───────────────────────────────────────────────
export const inter = localFont({
  src: [{ path: "../Font/google/inter-normal.woff2", weight: "100 900", style: "normal" }],
  variable: "--font-inter",
  display: "swap",
})

// ── Script faces (single weight) ────────────────────────────────────────────
export const greatVibes = localFont({
  src: [{ path: "../Font/google/great-vibes-normal.woff2", weight: "400", style: "normal" }],
  variable: "--font-serif",
  display: "swap",
})

export const imperialScript = localFont({
  src: [{ path: "../Font/google/imperial-script-normal.woff2", weight: "400", style: "normal" }],
  variable: "--font-imperial-script",
  display: "swap",
})

// ── Cinzel (variable, 400–900) ──────────────────────────────────────────────
export const cinzel = localFont({
  src: [{ path: "../Font/google/cinzel-normal.woff2", weight: "400 900", style: "normal" }],
  variable: "--font-cinzel",
  display: "swap",
})

// ── Playfair Display (variable, 400–900, normal + italic) ──────────────────
export const playfair = localFont({
  src: [
    { path: "../Font/google/playfair-display-normal.woff2", weight: "400 900", style: "normal" },
    { path: "../Font/google/playfair-display-italic.woff2", weight: "400 900", style: "italic" },
  ],
  variable: "--font-playfair",
  display: "swap",
})

/** Italic only — its class sets `font-style: italic` (was `Playfair_Display({ style: ["italic"] })`) */
export const playfairItalic = localFont({
  src: [{ path: "../Font/google/playfair-display-italic.woff2", weight: "400 900", style: "italic" }],
  display: "swap",
})

// ── Cormorant Garamond (variable, 300–700) ──────────────────────────────────
export const cormorant = localFont({
  src: [{ path: "../Font/google/cormorant-garamond-normal.woff2", weight: "300 700", style: "normal" }],
  display: "swap",
})

/** Regular only — its class sets `font-weight: 400` (was `Cormorant_Garamond({ weight: ["400"] })`) */
export const cormorantRegular = localFont({
  src: [{ path: "../Font/google/cormorant-garamond-normal.woff2", weight: "400", style: "normal" }],
  display: "swap",
})
