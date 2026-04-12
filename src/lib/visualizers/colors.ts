/* SPDX-License-Identifier: MIT
   Copyright (c) 2026 Arnold Wender / Wender Media
   ──────────────────────────────────────────────────────────
   Visualizer color constants — derived from design tokens but as literal values
   because Canvas 2D cannot use CSS custom properties directly.
   Professional palette with gradient stops for polished rendering.
   ────────────────────────────────────────────────────────── */
export const VIZ_COLORS = {
  /* Backgrounds */
  bg: '#09090b',
  bgAlt: '#0f0f12',

  /* Grid */
  grid: '#27272a',
  gridLight: '#3f3f46',

  /* Waveform (purple) */
  waveform: '#a855f7',
  waveformBright: '#c084fc',
  waveformDim: '#7c3aed',
  waveformFill: 'rgba(168, 85, 247, 0.15)',
  waveformGlow: 'rgba(168, 85, 247, 0.4)',

  /* Spectrum (blue → purple gradient) */
  spectrum: '#3b82f6',
  spectrumBright: '#60a5fa',
  spectrumTop: '#a855f7',
  spectrumPeak: '#e879f9',
  spectrumFill: 'rgba(59, 130, 246, 0.3)',
  spectrumGlow: 'rgba(59, 130, 246, 0.3)',

  /* Timeline (green) */
  timeline: '#22c55e',
  timelineBright: '#4ade80',
  timelineBeat: '#a855f7',
  timelineBar: 'rgba(34, 197, 94, 0.4)',
  timelineGlow: 'rgba(34, 197, 94, 0.3)',

  /* Text */
  text: '#a1a1aa',
  textDim: '#71717a',
  textBright: '#d4d4d8',

  /* Accent */
  accent: '#a855f7',
  accentGlow: 'rgba(168, 85, 247, 0.5)',
  white: '#fafafa',

  /* Piano key sidebar */
  keysBg: '#0d0d10',
  keysBlackKey: '#08080a',
  keysBlackKeyAlt: '#0a0a0d',
  keysActiveOverlay: 'rgba(168, 85, 247, 0.35)',
  keysOctaveLine: 'rgba(255,255,255,0.06)',

  /* Beat grid subdivisions (opacity variants of gridLight #3f3f46) */
  gridDim: 'rgba(63, 63, 70, 0.4)',
  gridMid: 'rgba(63, 63, 70, 0.25)',
  gridFaint: 'rgba(63, 63, 70, 0.15)',
} as const;
