"use client"

import React from "react"
import Image from "next/image"
import localFont from "next/font/local"
import { motion, useReducedMotion } from "motion/react"
import { cinzel } from "@/lib/fonts"
import { StoryGlyphText } from "@/lib/story-glyph-text"
import "./clinic-showcase.css"
import { HolidayDeco } from '@/components/holiday-deco'

const theSeasons = localFont({
  src: "../../Font/Fontspring-DEMO-theseasons-reg.otf",
  display: "swap",
})

const aboveTheBeyond = localFont({
  src: "../../Font/above-the-beyond-script.otf",
  display: "swap",
})

const revealEase = [0.22, 1, 0.36, 1] as const

export type ClinicShowcaseConfig = {
  show?: boolean
  afterChapter?: number
  eyebrow?: string
  title: string
  script?: string
  text?: string
  branches?: readonly string[]
  rows: readonly { label: string; photos: readonly string[] }[]
}

/**
 * One gold-framed clinic photo with its badge. Every card is the same square: the whole photo is
 * shown, and any space a tall or wide photo leaves is filled by a blurred copy of the same photo.
 */
function ClinicCard({ src, label, index, eager }: { src: string; label: string; index: number; eager: boolean }) {
  const url = encodeURI(src)
  const sizes = "(max-width: 640px) 74vw, 352px"
  return (
    <figure className="clinic-card">
      <div className="clinic-card__photo">
        <Image
          src={url}
          alt=""
          aria-hidden
          fill
          sizes={sizes}
          className="clinic-card__backdrop object-cover"
          quality={85}
          loading={eager ? "eager" : "lazy"}
        />
        <Image
          src={url}
          alt={`Zanicare clinic — ${label.toLowerCase()} (${index + 1})`}
          fill
          sizes={sizes}
          className="clinic-card__img object-contain"
          quality={85}
          loading={eager ? "eager" : "lazy"}
        />
        <span className="clinic-card__shine" aria-hidden />
      </div>
      <figcaption className={`${cinzel.className} clinic-card__badge`}>
        <span className="clinic-card__diamond" aria-hidden />
        {label}
      </figcaption>
    </figure>
  )
}

/**
 * A row that glides sideways forever. The photos are listed twice and the track slides by half its
 * width, so the loop is seamless; the second copy is hidden from screen readers. With reduced motion
 * the row stands still and scrolls by hand instead.
 */
function MarqueeRow({
  photos,
  label,
  reverse,
  duration,
  still,
}: {
  photos: readonly string[]
  label: string
  reverse: boolean
  duration: number
  still: boolean
}) {
  const copies = still ? [0] : [0, 1]
  return (
    <div className={`clinic-marquee${still ? " clinic-marquee--still" : ""}`}>
      <div
        className={`clinic-marquee__track${reverse ? " clinic-marquee__track--reverse" : ""}`}
        style={{ "--marquee-duration": `${duration}s` } as React.CSSProperties}
      >
        {copies.map((copy) => (
          <div key={copy} className="clinic-marquee__set" aria-hidden={copy === 1 ? true : undefined}>
            {photos.map((src, i) => (
              <ClinicCard key={`${copy}-${src}`} src={src} label={label} index={i} eager={false} />
            ))}
          </div>
        ))}
      </div>
    </div>
  )
}

/** Gold ribbon of branch names running the other way between the two photo rows */
function BranchRibbon({ branches, still }: { branches: readonly string[]; still: boolean }) {
  const copies = still ? [0] : [0, 1]
  return (
    <div className={`clinic-ribbon${still ? " clinic-ribbon--still" : ""}`}>
      <div className="clinic-ribbon__track">
        {copies.map((copy) => (
          <div key={copy} className="clinic-ribbon__set" aria-hidden={copy === 1 ? true : undefined}>
            {/* repeated so even a short list fills a wide screen */}
            {[...branches, ...branches].map((name, i) => (
              <span key={`${copy}-${i}`} className={`${cinzel.className} clinic-ribbon__name`}>
                {name}
                <span className="clinic-ribbon__diamond" aria-hidden />
              </span>
            ))}
          </div>
        ))}
      </div>
    </div>
  )
}

export function ClinicShowcase({ config }: { config: ClinicShowcaseConfig }) {
  const reduceMotion = useReducedMotion() ?? false
  const rows = config.rows.filter((row) => row.photos.length > 0)
  if (!rows.length) return null

  return (
    <section className="clinic-showcase relative z-20" aria-labelledby="clinic-showcase-title">
      <motion.header
        className="relative mx-auto max-w-2xl px-6 text-center"
        initial={reduceMotion ? false : { opacity: 0, y: 22 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: "-40px" }}
        transition={{ duration: 0.75, ease: revealEase }}
      >
        {config.eyebrow ? (
          <p className={`${cinzel.className} clinic-showcase__eyebrow`}>
            <span className="clinic-showcase__eyebrow-rule" aria-hidden />
            {config.eyebrow}
            <span className="clinic-showcase__eyebrow-rule clinic-showcase__eyebrow-rule--right" aria-hidden />
          </p>
        ) : null}
        <HolidayDeco />
        <h2 id="clinic-showcase-title" className={`${theSeasons.className} clinic-showcase__title`}>
          <StoryGlyphText text={config.title} />
        </h2>
        {config.script ? (
          <p className={`${aboveTheBeyond.className} clinic-showcase__script`}>
            <StoryGlyphText text={config.script} />
          </p>
        ) : null}
        {config.text ? <p className="clinic-showcase__text font-goudy-italic">{config.text}</p> : null}
      </motion.header>

      {/* The tilted band: photos one way, names the other, photos back again */}
      <motion.div
        className="clinic-showcase__band"
        initial={reduceMotion ? false : { opacity: 0, scale: 0.94 }}
        whileInView={{ opacity: 1, scale: 1 }}
        viewport={{ once: true, margin: "-60px" }}
        transition={{ duration: 1.1, ease: revealEase }}
      >
        <span className="clinic-showcase__beam" aria-hidden />
        {rows.map((row, i) => (
          <React.Fragment key={row.label}>
            {i === 1 && config.branches?.length ? (
              <BranchRibbon branches={config.branches} still={reduceMotion} />
            ) : null}
            <MarqueeRow
              photos={row.photos}
              label={row.label}
              reverse={i % 2 === 1}
              duration={Math.max(45, row.photos.length * 11)}
              still={reduceMotion}
            />
          </React.Fragment>
        ))}
        {rows.length === 1 && config.branches?.length ? (
          <BranchRibbon branches={config.branches} still={reduceMotion} />
        ) : null}
      </motion.div>
    </section>
  )
}
