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
  /** Optional MIDI device name to display in the header */
  midiDeviceName?: string
}

/** localStorage key for persisting the collapsed state */
const STORAGE_KEY = 'lmc-synth-panel-collapsed'

/** Read the persisted collapsed state — defaults to expanded on first load */
function loadCollapsed(): boolean {
  try {
    return localStorage.getItem(STORAGE_KEY) === 'true'
  } catch {
    return false
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
      {/* ── Header — title + collapse toggle + device name ── */}
      <header
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: 'var(--space-3)',
          padding: 'var(--space-2) var(--space-3)',
        }}
      >
        <Piano size={14} style={{ color: 'var(--color-success)' }} aria-hidden="true" />

        <span
          style={{
            fontSize: 'var(--font-size-sm)',
            fontWeight: 'var(--font-weight-medium)',
            color: 'var(--color-text)',
            fontFamily: 'var(--font-family-sans)',
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
            }}
          >
            {midiDeviceName}
          </span>
        )}

        <button
          type="button"
          onClick={toggleCollapsed}
          aria-expanded={!collapsed}
          aria-label={collapsed ? t('editor.expand') : t('editor.collapse')}
          style={{
            marginLeft: 'auto',
            display: 'inline-flex',
            alignItems: 'center',
            gap: 'var(--space-1)',
            padding: 'var(--space-1) var(--space-2)',
            backgroundColor: 'transparent',
            border: '1px solid var(--color-border)',
            borderRadius: 'var(--radius-sm)',
            color: 'var(--color-text-secondary)',
            cursor: 'pointer',
            fontSize: 'var(--font-size-xs)',
            fontFamily: 'var(--font-family-sans)',
            transition: 'var(--transition-fast)',
          }}
        >
          {collapsed ? <ChevronDown size={12} /> : <ChevronUp size={12} />}
          {collapsed ? t('editor.expand') : t('editor.collapse')}
        </button>
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
