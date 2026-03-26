/* ──────────────────────────────────────────────────────────
   NotFound — 404 page for unmatched routes.
   Uses design tokens for consistent dark theme styling.
   ────────────────────────────────────────────────────────── */

import { Link } from 'react-router-dom'

function NotFound() {
  return (
    <main
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
      {/* Error code */}
      <h1
        style={{
          fontSize: 'var(--font-size-3xl)',
          fontWeight: 'var(--font-weight-bold)',
          color: 'var(--color-primary)',
          marginBottom: 'var(--space-sm)',
          lineHeight: 'var(--line-height-tight)',
        }}
      >
        404
      </h1>

      {/* Explanation */}
      <p
        style={{
          fontSize: 'var(--font-size-lg)',
          color: 'var(--color-text-secondary)',
          marginBottom: 'var(--space-xl)',
          maxWidth: '28rem',
        }}
      >
        This page doesn't exist. Maybe the URL changed, or you followed a broken link.
      </p>

      {/* Navigation back to home */}
      <Link
        to="/"
        style={{
          display: 'inline-block',
          padding: 'var(--space-sm) var(--space-lg)',
          background: 'var(--color-primary)',
          color: 'var(--color-text)',
          borderRadius: 'var(--radius-md)',
          textDecoration: 'none',
          fontWeight: 'var(--font-weight-medium)',
          fontSize: 'var(--font-size-base)',
          transition: 'var(--transition-fast)',
        }}
      >
        Back to Home
      </Link>
    </main>
  )
}

export default NotFound
