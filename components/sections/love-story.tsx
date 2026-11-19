"use client"

import React, { useMemo } from "react"
import localFont from "next/font/local"
import { motion, useReducedMotion } from "motion/react"
import { StorySection } from "@/components/StorySection"
import { layeredSectionTitleSize } from "@/lib/section-typography"
import { useSiteConfig } from "@/hooks/use-site-config"
import { siteConfig as defaultSiteConfig } from "@/content/site"
import { IVORY_LACE_EDGE } from "@/lib/ivory-lace"
import "@/components/loader/loading-screen.css"
import { TintedDeco } from "@/components/tinted-deco"
import { StoryGlyphText } from "@/lib/story-glyph-text"
import { PuhonText } from "@/components/puhon-closing"
import { ClinicShowcase, type ClinicShowcaseConfig } from "@/components/sections/clinic-showcase"

const theSeasons = localFont({
  src: "../../Font/Fontspring-DEMO-theseasons-reg.otf",
  display: "swap",
  variable: "--font-the-seasons",
})

const aboveTheBeyond = localFont({
  src: "../../Font/above-the-beyond-script.otf",
  display: "swap",
  variable: "--font-above-beyond",
})

const revealEase = [0.22, 1, 0.36, 1] as const


// Luxury dark palette (matches the home hero and Welcome card)
const GOLD = "#E2B75A" // lettering
const GOLD_LINE = "#C9A24A" // rules and ornaments
const WHITE = "#F5F5F5"
// Dark edge so lettering stays crisp over the pattern
const onBgGlow = "0 1px 2px rgb(0 0 0 / 85%), 0 0 14px rgb(0 0 0 / 55%)"
// Section ground: black with a soft gold glow at the top
const SECTION_BACKGROUND = [
  "radial-gradient(110% 40% at 50% 0%, rgb(226 183 90 / 10%) 0%, transparent 65%)",
  "radial-gradient(90% 35% at 50% 100%, rgb(226 183 90 / 6%) 0%, transparent 70%)",
  "linear-gradient(180deg, #0b0b0c 0%, #121214 50%, #0b0b0c 100%)",
].join(", ")
// Gold diamond lattice pattern, (same tile as the hero)
const PATTERN = "/patterns/hex-gold.svg"

function formatStoryParagraph(
  paragraph: string,
  groom: string,
  bride: string,
): string {
  return paragraph
    .replace(/\{groom\}/g, groom)
    .replace(/\{bride\}/g, bride)
}

function OrnamentalDivider() {
  return (
    <div className="flex items-center justify-center gap-1.5">
      <span
        className="h-px w-10 sm:w-16"
        style={{ background: `linear-gradient(to right, transparent, ${GOLD_LINE})` }}
      />
      <span
        className="h-1 w-1 rotate-45 sm:h-1.5 sm:w-1.5"
        style={{ background: GOLD, boxShadow: "0 0 8px rgb(226 183 90 / 45%)" }}
        aria-hidden
      />
      <span
        className="h-px w-10 sm:w-16"
        style={{ background: `linear-gradient(to left, transparent, ${GOLD_LINE})` }}
      />
    </div>
  )
}

function LoveStoryTitle({
  title,
  subtitle,
}: {
  title: string
  subtitle: string
}) {
  return (
    <h1
      className="welcome-title-lockup relative mx-auto w-full max-w-full text-center"
      style={
        {
          "--title-size": layeredSectionTitleSize.main,
          "--script-size": layeredSectionTitleSize.script,
        } as React.CSSProperties
      }
    >
      <span
        className={`${theSeasons.className} block pb-1 uppercase leading-[0.78] tracking-[0.08em] min-[400px]:tracking-[0.11em] sm:tracking-[0.13em] md:tracking-[0.14em]`}
        style={{
          fontSize: "var(--title-size)",
          color: WHITE,
          textShadow: onBgGlow,
        }}
      >
        <StoryGlyphText text={title} />
      </span>
      <span
        aria-hidden
        className={`${aboveTheBeyond.className} mx-auto mt-2 block w-fit max-w-full px-1 leading-[0.88] sm:mt-2.5 sm:leading-[0.9] md:mt-3`}
        style={{
          fontSize: "var(--script-size)",
          color: GOLD,
          textShadow: `${onBgGlow}, 0 0 20px rgb(226 183 90 / 25%)`,
        }}
      >
        <StoryGlyphText text={subtitle} />
      </span>
      <span className="sr-only">{subtitle}</span>
    </h1>
  )
}

// A paragraph that starts with "— " (e.g. "— Benedict") is the author's sign-off: set apart as a
// small italic signature with a short gold rule, instead of a normal paragraph
const SIGNATURE = /^\s*[—–-]\s+/
// A paragraph that starts with "• " is a list item: consecutive ones become one list with gold diamonds
const LIST_ITEM = /^\s*•\s+/

function GoldList({ items }: { items: string[] }) {
  return (
    <ul className="love-story-list my-4 space-y-2">
      {items.map((item, i) => (
        <li key={i}>
          <span
            aria-hidden
            className="mr-2.5 inline-block h-1.5 w-1.5 -translate-y-[0.2em] rotate-45"
            style={{ background: GOLD, boxShadow: "0 0 6px rgb(226 183 90 / 50%)" }}
          />
          <StoryGlyphText text={item} />
        </li>
      ))}
    </ul>
  )
}

function chapterTextFromParagraphs(
  paragraphs: readonly string[],
  groom: string,
  bride: string,
) {
  const texts = paragraphs.map((paragraph) => formatStoryParagraph(paragraph, groom, bride))
  return (
    <>
      {texts.map((text, index) => {
        if (LIST_ITEM.test(text)) {
          // the first item of a run renders the whole list; the rest are already in it
          if (index > 0 && LIST_ITEM.test(texts[index - 1])) return null
          const items: string[] = []
          for (let j = index; j < texts.length && LIST_ITEM.test(texts[j]); j++) items.push(texts[j].replace(LIST_ITEM, ""))
          return <GoldList key={index} items={items} />
        }
        if (SIGNATURE.test(text)) {
          return (
            <p
              key={index}
              className="love-story-signature mt-3 inline-flex items-center gap-2 font-goudy-italic italic"
              style={{ color: GOLD, fontSize: "1.05em", letterSpacing: "0.02em" }}
            >
              <span aria-hidden className="h-px w-6" style={{ background: GOLD_LINE }} />
              <StoryGlyphText text={text.replace(SIGNATURE, "")} />
            </p>
          )
        }
        return (
          <p
            key={index}
            className={texts.length > 1 && index < texts.length - 1 ? "mb-4" : undefined}
          >
            <StoryGlyphText text={text} />
          </p>
        )
      })}
    </>
  )
}

// The section paints its own black-and-gold ground with a gold diamond lattice pattern.
// skyBackdrop is kept for compatibility and no longer changes anything.
export function LoveStory(_props: { skyBackdrop?: boolean } = {}) {
  const siteConfig = useSiteConfig()
  const loading = siteConfig.loadingScreen ?? defaultSiteConfig.loadingScreen
  const loveStory = siteConfig.loveStory ?? defaultSiteConfig.loveStory
  // Corner florals + border live in content/site.ts → loveStory.decos / showFrame
  const corners = loveStory.decos ?? defaultSiteConfig.loveStory.decos
  const showFrame = loveStory.showFrame ?? defaultSiteConfig.loveStory.showFrame
  const intro = loveStory.intro ?? defaultSiteConfig.loveStory.intro
  const headerOrnament = loveStory.headerOrnament ?? defaultSiteConfig.loveStory.headerOrnament
  const photoAlt = loveStory.photoAlt ?? defaultSiteConfig.loveStory.photoAlt
  const showChapterNumbers = loveStory.showChapterNumbers ?? defaultSiteConfig.loveStory.showChapterNumbers
  const showChapterDividers = loveStory.showChapterDividers ?? defaultSiteConfig.loveStory.showChapterDividers
  const isPlain = loading.display === "plain"
  const reduceMotion = useReducedMotion()

  const groom =
    siteConfig.couple.groomNickname || siteConfig.couple.groom
  const bride =
    siteConfig.couple.brideNickname || siteConfig.couple.bride

  const chapters = useMemo(
    () => loveStory.chapters ?? defaultSiteConfig.loveStory.chapters,
    [loveStory.chapters],
  )
  const eucalyptusDecos =
    loveStory.eucalyptusDecos ?? defaultSiteConfig.loveStory.eucalyptusDecos
  // Clinic photo showcase (content/site.ts → loveStory.clinicShowcase), placed after chapter `afterChapter`
  const clinicShowcase = (loveStory.clinicShowcase ?? defaultSiteConfig.loveStory.clinicShowcase) as ClinicShowcaseConfig
  const showcaseAfter =
    clinicShowcase?.show === false
      ? -1
      : Math.min(clinicShowcase?.afterChapter || chapters.length, chapters.length) - 1

  return (
    <div
      id="love-story"
      // z-[2]: the whole section is one layer ABOVE the circle pattern (PlainBubbles, z-index 1,
      // painted by the parent wrapper) — its translucent wash then softens the circles behind it.
      // (A bare `isolate` would put the section at z-index auto, under the circles' opaque base.)
      className={`love-story-root ${theSeasons.variable} ${aboveTheBeyond.variable} relative z-[2] min-h-screen w-full overflow-x-hidden`}
      style={{ background: SECTION_BACKGROUND }}
    >
      {/* Gold diamond lattice pattern across the whole section */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 z-0"
        style={{
          backgroundImage: `url("${PATTERN}")`,
          backgroundSize: "180px auto",
          opacity: 0.85,
        }}
      />
      {/* Lace edging down both sides and a gold rule along the top (same as the couple video) */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-y-0 left-1 z-[1] w-[26px] opacity-80 sm:left-3"
        style={{ background: `${IVORY_LACE_EDGE} 0 0 / 26px 24px repeat-y` }}
      />
      <div
        aria-hidden
        className="pointer-events-none absolute inset-y-0 right-1 z-[1] w-[26px] -scale-x-100 opacity-80 sm:right-3"
        style={{ background: `${IVORY_LACE_EDGE} 0 0 / 26px 24px repeat-y` }}
      />
      <div
        aria-hidden
        className="pointer-events-none absolute inset-x-10 top-0 z-[1] h-px"
        style={{ background: `linear-gradient(to right, transparent, ${GOLD_LINE}, #F3D27A, ${GOLD_LINE}, transparent)` }}
      />

      {/* Corner florals at the section's four corners, sized per corner like the loader
          (original artwork colors), over a thin double border in champagne gold */}
      {isPlain && showFrame && (
        <div
          className="love-story-frame"
          aria-hidden="true"
          style={{ "--color-motif-medium": GOLD_LINE } as React.CSSProperties}
        />
      )}
      {(
        [
          { src: corners.topLeft, pos: "tl", className: "left-0 top-0" },
          { src: corners.topRight, pos: "tr", className: "right-0 top-0" },
          { src: corners.bottomLeft, pos: "bl", className: "left-0 bottom-0" },
          { src: corners.bottomRight, pos: "br", className: "right-0 bottom-0" },
        ] as const
      )
        .filter(({ src }) => src)
        .map(({ src, pos, className }) => (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            key={pos}
            src={src}
            alt=""
            aria-hidden="true"
            className={`love-story-corner love-story-corner--${pos} pointer-events-none absolute z-[1] select-none ${className}`}
          />
        ))}

      <header
        className="love-story-header relative z-20 pb-6 pt-24 text-center sm:pb-12 sm:pt-36 md:pb-14 md:pt-44"
      >
        <motion.div
          className="relative mx-auto max-w-3xl @container/love-story"
          initial={reduceMotion ? false : { opacity: 0, y: 22 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-40px" }}
          transition={{ duration: 0.75, ease: revealEase }}
        >
          {headerOrnament ? (
            <TintedDeco src={headerOrnament} className="love-story-ornament mx-auto mb-3 sm:mb-4" />
          ) : null}
          <LoveStoryTitle title={loveStory.title} subtitle={loveStory.subtitle} />
          <div className="mt-4 sm:mt-5">
            <OrnamentalDivider />
          </div>
          {intro ? (
            <p className="love-story-intro mx-auto mt-5 max-w-xl sm:mt-6">
              <StoryGlyphText text={intro} />
            </p>
          ) : null}
        </motion.div>
      </header>

      {chapters.map((chapter, index) => (
        <React.Fragment key={`${chapter.image}-${index}`}>
        <StorySection
          title={chapter.title}
          // Sides (and light/dark cards) alternate automatically; a chapter's layout overrides it
          theme={index % 2 ? "dark" : "light"}
          layout={chapter.layout ?? (index % 2 ? "image-right" : "image-left")}
          imageSrc={chapter.image}
          videoSrc={chapter.video}
          imageAlt={formatStoryParagraph(chapter.imageAlt || photoAlt, groom, bride)}
          imagePosition={chapter.imagePosition}
          imageAspect={chapter.imageAspect}
          showNumber={showChapterNumbers}
          showDivider={showChapterDividers}
          date={chapter.date}
          text={chapterTextFromParagraphs(chapter.paragraphs, groom, bride)}
          plain={isPlain}
          chapterIndex={index}
          isFirst={index === 0}
          isLast={index === chapters.length - 1}
          eucalyptusDecos={isPlain ? eucalyptusDecos : undefined}
          chapterLabelText={loveStory.chapterLabel}
        />
        {index === showcaseAfter ? <ClinicShowcase config={clinicShowcase} /> : null}
        </React.Fragment>
      ))}

      <footer
        className="relative z-20 px-4 pb-16 pt-8 text-center sm:px-6 sm:pb-20 sm:pt-10 md:pb-24 md:px-8 md:pt-12"
      >
        <motion.div
          className="relative mx-auto max-w-xl px-2"
          initial={reduceMotion ? false : { opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-40px" }}
          transition={{ duration: 0.75, delay: 0.08, ease: revealEase }}
        >
          <OrnamentalDivider />
          <PuhonText tone="gold" className="mt-6 sm:mt-8" />
          {isPlain && eucalyptusDecos.sectionBottom ? (
            <TintedDeco src={eucalyptusDecos.sectionBottom} className="love-story-footer-euc mx-auto mt-8 sm:mt-10" />
          ) : null}
        </motion.div>
      </footer>
    </div>
  )
}
