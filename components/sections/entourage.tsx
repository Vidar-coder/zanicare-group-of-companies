"use client"

import React, { useEffect, useMemo, useState, type CSSProperties } from "react"
import { MotionConfig, motion, type Variants } from "motion/react"
import localFont from "next/font/local"
import { Section } from "@/components/section"
import { cinzel } from "@/lib/fonts"
import { useSiteConfig } from "@/hooks/use-site-config"
import { fetchUntilReady, isAbortError } from "@/lib/fetch-until-ready"
import { fetchInvitationList, readCachedInvitationList } from "@/lib/invitation-data"
import { TintedDeco } from "@/components/tinted-deco"
import { DecoCorners } from "@/components/deco-corners"
import { IvoryBackdrop, ivorySectionStyle } from "@/components/ivory-backdrop"
import { LUX, LUX_TEXT_SHADOW } from "@/lib/lux-dark"

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

// Our people — the classic entourage arch: one ivory card, a heading per rank tier, compact name lists.
// People come from the Google Sheet "Entourage" tab: RoleCategory = role / branch, RoleTitle = position.
// Order follows content/site.ts → entourage.hierarchy (highest rank first), then branches, then the rest.

// Kept for the invitation page / dashboard, which still pass a sponsors list
export type SponsorsList = "one" | "two"

// ── Palette: ivory arch with gold accents on the dark section ──────────────
const INK = "#1C1C1E" // names, headings
const GOLD_INK = "#8A6A22" // positions, labels (antique gold, readable on ivory)
const GOLD = "#C9A24A"
const HAIRLINE = "rgb(201 162 74 / 45%)"
const PAPER =
  "radial-gradient(70% 28% at 50% 0%, color-mix(in srgb, #E2B75A 14%, white) 0%, transparent 100%), linear-gradient(180deg, #FFFFFF 0%, #FBF7EE 55%, color-mix(in srgb, #C9A24A 10%, white) 100%)"

const cardStyle: CSSProperties = {
  background: PAPER,
  boxShadow:
    "0 0 0 1px rgb(201 162 74 / 55%), 0 0 0 6px rgb(0 0 0 / 30%), 0 0 0 7px rgb(201 162 74 / 30%), 0 30px 60px -30px rgb(0 0 0 / 80%), inset 0 1px 0 rgb(255 255 255 / 90%)",
}

const onBg = { color: LUX.white, textShadow: LUX_TEXT_SHADOW } as const
const onBgGold = { color: LUX.gold, textShadow: LUX_TEXT_SHADOW } as const

const nameStyle: CSSProperties = {
  fontSize: "clamp(0.64rem, min(2.1vw, 4.9cqi), 1rem)",
  lineHeight: 1.25,
  letterSpacing: "0.02em",
}

const positionStyle: CSSProperties = {
  fontSize: "clamp(0.5rem, min(1.6vw, 3.6cqi), 0.68rem)",
  lineHeight: 1.15,
}

// ── Data ────────────────────────────────────────────────────────────────────

interface Representative {
  name: string
  category: string
  title: string
}

function representativeFromApi(row: Record<string, unknown>): Representative {
  const r = row as Record<string, string | undefined>
  return {
    name: (r.name ?? r.Name ?? "").trim(),
    category: (r.roleCategory ?? r.RoleCategory ?? "").trim(),
    title: (r.roleTitle ?? r.RoleTitle ?? "").trim(),
  }
}

function toRepresentatives(data: Record<string, unknown>[]): Representative[] {
  return data.map(representativeFromApi).filter((r) => r.name && r.category)
}

async function loadRepresentatives(signal?: AbortSignal, reload = false) {
  const data = await fetchInvitationList<Record<string, unknown>>("/api/entourage", { signal, reload })
  return toRepresentatives(data)
}

// "Zanicare – Molino Branch" → "molino"
function groupKey(value: string) {
  return value
    .toLowerCase()
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/\bzanicare\b|\bbranch(es)?\b|\bclinic\b/g, "")
    .replace(/[^a-z0-9]+/g, " ")
    .trim()
}

// "JUAN DELA CRUZ" / "juan dela cruz" → "Juan Dela Cruz" (mixed-case names are left as typed)
function toDisplayName(value: string) {
  if (value !== value.toUpperCase() && value !== value.toLowerCase()) return value
  return value.toLowerCase().replace(/(^|[\s\-'’.])(\p{L})/gu, (_, sep: string, ch: string) => sep + ch.toUpperCase())
}

// ── Motion ──────────────────────────────────────────────────────────────────

const ease = [0.22, 1, 0.36, 1] as const
const REVEAL_VIEWPORT = { once: true, amount: 0.6, margin: "0px 0px -6% 0px" } as const

const headerStagger: Variants = {
  hidden: {},
  show: { transition: { staggerChildren: 0.12, delayChildren: 0.05 } },
}

const rise: Variants = {
  hidden: { opacity: 0, y: 16, filter: "blur(6px)" },
  show: { opacity: 1, y: 0, filter: "blur(0px)", transition: { duration: 0.9, ease } },
}

const lineDraw: Variants = {
  hidden: { scaleX: 0, opacity: 0 },
  show: { scaleX: 1, opacity: 1, transition: { duration: 1, ease } },
}

// Names drift in toward the centre line from their own column
const nameReveal: Variants = {
  hidden: (align: "left" | "right" | "center") => ({
    opacity: 0,
    x: align === "right" ? -18 : align === "left" ? 18 : 0,
    y: align === "center" ? 10 : 4,
  }),
  show: { opacity: 1, x: 0, y: 0, transition: { duration: 0.75, ease } },
}

// The arch rises and unfolds from its crown
const archRise: Variants = {
  hidden: { opacity: 0, y: 48 },
  show: { opacity: 1, y: 0, transition: { duration: 1.4, ease, opacity: { duration: 0.6 } } },
}

const archUnfold: Variants = {
  hidden: { clipPath: "inset(0% 0% 100% 0% round 50% 50% 0% 0%)" },
  show: {
    clipPath: "inset(0% 0% 0% 0% round 0% 0% 0% 0%)",
    transition: { duration: 1.4, ease },
    transitionEnd: { clipPath: "none" },
  },
}

// ── Pieces ──────────────────────────────────────────────────────────────────

// Hairlines either side of a small gold diamond
function DiamondDivider({ color, line, small = false }: { color: string; line: string; small?: boolean }) {
  return (
    <div className="flex items-center justify-center gap-1.5" aria-hidden>
      <span className={`h-px ${small ? "w-6 sm:w-10" : "w-10 sm:w-16"}`} style={{ background: `linear-gradient(to right, transparent, ${line})` }} />
      <span
        className={`rotate-45 ${small ? "h-1 w-1" : "h-1.5 w-1.5"}`}
        style={{ background: color, boxShadow: "0 0 6px rgb(226 183 90 / 40%)" }}
      />
      <span className={`h-px ${small ? "w-6 sm:w-10" : "w-10 sm:w-16"}`} style={{ background: `linear-gradient(to left, transparent, ${line})` }} />
    </div>
  )
}

function GroupTitle({ children, featured = false }: { children: React.ReactNode; featured?: boolean }) {
  return (
    <motion.h3
      className={`${theSeasons.className} relative mb-1.5 text-center uppercase leading-tight tracking-[0.1em] sm:mb-2 sm:tracking-[0.14em] ${
        featured ? "text-[0.85rem] sm:text-[1.05rem] md:text-[1.2rem]" : "text-[0.72rem] sm:text-[0.88rem] md:text-[0.98rem]"
      }`}
      style={{ color: INK }}
      variants={rise}
      initial="hidden"
      whileInView="show"
      viewport={REVEAL_VIEWPORT}
    >
      {children}
      <motion.span
        aria-hidden
        variants={lineDraw}
        className="mx-auto mt-1 block h-px w-10 origin-center sm:w-14"
        style={{ background: `linear-gradient(to right, transparent, ${GOLD}, transparent)` }}
      />
    </motion.h3>
  )
}

function NameItem({
  person,
  align,
  showRole = false,
}: {
  person: Representative
  align: "left" | "right" | "center"
  showRole?: boolean
}) {
  const position = person.title || (showRole ? person.category : "")
  const items = align === "right" ? "items-end" : align === "left" ? "items-start" : "items-center"
  const text = align === "right" ? "text-right" : align === "left" ? "text-left" : "text-center"
  return (
    <motion.div className="w-full min-w-0" initial="hidden" whileInView="show" viewport={REVEAL_VIEWPORT}>
      <motion.div
        className={`group/item relative flex w-full min-w-0 flex-col ${items} justify-center py-0.5 sm:py-1`}
        variants={nameReveal}
        custom={align}
      >
        <span
          aria-hidden
          className="absolute inset-0 rounded-md opacity-0 transition-opacity duration-300 group-hover/item:opacity-100"
          style={{ background: "linear-gradient(to right, transparent, rgb(201 162 74 / 16%), transparent)" }}
        />
        <p className={`${theSeasons.className} relative max-w-full break-words ${text}`} style={{ ...nameStyle, color: INK }}>
          {toDisplayName(person.name)}
        </p>
        {position ? (
          <p
            className={`${cinzel.className} relative mt-0.5 max-w-full break-words font-semibold uppercase tracking-[0.14em] ${text}`}
            style={{ ...positionStyle, color: GOLD_INK }}
          >
            {position}
          </p>
        ) : null}
      </motion.div>
    </motion.div>
  )
}

// One person → centered; up to six → two columns meeting at a gold centre line;
// larger groups → a compact centered grid (two columns on phones, three from md up)
function GroupNames({ people, showRole = false }: { people: Representative[]; showRole?: boolean }) {
  if (people.length === 1) {
    return (
      <div className="mx-auto max-w-xs">
        <NameItem person={people[0]} align="center" showRole={showRole} />
      </div>
    )
  }
  if (people.length > 6) {
    return (
      <div className="grid grid-cols-2 gap-x-3 sm:gap-x-6 md:grid-cols-3">
        {people.map((person, i) => (
          <div key={`${person.name}-${i}`} className="min-w-0">
            <NameItem person={person} align="center" showRole={showRole} />
          </div>
        ))}
      </div>
    )
  }
  const half = Math.ceil(people.length / 2)
  const left = people.slice(0, half)
  const right = people.slice(half)
  return (
    <div className="relative grid grid-cols-2 gap-x-3 gap-y-0.5 sm:gap-x-6 md:gap-x-10">
      {/* Faint gold centre line between the columns */}
      <span
        aria-hidden
        className="pointer-events-none absolute inset-y-1 left-1/2 w-px -translate-x-1/2"
        style={{ background: "linear-gradient(to bottom, transparent, rgb(201 162 74 / 30%), transparent)" }}
      />
      {Array.from({ length: half }).map((_, i) => (
        <React.Fragment key={i}>
          <div className="min-w-0 px-0.5 sm:px-1">{left[i] ? <NameItem person={left[i]} align="right" showRole={showRole} /> : null}</div>
          <div className="min-w-0 px-0.5 sm:px-1">{right[i] ? <NameItem person={right[i]} align="left" showRole={showRole} /> : null}</div>
        </React.Fragment>
      ))}
    </div>
  )
}

// ── Section ─────────────────────────────────────────────────────────────────

// sponsorsList is accepted for compatibility with the invitation page; it is not used here
export function Entourage(_props: { sponsorsList?: SponsorsList } = {}) {
  const siteConfig = useSiteConfig()
  const content = siteConfig.entourage
  const branchList = siteConfig.branches.list
  const { decos } = content

  const [people, setPeople] = useState<Representative[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isRetrying, setIsRetrying] = useState(false)
  const [error, setError] = useState(false)

  const load = async (signal?: AbortSignal, { reload = false } = {}) => {
    const cached = readCachedInvitationList<Record<string, unknown>>("/api/entourage")
    const hasCached = Boolean(cached && cached.length > 0)
    if (hasCached && cached) {
      // Show the last known list right away; refresh quietly in the background
      setPeople(toRepresentatives(cached))
      setIsLoading(false)
    } else {
      setIsLoading(true)
    }
    setError(false)
    setIsRetrying(false)

    try {
      const list = await fetchUntilReady({
        signal,
        load: (s) => loadRepresentatives(s, reload),
        isReady: (rows) => rows.length > 0,
        maxAttempts: 4,
        maxDelayMs: 3000,
        onRetry: () => setIsRetrying(true),
      })
      if (signal?.aborted) return
      setPeople(list)
    } catch (err: unknown) {
      if (isAbortError(err)) return
      console.error("Failed to load representatives:", err)
      if (!hasCached) setError(true)
    } finally {
      if (!signal?.aborted) {
        setIsLoading(false)
        setIsRetrying(false)
      }
    }
  }

  useEffect(() => {
    const controller = new AbortController()
    void load(controller.signal)

    // The dashboard fires this after adding / editing someone
    let timer: ReturnType<typeof setTimeout> | undefined
    const onUpdate = () => {
      clearTimeout(timer)
      timer = setTimeout(() => void load(controller.signal, { reload: true }), 1000)
    }
    window.addEventListener("entourageUpdated", onUpdate)
    return () => {
      controller.abort()
      clearTimeout(timer)
      window.removeEventListener("entourageUpdated", onUpdate)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  // Groups in order: the hierarchy tiers (highest rank first), Leadership, then branches in
  // branches.list order, then anything else as typed
  const hierarchy = content.hierarchy ?? []
  const groups = useMemo(() => {
    // role key → its tier and its rank inside the tier
    const tierOf = new Map<string, { tier: number; order: number }>()
    hierarchy.forEach((tier, t) =>
      tier.roles.forEach((role, order) => {
        const key = groupKey(role)
        if (!tierOf.has(key)) tierOf.set(key, { tier: t, order })
      }),
    )
    const leadershipKeys = new Set(content.leadershipCategories.map(groupKey))
    const branchOrder = new Map<string, { index: number; label: string }>()
    branchList.forEach((b, index) => {
      branchOrder.set(groupKey(b.name), { index, label: b.name })
      if (!branchOrder.has(groupKey(b.area))) branchOrder.set(groupKey(b.area), { index, label: b.name })
    })

    type Entry = { label: string; rank: number; featured: boolean; showRole: boolean }
    const map = new Map<string, Entry & { people: (Representative & { order: number })[] }>()
    let otherRank = 0
    for (const person of people) {
      const key = groupKey(person.category)
      let id: string
      let entry: Entry
      let order = 0
      const tier = tierOf.get(key)
      if (tier) {
        const def = hierarchy[tier.tier]
        id = `tier-${tier.tier}`
        entry = { label: def.title, rank: -100 + tier.tier, featured: tier.tier < 2, showRole: def.showRole }
        order = tier.order
      } else if (leadershipKeys.has(key)) {
        id = "__leadership"
        entry = { label: content.leadershipTitle || person.category, rank: -1, featured: true, showRole: false }
      } else if (branchOrder.has(key)) {
        const b = branchOrder.get(key)!
        id = `branch-${b.index}`
        entry = { label: b.label, rank: b.index, featured: false, showRole: false }
      } else {
        id = `other-${key}`
        entry = { label: person.category, rank: 1000 + otherRank++, featured: false, showRole: false }
      }
      const existing = map.get(id)
      if (existing) existing.people.push({ ...person, order })
      else map.set(id, { ...entry, people: [{ ...person, order }] })
    }
    return [...map.values()]
      .sort((a, b) => a.rank - b.rank)
      .map((group) => ({ ...group, people: [...group.people].sort((a, b) => a.order - b.order) })) // stable sort keeps sheet order within a role
  }, [people, hierarchy, branchList, content.leadershipCategories, content.leadershipTitle])

  return (
    <MotionConfig reducedMotion="user">
      <div
        className={`${theSeasons.variable} ${aboveTheBeyond.variable} relative w-full overflow-hidden`}
        style={ivorySectionStyle}
      >
        <IvoryBackdrop />
        {content.showFrame && <div className="deco-frame" aria-hidden="true" />}
        <Section
          id="entourage"
          className="relative z-10 overflow-hidden pt-14 pb-12 sm:pt-16 sm:pb-14 md:pt-20 md:pb-16 lg:pt-24 lg:pb-20"
        >
          <DecoCorners decos={decos} />

          {/* Header */}
          <motion.div
            className="relative z-20 mx-auto mb-8 max-w-4xl px-4 text-center sm:mb-10 md:mb-12"
            variants={headerStagger}
            initial="hidden"
            whileInView="show"
            viewport={{ once: true, amount: 0.4 }}
          >
            {decos.headerOrnament ? (
              <motion.div variants={rise}>
                <TintedDeco
                  src={decos.headerOrnament}
                  className="mx-auto mb-3 block h-auto w-28 select-none sm:mb-4 sm:w-36 md:w-44"
                />
              </motion.div>
            ) : null}
            <motion.div variants={rise}>
              <DiamondDivider color={LUX.gold} line={HAIRLINE} />
            </motion.div>
            <motion.p
              variants={rise}
              className={`${cinzel.className} mt-4 text-[0.66rem] font-semibold uppercase tracking-[0.3em] sm:mt-5 sm:text-xs sm:tracking-[0.36em]`}
              style={onBgGold}
            >
              {content.eyebrow}
            </motion.p>
            <motion.h2
              variants={rise}
              className="relative mx-auto mt-3 w-full max-w-full text-center sm:mt-4"
              style={
                {
                  "--title-size": "clamp(1.75rem, 8vw, 3.6rem)",
                  "--script-size": "clamp(1.05rem, 4.4vw, 2.2rem)",
                } as CSSProperties
              }
            >
              <span className="sr-only">
                {content.title} — {content.subtitle}
              </span>
              <span
                aria-hidden
                className={`${theSeasons.className} block uppercase leading-[0.92] tracking-[0.05em] sm:tracking-[0.12em]`}
                style={{ fontSize: "var(--title-size)", ...onBg }}
              >
                {content.title}
              </span>
              <span
                aria-hidden
                className={`${aboveTheBeyond.className} mx-auto mt-2 block w-fit max-w-full px-1 leading-[0.9]`}
                style={{ fontSize: "var(--script-size)", ...onBgGold }}
              >
                {content.subtitle}
              </span>
            </motion.h2>
            <motion.p
              variants={rise}
              className="font-goudy-italic mx-auto mt-4 max-w-2xl px-2 text-[0.84rem] leading-relaxed sm:mt-5 sm:text-base md:text-[1.05rem]"
              style={{ ...onBg, color: LUX.body, fontWeight: 600 }}
            >
              {content.description}
            </motion.p>
          </motion.div>

          {/* The arch */}
          <div className="relative z-20 mx-auto max-w-3xl px-2.5 pb-1 @container/entourage-card sm:max-w-4xl sm:px-6 md:px-8">
            <motion.div variants={archRise} initial="hidden" whileInView="show" viewport={{ once: true, amount: 0.08 }}>
              <motion.div variants={archUnfold}>
                <div className="relative overflow-hidden rounded-t-full" style={cardStyle}>
                  {/* Fine gold inner frame */}
                  <motion.div
                    aria-hidden
                    className="pointer-events-none absolute inset-2 z-30 rounded-t-full sm:inset-4 md:inset-5"
                    style={{ border: `1px solid ${HAIRLINE}` }}
                    initial={{ opacity: 0, scale: 0.94 }}
                    whileInView={{ opacity: 1, scale: 1 }}
                    viewport={{ once: true, amount: 0.08 }}
                    transition={{ duration: 1.6, delay: 0.5, ease }}
                  />
                  {/* One-time sheen across the crown */}
                  <motion.div
                    aria-hidden
                    className="pointer-events-none absolute inset-x-0 top-0 z-30 h-[40%] rounded-t-full"
                    style={{
                      background: "linear-gradient(105deg, transparent 35%, rgb(255 255 255 / 60%) 50%, transparent 65%)",
                      backgroundSize: "250% 100%",
                    }}
                    initial={{ backgroundPosition: "130% 0%", opacity: 0 }}
                    whileInView={{ backgroundPosition: "-30% 0%", opacity: [0, 1, 1, 0] }}
                    viewport={{ once: true, amount: 0.08 }}
                    transition={{ duration: 2.2, delay: 1.1, ease: "easeInOut" }}
                  />

                  <div className="relative z-20 px-4 pb-7 pt-[14%] sm:px-10 sm:pb-10 sm:pt-[15%] md:px-14 md:pb-12">

                    {isLoading && people.length === 0 ? (
                      <p className="font-goudy-italic py-16 text-center text-sm sm:text-base" style={{ color: INK }}>
                        {isRetrying ? content.retryingText : content.loadingText}
                      </p>
                    ) : error ? (
                      <div className="py-16 text-center">
                        <p className="font-goudy-italic mb-3 text-sm sm:text-base" style={{ color: INK }}>
                          {content.errorText}
                        </p>
                        <button
                          type="button"
                          onClick={() => void load(undefined, { reload: true })}
                          className={`${cinzel.className} rounded-full border px-5 py-2 text-xs font-semibold uppercase tracking-[0.16em] transition-opacity hover:opacity-80`}
                          style={{ color: GOLD_INK, borderColor: HAIRLINE }}
                        >
                          {content.retryText}
                        </button>
                      </div>
                    ) : groups.length === 0 ? (
                      <p className="font-goudy-italic py-16 text-center text-sm sm:text-base" style={{ color: INK }}>
                        {content.emptyText}
                      </p>
                    ) : (
                      <div>
                        {groups.map((group, i) => (
                          <section key={group.label} className={i > 0 ? "mt-3.5 sm:mt-5" : ""}>
                            {i > 0 && (
                              <div className="mb-3.5 sm:mb-5">
                                <DiamondDivider color={GOLD} line={HAIRLINE} small />
                              </div>
                            )}
                            <GroupTitle featured={group.featured}>{group.label}</GroupTitle>
                            <GroupNames people={group.people} showRole={group.showRole} />
                          </section>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              </motion.div>
            </motion.div>
          </div>

          {decos.footerVine ? (
            <TintedDeco
              src={decos.footerVine}
              className="relative z-20 mx-auto mt-8 block h-auto w-40 select-none opacity-90 sm:mt-12 sm:w-72 md:w-96"
            />
          ) : null}
        </Section>
      </div>
    </MotionConfig>
  )
}
