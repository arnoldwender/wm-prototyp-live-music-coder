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
          width: '36px',
          height: '20px',
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
            top: '2px',
            left: checked ? '18px' : '2px',
            width: '16px',
            height: '16px',
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
