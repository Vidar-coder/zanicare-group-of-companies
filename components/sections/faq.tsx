"use client"

import { useState, type CSSProperties, type ReactNode } from "react"
import { ChevronDown, MessageCircleQuestion } from "lucide-react"
import { motion, useReducedMotion, type Variants } from "motion/react"
import { cinzel } from "@/lib/fonts"
import localFont from "next/font/local"
import { useSiteConfig } from "@/hooks/use-site-config"
import { layeredSectionTitleSize, sectionType } from "@/lib/section-typography"
import { TintedDeco } from "@/components/tinted-deco"
import { DecoCorners } from "@/components/deco-corners"
import { IvoryBackdrop, ivorySectionStyle } from "@/components/ivory-backdrop"
import { LUX, LUX_CARD, LUX_TEXT_SHADOW } from "@/lib/lux-dark"


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

// Luxury dark palette (lib/lux-dark.ts): black card with a gold edge, white questions, soft white
// answers; gold marks the open question, gold hairlines and diamonds for ornaments.
const BODY = LUX.body
const ACCENT = LUX.gold
// Row fills: a whisper of gold over black
const SKY_TINT = (pct: number) => `rgb(226 183 90 / ${Math.max(3, Math.round(pct * 0.6))}%)`

// Text sitting directly on the pattern: white (or gold) with a dark edge
const textGlow = LUX_TEXT_SHADOW
const onBg = {
  color: LUX.white,
  textShadow: textGlow,
} as const
const onBgBlue = { color: LUX.gold, textShadow: textGlow } as const

const cardStyle = {
  ...LUX_CARD,
  boxShadow: `0 0 0 6px rgb(0 0 0 / 35%), ${LUX_CARD.boxShadow}`,
} as const

// Soft gold hairline
const GOLD_HAIRLINE = "rgb(201 162 74 / 45%)"
const dividerLineStyle = {
  background: `linear-gradient(to right, transparent, ${GOLD_HAIRLINE}, transparent)`,
} as const

// Open question: a quiet gold accent (tinted, not solid gold) so the answer stays the focus
const OPEN = {
  rowBorder: "rgb(201 162 74 / 38%)",
  rowBar: "rgb(201 162 74 / 55%)",
  badgeBg: "rgb(226 183 90 / 14%)",
  badgeRing: "inset 0 0 0 1px rgb(201 162 74 / 65%)",
  chevronBg: "rgb(226 183 90 / 12%)",
} as const

const ct = {
  body: sectionType.textRelaxed,
  question: sectionType.text,
} as const

const ease = [0.22, 1, 0.36, 1] as const

const revealVariants: Variants = {
  hidden: { opacity: 0, y: 24 },
  show: { opacity: 1, y: 0, transition: { duration: 0.8, ease } },
}

const listVariants: Variants = {
  hidden: {},
  show: { transition: { staggerChildren: 0.06, delayChildren: 0.1 } },
}

const itemVariants: Variants = {
  hidden: { opacity: 0, y: 14 },
  show: { opacity: 1, y: 0, transition: { duration: 0.55, ease } },
}

function DecoImg({ src, className }: { src: string; className: string }) {
  if (!src) return null
  return <TintedDeco src={src} className={className} />
}

// Gold hairlines either side of a small gold diamond
function DiamondDivider() {
  return (
    <div className="flex items-center justify-center gap-2" aria-hidden>
      <span className="h-px w-10 sm:w-16" style={{ background: `linear-gradient(to right, transparent, ${GOLD_HAIRLINE})` }} />
      <span className="h-1.5 w-1.5 rotate-45" style={{ background: LUX.gold }} />
      <span className="h-px w-10 sm:w-16" style={{ background: `linear-gradient(to left, transparent, ${GOLD_HAIRLINE})` }} />
    </div>
  )
}

function FaqTitle({ title, subtitle }: { title: string; subtitle: string }) {
  return (
    <h2
      className="welcome-title-lockup relative mx-auto w-full max-w-full text-center"
      style={
        {
          "--title-size": layeredSectionTitleSize.main,
          "--script-size": layeredSectionTitleSize.script,
        } as CSSProperties
      }
    >
      <span className="sr-only">
        {title} — {subtitle}
      </span>
      <span
        aria-hidden
        className={`${theSeasons.className} block uppercase leading-[0.9] tracking-[0.04em] min-[400px]:tracking-[0.08em] sm:tracking-[0.12em] md:tracking-[0.14em]`}
        style={{ fontSize: "var(--title-size)", ...onBg }}
      >
        {title}
      </span>
      <span
        aria-hidden
        className={`${aboveTheBeyond.className} relative z-10 mx-auto mt-1.5 block w-fit max-w-full px-1 leading-[0.88] sm:mt-2 sm:leading-[0.9]`}
        style={{ fontSize: "var(--script-size)", ...onBgBlue }}
      >
        {subtitle}
      </span>
    </h2>
  )
}

// "[guest list](#guest-list)" → smooth-scrolling link; "[label](https://…)" → opens in a
// new tab; everything else stays text
function renderInline(text: string): ReactNode[] {
  const parts = text.split(/(\[[^\]]+\]\((?:#|https?:\/\/)[^)]+\))/g)
  return parts.map((part, i) => {
    const match = part.match(/^\[([^\]]+)\]\(((?:#|https?:\/\/)[^)]+)\)$/)
    if (!match) return part
    const [, label, href] = match
    const isAnchor = href.startsWith("#")
    return (
      <a
        key={i}
        href={href}
        {...(isAnchor ? {} : { target: "_blank", rel: "noopener noreferrer" })}
        className="font-semibold underline decoration-[rgb(201_162_74_/_55%)] underline-offset-2 transition-opacity hover:opacity-80"
        style={{ color: "var(--color-welcome-heading)" }}
        onClick={
          isAnchor
            ? (e) => {
                e.preventDefault()
                document.getElementById(href.slice(1))?.scrollIntoView({ behavior: "smooth" })
              }
            : undefined
        }
      >
        {label}
      </a>
    )
  })
}

// Paragraphs split on blank lines; lines starting with "• " render as a list
function FaqAnswer({ answer }: { answer: string }) {
  const blocks = answer.split(/\n{2,}/)
  return (
    <div className={`font-goudy-italic ${ct.body} space-y-2.5`} style={{ color: BODY }}>
      {blocks.map((block, i) => {
        const lines = block.split("\n").filter(Boolean)
        if (lines.length > 0 && lines.every((line) => line.trim().startsWith("•"))) {
          return (
            <ul key={i} className="space-y-1.5">
              {lines.map((line, j) => (
                <li key={j} className="flex items-start gap-2">
                  <span
                    aria-hidden
                    className="mt-[0.6em] h-1.5 w-1.5 shrink-0 rotate-45"
                    style={{ background: "rgb(201 162 74 / 75%)" }}
                  />
                  <span>{renderInline(line.replace(/^\s*•\s*/, ""))}</span>
                </li>
              ))}
            </ul>
          )
        }
        return (
          <p key={i} className="whitespace-pre-line">
            {renderInline(block)}
          </p>
        )
      })}
    </div>
  )
}

// background: false when a parent already paints one continuous circle pattern
// behind this and the previous section (see components/invitation-page.tsx)
export function FAQ({ background = true }: { background?: boolean } = {}) {
  const siteConfig = useSiteConfig()
  const content = siteConfig.faq
  const { decos } = content
  const reduceMotion = useReducedMotion()
  const [openIndex, setOpenIndex] = useState<number | null>(null)

  const rsvp = siteConfig.details.rsvp
  const rsvpPhone = rsvp.phone.trim()
  const showRsvpPhone = rsvpPhone.length > 0 && !/to be announced/i.test(rsvpPhone)
  const fillAnswer = (text: string) =>
    text
      .split("{deadline}").join(rsvp.deadline.replace(/\.\s*$/, ""))
      .split("{coordinator}").join(rsvp.coordinator)
      // coordinator may itself use {groom} / {bride}
      .split("{groom}").join(siteConfig.couple.groomNickname || siteConfig.couple.groom)
      .split("{bride}").join(siteConfig.couple.brideNickname || siteConfig.couple.bride)
      .split("{contact}").join(showRsvpPhone ? ` at ${rsvpPhone}` : "")

  const initial = reduceMotion ? false : "hidden"

  return (
    <div
      className={`${theSeasons.variable} ${aboveTheBeyond.variable} relative w-full overflow-hidden`}
      style={background ? ivorySectionStyle : undefined}
    >
      {/* Dark ground with gold pattern + lace edging and double border (on the invitation page the
          shared wrapper paints these instead — see invitation-page.tsx) */}
      {background && <IvoryBackdrop />}
      {background && content.showFrame && <div className="deco-frame" aria-hidden="true" />}
      <section
        id="faq"
        className="relative z-10 overflow-hidden pt-14 pb-12 sm:pt-16 sm:pb-14 md:pt-20 md:pb-16 lg:pt-24 lg:pb-20"
      >
        {/* Corner florals (content/site.ts → faq.decos) — bottom only; Book of Guests sits above */}
        <DecoCorners decos={{ bottomLeft: decos.bottomLeft, bottomRight: decos.bottomRight }} />

        {/* Header */}
        <motion.div
          className="relative z-20 mx-auto mb-8 max-w-5xl px-3 text-center @container/faq sm:mb-10 sm:px-4 md:mb-12"
          variants={revealVariants}
          initial={initial}
          whileInView="show"
          viewport={{ once: true, amount: 0.3 }}
        >
          {/* Soft dark pool so the heading reads cleanly over the pattern */}
          <span
            aria-hidden
            className="pointer-events-none absolute left-1/2 top-1/2 -z-10 h-[120%] w-[min(40rem,110%)] -translate-x-1/2 -translate-y-1/2 rounded-full blur-2xl"
            style={{ background: "radial-gradient(ellipse at center, rgb(0 0 0 / 55%) 0%, rgb(0 0 0 / 25%) 50%, transparent 72%)" }}
          />
          <DecoImg
            src={decos.headerOrnament}
            className="mx-auto mb-3 block h-auto w-28 select-none sm:mb-4 sm:w-36 md:w-44"
          />
          <DiamondDivider />
          <p
            className={`${cinzel.className} mx-auto mt-4 max-w-[20rem] px-2 text-[0.6875rem] font-semibold uppercase leading-snug tracking-[0.16em] min-[400px]:max-w-none min-[400px]:text-[0.75rem] sm:mt-5 sm:text-[0.875rem] sm:tracking-[0.22em]`}
            style={onBgBlue}
          >
            {content.eyebrow}
          </p>
          <div className="mx-auto mt-3 sm:mt-4 md:mt-5">
            <FaqTitle title={content.title} subtitle={content.subtitle} />
          </div>
          <p
            className={`font-goudy-italic mx-auto mt-4 max-w-xl px-2 sm:mt-5 md:mt-6 ${ct.body}`}
            style={{ ...onBg, fontWeight: 600 }}
          >
            {content.description}
          </p>
          <div className="mt-4 flex items-center justify-center sm:mt-5">
            <span
              className="h-px w-16 sm:w-24 md:w-32"
              style={dividerLineStyle}
            />
          </div>
        </motion.div>

        {/* Questions */}
        <div className="relative z-20 mx-auto max-w-3xl px-4 sm:px-6 md:px-8">
          <motion.div
            className="relative overflow-hidden rounded-[1.75rem] sm:rounded-[2.25rem]"
            style={cardStyle}
            variants={revealVariants}
            initial={initial}
            whileInView="show"
            viewport={{ once: true, amount: 0.1 }}
          >
            <motion.ul
              className="relative z-20 space-y-2 px-4 py-5 sm:space-y-2.5 sm:px-6 sm:py-7 md:px-8"
              variants={listVariants}
              initial={initial}
              whileInView="show"
              viewport={{ once: true, amount: 0.1 }}
            >
              {content.items.map((item, index) => {
                const isOpen = openIndex === index
                const contentId = `faq-item-${index}`
                return (
                  <motion.li
                    key={item.question}
                    variants={itemVariants}
                    className="relative overflow-hidden rounded-2xl transition-all duration-300"
                    style={{
                      background: isOpen ? SKY_TINT(9) : SKY_TINT(4),
                      border: `1px solid ${isOpen ? OPEN.rowBorder : "rgb(142 142 147 / 28%)"}`,
                      boxShadow: isOpen
                        ? `inset 2px 0 0 ${OPEN.rowBar}, 0 12px 24px -16px rgb(0 0 0 / 80%)`
                        : "none",
                    }}
                  >
                    <button
                      type="button"
                      onClick={() => setOpenIndex(isOpen ? null : index)}
                      id={`${contentId}-button`}
                      className="group flex w-full items-center gap-3 rounded-2xl px-3.5 py-3 text-left outline-none focus-visible:ring-2 focus-visible:ring-[rgb(201_162_74_/_70%)] sm:px-5 sm:py-3.5"
                      aria-expanded={isOpen}
                      aria-controls={contentId}
                    >
                      <span
                        className={`${cinzel.className} flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-[0.66rem] font-semibold tabular-nums tracking-[0.02em] transition-all duration-300 sm:h-8 sm:w-8 sm:text-[0.72rem]`}
                        style={
                          isOpen
                            ? { background: OPEN.badgeBg, color: LUX.gold, boxShadow: OPEN.badgeRing }
                            : {
                                background: "rgb(0 0 0 / 45%)",
                                color: LUX.gold,
                                boxShadow: "inset 0 0 0 1px rgb(201 162 74 / 45%)",
                              }
                        }
                        aria-hidden
                      >
                        {String(index + 1).padStart(2, "0")}
                      </span>
                      <span
                        className={`${cinzel.className} ${ct.question} flex-1 font-semibold leading-snug transition-colors duration-200 ${
                          isOpen ? "text-[#EBD7A6]" : "text-[var(--color-welcome-navy)] group-hover:text-[#EBD7A6]"
                        }`}
                      >
                        {item.question}
                      </span>
                      <span
                        className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-full transition-all duration-300 ${isOpen ? "rotate-180" : "group-hover:translate-y-0.5"}`}
                        style={{
                          background: isOpen ? OPEN.chevronBg : SKY_TINT(16),
                          boxShadow: isOpen ? "inset 0 0 0 1px rgb(201 162 74 / 40%)" : "none",
                        }}
                        aria-hidden
                      >
                        <ChevronDown className="h-4 w-4" style={{ color: ACCENT }} />
                      </span>
                    </button>

                    <div
                      id={contentId}
                      role="region"
                      aria-labelledby={`${contentId}-button`}
                      inert={!isOpen}
                      className={`grid transition-all duration-300 ease-out ${
                        isOpen ? "grid-rows-[1fr] opacity-100" : "grid-rows-[0fr] opacity-0"
                      }`}
                    >
                      <div className="overflow-hidden">
                        <div className="px-3.5 pb-4 sm:px-5 sm:pb-5">
                          <span className="mb-3 block h-px w-full" style={dividerLineStyle} aria-hidden />
                          <div className="sm:pl-11">
                            <FaqAnswer answer={fillAnswer(item.answer)} />
                          </div>
                        </div>
                      </div>
                    </div>
                  </motion.li>
                )
              })}
            </motion.ul>

            {content.contactNote ? (
              <div className="relative z-20 px-4 pb-6 sm:px-6 sm:pb-8 md:px-8">
                <span className="mb-4 block h-px w-full sm:mb-5" style={dividerLineStyle} aria-hidden />
                <div className="flex flex-col items-center gap-2 text-center">
                  <span
                    className="flex h-8 w-8 items-center justify-center rounded-full"
                    style={{ background: "rgb(0 0 0 / 45%)", boxShadow: "inset 0 0 0 1px rgb(201 162 74 / 45%)" }}
                    aria-hidden
                  >
                    <MessageCircleQuestion className="h-4 w-4" style={{ color: LUX.gold }} />
                  </span>
                  <p
                    className={`${cinzel.className} text-[0.66rem] font-semibold uppercase tracking-[0.2em] sm:text-xs`}
                    style={{ color: LUX.gold }}
                  >
                    {content.contactTitle}
                  </p>
                  <div className="max-w-md">
                    <FaqAnswer answer={fillAnswer(content.contactNote)} />
                  </div>
                </div>
              </div>
            ) : null}
          </motion.div>

          <DecoImg
            src={decos.footerVine}
            className="mx-auto mt-10 block h-auto w-56 select-none opacity-90 sm:mt-12 sm:w-72 md:w-96"
          />
        </div>
      </section>
    </div>
  )
}
