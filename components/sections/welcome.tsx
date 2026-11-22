"use client"

import localFont from "next/font/local"
import { motion } from "motion/react"
import { useSiteConfig } from "@/hooks/use-site-config"
import { sectionType, welcomeTitleSize } from "@/lib/section-typography"
import { cinzel } from "@/lib/fonts"
import { IVORY_LACE_EDGE as WELCOME_LACE_EDGE } from "@/lib/ivory-lace"
import { SilkScreen } from "@/components/silk-screen"
import { CountUp } from "@/components/count-up"


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

// Luxury dark card: black panel with a gold diamond lattice pattern, gold lace edging down both
// sides, gold hairline frames and a soft gold glow from the top — matches the home hero

const GOLD = "#E2B75A" // lettering
const GOLD_LINE = "#C9A24A" // rules, frames, ornaments
const WHITE = "#F5F5F5"
const IVORY = "#EDE6D6"
const MUTED = "#B9B9BD"
const PATTERN = "/patterns/hex-gold.svg"

// Three quick facts under the letter
const HIGHLIGHTS = [
  { value: "2022", label: "Founded in Molino, Bacoor" },
  { value: "33+", label: "Branches nationwide" },
  { value: "1", label: "Zanicare family" },
]

function OrnamentalDivider({ compact = false }: { compact?: boolean }) {
  return (
    <div className={`flex items-center justify-center ${compact ? "gap-1.5" : "gap-2"}`}>
      <span
        className={`h-px ${compact ? "w-6 sm:w-10" : "w-8 sm:w-12"}`}
        style={{ background: `linear-gradient(to right, transparent, ${GOLD_LINE})` }}
      />
      <span
        className="h-1 w-1 rotate-45 sm:h-1.5 sm:w-1.5"
        style={{ background: GOLD, boxShadow: "0 0 8px rgb(226 183 90 / 45%)" }}
        aria-hidden
      />
      <span
        className={`h-px ${compact ? "w-6 sm:w-10" : "w-8 sm:w-12"}`}
        style={{ background: `linear-gradient(to left, transparent, ${GOLD_LINE})` }}
      />
    </div>
  )
}

function LayeredWelcomeTitle() {
  return (
    <h2
      className="welcome-title-lockup relative mx-auto w-full max-w-full text-center"
      style={
        {
          "--welcome-size": welcomeTitleSize.main,
          "--script-size": welcomeTitleSize.script,
          "--script-overlap": welcomeTitleSize.overlap,
        } as React.CSSProperties
      }
    >
      <span
        className={`${cinzel.className} mb-3 block text-[clamp(0.6rem,2.4vw,0.76rem)] font-semibold uppercase tracking-[0.34em] sm:mb-4`}
        style={{ color: GOLD }}
      >
        A Message of Thanks
      </span>
      <span
        className={`${theSeasons.className} block uppercase leading-[0.78] tracking-[0.08em] min-[400px]:tracking-[0.11em] sm:tracking-[0.13em] md:tracking-[0.14em]`}
        style={{
          fontSize: "var(--welcome-size)",
          color: WHITE,
          textShadow: "0 2px 6px rgb(0 0 0 / 70%)",
        }}
      >
        Welcome
      </span>

      <span
        aria-hidden
        className={`${aboveTheBeyond.className} relative z-10 mx-auto block w-fit max-w-full px-1 leading-[0.88] sm:leading-[0.9]`}
        style={{
          fontSize: "var(--script-size)",
          color: GOLD,
          textShadow: "0 2px 4px rgb(0 0 0 / 80%), 0 0 20px rgb(226 183 90 / 25%)",
        }}
      >
        to a night of gratitude
      </span>

      <span className="sr-only"> to a night of gratitude</span>
    </h2>
  )
}

export function Welcome() {
  const siteConfig = useSiteConfig()
  const companyName = siteConfig.couple.groom

  return (
    <section
      id="welcome"
      className={`${theSeasons.variable} ${aboveTheBeyond.variable} relative px-4 py-10 sm:px-6 sm:py-14 md:px-8 md:py-16`}
    >
      {/* Soft screen over the silk around the card */}
      <SilkScreen />
      <div className="relative mx-auto w-full max-w-3xl">
        <motion.article
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-40px" }}
          transition={{ duration: 0.65, ease: [0.22, 0.61, 0.36, 1] }}
          className="relative @container/welcome overflow-hidden rounded-xl border px-10 py-8 sm:rounded-2xl sm:px-12 sm:py-10 md:px-14 md:py-12"
          style={{
            borderColor: "rgb(201 162 74 / 55%)",
            background: [
              // soft gold light falling from the top, deeper black toward the foot
              "radial-gradient(110% 60% at 50% 0%, rgb(226 183 90 / 12%) 0%, transparent 60%)",
              "radial-gradient(90% 50% at 50% 100%, rgb(0 0 0 / 55%) 0%, transparent 70%)",
              "linear-gradient(180deg, #161618 0%, #0f0f10 55%, #0a0a0b 100%)",
            ].join(", "),
            boxShadow: [
              "inset 0 1px 0 rgb(243 210 122 / 18%)",
              "inset 0 0 50px rgb(0 0 0 / 55%)",
              "0 24px 50px -20px rgb(0 0 0 / 75%)",
              "0 0 0 1px rgb(0 0 0 / 60%)",
            ].join(", "),
          }}
        >
          {/* Gold diamond lattice pattern, fully visible */}
          <div
            aria-hidden
            className="pointer-events-none absolute inset-0"
            style={{
              backgroundImage: `url("${PATTERN}")`,
              backgroundSize: "180px auto",
              backgroundPosition: "center",
              opacity: 0.85,
            }}
          />

          {/* Gold lace edging down both sides (mirrored on the right) */}
          <div
            aria-hidden
            className="pointer-events-none absolute inset-y-3 left-1.5 w-[26px] sm:left-2.5"
            style={{ background: `${WELCOME_LACE_EDGE} 0 0 / 26px 24px repeat-y`, opacity: 0.9 }}
          />
          <div
            aria-hidden
            className="pointer-events-none absolute inset-y-3 right-1.5 w-[26px] -scale-x-100 sm:right-2.5"
            style={{ background: `${WELCOME_LACE_EDGE} 0 0 / 26px 24px repeat-y`, opacity: 0.9 }}
          />

          {/* Inner hairline frame in gold */}
          <div
            className="wedding-frame-inner hidden min-[400px]:block"
            style={{ borderColor: "rgb(201 162 74 / 38%)" }}
            aria-hidden
          />

          {/* Gilded rule along the top edge */}
          <div
            aria-hidden
            className="pointer-events-none absolute inset-x-8 top-0 h-px sm:inset-x-10 md:inset-x-12"
            style={{
              background: `linear-gradient(to right, transparent, ${GOLD_LINE}, #F3D27A, ${GOLD_LINE}, transparent)`,
            }}
          />

          <div className="relative flex flex-col gap-8 sm:gap-9 md:gap-10">
            <header className="space-y-4 pt-2 text-center sm:space-y-5 sm:pt-3 md:pt-4">
              <LayeredWelcomeTitle />
              <OrnamentalDivider compact />
            </header>

            <figure className="mx-auto max-w-[36rem] text-center">
              <blockquote>
                <p className={`font-goudy-italic ${sectionType.textSnug}`} style={{ color: IVORY }}>
                  &ldquo;Give thanks to the Lord, for He is good; His love endures forever.&rdquo;
                </p>
                <figcaption className="mt-2 sm:mt-2.5">
                  <cite
                    className={`${cinzel.className} ${sectionType.label} not-italic uppercase tracking-[0.2em] sm:tracking-[0.24em]`}
                    style={{ color: GOLD }}
                  >
                    Psalm 107:1
                  </cite>
                </figcaption>
              </blockquote>
            </figure>

            {/* Body: Crimson Text (upright book serif) in soft white */}
            <div
              className="mx-auto max-w-[36rem] space-y-3 text-center text-[clamp(0.9rem,1vw+0.62rem,1rem)] leading-[1.75] sm:space-y-3.5 md:space-y-4"
              style={{
                color: "#DCDCDE",
                fontFamily: '"Crimson Text", "Cormorant Garamond", Georgia, serif',
              }}
            >
              <p>
                To our <span style={{ color: GOLD }}>Zanicare family</span>, partners and friends —
              </p>
              <p>
                What began in 2022 with a single clinic in Molino, Bacoor has grown into a network of
                more than thirty animal bite clinics, caring for patients in communities across Metro
                Manila, Cavite, Rizal, Nueva Ecija, Isabela and Cebu. Every one of those patients was met by someone in this room.
              </p>
              <p>
                This year-end, we set aside one evening to say thank you: for the early shifts and
                late nights, for the calm you bring to worried patients, and for the trust our
                partners place in us. Tonight we celebrate the year we built together — and the
                people who made it possible.
              </p>
              <p>
                Inside you will find the program, the venue and a few gentle reminders. Come
                dressed to shine, and stay for the awards, the raffle and the music.
              </p>
            </div>

            {/* Three quick facts */}
            <dl className="mx-auto grid w-full max-w-[30rem] grid-cols-3 gap-2 sm:gap-4">
              {HIGHLIGHTS.map((item) => (
                <div
                  key={item.label}
                  className="flex flex-col items-center rounded-lg border px-1.5 py-3 text-center sm:px-3 sm:py-4"
                  style={{ borderColor: "rgb(201 162 74 / 30%)", background: "rgb(0 0 0 / 35%)" }}
                >
                  <dt className="sr-only">{item.label}</dt>
                  <dd
                    className={`${theSeasons.className} text-[clamp(1.5rem,6vw,2.1rem)] leading-none`}
                    style={{ color: GOLD }}
                  >
                    <CountUp value={item.value} />
                  </dd>
                  <dd
                    aria-hidden
                    className={`${cinzel.className} mt-2 text-[0.5rem] font-semibold uppercase leading-snug tracking-[0.14em] sm:text-[0.58rem]`}
                    style={{ color: MUTED }}
                  >
                    {item.label}
                  </dd>
                </div>
              ))}
            </dl>

            <footer
              className="space-y-2 border-t pt-8 text-center sm:space-y-2.5 sm:pt-9 md:pt-10"
              style={{ borderColor: "rgb(201 162 74 / 35%)" }}
            >
              <p className={`${aboveTheBeyond.className} ${sectionType.script}`} style={{ color: GOLD }}>
                With heartfelt gratitude,
              </p>
              <p
                className={`${cinzel.className} ${sectionType.subheader} font-semibold tracking-[0.12em] sm:tracking-[0.16em] md:tracking-[0.18em]`}
                style={{ color: WHITE }}
              >
                The Management
              </p>
              <p
                className={`${cinzel.className} text-[0.62rem] font-semibold uppercase tracking-[0.24em] sm:text-[0.7rem]`}
                style={{ color: MUTED }}
              >
                {companyName}
              </p>
            </footer>
          </div>
        </motion.article>
      </div>
    </section>
  )
}
