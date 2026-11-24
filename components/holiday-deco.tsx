"use client"

import { useId } from "react"
import "./holiday-deco.css"

/*
 * Christmas trim above each section title: a red satin ribbon with a bow in the middle and a
 * Santa hat hooked on its left end. Purely decorative (aria-hidden); placed as the first child
 * of a section's <h1>/<h2>. Turn it off everywhere with HOLIDAY_DECO_ENABLED.
 */

export const HOLIDAY_DECO_ENABLED = true

export function HolidayDeco({ className = "" }: { className?: string }) {
  const id = useId().replace(/:/g, "")
  if (!HOLIDAY_DECO_ENABLED) return null
  const red = `hd-red-${id}`
  const redDark = `hd-red-dark-${id}`
  const fur = `hd-fur-${id}`

  return (
    <span className={`holiday-deco ${className}`} aria-hidden="true">
      <svg viewBox="0 0 260 64" className="holiday-deco__svg" focusable="false">
        <defs>
          <linearGradient id={red} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0" stopColor="#e8384a" />
            <stop offset="0.5" stopColor="#c4122a" />
            <stop offset="1" stopColor="#8e0b1e" />
          </linearGradient>
          <linearGradient id={redDark} x1="0" y1="0" x2="1" y2="1">
            <stop offset="0" stopColor="#b10f25" />
            <stop offset="1" stopColor="#6f0816" />
          </linearGradient>
          <radialGradient id={fur} cx="0.4" cy="0.35" r="0.7">
            <stop offset="0" stopColor="#ffffff" />
            <stop offset="1" stopColor="#e6e1d8" />
          </radialGradient>
        </defs>

        {/* Ribbon running out to both sides, fading at the ends */}
        <g className="holiday-deco__ribbon">
          <path
            d="M128 34 C 104 26, 86 40, 62 32 S 26 30, 8 36 L 8 41 C 26 35, 44 37, 62 38 S 104 32, 128 40 Z"
            fill={`url(#${red})`}
            opacity="0.95"
          />
          <path
            d="M132 34 C 156 26, 174 40, 198 32 S 234 30, 252 36 L 252 41 C 234 35, 216 37, 198 38 S 156 32, 132 40 Z"
            fill={`url(#${red})`}
            opacity="0.95"
          />
        </g>

        {/* Bow: two loops, two tails and a knot */}
        <g className="holiday-deco__bow">
          <path d="M126 36 L 116 58 L 122 55 L 125 60 L 130 38 Z" fill={`url(#${redDark})`} />
          <path d="M134 36 L 144 58 L 138 55 L 135 60 L 130 38 Z" fill={`url(#${redDark})`} />
          <path d="M130 32 C 118 14, 98 16, 100 28 C 101 40, 120 40, 130 34 Z" fill={`url(#${red})`} />
          <path d="M130 32 C 142 14, 162 16, 160 28 C 159 40, 140 40, 130 34 Z" fill={`url(#${red})`} />
          <path d="M126 30 C 116 22, 106 22, 106 28" fill="none" stroke="#ff8a95" strokeWidth="1.4" strokeLinecap="round" opacity="0.7" />
          <path d="M134 30 C 144 22, 154 22, 154 28" fill="none" stroke="#ff8a95" strokeWidth="1.4" strokeLinecap="round" opacity="0.7" />
          <ellipse cx="130" cy="33" rx="6.5" ry="7" fill={`url(#${redDark})`} />
          <ellipse cx="128.5" cy="31" rx="2.2" ry="2.6" fill="#ff9aa4" opacity="0.55" />
        </g>

        {/* Santa hat hooked on the left end of the ribbon */}
        <g className="holiday-deco__hat" transform="rotate(-16 40 34)">
          <path d="M22 34 C 26 18, 40 6, 58 8 C 66 9, 70 16, 72 24 C 66 18, 58 16, 54 20 C 60 24, 60 30, 58 34 Z" fill={`url(#${red})`} />
          <circle cx="73" cy="26" r="5.5" fill={`url(#${fur})`} />
          <rect x="18" y="31" width="44" height="10" rx="5" fill={`url(#${fur})`} />
        </g>
      </svg>
    </span>
  )
}
