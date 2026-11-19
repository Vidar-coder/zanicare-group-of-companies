"use client"

import { useEffect, useState } from "react"
import { Section } from "@/components/section"
import { motion } from "motion/react"
import { cinzel } from "@/lib/fonts"
import localFont from "next/font/local"
import { useSiteConfig } from "@/hooks/use-site-config"
import Counter from "@/components/Counter"
import { parseWeddingDate } from "@/lib/wedding-date"
import { SilkScreen } from "@/components/silk-screen"
import { LUX, LUX_TEXT_SHADOW } from "@/lib/lux-dark"

interface TimeLeft {
  days: number
  hours: number
  minutes: number
  seconds: number
}

interface CountdownUnitProps {
  value: number
  label: string
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

// Black-and-gold palette (lib/lux-dark.ts): white headings, gold script and accents
const light = {
  title: LUX.white,
  script: LUX.gold,
  label: LUX.gold,
  soft: LUX.ivory,
} as const

/** Polished gold for the logo and the day number */
const GOLD_LEAF = `linear-gradient(115deg, #B8862B 0%, ${LUX.gold} 28%, ${LUX.goldLight} 45%, #FFF1C4 50%, ${LUX.goldLight} 55%, ${LUX.gold} 72%, #B8862B 100%)`

/** Fine gold rule that fades out at the given end */
const goldRule = (fadeTo: "left" | "right") => ({
  background: `linear-gradient(to ${fadeTo}, ${LUX.goldLine}, transparent)`,
})

function GoldDiamond({ size = 5 }: { size?: number }) {
  return (
    <span
      aria-hidden
      className="inline-block rotate-45"
      style={{
        width: size,
        height: size,
        background: `linear-gradient(135deg, ${LUX.goldLight}, ${LUX.goldLine})`,
        boxShadow: `0 0 6px rgb(243 210 122 / 55%)`,
      }}
    />
  )
}

function OutsideDivider() {
  return (
    <div className="flex items-center justify-center gap-2">
      <span className="h-px w-10 sm:w-16" style={goldRule("left")} />
      <GoldDiamond />
      <span className="h-px w-10 sm:w-16" style={goldRule("right")} />
    </div>
  )
}

/** The logo as a gold silhouette, with a slow shine sweeping across it */
function GoldMonogram({ src, label }: { src: string; label: string }) {
  const mask = `url("${encodeURI(src)}") center / contain no-repeat`
  return (
    <div
      role="img"
      aria-label={label}
      className="relative h-full w-full"
      style={{ filter: "drop-shadow(0 0 10px rgb(226 183 90 / 35%)) drop-shadow(0 6px 14px rgb(0 0 0 / 60%))" }}
    >
      <motion.div
        className="absolute inset-0"
        style={{
          WebkitMask: mask,
          mask,
          backgroundImage: GOLD_LEAF,
          backgroundSize: "250% 100%",
        }}
        animate={{ backgroundPosition: ["100% 0%", "0% 0%", "100% 0%"] }}
        transition={{ duration: 9, ease: "easeInOut", repeat: Infinity }}
      />
    </div>
  )
}

function CountdownTitle() {
  return (
    <h2
      className="relative mx-auto w-full max-w-full text-center"
      style={
        {
          "--title-size": "clamp(2.15rem, 11vw, 4.5rem)",
          "--script-size": "clamp(1.1rem, 4.5vw, 2.25rem)",
        } as React.CSSProperties
      }
    >
      <span
        className={`${theSeasons.className} block uppercase leading-[0.78] tracking-[0.08em] min-[400px]:tracking-[0.11em] sm:tracking-[0.15em] md:tracking-[0.18em] pb-1 sm:pb-1.5`}
        style={{
          fontSize: "var(--title-size)",
          color: light.title,
        }}
      >
        Counting Down
      </span>
      <span className="mt-2 flex items-center justify-center gap-3 sm:mt-3" aria-hidden>
        <span className="h-px w-8 sm:w-14" style={goldRule("left")} />
        <span
          className="font-inter text-[0.6rem] font-semibold uppercase tracking-[0.42em] sm:text-[0.7rem]"
          style={{ color: light.soft }}
        >
          to our
        </span>
        <span className="h-px w-8 sm:w-14" style={goldRule("right")} />
      </span>
      <span
        aria-hidden
        className={`${aboveTheBeyond.className} mx-auto block w-fit max-w-full px-1 leading-[0.88] sm:leading-[0.9] mt-2 sm:mt-2.5 md:mt-3`}
        style={{
          fontSize: "var(--script-size)",
          color: light.script,
        }}
      >
        Christmas Celebration
      </span>
      <span className="sr-only">to our Christmas Celebration</span>
    </h2>
  )
}

// Palette lives in globals.css → @theme inline → --color-motif-*
// Edit there once to update every component.

function CountdownUnit({ value, label }: CountdownUnitProps) {
  const places = value >= 100 ? [100, 10, 1] : [10, 1]

  return (
    <div className="flex flex-col items-center gap-1.5 sm:gap-2">
      {/* Card container */}
      <div className="relative w-full max-w-[88px] sm:max-w-[96px] md:max-w-[110px] lg:max-w-[120px]">
        {/* Main card: black panel with a faint neutral edge */}
        <div
          className="relative rounded-xl px-2.5 py-2.5 sm:rounded-2xl sm:px-3.5 sm:py-3.5 md:px-4 md:py-4"
          style={{
            background: "linear-gradient(180deg, rgb(24 24 26 / 92%) 0%, rgb(11 11 12 / 92%) 100%)",
            border: "1px solid rgb(255 255 255 / 10%)",
            boxShadow: "inset 0 1px 0 rgb(255 255 255 / 6%), 0 10px 24px -12px rgb(0 0 0 / 80%)",
          }}
        >
          <div className="relative z-10 flex items-center justify-center">
            <Counter
              value={value}
              places={places}
              fontSize={26}
              padding={4}
              gap={2}
              textColor={light.title}
              fontWeight={800}
              borderRadius={6}
              horizontalPadding={3}
              gradientHeight={0}
              gradientFrom="transparent"
              gradientTo="transparent"
              counterStyle={{
                backgroundColor: "transparent",
              }}
              digitStyle={{
                minWidth: "1.15ch",
                fontFamily: "Arial, system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
                color: light.title,
              }}
            />
          </div>
        </div>
      </div>

      <span
        className="text-[10px] font-inter font-semibold uppercase tracking-[0.22em] sm:text-xs md:text-sm"
        style={{ color: light.label }}
      >
        {label}
      </span>
    </div>
  )
}

export function Countdown() {
  const siteConfig = useSiteConfig()
  const ceremonyDate = siteConfig.ceremony.date
  const ceremonyTimeDisplay = siteConfig.ceremony.time
  const parsedDate = parseWeddingDate(ceremonyDate)
  const ceremonyMonth = parsedDate.month
  const ceremonyDayNumber = parsedDate.day
  const ceremonyYear = parsedDate.year
  const ceremonyDay = siteConfig.ceremony.day || parsedDate.dayOfWeek
  const ceremonyDayShort = ceremonyDay.slice(0, 3).toUpperCase()
  // Parse the date: December 20, 2025 at 10:30 AM PH Time (GMT+0800)
  // Extract time from "10:30 A.M., PH Time" -> "10:30 A.M."
  const timeStr = ceremonyTimeDisplay.split(",")[0].trim() // "10:30 A.M."
  
  // Create date string in ISO-like format for better parsing
  // December 20, 2025 -> 2025-12-20
  const monthMap: { [key: string]: string } = {
    "January": "01", "February": "02", "March": "03", "April": "04",
    "May": "05", "June": "06", "July": "07", "August": "08",
    "September": "09", "October": "10", "November": "11", "December": "12"
  }
  const monthNum =
    monthMap[ceremonyMonth.charAt(0) + ceremonyMonth.slice(1).toLowerCase()] || "12"
  const dayNum = ceremonyDayNumber
  
  // Parse time: "3:00 PM" -> 15:00
  const timeMatch = timeStr.match(/(\d+):(\d+)\s*(AM|PM)/i)
  let hour = 15 // default 3 PM
  let minutes = 0
  
  if (timeMatch) {
    hour = parseInt(timeMatch[1])
    minutes = parseInt(timeMatch[2])
    const ampm = timeMatch[3].toUpperCase()
    if (ampm === "PM" && hour !== 12) hour += 12
    if (ampm === "AM" && hour === 12) hour = 0
  }
  
  // Create date in GMT+8 (PH Time)
  // Using Date.UTC and adjusting for GMT+8 offset (subtract 8 hours to convert GMT+8 to UTC)
  const parsedTargetDate = new Date(Date.UTC(
    parseInt(ceremonyYear),
    parseInt(monthNum) - 1,
    parseInt(dayNum),
    hour - 8, // Convert GMT+8 to UTC
    minutes,
    0
  ))
  
  const targetTimestamp = Number.isNaN(parsedTargetDate.getTime())
    ? new Date(Date.UTC(2026, 1, 8, 8, 0, 0)).getTime() // Fallback: February 8, 2026, 4:00 PM GMT+8 = 8:00 AM UTC
    : parsedTargetDate.getTime()

  const [timeLeft, setTimeLeft] = useState<TimeLeft>({
    days: 0,
    hours: 0,
    minutes: 0,
    seconds: 0,
  })

  useEffect(() => {
    const calculateTimeLeft = () => {
      const targetDate = targetTimestamp
      const now = new Date().getTime()
      const difference = targetDate - now

      if (difference > 0) {
        setTimeLeft({
          days: Math.floor(difference / (1000 * 60 * 60 * 24)),
          hours: Math.floor((difference / (1000 * 60 * 60)) % 24),
          minutes: Math.floor((difference / 1000 / 60) % 60),
          seconds: Math.floor((difference / 1000) % 60),
        })
      } else {
        setTimeLeft({
          days: 0,
          hours: 0,
          minutes: 0,
          seconds: 0,
        })
      }
    }

    calculateTimeLeft()
    const timer = setInterval(calculateTimeLeft, 1000)
    return () => clearInterval(timer)
  }, [targetTimestamp])

  return (
    <div
      className={`${theSeasons.variable} ${aboveTheBeyond.variable} relative w-full bg-transparent`}
      // text-shadow is inherited, so every line of text in the countdown stays crisp on the dark ground
      style={{ textShadow: LUX_TEXT_SHADOW }}
    >
      {/* Soft screen over the silk so the white text reads (components/silk-screen.tsx) */}
      <SilkScreen shape="spotlight" strength={0.42} blur />
    <Section
      id="countdown"
      className="relative overflow-hidden py-10 sm:py-12 md:py-16 lg:py-20"
    >
      {/* Logo in gold - centered at top */}
      <div className="relative flex justify-center pt-8 sm:pt-10 md:pt-12 mb-6 sm:mb-8 md:mb-10 z-10">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1, ease: "easeOut" }}
          className="relative"
        >
          <div className="relative w-72 h-72 sm:w-96 sm:h-96 md:w-[28rem] md:h-[28rem] lg:w-[36rem] lg:h-[36rem] xl:w-[40rem] xl:h-[40rem]">
            <GoldMonogram src={siteConfig.couple.monogram} label={`${siteConfig.couple.groom} logo`} />
          </div>
        </motion.div>
      </div>

      {/* Header */}
      <div className="relative z-10 mb-6 px-3 text-center sm:mb-8 sm:px-4 md:mb-10">
        <div className="mx-auto mb-4 sm:mb-5">
          <OutsideDivider />
        </div>
        <CountdownTitle />
        <div className="mt-4 flex items-center justify-center gap-2 sm:mt-5">
          <span className="h-px w-16 sm:w-24 md:w-32" style={goldRule("left")} />
          <GoldDiamond size={4} />
          <GoldDiamond size={6} />
          <GoldDiamond size={4} />
          <span className="h-px w-16 sm:w-24 md:w-32" style={goldRule("right")} />
        </div>
      </div>

      {/* Save The Date Card */}
      <div className="relative z-10">
        <div className="flex justify-center px-3 sm:px-4">
          <div className="max-w-2xl w-full">

            {/* Numeric countdown: Days / Hours / Minutes / Seconds */}
            <div className="mt-2 sm:mt-4 md:mt-6 font-inter">
              <div className="flex flex-col items-center gap-3 sm:gap-4 md:gap-6">
                {/* 2x2 on mobile, 4 in a row from md+ */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4 md:gap-6 w-full max-w-sm sm:max-w-md md:max-w-xl">
                  <CountdownUnit value={timeLeft.days} label="Days" />
                  <CountdownUnit value={timeLeft.hours} label="Hours" />
                  <CountdownUnit value={timeLeft.minutes} label="Minutes" />
                  <CountdownUnit value={timeLeft.seconds} label="Seconds" />
                </div>
              </div>
            </div>
          </div>
          
        </div>
        
            {/* Date Section - Layout matched with hero date block */}
            <div className="relative sm:rounded-3xl p-6 sm:p-8 md:p-10 mb-6 sm:mb-8">
              <div className="w-full max-w-2xl mx-auto">
                <div
                  className={`${cinzel.className} flex flex-col items-center gap-1.5 font-bold sm:gap-2.5 md:gap-3`}
                  style={{ color: light.title }}
                >
                  {/* Month */}
                  <span className="text-[0.65rem] uppercase tracking-[0.4em] sm:text-xs sm:tracking-[0.5em] md:text-sm" style={{ color: LUX.gold }}>
                    {ceremonyMonth}
                  </span>

                  {/* Day and time row */}
                  <div className="flex w-full items-center gap-2 sm:gap-4 md:gap-5">
                    {/* Day of week & divider */}
                    <div className="flex flex-1 items-center justify-end gap-1.5 sm:gap-2.5">
                      <span className="h-px flex-1" style={{ background: `linear-gradient(to right, transparent, ${LUX.goldLine})` }} />
                      <span className="text-[0.6rem] uppercase tracking-[0.3em] sm:text-[0.7rem] sm:tracking-[0.4em] md:text-xs">
                        {ceremonyDayShort}
                      </span>
                      <span className="h-px w-6 sm:w-8 md:w-10" style={{ background: LUX.goldLine }} />
                    </div>

                    {/* Day number */}
                    <div className="relative flex items-center justify-center px-3 sm:px-4 md:px-5">
                      <span
                        className={`${cinzel.className} relative text-[3rem] font-bold leading-none tracking-wider sm:text-[4.5rem] md:text-[5.5rem] lg:text-[6rem]`}
                        // gold-leaf numerals (clipped gradient; the inherited text-shadow would show through, so drop it)
                        style={{
                          backgroundImage: GOLD_LEAF,
                          WebkitBackgroundClip: "text",
                          backgroundClip: "text",
                          color: "transparent",
                          textShadow: "none",
                          filter: "drop-shadow(0 2px 6px rgb(0 0 0 / 70%)) drop-shadow(0 0 12px rgb(226 183 90 / 25%))",
                        }}
                      >
                        {ceremonyDayNumber}
                      </span>
                    </div>

                    {/* Time */}
                    <div className="flex flex-1 items-center gap-1.5 sm:gap-2.5">
                      <span className="h-px w-6 sm:w-8 md:w-10" style={{ background: LUX.goldLine }} />
                      <span className="text-[0.6rem] uppercase tracking-[0.3em] sm:text-[0.7rem] sm:tracking-[0.4em] md:text-xs">
                        {ceremonyTimeDisplay.split(",")[0]}
                      </span>
                      <span className="h-px flex-1" style={{ background: `linear-gradient(to left, transparent, ${LUX.goldLine})` }} />
                    </div>
                  </div>

                  {/* Year */}
                  <span className="text-[0.65rem] uppercase tracking-[0.4em] sm:text-xs sm:tracking-[0.5em] md:text-sm" style={{ color: LUX.gold }}>
                    {ceremonyYear}
                  </span>
                </div>
              </div>
            </div>
      </div>
    </Section>
    </div>
  )
}
