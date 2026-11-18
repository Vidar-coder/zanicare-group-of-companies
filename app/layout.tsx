import type React from "react"
import type { Metadata, Viewport } from "next"
import localFont from "next/font/local"
import { Analytics } from "@vercel/analytics/next"
import "./globals.css"
import { siteConfig, canonicalSiteUrl } from "@/content/site"
import { ClientLayout } from "@/components/client-layout"
import { getImageProps } from "next/image"
import {
  LOADING_BG_PHOTOS,
  LOADING_BG_PHOTOS_DESKTOP,
  MARQUEE_IMAGE_QUALITY,
  MARQUEE_IMAGE_SIZES,
} from "@/lib/loading-bg-photos"
import { anastasiaScript } from "@/lib/fonts"
import { inter, greatVibes, imperialScript, cinzel } from "@/lib/self-hosted-fonts"

const canonicalUrl = canonicalSiteUrl
// Link preview (Facebook, Messenger, Viber, WhatsApp, X). Absolute https URLs are required:
// a forwarded message is re-scraped without the original page, so relative paths break.
const OG_IMAGE_FALLBACK = `${canonicalUrl}${siteConfig.linkPreviewImage}`
const OG_IMAGE_SQUARE = `${canonicalUrl}${siteConfig.linkPreviewImageSquare}`
const eventImageUrl = OG_IMAGE_FALLBACK
// og:image:type must match the real file — Facebook / Messenger drop the image on a mismatch
const imageType = (path: string) =>
  /\.png$/i.test(path) ? "image/png" : /\.webp$/i.test(path) ? "image/webp" : "image/jpeg"

// Phones open on the tap-to-open card (content/site.ts → openingCard), so the loader comes later
const phoneOpeningCard = siteConfig.openingCard?.enabled !== false

// couple.groom = company name, couple.bride = event name (content/site.ts → QUICK SETUP)
const companyName = siteConfig.couple.groom
const eventName = siteConfig.couple.bride
const coupleNames = `${companyName} ${eventName}`
const eventTitle = `${eventName} | ${companyName}`
const eventDescription = `You're invited to the ${companyName} ${eventName} on ${siteConfig.wedding.date} at ${siteConfig.ceremony.location}. RSVP, view the program, and find everything you need for the evening.`
const eventHashtag = siteConfig.snapShare.hashtag[0] ?? ""

const jsonLd = {
  "@context": "https://schema.org",
  "@type": "Event",
  name: `${companyName} ${eventName}`,
  startDate: "2026-12-13T18:00:00+08:00",
  endDate: "2026-12-13T23:30:00+08:00",
  eventStatus: "https://schema.org/EventScheduled",
  eventAttendanceMode: "https://schema.org/OfflineEventAttendanceMode",
  location: {
    "@type": "Place",
    name: siteConfig.ceremony.location,
    address: {
      "@type": "PostalAddress",
      streetAddress: siteConfig.ceremony.venue,
      addressLocality: "Pasay City",
      addressRegion: "Metro Manila",
      addressCountry: "PH",
    },
  },
  image: [OG_IMAGE_FALLBACK],
  description: eventDescription,
  organizer: {
    "@type": "Organization",
    name: companyName,
  },
  eventHashtag,
}

const brittany = localFont({
  src: "../Font/brittany-signature-script/BrittanySignatureScript.ttf",
  variable: "--font-brittany",
  display: "swap",
})

const playlistScript = localFont({
  src: "../Font/playlist-script/Playlist Script.otf",
  variable: "--font-playlist-script",
  display: "swap",
})

export const metadata: Metadata = {
  metadataBase: new URL(canonicalUrl),
  title: {
    default: eventTitle,
    template: `%s | ${eventName}`,
  },
  description: eventDescription,
  keywords:
    `${companyName}, Zanicare, ${eventName}, Christmas party, company party, ${siteConfig.ceremony.location}, invitation, RSVP, ${eventHashtag}`,
  applicationName: `${eventName} Invitation`,
  authors: [{ name: companyName }],
  creator: companyName,
  publisher: companyName,
  category: "Event",
  formatDetection: {
    email: false,
    address: false,
    telephone: true,
  },
  alternates: {
    canonical: canonicalUrl,
  },
  icons: {
    icon: [
      { url: "/favicon_io/favicon-16x16.png", sizes: "16x16", type: "image/png" },
      { url: "/favicon_io/favicon-32x32.png", sizes: "32x32", type: "image/png" },
    ],
    shortcut: "/favicon_io/favicon.ico",
    apple: "/favicon_io/apple-touch-icon.png",
    other: [
      { rel: "android-chrome-192x192", url: "/favicon_io/android-chrome-192x192.png" },
      { rel: "android-chrome-512x512", url: "/favicon_io/android-chrome-512x512.png" },
    ],
  },
  manifest: "/favicon_io/site.webmanifest",
  openGraph: {
    title: `${eventName} | ${siteConfig.wedding.date}`,
    description: eventDescription,
    url: canonicalUrl,
    siteName: coupleNames,
    locale: "en_PH",
    type: "website",
    // Wide image first (what Facebook / Messenger / Viber show); square second for apps that prefer it.
    // width/height must match the real files, or Messenger may skip the image.
    // Both are the company logo (1254×1254) until a 1200×630 preview image is made.
    images: [
      {
        url: OG_IMAGE_FALLBACK,
        secureUrl: OG_IMAGE_FALLBACK,
        width: 1254,
        height: 1254,
        type: imageType(siteConfig.linkPreviewImage),
        alt: `${coupleNames} - ${siteConfig.wedding.date}`,
      },
      {
        url: OG_IMAGE_SQUARE,
        secureUrl: OG_IMAGE_SQUARE,
        width: 1254,
        height: 1254,
        type: imageType(siteConfig.linkPreviewImageSquare),
        alt: coupleNames,
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: `${eventName} Invitation`,
    description: `${eventDescription} ${eventHashtag}`.trim(),
    images: [eventImageUrl],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
  appleWebApp: {
    title: eventName,
    statusBarStyle: "default",
    capable: true,
  },
}

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
  colorScheme: "light",
  themeColor: "#D9A08C",
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <meta httpEquiv="X-UA-Compatible" content="IE=edge" />
        <meta name="color-scheme" content="light" />
        <meta name="theme-color" content="#111111" />
        <meta name="format-detection" content="telephone=yes,email=no,address=no" />
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Cinzel:wght@400..900&display=swap" rel="stylesheet" />
        <link href="https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,400;0,500;0,600;1,400;1,500&display=swap" rel="stylesheet" />
        <link href="https://fonts.googleapis.com/css2?family=Playfair+Display:wght@400;500;600&display=swap" rel="stylesheet" />
        <link href="https://fonts.googleapis.com/css2?family=Lavishly+Yours&display=swap" rel="stylesheet" />
        <link href="https://fonts.googleapis.com/css2?family=Style+Script&display=swap" rel="stylesheet" />
        <link href="https://fonts.googleapis.com/css2?family=Crimson+Text:ital,wght@0,400;0,600;0,700;1,400;1,600;1,700&display=swap" rel="stylesheet" />
        <link
          rel="preload"
          href="/fonts/AnastasiaScript.ttf"
          as="font"
          type="font/ttf"
          crossOrigin="anonymous"
        />
        {/* First loader photos, preloaded as the exact resized files the marquee requests.
            On phones with the opening card the loader only starts after the tap, so its photos
            go at low priority there and don't hold up the card art. */}
        {[
          ...LOADING_BG_PHOTOS.slice(0, 3).map((src) => ({ src, media: "(max-width: 767px)" })),
          ...LOADING_BG_PHOTOS_DESKTOP.slice(0, 3).map((src) => ({ src, media: "(min-width: 768px)" })),
        ].map(({ src, media }, index) => {
          const { props } = getImageProps({
            src,
            alt: "",
            fill: true,
            sizes: MARQUEE_IMAGE_SIZES,
            quality: MARQUEE_IMAGE_QUALITY,
          })
          return (
            <link
              key={`${media}-${src}`}
              rel="preload"
              as="image"
              imageSrcSet={props.srcSet}
              imageSizes={props.sizes}
              media={media}
              {...(media.includes("max-width") && phoneOpeningCard
                ? { fetchPriority: "low" as const }
                : index % 3 === 0
                  ? { fetchPriority: "high" as const }
                  : {})}
            />
          )
        })}
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      </head>
      <body
        className={`${inter.variable} ${greatVibes.variable} ${imperialScript.variable} ${cinzel.variable} ${brittany.variable} ${playlistScript.variable} ${anastasiaScript.variable} font-inter antialiased text-foreground`}
      >
        <ClientLayout>
          {children}
        </ClientLayout>
        <Analytics />
      </body>
    </html>
  )
}