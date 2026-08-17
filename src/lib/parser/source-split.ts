/* SPDX-License-Identifier: MIT
   Copyright (c) 2026 Arnold Wender / Wender Media
   ──────────────────────────────────────────────────────────
   Source splitting that respects strings, comments and nesting.

   The graph builder has to cut code at TOP-LEVEL boundaries only.
   A comma inside "bd*4, hh" is mini-notation, not an argument
   separator; the dot in room(.5) is a decimal point, not a chain
   link. Splitting on the raw characters gets both wrong, which is
   why these helpers track quote and depth state.
   ────────────────────────────────────────────────────────── */

const OPENERS = '([{';
const CLOSERS = ')]}';

/** Quote characters that open a string literal in Strudel/JS source. */
function isQuote(c: string): boolean {
  return c === '"' || c === "'" || c === '`';
}

/**
 * Remove line and block comments.
 *
 * Newlines inside a block comment are preserved: statements are split on
 * top-level newlines, so collapsing a multi-line comment would silently glue
 * the statement before it onto the one after it.
 *
 * Regex literals are not tracked. One containing an unbalanced quote would
 * desynchronise the string state — accepted deliberately: the graph is a
 * derived view, so the cost is a wrong picture, not lost work, and Strudel
 * patterns do not use regex literals.
 */
export function stripComments(src: string): string {
  let out = '';
  let quote: string | null = null;
  let i = 0;

  while (i < src.length) {
    const c = src[i];
    const next = src[i + 1];

    if (quote) {
      out += c;
      if (c === '\\') {
        out += next ?? '';
        i += 2;
        continue;
      }
      if (c === quote) quote = null;
      i += 1;
      continue;
    }

    if (isQuote(c)) {
      quote = c;
      out += c;
      i += 1;
      continue;
    }

    if (c === '/' && next === '/') {
      while (i < src.length && src[i] !== '\n') i += 1;
      continue;
    }

    if (c === '/' && next === '*') {
      i += 2;
      while (i < src.length && !(src[i] === '*' && src[i + 1] === '/')) {
        if (src[i] === '\n') out += '\n';
        i += 1;
      }
      i += 2;
      continue;
    }

    out += c;
    i += 1;
  }

  return out;
}

/** Split on any of `separators` that sits at nesting depth zero, outside strings. */
export function splitTopLevel(src: string, separators: string): string[] {
  const parts: string[] = [];
  let buf = '';
  let depth = 0;
  let quote: string | null = null;

  for (let i = 0; i < src.length; i += 1) {
    const c = src[i];

    if (quote) {
      buf += c;
      if (c === '\\') {
        buf += src[i + 1] ?? '';
        i += 1;
        continue;
      }
      if (c === quote) quote = null;
      continue;
    }

    if (isQuote(c)) {
      quote = c;
      buf += c;
      continue;
    }

    if (OPENERS.includes(c)) depth += 1;
    else if (CLOSERS.includes(c)) depth -= 1;
    else if (depth === 0 && separators.includes(c)) {
      parts.push(buf);
      buf = '';
      continue;
    }

    buf += c;
  }

  parts.push(buf);
  return parts;
}

/**
 * Split code into statements.
 *
 * A chain broken across lines is ONE statement, not several:
 *
 *     s("bd*4")
 *       .lpf(400)
 *
 * so a fragment starting with a chain dot is folded back into the statement
 * before it. Without that fold, every formatted pattern would parse as a pile
 * of orphans — which is the shape most published Strudel code is written in.
 */
export function splitStatements(src: string): string[] {
  const statements: string[] = [];

  for (const piece of splitTopLevel(src, '\n;')) {
    const trimmed = piece.trim();
    if (!trimmed) continue;

    if (trimmed.startsWith('.') && statements.length > 0) {
      statements[statements.length - 1] += trimmed;
      continue;
    }

    statements.push(trimmed);
  }

  return statements;
}

/** A pattern expression cut into the value it starts from and the calls applied to it. */
export interface ChainParts {
  /** The expression the chain starts from — `s("bd*4")`, `stack(a, b)`, a variable name. */
  head: string;
  /** Each chained call in order — `lpf(400)`, `room(.5)`. */
  links: string[];
}

/**
 * Split a pattern expression into its head and its chained method calls.
 *
 * Only a dot at depth zero FOLLOWED BY AN IDENTIFIER opens a new link. That
 * second condition is what keeps the decimal point in `room(.5)` — and in a
 * top-level `.5` — from being read as a chain break.
 */
export function splitChain(expr: string): ChainParts {
  const parts: string[] = [];
  let buf = '';
  let depth = 0;
  let quote: string | null = null;

  for (let i = 0; i < expr.length; i += 1) {
    const c = expr[i];

    if (quote) {
      buf += c;
      if (c === '\\') {
        buf += expr[i + 1] ?? '';
        i += 1;
        continue;
      }
      if (c === quote) quote = null;
      continue;
    }

    if (isQuote(c)) {
      quote = c;
      buf += c;
      continue;
    }

    if (OPENERS.includes(c)) depth += 1;
    else if (CLOSERS.includes(c)) depth -= 1;
    else if (
      c === '.' &&
      depth === 0 &&
      /[A-Za-z_$]/.test(expr[i + 1] ?? '') &&
      buf.trim() !== ''
    ) {
      parts.push(buf.trim());
      buf = '';
      continue;
    }

    buf += c;
  }

  if (buf.trim() !== '') parts.push(buf.trim());

  const [head = '', ...links] = parts;
  return { head, links };
}
