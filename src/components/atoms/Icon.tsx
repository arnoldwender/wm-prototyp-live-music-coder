/* SPDX-License-Identifier: MIT
   Copyright (c) 2026 Arnold Wender / Wender Media
   ──────────────────────────────────────────────────────────
   Icon atom — Lucide icon wrapper with consistent sizing.
   ────────────────────────────────────────────────────────── */

import type { LucideIcon } from 'lucide-react'

interface IconProps {
  /** Lucide icon component to render */
  icon: LucideIcon
  /** Icon size in pixels (default 18) */
  size?: number
  /** Additional CSS classes */
  className?: string
}

/** Renders a Lucide icon with standardized defaults */
function Icon({ icon: LucideComponent, size = 18, className = '' }: IconProps) {
  return (
    <LucideComponent
      size={size}
      className={className}
      aria-hidden="true"
    />
  )
}

export default Icon
