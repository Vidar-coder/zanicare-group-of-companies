"use client"

import React, { useCallback, useEffect, useMemo, useRef, useState } from "react"
import localFont from "next/font/local"
import { motion, useReducedMotion } from "motion/react"
import type { Map as LeafletMap, Marker } from "leaflet"
import "leaflet/dist/leaflet.css"
import { cinzel } from "@/lib/fonts"
import { layeredSectionTitleSize } from "@/lib/section-typography"
import { useSiteConfig } from "@/hooks/use-site-config"
import { siteConfig as defaultSiteConfig } from "@/content/site"
import { TintedDeco } from "@/components/tinted-deco"
import "./branches-map.css"

/*
 * Branch map — every Zanicare clinic as a glowing red pin on a dark map, in the same luxury dark
 * look as the About Us section (black ground, faint gold monogram pattern, gold frame + corners).
 * Branches, wording and coordinates live in content/site.ts → branches.
 * Map: Leaflet with Esri's World Street Map tiles (no API key needed), turned dark in CSS to match the
 * black-and-gold look (branches-map.css → .zb-map .leaflet-tile-pane). Attribution kept, as required.
 * (CARTO's dark tiles now need an API key; OpenStreetMap's own servers block apps like this.)
 */

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

const GOLD = "#E2B75A"
const GOLD_LINE = "#C9A24A"
const WHITE = "#F5F5F5"
const onBgGlow = "0 1px 2px rgb(0 0 0 / 85%), 0 0 14px rgb(0 0 0 / 55%)"
const PATTERN = "/monogram/monogram-liner-gold.png"
const revealEase = [0.22, 1, 0.36, 1] as const

type Branch = (typeof defaultSiteConfig.branches.list)[number]
type PinnedBranch = Branch & { lat: number; lng: number }

const isPinned = (b: Branch): b is PinnedBranch => typeof b.lat === "number" && typeof b.lng === "number"

/** Lets the cards fly the map to a pin, and the region tabs fit the map to a group of branches */
type MapApi = { focus: (index: number) => void; fit: (indices: number[]) => void }

// Red map pin with a pulsing glow underneath (styled in branches-map.css)
const PIN_HTML = `
  <span class="zb-pin">
    <span class="zb-pin__pulse"></span>
    <span class="zb-pin__pulse zb-pin__pulse--late"></span>
    <svg class="zb-pin__icon" viewBox="0 0 24 24" aria-hidden="true">
      <path d="M12 1.8c-4.03 0-7.3 3.2-7.3 7.17 0 5.37 6.53 12.4 6.8 12.7a.68.68 0 0 0 1 0c.27-.3 6.8-7.33 6.8-12.7C19.3 5 16.03 1.8 12 1.8Z"/>
      <circle cx="12" cy="9" r="2.6"/>
    </svg>
  </span>`

function directionsUrl(branch: Branch) {
  if (branch.map) return branch.map
  const query = ["Zanicare Animal Bite Clinic", branch.address || `${branch.name} ${branch.area}`].join(" ")
  return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(query)}`
}

function escapeHtml(text: string) {
  return text.replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[c] ?? c)
}

function OrnamentalDivider() {
  return (
    <div className="flex items-center justify-center gap-1.5" aria-hidden>
      <span className="h-px w-10 sm:w-16" style={{ background: `linear-gradient(to right, transparent, ${GOLD_LINE})` }} />
      <span
        className="h-1 w-1 rotate-45 sm:h-1.5 sm:w-1.5"
        style={{ background: GOLD, boxShadow: "0 0 8px rgb(226 183 90 / 45%)" }}
      />
      <span className="h-px w-10 sm:w-16" style={{ background: `linear-gradient(to left, transparent, ${GOLD_LINE})` }} />
    </div>
  )
}

function BranchesLeafletMap({
  branches,
  directionsLabel,
  apiRef,
  initialIndices,
}: {
  branches: readonly Branch[]
  directionsLabel: string
  apiRef: React.MutableRefObject<MapApi | null>
  /** Branches the map is fitted to when it first loads (the default tab) */
  initialIndices: number[]
}) {
  const containerRef = useRef<HTMLDivElement>(null)
  const mapRef = useRef<LeafletMap | null>(null)
  // Read once when the map is created — later tab changes go through apiRef.fit
  const initialRef = useRef(initialIndices)

  useEffect(() => {
    let cancelled = false
    const container = containerRef.current
    if (!container) return

    // Leaflet touches `window`, so it is loaded in the browser only
    import("leaflet").then((L) => {
      if (cancelled || !containerRef.current || mapRef.current) return
      const map = L.map(container, {
        zoomControl: true,
        attributionControl: true,
        scrollWheelZoom: false, // the page keeps scrolling over the map
        dragging: !L.Browser.mobile, // one finger scrolls the page on phones; pinch still zooms
        // Fallback view (Metro Manila) when no branch has coordinates yet
        center: [14.55, 121.0],
        zoom: 11,
      })
      mapRef.current = map

      // Esri World Street Map: no API key, street names included (made dark in CSS)
      L.tileLayer("https://server.arcgisonline.com/ArcGIS/rest/services/World_Street_Map/MapServer/tile/{z}/{y}/{x}", {
        maxZoom: 19,
        attribution:
          'Tiles &copy; <a href="https://www.esri.com/" target="_blank" rel="noopener">Esri</a> — Esri, HERE, Garmin, USGS, &copy; OpenStreetMap contributors',
      }).addTo(map)

      const icon = L.divIcon({
        className: "zb-pin-wrap",
        html: PIN_HTML,
        iconSize: [34, 34],
        iconAnchor: [17, 32],
        popupAnchor: [0, -30],
      })

      const markers = new Map<number, Marker>()
      branches.forEach((branch, index) => {
        if (!isPinned(branch)) return
        const area = branch.address || branch.area
        const areaHtml = area ? `<span class="zb-popup__area">${escapeHtml(area)}</span>` : ""
        const noteText = [branch.note, branch.status].filter(Boolean).join(" · ")
        const note = noteText ? `<span class="zb-popup__note">${escapeHtml(noteText)}</span>` : ""
        const marker = L.marker([branch.lat, branch.lng], { icon, title: branch.name, riseOnHover: true })
        markers.set(index, marker)
        marker
          .addTo(map)
          .bindPopup(
            `<div class="zb-popup">
              <span class="zb-popup__name">${escapeHtml(branch.name)}</span>${areaHtml}${note}
              <a class="zb-popup__link" href="${escapeHtml(directionsUrl(branch))}" target="_blank" rel="noopener">${escapeHtml(directionsLabel)} →</a>
            </div>`,
            { className: "zb-popup-wrap", closeButton: false },
          )
      })

      const fit = (indices: number[], animate: boolean) => {
        const points = indices
          .map((i) => markers.get(i)?.getLatLng())
          .filter((p): p is NonNullable<typeof p> => Boolean(p))
        map.closePopup()
        if (points.length > 1) {
          map.fitBounds(L.latLngBounds(points), { padding: [40, 40], maxZoom: 14, animate })
        } else if (points.length === 1) {
          map.setView(points[0], 14, { animate })
        }
      }

      apiRef.current = {
        focus: (index) => {
          const marker = markers.get(index)
          if (!marker) return
          map.flyTo(marker.getLatLng(), 15, { duration: 0.9 })
          map.once("moveend", () => marker.openPopup())
        },
        fit: (indices) => fit(indices, true),
      }

      const startWith = initialRef.current.filter((i) => markers.has(i))
      fit(startWith.length > 0 ? startWith : [...markers.keys()], false)
    })

    return () => {
      cancelled = true
      apiRef.current = null
      mapRef.current?.remove()
      mapRef.current = null
    }
  }, [branches, directionsLabel, apiRef])

  return <div ref={containerRef} className="zb-map" role="region" aria-label="Map of Zanicare branches" />
}

export function BranchesMap() {
  const siteConfig = useSiteConfig()
  const content = { ...defaultSiteConfig.branches, ...siteConfig.branches }
  const labels = { ...defaultSiteConfig.branches.labels, ...content.labels }
  const corners = content.decos ?? defaultSiteConfig.branches.decos
  const branches = content.list ?? []
  const stats = (content.stats ?? []).filter((s) => s.value)
  const regions = content.regions ?? []
  const defaultRegion = Math.min(Math.max(content.defaultRegion ?? 0, 0), Math.max(regions.length - 1, 0))
  const [regionIndex, setRegionIndex] = useState(defaultRegion)
  // Branches in the selected tab (an empty `match` = all), keeping each branch's place in the full list
  const visible = useMemo(() => {
    const match = regions[regionIndex]?.match ?? []
    return branches
      .map((branch, index) => ({ branch, index }))
      .filter(({ branch }) => match.length === 0 || match.includes(branch.region))
  }, [branches, regions, regionIndex])
  // Branches of the default tab, for the map's first view
  const initialIndices = useMemo(() => {
    const match = regions[defaultRegion]?.match ?? []
    return branches
      .map((b, index) => ({ b, index }))
      .filter(({ b }) => match.length === 0 || match.includes(b.region))
      .map(({ index }) => index)
  }, [branches, regions, defaultRegion])
  const reduceMotion = useReducedMotion()
  const mapApi = useRef<MapApi | null>(null)
  const mapFrameRef = useRef<HTMLDivElement>(null)

  const selectRegion = useCallback(
    (i: number) => {
      setRegionIndex(i)
      const match = regions[i]?.match ?? []
      const indices = branches
        .map((b, index) => ({ b, index }))
        .filter(({ b }) => match.length === 0 || match.includes(b.region))
        .map(({ index }) => index)
      mapApi.current?.fit(indices)
    },
    [branches, regions],
  )

  const showOnMap = useCallback((index: number) => {
    mapFrameRef.current?.scrollIntoView({ behavior: "smooth", block: "center" })
    // Give the scroll a moment, then fly to the pin
    window.setTimeout(() => mapApi.current?.focus(index), 450)
  }, [])

  if (branches.length === 0) return null

  return (
    <section
      id="branches"
      className={`branches-root ${theSeasons.variable} ${aboveTheBeyond.variable} relative z-[2] w-full overflow-hidden`}
    >
      {/* Gold monogram pattern, slightly visible */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 z-0"
        style={{ backgroundImage: `url("${PATTERN}")`, backgroundSize: "88px auto", opacity: 0.18 }}
      />
      <div
        aria-hidden
        className="pointer-events-none absolute inset-x-10 top-0 z-[1] h-px"
        style={{ background: `linear-gradient(to right, transparent, ${GOLD_LINE}, #F3D27A, ${GOLD_LINE}, transparent)` }}
      />
      {content.showFrame && <div className="branches-frame" aria-hidden="true" />}
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
            className={`branches-corner branches-corner--${pos} pointer-events-none absolute z-[1] select-none ${className}`}
          />
        ))}

      <div className="relative z-10 mx-auto max-w-5xl px-5 pb-20 pt-24 sm:px-8 sm:pb-24 sm:pt-32 md:pt-36">
        <motion.header
          className="mx-auto max-w-3xl text-center"
          initial={reduceMotion ? false : { opacity: 0, y: 22 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-40px" }}
          transition={{ duration: 0.75, ease: revealEase }}
        >
          {corners.headerOrnament ? (
            <TintedDeco src={corners.headerOrnament} className="love-story-ornament mx-auto mb-3 sm:mb-4" />
          ) : null}
          {content.eyebrow && (
            <p
              className={`${cinzel.className} mb-3 text-[clamp(0.6rem,2.4vw,0.76rem)] font-semibold uppercase tracking-[0.34em]`}
              style={{ color: GOLD, textShadow: onBgGlow }}
            >
              {content.eyebrow}
            </p>
          )}
          <h2
            className="welcome-title-lockup relative mx-auto w-full max-w-full text-center"
            style={
              {
                "--title-size": layeredSectionTitleSize.main,
                "--script-size": layeredSectionTitleSize.script,
              } as React.CSSProperties
            }
          >
            <span
              className={`${theSeasons.className} block pb-1 uppercase leading-[0.78] tracking-[0.08em] min-[400px]:tracking-[0.11em] sm:tracking-[0.13em]`}
              style={{ fontSize: "var(--title-size)", color: WHITE, textShadow: onBgGlow }}
            >
              {content.title}
            </span>
            {content.script && (
              <span
                className={`${aboveTheBeyond.className} mx-auto mt-2 block w-fit max-w-full px-1 leading-[0.88] sm:mt-3`}
                style={{
                  fontSize: "var(--script-size)",
                  color: GOLD,
                  textShadow: `${onBgGlow}, 0 0 20px rgb(226 183 90 / 25%)`,
                }}
              >
                {content.script}
              </span>
            )}
          </h2>
          <div className="mt-4 sm:mt-5">
            <OrnamentalDivider />
          </div>
          {content.description && <p className="branches-intro mx-auto mt-5 max-w-xl sm:mt-6">{content.description}</p>}
        </motion.header>

        {/* Summary strip */}
        {stats.length > 0 && (
          <dl className="mx-auto mt-8 grid max-w-xl grid-cols-3 gap-2 sm:mt-10 sm:gap-4">
            {stats.map((stat) => (
              <div key={stat.label} className="zb-stat">
                <dt className="sr-only">{stat.label}</dt>
                <dd className={`${theSeasons.className} zb-stat__value`}>{stat.value}</dd>
                <dd aria-hidden className={`${cinzel.className} zb-stat__label`}>
                  {stat.label}
                </dd>
              </div>
            ))}
          </dl>
        )}

        {/* Region tabs: zoom the map + filter the list */}
        {regions.length > 1 && (
          <div className="zb-tabs mt-8 sm:mt-10" role="tablist" aria-label="Branch regions">
            {regions.map((region, i) => (
              <button
                key={region.label}
                type="button"
                role="tab"
                aria-selected={i === regionIndex}
                className={`${cinzel.className} zb-tab${i === regionIndex ? " is-active" : ""}`}
                onClick={() => selectRegion(i)}
              >
                {region.label}
              </button>
            ))}
          </div>
        )}

        {/* The map */}
        <motion.div
          ref={mapFrameRef}
          className={`zb-map-frame ${regions.length > 1 ? "mt-4" : "mt-8 sm:mt-10"}`}
          initial={reduceMotion ? false : { opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-60px" }}
          transition={{ duration: 0.85, delay: 0.1, ease: revealEase }}
        >
          <BranchesLeafletMap
            branches={branches}
            directionsLabel={labels.directions}
            apiRef={mapApi}
            initialIndices={initialIndices}
          />
        </motion.div>

        {/* All branches — compact cards */}
        <ol className="mt-8 grid grid-cols-1 gap-3 sm:mt-10 sm:grid-cols-2 lg:grid-cols-3">
          {visible.map(({ branch, index }) => {
            const pinned = isPinned(branch)
            return (
              <motion.li
                key={`${branch.name}-${index}`}
                className="zb-card"
                initial={reduceMotion ? false : { opacity: 0, y: 12 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-30px" }}
                transition={{ duration: 0.55, delay: Math.min((index % 3) * 0.06, 0.18), ease: revealEase }}
              >
                <div className="zb-card__head">
                  <span className={`zb-card__dot${pinned ? "" : " zb-card__dot--pending"}`} aria-hidden />
                  <p className={`${cinzel.className} zb-card__number`}>
                    {labels.branch} {String(index + 1).padStart(2, "0")}
                    {branch.region ? <span className="zb-card__region"> · {branch.region}</span> : null}
                  </p>
                  {branch.note && <span className={`${cinzel.className} zb-card__badge`}>{branch.note}</span>}
                </div>
                <h3 className={`${theSeasons.className} zb-card__name`}>{branch.name}</h3>
                <p className="zb-card__area">{branch.address || (branch.area ? `${branch.area} · ${labels.noPin}` : labels.noPin)}</p>
                {branch.status && (
                  <p className={`${cinzel.className} zb-card__status`}>
                    <span aria-hidden className="zb-card__status-dot" />
                    {branch.status}
                  </p>
                )}
                {branch.blurb && <p className="zb-card__blurb">{branch.blurb}</p>}
                {(pinned || branch.map) && (
                  <div className="zb-card__actions">
                    {pinned && (
                      <button type="button" className={`${cinzel.className} zb-btn zb-btn--ghost`} onClick={() => showOnMap(index)}>
                        {labels.viewOnMap}
                      </button>
                    )}
                    <a
                      className={`${cinzel.className} zb-btn zb-btn--gold`}
                      href={directionsUrl(branch)}
                      target="_blank"
                      rel="noopener noreferrer"
                      aria-label={`${labels.directions}: ${branch.name}`}
                    >
                      {labels.directions}
                    </a>
                  </div>
                )}
              </motion.li>
            )
          })}
        </ol>

        {content.closing && (
          <div className="mt-10 text-center sm:mt-12">
            <OrnamentalDivider />
            <p className="branches-closing mx-auto mt-4 max-w-lg">{content.closing}</p>
          </div>
        )}
      </div>
    </section>
  )
}
