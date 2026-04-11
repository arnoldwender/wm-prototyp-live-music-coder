/* SPDX-License-Identifier: MIT
   Copyright (c) 2026 Arnold Wender / Wender Media
   ──────────────────────────────────────────────────────────
   WaveformIcon atom — SVG icon for oscillator waveforms.
   Pure presentational, no dependencies. Used by the synth
   OscillatorSelector to visually represent the four basic
   waveform types (sine, sawtooth, square, triangle).
   ────────────────────────────────────────────────────────── */

/** Supported oscillator waveform types */
export type WaveformType = 'sine' | 'sawtooth' | 'square' | 'triangle'

interface WaveformIconProps {
  /** Which waveform shape to draw */
  type: WaveformType
  /** Square icon size in pixels */
  size?: number
  /** Stroke color — defaults to currentColor so it inherits from parent */
  color?: string
}

/* Pre-computed SVG paths for each waveform — drawn inside a 24x24 viewBox.
 * All paths span horizontally from x=2 to x=22 (one full cycle) and oscillate
 * vertically between y=6 (peak) and y=18 (trough), centered on y=12. */
const WAVEFORM_PATHS: Record<WaveformType, string> = {
  /* Sine — smooth cubic bezier wave, two control points per half cycle */
  sine: 'M 2 12 C 5 6, 9 6, 12 12 S 19 18, 22 12',
  /* Sawtooth — vertical jump up, then linear ramp down */
  sawtooth: 'M 2 18 L 2 6 L 22 18 L 22 6',
  /* Square — step function, instant transitions between high/low */
  square: 'M 2 18 L 2 6 L 12 6 L 12 18 L 22 18 L 22 6',
  /* Triangle — linear zigzag, peak at center */
  triangle: 'M 2 18 L 12 6 L 22 18',
}

/** Renders a waveform shape as an inline SVG */
function WaveformIcon({ type, size = 24, color = 'currentColor' }: WaveformIconProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke={color}
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      role="img"
    >
      <path d={WAVEFORM_PATHS[type]} />
    </svg>
  )
}

export default WaveformIcon
