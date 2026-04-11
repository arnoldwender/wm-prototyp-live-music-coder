/* SPDX-License-Identifier: MIT
   Copyright (c) 2026 Arnold Wender / Wender Media
   ──────────────────────────────────────────────────────────
   OscillatorSelector molecule — 4 waveform buttons in a row.
   Visual chooser for the synth's oscillator type. Composes
   the WaveformIcon atom and follows the FilterPill styling
   conventions for active/inactive states.
   ────────────────────────────────────────────────────────── */

import WaveformIcon, { type WaveformType } from '../atoms/WaveformIcon'

interface OscillatorSelectorProps {
  /** Currently selected waveform */
  value: WaveformType
  /** Selection change handler */
  onChange: (type: WaveformType) => void
}

/** All four oscillator types — order matches synth UI conventions */
const OSCILLATOR_TYPES: WaveformType[] = ['sine', 'sawtooth', 'square', 'triangle']

/** Display label for each oscillator type */
const LABELS: Record<WaveformType, string> = {
  sine: 'Sine',
  sawtooth: 'Saw',
  square: 'Square',
  triangle: 'Triangle',
}

/** 4-button waveform selector with iconography */
function OscillatorSelector({ value, onChange }: OscillatorSelectorProps) {
  return (
    <div
      role="radiogroup"
      aria-label="Oscillator waveform"
      style={{
        display: 'flex',
        gap: 'var(--space-2)',
        padding: 'var(--space-2)',
      }}
    >
      {OSCILLATOR_TYPES.map((type) => {
        const isSelected = value === type
        return (
          <button
            key={type}
            type="button"
            role="radio"
            aria-checked={isSelected}
            aria-label={`${LABELS[type]} waveform`}
            onClick={() => onChange(type)}
            style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              gap: 'var(--space-1)',
              padding: 'var(--space-3)',
              backgroundColor: isSelected ? 'var(--color-primary)' : 'transparent',
              color: isSelected ? 'var(--color-bg)' : 'var(--color-text-secondary)',
              border: '1px solid',
              borderColor: isSelected ? 'var(--color-primary)' : 'var(--color-border)',
              borderRadius: 'var(--radius-md)',
              cursor: 'pointer',
              transition: 'var(--transition-fast)',
              minWidth: '64px',
              minHeight: '64px',
              fontFamily: 'var(--font-family-sans)',
            }}
            onMouseEnter={(e) => {
              if (!isSelected) {
                e.currentTarget.style.backgroundColor = 'var(--color-border)'
              }
            }}
            onMouseLeave={(e) => {
              if (!isSelected) {
                e.currentTarget.style.backgroundColor = 'transparent'
              }
            }}
          >
            <WaveformIcon type={type} size={32} />
            <span
              style={{
                fontSize: 'var(--font-size-xs)',
                color: isSelected ? 'var(--color-bg)' : 'var(--color-text-muted)',
                fontWeight: isSelected ? 'var(--font-weight-bold)' : 'var(--font-weight-normal)',
                lineHeight: 'var(--line-height-tight)',
              }}
            >
              {LABELS[type]}
            </span>
          </button>
        )
      })}
    </div>
  )
}

export default OscillatorSelector
