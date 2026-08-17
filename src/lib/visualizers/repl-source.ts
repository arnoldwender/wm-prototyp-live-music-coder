/* SPDX-License-Identifier: AGPL-3.0-or-later
   Copyright (c) 2026 Arnold Wender / Wender Media
   ──────────────────────────────────────────────────────────
   The slice of the Strudel REPL that the Canvas 2D draw loops
   read. @strudel/* ships no types, so this is the hand-written
   description that keeps the visualizers off `any`.
   ────────────────────────────────────────────────────────── */

/** What a visualizer needs from `window.__strudelRepl`: a clock and a queryable
 *  pattern. Both are optional — the REPL object exists from the moment Strudel
 *  initialises, well before any code has been evaluated into it, which is
 *  exactly the state every draw function guards against on its first frames. */
export interface VisualizerRepl {
  scheduler?: { now(): number; [key: string]: unknown };
  state?: {
    pattern?: { queryArc(begin: number, end: number): unknown[] } | null;
    [key: string]: unknown;
  };
  [key: string]: unknown;
}

/** One hap as returned by `pattern.queryArc`. `whole` is absent for analog
 *  (zero-width) haps, which every visualizer skips. */
export interface VisualizerHap {
  whole?: { begin: number; end: number } | null;
  value?: unknown;
  [key: string]: unknown;
}
