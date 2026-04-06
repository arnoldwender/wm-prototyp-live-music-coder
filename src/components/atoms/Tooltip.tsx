/* SPDX-License-Identifier: MIT
   Copyright (c) 2026 Arnold Wender / Wender Media
   ──────────────────────────────────────────────────────────
   Tooltip atom — hover + focus accessible tooltip.
   Shows on mouse hover AND keyboard focus for a11y.
   ────────────────────────────────────────────────────────── */

import { useState, useId, cloneElement, isValidElement, type ReactElement } from 'react'

interface TooltipProps {
  /** Tooltip text content */
  content: string
  /** Wrapped element — must be focusable for keyboard a11y */
  children: ReactElement
}

/** Accessible tooltip — visible on hover and keyboard focus, linked via aria-describedby */
function Tooltip({ content, children }: TooltipProps) {
  const [visible, setVisible] = useState(false)
  const tooltipId = useId()

  /* Clone child to inject aria-describedby linking to the tooltip */
  const child = isValidElement(children)
    ? cloneElement(children as ReactElement<Record<string, unknown>>, { 'aria-describedby': tooltipId })
    : children

  return (
    <span
      className="relative inline-flex"
      onMouseEnter={() => setVisible(true)}
      onMouseLeave={() => setVisible(false)}
      onFocus={() => setVisible(true)}
      onBlur={() => setVisible(false)}
    >
      {child}

      {/* Tooltip popup — linked to trigger via id for screen readers */}
      {visible && (
        <span
          id={tooltipId}
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
