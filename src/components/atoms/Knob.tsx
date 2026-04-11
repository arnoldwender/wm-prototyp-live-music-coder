/* SPDX-License-Identifier: MIT
   Copyright (c) 2026 Arnold Wender / Wender Media
   ──────────────────────────────────────────────────────────
   Knob atom — rotary parameter control with SVG arc indicator.
   Pointer-event driven vertical drag (up = increase), shift
   drag for fine control, double-click to reset, mouse wheel
   for stepped adjustment, keyboard arrows for a11y.
   ────────────────────────────────────────────────────────── */

import { useCallback, useEffect, useRef, useState } from 'react'

export interface KnobProps {
  /** Current normalized value (0–1) — controlled by parent */
  value: number
  /** Display minimum — used to format the readout (default 0) */
  min?: number
  /** Display maximum — used to format the readout (default 1) */
  max?: number
  /** Increment step used by wheel + arrow keys (default 0.01) */
  step?: number
  /** Parameter name shown below the knob */
  label: string
  /** Optional display unit (Hz, dB, ms, %) */
  unit?: string
  /** Reset-to value on double-click / Enter key (default 0.5) */
  defaultValue?: number
  /** Accent colour — must be a CSS token (default var(--color-primary)) */
  color?: string
  /** Visual size preset — sm=48 / md=64 / lg=80 */
  size?: 'sm' | 'md' | 'lg'
  /** Change handler — receives the new normalized 0–1 value */
  onChange: (value: number) => void
}

/** Pixel sizes for the SVG box per preset */
const SIZE_MAP = {
  sm: 48,
  md: 64,
  lg: 80,
} as const

/** Angular sweep — 270 degrees from -135 to +135 (top gap) */
const ARC_START_DEG = -135
const ARC_END_DEG = 135
const ARC_RANGE_DEG = ARC_END_DEG - ARC_START_DEG

/** Format the display value honouring the unit conventions */
function formatValue(value: number, min: number, max: number, unit?: string): string {
  const display = min + (max - min) * value
  if (unit === 'Hz') {
    if (display >= 1000) return `${(display / 1000).toFixed(1)}k`
    return `${Math.round(display)}`
  }
  if (unit === 'ms' || unit === '%') return `${Math.round(display)}`
  return display.toFixed(2)
}

/** Clamp helper — avoids values escaping the [0,1] normalized range */
function clamp01(n: number): number {
  return Math.min(1, Math.max(0, n))
}

/** Convert a 0–1 value to an SVG arc path for the filled portion */
function arcPath(cx: number, cy: number, r: number, value: number): string {
  /* Sweep from start angle up to (start + value * range) */
  const startRad = (ARC_START_DEG * Math.PI) / 180
  const endRad = ((ARC_START_DEG + value * ARC_RANGE_DEG) * Math.PI) / 180
  const x1 = cx + r * Math.cos(startRad)
  const y1 = cy + r * Math.sin(startRad)
  const x2 = cx + r * Math.cos(endRad)
  const y2 = cy + r * Math.sin(endRad)
  /* Large-arc-flag must be 1 when sweep exceeds 180 degrees */
  const largeArc = value * ARC_RANGE_DEG > 180 ? 1 : 0
  return `M ${x1} ${y1} A ${r} ${r} 0 ${largeArc} 1 ${x2} ${y2}`
}

/** Background full-sweep arc (always drawn) */
function backgroundArcPath(cx: number, cy: number, r: number): string {
  const startRad = (ARC_START_DEG * Math.PI) / 180
  const endRad = (ARC_END_DEG * Math.PI) / 180
  const x1 = cx + r * Math.cos(startRad)
  const y1 = cy + r * Math.sin(startRad)
  const x2 = cx + r * Math.cos(endRad)
  const y2 = cy + r * Math.sin(endRad)
  return `M ${x1} ${y1} A ${r} ${r} 0 1 1 ${x2} ${y2}`
}

/** Position of the indicator dot for the current value */
function indicatorPos(cx: number, cy: number, r: number, value: number): { x: number; y: number } {
  const angleDeg = ARC_START_DEG + value * ARC_RANGE_DEG
  const rad = (angleDeg * Math.PI) / 180
  return { x: cx + r * Math.cos(rad), y: cy + r * Math.sin(rad) }
}

function Knob({
  value,
  min = 0,
  max = 1,
  step = 0.01,
  label,
  unit,
  defaultValue = 0.5,
  color = 'var(--color-primary)',
  size = 'md',
  onChange,
}: KnobProps) {
  const px = SIZE_MAP[size]
  const cx = px / 2
  const cy = px / 2
  /* Radius leaves breathing room for stroke widths */
  const r = px / 2 - 6

  /* Drag bookkeeping — refs so the document-level listeners see latest data */
  const draggingRef = useRef(false)
  const startYRef = useRef(0)
  const startValueRef = useRef(value)
  const shiftRef = useRef(false)
  /* Latest onChange — avoids stale closures inside the document listeners */
  const onChangeRef = useRef(onChange)
  onChangeRef.current = onChange

  /* Local hover flag for the focus/hover outline — purely cosmetic */
  const [, setIsDragging] = useState(false)

  /* Pointer move handler — attached to documentElement so drag continues
   * even when the pointer leaves the SVG bounds (standard DAW behaviour) */
  const handleDocPointerMove = useCallback((e: PointerEvent) => {
    if (!draggingRef.current) return
    /* Positive delta = pointer moved UP → increase value */
    const delta = startYRef.current - e.clientY
    const sensitivity = shiftRef.current ? 0.0005 : 0.005
    const next = clamp01(startValueRef.current + delta * sensitivity)
    onChangeRef.current(next)
  }, [])

  /* Pointer up — stop tracking and remove document listeners */
  const handleDocPointerUp = useCallback(() => {
    draggingRef.current = false
    setIsDragging(false)
    document.documentElement.removeEventListener('pointermove', handleDocPointerMove)
    document.documentElement.removeEventListener('pointerup', handleDocPointerUp)
    document.documentElement.removeEventListener('pointercancel', handleDocPointerUp)
  }, [handleDocPointerMove])

  /* Clean up any leaked listeners on unmount */
  useEffect(() => {
    return () => {
      document.documentElement.removeEventListener('pointermove', handleDocPointerMove)
      document.documentElement.removeEventListener('pointerup', handleDocPointerUp)
      document.documentElement.removeEventListener('pointercancel', handleDocPointerUp)
    }
  }, [handleDocPointerMove, handleDocPointerUp])

  /* Pointer down on the SVG — capture + register doc listeners */
  const handlePointerDown = useCallback(
    (e: React.PointerEvent<SVGSVGElement>) => {
      e.preventDefault()
      draggingRef.current = true
      setIsDragging(true)
      startYRef.current = e.clientY
      startValueRef.current = value
      shiftRef.current = e.shiftKey
      /* setPointerCapture is important for mobile — otherwise the SVG stops
       * receiving events as soon as the finger moves a few pixels */
      try {
        ;(e.currentTarget as SVGSVGElement).setPointerCapture(e.pointerId)
      } catch { /* not all browsers support capture on SVG — ignore */ }
      document.documentElement.addEventListener('pointermove', handleDocPointerMove)
      document.documentElement.addEventListener('pointerup', handleDocPointerUp)
      document.documentElement.addEventListener('pointercancel', handleDocPointerUp)
    },
    [value, handleDocPointerMove, handleDocPointerUp]
  )

  /* Track shift key during drag so live-switching precision mid-drag works */
  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => { if (e.key === 'Shift') shiftRef.current = true }
    const onKeyUp = (e: KeyboardEvent) => { if (e.key === 'Shift') shiftRef.current = false }
    window.addEventListener('keydown', onKeyDown)
    window.addEventListener('keyup', onKeyUp)
    return () => {
      window.removeEventListener('keydown', onKeyDown)
      window.removeEventListener('keyup', onKeyUp)
    }
  }, [])

  /* Double-click resets to the default (centre of range by convention) */
  const handleDoubleClick = useCallback(() => {
    onChange(defaultValue)
  }, [defaultValue, onChange])

  /* Wheel increments by one step — matches VST / web synth conventions */
  const handleWheel = useCallback(
    (e: React.WheelEvent<SVGSVGElement>) => {
      e.preventDefault()
      /* Wheel up (negative deltaY) increases value */
      const direction = e.deltaY < 0 ? 1 : -1
      onChange(clamp01(value + direction * step))
    },
    [value, step, onChange]
  )

  /* Keyboard a11y — ArrowUp/Down steps, Home/End jump to extremes, Enter resets */
  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent<SVGSVGElement>) => {
      switch (e.key) {
        case 'ArrowUp':
        case 'ArrowRight':
          e.preventDefault()
          onChange(clamp01(value + step))
          break
        case 'ArrowDown':
        case 'ArrowLeft':
          e.preventDefault()
          onChange(clamp01(value - step))
          break
        case 'Home':
          e.preventDefault()
          onChange(0)
          break
        case 'End':
          e.preventDefault()
          onChange(1)
          break
        case 'Enter':
          e.preventDefault()
          onChange(defaultValue)
          break
      }
    },
    [value, step, defaultValue, onChange]
  )

  /* Derived visuals */
  const indicator = indicatorPos(cx, cy, r, value)
  const displayValue = formatValue(value, min, max, unit)
  const displayMin = min + (max - min) * 0
  const displayMax = min + (max - min) * 1
  const displayNow = min + (max - min) * value

  return (
    <div
      style={{
        display: 'inline-flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: 'var(--space-1)',
        padding: 'var(--space-1)',
        fontFamily: 'var(--font-family-sans)',
        userSelect: 'none',
      }}
    >
      <svg
        role="slider"
        aria-label={label}
        aria-valuemin={displayMin}
        aria-valuemax={displayMax}
        aria-valuenow={displayNow}
        aria-valuetext={`${displayValue}${unit ?? ''}`}
        tabIndex={0}
        width={px}
        height={px}
        viewBox={`0 0 ${px} ${px}`}
        onPointerDown={handlePointerDown}
        onDoubleClick={handleDoubleClick}
        onWheel={handleWheel}
        onKeyDown={handleKeyDown}
        style={{
          cursor: 'ns-resize',
          touchAction: 'none',
          outline: 'none',
          display: 'block',
        }}
      >
        {/* Background track arc — full 270 degree sweep */}
        <path
          d={backgroundArcPath(cx, cy, r)}
          fill="none"
          stroke="var(--color-bg)"
          strokeWidth={4}
          strokeLinecap="round"
        />
        {/* Filled value arc — from 0 to current value */}
        {value > 0 && (
          <path
            d={arcPath(cx, cy, r, value)}
            fill="none"
            stroke={color}
            strokeWidth={4}
            strokeLinecap="round"
          />
        )}
        {/* Inner disc — provides the knob body visual */}
        <circle
          cx={cx}
          cy={cy}
          r={r - 6}
          fill="var(--color-bg-alt)"
          stroke="var(--color-border)"
          strokeWidth={1}
        />
        {/* Indicator dot sitting on the arc at the current value */}
        <circle
          cx={indicator.x}
          cy={indicator.y}
          r={3}
          fill={color}
        />
      </svg>

      {/* Label + formatted readout below the knob */}
      <div
        style={{
          fontSize: 'var(--font-size-xs)',
          color: 'var(--color-text-muted)',
          lineHeight: 'var(--line-height-tight)',
          textAlign: 'center',
        }}
      >
        {label}
      </div>
      <div
        style={{
          fontSize: 'var(--font-size-xs)',
          color: 'var(--color-text)',
          fontFamily: 'var(--font-family-mono)',
          lineHeight: 'var(--line-height-tight)',
          textAlign: 'center',
        }}
      >
        {displayValue}
        {unit ? <span style={{ color: 'var(--color-text-muted)' }}>{unit}</span> : null}
      </div>
    </div>
  )
}

export default Knob
