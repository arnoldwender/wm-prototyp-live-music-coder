/* SPDX-License-Identifier: MIT
   Copyright (c) 2026 Arnold Wender / Wender Media
   ──────────────────────────────────────────────────────────
   NowPlayingIndicator — floating "Now Playing" indicator
   that appears at the bottom-right of the viewport. Shows
   engine name, playing item label, animated pulse dot,
   and a stop button. Slides in when isPlaying is true.
   ────────────────────────────────────────────────────────── */

import { Square } from 'lucide-react'
import { ENGINE_COLORS } from '../../lib/constants'
import type { EngineType } from '../../types/engine'

interface NowPlayingIndicatorProps {
  /** Whether audio is currently playing */
  isPlaying: boolean
  /** Name of the currently playing item (sample, example, etc.) */
  label: string
  /** Which audio engine is playing — determines accent color */
  engineType: EngineType
  /** Callback to stop playback */
  onStop: () => void
}

/** Inline keyframes for pulse animation and slide-in entrance */
const animationCSS = `
@keyframes now-playing-pulse {
  0%, 100% { opacity: 1; }
  50%      { opacity: 0.3; }
}
@keyframes now-playing-slide-in {
  from { transform: translateY(100%); opacity: 0; }
  to   { transform: translateY(0); opacity: 1; }
}
`

/** Floating bottom-right indicator showing current playback state */
export function NowPlayingIndicator({ isPlaying, label, engineType, onStop }: NowPlayingIndicatorProps) {
  /* Don't render when nothing is playing */
  if (!isPlaying) return null

  const engineColor = ENGINE_COLORS[engineType]

  return (
    <>
      <style>{animationCSS}</style>
      <div
        role="status"
        aria-live="polite"
        aria-label={`Now playing: ${label}`}
        style={{
          position: 'fixed',
          bottom: 'var(--space-8)',
          right: 'var(--space-8)',
          zIndex: 100,
          display: 'flex',
          alignItems: 'center',
          gap: 'var(--space-4)',
          padding: 'var(--space-4) var(--space-6)',
          backgroundColor: 'var(--color-bg-elevated)',
          border: '1px solid',
          borderColor: engineColor,
          borderRadius: 'var(--radius-md)',
          boxShadow: 'var(--shadow-lg)',
          fontFamily: 'var(--font-family-sans)',
          animation: 'now-playing-slide-in var(--transition-base) ease-out',
        }}
      >
        {/* Animated pulse dot — engine-colored */}
        <span
          aria-hidden="true"
          style={{
            display: 'inline-block',
            width: 'var(--space-3)',
            height: 'var(--space-3)',
            borderRadius: 'var(--radius-full)',
            backgroundColor: engineColor,
            animation: 'now-playing-pulse 1.5s ease-in-out infinite',
            flexShrink: 0,
          }}
        />

        {/* Label and "Playing..." text */}
        <div style={{ minWidth: 0 }}>
          <div
            style={{
              fontSize: 'var(--font-size-xs)',
              fontWeight: 'var(--font-weight-semibold)',
              color: 'var(--color-text)',
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              whiteSpace: 'nowrap',
              maxWidth: '200px',
            }}
          >
            {label}
          </div>
          <div
            style={{
              fontSize: 'var(--font-size-xs)',
              color: engineColor,
            }}
          >
            Playing...
          </div>
        </div>

        {/* Stop button */}
        <button
          type="button"
          onClick={onStop}
          aria-label="Stop playback"
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            justifyContent: 'center',
            width: '28px',
            height: '28px',
            backgroundColor: 'transparent',
            border: '1px solid var(--color-border)',
            borderRadius: 'var(--radius-sm)',
            color: 'var(--color-text-secondary)',
            cursor: 'pointer',
            transition: 'var(--transition-fast)',
            flexShrink: 0,
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.backgroundColor = 'var(--color-bg-hover)'
            e.currentTarget.style.color = 'var(--color-error)'
            e.currentTarget.style.borderColor = 'var(--color-error)'
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.backgroundColor = 'transparent'
            e.currentTarget.style.color = 'var(--color-text-secondary)'
            e.currentTarget.style.borderColor = 'var(--color-border)'
          }}
        >
          <Square size={12} />
        </button>
      </div>
    </>
  )
}
