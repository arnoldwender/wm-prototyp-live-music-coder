/* ──────────────────────────────────────────────────────────
   ErrorBar — shows evaluation errors with beginner-friendly
   help toggle. Raw error + optional expanded explanation.
   ────────────────────────────────────────────────────────── */

import { useState } from 'react';
import { getFriendlyError } from '../../lib/editor/error-help';

interface ErrorBarProps {
  error: string;
  onDismiss: () => void;
}

/** Error bar with toggleable beginner help */
export function ErrorBar({ error, onDismiss }: ErrorBarProps) {
  const [showHelp, setShowHelp] = useState(true);
  const friendly = getFriendlyError(error);

  return (
    <div
      role="alert"
      aria-live="polite"
      className="shrink-0"
      style={{
        backgroundColor: 'var(--color-bg-elevated)',
        borderTop: '2px solid var(--color-error)',
        fontSize: 'var(--font-size-xs)',
        fontFamily: 'var(--font-family-mono)',
      }}
    >
      {/* Error header — raw message + controls */}
      <div
        className="flex items-center"
        style={{
          padding: 'var(--space-2) var(--space-4)',
          gap: 'var(--space-2)',
          color: 'var(--color-error)',
        }}
      >
        <span style={{ fontWeight: 'var(--font-weight-bold)', flexShrink: 0 }}>Error</span>
        <span className="flex-1 truncate" style={{ color: 'var(--color-text)' }}>
          {friendly ? friendly.title : error}
        </span>

        {/* Help toggle */}
        {friendly && (
          <button
            type="button"
            onClick={() => setShowHelp(!showHelp)}
            style={{
              background: 'none',
              border: '1px solid var(--color-border)',
              borderRadius: 'var(--radius-sm)',
              color: showHelp ? 'var(--color-primary)' : 'var(--color-text-muted)',
              cursor: 'pointer',
              fontSize: '10px',
              padding: '1px var(--space-2)',
              flexShrink: 0,
            }}
          >
            {showHelp ? 'Hide help' : 'Show help'}
          </button>
        )}

        {/* Dismiss */}
        <button
          type="button"
          onClick={onDismiss}
          aria-label="Dismiss error"
          style={{
            background: 'none',
            border: 'none',
            color: 'var(--color-text-muted)',
            cursor: 'pointer',
            fontSize: 'var(--font-size-base)',
            lineHeight: 1,
            padding: 'var(--space-1)',
            flexShrink: 0,
          }}
        >
          &times;
        </button>
      </div>

      {/* Expanded help — explanation + fix suggestion */}
      {friendly && showHelp && (
        <div
          style={{
            padding: '0 var(--space-4) var(--space-3)',
            display: 'flex',
            flexDirection: 'column',
            gap: 'var(--space-2)',
          }}
        >
          <div style={{ color: 'var(--color-text-secondary)', fontFamily: 'var(--font-family-sans)', fontSize: 'var(--font-size-xs)', lineHeight: 'var(--line-height-base)' }}>
            {friendly.explanation}
          </div>
          <div style={{
            color: 'var(--color-success)',
            fontFamily: 'var(--font-family-sans)',
            fontSize: 'var(--font-size-xs)',
            backgroundColor: 'var(--color-bg)',
            padding: 'var(--space-2) var(--space-3)',
            borderRadius: 'var(--radius-sm)',
            borderLeft: '3px solid var(--color-success)',
          }}>
            <strong>Fix:</strong> {friendly.fix}
          </div>
          {/* Raw error for advanced users */}
          <details style={{ color: 'var(--color-text-muted)' }}>
            <summary style={{ cursor: 'pointer', fontSize: '10px' }}>Raw error</summary>
            <code style={{ fontSize: '10px', wordBreak: 'break-all' }}>{error}</code>
          </details>
        </div>
      )}
    </div>
  );
}
