/* ──────────────────────────────────────────────────────────
   FilterPill — reusable filter pill button for category,
   engine, and difficulty filters. Replaces duplicated
   CategoryPill implementations in Samples and Examples pages.
   ────────────────────────────────────────────────────────── */

interface FilterPillProps {
  /** Display label text */
  label: string
  /** Whether this pill is currently selected */
  active: boolean
  /** Click handler for toggling the filter */
  onClick: () => void
  /** Optional count badge shown as "(N)" */
  count?: number
  /** Optional accent color for engine-colored left dot indicator (CSS value) */
  color?: string
  /** Optional emoji prefix shown before the label */
  icon?: string
}

/** Reusable filter pill button with optional count badge and color indicator */
export function FilterPill({ label, active, onClick, count, color, icon }: FilterPillProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={active}
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: 'var(--space-2)',
        padding: 'var(--space-2) var(--space-4)',
        fontSize: 'var(--font-size-xs)',
        fontFamily: 'var(--font-family-sans)',
        fontWeight: active ? 'var(--font-weight-bold)' : 'var(--font-weight-normal)',
        color: active ? 'var(--color-bg)' : 'var(--color-text-secondary)',
        backgroundColor: active ? 'var(--color-primary)' : 'var(--color-bg-elevated)',
        border: '1px solid',
        borderColor: active ? 'var(--color-primary)' : 'var(--color-border)',
        borderRadius: 'var(--radius-full)',
        cursor: 'pointer',
        transition: 'var(--transition-fast)',
        whiteSpace: 'nowrap',
        lineHeight: 'var(--line-height-base)',
      }}
    >
      {/* Engine-colored dot indicator */}
      {color && (
        <span
          aria-hidden="true"
          style={{
            display: 'inline-block',
            width: 'var(--space-3)',
            height: 'var(--space-3)',
            borderRadius: 'var(--radius-full)',
            backgroundColor: color,
            flexShrink: 0,
          }}
        />
      )}

      {/* Optional emoji prefix */}
      {icon && <span aria-hidden="true">{icon}</span>}

      {/* Label text */}
      <span>{label}</span>

      {/* Optional count badge */}
      {count !== undefined && (
        <span
          style={{
            fontSize: 'var(--font-size-xs)',
            color: active ? 'var(--color-bg)' : 'var(--color-text-muted)',
            opacity: 0.8,
          }}
        >
          ({count})
        </span>
      )}
    </button>
  )
}
