/* SPDX-License-Identifier: MIT
   Copyright (c) 2026 Arnold Wender / Wender Media
   ──────────────────────────────────────────────────────────
   Logo atom — level-meter mark + app name.
   Used in the landing page header and the editor transport bar.

   The "by Wender Media" byline was removed (2026-08-16). The
   `showTagline` prop went with it rather than being left behind as a
   switch that toggles nothing: it gated the byline and nothing else, so
   with the string gone the prop had no branch to control. Attribution
   lives in the footer, /legal and the repo — it does not need to ride
   along on the product mark in the editor chrome.
   ---------------------------------------------------------- */

import { useTranslation } from 'react-i18next'

/** Size presets for mark and title */
const SIZE_MAP = {
  sm: { icon: 20, title: 'var(--font-size-sm)', gap: 'var(--space-2)' },
  md: { icon: 28, title: 'var(--font-size-base)', gap: 'var(--space-3)' },
  lg: { icon: 36, title: 'var(--font-size-lg)', gap: 'var(--space-3)' },
} as const

interface Props {
  /** Icon and text scale */
  size?: 'sm' | 'md' | 'lg'
}

/** Level-meter mark — 4 amber bars.
    The favicon carries the same mark reduced to 3 bars: at 16px, four
    bars render as 2px bars with 1px gaps and merge. See public/favicon.svg. */
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
      {/* Bar 1 — shortest, brightest amber */}
      <rect x="2" y="10" width="4" rx="2" height="8" fill="var(--color-primary-light)" opacity={0.6} />
      {/* Bar 2 — medium height */}
      <rect x="8" y="4" width="4" rx="2" height="16" fill="var(--color-primary)" opacity={0.8} />
      {/* Bar 3 — tallest */}
      <rect x="14" y="2" width="4" rx="2" height="20" fill="var(--color-primary)" />
      {/* Bar 4 — medium, dimmed amber */}
      <rect x="20" y="7" width="4" rx="2" height="12" fill="var(--color-primary-dim)" opacity={0.9} />
    </svg>
  )
}

/** Logo — level-meter mark + "Live Music Coder" */
function Logo({ size = 'md' }: Props) {
  const { t } = useTranslation()
  const s = SIZE_MAP[size]

  return (
    <div
      className="flex items-center"
      style={{ gap: s.gap }}
    >
      {/* Level-meter mark */}
      <WaveformIcon size={s.icon} />

      <span
        style={{
          fontSize: s.title,
          fontWeight: 'var(--font-weight-bold)',
          color: 'var(--color-text)',
          lineHeight: 'var(--line-height-tight)',
          whiteSpace: 'nowrap',
        }}
      >
        {t('app.name')}
      </span>
    </div>
  )
}

export default Logo
