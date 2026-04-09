/* SPDX-License-Identifier: MIT
   Copyright (c) 2026 Arnold Wender / Wender Media
   ──────────────────────────────────────────────────────────
   ErrorBoundary — catches unhandled React render errors.
   Displays a dark-themed fallback with reload button.

   IMPORTANT: This file intentionally violates the design-token rule.
   It uses HARDCODED colors and sizes because its job is to render
   correctly even when the app's CSS (and therefore CSS custom
   properties on :root) failed to load. If the main bundle or token
   stylesheet crashes, var(--color-bg) is undefined and the fallback
   would render black-on-black, leaving the user with an invisible
   error UI on top of BrowserWindow.backgroundColor — i.e. the exact
   "black screen" symptom v1.0.1 shipped with.
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
          background: '#09090b',
          color: '#fafafa',
          padding: '32px',
          textAlign: 'center',
          fontFamily:
            'system-ui, -apple-system, "Segoe UI", Roboto, sans-serif',
        }}
      >
        {/* Error heading */}
        <h1
          style={{
            fontSize: '40px',
            fontWeight: 700,
            color: '#ef4444',
            marginBottom: '8px',
            lineHeight: 1.2,
          }}
        >
          Something went wrong
        </h1>

        {/* Error message */}
        <p
          style={{
            fontSize: '16px',
            color: '#a1a1aa',
            marginBottom: '32px',
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
            padding: '8px 24px',
            background: '#a855f7',
            color: '#fafafa',
            border: 'none',
            borderRadius: '8px',
            cursor: 'pointer',
            fontWeight: 500,
            fontSize: '16px',
            transition: 'opacity 150ms ease',
          }}
        >
          Reload
        </button>

        {/* Hint for users — how to capture the actual error */}
        <p
          style={{
            marginTop: '32px',
            fontSize: '12px',
            color: '#71717a',
            maxWidth: '28rem',
          }}
        >
          If reloading does not help, relaunch with{' '}
          <code
            style={{
              background: '#18181b',
              padding: '2px 6px',
              borderRadius: '4px',
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
