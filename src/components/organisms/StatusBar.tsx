/* SPDX-License-Identifier: MIT
   Copyright (c) 2026 Arnold Wender / Wender Media
   ──────────────────────────────────────────────────────────
   StatusBar organism — 3-zone bottom bar inside EditorLayout's <footer>:
   Left: engine badge (colored dot + short name)
   Center: BPM + playback status dot
   Right: compact XP bar with level + legal links
   ────────────────────────────────────────────────────────── */

import { Link } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { useAppStore, xpForLevel } from '../../lib/store'
import { ENGINE_COLORS } from '../../lib/constants'

/* Short display names for each engine */
const ENGINE_SHORT: Record<string, string> = {
  strudel: 'Strudel',
  tonejs: 'Tone.js',
  webaudio: 'WebAudio',
  midi: 'MIDI',
}

/** Compact XP progress bar — level badge + filled bar */
function XpBar() {
  const { t } = useTranslation()
  const userXp = useAppStore((s) => s.userXp)
  const userLevel = useAppStore((s) => s.userLevel)

  /* XP thresholds for current and next level */
  const currentLevelXp = xpForLevel(userLevel)
  const nextLevelXp = xpForLevel(userLevel + 1)
  const xpInLevel = userXp - currentLevelXp
  const xpNeeded = nextLevelXp - currentLevelXp
  const progress = xpNeeded > 0 ? Math.max(0, Math.min(xpInLevel / xpNeeded, 1)) : 0

  return (
    <span
      style={{
        fontFamily: 'var(--font-family-mono)',
        fontSize: 'var(--font-size-ui)',
        color: 'var(--color-text-muted)',
        display: 'inline-flex',
        alignItems: 'center',
        gap: 'var(--space-2)',
      }}
      title={`Level ${userLevel} — ${xpInLevel}/${xpNeeded} XP`}
    >
      {/* Level label */}
      <span style={{ color: 'var(--color-primary)', fontWeight: 'var(--font-weight-bold)' }}>
        Lv.{userLevel}
      </span>

      {/* Progress bar track */}
      <span
        style={{
          display: 'inline-block',
          width: 'var(--space-14)',
          height: 'var(--space-2)',
          backgroundColor: 'var(--color-border)',
          borderRadius: 'var(--radius-sm)',
          overflow: 'hidden',
          verticalAlign: 'middle',
        }}
      >
        {/* Progress bar fill — role="progressbar" for screen readers */}
        <span
          role="progressbar"
          aria-valuenow={Math.round(progress * 100)}
          aria-valuemin={0}
          aria-valuemax={100}
          aria-label={t('status.xpProgress')}
          style={{
            display: 'block',
            width: `${Math.round(progress * 100)}%`,
            height: '100%',
            backgroundColor: 'var(--color-primary)',
            borderRadius: 'var(--radius-sm)',
            transition: 'width var(--transition-base)',
          }}
        />
      </span>
    </span>
  )
}

/** 3-zone status bar: engine | BPM + status | XP + legal links */
function StatusBar() {
  const { t } = useTranslation()
  const defaultEngine = useAppStore((s) => s.defaultEngine)
  const bpm = useAppStore((s) => s.bpm)
  const isPlaying = useAppStore((s) => s.isPlaying)

  /* Resolve engine color token to use for the dot */
  const engineColor = ENGINE_COLORS[defaultEngine]
  const engineName = ENGINE_SHORT[defaultEngine] ?? defaultEngine

  return (
    <div
      className="flex items-center shrink-0"
      style={{
        backgroundColor: 'var(--color-bg-alt)',
        borderTop: '1px solid var(--color-border)',
        padding: '0 var(--space-6)',
        height: 'var(--space-10)',
        fontSize: 'var(--font-size-ui)',
        color: 'var(--color-text-muted)',
        fontFamily: 'var(--font-family-mono)',
        whiteSpace: 'nowrap',
        overflow: 'hidden',
      }}
    >
      {/* ── Left zone: engine badge ── */}
      <div
        className="flex items-center"
        style={{ gap: 'var(--space-3)', minWidth: 0, flex: '0 0 auto' }}
      >
        <span
          style={{
            display: 'inline-block',
            width: 'var(--space-3)',
            height: 'var(--space-3)',
            borderRadius: 'var(--radius-full)',
            backgroundColor: engineColor,
            flexShrink: 0,
          }}
          aria-hidden="true"
        />
        <span>{engineName}</span>
      </div>

      {/* ── Center zone: BPM + playback status ── */}
      <div
        className="flex items-center justify-center"
        style={{ gap: 'var(--space-3)', flex: '1 1 auto', minWidth: 0 }}
      >
        <span style={{ color: 'var(--color-text)', fontWeight: 'var(--font-weight-bold)' }}>
          {bpm}
        </span>
        <span>BPM</span>
        <span
          style={{
            display: 'inline-block',
            width: 'var(--space-3)',
            height: 'var(--space-3)',
            borderRadius: 'var(--radius-full)',
            backgroundColor: isPlaying ? 'var(--color-success)' : 'var(--color-text-muted)',
            flexShrink: 0,
          }}
          aria-label={isPlaying ? t('status.playing') : t('status.stopped')}
          role="status"
        />
      </div>

      {/* ── Right zone: XP bar + legal links ── */}
      <div
        className="flex items-center"
        style={{ flex: '0 0 auto', minWidth: 0, gap: 'var(--space-4)' }}
      >
        <XpBar />
        <Link
          to="/changelog"
          style={{
            color: 'var(--color-primary)',
            textDecoration: 'none',
            fontSize: 'var(--font-size-2xs)',
            fontWeight: 'var(--font-weight-medium)',
          }}
        >
          {t('status.whatsNew')}
        </Link>
        <span aria-hidden="true" style={{ color: 'var(--color-text-muted)', fontSize: 'var(--font-size-2xs)' }}>
          |
        </span>
        <Link
          to="/legal"
          style={{ color: 'var(--color-text-muted)', textDecoration: 'none', fontSize: 'var(--font-size-2xs)' }}
        >
          {t('legal.impressum')}
        </Link>
        <span aria-hidden="true" style={{ color: 'var(--color-text-muted)', fontSize: 'var(--font-size-2xs)' }}>
          |
        </span>
        <Link
          to="/datenschutz"
          style={{ color: 'var(--color-text-muted)', textDecoration: 'none', fontSize: 'var(--font-size-2xs)' }}
        >
          {t('legal.datenschutz')}
        </Link>
      </div>
    </div>
  )
}

export default StatusBar
