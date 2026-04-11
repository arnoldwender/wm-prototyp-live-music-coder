/* SPDX-License-Identifier: MIT
   Copyright (c) 2026 Arnold Wender / Wender Media
   ──────────────────────────────────────────────────────────
   FilterControl molecule — filter type selector + cutoff /
   resonance knobs + live frequency response curve.
   Composes only atoms (Knob + FilterCurve). Cutoff uses a
   log mapping so the knob travel feels musical across the
   20 Hz - 20 kHz range.
   ────────────────────────────────────────────────────────── */

import { useCallback } from 'react'
import Knob from '../atoms/Knob'
import FilterCurve from '../atoms/FilterCurve'

export type FilterType = 'lpf' | 'hpf' | 'bpf' | 'notch'

export interface FilterControlProps {
  /** Current filter topology */
  type: FilterType
  /** Cutoff frequency in Hz (20–20000) */
  cutoff: number
  /** Resonance 0–1 */
  resonance: number
  /** Fires when the user picks a new filter type */
  onTypeChange: (type: FilterType) => void
  /** Fires when the cutoff knob changes — parent gets real Hz */
  onCutoffChange: (hz: number) => void
  /** Fires when the resonance knob changes */
  onResonanceChange: (value: number) => void
}

/* ── Frequency range constants — mirrored in FilterCurve ── */
const MIN_HZ = 20
const MAX_HZ = 20000
const LOG2_MIN = Math.log2(MIN_HZ)
const LOG2_MAX = Math.log2(MAX_HZ)
const LOG2_RANGE = LOG2_MAX - LOG2_MIN

/** Convert real Hz (20–20000) to a 0–1 knob value on a log2 scale */
function hzToNorm(hz: number): number {
  const clamped = Math.max(MIN_HZ, Math.min(MAX_HZ, hz))
  return (Math.log2(clamped) - LOG2_MIN) / LOG2_RANGE
}

/** Convert a 0–1 knob value back to real Hz */
function normToHz(n: number): number {
  const clamped = Math.max(0, Math.min(1, n))
  return Math.pow(2, LOG2_MIN + clamped * LOG2_RANGE)
}

/** Labels shown on the 4 type selector buttons */
const TYPE_LABELS: Record<FilterType, string> = {
  lpf: 'LP',
  hpf: 'HP',
  bpf: 'BP',
  notch: 'Notch',
}

/** Full ARIA labels — read by screen readers */
const TYPE_ARIA: Record<FilterType, string> = {
  lpf: 'Low-pass filter',
  hpf: 'High-pass filter',
  bpf: 'Band-pass filter',
  notch: 'Notch filter',
}

const TYPES: FilterType[] = ['lpf', 'hpf', 'bpf', 'notch']

function FilterControl({
  type,
  cutoff,
  resonance,
  onTypeChange,
  onCutoffChange,
  onResonanceChange,
}: FilterControlProps) {
  /* Cutoff knob handler — converts 0–1 back to Hz for the parent */
  const handleCutoffNorm = useCallback(
    (norm: number) => onCutoffChange(normToHz(norm)),
    [onCutoffChange]
  )

  /* Resonance knob handler — passes through 0–1 directly */
  const handleResonance = useCallback(
    (value: number) => onResonanceChange(value),
    [onResonanceChange]
  )

  const cutoffNorm = hzToNorm(cutoff)
  /* Default cutoff = 1000 Hz — knob centres here on double-click */
  const defaultCutoffNorm = hzToNorm(1000)

  return (
    <div
      role="group"
      aria-label="Filter control"
      style={{
        display: 'flex',
        flexDirection: 'column',
        gap: 'var(--space-2)',
        padding: 'var(--space-2)',
        backgroundColor: 'var(--color-bg-alt)',
        border: '1px solid var(--color-border)',
        borderRadius: 'var(--radius-md)',
      }}
    >
      {/* Frequency response curve on top */}
      <FilterCurve type={type} cutoff={cutoff} resonance={resonance} width={240} height={60} />

      {/* Knobs + type selector row */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: 'var(--space-3)',
        }}
      >
        {/* Cutoff knob — log scale, display in Hz */}
        <Knob
          value={cutoffNorm}
          min={MIN_HZ}
          max={MAX_HZ}
          step={0.01}
          label="Cutoff"
          unit="Hz"
          defaultValue={defaultCutoffNorm}
          size="md"
          onChange={handleCutoffNorm}
        />

        {/* Resonance knob — linear 0–1 */}
        <Knob
          value={resonance}
          min={0}
          max={1}
          step={0.01}
          label="Res"
          defaultValue={0.1}
          size="md"
          onChange={handleResonance}
        />

        {/* Type selector — 4 small buttons, radiogroup semantics */}
        <div
          role="radiogroup"
          aria-label="Filter type"
          style={{
            display: 'flex',
            flexDirection: 'column',
            gap: 'var(--space-1)',
            marginLeft: 'auto',
          }}
        >
          {TYPES.map((t) => {
            const isSelected = t === type
            return (
              <button
                key={t}
                type="button"
                role="radio"
                aria-checked={isSelected}
                aria-label={TYPE_ARIA[t]}
                onClick={() => onTypeChange(t)}
                style={{
                  padding: 'var(--space-1) var(--space-2)',
                  backgroundColor: isSelected ? 'var(--color-primary)' : 'transparent',
                  color: isSelected ? 'var(--color-bg)' : 'var(--color-text-secondary)',
                  border: '1px solid',
                  borderColor: isSelected ? 'var(--color-primary)' : 'var(--color-border)',
                  borderRadius: 'var(--radius-sm)',
                  cursor: 'pointer',
                  fontSize: 'var(--font-size-xs)',
                  fontFamily: 'var(--font-family-sans)',
                  fontWeight: isSelected
                    ? 'var(--font-weight-bold)'
                    : 'var(--font-weight-normal)',
                  minWidth: '48px',
                  minHeight: '24px',
                  transition: 'var(--transition-fast)',
                }}
              >
                {TYPE_LABELS[t]}
              </button>
            )
          })}
        </div>
      </div>
    </div>
  )
}

export default FilterControl
