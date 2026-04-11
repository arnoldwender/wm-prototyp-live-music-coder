/* SPDX-License-Identifier: MIT
   Copyright (c) 2026 Arnold Wender / Wender Media
   ──────────────────────────────────────────────────────────
   FilterCurve atom — canvas-based frequency response plot.
   Renders a simplified biquad filter response for LPF/HPF/
   BPF/Notch with configurable cutoff and resonance. X-axis
   is logarithmic 20 Hz - 20 kHz, Y-axis -24 dB to +24 dB.
   Redraws whenever any prop changes.
   ────────────────────────────────────────────────────────── */

import { useEffect, useRef } from 'react'

export interface FilterCurveProps {
  /** Filter topology — drives the curve shape */
  type: 'lpf' | 'hpf' | 'bpf' | 'notch'
  /** Cutoff frequency in Hz (20–20000) */
  cutoff: number
  /** Resonance — 0 to 1 (drives peak height at cutoff) */
  resonance: number
  /** Canvas width in CSS pixels (default 240) */
  width?: number
  /** Canvas height in CSS pixels (default 60) */
  height?: number
}

/* ── Axis constants ── */
const MIN_HZ = 20
const MAX_HZ = 20000
const MIN_DB = -24
const MAX_DB = 24

/** Log10 helper — frequencies are plotted on a log axis */
const LOG10 = Math.log10

/** Resolve a CSS variable to an actual colour string from :root */
function readCssVar(name: string, fallback: string): string {
  if (typeof window === 'undefined') return fallback
  try {
    const v = getComputedStyle(document.documentElement).getPropertyValue(name).trim()
    return v || fallback
  } catch {
    return fallback
  }
}

/** Map a frequency to an X pixel on a log axis */
function freqToX(hz: number, width: number): number {
  const logMin = LOG10(MIN_HZ)
  const logMax = LOG10(MAX_HZ)
  const logHz = LOG10(Math.max(MIN_HZ, Math.min(MAX_HZ, hz)))
  return ((logHz - logMin) / (logMax - logMin)) * width
}

/** Map a decibel value to a Y pixel (top = max dB, bottom = min dB) */
function dbToY(db: number, height: number): number {
  const clamped = Math.max(MIN_DB, Math.min(MAX_DB, db))
  return height - ((clamped - MIN_DB) / (MAX_DB - MIN_DB)) * height
}

/**
 * Simplified biquad response at a given frequency.
 *
 * This is NOT a real biquad calculation — it's a visual approximation that
 * captures the intuitive shape each filter type should produce. Accurate
 * enough to guide the user but avoids pulling in a DSP math library for
 * what is essentially a UI hint.
 */
function filterResponse(
  type: 'lpf' | 'hpf' | 'bpf' | 'notch',
  hz: number,
  cutoff: number,
  resonance: number
): number {
  /* Octave distance from cutoff — positive = above cutoff */
  const octavesAboveCutoff = LOG10(hz / cutoff) / LOG10(2)
  /* Resonance peak in dB — up to 12 dB at full resonance */
  const peakDb = resonance * 12
  /* Narrow Gaussian-ish peak centred on the cutoff */
  const peak = peakDb * Math.exp(-Math.pow(octavesAboveCutoff * 1.5, 2))

  let baseDb = 0
  switch (type) {
    case 'lpf':
      /* Flat below cutoff, -12 dB/octave above */
      baseDb = octavesAboveCutoff <= 0 ? 0 : -12 * octavesAboveCutoff
      return baseDb + peak
    case 'hpf':
      /* -12 dB/octave below cutoff, flat above */
      baseDb = octavesAboveCutoff >= 0 ? 0 : 12 * octavesAboveCutoff
      return baseDb + peak
    case 'bpf':
      /* -6 dB/octave falloff on both sides of the peak */
      baseDb = -6 * Math.abs(octavesAboveCutoff)
      return baseDb + peak
    case 'notch':
      /* Inverted BPF — flat except for a dip at cutoff */
      return -Math.exp(-Math.pow(octavesAboveCutoff * 1.5, 2)) * (12 + peakDb)
  }
}

function FilterCurve({
  type,
  cutoff,
  resonance,
  width = 240,
  height = 60,
}: FilterCurveProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null)

  /* Draw effect — re-runs whenever any relevant prop changes */
  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    /* High-DPI support — scale the backing store to devicePixelRatio */
    const dpr = window.devicePixelRatio || 1
    canvas.width = width * dpr
    canvas.height = height * dpr
    canvas.style.width = `${width}px`
    canvas.style.height = `${height}px`
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0)

    /* Resolve design tokens once per draw — tokens can change with theme */
    const primary = readCssVar('--color-primary', '#a855f7')
    const border = readCssVar('--color-border', '#2a2a2a')
    const textMuted = readCssVar('--color-text-muted', '#888888')

    /* Background fill — matches the surrounding panel */
    ctx.clearRect(0, 0, width, height)

    /* ── Octave grid lines at 100 Hz, 1 kHz, 10 kHz ── */
    ctx.strokeStyle = border
    ctx.lineWidth = 1
    ctx.font = `9px var(--font-family-mono, monospace)`
    ctx.fillStyle = textMuted
    const gridFreqs: { hz: number; label: string }[] = [
      { hz: 100, label: '100' },
      { hz: 1000, label: '1k' },
      { hz: 10000, label: '10k' },
    ]
    for (const { hz, label } of gridFreqs) {
      const x = freqToX(hz, width)
      ctx.beginPath()
      ctx.moveTo(x, 0)
      ctx.lineTo(x, height)
      ctx.stroke()
      ctx.fillText(label, x + 2, height - 2)
    }

    /* 0 dB reference line */
    const zeroY = dbToY(0, height)
    ctx.beginPath()
    ctx.moveTo(0, zeroY)
    ctx.lineTo(width, zeroY)
    ctx.stroke()

    /* ── Filter response curve ── */
    ctx.strokeStyle = primary
    ctx.lineWidth = 2
    ctx.beginPath()
    /* Sample 1 point per pixel — smooth enough for this scale */
    for (let x = 0; x <= width; x++) {
      /* Invert freqToX — map x back to Hz on the log axis */
      const logMin = LOG10(MIN_HZ)
      const logMax = LOG10(MAX_HZ)
      const logHz = logMin + (x / width) * (logMax - logMin)
      const hz = Math.pow(10, logHz)
      const db = filterResponse(type, hz, cutoff, resonance)
      const y = dbToY(db, height)
      if (x === 0) ctx.moveTo(x, y)
      else ctx.lineTo(x, y)
    }
    ctx.stroke()
  }, [type, cutoff, resonance, width, height])

  return (
    <canvas
      ref={canvasRef}
      role="img"
      aria-label={`Filter response — ${type.toUpperCase()} @ ${Math.round(cutoff)}Hz`}
      style={{
        display: 'block',
        width: `${width}px`,
        height: `${height}px`,
        backgroundColor: 'var(--color-bg)',
        border: '1px solid var(--color-border)',
        borderRadius: 'var(--radius-sm)',
      }}
    />
  )
}

export default FilterCurve
