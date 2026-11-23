import {
  proposalRoleDefinitions,
  proposalRoleIdAliases,
} from "@/content/proposal-roles"

export type TimelineIconName =
  | "arrival"
  | "guests"
  | "rings"
  | "departure"
  | "cocktail"
  | "fireworks"
  | "dance"

// Icons for the "What to Expect" program and Gentle Reminders (components/sections/details.tsx)
export type ProgramIconName =
  | "registration"
  | "prayer"
  | "welcome"
  | "founder"
  | "review"
  | "dinner"
  | "awards"
  | "raffle"
  | "performance"
  | "closing"
export type ReminderIconName = "registration" | "dress" | "raffle" | "share"

export type AttireGroupId = "entourage" | "family" | "sponsors" | "guests"
// A palette color: "#9CAF88" or { name: "Sage", hex: "#9CAF88" }
export type AttireColor = string | { name: string; hex: string }

/* ============================================================================
   SOP — CREATING / UPDATING AN INVITATION
   ----------------------------------------------------------------------------
   This file is the single source of truth for the couple's content. Pages,
   metadata (link previews), robots.txt, sitemap.xml, QR codes, the table
   finder and proposal pages all read from here. Avoid hard-coding couple
   names, dates, URLs or image paths in components — add them here instead.

   NEW INVITATION (cloned from a previous couple) — work top to bottom:
     1. COUPLE          names + nicknames (nicknames drive "Groom & Bride" text)
     2. DATE & TIMES    wedding date, day, entourage/guest/ceremony/reception times
     3. VENUES          ceremony + reception name, address, Google Maps link, photos;
                        VENUE_CARDS = one combined card or two separate cards + their labels
     4. RSVP            deadline, coordinator, phone; HASHTAGS
     5. WEBSITE         SITE_URL = the live domain (keep the trailing "/").
                        LINK_PREVIEW_IMAGE = 1200×630 JPG for Facebook/Messenger.
                        Both feed app/layout.tsx, app/robots.ts, app/sitemap.ts,
                        lib/proposal-metadata.ts and the table finder.
                        NEXT_PUBLIC_SITE_URL (env, e.g. on Vercel) overrides SITE_URL.
     6. LOOK & FEEL     DISPLAY_MODE "plain" or "photos"
     7. SHARED IMAGES   monogram, couple-name lettering, wax seal, music, COUPLE_PHOTOS
     8. googleAPI       new Apps Script / Form URLs for THIS couple's sheet —
                        never reuse the previous couple's (guests would mix).
     9. SECTIONS        love story, timeline events, ATTIRE (cards + palette), reminders,
                        FAQ, registry accounts/QRs, playlist, snap & share, socials.
    10. Search for "⚠ check" and old couple names/hashtags/QRs and replace them.

   BEFORE GOING LIVE:
     • Put every referenced file in /public (paths are case-sensitive on Vercel).
     • Run `npm run build` to catch typos.
     • Paste the live URL in https://developers.facebook.com/tools/debug/ and
       click "Scrape Again" so Facebook picks up the new title + preview image.
       (Changing the preview image? Rename the file — FB caches by URL.)
     • Test RSVP search, a test RSVP submission, messages and /table on mobile.

   CONVENTIONS:
     • Image paths start with "/" and are relative to /public.
     • "" on a decoration/image hides it; show: false hides a card/account/link.
     • Placeholders like {couple}, {name}, {deadline} are filled automatically —
       keep the braces when editing text.
     • ⚠ marks values likely left over from a previous couple.
   ============================================================================ */

/* ============================================================================
   QUICK SETUP — edit these first.
   Every section below reads from here, so one change updates the whole site
   (loader, envelope, hero, details, timeline, RSVP, FAQ, footer, …).
   ============================================================================ */

// ── The event ───────────────────────────────────────────────────────────────
// The site was built for couples, so the event uses the same fields:
//   groom / bride                   → full company + event name (Welcome sign-off, full names)
//   groomNickname / brideNickname   → the two big words on the loader, envelope and footer
//                                     ("Year-End" & "Thanksgiving"), joined by loadingScreen.namesJoiner
const COMPANY_NAME = "Zanicare Group of Companies Inc."
const EVENT_NAME = "Year-End Thanksgiving Party"
const COUPLE = {
  bride: EVENT_NAME,
  brideNickname: "Thanksgiving",
  groom: COMPANY_NAME,
  groomNickname: "Year-End",
}

// ── Date & times ────────────────────────────────────────────────────────────
const WEDDING_DATE = "December 13, 2026" // event date
const WEDDING_DAY = "Sunday"
const TIMES = {
  entourageCall: "5:00 PM", // organizing committee / staff call time
  guestArrival: "6:00 PM", // registration & cocktails (shown in Event Details + reminders)
  ceremony: "7:00 PM", // program starts
  reception: "8:00 PM", // dinner is served
}

// ── Venue ───────────────────────────────────────────────────────────────────
// Ceremony and reception are the same venue (VENUE_CARDS.layout = "combined").
// photos: placeholder until venue photos are added (files in /public)
const PLACEHOLDER_IMAGE = "/Details/imageplaceholder.jpg"
const CEREMONY_VENUE = {
  name: "The Heritage Hotel Manila",
  address: "Roxas Boulevard corner EDSA, Pasay City, 1300 Metro Manila, Philippines",
  map: "https://maps.app.goo.gl/S9YEHD8Jjuz7kPrg6",
  // Venue photos (crossfade on the Event Details card)
  photos: Array.from({ length: 5 }, (_, i) => `/Details/venue-party (${i + 1}).png`),
}
const RECEPTION_VENUE = { ...CEREMONY_VENUE }

// ── Venue cards (Event Details section) ─────────────────────────────────────
// layout:
//   "separate" = two cards: ceremony (CEREMONY_VENUE) + reception (RECEPTION_VENUE)
//   "combined" = ONE card for both — use when ceremony and reception share a venue.
//                Name, address, map and photos come from CEREMONY_VENUE.
// badge        = small pill on the photo (e.g. "Ceremony & Reception")
// sectionLabel = label above the venue name (e.g. "Venue")
// showDate     = show the big Month / Day / Year
// showArrival  = show "Arrival: <guest arrival time>" (otherwise "At <time>")
const VENUE_CARDS = {
  layout: "combined" as "separate" | "combined",
  // Used when layout is "combined"
  combined: {
    badge: "Year-End Thanksgiving Party",
    sectionLabel: "Venue",
    showDate: true,
    showArrival: true,
    // Time rows on the card, e.g. "Program 7:00 PM | Dinner 8:00 PM"
    ceremonyLabel: "Program",
    receptionLabel: "Dinner",
    // false = show only the program time on the combined card
    showReceptionTime: true,
  },
  // Used when layout is "separate"
  ceremony: {
    show: true,
    badge: "Program",
    sectionLabel: "Venue",
    showDate: true,
    showArrival: true,
  },
  reception: {
    show: false,
    badge: "Dinner",
    sectionLabel: "Venue",
    showDate: false,
    showArrival: false,
  },
}

// ── RSVP & contact ──────────────────────────────────────────────────────────
const RSVP = {
  deadline: "December 1, 2026",
  coordinator: "the Zanicare HR & Events Committee",
  phone: "to be announced",
}
const HASHTAGS = ["#ZanicareYearEnd2026", "#ZanicareCares"] // official hashtags (Snap & Share, reminders)

// ── Attire guide (Event Details → Attire Guidelines) ────────────────────────
// SHOW = which cards to display AND their order, top to bottom.
// Each card: fill in only what you need — anything left "" or [] is hidden.
//   image:     illustration path in /public ("" = no image; any size/shape works)
//   palette:   colors for this card — "#9CAF88" or { name: "Sage", hex: "#9CAF88" }
//   ladies / gentlemen:
//     label:     e.g. "Ladies"
//     details:   the dress code text ("" hides this half of the card)
//     highlight: phrase inside details shown bold + underlined ("" for none)
// Guest dress code colors — also shown in the "Dress Code" gentle reminder
const DRESS_CODE_PALETTE: AttireColor[] = [
  { name: "Black", hex: "#111111" },
  { name: "Charcoal", hex: "#3A3A3C" },
  { name: "Silver", hex: "#C7C7CC" },
  { name: "White", hex: "#F5F5F5" },
]

// Attire groups shown in the Details section (components/sections/details.tsx).
//   show      → which groups appear, in order
//   dressCode → small line under the palette title, e.g. "Formal Attire"
//   note      → closing line shown above the card's palette ("" = default color guide note)
const NO_ROLES = [] as { role: string; attire: string }[]
const ATTIRE = {
  show: ["guests"] as AttireGroupId[],

  entourage: {
    title: "Organizing Committee",
    image: "",
    dressCode: "Black Tie",
    palette: DRESS_CODE_PALETTE,
    note: "",
    ladies: { label: "Ladies", details: "", highlight: "", roles: NO_ROLES },
    gentlemen: { label: "Gentlemen", details: "", highlight: "", roles: NO_ROLES },
  },

  family: {
    title: "Family",
    image: "",
    dressCode: "Formal Attire",
    palette: [] as AttireColor[],
    note: "",
    ladies: { label: "Ladies", details: "", highlight: "", roles: NO_ROLES },
    gentlemen: { label: "Gentlemen", details: "", highlight: "", roles: NO_ROLES },
  },

  sponsors: {
    title: "Guests of Honor",
    image: "",
    dressCode: "Black Tie",
    palette: DRESS_CODE_PALETTE,
    note: "",
    ladies: { label: "Ladies", details: "", highlight: "", roles: NO_ROLES },
    gentlemen: { label: "Gentlemen", details: "", highlight: "", roles: NO_ROLES },
  },

  guests: {
    title: "All Guests",
    image: "/Details/attire.png",
    dressCode: "Black Tie · Black, Grey & White",
    palette: DRESS_CODE_PALETTE,
    note: "Dress to shine in black, grey, white or silver — sequins and metallic accents are welcome.",
    ladies: {
      label: "Ladies",
      details: "Evening gown or elegant cocktail dress in black, grey, white or silver.",
      highlight: "black, grey, white or silver",
      roles: NO_ROLES,
    },
    gentlemen: {
      label: "Gentlemen",
      details: "Suit, tuxedo or long-sleeve barong with dark trousers.",
      highlight: "Suit, tuxedo or long-sleeve barong",
      roles: NO_ROLES,
    },
  },
}

// ── Website address (used for QR codes, link previews, table finder) ────────
// NEXT_PUBLIC_SITE_URL (env) overrides this when set.
// ⚠ check: set this to the live domain before going live
const SITE_URL = "https://zanicare-group-of-companies.digitalinvitationrsvp.com/"
// Image shown when the link is shared (Facebook, Messenger, Viber, WhatsApp, X, …).
// Ideally a 1200×630 JPG under ~300 KB — the company logo is used until a preview image is made.
// Use a NEW filename whenever the image changes — Facebook caches images by URL.
const LINK_PREVIEW_IMAGE = "/Details/LinkPreview.png"
// Square fallback (600×600) for apps that show a small square thumbnail
const LINK_PREVIEW_IMAGE_SQUARE = "/Details/LinkPreview.png"

// Site address with env override applied and no trailing slash — no need to edit
export const canonicalSiteUrl = (process.env.NEXT_PUBLIC_SITE_URL ?? SITE_URL).replace(/\/$/, "")

// ── Look & feel ─────────────────────────────────────────────────────────────
// "plain"  = no photo backgrounds anywhere (hides photo-only blocks)
// "photos" = photo backgrounds on the loader, envelope and closing section
const DISPLAY_MODE = "plain" as "photos" | "plain"

// ── Shared images ───────────────────────────────────────────────────────────
const BRAND = {
  logo: "/Details/companyLogo.png",
  monogram: "/monogram/ZANICARE DOH Certified Badge.png", // logo (loader, envelope, closing)
  coupleNameImage: "/Details/companyLogo.png", // logo (loader, envelope)
  seal: "/Details/companyLogo.png", // envelope wax seal
  // ⚠ check: still the previous wedding song — swap in a year-end party track
  backgroundMusic: "/background_music/Bruno Mars - 24k Magic (Lyrics).mp3",
}

// Event photos reused across the site (gallery, reminders, snap & share, closing).
// Placeholder for now — replace with real photos in /public when available.
const COUPLE_PHOTOS = Array.from({ length: 6 }, () => PLACEHOLDER_IMAGE)

// Envelope photos + the main cover photo — "" = none (no photos beside the letter, no cover photo
// pulled out of the envelope or shown on the home hero)
const COUPLE_PORTRAITS = {
  groom: "", // left photo in the envelope
  bride: "", // right photo in the envelope
  cover: "", // photo pulled out of the envelope + home hero cover photo
}

// No background photos — the loader and envelope sit on black silk instead
const MARQUEE_PHOTOS: string[] = []
const MARQUEE_PHOTOS_DESKTOP: string[] = []

// ── Decorations ─────────────────────────────────────────────────────────────
// Change a path here to swap it on every section at once.
// To change ONE section only, override it there, e.g. decos: { ...SECTION_DECOS, footerVine: "" }
// (shown in their own gold-and-grey colors)
const DECOR = {
  // decor-clean = the decor/ artwork with its leftover white background haze removed
  // (the originals in /deco/new/decor/ showed a faint white box on the dark pages)
  cornerTopLeft: "/deco/new/decor-clean/top-left.png",
  cornerTopRight: "/deco/new/decor-clean/top-right.png",
  cornerBottomLeft: "/deco/new/decor-clean/bottom-left.png",
  cornerBottomRight: "/deco/new/decor-clean/bottom-right.png",
  cornerOverlayTopLeft: "", // no extra corner overlay
  cornerOverlayTopRight: "",
  headerOrnament: "/deco/new/decor-clean/header.png", // small ornament above titles
  footerVine: "/deco/new/decor-clean/header.png", // ornament at section ends
  sideLeft: "", // side sprigs (none)
  sideRight: "",
}

// The four corners as one set
const CORNER_DECOS = {
  topLeft: DECOR.cornerTopLeft,
  topRight: DECOR.cornerTopRight,
  bottomLeft: DECOR.cornerBottomLeft,
  bottomRight: DECOR.cornerBottomRight,
}

// Default decoration set used by most sections (corners + ornament + vine)
const SECTION_DECOS = {
  ...CORNER_DECOS,
  headerOrnament: DECOR.headerOrnament,
  footerVine: DECOR.footerVine,
}

// One story chapter (content/site.ts → loveStory.chapters)
type StoryChapter = {
  date?: string // small caps line above the title ("" shows "Chapter 0X")
  title: string
  image?: string // photo beside the text ("" for none)
  video?: string // optional silent looping video shown instead of the photo (photo is its poster)
  imageAlt?: string // photo description ("" uses loveStory.photoAlt)
  paragraphs: string[]
  imagePosition?: string // which part of the photo stays in frame, e.g. "center 20%" (default "center 30%")
  imageAspect?: "portrait" | "landscape" // photo frame shape (default "portrait"; use "landscape" for wide group shots)
  layout?: "image-left" | "image-right" // optional — chapters alternate sides automatically
}

// Handy derived values — no need to edit
const COUPLE_LABEL = `${COMPANY_NAME} ${EVENT_NAME}`

/* ============================================================================
   SECTIONS — wording and per-section options. Values above are referenced here.
   ============================================================================ */

// Principal sponsors Google Apps Script — used by the main page and /inviteone
const SPONSORS_API = "https://script.google.com/macros/s/AKfycbyNS16z27tcH8s5fJYHbjiUZmZ5FcEIkXfrncjkmOX8DLJ0774LIDFP_H8XTd028PQ-/exec"

export const siteConfig = {
  siteUrl: SITE_URL,
  linkPreviewImage: LINK_PREVIEW_IMAGE,
  linkPreviewImageSquare: LINK_PREVIEW_IMAGE_SQUARE,
  couple: {
    ...COUPLE,
    monogram: BRAND.monogram,
    backgroundMusic: BRAND.backgroundMusic,
  },
  googleAPI:{
    messageForm: "https://docs.google.com/forms/d/e/1FAIpQLSf5Z4MWo4Afy6Eu097_x19CUc8di7xCgywVAJaJK0QtzwLemg/formResponse",   //done
    message: "https://script.google.com/macros/s/AKfycbybys0Cef_QbzHw10snleLXn246ilW_Cd1QedXqlGjEq21s2erbkJOx9dJereXueg6_/exec",//done
    guestList: "https://script.google.com/macros/s/AKfycbznq6KI1sYB2iWxhUvyM2J1nUiY8chVm4i4qOYkeDl76b4b9Y-MZJg5NUxwAIsooBXo/exec",  //d  
    guestRequest: "https://script.google.com/macros/s/AKfycbw-JDYj_Nl6CoZTbcM4cKop6lPS02TF_dwkouf891z-9ZFoMJ8FngxQhSbuBhaY4BY4/exec",  //d
    entourage: "https://script.google.com/macros/s/AKfycbz6A-ZXODY0JUAig7CRl3iKlempmvj6SmZKKcnfOPurGjLoNbIVreXLq7TQti5nZC9f/exec",  //d
    sponsors: SPONSORS_API,  //done 
    // Principal sponsors shown on /inviteone and /invitetwo (entourage section)
    sponsorsInviteOne: SPONSORS_API, // same sheet as sponsors above
    sponsorsInviteTwo: "https://script.google.com/macros/s/AKfycbyNS16z27tcH8s5fJYHbjiUZmZ5FcEIkXfrncjkmOX8DLJ0774LIDFP_H8XTd028PQ-/exec",
////google share 
    googleShare: "https://docs.google.com/spreadsheets/d/1ksBBMmCAMGI4o_JVubkaXtYHjACewv1JaOCQGqgAa4k/edit?usp=sharing",
    videoMessageForm:
      "https://docs.google.com/forms/d/e/1FAIpQLSfeGlEl4CMXWefdvCw6AOPHFS1ROku_rs-Gbofa2LkVJ0sLGQ/viewform", 
  },
  wedding: {
    date: WEDDING_DATE,
    time: TIMES.ceremony,
    venue: CEREMONY_VENUE.name,
    tagline: "invites you to our Year-End Thanksgiving Party",
    theme: "Luxury · Black, Grey & White",
    motif: "#111111, #3A3A3C, #8E8E93, #D6D6D6, #F5F5F5",
  },
  // Tap-to-open card shown before the loading screen (components/loader/OpeningCard.tsx):
  // a gate-fold card tied with a satin bow. On tap the bow unties, light runs through the gold,
  // glows out of the centre seam and the two doors swing open onto the loading screen.
  // To reuse it, drop new artwork in /public and point these paths at it.
  openingCard: {
    enabled: true, // false = skip the card and start straight on the loading screen
    // true = phones only (screens up to 767px wide); tablets/desktop go straight to the loading
    // screen and never download the card's images
    mobileOnly: true,
    hintText: "Tap to open",
    // Height of the ribbon's centre line on the card art (from the top) — the bow and ribbon
    // are placed on it, so adjust this if new card art puts the ribbon higher or lower
    ribbonY: "47.5%",
    images: {
      // Front of the card, split down the middle into the two doors (portrait, ~9:16)
      card: "/loading/card.png",
      // Bow with its tails and short band ends, transparent background (1322×1190 — knot at
      // 50% across, 29% down; band ends are 0.22× its width tall)
      bow: "/loading/ribbon.png",
      // A straight piece of the same satin band, transparent margins (1402×1122) — one copy per
      // side of the card, meeting under the bow
      band: "/loading/band.png",
      // Close-up of the knot laid over the bow's own knot, so the knot can loosen on its own
      // (same 1322×1190 canvas as `bow`, lined up with it: loops + knot only; "" to hide)
      knot: "/loading/Knot.png",
      // Gold light map for the tap shimmer, same size/framing as `card` — red = gold areas,
      // green = order the light reaches them, blue = sparkle points. "" = simple CSS shimmer
      // (the old map was drawn for the previous card art, so it is off for front-card.png)
      goldMap: "",
    },
  },
  // Opening "Save the Date" loading screen (components/loader/LoadingScreen.tsx).
  // Couple names, wedding date and ceremony details come from couple / wedding / ceremony above.
  loadingScreen: {
    // "photos" = sliding photo background + photo date cards
    // "plain"  = no images at all: soft solid background + plain date cards
    display: DISPLAY_MODE,
    // Loading screen only — overrides `display` for the loader:
    //   "photos" = photo strip + photo date cards
    //   "plain"  = invitation card wording over a soft background
    //   "poster" = logo in the middle, headline on top, event title + details below (see `poster`)
    loaderDisplay: "poster" as "photos" | "plain" | "poster",
    // Poster layout (loaderDisplay: "poster") — date and venue come from wedding / ceremony;
    // corners from `cornerDecos` below; headline from `headline`
    poster: {
      // Image in the middle of the poster (PNG/WebP; "" to hide) — the company logo
      coupleImage: BRAND.logo,
      kicker: COMPANY_NAME, // small line above the headline ("" to hide)
      // Brand lockup at the top of the poster (replaces kicker + headline + middle logo while
      // `logo` or `brands` is set): brands line, joiner, wide group logo, event title in script,
      // then "YOU'RE / Invited!" in place of the event title under it
      lockup: {
        brands: "Zanicare - AMJ - CityMed - HealBite",
        joiner: "with",
        logo: "/Details/Zanicare Group Logo.png",
        title: "Thanksgiving and Year End Party",
        invitedTop: "You're",
        invitedBottom: "Invited!",
      },
      // Short lines either side of the logo, one entry per line ([] to hide a side)
      sideLeft: [] as string[],
      sideRight: [] as string[],
      weddingOf: "cordially invites you to a night of", // line above the event title ("" to hide)
      // Event title under the logo, in capitals on two lines. joiner = small word between the
      // lines ("" = none). Leave titleTop/titleBottom "" to use couple.groomNickname / brideNickname.
      titleTop: "Thanksgiving",
      titleJoiner: "",
      titleBottom: "& Awards",
      showTime: false, // weekday · time and guest arrival lines under the date
      showVenue: true, // venue name + address under the date
      showProgress: true, // progress bar under the status line
      showPercent: true, // "0% … 100%" under the progress bar
      // Not used — the poster sits on black silk (components/loader/PosterBackdrop.tsx)
      photoVeil: 0,
      // Colors — shared with the envelope screen that follows, so the look carries over
      theme: {
        goldDark: "#8e8e93", // lettering: shadow side (silver)
        gold: "#e5e5e7", // lettering: main tone (platinum)
        goldLight: "#ffffff", // lettering: sheen (white)
        ink: "#ededee", // small capital lines (kicker, date line, venue, status)
        inkSoft: "#b9b9bd", // venue address
        washTop: "#050506", // dark vignette over the top of the silk
        washBottom: "#050506", // dark vignette over the bottom of the silk
      },
      // Optional image for the envelope paper that follows the poster (portrait image; its middle
      // band is used, lined up across the flap, front and pocket), e.g. "/loadingImages/kart.webp".
      // "" = the soft pink linen paper (loader-poster.css → "Linen envelope paper")
      envelopeTexture: "",
    },
    // How much the background photos are washed out on the "plain" loader (0 = full photos)
    plainPhotoVeil: 0.3,
    // Colors used when display is "plain"
    plainTheme: {
      background: "var(--color-welcome-bg)",
      text: "var(--color-welcome-text)",
      accent: "var(--color-welcome-gold)",
    },
    // Photo marquee behind the loader and envelope — empty: black silk instead (files live in /public)
    backgroundPhotos: MARQUEE_PHOTOS,
    backgroundPhotosDesktop: MARQUEE_PHOTOS_DESKTOP, // same marquee on screens 768px and up
    // Opening title on the loader and the envelope letter — short joining words ("of", "the") are set in script
    headline: "Year End Party", // loader: "YEAR END" in spaced gold capitals over "Party" in Playfair Display italic
    // Word between the couple's names on the loader and the envelope letter ("and", "&", "y", …)
    namesJoiner: "&",
    // {days} is replaced with the number of days left before wedding.date
    countdownText: "{days} days until the celebration",
    countdownOneDayText: "1 more day to go",
    countdownTodayText: "Tonight is the night",
    countdownPastText: "Thank you for celebrating with us",
    coupleNameImage: BRAND.coupleNameImage,
    // Shown in the three date cards (Month / Day / Year), left to right (display: "photos")
    photos: [
      "/box/box (1).webp",
      "/box/box (2).webp",
      "/box/box (3).webp",
    ],
    dateLabels: ["Month", "Day", "Year"],
    // Plain mode invitation card — classic invitation wording around the couple's names ("" to hide a line)
    plainInvite: {
      ornament: DECOR.headerOrnament,
      lineAbove: COMPANY_NAME,
      lineBelow: "requests the pleasure of your company",
    },
    showCeremonyDetails: true,
    eyebrow: "You're invited",
    message: "An evening of gratitude, recognition and year-end cheer",
    // Rotates under the progress bar while the invitation loads
    statusMessages: [
      "Polishing the silverware",
      "Setting the stage for the awards",
      "Preparing your invitation",
    ],
    durationMs: 10000,
    // Invitation envelope (components/loader/Hero.tsx) — shares display + photos with loader above
    hintText: "Tap the Seal to Open",
    enterButtonText: "View the Invitation",
    sealImage: BRAND.seal,
    // Revealed when the envelope opens: two photos side by side (placeholders for now)
    portraits: {
      groom: COUPLE_PORTRAITS.groom,
      bride: COUPLE_PORTRAITS.bride,
    },
    // Ornament tucked inside the open envelope, peeking out on both sides ("" to hide)
    envelopeFlowers: DECOR.cornerBottomLeft,
    // Main page cover photo (home hero, plain display) — placeholder for now
    coverPhoto: COUPLE_PORTRAITS.cover,
    coverPhotoAlt: COUPLE_LABEL,
    // All four corner ornaments (top two are drawn smaller in CSS; "" hides a corner)
    cornerDecos: { ...CORNER_DECOS },
    // Floral corners drawn on top of the top corner vines ("" hides one)
    cornerOverlays: {
      topLeft: DECOR.cornerOverlayTopLeft,
      topRight: DECOR.cornerOverlayTopRight,
    },
  },
  // Home hero (components/sections/hero.tsx) — the first section after the envelope.
  // Cover photo + background photos come from loadingScreen (coverPhoto / backgroundPhotos).
  homeHero: {
    // Four corner florals, sized per corner like the loader and envelope ("" hides a corner)
    decos: { ...CORNER_DECOS },
    // Thin double border around the section, under the corner florals (false hides it)
    showFrame: true,
    // Ornament tucked under the bottom of the cover photo ("" hides it)
    coverVine: DECOR.headerOrnament,
    // Wording — "" hides a line
    kicker: COMPANY_NAME, // small capitals above "You're Invited"
    eyebrow: `to our ${EVENT_NAME}`, // under the title
    tagline: "An evening of gratitude, recognition & year-end cheer",
    timeLead: "Program begins at", // before "7:00 in the evening"
    arrivalLabel: "Registration & cocktails", // before the guest arrival time
    countdownHeading: "Counting down to the celebration",
    // Faint repeating pattern behind the hero ("" hides it)
    pattern: "/patterns/hex-gold.svg",
  },
  // Couple video (components/sections/couple-video.tsx)
  coupleVideo: {
    title: "Our Year in Review",
    script: "The Zanicare Journey",
    subtitle: "A look back at the year that was",
    closingNote: "Every patient, every clinic, every milestone — thank you",
    // Your own video file in /public (e.g. "/video/year-in-review.mp4"); "" = use youtubeId
    videoSrc: "",
    // YouTube video ID or full link ("" = none yet)
    youtubeId: "",
    // Cover image shown before the video plays
    thumbnail: PLACEHOLDER_IMAGE,
    thumbnailAlt: `${COMPANY_NAME} — video cover`,
    playLabel: "Play the video",
  },
  // About Us (components/sections/love-story.tsx + StorySection) — the company story
  loveStory: {
    title: "About Us",
    subtitle: "our story of care",
    // Short opening line under the title ("" hides it)
    intro:
      "From one clinic in Molino, Bacoor to a growing network of DOH-accredited animal bite clinics — this is the story of Zanicare Group of Companies Inc., and of the people who make it possible.",
    // Small ornament above the title ("" hides it)
    headerOrnament: DECOR.headerOrnament,
    // Shown above a chapter's title when it has no date, e.g. "Chapter 03"
    chapterLabel: "Chapter",
    // Photo description used when a chapter has no imageAlt
    photoAlt: "Zanicare Animal Bite Clinic",
    // Large faint chapter number (01, 02 …) behind each chapter's text
    showChapterNumbers: true,
    // Small divider between chapters
    showChapterDividers: true,
    // Closing block: big word, hashtag, then the quote (also shown in Snap & Share)
    closingEyebrow: "", // large word on top — "" hides it
    closingHashtag: "", // hashtag under it — "" hides it
    closingQuoteLead: "", // bold first line ("" for none)
    closingQuote:
      "“Committed to bringing essential animal bite and preventive healthcare services closer to the communities we serve.”",
    closingCitation: COMPANY_NAME,
    // Four corner ornaments framing the section ("" hides a corner)
    decos: { ...CORNER_DECOS },
    // Thin double border around the section, under the corner ornaments (false hides it)
    showFrame: true,
    eucalyptusDecos: {
      topLeft: DECOR.sideLeft,
      bottomRight: DECOR.sideRight,
      timelineTop: DECOR.headerOrnament,
      sectionBottom: DECOR.headerOrnament, // ornament under the closing quote ("" hides it)
    },
    // The company story, one chapter at a time (fields: see StoryChapter above).
    // Add, remove or reorder chapters freely — sides alternate on their own.
    // A paragraph starting with "• " becomes a gold-diamond list item; "— Name" becomes a signature.
    chapters: [
      {
        date: "Who We Are",
        title: "Zanicare Group of Companies",
        image: "/images/TEAM BUILDING/teambuilding (8).jpg",
        imageAspect: "landscape",
        imageAlt: "The Zanicare team at their 3rd annual team building",
        paragraphs: [
          "Zanicare Group of Companies Inc. is a growing healthcare organization dedicated to providing accessible and reliable animal bite management and preventive healthcare services through its network of Zanicare Animal Bite Clinics.",
        ],
      },
      {
        date: "2022 · Molino, Bacoor",
        title: "Where It Began",
        image: "/images/TEAM BUILDING/teambuilding (4).jpg",
        imageAspect: "landscape",
        imagePosition: "center 40%",
        imageAlt: "Zanicare team members together at a table",
        paragraphs: [
          "The company began its operations in 2022 in Molino, Bacoor, Cavite — our very first branch, and the place where the Zanicare story started.",
        ],
      },
      {
        date: "Growing Together",
        title: "A Growing Network",
        image: "/images/TEAM BUILDING/teambuilding (1).jpg",
        imageAspect: "landscape",
        imagePosition: "center 60%",
        imageAlt: "The whole Zanicare team by the pool",
        paragraphs: [
          "Since then, Zanicare has continued to expand its presence across different communities. Through its growing network of clinics, Zanicare aims to make essential animal bite treatment and post-exposure care more accessible to patients in convenient locations.",
          "Our growing presence in areas such as Molino, Baclaran, San Dionisio, Moonwalk, Malibay, Sta. Ana, and other locations reflects our commitment to bringing essential animal bite and preventive healthcare services closer to patients.",
        ],
      },
      {
        date: "What We Do",
        title: "Care for Every Exposure",
        image: "/images/TEAM BUILDING/teambuilding (3).jpg",
        imageAlt: "The Zanicare team sharing a meal",
        paragraphs: [
          "At the heart of our work is timely, careful assistance for patients who need immediate medical attention after a potential exposure to rabies.",
          "• Animal bite treatment",
          "• Post-exposure prophylaxis (PEP)",
          "• Pre-exposure prophylaxis (PrEP)",
          "• Booster vaccination & tetanus protection",
        ],
      },
      {
        date: "Our People",
        title: "Care in Capable Hands",
        image: "/images/TEAM BUILDING/teambuilding (7).jpg",
        imageAspect: "landscape",
        imageAlt: "Zanicare staff at the team building venue",
        paragraphs: [
          "Our clinics are supported by healthcare professionals and are designed to provide timely assistance to patients who require immediate medical attention.",
          "Every patient we serve is met by someone in our Zanicare family — and tonight, we celebrate them.",
        ],
      },
      {
        date: "Mission & Vision",
        title: "What Drives Us",
        image: "/images/TEAM BUILDING/teambuilding (2).jpg",
        imageAspect: "landscape",
        imageAlt: "Zanicare leaders at sunset by the sea",
        paragraphs: [
          "Our mission: to provide accessible, timely, and dependable healthcare services through professionally managed clinics, competent healthcare personnel, and patient-centered care.",
          "Our vision: to become a trusted and accessible healthcare organization providing quality animal bite management and preventive healthcare services to communities across the Philippines.",
        ],
      },
      {
        date: "Our Values",
        title: "Care Made Accessible",
        image: "/images/TEAM BUILDING/teambuilding (5).jpg",
        imageAlt: "Zanicare team members at the venue",
        paragraphs: [
          "At Zanicare, we believe that quality healthcare should be accessible, responsive, and patient-centered.",
          "• Care — the safety and well-being of our patients first",
          "• Accessibility — essential care where it is needed",
          "• Professionalism — high standards in every clinic",
          "• Responsibility — to our patients and communities",
          "• Continuous Growth — better services, people and operations",
        ],
      },
      {
        date: "Zanicare Today",
        title: "The Story Continues",
        image: "/images/TEAM BUILDING/teambuilding (6).jpg",
        imageAlt: "The Zanicare family together",
        paragraphs: [
          "From its beginnings in Molino, Bacoor, Zanicare has developed into a growing network of animal bite clinics serving patients in different communities. The organization continues to pursue expansion while maintaining its focus on accessible healthcare, professional service, and patient care.",
          "Thank you for being part of the story. Happy Thanksgiving from the Zanicare family.",
        ],
      },
    ] as StoryChapter[],
    // Clinic showcase (components/sections/clinic-showcase.tsx): two rows of clinic photos gliding in
    // opposite directions on a tilted band, with a gold ribbon of branch names between them.
    clinicShowcase: {
      show: true,
      afterChapter: 3, // shown after this chapter (1 = first); 0 = after the last chapter
      eyebrow: "DOH Accredited",
      title: "Our Clinics",
      script: "closer to every community",
      text: "Our DOH-accredited animal bite clinics — and the new ones opening their doors — bring timely care closer to home.",
      branches: ["Baclaran", "San Dionisio", "Moonwalk", "Malibay", "Sta. Ana", "Molino", "City Med"],
      rows: [
        {
          label: "DOH Accredited",
          photos: [
            "/images/DOH CLINICS/dohclinic (1).jpeg",
            "/images/DOH CLINICS/dohclinic (2).jpeg",
            "/images/DOH CLINICS/dohclinic (3).webp",
            "/images/DOH CLINICS/dohclinic (1).webp",
            "/images/DOH CLINICS/dohclinic (4).webp",
            "/images/DOH CLINICS/dohclinic (2).webp",
            "/images/DOH CLINICS/dohclinic (3).jpeg",
          ],
        },
        {
          label: "Newly Opened",
          photos: [
            "/images/NEW CLINICS/newClinics (1).jpeg",
            "/images/NEW CLINICS/newClinics (3).jpeg",
            "/images/NEW CLINICS/newClinics (1).webp",
            "/images/NEW CLINICS/newClinics (1).jpg",
            "/images/NEW CLINICS/newClinics (2).jpeg",
            "/images/NEW CLINICS/newClinics (4).jpeg",
          ],
        },
      ],
    },
  },
  // Branch map (components/sections/branches-map.tsx) — every clinic as a glowing red pin + compact cards.
  //   Listed in the order shown on the page. Card title = "Zanicare – <name>".
  //   region: groups branches for the tabs (see `regions`) · status: small badge ("" hides it)
  //   lat / lng: pin position. ⚠ check: placed from the addresses, approximate — replace each with the
  //   clinic's exact spot (Google Maps → right-click the clinic → copy the two numbers).
  //   lat: null hides the pin (the branch still shows in the list).
  //   map: the clinic's own Google Maps link for "Directions" ("" = a Google Maps search of the address)
  branches: {
    eyebrow: "Our Branches",
    title: "Find Us",
    script: "closer to every community",
    description:
      "From our first clinic in Molino, Bacoor in 2022, Zanicare has grown into a network of more than 30 animal bite clinics across Metro Manila, Cavite, Rizal, Nueva Ecija, Isabela and Cebu — so timely, dependable care is never far from home.",
    // Summary strip above the map ("" hides one). Numbers count up when scrolled into view
    // (a trailing "+" is kept; a year like "2022" stays still)
    stats: [
      { value: "33+", label: "Branches" },
      { value: "19", label: "Cities" },
      { value: "2022", label: "Since" },
    ],
    // Tabs above the map: each zooms the map to its branches and filters the list
    regions: [
      { label: "All", match: [] as string[] },
      { label: "Metro Manila & Nearby", match: ["Metro Manila", "Cavite", "Rizal"] },
      { label: "North Luzon", match: ["Nueva Ecija", "Isabela"] },
      { label: "Cebu", match: ["Cebu"] },
    ],
    defaultRegion: 1, // tab selected when the page opens (0 = All, 1 = Metro Manila & Nearby, 2 = North Luzon, 3 = Cebu)
    labels: {
      branch: "Branch", // "Branch 01"
      directions: "Directions",
      viewOnMap: "View on map",
      noPin: "Address to follow", // a branch without an address / pin
    },
    // Closing line under the list ("" hides it)
    closing: "Wherever you are, a Zanicare clinic is ready to care for you.",
    decos: { ...CORNER_DECOS, headerOrnament: DECOR.headerOrnament },
    showFrame: true,
    list: [
      {
        name: "Molino", area: "Molino", region: "Cavite", note: "First branch · 2022", status: "Always Open",
        address: "#11 Aldar Commercial Bldg., B31 L5 Ph. 2 Adelfa St., Soldier Hills IV, Molino 6, Bacoor, Cavite 4102",
        blurb: "Where it all began — our very first clinic, opened in 2022.",
        lat: 14.397, lng: 120.98, map: "",
      },
      {
        name: "Main", area: "Las Piñas", region: "Metro Manila", note: "Main branch", status: "Always Open",
        address: "2nd Flr. 0121 F. Quirino Ave., Daniel Fajardo, Las Piñas City 1740",
        blurb: "Our main clinic in Las Piñas, open around the clock.",
        lat: 14.4795, lng: 120.979, map: "",
      },
      {
        name: "Parañaque", area: "San Dionisio", region: "Metro Manila", note: "", status: "Always Open",
        address: "0590 Quirino Ave., San Dionisio, Parañaque City 1700",
        blurb: "Round-the-clock animal bite care along Quirino Avenue.",
        lat: 14.493, lng: 120.993, map: "",
      },
      {
        name: "Kalayaan Pasay", area: "Pasay City", region: "Metro Manila", note: "", status: "Always Open",
        address: "2nd Flr. 73 West Service Rd., Brgy. 201, Pasay City",
        blurb: "Care close to home for the communities of southern Pasay.",
        lat: 14.519, lng: 121.023, map: "",
      },
      {
        name: "Guadalupe", area: "Makati City", region: "Metro Manila", note: "", status: "Always Open",
        address: "Unit 2A-1, 121 P. Burgos cor. Reposo St., Guadalupe Nuevo, Makati City 1212",
        blurb: "Dependable, patient-centered care in the heart of Makati.",
        lat: 14.5615, lng: 121.048, map: "",
      },
      {
        name: "Frisco", area: "Quezon City", region: "Metro Manila", note: "", status: "Always Open",
        address: "Unit 1-B, 55 Tolentino St., San Francisco Del Monte (Damayan), Quezon City 1104",
        blurb: "Serving San Francisco Del Monte and the neighborhoods of Quezon City.",
        lat: 14.637, lng: 121.017, map: "",
      },
      {
        name: "Marikina", area: "Marikina City", region: "Metro Manila", note: "", status: "",
        address: "356 J.P. Rizal St., Sto. Niño, Marikina City 1800",
        blurb: "Bringing timely animal bite care to Marikina.",
        lat: 14.638, lng: 121.096, map: "",
      },
      {
        name: "Caloocan", area: "Caloocan City", region: "Metro Manila", note: "", status: "",
        address: "129 Malolos Ave. cor. Katarungan St., Bagong Barrio, Caloocan City",
        blurb: "Our clinic in Bagong Barrio, caring for patients in Caloocan.",
        lat: 14.663, lng: 120.998, map: "",
      },
      {
        name: "Cebu City", area: "Cebu City", region: "Cebu", note: "", status: "Always Open",
        address: "101 N. Bacalso Ave., Sambag I, Cebu City, Cebu 6000",
        blurb: "Our clinic in Cebu City, along N. Bacalso Avenue.",
        lat: 10.301, lng: 123.8935, map: "",
      },
      {
        name: "Mandaue City", area: "Mandaue City", region: "Cebu", note: "", status: "Always Open",
        address: "607 cor. Zamora St. & Burgos St., Centro, Mandaue City, Cebu 6014",
        blurb: "Accessible, round-the-clock care in the center of Mandaue.",
        lat: 10.3275, lng: 123.9435, map: "",
      },
      {
        name: "Lapu-Lapu City", area: "Lapu-Lapu City", region: "Cebu", note: "", status: "",
        address: "2nd Flr. Unit 2, RMG Bldg., Lopez Jaena St., Poblacion, Lapu-Lapu City, Cebu 6015",
        blurb: "Extending Zanicare care to Lapu-Lapu City.",
        lat: 10.3105, lng: 123.949, map: "",
      },
      {
        name: "Bahay Toro", area: "Quezon City", region: "Metro Manila", note: "", status: "",
        address: "B1 L1 Sitio Bathala, Bahay Toro, Project 8, Quezon City",
        blurb: "Care for the families of Project 8 and Bahay Toro.",
        lat: 14.664, lng: 121.027, map: "",
      },
      {
        name: "Malibay", area: "Pasay City", region: "Metro Manila", note: "", status: "",
        address: "Unit 1C, 35 Clemente Jose St., Brgy. 166, Pasay City 1300",
        blurb: "Close-to-home care for the Malibay community.",
        lat: 14.539, lng: 121.0, map: "",
      },
      {
        name: "Sta. Ana", area: "Manila", region: "Metro Manila", note: "", status: "",
        address: "2020 Renaissance St., Brgy. 866 Zone 95, Santa Ana, Manila 1009",
        blurb: "Serving the neighborhoods of Santa Ana, Manila.",
        lat: 14.581, lng: 121.012, map: "",
      },
      {
        name: "G. Tuazon", area: "Sampaloc, Manila", region: "Metro Manila", note: "", status: "",
        address: "Unit 2D, 2/F 1920 G. Tuazon St. cor. Palawan St., Brgy. 573 Zone 056, Sampaloc, Manila 1015",
        blurb: "Our clinic along G. Tuazon Street in Sampaloc.",
        lat: 14.6135, lng: 121.001, map: "",
      },
      {
        name: "Moonwalk", area: "Parañaque City", region: "Metro Manila", note: "", status: "",
        address: "15037 E. Rodriguez Ave., San Agustin Village, Moonwalk, Parañaque 1709",
        blurb: "Animal bite care for Moonwalk and nearby villages.",
        lat: 14.487, lng: 121.004, map: "",
      },
      {
        name: "Tandang Sora", area: "Quezon City", region: "Metro Manila", note: "", status: "",
        address: "Unit 1-H, 317 Himlayan Rd. cor. Tandang Sora Ave., Pasong Tamo, Quezon City 1107",
        blurb: "Serving Pasong Tamo and the Tandang Sora area.",
        lat: 14.679, lng: 121.052, map: "",
      },
      {
        name: "Project 6", area: "Quezon City", region: "Metro Manila", note: "", status: "",
        address: "53-A Road 3 cor. Road 8, Project 6, Quezon City 1100",
        blurb: "Care close to home for Project 6 and its neighbors.",
        lat: 14.66, lng: 121.038, map: "",
      },
      {
        name: "Talon Singko", area: "Las Piñas City", region: "Metro Manila", note: "", status: "",
        address: "No. 2 F Bldg., Luna St. cor. Apollo 3, Moonwalk Subd., Talon Singko, Las Piñas 1740",
        blurb: "Our second Las Piñas clinic, in Talon Singko.",
        lat: 14.4315, lng: 120.9925, map: "",
      },
      {
        name: "Cauayan City", area: "Isabela", region: "Isabela", note: "", status: "",
        address: "045 Don Jose Canciller, District 1, Cauayan City, Isabela",
        blurb: "Bringing Zanicare care to Cauayan City, Isabela.",
        lat: 16.9275, lng: 121.7725, map: "",
      },
      {
        name: "Baclaran", area: "Parañaque City", region: "Metro Manila", note: "", status: "",
        address: "2nd Flr. Monte Victoria Bldg., 366 Quirino Ave., Baclaran, Parañaque City",
        blurb: "Serving the busy Baclaran community.",
        lat: 14.528, lng: 120.9945, map: "",
      },
      {
        name: "San Jose City", area: "Nueva Ecija", region: "Nueva Ecija", note: "", status: "",
        address: "Unit 2, Jao Bldg., Maharlika Highway, Rafael Rueda Sr. Pob., San Jose City, Nueva Ecija 3121",
        blurb: "Our clinic along Maharlika Highway in San Jose City.",
        lat: 15.7885, lng: 120.9925, map: "",
      },
      {
        name: "Pasig", area: "Pasig City", region: "Metro Manila", note: "", status: "",
        address: "8649 Sandoval Ave., Nagpayong, Pinagbuhatan, Pasig City 1602",
        blurb: "Care for the families of Pinagbuhatan, Pasig.",
        lat: 14.549, lng: 121.101, map: "",
      },
      {
        name: "Mandaluyong", area: "Mandaluyong City", region: "Metro Manila", note: "", status: "",
        address: "No. 49 Aglipay St., Pag-asa, Mandaluyong City 1550",
        blurb: "Timely animal bite care in Mandaluyong.",
        lat: 14.583, lng: 121.042, map: "",
      },
      {
        name: "San Andres", area: "Manila", region: "Metro Manila", note: "", status: "",
        address: "1629 Dagonoy St., San Andres Bukid, Manila",
        blurb: "Serving the San Andres Bukid community.",
        lat: 14.573, lng: 121.0, map: "",
      },
      {
        name: "Jhocson", area: "Sampaloc, Manila", region: "Metro Manila", note: "", status: "",
        address: "1315 F. Jhocson St., Brgy. 405, Sampaloc, Manila",
        blurb: "Close to the University Belt in Sampaloc.",
        lat: 14.6105, lng: 120.9955, map: "",
      },
      {
        name: "Tondo", area: "Manila", region: "Metro Manila", note: "", status: "",
        address: "2212 Juan Luna St., Gagalangin, Tondo, Manila",
        blurb: "Care for the families of Gagalangin, Tondo.",
        lat: 14.624, lng: 120.974, map: "",
      },
      {
        name: "Taytay", area: "Rizal", region: "Rizal", note: "", status: "",
        address: "2nd Flr. PB Zapanta Bldg., Cortez St. cor. Rizal Ave., Brgy. San Juan, Taytay, Rizal",
        blurb: "Our clinic in Taytay, Rizal.",
        lat: 14.569, lng: 121.1335, map: "",
      },
      {
        name: "Cubao", area: "Quezon City", region: "Metro Manila", note: "", status: "",
        address: "2nd Flr. 35 P.A. Bernardo St., Brgy. San Martin de Porres, Cubao, Quezon City",
        blurb: "Animal bite care in the heart of Cubao.",
        lat: 14.62, lng: 121.054, map: "",
      },
      {
        name: "Taguig", area: "Taguig City", region: "Metro Manila", note: "", status: "",
        address: "2nd Flr. Plaza Dela Rosa Bldg., Manalac Ave., Brgy. North Daang Hari, Taguig City",
        blurb: "Serving North Daang Hari and nearby Taguig.",
        lat: 14.505, lng: 121.039, map: "",
      },
      {
        name: "Pandacan", area: "Manila", region: "Metro Manila", note: "", status: "",
        address: "1802 West Zamora St. cor. Ilang-Ilang St., Pandacan, Manila",
        blurb: "Care close to home for Pandacan.",
        lat: 14.588, lng: 121.001, map: "",
      },
      {
        name: "Kamuning", area: "Quezon City", region: "Metro Manila", note: "", status: "",
        address: "No. 11 K-5th St., Brgy. Kamuning, Quezon City",
        blurb: "Our clinic in Kamuning, Quezon City.",
        lat: 14.63, lng: 121.039, map: "",
      },
      {
        name: "Santiago City", area: "Isabela", region: "Isabela", note: "", status: "",
        address: "#7 Quezon St. cor. Turingan St., Purok 2, Centro East, Santiago City, Isabela 3311",
        blurb: "Extending Zanicare care to Santiago City, Isabela.",
        lat: 16.688, lng: 121.55, map: "",
      },
    ] as {
      name: string
      area: string
      region: string
      note: string
      status: string
      address: string
      blurb: string
      lat: number | null
      lng: number | null
      map: string
    }[],
  },
  // Gallery section (components/sections/gallery.tsx)
  gallery: {
    eyebrow: "Our Moments",
    title: "Gallery",
    subtitle: "a year to remember",
    description:
      "From our first clinic in Molino to a growing family of branches — a look at the people and moments behind Zanicare.",
    footnote:
      "More pictures will be added after the party. Please check back — this gallery is still growing.",
    buttonText: "View Full Gallery",
    buttonHref: "/gallery",
    // Corner ornaments, ornament above the title and under the footnote — "" hides any of them
    decos: {
      ...CORNER_DECOS,
      headerOrnament: DECOR.headerOrnament,
      footerVine: DECOR.headerOrnament,
    },
    // Thin double border around the section and the full gallery page (false hides it)
    showFrame: true,
    // Small labels
    swipeHint: "Swipe to explore", // under the phone carousel
    lightboxSwipeHint: "Swipe to navigate", // inside the full-screen photo view
    resetZoomText: "Reset Zoom",
    // Full gallery page (/gallery)
    page: {
      backText: "Back to invitation",
      backTextShort: "Back", // narrow phones
      label: "Gallery", // top bar, beside the event name
      emptyText: "No images to display.",
    },
    // Uses COUPLE_PHOTOS (placeholders for now); replace with your own list when photos are ready.
    // text → caption used as the photo's description
    images: COUPLE_PHOTOS.map((image, i) => ({ image, text: `${COMPANY_NAME}, photo ${i + 1}` })),
  },

  // Event details section (components/sections/details.tsx)
  // Venue names, addresses, dates, times, maps and venue photos come from ceremony / reception below.
  // In reminder text, {guestsTime} and {ceremonyTime} are replaced from ceremony below.
  eventDetails: {
    eyebrow: "The Celebration",
    title: "Event Details",
    subtitle: "a night of thanks",
    description: "Where to go, when to arrive and what to wear — everything you need for our Year-End Thanksgiving Party.",
    // Verse under the description — "" hides it
    verse: "Give thanks to the Lord, for He is good; His love endures forever.",
    verseCitation: "Psalm 107:1",
    decos: { ...SECTION_DECOS },
    // Thin double border around the section (false hides it)
    showFrame: true,
    // Venue cards layout:
    //   "separate" = one card each for ceremony and reception (uses ceremony / reception below)
    //   "combined" = ONE card for both — use when ceremony and reception share a venue.
    //                Venue name, address, map and photos come from CEREMONY_VENUE;
    //                the card lists both times (ceremony.time + reception.time).
    // Set in QUICK SETUP → VENUE_CARDS
    venues: VENUE_CARDS,
    labels: {
      arrival: "Arrival",
      at: "At",
      scanForDirections: "Scan for directions",
      getDirections: "Get Directions",
      copyAddress: "Copy Address",
      copied: "Copied!",
    },
    // Cards, colors, images and which groups show → QUICK SETUP → ATTIRE
    attire: {
      title: "Attire Guidelines",
      description: "Our theme is a luxurious evening in black, grey and white. Dress to impress — it's our night to shine.",
      // Shown above a card's palette
      paletteTitle: "Dress Code Palette",
      paletteSubtitle: "", // script line under the palette title — "" hides it
      colorGuideTitle: "Color Guide",
      colorGuideNote: "Choose any shade from the palette below. Sequins, satin and metallic silver accents are all welcome.",
      // Order and visibility come from ATTIRE.show (skips blanks, typos and repeats)
      groups: ATTIRE.show
        .filter((id, i, list) => ["entourage", "family", "sponsors", "guests"].includes(id) && list.indexOf(id) === i)
        .map((id) => ({ id, ...ATTIRE[id] })),
      // Shared dress code palette (used by the "Strictly Formal" reminder)
      palette: DRESS_CODE_PALETTE,
    },
    // "What to Expect" program card (between the venue card and the attire guidelines)
    // icon: "registration" | "prayer" | "welcome" | "founder" | "review" | "dinner"
    //       | "awards" | "raffle" | "performance" | "closing"
    // show: false hides a row without deleting it
    program: {
      show: true,
      title: "What to Expect",
      subtitle: "the evening's program",
      description:
        "An evening of gratitude, good food and celebration — here is how the night will unfold.",
      footnote: "Times are approximate and may shift slightly on the night.",
      items: [
        {
          show: true,
          time: TIMES.guestArrival,
          title: "Registration & Cocktails",
          description: "Sign in, claim your raffle stub and enjoy welcome drinks while you find your table.",
          icon: "registration" as ProgramIconName,
        },
        {
          show: true,
          time: TIMES.ceremony,
          title: "Invocation & National Anthem",
          description: "We open the evening in prayer, giving thanks for a blessed year.",
          icon: "prayer" as ProgramIconName,
        },
        {
          show: true,
          time: "7:10 PM",
          title: "Welcome Remarks",
          description: "Our hosts welcome the Zanicare family, partners and special guests.",
          icon: "welcome" as ProgramIconName,
        },
        {
          show: true,
          time: "7:20 PM",
          title: "Message from the Founder",
          description: "A heartfelt word of thanks from our Founder on the year we built together.",
          icon: "founder" as ProgramIconName,
        },
        {
          show: true,
          time: "7:40 PM",
          title: "Year in Review",
          description: "A look back at our milestones, new branches and the people who made them happen.",
          icon: "review" as ProgramIconName,
        },
        {
          show: true,
          time: TIMES.reception,
          title: "Thanksgiving Dinner",
          description: "Dinner is served — time to relax, share stories and celebrate with your team.",
          icon: "dinner" as ProgramIconName,
        },
        {
          show: true,
          time: "8:45 PM",
          title: "Awards & Recognition",
          description:
            "Honoring our loyal and outstanding people — Service Awards, Best Branch, Employee of the Year and special citations.",
          icon: "awards" as ProgramIconName,
        },
        {
          show: true,
          time: "9:30 PM",
          title: "Year-End Raffle & Games",
          description: "Raffle draws, parlor games and year-end surprises throughout the night.",
          icon: "raffle" as ProgramIconName,
        },
        {
          show: true,
          time: "10:15 PM",
          title: "Performances & Dance",
          description: "Branch presentations, live music and an open dance floor.",
          icon: "performance" as ProgramIconName,
        },
        {
          show: true,
          time: "10:45 PM",
          title: "Grand Raffle Draw",
          description: "The biggest prizes of the night — be in the room to win!",
          icon: "raffle" as ProgramIconName,
        },
        {
          show: true,
          time: "11:00 PM",
          title: "Closing Remarks & Group Photo",
          description: "A final thank-you and one big photo of the Zanicare family.",
          icon: "closing" as ProgramIconName,
        },
      ],
    },
    reminders: {
      title: "Gentle Reminders",
      description: "A few kind notes so everyone can enjoy a smooth, memorable evening together.",
      // Keep this short — everything else lives in the FAQ (faq.items)
      // icon: "registration" | "dress" | "raffle" | "share" (small icon above each title)
      // showPalette: shows the dress code palette after the first paragraph
      items: [
        {
          title: "Arrive Early",
          icon: "registration" as ReminderIconName,
          showPalette: false,
          paragraphs: [
            "Registration and cocktails open at {guestsTime}. Arriving early gives you time to sign in, claim your raffle stub and settle at your table before the program begins at {ceremonyTime}.",
            "Kindly bring your company ID — it is needed at registration.",
          ],
        },
        {
          title: "Dress the Part",
          icon: "dress" as ReminderIconName,
          showPalette: true,
          paragraphs: [
            "Black tie in black, grey, white or silver. Ladies: evening gown or elegant cocktail dress. Gentlemen: suit, tuxedo or long-sleeve barong.",
            "We kindly ask that you skip casual wear, shorts and slippers for the night.",
          ],
        },
        {
          title: "Stay Until the Last Draw",
          icon: "raffle" as ReminderIconName,
          showPalette: false,
          paragraphs: [
            "Awards, raffle prizes and the Grand Raffle Draw run until the very end of the night. Winners must be present when their name is called, so please stay and cheer on your colleagues.",
          ],
        },
        {
          title: "Capture & Share",
          icon: "share" as ReminderIconName,
          showPalette: false,
          paragraphs: [
            `Snap away and share your favorite moments using ${HASHTAGS.join(" and ")}. During the prayer, the Founder's message and the awards, we kindly ask that phones be kept on silent.`,
          ],
        },
      ],
    },
  },
  // Program of the evening (components/sections/wedding-timeline.tsx)
  weddingTimeline: {
    kicker: "An evening of gratitude",
    title: "Program",
    subtitle: "the night's itinerary",
    description:
      "From registration to the last raffle draw, here is how we will spend the evening together.",
    // "" hides the quote
    quote: "",
    quoteCitation: "",
    // Optional corner decorations — leave "" to hide
    decos: {
      topLeft: "",
      topRight: "",
      bottomLeft: "",
      bottomRight: "",
    },
    // Each item — shown top to bottom in this order (move a block to reorder):
    //   show:     true = display on the site, false = hide it (still kept here to edit later)
    //   time:     shown above the title
    //   location: text shown under the title; {ceremony} / {reception} are replaced
    //             with the venue name ("" to hide)
    //   image:    illustration from /public; "" to use the icon instead
    //   icon:     fallback icon when there is no image —
    //             "arrival" | "guests" | "rings" | "departure" | "cocktail" | "fireworks" | "dance"
    //   description: not shown on the site (kept only as a note)
    events: [
      {
        show: true,
        time: "6:00 PM",
        title: "Registration & Cocktails",
        description: "Guests arrive, register and receive their raffle stubs.",
        location: "",
        image: "",
        icon: "guests" as TimelineIconName,
      },
      {
        show: true,
        time: "7:00 PM",
        title: "Opening Prayer & National Anthem",
        description: "The program begins.",
        location: "",
        image: "",
        icon: "arrival" as TimelineIconName,
      },
      {
        show: true,
        time: "7:15 PM",
        title: "Welcome Remarks",
        description: "A message from the President & CEO.",
        location: "",
        image: "",
        icon: "fireworks" as TimelineIconName,
      },
      {
        show: true,
        time: "7:30 PM",
        title: "Year in Review",
        description: "A look back at the year: milestones, new branches and our growing Zanicare family.",
        location: "",
        image: "",
        icon: "guests" as TimelineIconName,
      },
      {
        show: true,
        time: "8:00 PM",
        title: "Thanksgiving Dinner",
        description: "Dinner is served.",
        location: "",
        image: "",
        icon: "cocktail" as TimelineIconName,
      },
      {
        show: true,
        time: "8:45 PM",
        title: "Awards & Recognition",
        description:
          "Loyalty awards, Best Branch, Outstanding Healthcare Professional, Employee of the Year and special citations.",
        location: "",
        image: "",
        icon: "fireworks" as TimelineIconName,
      },
      {
        show: true,
        time: "9:30 PM",
        title: "Year-End Raffle & Games",
        description: "Raffle draws, parlor games and year-end surprises.",
        location: "",
        image: "",
        icon: "fireworks" as TimelineIconName,
      },
      {
        show: true,
        time: "10:15 PM",
        title: "Performances & Dance",
        description: "Branch presentations, music and dancing.",
        location: "",
        image: "",
        icon: "dance" as TimelineIconName,
      },
      {
        show: true,
        time: "11:00 PM",
        title: "Closing Remarks & Group Photo",
        description: "Thank you for celebrating with us!",
        location: "",
        image: "",
        icon: "departure" as TimelineIconName,
      },
    ],
  },
  // Branch representatives (components/sections/entourage.tsx)
  // Names come from the Google Sheet's "Entourage" tab (or the dashboard), one row per person:
  //   Name         → the person's full name
  //   RoleCategory → the BRANCH they represent, written like the branch list above
  //                  ("Molino", "Main", "Cebu City"… — "Zanicare", "Branch" and the area also match),
  //                  or one of leadershipCategories below for the head office / leadership row
  //   RoleTitle    → their position, e.g. "Branch Manager", "Head Nurse", "Branch Physician"
  // Shown like the classic entourage: one arch card, a heading per group, names in two columns.
  // Group order: Leadership first, then branches in branches.list order, then anything else as typed.
  entourage: {
    eyebrow: "The Zanicare Family",
    title: "Our People",
    subtitle: "the hearts behind every clinic",
    description:
      "From the officers who steer our vision to the nurses and staff who welcome every patient, these are the people who make Zanicare what it is. Tonight, we honor each one of them.",
    // Heading of the first group (rows with any of leadershipCategories go here)
    leadershipTitle: "Leadership",
    leadershipCategories: ["Leadership", "Founder", "Executive", "Executives", "Management", "Head Office"],
    // Order of the list, highest rank first. Each tier gathers the sheet's RoleCategory values in `roles`
    // (case, dashes and spacing don't matter) under one heading, people sorted by the order of `roles`.
    // showRole: print each person's role under their name (for tiers mixing several roles).
    // Roles not listed here follow after, as their own groups.
    hierarchy: [
      {
        title: "Executive Officers",
        roles: ["President", "Medical Director", "Treasurer", "Corporate Secretary"],
        showRole: true,
      },
      {
        title: "Department Heads",
        roles: ["Quality Assurance Head", "Finance Head", "Procurement Head", "Human Resources Head"],
        showRole: true,
      },
      { title: "Medical Consultants", roles: ["Medical Consultant", "Medical Consultants"], showRole: false },
      { title: "Investors", roles: ["Investors", "Investor"], showRole: false },
      { title: "Admin Assistants", roles: ["Admin Assistant", "Admin Assistants"], showRole: false },
      { title: "Nurses", roles: ["Regular Employee – Nurse", "Nurse", "Nurses"], showRole: false },
      { title: "Admin Staff", roles: ["Regular Employee – Admin", "Admin", "Admin Staff"], showRole: false },
      { title: "Reliever Nurses", roles: ["Reliever Nurse", "Reliever Nurses"], showRole: false },
      { title: "Reliever Admin Staff", roles: ["Reliever Admin", "Reliever Admins"], showRole: false },
    ] as { title: string; roles: string[]; showRole: boolean }[],
    emptyText: "Our honorees will be announced soon.",
    loadingText: "Gathering the Zanicare family…",
    retryingText: "Still gathering the Zanicare family. One moment…",
    errorText: "We couldn't load our people just now.",
    retryText: "Try again",
    // Corner florals (sized per corner like the loader), sprig above the title — "" hides any of them
    decos: {
      ...CORNER_DECOS,
      headerOrnament: DECOR.headerOrnament,
      footerVine: DECOR.headerOrnament,
    },
    // Thin double border around the section (false hides it)
    showFrame: true,
  },
  // RSVP / guest list (components/sections/guest-list.tsx) — card, search, RSVP form and all modals.
  // Placeholders in curly braces are filled in automatically: {name}, {count}, {n}.
  // The RSVP deadline itself comes from details.rsvp.deadline.
  rsvp: {
    headerOrnament: DECOR.headerOrnament, // "" to hide
    title: "RSVP",
    script: "Will you join us",
    intro: "A night of gratitude, awards and year-end cheer awaits. Kindly confirm your seat so we can prepare a warm welcome for you.",
    deadlineLabel: "RSVP Deadline",
    openButton: "Reserve My Seat",
    search: {
      title: "RSVP",
      script: "find your name",
      placeholder: "Type your first or last name",
      loading: "Opening the guest list — this will only take a moment.",
      refine: "Keep typing to narrow it down",
      notFoundTitle: "Can't find your name?",
      notFoundText: "It may be listed a little differently. Try your surname, or send us a request and the committee will save you a seat.",
      requestButton: "Request a Seat",
    },
    invite: {
      title: "You're Invited",
      scriptFallback: "to our celebration",
      greeting: "Welcome, {name}! It would mean so much to celebrate this year with you at our Year-End Thanksgiving Party.",
      seats: "We've set aside {count} for you.",
      seatSingular: "seat",
      seatPlural: "seats",
    },
    responded: {
      title: "You're All Set",
      text: "Your RSVP is already with us. Thank you — we can't wait to see you on the night!",
      attending: "See You There!",
      declined: "Unable to Attend",
      guestCountLabel: "Seats Reserved",
      closeButton: "Close",
    },
    form: {
      nameLabel: "Full Name *",
      namePlaceholder: "Enter your full name",
      optional: "(Optional)",
      emailLabel: "Email Address",
      emailPlaceholder: "your.email@example.com",
      attendLabel: "Will you be joining us? *",
      yes: "Count me in",
      no: "Regretfully, no",
      companionsLabel: "Who's Coming With You?",
      companionsHint: "Tell us who will fill your {count} additional {guests} so we can welcome them by name",
      guestSingular: "guest",
      guestPlural: "guests",
      companionTitle: "Guest {n}",
      companionNameLabel: "Full Name",
      companionNamePlaceholder: "Name of guest {n}",
      relationshipLabel: "Relationship with {name}",
      relationshipFallbackName: "Primary Guest",
      relationshipPlaceholder: "e.g., Spouse, Friend, Child, Parent",
      // One-tap relationship choices shown under the relationship field
      relationshipOptions: ["Spouse", "Partner", "Child", "Parent", "Sibling", "Friend"],
      companionProgress: "Guest {n} of {total}",
      companionsAdded: "{done} of {total} added",
      prevButton: "Back",
      nextButton: "Next guest",
      phoneLabel: "Phone Number",
      phonePlaceholder: "09XX XXX XXXX",
      phoneNote: "Used only by the organizing committee for event-day updates — never shown to other guests.",
      submitting: "Saving your seat...",
      submit: "Confirm My RSVP",
    },
    phoneAlert: {
      title: "One more detail",
      paragraphs: [
        "Please add a mobile number so the committee can reach you with seating, schedule or raffle updates on the day.",
        "It stays private — it won't appear on this invitation and is never shared with other guests.",
      ],
      button: "Add my number",
    },
    // Shown when someone submits a name that has already confirmed
    alreadyConfirmed: {
      title: "You're Already Confirmed",
      eyebrow: "Welcome back",
      text: "Your RSVP is already with us — here's what we have on file.",
      statusLabel: "Response",
      statusValue: "Attending",
      seatsLabel: "Seats reserved",
      companionsLabel: "Coming with you",
      confirmedOnLabel: "Confirmed on",
      question: "Plans changed? Just let us know below — no worries at all.",
      keepButton: "Keep my RSVP",
      cancelButton: "I can no longer attend",
      cancelling: "Updating...",
    },
    success: {
      title: "Your Seat Is Saved",
      declinedTitle: "Thank You for Letting Us Know",
      attending: "Wonderful! We can't wait to celebrate, give thanks and cheer on this year's awardees with you.",
      declined: "You'll be missed — thank you for being part of the Zanicare family this year. Happy Thanksgiving!",
      neutral: "Thank you for your response!",
      messagePrompt:
        "While you're here, leave a thanksgiving message for the Zanicare family — your words will be part of our year-end keepsake.",
      messageButton: "Write a Message",
      laterButton: "Maybe later",
    },
    request: {
      title: "Request",
      script: "a seat",
      greetingNamed: "Hi {name}! Send us your details and the organizing committee will get back to you.",
      greeting: "Send us your details and the organizing committee will get back to you.",
      optional: "(Optional)",
      nameLabel: "Full Name *",
      namePlaceholder: "Enter your full name",
      emailLabel: "Email Address",
      emailPlaceholder: "your.email@example.com",
      phoneLabel: "Phone Number",
      phonePlaceholder: "+63 912 345 6789",
      guestsLabel: "Number of Guests *",
      guestsPlaceholder: "How many guests?",
      messageLabel: "Message",
      messagePlaceholder: "Your branch or department, or how you're connected to Zanicare",
      submitting: "Sending...",
      submit: "Send Request",
      sentTitle: "Request Sent",
      sentText: "Thank you — your request is with the committee",
      sentSubtext: "We'll reach out soon to confirm your seat",
      autoClose: "This will close automatically",
    },
    messages: {
      thankYou: "Thank you for your response!",
      requestSubmitted: "Request sent! The committee will get back to you soon.",
      loadFailed: "We couldn't open the guest list just now.",
      selectAttendance: "Please let us know if you can join us",
      nameRequired: "Please enter your full name",
      invalidEmail: "Please enter a valid email address",
      requestFailed: "Failed to submit request. Please try again.",
      submitFailed: "We couldn't save your RSVP. Please check your connection and try again.",
    },
  },
  // Messages wall (components/sections/message-wall-display.tsx)
  // Small decorations on each message card — leave "" to hide
  messageWall: {
    cardDecos: {
      topRight: DECOR.cornerTopRight, // sprig tucked in the card's top-right corner
      bottomLeft: "", // e.g. DECOR.cornerBottomLeft (sits behind the text — keep it subtle)
    },
  },
  // Book of guests (components/sections/book-of-guests.tsx) — confirmed guests come from the guest list API.
  bookOfGuests: {
    title: "Book of Guests",
    subtitle: "joining the celebration",
    description:
      "Meet the colleagues, partners and friends joining us in celebration — your presence makes the night truly special.",
    statsEyebrow: "Year-End Thanksgiving Party",
    guestSingular: "Guest",
    guestPlural: "Guests",
    statsCaption: "Celebrating With Us",
    rsvpSingular: "RSVP",
    rsvpPlural: "RSVPs",
    partySingular: "Party",
    partyPlural: "Parties",
    thankYou: "Thank you for confirming your RSVP — we can't wait to celebrate with you.",
    updatedLabel: "Updated",
    refreshLabel: "Refresh guest counts",
    listEyebrow: "Joining Us",
    listDescription: "Colleagues, partners and friends who have confirmed their seat",
    vipLabel: "VIP",
    noTable: "No Table Yet",
    tableLabel: "Table {table}",
    partyLabel: "In party",
    companionsLabel: "Coming with",
    prevLabel: "Previous guests",
    nextLabel: "Next guests",
    pageLabel: "Show page {n}",
    // Shown when a guest has more than 4 companions
    companionsMore: "+{count} more",
    companionsLess: "Show less",
    confirmedLabel: "Confirmed",
    emptyTitle: "Guest list updating",
    emptyText: "Confirmed guests will appear here as RSVPs come in — be one of the first.",
    // How many guest cards show per page (pages turn every few seconds — paused while
    // someone is reading or after they use the arrows; swipe works on phones)
    cardsPerView: 4,
    // Corner florals (sized per corner like the loader), sprig above the title and
    // sprig at the end of the section — "" hides any of them.
    // On the invitation page Book of Guests shows the top corners and FAQ the bottom ones.
    decos: {
      ...CORNER_DECOS,
      headerOrnament: DECOR.headerOrnament,
      footerVine: DECOR.headerOrnament,
    },
    // Thin double border around the section (false hides it)
    showFrame: true,
  },
  // FAQ (components/sections/faq.tsx)
  // In answers you can use:
  //   {deadline}    → details.rsvp.deadline
  //   {coordinator} → details.rsvp.coordinator
  //   {contact}     → " at <phone>" when details.rsvp.phone is set (empty while "to be announced")
  //   [link text](#section-id) → a link that smoothly scrolls to that section
  //   A blank line (\n\n) starts a new paragraph; lines starting with "• " show as a bulleted list
  faq: {
    eyebrow: "Before the Night",
    title: "Frequently Asked Questions",
    subtitle: "everything you need to know",
    description:
      "Quick answers so you can simply arrive, celebrate and enjoy the evening with the Zanicare family.",
    // Corner florals (sized per corner like the loader), sprig above the title and
    // sprig at the end of the section — "" hides any of them.
    // On the invitation page Book of Guests shows the top corners and FAQ the bottom ones.
    decos: {
      ...CORNER_DECOS,
      headerOrnament: DECOR.headerOrnament,
      footerVine: DECOR.headerOrnament,
    },
    // Thin double border around the section (false hides it)
    showFrame: true,
    // Shown at the bottom of the FAQ card — "" hides it ({coordinator} / {contact} are filled in)
    contactTitle: "Still have a question?",
    contactNote: "We're happy to help. Please reach out to {coordinator}{contact}.",
    // Answers: blank line = new paragraph, "• " = bullet, [label](#section) or [label](https://…) = link.
    // {deadline} {coordinator} {contact} {groom} {bride} are filled in automatically.
    items: [
      {
        question: "When and where is the party?",
        answer: `Our Year-End Thanksgiving Party is on ${WEDDING_DAY}, ${WEDDING_DATE} at ${CEREMONY_VENUE.name}, ${CEREMONY_VENUE.address}.\n\n• Registration & cocktails: ${TIMES.guestArrival}\n• Program begins: ${TIMES.ceremony}\n• Thanksgiving dinner: ${TIMES.reception}\n\n[Open in Google Maps](${CEREMONY_VENUE.map})`,
      },
      {
        question: "What time should I arrive?",
        answer: `Please arrive by ${TIMES.guestArrival} so you have time to register, claim your raffle stub and find your table. The program begins promptly at ${TIMES.ceremony}.\n\nOrganizing committee members are kindly requested to be at the venue by ${TIMES.entourageCall}.`,
      },
      {
        question: "What happens during the evening?",
        answer:
          "It's a night of thanksgiving and celebration. You can look forward to:\n\n• A message from our Founder and a look back at the year\n• Thanksgiving dinner with your colleagues\n• Awards & recognition for our outstanding people and branches\n• Year-end raffle, games and the Grand Raffle Draw\n• Performances, music and dancing\n\nSee the full [program](#details) in Event Details.",
      },
      {
        question: "How do I RSVP?",
        answer:
          "Use the [RSVP](#guest-list) on this invitation: search for your name, choose whether you can join us, and confirm your seat.\n\nKindly respond by {deadline}.",
      },
      {
        question: "What should I wear?",
        answer:
          "Our theme is a black-tie evening in black, grey, white and silver. See the [attire guide](#details) in Event Details.\n\n• Ladies: evening gown or elegant cocktail dress\n• Gentlemen: suit, tuxedo or long-sleeve barong with dark trousers\n\nKindly skip casual wear, shorts and slippers for the night.",
      },
      {
        question: "Can I bring a plus one?",
        answer:
          "This is a company celebration for Zanicare employees, partners and invited guests, so we can only accommodate the seats reserved under your name. You'll see how many when you RSVP.",
      },
      {
        question: "What should I bring?",
        answer:
          "Just your company ID — it's needed at registration. Your raffle stub will be handed to you at the registration table.",
      },
      {
        question: "How do the awards and raffle work?",
        answer:
          "We'll honor our loyal and outstanding people — including Service Awards, Best Branch and Employee of the Year — followed by the year-end raffle and the Grand Raffle Draw.\n\nWinners must be present when their name is called, so please stay until the very end of the program.",
      },
      {
        question: "May we choose our own seats?",
        answer:
          "Tables are arranged by branch and department. Kindly take the seat reserved for you — you can look it up on the [table finder](/table) on the night.",
      },
      {
        question: "Is there parking at the venue?",
        answer: `Yes, ${CEREMONY_VENUE.name} has parking for guests. Arriving a little early gives you time to park and register comfortably.`,
      },
      {
        question: "Can I take photos and videos?",
        answer: `Absolutely — capture all the fun! Upload your photos through [Snap & Share](#snap-share) and use our official hashtag, ${HASHTAGS[0]}.\n\nWe kindly ask that phones be on silent during the prayer, the Founder's message and the awards.`,
      },
      {
        question: "What if I have dietary restrictions or allergies?",
        answer:
          "Please let {coordinator} know before {deadline} so the kitchen can prepare something you'll enjoy.",
      },
      {
        question: "What if my plans change after I RSVP?",
        answer:
          "No worries — search for your name in the [RSVP](#guest-list) again and choose \"I can no longer attend\", or let {coordinator} know as soon as possible so we can offer your seat to someone else.",
      },
    ],
  },
  // Gift guide (components/sections/registry.tsx). The signature uses couple.groomNickname / brideNickname.
  registry: {
    eyebrow: "A Token of Love",
    title: "Gift Guide",
    subtitle: "with gratitude",
    description: "Having you celebrate with us is the greatest gift of all.",
    paragraphs: [
      // One line per verse line (registry.tsx keeps the line breaks)
      "With all that we have, we've been truly blessed.\nYour presence and prayers are all that we request.\nBut if you desire to give nonetheless,\nA monetary gift is one we highly suggest.",
      "Should you wish to bless us as we begin our life together, you may send a gift through either of the accounts below.",
    ],
    thankYou: "Thank you for your love, your prayers and your generosity.", // "" hides the line
    signOff: "With joyful hearts,",
    signature: "{groom} & {bride}", // "" falls back to "{groom} & {bride}" nicknames
    // Colors — any CSS color or a palette token from app/globals.css (e.g. "var(--color-motif-accent)")
    // Light motif: white / sage surfaces, charcoal text, yellow + orange accents; burgundy for buttons only
    colors: {
      title: "var(--color-welcome-text)",                                              // account names, numbers
      script: "color-mix(in srgb, var(--color-motif-silver) 62%, #1F2618)",            // drop cap, couple signature (deep sage)
      eyebrow: "color-mix(in srgb, var(--color-motif-silver) 62%, #1F2618)",           // small caps labels, icons (deep sage)
      body: "var(--color-welcome-text)",                                               // paragraphs
      soft: "color-mix(in srgb, var(--color-welcome-text) 75%, white)",                // "With joyful hearts," and secondary text
      card: "#FFFFFF",                                                                 // letter card
      cardEdge: "color-mix(in srgb, var(--color-motif-silver) 55%, transparent)",      // card borders (sage)
      accountCard: "color-mix(in srgb, var(--color-motif-silver) 10%, white)",         // e-gift account card (sage mist)
      button: "linear-gradient(180deg, #2C2C2E 0%, #111111 55%, #000000 100%)",        // selected tab, Save QR, close
      line: "var(--color-motif-silver)",                                               // sage dividers
      glow: "color-mix(in srgb, #F2C230 30%, transparent)",                            // soft yellow fill (account without a QR)
      accent: "#E8833A",                                                               // orange: heart, "&"
      highlight: "#F2C230",                                                            // yellow: seal ring, diamonds
      background: "var(--color-motif-cream)",                                          // section background
    },
    // E-gift accounts — optional, as many as you like.
    //   showAccounts: false hides the whole block
    //   show:  false hides one account
    //   qr:    "/QR/BPI.jpg" to show a QR image, or "" when you have no QR (card shows name + number only).
    //          Guests can tap the QR to enlarge it and save it with the "Save QR" button.
    //   accountNumber: shown under the name (display only)
    //   With 2+ visible accounts, guests switch between them with a toggle; each shows its QR and a "Save QR" button
    // Both QRs checked by decoding (2026-11-18): BPI.jpg → BPI (BOPIPHMM), "Vv";
    // Gcash.jpg → GCash (GXCHPHM2), "BE*****T D.". Both are InstaPay QRs.
    showAccounts: true,
    accountsTitle: "Send an E-Gift",
    accountsNote: "Scan with any banking or e-wallet app via InstaPay. Tap the QR to enlarge.",
    saveQrLabel: "Save QR",
    zoomNote: "Open your banking or e-wallet app, choose “Scan QR”, and scan this code — or save it and upload it from your gallery.",
    accounts: [
      { show: true, label: "GCash", accountName: "BE*****T D.", accountNumber: "0909 906 ****", qr: "/QR/Gcash.jpg" },
      { show: true, label: "BPI", accountName: "VV", accountNumber: "**** **** **** **006", qr: "/QR/BPI.jpg" },
    ] as { show: boolean; label: string; accountName: string; accountNumber: string; qr: string }[],
    // Leave any path "" to hide that decoration
    decos: { ...SECTION_DECOS },
  },
  // Table finder page (/table — components/table-finder.tsx)
  tableFinder: {
    decos: { ...CORNER_DECOS },
    // "Find Your Table" QR card on the dashboard (components/table-finder-qr-card.tsx)
    // {couple} → "Groom & Bride" nicknames. "" hides a line or image.
    qrCard: {
      coupleNameImage: BRAND.coupleNameImage, // unused: the card sets the names in type like the loader
      coupleImage: BRAND.logo, // company logo beside the text
      eyebrow: "Zanicare Year-End Thanksgiving Party",
      title: "Find Your Table",
      script: "please be seated",
      description:
        "Place this code at the entrance. Guests scan it, search their name, and go straight to their table.",
      scanLabel: "Scan to find your table",
      buttonText: "Download QR",
      downloadNote: "Saves a print-ready PNG for signs and table cards.",
      previewText: "Preview seating page",
    },
  },
  // Entourage proposal pages (components/proposal-page.tsx)
  // Text placeholders: {name} = invitee, {role} = role title, {groom} / {bride} = nicknames.
  // Each invitation type has its own wording:
  //   party      → Best Man, Maid/Matron of Honor, Bridesmaid, Groomsman, Little Bride, secondary sponsors
  //   sponsor    → Principal Sponsors (Ninong / Ninang)
  //   bearer     → Ring / Coin / Bible / Herald Bearer
  //   flowerGirl → Flower Girl
  // A list ([...]) shows one paragraph per line; "" or [] hides that part.
  proposal: {
    decos: { ...CORNER_DECOS },
    coupleNameImage: BRAND.coupleNameImage, // unused: names are set in type like the loader
    coupleImage: BRAND.logo, // company logo above the question
    ornament: DECOR.headerOrnament, // small sprig at the top of the card; "" to hide
    // Eucalyptus sprigs on either side of the couple name; "" to hide one
    nameDecos: { left: DECOR.sideLeft, right: DECOR.sideRight },
    showDate: true, // big date under the couple name (Month / Day / Day-number / Time / Year)
    // Use "Maid of Honor" for unmarried, "Matron of Honor" for married
    honorAttendant: "Matron of Honor" as "Matron of Honor" | "Maid of Honor",
    roles: proposalRoleDefinitions,
    roleIdAliases: proposalRoleIdAliases,
    // Shared labels used on every invitation.
    // Placeholders: {name} invitee, {role} role title, {groom} / {bride} nicknames.
    labels: {
      headerEyebrow: "A Personal Invitation",
      headerScript: "written just for you",
      saveTheDate: "Save the Date",
      roleOffered: "Your role",
      preparedFor: "Written for",
      askQuestion: "Will you be our",
      registeredName: "Your name on our list",
      returnButton: "Return to Our Wedding Page",
      saving: "Saving...",
      sending: "Sending...",
      sendButton: "Send My Response",
      goBack: "Go Back",
      saveError: "We couldn't save your response just now. Please try again.",
      // Shown when the invite link has no name and the guest says yes
      nameForm: {
        title: "You Said Yes",
        script: "our hearts are full",
        subheader: "Just one little thing",
        body: "We're so happy to have you with us! How would you like your name to appear on our invitation and guest list?",
        label: "Your Preferred Name",
        placeholder: "e.g. Tita Maria Clara / Mr. James Reyes",
        required: "Please type your preferred name so we can include you properly.",
        submit: "Confirm My Name",
        cancel: "Cancel",
      },
    },
    copy: {
      party: {
        greeting: "Dear",
        intro: [
          "Before anything else, we wanted you to hear this from us personally.",
          "We're getting married! After everything we've shared so far, we're ready to begin the next chapter of our lives together, and we couldn't wait to tell you.",
        ],
        body: [
          "This little letter isn't a general invitation. We wrote it with you in mind.",
          "When we pictured our wedding day, we thought about the people who have walked with us, laughed with us and cheered us on. Your name came up right away.",
          "We would love for you to be more than a guest. We'd love you right beside us, sharing the nerves, the joy, the happy tears and every memory we'll keep from that day.",
        ],
        askLead: "So, with all our hearts, we'd like to ask you",
        askNote:
          "We know it takes a bit of your time and effort, and we don't take that lightly. More than anything, we just want you there with us, celebrating this moment together.",
        yesButton: "Yes, I'd Love To!",
        noButton: "I Can't, But With Love",
        signOff: "With all our love,",
        yes: {
          title: "You Said Yes",
          script: "thank you",
          subheader: "You just made our day",
          roleLine: "Standing with us as our {role}",
          body: [
            "Thank you, {name}. Knowing you'll be right beside us makes our wedding feel even more like us. We can't wait to celebrate, laugh, and make memories with you. We'll be in touch soon with all the little details!",
          ],
          signOff: "With so much love,",
        },
        no: {
          title: "Thank You",
          script: "for telling us",
          subheader: "We completely understand",
          body: [
            "Thank you for taking the time to read our letter and think it over. There are truly no hard feelings. Whether you're beside us or cheering from wherever you are, we're grateful to have you in our lives.",
          ],
        },
        sent: {
          title: "Response Sent",
          script: "with love",
          subheader: "Your reply has reached us",
          body: [
            "We hope you'll still celebrate with us in your own way. Your love and good wishes mean the world to us.",
          ],
          signOff: "With love and warmest wishes,",
        },
      },
      sponsor: {
        greeting: "Dear",
        intro: [
          "We wanted to share some happy news with you, and we wanted you to hear it from us first.",
          "We're getting married, and we're about to begin a new life together as husband and wife.",
        ],
        body: [
          "This letter is not a general invitation. It's a personal request, written especially for you.",
          "As we prepare for this day, we keep thinking of the people we look up to. You have shown us, in ways you may not even realize, what a loving and faithful life looks like.",
          "To us, a {role} is more than a name in our program. It is someone whose wisdom we trust, whose prayers we hold dear, and whose example we hope to follow as we build our own home.",
        ],
        askLead: "With deep respect and sincerity, we'd like to ask you",
        askNote: "Having you stand with us, and having your blessing on our marriage, would mean more to us than we can say.",
        yesButton: "Yes, I'd Be Honored 🤍",
        noButton: "I Can't, But With Love",
        signOff: "With love and respect,",
        yes: {
          title: "You Said Yes",
          script: "thank you",
          subheader: "We are truly honored",
          roleLine: "Our {role}",
          body: [
            "Thank you, {name}, for accepting this role with such an open heart. Your guidance and prayers mean so much to us, and we're grateful to begin our marriage with you beside us. We'll reach out soon with the details.",
          ],
          signOff: "With love and heartfelt gratitude,",
        },
        no: {
          title: "Thank You",
          script: "for your kindness",
          subheader: "We completely understand and respect your decision",
          body: [
            "Thank you for reading our letter and giving our request your thought. There are no hard feelings at all. We're simply grateful for you, and we'd be happy to have your prayers and blessings in whatever way you can share them.",
          ],
        },
        sent: {
          title: "Response Sent",
          script: "with gratitude",
          subheader: "Your reply has reached us",
          body: [
            "Thank you for being part of our story. Your love and good wishes mean the world to us.",
          ],
          signOff: "With love and warmest wishes,",
        },
      },
      bearer: {
        greeting: "Hi",
        intro: [
          "Guess what? We have the happiest news, and we wanted to tell you first! 🤍",
          "{groom} & {bride} are getting married!",
        ],
        body: [
          "Our wedding is going to be a very special day, and it wouldn't feel complete without you there with us.",
        ],
        askLead: "So we have a super important question, just for you:",
        askNote: "You'd get to walk down the aisle and carry something very precious for our ceremony. We think you'd be amazing at it!",
        yesButton: "Yes, I'd Love To! 🤍",
        noButton: "Maybe Next Time 🤍",
        signOff: "With lots of love,",
        yes: {
          title: "Yay!",
          script: "you said yes!",
          subheader: "You're officially on our team!",
          roleLine: "Our {role}",
          body: [
            "We're so excited to have you as our {role}! We can't wait to see you walk down the aisle. You have a very special job, and we know you'll do great. See you on our big day! 🤍",
          ],
          signOff: "With lots of love,",
        },
        no: {
          title: "That's Okay!",
          script: "we understand",
          subheader: "No worries at all 😊",
          body: [
            "Thank you for thinking about being our {role}. You are special to us no matter what, and we'd love to celebrate with you either way.",
          ],
        },
        sent: {
          title: "Response Sent",
          script: "thank you",
          subheader: "Thanks for letting us know",
          body: ["You are so special to us, and we can't wait to celebrate with you."],
          signOff: "With lots of love,",
        },
      },
      flowerGirl: {
        greeting: "Hi",
        intro: [
          "Guess what? We have the happiest news, and we wanted to tell you first! 🤍",
          "{groom} & {bride} are getting married!",
        ],
        body: [
          "Our wedding needs a little extra sweetness, lots of smiles, and a sprinkle of magic. We thought of you right away.",
        ],
        askLead: "And we have a very special role we'd love for you to have:",
        askNote: "You'd get to walk down the aisle before the bride and make our day even more beautiful. We think you'd be perfect!",
        yesButton: "Yes, I'd Love To! 🌸",
        noButton: "Maybe Next Time 🤍",
        signOff: "With lots of love,",
        yes: {
          title: "Yay!",
          script: "you said yes!",
          subheader: "We're so happy you'll be our Flower Girl!",
          roleLine: "Our {role}",
          body: [
            "We can't wait to see you walk down the aisle! Have fun, smile big, and enjoy every moment. See you on our big day! 🤍",
          ],
          signOff: "With lots of love,",
        },
        no: {
          title: "That's Okay!",
          script: "we understand",
          subheader: "No worries at all 😊",
          body: [
            "Thank you for thinking about being our Flower Girl. You are special to us no matter what, and we'd love to celebrate with you either way!",
          ],
        },
        sent: {
          title: "Response Sent",
          script: "thank you",
          subheader: "Thanks for letting us know",
          body: ["You are so special to us, and we can't wait to celebrate with you."],
          signOff: "With lots of love,",
        },
      },
    },
  },
  details: {
    rsvp: { ...RSVP },
  },
  contact: {
    bridePhone: "to be announced",
    groomPhone: "to be announced",
    email: "to be announced",
  },
  giftRegistry: {
    // QR_1:{
    // id: "BPI",
    // src: "/QR/BPI.png",
    // label: "BPI",
    // accountNumber: "KAMS : ***********569",
    // },
    // QR_2:{
    // id: "MariBank",
    // src: "/QR/MariBank.png",
    // label: "MariBank",
    // accountNumber: "****7672",
    // }
    // ,
    // QR_3:{
    // id: "Gcash",
    // src: "/QR/pleaseProvideQR.png",
    // label: "Gcash",
    // accountNumber: "to be announced",
    // }
  },
  // Built from QUICK SETUP — edit the values at the top of the file
  ceremony: {
    location: CEREMONY_VENUE.name,
    venue: CEREMONY_VENUE.address,
    map: CEREMONY_VENUE.map,
    date: WEDDING_DATE,
    day: WEDDING_DAY,
    time: TIMES.ceremony,
    entourageTime: TIMES.entourageCall,
    guestsTime: TIMES.guestArrival,
    image: CEREMONY_VENUE.photos,
  },
  reception: {
    location: RECEPTION_VENUE.name,
    venue: RECEPTION_VENUE.address,
    map: RECEPTION_VENUE.map,
    date: WEDDING_DATE,
    day: WEDDING_DAY,
    time: TIMES.reception,
    image: RECEPTION_VENUE.photos,
  },
  dressCode: {
    theme: "Whimsical Spring Minimalist",
    sponsors: {
      title: "Sponsors",
      ninang: {
        label: "Ninang",
        description: "Long gown in the shade of silver gray.",
        image: "/Details/Ninang.png",
        palette: ["#D8D3CD", "#C0C0C0", "#A9A9A9", "#969090", "#8C8686"],
      },
      ninong: {
        label: "Ninong",
        description: "Barong Tagalog and black slacks.",
        image: "/Details/Ninong.png",
        palette: ["#D0A386", "#E3C5B3", "#E4DCD1"],
      },
    },
    entourage: {
      title: "Entourage",
      bridesmaid: {
        label: "Bridesmaids",
        description: "Long gown that suits our color motif.",
        image: "/Details/bridesmaid.png",
        palette: ["#B4A3D4", "#C8A2C8"],
      },
      groomsmen: {
        label: "Groomsmen",
        description: "Long sleeve Barong Tagalog and black slacks.",
        image: "/Details/Groomsmen.png",
        palette: ["#D0A386", "#E3C5B3", "#E4DCD1"],
      },
    },
    guests: {
      title: "Guests",
      label: "Guests",
      description: "Casual attire: Whimsical Spring.",
      image: "/Details/guest.png",
      palette: ["#835643", "#C48C73", "#E3CAC5", "#CBAFA1", "#F2E9E2"],
    },
    paletteNote:
      "Our theme is Whimsical Spring Minimalist. Entourage: women, a flowy spring sage green dress, strictly floor length; gentlemen, a black and white suit, a white and gray suit, or sage green long sleeves with gray or brown pants — strictly no rubber shoes. Guests: casual attire, Whimsical Spring.",
    closing:
      "Thank you for helping us bring our wedding vision to life. We can't wait to celebrate with you!",
    note: "We kindly request our guests to dress in attire following our Whimsical Spring Minimalist palette.",
  },
  narratives: {
    ourStory: `Zanicare Group of Companies Inc. is a growing healthcare organization dedicated to providing accessible and reliable animal bite management and preventive healthcare services through its network of Zanicare Animal Bite Clinics. The company began its operations in 2022 in Molino, Bacoor, Cavite, and has continued to expand its presence across different communities.`,
    groom: "",
    bride: "",
  },
  colors: {
    primary: "#111111", // black
    secondary: "#F5F5F5", // white
  },
  // Wedding playlist (components/sections/wedding-playlist.tsx). {couple} → "Groom & Bride" nicknames.
  playlist: {
    eyebrow: "Our Soundtrack",
    title: "A Year-End Playlist",
    script: "songs of the season",
    subtitle: "Feel-good songs for the night",
    // Shown on the playlist card
    cardEyebrow: "Spotify Playlist",
    playlistName: "Zanicare Year-End Party",
    cardNote: "Press play and get into the party spirit.",
    buttonText: "Open in Spotify",
    // CD album art: photo on the sleeve and the disc label ("" = plain sage sleeve)
    coverImage: COUPLE_PHOTOS[2],
    // Corner florals (sized per corner like the loader) — "" hides any of them
    decos: { ...CORNER_DECOS, headerOrnament: DECOR.headerOrnament },
    // Thin double border around the section (false hides it)
    showFrame: true,
    embedUrl:
    //https://open.spotify.com/embed/playlist/5sT43YjdM8pJ3xtEkrxyEY?utm_source=generator&si=e5e64aa63fd04356
      "https://open.spotify.com/embed/playlist/7C4HRnOxlSQLY3k3PXAboT?utm_source=generator&si=217968ea51b34ca6",
    spotifyUrl: "https://open.spotify.com/playlist/7C4HRnOxlSQLY3k3PXAboT?si=HXBehL6-TWWUuqNeUAHoNA",
  },
  // Closing "See you there!" section (components/sections/see-you-there.tsx).
  //   photos mode (loadingScreen.display "photos") → full-screen couple photo
  //   plain mode  (loadingScreen.display "plain")  → botanical card, no photo
  // {couple} → "Groom & Bride" nicknames.
  seeYouThere: {
    titleLine1: "See you",
    titleLine2: "there!",
    // Full-bleed photos: crossfade on mobile, side-by-side triptych on md+ (placeholders for now)
    photos: [COUPLE_PHOTOS[0], COUPLE_PHOTOS[1], COUPLE_PHOTOS[2]],
    photoAlt: COMPANY_NAME,
    eyebrow: "Until we meet",
    script: "with gratitude, Zanicare", // "" hides it
    message: "We can't wait to celebrate this year-end with you.", // "" hides it
    // Plain mode
    plain: {
      eyebrow: "Until we meet",
      script: "with gratitude, Zanicare",
      message: "We can't wait to celebrate this year-end with you.",
      // Corner ornaments — top two here, bottom two on the footer below; "" hides any of them
      decos: { ...CORNER_DECOS, footerVine: DECOR.headerOrnament },
      // Thin double border around See You There + footer (false hides it)
      showFrame: true,
    },
  },
  // Footer (components/sections/footer.tsx).
  // {couple} → "Groom & Bride" nicknames, {year} → current year. Date comes from ceremony, deadline from details.rsvp.
  footer: {
    showMonogram: true, // company logo (couple.monogram)
    dateLabel: "Event Date",
    // Ceremony & reception at a glance (times and places come from ceremony / reception)
    summary: {
      show: true,
      ceremonyLabel: "Program",
      receptionLabel: "Dinner",
    },
    noteTitle: "A Note of Thanks",
    // Typed out one after another
    quotes: [
      '"Give thanks to the Lord, for He is good; His love endures forever." – Psalm 107:1',
      "Welcome to the Zanicare Year-End Thanksgiving Party! From our first clinic in Molino, Bacoor to a growing network of branches, every milestone was made possible by our people.",
      "Thank you for your dedication, your care for our patients and your hard work all year. Happy Thanksgiving and see you on December 13!",
    ],
    rsvp: {
      show: true,
      title: "RSVP Deadline",
      label: "Please respond by",
      note: "Please confirm your attendance by this date.",
      button: "Tap here to respond",
      href: "#guest-list",
    },
    // Social links — replace each href with your own profile link.
    //   show: false hides one; platforms: facebook | instagram | tiktok | youtube | twitter | threads | messenger | email
    //   email: use "mailto:you@example.com"; messenger: use "https://m.me/yourpage"
    followTitle: "Follow Us",
    followNote: "Share your photos and tag us — we'd love to see the night through your eyes.",
    socials: [
      { show: true, platform: "facebook", href: "https://www.facebook.com" },
      { show: true, platform: "instagram", href: "https://www.instagram.com/" },
      { show: true, platform: "tiktok", href: "https://www.tiktok.com/" },
      { show: true, platform: "youtube", href: "https://www.youtube.com" },
      { show: true, platform: "twitter", href: "https://x.com/" },
      { show: false, platform: "threads", href: "https://www.threads.net/" },
      { show: false, platform: "messenger", href: "https://m.me/" },
      { show: false, platform: "email", href: "mailto:" },
    ] as {
      show: boolean
      platform: "facebook" | "instagram" | "tiktok" | "youtube" | "twitter" | "threads" | "messenger" | "email"
      href: string
    }[],
    // Contact details shown below Follow Us — show: false hides the block, empty fields are skipped
    contact: {
      show: true,
      title: "Get in Touch",
      tagline: "Care through Accuracy",
      address: "366 Quirino Ave., 2nd flr. Monte Victoria Bldg., Baclaran, Parañaque",
      email: "zanicaregroup@gmail.com",
      phone: "(02) 8723-3920",
      phoneHref: "tel:+63287233920",
    },
    quickLinksTitle: "Quick Links",
    links: [
      { label: "Home", href: "#home" },
      { label: "About Us", href: "#love-story" },
      { label: "Branches", href: "#branches" },
      { label: "Event Details", href: "#details" },
      { label: "Program", href: "#wedding-timeline" },
      { label: "RSVP", href: "#guest-list" },
      { label: "Gallery", href: "#gallery" },
      { label: "FAQ", href: "#faq" },
    ],
    copyright: "© {year} Zanicare Group of Companies Inc. — with gratitude and year-end cheer.",
    tagline: "This invitation was designed to share the evening's details with you.",
    credit: {
      show: true,
      developedBy: "Developed by",
      developerName: "Jabez Digital",
      developerUrl: "https://www.facebook.com/jl.esconili",
      promoText: "Want a website like this? Visit",
      promoName: "Wedding Invitation Naga",
      promoUrl: "https://www.facebook.com/WeddingInvitationNaga",
    },
    // Corner ornaments — bottom two here, top two on See You There above; "" hides any of them
    decos: { ...CORNER_DECOS, headerOrnament: DECOR.headerOrnament },
    // Thin double border when the footer is shown on its own (false hides it)
    showFrame: true,
  },
  // Snap & Share (components/sections/snap-share.tsx). {couple} → "Groom & Bride" nicknames.
  snapShare: {
    // ⚠ check: still the previous event's Google Drive folder — replace with the company's upload folder
    googleDriveLink:
      "https://drive.google.com/drive/folders/1UG5DBKcoQ0a8_yRBq8AH6MaiwcVCPV4S?usp=sharing",
    albumQR: "/QR/AlbumQR.png",
    hashtag: HASHTAGS,
    instructions: "Scan the QR code or tap Upload to add your photos and videos from the night. Every snap helps us build the Zanicare year-end album.",
    title: "Snap & Share",
    subtitle: "capture the night",
    // One line per line of the verse (snap-share.tsx keeps the line breaks); the hashtag is shown right under it
    description:
      "Strike a pose, raise a glass\nand help us capture every moment\nof gratitude and year-end cheer.\nTag your photos with our official hashtag:",
    // "Our Favorite Moments" photo card — always hidden when loadingScreen.display is "plain"
    moments: {
      show: true,
      title: "Moments to Remember",
      caption: "Share your best shots — your photos may be featured in our year-end gallery.",
      // 3 portrait photos: one tall feature on the left, two stacked on the right (placeholders for now)
      images: [PLACEHOLDER_IMAGE, PLACEHOLDER_IMAGE, PLACEHOLDER_IMAGE],
    },
    website: {
      show: true,
      title: "Share the Invitation",
      description:
        "Pass this QR code to your colleagues so they can open the invitation and RSVP in seconds.",
      downloadButton: "Save QR Code",
      note: "Works with any phone camera — no app needed.",
    },
    hashtags: {
      show: true,
      title: "Official Hashtags",
      copy: "Copy",
      copied: "Copied",
      copyAll: "Copy All",
      allCopied: "All Copied!",
    },
    social: {
      show: true,
      title: "Spread the Cheer",
      description: "Post your favorite moments and tag us — let's fill our feeds with Zanicare year-end cheer.",
      // Shown under the buttons — "" hides it
      note: "For Instagram and TikTok, your caption and hashtags are copied — just paste them into your post.",
      // Button label for a moment after the caption is copied (Instagram / TikTok)
      captionCopied: "Caption copied",
      // Remove any you don't want: "instagram" | "facebook" | "tiktok" | "twitter"
      platforms: ["instagram", "facebook", "tiktok", "twitter"] as ("instagram" | "facebook" | "tiktok" | "twitter")[],
      shareText: "Celebrating a year of gratitude with the Zanicare family at our Year-End Thanksgiving Party!",
    },
    // Shown only when googleDriveLink is set
    upload: {
      badge: "Add to Our Shared Album",
      scanNote: "Scan to open the album",
      copyLink: "Copy Link",
      copied: "Link Copied!",
      downloadQr: "Save QR Code",
      uploadButton: "Upload Photos",
    },
    closing:
      "Thank you for helping us capture a night of gratitude. Every photo and message becomes part of the Zanicare story.",
    closingTag: "From our family to yours — Happy Thanksgiving",
    // Closing banner — text comes from loveStory.closing*; photos crossfade behind it (placeholders for now)
    puhon: {
      show: true,
      images: [PLACEHOLDER_IMAGE],
      intervalMs: 5000, // time each photo stays before fading to the next
    },
  },
  accommodation: {
    coordinator: {
      name: RSVP.coordinator,
      phone: RSVP.phone,
    },
    hotels: [
      {
        name: "La Luna Resort",
        discount: "Offered 20% discount for early booking",
        facebook: "https://www.facebook.com/lalunabeachresortofficial",
      },
      {
        name: "GOSAM Beach Resort",
        discount: "Offered 10% discount",
        facebook: "https://www.facebook.com/profile.php?id=100083461714073",
      },
      {
        name: "Calicoan Villa",
        discount: "Offered 10% discount",
        facebook: "https://www.facebook.com/CalicoanVilla",
      },
      {
        name: "G Camp Beachfront",
        discount: "Offered 10% discount",
        facebook: "https://www.facebook.com/profile.php?id=100085772194096",
      },
      {
        name: "Punta Viajero Beach Resort",
        discount: "Offered 15% discount",
        phone: "0932 214 6408",
        facebook: "https://www.facebook.com/puntoviajeroresort",
      },
      { name: "Balay Sunset" },
      { name: "Balay Pacifico" },
      { name: "Casa Nala" },
      { name: "The Grey Inn" },
    ],
    carRentals: [
      {
        name: "Apex Car Rental Tacloban",
        facebook: "https://www.facebook.com/profile.php?id=61574882327115",
      },
      {
        name: "Cassey Wheels Car Rental",
        facebook: "https://www.facebook.com/search/top?q=casseywheels%20car%20rental",
      },
    ],
  },
}
