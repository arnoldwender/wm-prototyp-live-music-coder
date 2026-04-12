/* SPDX-License-Identifier: MIT
   Copyright (c) 2026 Arnold Wender / Wender Media
   ──────────────────────────────────────────────────────────
   ErrorBar — cyberpunk-styled error diagnostics panel.
   Glitch header, scanline animation, terminal-style help.
   ────────────────────────────────────────────────────────── */

import { useState } from 'react';
import { getFriendlyError } from '../../lib/editor/error-help';

interface ErrorBarProps {
  error: string;
  onDismiss: () => void;
}

export function ErrorBar({ error, onDismiss }: ErrorBarProps) {
  const [showHelp, setShowHelp] = useState(true);
  const friendly = getFriendlyError(error);

  return (
    <div
      role="alert"
      aria-live="polite"
      className="shrink-0"
      style={{
        backgroundColor: 'var(--color-bg)', /* error panel dark bg */
        borderTop: '1px solid var(--color-error)',
        fontSize: 'var(--font-size-xs)',
        fontFamily: 'var(--font-family-mono)',
        position: 'relative',
        overflow: 'hidden',
      }}
    >
      {/* Scanline overlay effect */}
      <div style={{
        position: 'absolute',
        inset: 0,
        background: 'repeating-linear-gradient(0deg, transparent, transparent 2px, rgba(255,0,0,0.03) 2px, rgba(255,0,0,0.03) 4px)', /* overlay — no token equivalent */
        pointerEvents: 'none',
        zIndex: 1,
      }} />

      {/* Error header */}
      <div
        className="flex items-center"
        style={{
          padding: 'var(--space-2) var(--space-4)',
          gap: 'var(--space-3)',
          position: 'relative',
          zIndex: 2,
        }}
      >
        {/* Glitch-style error label */}
        <span style={{
          color: 'var(--color-error)',
          fontWeight: 'var(--font-weight-bold)',
          letterSpacing: '0.15em',
          textTransform: 'uppercase',
          fontSize: 'var(--font-size-2xs)',
          textShadow: '0 0 8px rgba(239,68,68,0.6), 2px 0 rgba(239,68,68,0.3), -2px 0 rgba(59,130,246,0.3)', /* overlay — no token equivalent */
          flexShrink: 0,
        }}>
          ERR
        </span>

        {/* Separator dot */}
        <span style={{
          width: '4px',
          height: '4px',
          borderRadius: '50%',
          backgroundColor: 'var(--color-error)',
          boxShadow: '0 0 6px var(--color-error)',
          animation: 'pulse 1s ease-in-out infinite',
          flexShrink: 0,
        }} />

        {/* Error title */}
        <span className="flex-1 truncate" style={{
          color: 'var(--color-text)',
          fontSize: 'var(--font-size-xs)',
        }}>
          {friendly ? friendly.title : error}
        </span>

        {/* Help toggle — styled as terminal command */}
        {friendly && (
          <button
            type="button"
            onClick={() => setShowHelp(!showHelp)}
            aria-expanded={showHelp ? 'true' : 'false'}
            aria-controls="error-help-panel"
            style={{
              background: showHelp ? 'color-mix(in srgb, var(--color-primary) 15%, transparent)' : 'transparent',
              border: '1px solid',
              borderColor: showHelp ? 'var(--color-primary)' : 'var(--color-border)',
              borderRadius: 'var(--radius-sm)',
              color: showHelp ? 'var(--color-primary)' : 'var(--color-text-muted)',
              cursor: 'pointer',
              fontSize: 'var(--font-size-2xs)',
              padding: '2px var(--space-2)',
              flexShrink: 0,
              fontFamily: 'var(--font-family-mono)',
              letterSpacing: '0.05em',
              transition: 'var(--transition-fast)',
            }}
          >
            {showHelp ? '[ HIDE ]' : '[ HELP ]'}
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
            fontSize: 'var(--font-size-sm)',
            lineHeight: 1,
            padding: '2px',
            flexShrink: 0,
            transition: 'var(--transition-fast)',
          }}
          onMouseEnter={(e) => { e.currentTarget.style.color = 'var(--color-error)' }}
          onMouseLeave={(e) => { e.currentTarget.style.color = 'var(--color-text-muted)' }}
        >
          &times;
        </button>
      </div>

      {/* Expanded help — terminal-style diagnostics */}
      {friendly && showHelp && (
        <div
          id="error-help-panel"
          style={{
            padding: '0 var(--space-4) var(--space-3)',
            position: 'relative',
            zIndex: 2,
          }}
        >
          {/* Explanation — terminal prompt style */}
          <div style={{
            color: 'var(--color-text-secondary)',
            fontFamily: 'var(--font-family-mono)',
            fontSize: 'var(--font-size-ui)',
            lineHeight: '1.6',
            padding: 'var(--space-2) 0',
          }}>
            <span style={{ color: 'var(--color-text-muted)', userSelect: 'none' }}>{'> '}</span>
            {friendly.explanation}
          </div>

          {/* Fix suggestion — highlighted block */}
          <div style={{
            color: 'var(--color-success)',
            fontFamily: 'var(--font-family-mono)',
            fontSize: 'var(--font-size-ui)',
            backgroundColor: 'color-mix(in srgb, var(--color-success) 8%, transparent)',
            padding: 'var(--space-2) var(--space-3)',
            borderRadius: 'var(--radius-sm)',
            borderLeft: '2px solid var(--color-success)',
            lineHeight: '1.6',
          }}>
            <span style={{ color: 'color-mix(in srgb, var(--color-success) 50%, transparent)', userSelect: 'none' }}>{'$ '}</span>
            {friendly.fix}
          </div>

          {/* Raw error — collapsible */}
          <details style={{ color: 'var(--color-text-muted)', marginTop: 'var(--space-2)' }}>
            <summary style={{
              cursor: 'pointer',
              fontSize: 'var(--font-size-2xs)',
              letterSpacing: '0.05em',
              textTransform: 'uppercase',
              userSelect: 'none',
            }}>
              stack trace
            </summary>
            <code style={{
              display: 'block',
              fontSize: 'var(--font-size-2xs)',
              wordBreak: 'break-all',
              color: 'var(--color-text-muted)',
              padding: 'var(--space-2) 0',
              opacity: 0.7,
            }}>
              {error}
            </code>
          </details>
        </div>
      )}
    </div>
  );
}
