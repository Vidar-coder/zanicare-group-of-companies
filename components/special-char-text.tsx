import { cinzel } from "@/lib/fonts"

/**
 * The display fonts (The Seasons demo, the script faces) lack clean glyphs for punctuation —
 * "-" even renders a "DEMO" mark. This sets every special character in another font:
 * "&" in the script face passed as ampClassName (falls back to Cinzel), everything else in Cinzel.
 * Plain A–Z letters, digits and spaces keep the parent's font; accented letters (ñ, é…) count as
 * special too, since the display fonts don't carry them.
 */
export function SpecialCharText({ text, ampClassName }: { text: string; ampClassName?: string }) {
  return (
    <>
      {text.split(/([^A-Za-z0-9\s]+)/).map((part, i) => {
        if (i % 2 === 0) return part
        const isAmp = part.trim() === "&"
        return (
          <span
            key={i}
            className={`${isAmp && ampClassName ? `${ampClassName} special-char--amp` : cinzel.className} special-char`}
          >
            {part}
          </span>
        )
      })}
    </>
  )
}
