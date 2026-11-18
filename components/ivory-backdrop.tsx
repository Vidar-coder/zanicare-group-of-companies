import { IVORY_LACE_EDGE } from "@/lib/ivory-lace"
import { LUX, LUX_PATTERN, LUX_SECTION_BACKGROUND, LUX_THEME_VARS } from "@/lib/lux-dark"

/**
 * Section ground for the lower sections (Details, Book of Guests, FAQ, Footer, Gallery): the luxury
 * dark look — black with a soft gold glow — plus the theme colours re-pointed to the dark palette
 * (lib/lux-dark.ts), so text inside turns white / gold. Put it on the section's own `style`.
 * (Name kept from the earlier cream version so existing imports keep working.)
 */
export const ivorySectionStyle = { background: LUX_SECTION_BACKGROUND, ...LUX_THEME_VARS }

/**
 * Decoration that goes with the ground: a faint gold monogram pattern, gold lace edging down both
 * sides and a gilded rule along the top. Absolutely positioned — the parent needs `position: relative`.
 */
export function IvoryBackdrop() {
  return (
    <>
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 z-0"
        style={{ backgroundImage: `url("${LUX_PATTERN}")`, backgroundSize: "88px auto", opacity: 0.16 }}
      />
      <div
        aria-hidden
        className="pointer-events-none absolute inset-y-0 left-1 z-[1] w-[26px] opacity-70 sm:left-3"
        style={{ background: `${IVORY_LACE_EDGE} 0 0 / 26px 24px repeat-y` }}
      />
      <div
        aria-hidden
        className="pointer-events-none absolute inset-y-0 right-1 z-[1] w-[26px] -scale-x-100 opacity-70 sm:right-3"
        style={{ background: `${IVORY_LACE_EDGE} 0 0 / 26px 24px repeat-y` }}
      />
      <div
        aria-hidden
        className="pointer-events-none absolute inset-x-10 top-0 z-[1] h-px"
        style={{ background: `linear-gradient(to right, transparent, ${LUX.goldLine}, ${LUX.goldLight}, ${LUX.goldLine}, transparent)` }}
      />
    </>
  )
}
