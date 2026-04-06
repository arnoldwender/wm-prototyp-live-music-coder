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
        color: 'var(--color-text)',
        fontSize: 'var(--font-size-xs)',
        fontWeight: 'var(--font-weight-medium)',
        padding: 'var(--space-1) var(--space-4)',
        borderRadius: 'var(--radius-full)',
        lineHeight: 'var(--line-height-tight)',
      }}
    >
      {children}
    </span>
  )
}

export default Badge
