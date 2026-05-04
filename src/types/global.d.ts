/* SPDX-License-Identifier: MIT
   Copyright (c) 2026 Arnold Wender / Wender Media
   ──────────────────────────────────────────────────────────
   Global Window augmentations — eliminates (window as any) casts
   throughout the codebase.
   ────────────────────────────────────────────────────────── */

declare global {
  interface Window {
    /** Strudel REPL instance — set by StrudelEditor after init */
    __strudelRepl?: unknown;
    /** Prevents double-patching console.log in ConsolePanel */
    __lmcConsolePatched?: boolean;
    /** Play a single note — wired by PianorollVisualizer for pitch-drag audition */
    __lmcPlayNote?: (note: number) => void;

    /** Strudel global helpers registered via evalScope in strudel-extensions.ts */
    midikeys?: (...args: unknown[]) => unknown;
    midin?: (...args: unknown[]) => unknown;
    sliderWithID?: (id: string, value?: number, min?: number, max?: number, step?: number) => unknown;
    slider?: (value?: number, min?: number, max?: number, step?: number) => unknown;
  }
}

export {};
