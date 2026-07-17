/* SPDX-License-Identifier: MIT
   Copyright (c) 2026 Arnold Wender / Wender Media
   ──────────────────────────────────────────────────────────
   Global Window augmentations — eliminates (window as any) casts
   throughout the codebase.
   ────────────────────────────────────────────────────────── */

declare global {
  interface Window {
    /** Strudel REPL instance — set by StrudelEditor after init.
     *  Only the members we actually consume are typed; the REPL carries more. */
    __strudelRepl?: {
      evaluate: (code: string, autoplay?: boolean) => Promise<unknown>;
      scheduler?: { bpm?: number; [key: string]: unknown };
      [key: string]: unknown;
    };
    /** Prevents double-patching console.log in ConsolePanel */
    __lmcConsolePatched?: boolean;
    /** Play a single note — wired by PianorollVisualizer for pitch-drag audition
     *  (called with just the note) and by VirtualKeyboard (note + velocity). */
    __lmcPlayNote?: (midiNote: number, velocity?: number, oscType?: OscillatorType) => void;

    /** Strudel global helpers registered via evalScope in strudel-extensions.ts.
     *  Our custom midikeys/midin (strudel-keys.ts) take an optional device id. */
    midikeys?: (device?: string | number) => Promise<unknown>;
    midin?: (device?: string | number) => Promise<unknown>;
    sliderWithID?: (id: string, value?: number, min?: number, max?: number, step?: number) => unknown;
    slider?: (value?: number, min?: number, max?: number, step?: number) => unknown;
  }
}

export {};
