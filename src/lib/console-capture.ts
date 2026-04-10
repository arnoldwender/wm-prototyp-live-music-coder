/* SPDX-License-Identifier: MIT
   Copyright (c) 2026 Arnold Wender / Wender Media
   ──────────────────────────────────────────────────────────
   Console capture — intercepts console.log/warn/error during
   code evaluation and stores messages for the Console panel.
   ────────────────────────────────────────────────────────── */

export interface ConsoleMessage {
  level: 'log' | 'warn' | 'error' | 'info';
  args: string[];
  timestamp: number;
}

/** Maximum messages to keep in buffer */
const MAX_MESSAGES = 200;

/** Message buffer — newest at the end */
let messages: ConsoleMessage[] = [];

/** Listeners notified when messages change */
const listeners = new Set<() => void>();

/** Original console methods (saved for restore) */
const originals = {
  log: console.log,
  warn: console.warn,
  error: console.error,
  info: console.info,
};

let intercepting = false;

/** Start intercepting console output */
export function startCapture(): void {
  if (intercepting) return;
  intercepting = true;

  for (const level of ['log', 'warn', 'error', 'info'] as const) {
    console[level] = (...args: unknown[]) => {
      /* Still output to real console */
      originals[level](...args);
      /* Capture */
      messages.push({
        level,
        args: args.map((a) =>
          typeof a === 'string' ? a : JSON.stringify(a, null, 2) ?? String(a),
        ),
        timestamp: Date.now(),
      });
      /* Trim */
      if (messages.length > MAX_MESSAGES) {
        messages = messages.slice(-MAX_MESSAGES);
      }
      /* Notify */
      listeners.forEach((fn) => fn());
    };
  }
}

/** Stop intercepting — restore original console methods */
export function stopCapture(): void {
  if (!intercepting) return;
  intercepting = false;
  Object.assign(console, originals);
}

/** Get all captured messages */
export function getMessages(): ConsoleMessage[] {
  return messages;
}

/** Clear all captured messages */
export function clearMessages(): void {
  messages = [];
  listeners.forEach((fn) => fn());
}

/** Subscribe to message changes — returns unsubscribe function */
export function subscribe(fn: () => void): () => void {
  listeners.add(fn);
  return () => listeners.delete(fn);
}
