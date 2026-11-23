'use client';

import React, { useEffect, useRef } from 'react';
import { PosterBackdrop } from '@/components/loader/PosterBackdrop';
import { SpecialCharText } from '@/components/special-char-text';
import './loader-poster.css';

/*
 * "Poster" layout for the loading screen (loadingScreen.loaderDisplay = "poster"):
 * soft photo background under a pastel wash, floral corners and a thin gold frame,
 * "Save — the — Date" across the top, the couple cut-out in the middle, short side lines
 * left and right, then names, date, time and venue, with the status line and a progress bar
 * (with percentage) at the bottom. Entrances are CSS-delay driven so they play in sync with
 * the opening card's doors parting in front of it.
 */

export interface LoaderPosterProps {
  photos: string[];
  desktopPhotos: string[];
  coupleImage: string;
  kicker: string;
  /** Brand lockup (loadingScreen.poster.lockup): replaces kicker, headline, middle image and title */
  lockup?: PosterLockup;
  /** e.g. "Save the Date" — the joining word ("the") is set small between two rules */
  headline: string;
  sideLeft: string[];
  sideRight: string[];
  weddingOf: string;
  groomName: string;
  brideName: string;
  /** Fonts from LoadingScreen (next/font class names) */
  nameFontClass: string;
  andFontClass: string;
  dateText: string;
  weekday: string;
  time: string;
  /** Guest arrival time (ceremony.guestsTime), shown under the ceremony time */
  arrivalTime?: string;
  venueName: string;
  venueAddress: string;
  corners: { topLeft?: string; topRight?: string; bottomLeft?: string; bottomRight?: string };
  /** Word between the names (loadingScreen.namesJoiner) */
  namesJoiner: string;
  photoVeil?: number;
  showProgress: boolean;
  showPercent: boolean;
  statusMessage?: string;
  statusKey: number;
  durationMs: number;
  reduceMotion: boolean;
}

export interface PosterLockup {
  brands?: string;
  joiner?: string;
  logo?: string;
  title?: string;
  invitedTop?: string;
  invitedBottom?: string;
}

const JOINING_WORDS =new Set(['the', 'of', 'and', '&', 'a']);

// "Save the Date" → ["Save", "the", "Date"]. Without a joining word, a multi-word headline
// is stacked: "Year End Party" → "YEAR END" in spaced capitals over a script "Party".
function splitHeadline(headline: string) {
  const words = headline.split(/\s+/).filter(Boolean);
  const i = words.findIndex((w, idx) => idx > 0 && idx < words.length - 1 && JOINING_WORDS.has(w.toLowerCase()));
  if (i < 0) {
    if (words.length > 1) {
      return { before: words[words.length - 1], join: '', after: '', caps: words.slice(0, -1).join(' ') };
    }
    return { before: headline, join: '', after: '', caps: '' };
  }
  return { before: words.slice(0, i).join(' '), join: words[i], after: words.slice(i + 1).join(' '), caps: '' };
}

const delay = (ms: number) => ({ '--lp-delay': `${ms}ms` }) as React.CSSProperties;

export const LoaderPoster: React.FC<LoaderPosterProps> = (p) => {
  const head = splitHeadline(p.headline);
  const lk = p.lockup;
  const percentRef = useRef<HTMLSpanElement>(null);

  // Percentage under the bar, counted up in step with the bar's CSS animation
  useEffect(() => {
    const el = percentRef.current;
    if (!el) return;
    const start = performance.now();
    let raf = 0;
    let last = -1;
    const tick = (now: number) => {
      const pct = Math.min(100, Math.floor(((now - start) / p.durationMs) * 100));
      if (pct !== last) {
        el.textContent = `${pct}%`;
        last = pct;
      }
      if (pct < 100) raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [p.durationMs]);

  return (
    <div className={`lp${lk ? ' lp--lockup' : ''}${p.reduceMotion ? ' lp--still' : ''}`}>
      {/* Black silk, vignette, silver frame and corners — shared with the envelope (Hero.tsx) */}
      <PosterBackdrop corners={p.corners} />

      <div className="lp__stage">
        <div className="lp__glow" aria-hidden="true" />

        {/* Couple cut-out, fading into the details below */}
        {!lk && p.coupleImage && (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={p.coupleImage}
            alt=""
            aria-hidden="true"
            className="lp__couple lp-in lp-in--rise"
            style={delay(800)}
            fetchPriority="high"
            draggable={false}
          />
        )}

        <div className="lp__content">
          {lk ? (
            <header className="lp__header lp__lockup">
              {lk.brands && (
                <p className="lp__brands lp-in" style={delay(500)}>
                  {lk.brands}
                </p>
              )}
              {lk.joiner && (
                <p className="lp__brands-joiner lp-in" style={delay(700)}>
                  {lk.joiner}
                </p>
              )}
              {lk.logo && (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={lk.logo}
                  alt="Zanicare Group of Companies Inc."
                  className="lp__logo lp-in"
                  style={delay(900)}
                  fetchPriority="high"
                  draggable={false}
                />
              )}
              {lk.title && (
                <h1 className={`${p.andFontClass} lp__event-title lp-gold lp-gold--warm lp-in`} style={delay(1250)}>
                  <SpecialCharText text={lk.title} ampClassName={p.andFontClass} />
                </h1>
              )}
            </header>
          ) : (
          <header className="lp__header">
            {p.kicker && (
              <p className="lp__kicker lp-in" style={delay(500)}>
                {p.kicker}
              </p>
            )}
            <h1
              className={`lp__headline${head.caps ? ' lp__headline--stacked' : head.join ? '' : ' lp__headline--single'}`}
              aria-label={p.headline}
            >
              {head.caps ? (
                <>
                  {/* Gala lockup: "YEAR END" as the hero line, "— ◆ PARTY ◆ —" as a tracked subtitle */}
                  <span className={`${p.nameFontClass} lp__caps lp-gold lp-gold--warm lp-in`} style={delay(600)} aria-hidden="true">
                    <SpecialCharText text={head.caps} ampClassName={p.andFontClass} />
                  </span>
                  <span className="lp__sub lp-in" style={delay(950)} aria-hidden="true">
                    <span className="lp__sub-rule" />
                    <span className="lp__gem" />
                    <span className="lp__sub-text">
                      <SpecialCharText text={head.before} ampClassName={p.andFontClass} />
                    </span>
                    <span className="lp__gem" />
                    <span className="lp__sub-rule lp__sub-rule--right" />
                  </span>
                </>
              ) : (
                <span className="lp__script lp-gold lp-gold--warm lp-in lp-in--left" style={delay(700)} aria-hidden="true">
                  {head.before}
                </span>
              )}
              {head.join && (
                <span className="lp__join lp-in" style={delay(1050)} aria-hidden="true">
                  <span className="lp__rule" />
                  {head.join}
                  <span className="lp__rule" />
                </span>
              )}
              {head.after && (
                <span className="lp__script lp-gold lp-gold--warm lp-in lp-in--right" style={delay(850)} aria-hidden="true">
                  {head.after}
                </span>
              )}
            </h1>
          </header>
          )}

          <div className="lp__middle">
            {p.sideLeft.length > 0 && (
              <p className="lp__side lp__side--left lp-in lp-in--left" style={delay(1600)}>
                {p.sideLeft.map((line, i) => (
                  <span key={i}>{line}</span>
                ))}
              </p>
            )}
            {p.sideRight.length > 0 && (
              <p className="lp__side lp__side--right lp-in lp-in--right" style={delay(1750)}>
                {p.sideRight.map((line, i) => (
                  <span key={i}>{line}</span>
                ))}
              </p>
            )}
          </div>

          <div className="lp__details">
            {lk ? (
              (lk.invitedTop || lk.invitedBottom) && (
                <h2 className="lp__invited" aria-label={[lk.invitedTop, lk.invitedBottom].filter(Boolean).join(' ')}>
                  {lk.invitedTop && (
                    <span className={`${p.nameFontClass} lp__invited-top lp-gold lp-in`} style={delay(1700)} aria-hidden="true">
                      <SpecialCharText text={lk.invitedTop} />
                    </span>
                  )}
                  {lk.invitedBottom && (
                    <span
                      className={`${p.andFontClass} lp__invited-bottom lp-gold lp-gold--warm lp-in lp-in--right`}
                      style={delay(2050)}
                      aria-hidden="true"
                    >
                      <SpecialCharText text={lk.invitedBottom} />
                    </span>
                  )}
                </h2>
              )
            ) : (
            <>
            {p.weddingOf && (
              <p className="lp__wedding-of lp-in" style={delay(1950)}>
                {p.weddingOf}
              </p>
            )}
            {/* Event title: two lines in capitals; a joiner word ("&") between them only when set */}
            <h2
              className={`lp__names${p.namesJoiner ? '' : ' lp__names--title'}`}
              aria-label={[p.groomName, p.namesJoiner, p.brideName].filter(Boolean).join(' ')}
            >
              <span className={`${p.nameFontClass} lp__name lp-gold lp-gold--warm lp-in`} style={delay(2150)} aria-hidden="true">
                <SpecialCharText text={p.groomName} ampClassName={p.andFontClass} />
              </span>
              {p.namesJoiner && (
                <span className={`${p.andFontClass} lp__and lp-gold lp-in`} style={delay(2350)} aria-hidden="true">
                  {p.namesJoiner}
                </span>
              )}
              <span className={`${p.nameFontClass} lp__name lp-gold lp-in`} style={delay(2350)} aria-hidden="true">
                <SpecialCharText text={p.brideName} ampClassName={p.andFontClass} />
              </span>
            </h2>
            </>
            )}
            {p.dateText && (
              <p className="lp__date lp-in" style={delay(2750)}>
                <span className="lp__rule lp__rule--long" />
                <span className={`${p.nameFontClass} lp-gold lp-gold--warm`}>
                  <SpecialCharText text={p.dateText} ampClassName={p.andFontClass} />
                </span>
                <span className="lp__rule lp__rule--long" />
              </p>
            )}
            {(p.weekday || p.time) && (
              <p className="lp__when lp-in" style={delay(2950)}>
                {p.weekday}
                {p.weekday && p.time && <span className="lp__dot" aria-hidden="true" />}
                {p.time}
              </p>
            )}
            {p.arrivalTime && (
              <p className="lp__when lp__arrival lp-in" style={delay(3025)}>
                Guest Arrival
                <span className="lp__dot" aria-hidden="true" />
                {p.arrivalTime}
              </p>
            )}
            {p.venueName && (
              <p className="lp__venue lp-in" style={delay(3100)}>
                {p.venueName}
              </p>
            )}
            {p.venueAddress && (
              <p className="lp__address lp-in" style={delay(3200)}>
                {p.venueAddress}
              </p>
            )}
          </div>

          <footer className="lp__footer lp-in" style={delay(3350)}>
            {p.statusMessage && (
              <p key={p.statusKey} className="lp__status">
                {p.statusMessage}
              </p>
            )}
            {p.showProgress && (
              <>
              <div
                className="lp__track"
                role="progressbar"
                aria-label="Loading invitation"
                aria-valuemin={0}
                aria-valuemax={100}
              >
                <div className="lp__bar" style={{ animationDuration: `${p.durationMs}ms` }}>
                  <span className="lp__knob" />
                </div>
              </div>
              {p.showPercent && (
                <span ref={percentRef} className="lp__percent" aria-hidden="true">
                  0%
                </span>
              )}
              </>
            )}
          </footer>
        </div>
      </div>
    </div>
  );
};
