/* ──────────────────────────────────────────────────────────
   Tooltip atom — hover + focus accessible tooltip.
   Shows on mouse hover AND keyboard focus for a11y.
   ────────────────────────────────────────────────────────── */

import { useState, type ReactNode } from 'react'

interface TooltipProps {
  /** Tooltip text content */
  content: string
  /** Wrapped element — must be focusable for keyboard a11y */
  children: ReactNode
}

/** Accessible tooltip — visible on hover and keyboard focus */
function Tooltip({ content, children }: TooltipProps) {
  const [visible, setVisible] = useState(false)

  return (
    <span
      className="relative inline-flex"
      onMouseEnter={() => setVisible(true)}
      onMouseLeave={() => setVisible(false)}
      onFocus={() => setVisible(true)}
      onBlur={() => setVisible(false)}
    >
      {children}

      {/* Tooltip popup */}
      {visible && (
        <span
          role="tooltip"
          className="absolute left-1/2 z-50 pointer-events-none whitespace-nowrap"
          style={{
            top: 'calc(100% + var(--space-3))',
            transform: 'translateX(-50%)',
            backgroundColor: 'var(--color-bg-elevated)',
            color: 'var(--color-text)',
            fontSize: 'var(--font-size-xs)',
            padding: 'var(--space-2) var(--space-4)',
            borderRadius: 'var(--radius-sm)',
            border: '1px solid var(--color-border)',
            boxShadow: 'var(--shadow-md)',
          }}
        >
          {content}
        </span>
      )}
    </span>
  )
}

export default Tooltip
