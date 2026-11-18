"use client"

import { useEffect, useState } from "react"
import { cinzel } from "@/lib/fonts"
import localFont from "next/font/local"
import Image from "next/image"
import { motion, useReducedMotion, type Variants } from "motion/react"
import { useSiteConfig } from "@/hooks/use-site-config"
import { CrossfadeImages } from "@/components/crossfade-images"


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

// Motif: deep sage (washes), terracotta warmth, summer yellow → orange accents, ivory type
const IVORY = "#FFF8F2"
const YELLOW = "#F2C230"
const ORANGE = "#E8833A"
const SUN_GRADIENT = `linear-gradient(90deg, ${YELLOW} 0%, ${ORANGE} 100%)`
const DEEP = "31 38 24" // deep sage / olive (rgb) — shadows and fades
const WARM = "197 106 74" // terracotta #8E8E93 (rgb) — warm glow in the fade
const BUTTER = YELLOW
const entryEase = [0.22, 1, 0.36, 1] as const
const SLIDE_MS = 5000

const titleSize = "clamp(2.85rem, 13.5vw, 6.75rem)"
const photoTitleShadow =
  `0 1px 0 rgb(255 248 242 / 28%), 0 2px 18px rgb(${DEEP} / 65%), 0 12px 36px rgb(${DEEP} / 50%)`
const softShadow = `0 1px 2px rgb(${DEEP} / 85%), 0 2px 8px rgb(${DEEP} / 70%), 0 6px 24px rgb(${DEEP} / 55%)`

const stagger: Variants = {
  hidden: {},
  show: { transition: { staggerChildren: 0.14, delayChildren: 0.55 } },
}

const rise: Variants = {
  hidden: { opacity: 0, y: 18, filter: "blur(6px)" },
  show: { opacity: 1, y: 0, filter: "blur(0px)", transition: { duration: 0.85, ease: entryEase } },
}

// Desktop panels wipe up from the bottom one after another
const panelReveal: Variants = {
  hidden: { clipPath: "inset(100% 0% 0% 0%)" },
  show: (i: number) => ({
    clipPath: "inset(0% 0% 0% 0%)",
    transition: { duration: 1.2, delay: 0.15 + i * 0.18, ease: entryEase },
  }),
}

// "!" and other symbols in Cinzel, letters in The Seasons
function SpecialCharFont({ text }: { text: string }) {
  return (
    <>
      {text.split(/([^\p{L}\s]+)/u).map((part, i) =>
        i % 2 === 1 ? (
          <span key={i} className={`${cinzel.className} relative -top-[0.06em] inline-block font-normal tracking-normal`}>
            {part}
          </span>
        ) : (
          part
        ),
      )}
    </>
  )
}

export function SeeYouThere() {
  const siteConfig = useSiteConfig()
  const content = siteConfig.seeYouThere
  const reduceMotion = useReducedMotion()
  const { groomNickname, brideNickname } = siteConfig.couple
  const couple = `${groomNickname} & ${brideNickname}`
  const fill = (text: string) => text.split("{couple}").join(couple)
  const alt = fill(content.photoAlt)
  const photos = content.photos.map((src) => encodeURI(src))
  const [active, setActive] = useState(0)

  // Mobile slideshow
  useEffect(() => {
    if (reduceMotion || photos.length < 2) return
    const timer = setInterval(() => setActive((i) => (i + 1) % photos.length), SLIDE_MS)
    return () => clearInterval(timer)
  }, [reduceMotion, photos.length])

  return (
    <section
      id="see-you-there"
      className={`${theSeasons.variable} ${aboveTheBeyond.variable} relative isolate z-10 w-full overflow-hidden`}
      style={{ background: `rgb(${DEEP})` }}
    >
      <motion.div
        className="relative min-h-[100svh] w-full"
        initial={reduceMotion ? false : "hidden"}
        whileInView="show"
        viewport={{ once: true, amount: 0.3 }}
      >
        {/* Mobile: one full-screen photo cross-fading through the set */}
        <div className="absolute inset-0 md:hidden" aria-hidden={photos.length > 1 ? true : undefined}>
          <CrossfadeImages
            images={photos}
            active={active}
            sizes="100vw"
            alt={alt}
            className="object-cover object-[center_30%]"
            reduceMotion={reduceMotion}
          />
        </div>

        {/* md+: portrait triptych */}
        <div className="absolute inset-0 hidden gap-[3px] md:flex">
          {photos.map((src, i) => (
            <motion.div key={`${src}-${i}`} className="relative h-full flex-1 overflow-hidden" variants={panelReveal} custom={i}>
              <Image
                src={src}
                alt={i === 0 ? alt : ""}
                fill
                sizes="34vw"
                className={`object-cover object-[center_30%] ${reduceMotion ? "" : "see-you-drift"}`}
                style={{ animationDelay: `${i * -2.5}s` }}
              />
            </motion.div>
          ))}
        </div>

        {/* Mobile wash: the type sits low, so the photo fades through a warm terracotta
            band into deep sage at the bottom */}
        <div
          className="pointer-events-none absolute inset-0 md:hidden"
          style={{
            background: `linear-gradient(180deg, rgb(${DEEP} / 42%) 0%, rgb(${DEEP} / 4%) 24%, rgb(${WARM} / 14%) 42%, rgb(${DEEP} / 62%) 60%, rgb(${DEEP} / 88%) 78%, rgb(${DEEP} / 96%) 100%)`,
          }}
          aria-hidden
        />
        {/* md+ wash: the type is centred, so darken a soft sage oval behind it */}
        <div
          className="pointer-events-none absolute inset-0 hidden md:block"
          style={{
            background: `radial-gradient(48% 42% at 50% 50%, rgb(${DEEP} / 70%) 0%, rgb(${DEEP} / 40%) 60%, transparent 100%), linear-gradient(180deg, rgb(${DEEP} / 45%) 0%, rgb(${WARM} / 10%) 35%, rgb(${WARM} / 10%) 65%, rgb(${DEEP} / 70%) 100%)`,
          }}
          aria-hidden
        />
        {/* Golden-hour glow rising from the bottom edge (yellow → orange) */}
        <div
          className="pointer-events-none absolute inset-0"
          style={{
            background: `radial-gradient(70% 38% at 50% 100%, color-mix(in srgb, ${ORANGE} 30%, transparent) 0%, color-mix(in srgb, ${YELLOW} 10%, transparent) 55%, transparent 100%)`,
            mixBlendMode: "soft-light",
          }}
          aria-hidden
        />

        <motion.div
          className="relative z-10 mx-auto flex min-h-[100svh] max-w-3xl flex-col items-center justify-end px-6 pb-[12svh] pt-24 text-center md:justify-center md:pb-24"
          variants={stagger}
        >
          {content.eyebrow ? (
            <motion.p
              variants={rise}
              className={`${cinzel.className} text-[0.75rem] font-semibold uppercase tracking-[0.3em] sm:text-[0.8125rem]`}
              style={{ color: IVORY, textShadow: softShadow }}
            >
              {content.eyebrow}
            </motion.p>
          ) : null}
          <motion.span
            variants={rise}
            className="mt-3 block h-[2px] w-12 rounded-full sm:w-16"
            style={{ background: SUN_GRADIENT, boxShadow: `0 1px 6px rgb(${DEEP} / 50%)` }}
            aria-hidden
          />

          <motion.h2 variants={rise} className="relative mt-3 sm:mt-4">
            <span className="sr-only">
              {content.titleLine1} {content.titleLine2}
            </span>
            <span
              aria-hidden
              className={`${theSeasons.className} block uppercase leading-[0.88] tracking-[0.06em] sm:tracking-[0.08em]`}
              style={{ fontSize: titleSize, color: IVORY, textShadow: photoTitleShadow }}
            >
              <SpecialCharFont text={content.titleLine1} />
              <br />
              <SpecialCharFont text={content.titleLine2} />
            </span>
          </motion.h2>

          {content.script ? (
            <motion.p
              variants={rise}
              className={`${aboveTheBeyond.className} mt-3 text-[1.5rem] leading-tight sm:mt-4 sm:text-[2rem] md:text-[2.35rem]`}
              style={{ color: BUTTER, textShadow: softShadow }}
            >
              {fill(content.script)}
            </motion.p>
          ) : null}

          {content.message ? (
            <motion.p
              variants={rise}
              className="font-goudy-italic mx-auto mt-4 max-w-md text-[0.9375rem] leading-relaxed sm:mt-5 sm:text-[1.0625rem]"
              style={{ color: "#FFFFFF", textShadow: softShadow, fontWeight: 600 }}
            >
              {fill(content.message)}
            </motion.p>
          ) : null}

          {/* Mobile slideshow position */}
          {photos.length > 1 && (
            <motion.div variants={rise} className="mt-7 flex items-center gap-1.5 md:hidden" aria-hidden>
              {photos.map((src, i) => (
                <span
                  key={`${src}-${i}`}
                  className="h-[3px] rounded-full transition-all duration-[1400ms] ease-in-out"
                  style={{
                    width: i === active ? "1.5rem" : "0.5rem",
                    background: i === active ? SUN_GRADIENT : "rgb(255 248 242 / 45%)",
                  }}
                />
              ))}
            </motion.div>
          )}
        </motion.div>
      </motion.div>
    </section>
  )
}