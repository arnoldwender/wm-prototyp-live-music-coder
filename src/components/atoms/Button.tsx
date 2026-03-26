/* ──────────────────────────────────────────────────────────
   Button atom — forwardRef button with variant support.
   Variants: primary, secondary, ghost, icon.
   Uses CSS custom properties for token-based theming.
   ────────────────────────────────────────────────────────── */

import { forwardRef, type ButtonHTMLAttributes, type ReactNode } from 'react'

/** Supported visual variants */
type ButtonVariant = 'primary' | 'secondary' | 'ghost' | 'icon'

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  /** Visual variant — controls colors and padding */
  variant?: ButtonVariant
  /** Active/pressed state — shows highlighted background */
  active?: boolean
  children?: ReactNode
}

/** Style maps per variant using design tokens */
const variantStyles: Record<ButtonVariant, React.CSSProperties> = {
  primary: {
    backgroundColor: 'var(--color-primary)',
    color: 'var(--color-text)',
    padding: 'var(--space-4) var(--space-8)',
    borderRadius: 'var(--radius-md)',
  },
  secondary: {
    backgroundColor: 'var(--color-bg-elevated)',
    color: 'var(--color-text)',
    padding: 'var(--space-4) var(--space-8)',
    borderRadius: 'var(--radius-md)',
    border: '1px solid var(--color-border)',
  },
  ghost: {
    backgroundColor: 'transparent',
    color: 'var(--color-text-secondary)',
    padding: 'var(--space-4) var(--space-8)',
    borderRadius: 'var(--radius-md)',
  },
  icon: {
    backgroundColor: 'transparent',
    color: 'var(--color-text-secondary)',
    padding: 'var(--space-4)',
    borderRadius: 'var(--radius-md)',
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    minWidth: '44px',
    minHeight: '44px',
  },
}

/** Active state overlay — distinct from hover with primary color at reduced opacity */
const activeOverride: React.CSSProperties = {
  backgroundColor: 'var(--color-primary)',
  color: 'var(--color-bg)',
  opacity: 0.8,
}

const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ variant = 'ghost', active = false, className = '', style, children, ...rest }, ref) => {
    /* Merge variant base styles with optional active highlight */
    const merged: React.CSSProperties = {
      ...variantStyles[variant],
      ...(active ? activeOverride : {}),
      border: variantStyles[variant].border ?? 'none',
      cursor: rest.disabled ? 'not-allowed' : 'pointer',
      opacity: rest.disabled ? 0.5 : (active ? 0.8 : 1),
      outline: 'none',
      transition: 'var(--transition-fast)',
      fontFamily: 'var(--font-family-sans)',
      fontSize: 'var(--font-size-sm)',
      fontWeight: 'var(--font-weight-medium)',
      lineHeight: 'var(--line-height-tight)',
      ...style,
    }

    return (
      <button
        ref={ref}
        className={`hover:brightness-110 ${className}`}
        style={merged}
        onFocus={(e) => {
          /* Focus-visible style — matches theme primary color */
          if (e.target.matches(':focus-visible')) {
            e.target.style.outline = '2px solid var(--color-primary)'
            e.target.style.outlineOffset = '2px'
          }
        }}
        onBlur={(e) => {
          e.target.style.outline = 'none'
          e.target.style.outlineOffset = '0'
        }}
        {...rest}
      >
        {children}
      </button>
    )
  }
)

Button.displayName = 'Button'

export default Button
