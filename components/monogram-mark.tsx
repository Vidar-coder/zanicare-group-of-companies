import type React from "react"

// Monogram mark (public/monogram/monogram.png), painted in any color through its alpha.
// Size it with className (e.g. "h-4 w-5").
const MONOGRAM_SRC = "/monogram/monogram.png"

export function MonogramMark({
  color,
  className = "",
  style,
}: {
  color: string
  className?: string
  style?: React.CSSProperties
}) {
  return (
    <span
      aria-hidden
      className={`inline-block shrink-0 ${className}`}
      style={{
        ...style,
        backgroundColor: color,
        WebkitMaskImage: `url("${MONOGRAM_SRC}")`,
        maskImage: `url("${MONOGRAM_SRC}")`,
        WebkitMaskRepeat: "no-repeat",
        maskRepeat: "no-repeat",
        WebkitMaskPosition: "center",
        maskPosition: "center",
        WebkitMaskSize: "contain",
        maskSize: "contain",
      }}
    />
  )
}
