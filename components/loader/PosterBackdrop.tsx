'use client';

import React from 'react';
import dynamic from 'next/dynamic';
import './loader-poster.css';

/*
 * Background shared by the poster loading screen and the envelope that follows it (Hero.tsx),
 * so the look carries straight across the hand-off: black silk (WebGL, components/silk.jsx)
 * with soft white sheen, a dark vignette, gold particles rising, a thin double silver frame and
 * the corner decorations.
 */

const Silk = dynamic(() => import('@/components/silk'), { ssr: false });

// Silk colors: charcoal folds with a cool white sheen
const SILK_COLOR = '#2B2B2E';
const SILK_SHEEN_COLOR = '#F2F2F2';

// Gold particles drifting up the screen (deterministic, so SSR and client agree).
// Negative delays start each one part-way up, so the screen is never empty at first paint.
const GOLD_PARTICLES = Array.from({ length: 34 }, (_, i) => {
  const far = i % 3 === 0; // smaller, softer specks further back
  return {
    x: (i * 37 + 13) % 100, // % across
    size: far ? 1.5 + (i % 3) * 0.5 : 2.5 + ((i * 7) % 4), // px
    dur: (far ? 16 : 10) + ((i * 5) % 8), // s to cross the screen
    delay: -(((i * 2.7) % 18)), // s
    drift: (i % 2 === 0 ? 1 : -1) * (10 + ((i * 11) % 34)), // px sideways
    peak: far ? 0.45 : 0.7 + ((i * 3) % 4) * 0.08, // brightest opacity
    blur: far ? 0.6 : 0,
  };
});

export interface PosterTheme {
  goldDark?: string;
  gold?: string;
  goldLight?: string;
  ink?: string;
  inkSoft?: string;
  washTop?: string;
  washBottom?: string;
}

/** CSS variables for the poster colors (loadingScreen.poster.theme) — set on the loader root and
 *  on the envelope screen, so both read the same palette. Unset values keep the CSS defaults. */
export function posterThemeVars(theme: PosterTheme | undefined): React.CSSProperties {
  if (!theme) return {};
  const vars: Record<string, string> = {};
  const map: [keyof PosterTheme, string][] = [
    ['goldDark', '--lp-gold-1'],
    ['gold', '--lp-gold-2'],
    ['goldLight', '--lp-gold-3'],
    ['ink', '--lp-ink'],
    ['inkSoft', '--lp-ink-soft'],
    ['washTop', '--lp-wash-top'],
    ['washBottom', '--lp-wash-bottom'],
  ];
  for (const [key, cssVar] of map) {
    if (theme[key]) vars[cssVar] = theme[key] as string;
  }
  return vars as React.CSSProperties;
}

export interface PosterBackdropProps {
  corners: { topLeft?: string; topRight?: string; bottomLeft?: string; bottomRight?: string };
  className?: string;
}

export const PosterBackdrop: React.FC<PosterBackdropProps> = ({ corners, className }) => (
  <div className={`lp-bd${className ? ` ${className}` : ''}`} aria-hidden="true">
    <div className="lp-bd__silk">
      <Silk
        color={SILK_COLOR}
        sheenColor={SILK_SHEEN_COLOR}
        speed={3}
        scale={1}
        rotation={0}
        sheen={0.6}
        depth={0.55}
        glow={0.25}
        noiseIntensity={1.2}
        mouseInteraction={false}
        clickRipple={false}
        intro={false}
      />
    </div>
    <div className="lp-bd__wash" />
    <div className="lp-bd__particles">
      {GOLD_PARTICLES.map((g, i) => (
        <span
          key={i}
          className="lp-bd__particle"
          style={
            {
              '--x': `${g.x}%`,
              '--s': `${g.size}px`,
              '--dur': `${g.dur}s`,
              '--delay': `${g.delay}s`,
              '--drift': `${g.drift}px`,
              '--peak': g.peak,
              '--blur': `${g.blur}px`,
            } as React.CSSProperties
          }
        />
      ))}
    </div>
    <div className="lp-bd__frame" />
    {(
      [
        ['tl', corners.topLeft],
        ['tr', corners.topRight],
        ['bl', corners.bottomLeft],
        ['br', corners.bottomRight],
      ] as const
    )
      .filter(([, src]) => src)
      .map(([pos, src]) => (
        // eslint-disable-next-line @next/next/no-img-element
        <img key={pos} src={src} alt="" className={`lp-bd__corner lp-bd__corner--${pos}`} draggable={false} />
      ))}
  </div>
);
