/* SPDX-License-Identifier: MIT
   Copyright (c) 2026 Arnold Wender / Wender Media
   ──────────────────────────────────────────────────────────
   Toggle atom — accessible switch component.
   Uses role="switch" and aria-checked for screen readers.
   ────────────────────────────────────────────────────────── */

interface ToggleProps {
  /** Current on/off state */
  checked: boolean
  /** Change handler */
  onChange: (checked: boolean) => void
  /** Accessible label text */
  label: string
}

/** Accessible toggle switch with keyboard and mouse support */
function Toggle({ checked, onChange, label }: ToggleProps) {
  return (
    <label className="inline-flex items-center gap-2 cursor-pointer">
      {/* Visible label */}
      <span
        style={{
          fontSize: 'var(--font-size-sm)',
          color: 'var(--color-text-secondary)',
        }}
      >
        {label}
      </span>

      {/* Switch track */}
      <button
        type="button"
        role="switch"
        aria-checked={checked}
        aria-label={label}
        onClick={() => onChange(!checked)}
        className="relative focus-visible:outline-2 focus-visible:outline-offset-2"
        style={{
          width: 'var(--space-13)',
          height: 'var(--space-10)',
          borderRadius: 'var(--radius-full)',
          backgroundColor: checked ? 'var(--color-primary)' : 'var(--color-bg-hover)',
          border: 'none',
          padding: 0,
          cursor: 'pointer',
          transition: 'var(--transition-fast)',
        }}
      >
        {/* Switch thumb */}
        <span
          style={{
            position: 'absolute',
            top: 'var(--space-2)',
            left: checked ? 'var(--space-9)' : 'var(--space-2)',
            width: 'var(--space-8)',
            height: 'var(--space-8)',
            borderRadius: 'var(--radius-full)',
            backgroundColor: 'var(--color-text)',
            transition: 'var(--transition-fast)',
          }}
        />
      </button>
    </label>
  )
}

export default Toggle
