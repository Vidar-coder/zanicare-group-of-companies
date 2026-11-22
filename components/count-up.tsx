"use client"

import { useEffect, useRef, useState } from "react"
import { animate, useInView, useReducedMotion } from "motion/react"
import { SpecialCharText } from "@/components/special-char-text"

/**
 * Counts a stat up from 0 when it scrolls into view: "33+" → 0+ … 33+.
 * Text around the number (a "+", "%", …) is kept. Years ("2022") and non-numbers stay still.
 * Screen readers get the final value only. Symbols are set in Cinzel (see SpecialCharText).
 */
export function CountUp({ value, duration = 1.8 }: { value: string; duration?: number }) {
  const text = value.trim()
  const match = /^(\D*)(\d[\d,]*)(\D*)$/.exec(text)
  const target = match ? Number(match[2].replace(/,/g, "")) : 0
  const still = !match || /^(19|20)\d{2}$/.test(text)

  const ref = useRef<HTMLSpanElement>(null)
  const inView = useInView(ref, { once: true, margin: "-40px" })
  const reduceMotion = useReducedMotion()
  const [current, setCurrent] = useState(0)

  useEffect(() => {
    if (still || !inView) return
    if (reduceMotion) {
      setCurrent(target)
      return
    }
    const controls = animate(0, target, {
      duration,
      ease: [0.22, 1, 0.36, 1],
      onUpdate: (v) => setCurrent(Math.round(v)),
    })
    return () => controls.stop()
  }, [still, inView, reduceMotion, target, duration])

  if (still) return <SpecialCharText text={value} />

  return (
    <span ref={ref}>
      <span aria-hidden style={{ fontVariantNumeric: "tabular-nums" }}>
        <SpecialCharText text={match[1]} />
        <SpecialCharText text={current.toLocaleString("en-US")} />
        <SpecialCharText text={match[3]} />
      </span>
      <span className="sr-only">{text}</span>
    </span>
  )
}
