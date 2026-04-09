/* SPDX-License-Identifier: MIT
   Copyright (c) 2026 Arnold Wender / Wender Media
   ──────────────────────────────────────────────────────────
   ToolbarGroup molecule — groups toolbar buttons with an
   optional trailing separator for visual segmentation.
   ────────────────────────────────────────────────────────── */

import type { ReactNode } from 'react'

interface ToolbarGroupProps {
  children: ReactNode
  /** Show a vertical separator after this group (default true) */
  separator?: boolean
}

/** Groups related toolbar actions with optional visual divider */
function ToolbarGroup({ children, separator = true }: ToolbarGroupProps) {
  return (
    <div className="flex items-center gap-1">
      {children}

      {/* Vertical separator line */}
      {separator && (
        <div
          aria-hidden="true"
          style={{
            width: '1px',
            height: '20px',
            backgroundColor: 'var(--color-border)',
            marginLeft: 'var(--space-3)',
            marginRight: 'var(--space-3)',
          }}
        />
      )}
    </div>
  )
}

export default ToolbarGroup
