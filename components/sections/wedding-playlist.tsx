"use client"

import { useEffect, useRef, useState } from "react"
import { useSiteConfig } from "@/hooks/use-site-config"
import { useAudio } from "@/contexts/audio-context"
import { cinzel } from "@/lib/fonts"
import localFont from "next/font/local"
import Image from "next/image"
import { Music2, Disc3 } from "lucide-react"
import { motion, useReducedMotion, type Variants } from "motion/react"
import { TintedDeco } from "@/components/tinted-deco"
import { DecoCorners } from "@/components/deco-corners"
import { IvoryBackdrop, ivorySectionStyle } from "@/components/ivory-backdrop"

interface SpotifyPlaybackUpdate {
  playingURI: string
  isPaused: boolean
  isBuffering: boolean
  duration: number
  position: number
}

interface SpotifyEmbedController {
  addListener: (
    event: "playback_update" | "playback_started" | "ready",
    callback: (event: { data: SpotifyPlaybackUpdate }) => void
  ) => void
  removeListener: (
    event: "playback_update" | "playback_started" | "ready",
    callback: (event: { data: SpotifyPlaybackUpdate }) => void
  ) => void
  destroy: () => void
}

interface SpotifyIframeApi {
  createController: (
    element: HTMLElement,
    options: { uri: string; width?: string; height?: string },
    callback: (controller: SpotifyEmbedController) => void
  ) => void
}

declare global {
  interface Window {
    onSpotifyIframeApiReady?: (IFrameAPI: SpotifyIframeApi) => void
  }
}

let cachedSpotifyIframeApi: SpotifyIframeApi | null = null
const spotifyApiReadyQueue: Array<(api: SpotifyIframeApi) => void> = []

function getSpotifyUri(spotifyUrl: string): string {
  const match = spotifyUrl.match(
    /open\.spotify\.com\/(playlist|album|track|episode)\/([^/?]+)/
  )
  if (!match) return spotifyUrl
  return `spotify:${match[1]}:${match[2]}`
}

function loadSpotifyIframeApi(onReady: (api: SpotifyIframeApi) => void) {
  if (cachedSpotifyIframeApi) {
    onReady(cachedSpotifyIframeApi)
    return
  }

  spotifyApiReadyQueue.push(onReady)

  if (spotifyApiReadyQueue.length > 1) return

  const previousReady = window.onSpotifyIframeApiReady
  window.onSpotifyIframeApiReady = (IFrameAPI) => {
    cachedSpotifyIframeApi = IFrameAPI
    previousReady?.(IFrameAPI)
    spotifyApiReadyQueue.splice(0).forEach((callback) => callback(IFrameAPI))
  }

  const existingScript = document.querySelector(
    'script[src="https://open.spotify.com/embed/iframe-api/v1"]'
  )
  if (!existingScript) {
    const script = document.createElement("script")
    script.src = "https://open.spotify.com/embed/iframe-api/v1"
    script.async = true
    document.body.appendChild(script)
  }
}


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

// Palette lives in globals.css → motif / welcome tokens.
// White card, navy headings, body-blue text; dusty-blue buttons (no yellow for text).
const TEAL = "var(--color-welcome-navy)"
const BUTTON =
  "linear-gradient(180deg, #2C2C2E 0%, #111111 55%, #000000 100%)"
const BUTTON_SHADOW =
  "0 0 0 3px color-mix(in srgb, var(--color-motif-medium) 22%, transparent), 0 12px 24px -12px color-mix(in srgb, var(--color-welcome-navy) 55%, transparent)"
const IVORY = "#FFF8F2"
const NAVY = TEAL
const BODY = "var(--color-welcome-text)"
const ACCENT = "var(--color-welcome-heading)"
const HAIRLINE = "color-mix(in srgb, var(--color-motif-medium) 60%, transparent)"

// Text sitting directly on the circle pattern: navy (or dusty blue) with a soft white edge
const textGlow = "0 1px 0 rgb(255 255 255 / 90%), 0 0 12px rgb(255 255 255 / 75%)"
const onBg = {
  color: "var(--color-welcome-navy)",
  textShadow: textGlow,
} as const
const onBgBlue = { color: "var(--color-welcome-heading)", textShadow: textGlow } as const

const cardStyle = {
  background:
    "radial-gradient(90% 35% at 50% 0%, rgb(255 255 255 / 95%) 0%, transparent 70%), linear-gradient(180deg, #FFFFFF 0%, color-mix(in srgb, var(--color-motif-medium) 10%, white) 100%)",
  border: `1px solid ${HAIRLINE}`,
  boxShadow:
    "0 0 0 6px rgb(255 255 255 / 40%), 0 28px 60px -32px color-mix(in srgb, var(--color-welcome-navy) 55%, transparent)",
} as const

const ct = {
  body: "text-sm sm:text-[0.95rem] md:text-base",
  bodyLg: "text-sm sm:text-base md:text-lg",
  btn: "text-[0.65rem] sm:text-[0.7rem] md:text-xs",
} as const

const ease = [0.22, 1, 0.36, 1] as const

const revealVariants: Variants = {
  hidden: { opacity: 0, y: 24 },
  show: { opacity: 1, y: 0, transition: { duration: 0.8, ease } },
}

function DecoImg({ src, className }: { src: string; className: string }) {
  if (!src) return null
  return <TintedDeco src={src} className={className} />
}

// Dusty-blue hairlines either side of a slate-blue diamond
function DiamondDivider() {
  return (
    <div className="flex items-center justify-center gap-2" aria-hidden>
      <span className="h-px w-10 sm:w-16" style={{ background: "linear-gradient(to right, transparent, var(--color-motif-yellow))" }} />
      <span className="h-1.5 w-1.5 rotate-45" style={{ background: "var(--color-motif-accent)" }} />
      <span className="h-px w-10 sm:w-16" style={{ background: "linear-gradient(to left, transparent, var(--color-motif-yellow))" }} />
    </div>
  )
}

// The Seasons has no clean glyphs for symbols / digits — render only those
// characters (e.g. "&", "'", "-", numbers) in Cinzel, keep letters in The Seasons.
function SpecialCharFont({ text }: { text: string }) {
  return (
    <>
      {text.split(/([^\p{L}\s]+)/u).map((part, i) =>
        i % 2 === 1 ? (
          <span key={i} className={`${cinzel.className} tracking-normal`}>
            {part}
          </span>
        ) : (
          part
        ),
      )}
    </>
  )
}

function PlaylistTitle({ title, script }: { title: string; script: string }) {
  return (
    <h2
      className="relative mx-auto w-full max-w-full text-center"
      style={
        {
          "--title-size": "clamp(1.6rem, 8.5vw, 4.2rem)",
          "--script-size": "clamp(1rem, 4.2vw, 2.25rem)",
        } as React.CSSProperties
      }
    >
      <span
        className={`${theSeasons.className} block uppercase leading-[0.85] tracking-[0.06em] min-[400px]:tracking-[0.1em] sm:tracking-[0.14em] md:tracking-[0.16em]`}
        style={{ fontSize: "var(--title-size)", ...onBg }}
      >
        <SpecialCharFont text={title} />
      </span>
      {script ? (
        <>
          <span
            aria-hidden
            className={`${aboveTheBeyond.className} mx-auto mt-2 block w-fit max-w-full px-1 leading-[0.9] sm:mt-3`}
            style={{ fontSize: "var(--script-size)", ...onBgBlue }}
          >
            {script}
          </span>
          <span className="sr-only">{script}</span>
        </>
      ) : null}
    </h2>
  )
}

// Realistic CD half out of its album sleeve. The disc turns slowly and slides further out /
// spins faster while the Spotify player is playing. The glare stays put while the disc turns.
function CdAlbum({ cover, label, kicker, playing, still }: { cover: string; label: string; kicker: string; playing: boolean; still: boolean }) {
  const spin = still ? "" : playing ? "animate-[spin_2.6s_linear_infinite]" : "animate-[spin_9s_linear_infinite]"
  return (
    // Box = sleeve + the part of the disc that slides out, so the disc never covers the text beside it
    <div className="cd-album relative shrink-0" aria-hidden>
      <style>{`.cd-album{height:6rem;width:9rem}@media(min-width:640px){.cd-album{height:10rem;width:15rem}}`}</style>
      {/* Disc — sits behind the sleeve */}
      <motion.div
        className="absolute left-0 top-[4%] h-[92%] aspect-square"
        initial={false}
        animate={{ x: playing ? "62%" : "48%" }}
        transition={{ duration: still ? 0 : 0.9, ease }}
      >
        <div
          className="relative h-full w-full rounded-full"
          style={{ boxShadow: "0 10px 22px -8px rgb(31 38 24 / 55%), 0 0 0 1px rgb(0 0 0 / 35%), inset 0 0 0 2px rgb(255 255 255 / 10%)" }}
        >
          {/* Spinning part: rainbow foil, grooves and the printed label */}
          <div
            className={`absolute inset-0 rounded-full ${spin}`}
            style={{
              background: [
                "repeating-radial-gradient(circle at 50% 50%, rgb(255 255 255 / 0%) 0 1.5px, rgb(255 255 255 / 6%) 1.5px 2.5px)",
                "conic-gradient(from 0deg, #23252B, #3A4152, #5A4A63, #2E4740, #5C5238, #34445A, #4B3B55, #2C3E3A, #514630, #23252B)",
              ].join(", "),
            }}
          >
            <div className="absolute inset-[29%] overflow-hidden rounded-full" style={{ boxShadow: "0 0 0 1.5px rgb(255 255 255 / 35%)" }}>
              {cover ? (
                <Image src={encodeURI(cover)} alt="" fill sizes="80px" className="object-cover" />
              ) : (
                <div className="h-full w-full" style={{ background: "var(--color-motif-silver)" }} />
              )}
            </div>
          </div>
          {/* Fixed glare across the foil */}
          <div
            className="pointer-events-none absolute inset-0 rounded-full"
            style={{
              background:
                "conic-gradient(from 20deg, transparent 0deg, rgb(255 255 255 / 30%) 25deg, transparent 60deg, transparent 180deg, rgb(255 255 255 / 22%) 205deg, transparent 240deg)",
              mixBlendMode: "screen",
            }}
          />
          {/* Clear plastic hub + centre hole */}
          <div
            className="absolute inset-[40%] rounded-full"
            style={{ background: "rgb(20 22 26 / 55%)", boxShadow: "inset 0 0 0 1px rgb(255 255 255 / 25%), 0 0 0 1px rgb(0 0 0 / 30%)" }}
          />
          <div
            className="absolute inset-[46.5%] rounded-full"
            style={{ background: "#FFFFFF", boxShadow: "inset 0 1px 2px rgb(0 0 0 / 35%)" }}
          />
        </div>
      </motion.div>

      {/* Album sleeve */}
      <div
        className="absolute left-0 top-0 z-10 h-full aspect-square overflow-hidden rounded-[6px]"
        style={{ boxShadow: "0 14px 28px -12px rgb(31 38 24 / 55%), 0 0 0 1px rgb(255 255 255 / 70%)" }}
      >
        {cover ? (
          <Image src={encodeURI(cover)} alt="" fill sizes="(max-width: 640px) 96px, 160px" className="object-cover" />
        ) : (
          <div className="h-full w-full" style={{ background: "linear-gradient(160deg, color-mix(in srgb, var(--color-motif-silver) 80%, white), var(--color-motif-silver))" }} />
        )}
        {/* Printed title strip */}
        <div
          className="absolute inset-x-0 bottom-0 flex flex-col items-center px-1.5 pb-1.5 pt-6 text-center sm:px-2.5 sm:pb-2.5 sm:pt-9"
          style={{ background: "linear-gradient(to top, rgb(20 22 18 / 88%) 0%, rgb(20 22 18 / 60%) 50%, transparent 100%)" }}
        >
          {kicker ? (
            <span
              className={`${cinzel.className} block max-w-full truncate text-[0.4rem] font-semibold uppercase leading-none tracking-[0.22em] text-white/85 sm:text-[0.55rem]`}
            >
              {kicker}
            </span>
          ) : null}
          <span className="my-[3px] block h-px w-6 bg-white/60 sm:my-1 sm:w-9" aria-hidden />
          <p
            className={`${aboveTheBeyond.className} max-w-full whitespace-nowrap text-[0.95rem] leading-[1.05] text-white sm:text-[1.45rem]`}
            style={{ textShadow: "0 1px 3px rgb(0 0 0 / 60%)" }}
          >
            {label}
          </p>
        </div>
        {/* Thin inset frame, like a printed album cover */}
        <span className="pointer-events-none absolute inset-[5px] rounded-[3px] border border-white/35 sm:inset-2" aria-hidden />
        {/* Spine highlight + glossy sheen */}
        <span className="pointer-events-none absolute inset-y-0 left-0 w-2" style={{ background: "linear-gradient(to right, rgb(255 255 255 / 35%), transparent)" }} />
        <span className="pointer-events-none absolute inset-0" style={{ background: "linear-gradient(125deg, rgb(255 255 255 / 28%) 0%, transparent 38%)" }} />
      </div>
    </div>
  )
}

export function WeddingPlaylist() {
  const siteConfig = useSiteConfig()
  const content = siteConfig.playlist
  const { title, subtitle, spotifyUrl, decos } = content
  const { groomNickname, brideNickname } = siteConfig.couple
  const fillCouple = (text: string) => text.split("{couple}").join(`${groomNickname} & ${brideNickname}`)
  const playlistName = fillCouple(content.playlistName)
  const reduceMotion = useReducedMotion()
  const initial = reduceMotion ? false : "hidden"
  const spotifyUri = getSpotifyUri(spotifyUrl)
  const embedContainerRef = useRef<HTMLDivElement>(null)
  const controllerRef = useRef<SpotifyEmbedController | null>(null)
  const playbackStateRef = useRef<"playing" | "paused">("paused")
  const [playerReady, setPlayerReady] = useState(false)
  const [isPlaying, setIsPlaying] = useState(false)
  const { pauseMusic, resumeMusic } = useAudio()

  useEffect(() => {
    const container = embedContainerRef.current
    if (!container) return

    let mounted = true

    const handlePlaybackStateChange = (isPlaying: boolean) => {
      setIsPlaying(isPlaying)
      if (isPlaying && playbackStateRef.current !== "playing") {
        playbackStateRef.current = "playing"
        pauseMusic()
      } else if (!isPlaying && playbackStateRef.current === "playing") {
        playbackStateRef.current = "paused"
        resumeMusic()
      }
    }

    const initController = (IFrameAPI: SpotifyIframeApi) => {
      if (!mounted || !embedContainerRef.current) return

      IFrameAPI.createController(
        embedContainerRef.current,
        {
          uri: spotifyUri,
          width: "100%",
          // 352 is Spotify's full layout (artwork + track list); in-between heights render cropped
          height: "352",
        },
        (EmbedController) => {
          if (!mounted) return

          controllerRef.current = EmbedController

          const handleReady = () => {
            if (mounted) setPlayerReady(true)
          }

          const handlePlaybackUpdate = (event: { data: SpotifyPlaybackUpdate }) => {
            handlePlaybackStateChange(!event.data.isPaused)
          }

          const handlePlaybackStarted = () => {
            handlePlaybackStateChange(true)
          }

          EmbedController.addListener("ready", handleReady)
          EmbedController.addListener("playback_update", handlePlaybackUpdate)
          EmbedController.addListener("playback_started", handlePlaybackStarted)
        }
      )
    }

    loadSpotifyIframeApi(initController)

    return () => {
      mounted = false
      if (playbackStateRef.current === "playing") {
        resumeMusic()
      }
      playbackStateRef.current = "paused"
      setIsPlaying(false)
      controllerRef.current?.destroy()
      controllerRef.current = null
      setPlayerReady(false)
    }
  }, [pauseMusic, resumeMusic, spotifyUri])

  return (
    <div
      className={`${theSeasons.variable} ${aboveTheBeyond.variable} relative w-full overflow-hidden`}
      style={ivorySectionStyle}
    >
      {/* Cream lace ground with lace edging, same as the welcome card / love story */}
      <IvoryBackdrop />
      <section
        id="playlist"
        className="relative z-10 overflow-hidden pt-10 pb-9 sm:pt-16 sm:pb-14 md:pt-20 md:pb-16 lg:pt-24 lg:pb-20"
      >
        {/* Corner florals + double border (content/site.ts → playlist.decos / showFrame) */}
        {content.showFrame && <div className="deco-frame" aria-hidden="true" />}
        <DecoCorners decos={decos} />

        <div className="relative z-20 mx-auto max-w-5xl px-4 sm:px-6 md:px-8">
          {/* Header */}
          <motion.div
            className="relative px-4 text-center sm:px-10"
            variants={revealVariants}
            initial={initial}
            whileInView="show"
            viewport={{ once: true, amount: 0.3 }}
          >
            {/* Soft white glow so the heading reads cleanly over the circles */}
            <span
              aria-hidden
              className="pointer-events-none absolute left-1/2 top-1/2 -z-10 h-[120%] w-[min(40rem,110%)] -translate-x-1/2 -translate-y-1/2 rounded-full blur-2xl"
              style={{ background: "radial-gradient(ellipse at center, rgb(255 255 255 / 70%) 0%, rgb(255 255 255 / 30%) 50%, transparent 72%)" }}
            />
            <DecoImg
              src={decos.headerOrnament}
              className="mx-auto mb-2 block h-auto w-20 select-none sm:mb-4 sm:w-36 md:w-44"
            />
            <DiamondDivider />
            {content.eyebrow ? (
              <p
                className={`${cinzel.className} mt-3 text-[0.625rem] font-semibold uppercase tracking-[0.2em] sm:mt-5 sm:text-[0.8rem] sm:tracking-[0.24em]`}
                style={onBgBlue}
              >
                {content.eyebrow}
              </p>
            ) : null}
            <div className="mx-auto mt-2 sm:mt-4">
              <PlaylistTitle title={title} script={content.script} />
            </div>
            <p
              className={`font-goudy-italic ${ct.bodyLg} mx-auto mt-3 max-w-lg px-2 leading-relaxed sm:mt-5`}
              style={{ ...onBg, fontWeight: 600 }}
            >
              {subtitle}
            </p>
          </motion.div>

          {/* Playlist card — phones: CD + title side by side above the player; desktop: two columns */}
          <motion.div
            className="relative mt-6 overflow-hidden rounded-[1.5rem] sm:mt-10 sm:rounded-[2.25rem] md:mt-12"
            style={cardStyle}
            variants={revealVariants}
            initial={initial}
            whileInView="show"
            viewport={{ once: true, amount: 0.1 }}
          >
            <div className="relative z-20 grid grid-cols-1 items-center gap-4 px-3.5 py-4 sm:gap-6 sm:px-7 sm:py-9 md:grid-cols-[minmax(0,0.85fr)_minmax(0,1.15fr)] md:gap-10 md:px-10 md:py-10">
              {/* Info */}
              <div className="grid grid-cols-[auto_minmax(0,1fr)] items-center gap-x-2 gap-y-3 px-0.5 text-left sm:flex sm:flex-col sm:items-center sm:px-0 sm:text-center md:items-start md:text-left">
                <CdAlbum cover={content.coverImage} label={`${groomNickname} & ${brideNickname}`} kicker={content.eyebrow} playing={isPlaying} still={Boolean(reduceMotion)} />
                <div className="relative z-20 min-w-0 max-w-full sm:mt-5">
                  <p
                    className={`${cinzel.className} text-[0.55rem] font-semibold uppercase tracking-[0.22em] sm:text-[0.65rem]`}
                    style={{ color: ACCENT }}
                  >
                    {content.cardEyebrow}
                  </p>
                  <h3
                    className={`${theSeasons.className} mt-1 text-base uppercase leading-[1.15] tracking-[0.05em] min-[400px]:text-lg sm:mt-1.5 sm:text-2xl sm:tracking-[0.08em]`}
                    style={{ color: NAVY }}
                    title={playlistName}
                  >
                    <SpecialCharFont text={playlistName} />
                  </h3>
                </div>
                {content.cardNote ? (
                  <p
                    className={`font-goudy-italic col-span-2 max-w-sm border-t pt-3 text-[0.82rem] leading-snug sm:mt-3 sm:border-t-0 sm:pt-0 sm:text-[0.95rem] sm:leading-relaxed md:text-base`}
                    style={{ color: BODY, borderColor: HAIRLINE }}
                  >
                    {content.cardNote}
                  </p>
                ) : null}
                <span
                  aria-hidden
                  className="my-5 hidden h-px w-24 md:block"
                  style={{ background: "linear-gradient(to right, var(--color-motif-yellow), transparent)" }}
                />
                <a
                  href={spotifyUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={`${cinzel.className} mt-5 hidden items-center sm:inline-flex justify-center gap-2 rounded-full border px-7 py-2.5 font-semibold uppercase tracking-[0.2em] transition-all duration-300 hover:-translate-y-0.5 hover:brightness-110 active:translate-y-0 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-motif-accent)] sm:py-3 md:mt-0 ${ct.btn}`}
                  style={{
                    background: BUTTON,
                    borderColor: "rgb(255 255 255 / 70%)",
                    color: IVORY,
                    boxShadow: BUTTON_SHADOW,
                  }}
                >
                  <Music2 className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
                  {content.buttonText}
                </a>
              </div>

              {/* Spotify player */}
              <div
                className="relative w-full overflow-hidden rounded-[14px] p-1 sm:rounded-2xl sm:p-2"
                style={{ background: IVORY, boxShadow: `0 0 0 1px ${HAIRLINE}, 0 18px 36px -24px color-mix(in srgb, var(--color-welcome-navy) 55%, transparent)` }}
              >
                <div
                  ref={embedContainerRef}
                  title={`${playlistName} — Spotify playlist`}
                  aria-label={`${playlistName} — Spotify playlist`}
                  className="h-[352px] w-full overflow-hidden rounded-[12px] [&_iframe]:block [&_iframe]:border-0"
                  style={{ background: "color-mix(in srgb, var(--color-motif-medium) 14%, white)" }}
                />
                {/* Placeholder while the Spotify embed loads */}
                {!playerReady && (
                  <div
                    aria-hidden
                    className="pointer-events-none absolute inset-1 flex flex-col items-center justify-center gap-3 rounded-[12px] sm:inset-2"
                    style={{ background: "color-mix(in srgb, var(--color-motif-medium) 14%, white)" }}
                  >
                    <Disc3
                      className={`h-9 w-9 opacity-60 ${reduceMotion ? "" : "animate-[spin_3s_linear_infinite]"}`}
                      style={{ color: ACCENT }}
                    />
                    <span
                      className={`${cinzel.className} text-[0.6rem] font-semibold uppercase tracking-[0.22em] opacity-70`}
                      style={{ color: TEAL }}
                    >
                      Loading playlist
                    </span>
                  </div>
                )}
              </div>

              {/* Phone: compact full-width button under the player */}
              <a
                href={spotifyUrl}
                target="_blank"
                rel="noopener noreferrer"
                className={`${cinzel.className} inline-flex min-h-11 w-full items-center justify-center gap-2 rounded-full py-3 font-semibold uppercase tracking-[0.18em] transition-all active:scale-[0.98] sm:hidden ${ct.btn}`}
                style={{
                  background: BUTTON,
                  color: IVORY,
                  boxShadow: BUTTON_SHADOW,
                }}
              >
                <Music2 className="h-3.5 w-3.5" />
                {content.buttonText}
              </a>
            </div>
          </motion.div>
        </div>
      </section>
    </div>
  )
}
