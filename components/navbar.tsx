"use client"

import { useState, useEffect, useMemo, useRef } from "react"
import Link from "next/link"
import { useSiteConfig } from "@/hooks/use-site-config"
import StaggeredMenu from "./StaggeredMenu"
import { cinzel } from "@/lib/fonts"


// Palette lives in globals.css → @theme inline → --color-motif-*
// Edit there once to update every component.


const NAV_SEAL = "/monogram/seal.png"

// Same order as the sections in app/page.tsx. Links whose section isn't on the page
// (e.g. commented out there) are hidden automatically.
// wideOnly: shown in the desktop bar only on extra-wide screens (always in the phone menu).
const navLinks: { href: string; label: string; wideOnly?: boolean }[] = [
  { href: "#home", label: "Home" },
  { href: "#welcome", label: "Welcome", wideOnly: true },
  { href: "#love-story", label: "About Us" },
  { href: "#branches", label: "Branches" },
  { href: "#countdown", label: "Countdown", wideOnly: true },
  { href: "#gallery", label: "Gallery" },
  { href: "#messages", label: "Messages" },
  { href: "#details", label: "Details" },
  { href: "#wedding-timeline", label: "Timeline" },
  { href: "#entourage", label: "Representatives" },
  { href: "#guest-list", label: "RSVP" },
  { href: "#guests", label: "Guests" },
  { href: "#faq", label: "FAQ" },
  { href: "#registry", label: "Gifts" },
  { href: "#playlist", label: "Playlist" },
  { href: "#snap-share", label: "Snap & Share" },
  { href: "#see-you-there", label: "See You There", wideOnly: true },
]

export function Navbar() {
  const siteConfig = useSiteConfig()
  const [isScrolled, setIsScrolled] = useState(false)
  const [activeSection, setActiveSection] = useState("#home")
  // Only links whose section exists on the page (sections mount after the loader)
  const [visibleLinks, setVisibleLinks] = useState(navLinks)

  const rafIdRef = useRef<number | null>(null)

  useEffect(() => {
    const onScroll = () => {
      if (rafIdRef.current != null) return
      rafIdRef.current = window.requestAnimationFrame(() => {
        rafIdRef.current = null
        setIsScrolled(window.scrollY > 50)
      })
    }

    window.addEventListener("scroll", onScroll, { passive: true })
    return () => {
      if (rafIdRef.current != null) cancelAnimationFrame(rafIdRef.current)
      window.removeEventListener("scroll", onScroll as EventListener)
    }
  }, [])

  // Track which sections exist (they're lazy-loaded) and which one is on screen
  useEffect(() => {
    if (typeof window === "undefined") return

    const intersection = new IntersectionObserver(
      (entries) => {
        const visible = entries
          .filter(e => e.isIntersecting)
          .sort((a, b) => b.intersectionRatio - a.intersectionRatio)
        const topMost = visible[0]
        if (topMost?.target.id) {
          const newActive = `#${topMost.target.id}`
          setActiveSection(prev => (prev === newActive ? prev : newActive))
        }
      },
      { root: null, rootMargin: "-20% 0px -70% 0px", threshold: [0, 0.1, 0.25, 0.5, 0.75, 1] },
    )

    const observed = new Set<Element>()
    let frame: number | null = null

    const sync = () => {
      frame = null
      const present = navLinks.filter(l => document.getElementById(l.href.substring(1)))
      setVisibleLinks(prev =>
        prev.length === present.length && prev.every((l, i) => l.href === present[i].href) ? prev : present,
      )
      present.forEach(l => {
        const el = document.getElementById(l.href.substring(1))
        if (el && !observed.has(el)) {
          observed.add(el)
          intersection.observe(el)
        }
      })
    }

    sync()
    // Re-check whenever new sections mount
    const mutations = new MutationObserver(() => {
      if (frame == null) frame = window.requestAnimationFrame(sync)
    })
    mutations.observe(document.body, { childList: true, subtree: true })

    return () => {
      if (frame != null) cancelAnimationFrame(frame)
      mutations.disconnect()
      intersection.disconnect()
    }
  }, [])

  const menuItems = useMemo(
    () => visibleLinks.map((l) => ({ label: l.label, ariaLabel: `Go to ${l.label}`, link: l.href })),
    [visibleLinks],
  )

  return (
    <nav
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-700 ease-out ${
        isScrolled
          ? "shadow-[0_6px_18px_rgb(0_0_0/45%)]"
          : "shadow-none"
      }`}
      style={{
        // Black bar with a gold hairline; gold for the monogram, links and menu button
        background: "rgb(10 10 11 / 92%)",
        WebkitBackdropFilter: "blur(10px)",
        backdropFilter: "blur(10px)",
        borderBottom:
          "1px solid rgb(201 162 74 / 35%)",
      }}
    >

      <div className="max-w-7xl mx-auto px-3 sm:px-5 lg:px-8 relative">
        <div className="flex justify-between items-center h-12 sm:h-14 md:h-16 gap-3">
          <Link
            href="#home"
            className="flex-shrink-0 group relative z-10 flex items-center justify-center py-0 pl-1 pr-2.5 sm:pl-1.5 sm:pr-3 md:pl-2 md:pr-3.5 -ml-0.5 sm:ml-0 self-stretch"
            aria-label={`${siteConfig.couple.groomNickname} & ${siteConfig.couple.brideNickname} — Home`}
          >
            {/* Seal in its original colours */}
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={NAV_SEAL}
              alt=""
              aria-hidden
              className="relative block h-[2.5rem] w-[3.2rem] sm:h-[2.85rem] sm:w-[3.65rem] md:h-[3.35rem] md:w-[4.15rem] shrink-0 my-0 object-contain group-hover:scale-105 group-active:scale-100 transition-transform duration-500"
            />
            <div className="absolute inset-0 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-500 bg-[rgb(226_183_90/12%)] blur-md -z-10" />
          </Link>

          <div className="hidden xl:flex gap-0.5 items-center">
            {visibleLinks.map((link) => {
              const isActive = activeSection === link.href
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  aria-current={isActive ? "location" : undefined}
                  className={`${link.wideOnly ? "hidden 2xl:inline-block" : ""} ${cinzel.className} group relative whitespace-nowrap px-2.5 py-2 text-[0.68rem] font-semibold uppercase tracking-[0.18em] transition-colors duration-300 lg:px-3 lg:text-[0.72rem] ${
                    isActive
                      ? "text-[#E2B75A]"
                      : "text-[rgb(237_230_214/75%)] hover:text-[#E2B75A]"
                  }`}
                >
                  {link.label}
                  {/* Gold underline that grows from the centre */}
                  <span
                    aria-hidden
                    className={`absolute bottom-1 left-1/2 h-px -translate-x-1/2 bg-[#E2B75A] transition-all duration-300 ${
                      isActive ? "w-[60%]" : "w-0 group-hover:w-[60%]"
                    }`}
                  />
                </Link>
              )
            })}
          </div>

          <div className="xl:hidden flex items-center justify-end h-full">
            <StaggeredMenu
              position="left"
              items={menuItems}
              socialItems={[]}
              displaySocials={false}
              menuButtonColor="#E2B75A"
              openMenuButtonColor="#FFFFFF"
              changeMenuColorOnOpen={true}
              // One plain burgundy layer slides in just ahead of the panel
              colors={["var(--color-motif-deep)"]}
              accentColor="var(--color-motif-deep)"
              isFixed={true}
              activeLink={activeSection}
              onMenuOpen={() => {}}
              onMenuClose={() => {}}
            />
          </div>
        </div>

      </div>
    </nav>
  )
}
