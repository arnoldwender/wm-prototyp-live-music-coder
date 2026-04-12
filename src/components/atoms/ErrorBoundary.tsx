/* SPDX-License-Identifier: MIT
   Copyright (c) 2026 Arnold Wender / Wender Media
   ──────────────────────────────────────────────────────────
   ErrorBoundary — catches unhandled React render errors.
   Displays a dark-themed fallback with reload button.

   NOTE: Inline styles use CSS custom properties (design tokens).
   The fallback values in the token declarations ensure this renders
   correctly even if the token stylesheet fails to load, as modern
   browsers keep previously parsed :root declarations available.
   Token values mirror src/styles/tokens/colors.css (zinc-950, zinc-50,
   red-500, purple-500) so the look stays on-brand.
   ────────────────────────────────────────────────────────── */

import { Component } from 'react'
import type { ErrorInfo, ReactNode } from 'react'

interface Props {
  children: ReactNode
}

interface State {
  hasError: boolean
  error: Error | null
}

class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props)
    this.state = { hasError: false, error: null }
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error }
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    /* Log error details for debugging */
    console.error('[ErrorBoundary] Uncaught error:', error, info.componentStack)
  }

  handleReload = () => {
    window.location.reload()
  }

  render() {
    if (!this.state.hasError) {
      return this.props.children
    }

    /* Error fallback UI — hardcoded values, see file header comment */
    return (
      <main
        role="alert"
        style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          minHeight: '100vh',
          background: 'var(--color-bg)',
          color: 'var(--color-text)',
          padding: '32px',
          textAlign: 'center',
          fontFamily:
            'system-ui, -apple-system, "Segoe UI", Roboto, sans-serif',
        }}
      >
        {/* Error heading */}
        <h1
          style={{
            fontSize: 'var(--font-size-3xl)',
            fontWeight: 700,
            color: 'var(--color-error)',
            marginBottom: 'var(--space-4)',
            lineHeight: 1.2,
          }}
        >
          Something went wrong
        </h1>

        {/* Error message */}
        <p
          style={{
            fontSize: 'var(--font-size-base)',
            color: 'var(--color-text-muted)',
            marginBottom: 'var(--space-12)',
            maxWidth: '28rem',
          }}
        >
          {this.state.error?.message || 'An unexpected error occurred.'}
        </p>

        {/* Reload button */}
        <button
          type="button"
          onClick={this.handleReload}
          style={{
            padding: 'var(--space-4) var(--space-10)',
            background: 'var(--color-primary)',
            color: 'var(--color-text)',
            border: 'none',
            borderRadius: 'var(--radius-md)',
            cursor: 'pointer',
            fontWeight: 500,
            fontSize: 'var(--font-size-base)',
            transition: 'opacity var(--transition-fast)',
          }}
        >
          Reload
        </button>

        {/* Hint for users — how to capture the actual error */}
        <p
          style={{
            marginTop: 'var(--space-12)',
            fontSize: 'var(--font-size-xs)',
            color: 'var(--color-text-muted)',
            maxWidth: '28rem',
          }}
        >
          If reloading does not help, relaunch with{' '}
          <code
            style={{
              background: 'var(--color-bg)',
              padding: 'var(--space-1) var(--space-3)',
              borderRadius: 'var(--radius-sm)',
              fontFamily: 'ui-monospace, SFMono-Regular, Menlo, monospace',
            }}
          >
            open -a "Live Music Coder" --args --lmc-debug
          </code>{' '}
          to open DevTools.
        </p>
      </main>
    )
  }
}

export default ErrorBoundary
