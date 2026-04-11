/* SPDX-License-Identifier: MIT
   Copyright (c) 2026 Arnold Wender / Wender Media
   ──────────────────────────────────────────────────────────
   SortSelect — compact inline sort dropdown matching the
   dark cyberpunk theme. Used on library and gallery pages
   for sorting results by different criteria.
   ────────────────────────────────────────────────────────── */

interface SortOption {
  /** Value passed to onChange when selected */
  value: string
  /** Display label shown in the dropdown */
  label: string
}

interface SortSelectProps {
  /** Currently selected sort value */
  value: string
  /** Callback when the user picks a different option */
  onChange: (value: string) => void
  /** Available sort options */
  options: SortOption[]
}

/** Compact inline sort dropdown styled for the dark music IDE theme */
export function SortSelect({ value, onChange, options }: SortSelectProps) {
  return (
    <select
      value={value}
      onChange={(e) => onChange(e.target.value)}
      aria-label="Sort order"
      style={{
        fontSize: 'var(--font-size-xs)',
        fontFamily: 'var(--font-family-sans)',
        fontWeight: 'var(--font-weight-medium)',
        color: 'var(--color-text-secondary)',
        backgroundColor: 'var(--color-bg-elevated)',
        border: '1px solid var(--color-border)',
        borderRadius: 'var(--radius-sm)',
        padding: 'var(--space-1) var(--space-3)',
        cursor: 'pointer',
        transition: 'var(--transition-fast)',
        /* outline handled by global :focus-visible rule in global.css */
        lineHeight: 'var(--line-height-base)',
        /* Remove default arrow in some browsers for consistent look */
        appearance: 'auto',
      }}
    >
      {options.map((option) => (
        <option key={option.value} value={option.value}>
          {option.label}
        </option>
      ))}
    </select>
  )
}
