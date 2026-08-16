/* SPDX-License-Identifier: MIT
   Copyright (c) 2026 Arnold Wender / Wender Media
   ──────────────────────────────────────────────────────────
   Badge atom — small colored label for status indicators.
   ────────────────────────────────────────────────────────── */

import type { ReactNode } from 'react'

interface BadgeProps {
  children: ReactNode
  /** Background color — must be a CSS token (default: primary) */
  color?: string
  /** Additional CSS classes */
  className?: string
}

/** Compact colored badge for status/engine indicators */
function Badge({ children, color = 'var(--color-primary)', className = '' }: BadgeProps) {
  return (
    <span
      className={`inline-flex items-center ${className}`}
      style={{
        backgroundColor: color,
        /* Dark ink on a saturated fill, never --color-text.
           Light ink here produced the worst contrast ratios in the
           app (2.06-3.79 measured). This one atom was the sole cause
           of 28 of the remaining colour-contrast nodes across /blog
           and /changelog — the Golden Rule working in reverse.
           --color-on-accent measures 6.74-13.76 on the same fills. */
        color: 'var(--color-on-accent)',
        fontSize: 'var(--font-size-xs)',
        fontWeight: 'var(--font-weight-medium)',
        padding: 'var(--space-1) var(--space-4)',
        /* Rack-panel legend, not a pill. --radius-full is reserved for
           genuine circles (knobs, LEDs, thumbs) — see spacing.css. */
        borderRadius: 'var(--radius-sm)',
        lineHeight: 'var(--line-height-tight)',
      }}
    >
      {children}
    </span>
  )
}

export default Badge
