/* SPDX-License-Identifier: MIT
   Copyright (c) 2026 Arnold Wender / Wender Media
   ──────────────────────────────────────────────────────────
   Visualizer color constants — art direction "SIGNAL ROOM".

   Canvas 2D cannot resolve CSS custom properties, so these are
   literal values mirrored from src/styles/tokens/colors.css. This is
   the correct pattern, not a token violation: colors.test.ts parses
   the CSS at test time and fails the build if the two drift apart.

   The token each literal mirrors is named in the comment. Values that
   are canvas-only (gradient endpoints, key-bed tints) carry the OKLCH
   triplet they were generated from instead, so the ramp stays
   regenerable.
   ────────────────────────────────────────────────────────── */
export const VIZ_COLORS = {
  /* Backgrounds */
  bg: '#0f0c0a',        /* --color-bg */
  bgAlt: '#161311',     /* oklch(0.190 0.006 70) — canvas gradient top */

  /* Grid */
  grid: '#26231f',      /* --color-border-dim */
  gridLight: '#3f3a35', /* --color-border */

  /* Waveform (brand amber) */
  waveform: '#ffa54b',       /* --color-primary */
  waveformBright: '#ffc476', /* --color-primary-ink */
  waveformDim: '#c56c21',    /* --color-primary-dim */
  waveformFill: 'rgba(255, 165, 75, 0.15)',
  waveformGlow: 'rgba(255, 165, 75, 0.4)',

  /* Spectrum (cornflower floor -> amber ceiling, orchid peaks).
     The vertical hue ramp doubles as a level cue: cool = quiet,
     warm = loud, so amplitude reads without reference to the scale. */
  spectrum: '#84baff',       /* --color-tonejs */
  spectrumBright: '#a5d4ff', /* oklch(0.860 0.100 255) */
  spectrumTop: '#ffa54b',    /* --color-primary */
  spectrumPeak: '#d07ec9',   /* --color-midi */
  spectrumFill: 'rgba(132, 186, 255, 0.3)',
  spectrumGlow: 'rgba(132, 186, 255, 0.3)',

  /* Timeline (signal green, amber beat marker) */
  timeline: '#73dc86',       /* --color-success */
  timelineBright: '#9aefa6', /* oklch(0.880 0.130 148) */
  timelineBeat: '#ffa54b',   /* --color-primary */
  timelineBar: 'rgba(115, 220, 134, 0.4)',
  timelineGlow: 'rgba(115, 220, 134, 0.3)',

  /* Text */
  text: '#b7b4b1',       /* --color-text-secondary */
  textDim: '#9e9a95',    /* --color-text-muted */
  textBright: '#d3d0cd', /* oklch(0.860 0.005 70) */

  /* Accent */
  accent: '#ffa54b',     /* --color-primary */
  accentGlow: 'rgba(255, 165, 75, 0.5)',
  white: '#f5f3f1',      /* --color-text */

  /* Piano key sidebar — warm carbon key bed */
  keysBg: '#12100e',          /* oklch(0.175 0.006 70) */
  keysBlackKey: '#090806',    /* oklch(0.135 0.005 70) */
  keysBlackKeyAlt: '#0d0b09', /* oklch(0.150 0.005 70) */
  keysActiveOverlay: 'rgba(255, 165, 75, 0.35)',
  keysOctaveLine: 'rgba(255,255,255,0.06)',

  /* Beat grid subdivisions (opacity variants of gridLight #3f3a35) */
  gridDim: 'rgba(63, 58, 53, 0.4)',
  gridMid: 'rgba(63, 58, 53, 0.25)',
  gridFaint: 'rgba(63, 58, 53, 0.15)',
  gridCLine: 'rgba(63, 58, 53, 0.35)',

  /* Note row backgrounds */
  keysWhiteKey: '#201e1b', /* oklch(0.235 0.007 70) */
  rowBlackKeyBg: 'rgba(0, 0, 0, 0.12)',

  /* Velocity lane */
  velLaneBg: 'rgba(0, 0, 0, 0.35)',

  /* Note bar labels */
  noteLabelText: 'rgba(255,255,255,0.7)',
} as const;
