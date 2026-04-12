/* SPDX-License-Identifier: MIT
   Copyright (c) 2026 Arnold Wender / Wender Media
   ──────────────────────────────────────────────────────────
   SynthPanel organism — collapsible MIDI synth surface.
   Composes OscillatorSelector + VirtualKeyboard. Renders
   above the editor only when a MIDI device is connected
   (visibility is governed by the parent). Persists the
   collapsed state in localStorage.
   ────────────────────────────────────────────────────────── */

import { useCallback, useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { ChevronDown, ChevronUp, Piano } from 'lucide-react'
import VirtualKeyboard from '../atoms/VirtualKeyboard'
import OscillatorSelector from '../molecules/OscillatorSelector'
import FilterControl, { type FilterType } from '../molecules/FilterControl'
import type { WaveformType } from '../atoms/WaveformIcon'

interface SynthPanelProps {
  /** Whether a MIDI input device is currently connected */
  midiConnected: boolean
  /** MIDI notes currently held — for visual key highlighting */
  activeNotes: number[]
  /** Note-on callback (forwarded to VirtualKeyboard) */
  onNoteOn: (note: number, velocity: number) => void
  /** Note-off callback (forwarded to VirtualKeyboard) */
  onNoteOff: (note: number) => void
  /** Currently selected oscillator waveform */
  oscillator: WaveformType
  /** Oscillator change callback */
  onOscillatorChange: (type: WaveformType) => void
  /** Current filter topology */
  filterType: FilterType
  /** Current filter cutoff (Hz) */
  filterCutoff: number
  /** Current filter resonance (0-1) */
  filterResonance: number
  /** Filter topology change handler */
  onFilterTypeChange: (type: FilterType) => void
  /** Filter cutoff change handler — receives real Hz */
  onFilterCutoffChange: (hz: number) => void
  /** Filter resonance change handler */
  onFilterResonanceChange: (value: number) => void
  /** Optional MIDI device name to display in the header */
  midiDeviceName?: string
}

/** localStorage key for persisting the collapsed state */
const STORAGE_KEY = 'lmc-synth-panel-collapsed'

/** Read the persisted collapsed state — defaults to collapsed on first load
 *  so the panel does not consume vertical space when MIDI first connects. */
function loadCollapsed(): boolean {
  try {
    const stored = localStorage.getItem(STORAGE_KEY)
    /* If never set, default to collapsed — user can expand when they want it */
    return stored === null ? true : stored === 'true'
  } catch {
    return true
  }
}

/** Persist collapsed state, swallowing storage errors */
function saveCollapsed(value: boolean): void {
  try {
    localStorage.setItem(STORAGE_KEY, String(value))
  } catch { /* private mode / quota — ignore */ }
}

function SynthPanel({
  midiConnected,
  activeNotes,
  onNoteOn,
  onNoteOff,
  oscillator,
  onOscillatorChange,
  filterType,
  filterCutoff,
  filterResonance,
  onFilterTypeChange,
  onFilterCutoffChange,
  onFilterResonanceChange,
  midiDeviceName,
}: SynthPanelProps) {
  const { t } = useTranslation()
  const [collapsed, setCollapsed] = useState<boolean>(() => loadCollapsed())

  /* Sync to localStorage whenever the collapsed state changes */
  useEffect(() => {
    saveCollapsed(collapsed)
  }, [collapsed])

  /* Header toggle — pure UI handler */
  const toggleCollapsed = useCallback(() => setCollapsed((c) => !c), [])

  /* Don't render anything if no MIDI device is connected — parent gates this
   * but we double-check so the panel is safe to drop into any layout. */
  if (!midiConnected) return null

  return (
    <section
      aria-label={t('editor.synthMode')}
      className="shrink-0"
      style={{
        backgroundColor: 'var(--color-bg-alt)',
        borderTop: '1px solid var(--color-border)',
        borderBottom: '1px solid var(--color-border)',
      }}
    >
      {/* ── Header — entire bar is the collapse toggle ── */}
      <header
        role="button"
        tabIndex={0}
        aria-expanded={collapsed ? 'false' : 'true'}
        aria-label={collapsed ? t('editor.expand') : t('editor.collapse')}
        onClick={toggleCollapsed}
        onKeyDown={(e) => (e.key === 'Enter' || e.key === ' ') && toggleCollapsed()}
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: 'var(--space-2)',
          padding: 'var(--space-2) var(--space-3)',
          cursor: 'pointer',
          userSelect: 'none',
        }}
      >
        <Piano size={13} style={{ color: 'var(--color-success)', flexShrink: 0 }} aria-hidden="true" />

        <span
          style={{
            fontSize: 'var(--font-size-xs)',
            fontWeight: 'var(--font-weight-medium)',
            color: 'var(--color-text-secondary)',
            fontFamily: 'var(--font-family-mono)',
            letterSpacing: '0.05em',
            textTransform: 'uppercase',
          }}
        >
          {t('editor.synthMode')}
        </span>

        {midiDeviceName && (
          <span
            style={{
              fontSize: 'var(--font-size-xs)',
              color: 'var(--color-text-muted)',
              fontFamily: 'var(--font-family-mono)',
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              whiteSpace: 'nowrap',
              maxWidth: '180px',
            }}
          >
            — {midiDeviceName}
          </span>
        )}

        {/* Chevron pushed to the right — visually communicates toggle */}
        <span style={{ marginLeft: 'auto', color: 'var(--color-text-muted)', display: 'flex' }}>
          {collapsed ? <ChevronDown size={14} /> : <ChevronUp size={14} />}
        </span>
      </header>

      {/* ── Body — only rendered when expanded ── */}
      {!collapsed && (
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            gap: 'var(--space-2)',
            padding: 'var(--space-2) var(--space-3) var(--space-3)',
            borderTop: '1px solid var(--color-border)',
          }}
        >
          {/* Oscillator selector row */}
          <div>
            <div
              style={{
                fontSize: 'var(--font-size-xs)',
                color: 'var(--color-text-muted)',
                marginBottom: 'var(--space-1)',
                fontFamily: 'var(--font-family-sans)',
              }}
            >
              {t('editor.oscillator')}
            </div>
            <OscillatorSelector value={oscillator} onChange={onOscillatorChange} />
          </div>

          {/* Filter — cutoff / resonance / type + frequency response curve */}
          <div>
            <div
              style={{
                fontSize: 'var(--font-size-xs)',
                color: 'var(--color-text-muted)',
                marginBottom: 'var(--space-1)',
                fontFamily: 'var(--font-family-sans)',
              }}
            >
              Filter
            </div>
            <FilterControl
              type={filterType}
              cutoff={filterCutoff}
              resonance={filterResonance}
              onTypeChange={onFilterTypeChange}
              onCutoffChange={onFilterCutoffChange}
              onResonanceChange={onFilterResonanceChange}
            />
          </div>

          {/* Virtual keyboard */}
          <div>
            <div
              style={{
                fontSize: 'var(--font-size-xs)',
                color: 'var(--color-text-muted)',
                marginBottom: 'var(--space-1)',
                fontFamily: 'var(--font-family-sans)',
              }}
            >
              {t('editor.virtualKeyboard')}
            </div>
            <div style={{ overflowX: 'auto' }}>
              <VirtualKeyboard
                activeNotes={activeNotes}
                onNoteOn={onNoteOn}
                onNoteOff={onNoteOff}
              />
            </div>
          </div>
        </div>
      )}
    </section>
  )
}

export default SynthPanel
