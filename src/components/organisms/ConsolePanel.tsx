/* SPDX-License-Identifier: MIT
   Copyright (c) 2026 Arnold Wender / Wender Media
   ──────────────────────────────────────────────────────────
   ConsolePanel — in-editor log output panel showing captured
   console.log/warn/error messages with timestamps and colors.
   ────────────────────────────────────────────────────────── */

import { useEffect, useState, useRef } from 'react';
import { Trash2 } from 'lucide-react';
import {
  getMessages,
  clearMessages,
  subscribe,
  startCapture,
  type ConsoleMessage,
} from '../../lib/console-capture';

/* Level → color mapping */
const LEVEL_COLORS: Record<ConsoleMessage['level'], string> = {
  log: 'var(--color-text)',
  info: 'var(--color-info, #60a5fa)',
  warn: '#fbbf24',
  error: 'var(--color-error, #f87171)',
};

const LEVEL_PREFIX: Record<ConsoleMessage['level'], string> = {
  log: '',
  info: '[i]',
  warn: '[!]',
  error: '[x]',
};

function formatTime(ts: number): string {
  const d = new Date(ts);
  return `${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}:${String(d.getSeconds()).padStart(2, '0')}`;
}

export function ConsolePanel() {
  const [messages, setMessages] = useState<ConsoleMessage[]>(getMessages);
  const bottomRef = useRef<HTMLDivElement>(null);

  /* Start capture on mount, subscribe to updates */
  useEffect(() => {
    startCapture();
    const unsub = subscribe(() => setMessages([...getMessages()]));
    return unsub;
  }, []);

  /* Auto-scroll to bottom on new messages */
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages.length]);

  return (
    <div
      className="flex flex-col h-full"
      style={{
        backgroundColor: 'var(--color-bg)',
        fontFamily: 'var(--font-family-mono)',
        fontSize: 'var(--font-size-ui)',
      }}
    >
      {/* Header */}
      <div
        className="flex items-center justify-between shrink-0"
        style={{
          padding: 'var(--space-1) var(--space-3)',
          borderBottom: '1px solid var(--color-border)',
          backgroundColor: 'var(--color-bg-alt)',
        }}
      >
        <span style={{ color: 'var(--color-text-muted)', fontWeight: 500 }}>
          Console
        </span>
        <div className="flex items-center gap-2">
          <span style={{ color: 'var(--color-text-muted)', fontSize: 'var(--font-size-2xs)' }}>
            {messages.length} msg
          </span>
          <button
            type="button"
            onClick={clearMessages}
            aria-label="Clear console"
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              width: '20px',
              height: '20px',
              border: 'none',
              borderRadius: 'var(--radius-sm)',
              backgroundColor: 'transparent',
              color: 'var(--color-text-muted)',
              cursor: 'pointer',
            }}
          >
            <Trash2 size={12} />
          </button>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto" style={{ padding: 'var(--space-1) 0' }}>
        {messages.length === 0 && (
          <div
            style={{
              padding: 'var(--space-4)',
              color: 'var(--color-text-muted)',
              textAlign: 'center',
            }}
          >
            Console output will appear here...
          </div>
        )}
        {messages.map((msg, i) => (
          <div
            key={i}
            style={{
              padding: '1px var(--space-3)',
              color: LEVEL_COLORS[msg.level],
              borderBottom: '1px solid rgba(39, 39, 42, 0.3)',
              display: 'flex',
              gap: 'var(--space-2)',
              lineHeight: '1.6',
            }}
          >
            {/* Timestamp */}
            <span style={{ color: 'var(--color-text-muted)', flexShrink: 0 }}>
              {formatTime(msg.timestamp)}
            </span>
            {/* Level prefix */}
            {LEVEL_PREFIX[msg.level] && (
              <span style={{ flexShrink: 0 }}>{LEVEL_PREFIX[msg.level]}</span>
            )}
            {/* Message content */}
            <span style={{ whiteSpace: 'pre-wrap', wordBreak: 'break-word' }}>
              {msg.args.join(' ')}
            </span>
          </div>
        ))}
        <div ref={bottomRef} />
      </div>
    </div>
  );
}
