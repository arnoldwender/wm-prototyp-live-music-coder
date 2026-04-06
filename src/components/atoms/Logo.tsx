/* SPDX-License-Identifier: MIT
   Copyright (c) 2026 Arnold Wender / Wender Media
   ──────────────────────────────────────────────────────────
   Logo atom — audio waveform icon + app name + optional tagline.
   Used in landing page header and editor transport bar.
   ---------------------------------------------------------- */

import { useTranslation } from 'react-i18next'

/** Size presets for icon, title, and tagline */
const SIZE_MAP = {
  sm: { icon: 20, title: 'var(--font-size-sm)', tagline: 'var(--font-size-xs)', gap: 'var(--space-2)' },
  md: { icon: 28, title: 'var(--font-size-base)', tagline: 'var(--font-size-xs)', gap: 'var(--space-3)' },
  lg: { icon: 36, title: 'var(--font-size-lg)', tagline: 'var(--font-size-sm)', gap: 'var(--space-3)' },
} as const

interface Props {
  /** Show "by Wender Media" tagline below the app name */
  showTagline?: boolean
  /** Icon and text scale */
  size?: 'sm' | 'md' | 'lg'
}

/** Audio waveform SVG — 4 vertical bars representing an equalizer */
function WaveformIcon({ size }: { size: number }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      aria-hidden="true"
      style={{ flexShrink: 0 }}
    >
      {/* Bar 1 — shortest, lightest purple */}
      <rect x="2" y="10" width="4" rx="2" height="8" fill="var(--color-primary-light, var(--color-primary))" opacity={0.6} />
      {/* Bar 2 — medium height */}
      <rect x="8" y="4" width="4" rx="2" height="16" fill="var(--color-primary)" opacity={0.8} />
      {/* Bar 3 — tallest */}
      <rect x="14" y="2" width="4" rx="2" height="20" fill="var(--color-primary)" />
      {/* Bar 4 — medium, darkest accent */}
      <rect x="20" y="7" width="4" rx="2" height="12" fill="var(--color-primary-dark, var(--color-primary))" opacity={0.9} />
    </svg>
  )
}

/** Logo — waveform icon + "Live Music Coder" + optional tagline */
function Logo({ showTagline = false, size = 'md' }: Props) {
  const { t } = useTranslation()
  const s = SIZE_MAP[size]

  return (
    <div
      className="flex items-center"
      style={{ gap: s.gap }}
    >
      {/* Waveform equalizer icon */}
      <WaveformIcon size={s.icon} />

      {/* App name + optional tagline */}
      <div style={{ lineHeight: 'var(--line-height-tight)' }}>
        <span
          style={{
            fontSize: s.title,
            fontWeight: 'var(--font-weight-bold)',
            color: 'var(--color-text)',
            whiteSpace: 'nowrap',
          }}
        >
          {t('app.name')}
        </span>

        {showTagline && (
          <span
            style={{
              display: 'block',
              fontSize: s.tagline,
              color: 'var(--color-text-muted)',
              fontWeight: 'var(--font-weight-normal)',
              whiteSpace: 'nowrap',
            }}
          >
            by Wender Media
          </span>
        )}
      </div>
    </div>
  )
}

export default Logo
