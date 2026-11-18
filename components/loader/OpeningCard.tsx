'use client';

import React, { useCallback, useEffect, useRef, useState } from 'react';
import { preload } from 'react-dom';
import { useReducedMotion } from 'motion/react';
import { useSiteConfig } from '@/hooks/use-site-config';
import { siteConfig as defaultSiteConfig } from '@/content/site';
import './opening-card.css';

/** Screens that get the opening card when `openingCard.mobileOnly` is on */
export const OPENING_CARD_MOBILE_MEDIA = '(max-width: 767px)';

// Choreography after the tap (ms) — keep in sync with the delays in opening-card.css
// (modelled on public/loading-deco/sampleribbonanimationwhenclick.mp4)
//   0–300     the bow tightens as the tail is tugged
//   150–1050  the bow is pulled apart: the band halves slide out to the far left and right,
//             opening the middle; the loops compress and collapse into the knot; the tails
//             loosen and swing down under gravity — the wrapped knot stays intact
//   850–1450  what is left (knot and hanging tails) drops down the card and fades
//   1250–1650 a line of light kindles down the seam between the doors
//   1750–3850 the latch gives and the two halves of the front card swing open on their hinges
//             (3D); warm light and sparkles spill out and the invitation is revealed behind
// Sparkles that drift out of the opening doors (deterministic, so SSR and client agree)
const MOTES = Array.from({ length: 22 }, (_, i) => {
  const side = i % 2 === 0 ? -1 : 1;
  return {
    y: 30 + ((i * 37) % 41), // start along the middle of the seam
    size: 3 + ((i * 7) % 5),
    dx: side * (16 + ((i * 13) % 34)),
    dy: -14 + ((i * 29) % 30) - (i % 3 === 0 ? 12 : 0), // mostly drifting up and out
    dur: 1.4 + ((i * 11) % 9) / 10,
    delay: ((i * 7) % 10) / 20,
  };
});
// The bow image is cut into these pieces (clip paths in opening-card.css), drawn back to front
const BOW_PARTS = ['loop-left', 'loop-right', 'tail-left', 'tail-right', 'knot'] as const;

// Mount the LoadingScreen once the gold glint (JS-driven) has finished but before the doors
// move: its first render blocks the main thread for a moment, which would freeze the glint,
// while the CSS seam light keeps running on the compositor and the closed doors hide the mount
const LOADER_START_MS = 1250;
const DONE_MS = 4150;
const REDUCED_LOADER_START_MS = 0;
const REDUCED_DONE_MS = 600;

interface OpeningCardProps {
  /** Fires before the doors swing, while the card still covers the screen — mount whatever the doors reveal */
  onOpenStart?: () => void;
  /** Fires once the doors are fully open; unmount the card here */
  onOpened: () => void;
  /** Overrides `openingCard.hintText` from content/site.ts */
  hint?: string;
}

export const OpeningCard: React.FC<OpeningCardProps> = ({ onOpenStart, onOpened, hint }) => {
  // Artwork + text come from `openingCard` in content/site.ts; fall back to the bundled config
  // if a remote override is missing the block (or some of its images)
  const siteConfig = useSiteConfig();
  const defaults = defaultSiteConfig.openingCard;
  const content = siteConfig.openingCard ?? defaults;
  const img = { ...defaults.images, ...content.images };
  const src = (path: string) => (path ? encodeURI(path) : '');
  const IMG = {
    card: src(img.card),
    bow: src(img.bow),
    band: src(img.band),
    knot: src(img.knot),
    goldMap: src(img.goldMap),
  };
  const hintText = hint ?? content.hintText ?? defaults.hintText;
  const ribbonY = content.ribbonY || defaults.ribbonY;

  const mobileOnly = content.mobileOnly ?? defaults.mobileOnly;

  // Start fetching the artwork with the HTML so the card is never painted blank
  // (phones only when mobileOnly — desktop never shows the card, so never downloads it)
  // (the card art and bow first — they are what the guest sees)
  for (const path of [IMG.card, IMG.bow, IMG.knot, IMG.band]) {
    if (!path) continue;
    preload(path, {
      as: 'image',
      ...(path !== IMG.band && { fetchPriority: 'high' as const }),
      ...(mobileOnly && { media: OPENING_CARD_MOBILE_MEDIA }),
    });
  }

  const reduceMotion = useReducedMotion();
  const [opening, setOpening] = useState(false);
  const openingRef = useRef(false);
  const timers = useRef<ReturnType<typeof setTimeout>[]>([]);

  useEffect(() => {
    document.documentElement.style.overflow = 'hidden';
    document.body.style.overflow = 'hidden';
    const pending = timers.current;
    return () => {
      document.documentElement.style.overflow = '';
      document.body.style.overflow = '';
      pending.forEach(clearTimeout);
    };
  }, []);

  const open = useCallback(() => {
    if (openingRef.current) return;
    openingRef.current = true;
    setOpening(true);
    timers.current.push(
      setTimeout(() => onOpenStart?.(), reduceMotion ? REDUCED_LOADER_START_MS : LOADER_START_MS),
      setTimeout(onOpened, reduceMotion ? REDUCED_DONE_MS : DONE_MS),
    );
  }, [onOpenStart, onOpened, reduceMotion]);

  const onKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      open();
    }
  };

  return (
    <div
      className={`opening-card${mobileOnly ? ' opening-card--mobile-only' : ''}${opening ? ' is-opening' : ''}${reduceMotion ? ' is-reduced-motion' : ''}`}
      style={
        {
          '--oc-card': IMG.card ? `url("${IMG.card}")` : 'none',
          '--oc-band': IMG.band ? `url("${IMG.band}")` : 'none',
          '--oc-band-y': ribbonY,
        } as React.CSSProperties
      }
    >
      <div
        className="opening-card__stage"
        role="button"
        tabIndex={0}
        aria-label="Open invitation"
        aria-disabled={opening}
        onClick={open}
        onKeyDown={onKeyDown}
      >
        {/* Warm glow behind the card, swelling as the light floods it */}
        <div className="opening-card__light" aria-hidden="true" />

        {/* Gate-fold card — each door shows its half of the card art; the card dissolves into the light */}
        <div className="opening-card__scene" aria-hidden="true">
          {(['left', 'right'] as const).map((side) => (
            <div key={side} className={`opening-card__door opening-card__door--${side}`}>
              <div className="opening-card__door-face">
                <div className="opening-card__door-art" />
                <div className="opening-card__door-shade" />
                <div className="opening-card__door-gloss" />
                <div className="opening-card__door-rim" />
              </div>
              <div className="opening-card__door-edge" />
              <div className="opening-card__door-back" />
            </div>
          ))}
        </div>

        {/* Light kindling at the centre of the seam and leaking through the crack, then widening
            into a glittering column that floods the card */}
        <div className="opening-card__seam" aria-hidden="true" />
        <div className="opening-card__flare" aria-hidden="true" />
        <div className="opening-card__flood" aria-hidden="true" />
        {!reduceMotion && (
          <div className="opening-card__motes" aria-hidden="true">
            {MOTES.map((m, i) => (
              <span
                key={i}
                className="opening-card__mote"
                style={
                  {
                    '--y': `${m.y}%`,
                    '--s': `${m.size}px`,
                    '--dx': `${m.dx}cqw`,
                    '--dy': `${m.dy}cqh`,
                    '--dur': `${m.dur}s`,
                    '--delay': `${m.delay}s`,
                  } as React.CSSProperties
                }
              />
            ))}
          </div>
        )}

        {/* Ribbon band wrapped around the card: the band art on each side, meeting under the bow
            (the right half is mirrored so the satin's sheen is symmetrical) */}
        <div className="opening-card__ribbon" aria-hidden="true">
          <div className="opening-card__ribbon-end opening-card__ribbon-end--left" />
          <div className="opening-card__ribbon-end opening-card__ribbon-end--right" />
        </div>

        {/* Bow, cut into pieces so it can be untied: the loops collapse into the knot, the tails
            loosen and drop under their own weight, and the wrapped knot stays intact in the middle.
            Knot.png (behind) fills any gaps at rest and fades as the loops collapse */}
        <div className="opening-card__bow" aria-hidden="true">
          {IMG.knot && (
            <div className="opening-card__seal">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={IMG.knot} alt="" loading="lazy" draggable={false} />
            </div>
          )}
          {BOW_PARTS.map((part, i) => (
            <div key={part} className={`opening-card__bow-part opening-card__bow-part--${part}`}>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={IMG.bow}
                alt=""
                className="opening-card__bow-img"
                loading="lazy"
                draggable={false}
                {...(i === 0 && { fetchPriority: 'high' as const })}
              />
            </div>
          ))}
          <span className="opening-card__knot-glow" />
        </div>

        <p className="opening-card__hint" aria-hidden="true">
          {hintText}
        </p>
      </div>
    </div>
  );
};
