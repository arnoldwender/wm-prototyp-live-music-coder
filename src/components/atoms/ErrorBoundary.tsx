/* SPDX-License-Identifier: MIT
   Copyright (c) 2026 Arnold Wender / Wender Media
   ──────────────────────────────────────────────────────────
   ErrorBoundary — catches unhandled React render errors.
   Displays a dark-themed fallback with reload button.
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

    /* Error fallback UI — dark theme using design tokens */
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
          padding: 'var(--space-xl)',
          textAlign: 'center',
          fontFamily: 'var(--font-family-body)',
        }}
      >
        {/* Error heading */}
        <h1
          style={{
            fontSize: 'var(--font-size-3xl)',
            fontWeight: 'var(--font-weight-bold)',
            color: 'var(--color-error)',
            marginBottom: 'var(--space-sm)',
            lineHeight: 'var(--line-height-tight)',
          }}
        >
          Something went wrong
        </h1>

        {/* Error message */}
        <p
          style={{
            fontSize: 'var(--font-size-base)',
            color: 'var(--color-text-secondary)',
            marginBottom: 'var(--space-xl)',
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
            padding: 'var(--space-sm) var(--space-lg)',
            background: 'var(--color-primary)',
            color: 'var(--color-text)',
            border: 'none',
            borderRadius: 'var(--radius-md)',
            cursor: 'pointer',
            fontWeight: 'var(--font-weight-medium)',
            fontSize: 'var(--font-size-base)',
            transition: 'var(--transition-fast)',
          }}
        >
          Reload
        </button>
      </main>
    )
  }
}

export default ErrorBoundary
