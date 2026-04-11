// SPDX-License-Identifier: AGPL-3.0-or-later
// Copyright (c) 2026 Arnold Wender / Wender Media

/* ──────────────────────────────────────────────────────────
   Type declarations for @strudel/* packages.
   These packages ship JS-only — no .d.ts included.
   ────────────────────────────────────────────────────────── */

declare module '@strudel/core' {
  export function repl(options: Record<string, unknown>): {
    scheduler: { start(): void; stop(): void; setPattern(p: unknown): void }
    [key: string]: unknown
  }
}

declare module '@strudel/webaudio' {
  export function initAudioOnFirstClick(): void
  export function webaudioOutput(...args: unknown[]): unknown
  export function getAudioContext(): AudioContext
  export function samples(
    sampleMap: string | Record<string, unknown>,
    baseUrl?: string,
    options?: Record<string, unknown>,
  ): Promise<void>
  export function getSuperdoughAudioController(): {
    output: {
      destinationGain: GainNode | null;
      channelMerger: ChannelMergerNode | null;
    };
    connectToDestination: (node: AudioNode, channels?: number[]) => void;
  } | null
}

declare module '@strudel/mini' {
  const mini: unknown
  export default mini
}

declare module '@strudel/tonal' {
  const tonal: unknown
  export default tonal
}

declare module '@strudel/transpiler' {
  export function transpiler(code: string): string
}

declare module '@strudel/codemirror' {
  import type { EditorView } from '@codemirror/view';
  export class StrudelMirror {
    constructor(options: {
      root: HTMLElement;
      initialCode?: string;
      prebake?: () => Promise<void>;
      drawTime?: [number, number];
      bgFill?: boolean;
      onDraw?: (...args: unknown[]) => void;
      [key: string]: unknown;
    });
    editor: EditorView;
    repl: {
      evaluate: (code: string, autostart?: boolean) => Promise<unknown>;
      start: () => void;
      stop: () => void;
      scheduler: unknown;
    };
    code: string;
    setCode(code: string): void;
    evaluate(): Promise<void>;
    start(): void;
    stop(): void;
  }
  /** Array of CM6 extensions that enable per-character pattern highlighting */
  export const highlightExtension: import('@codemirror/state').Extension[];
  /** Dispatch mini-locations to the editor to update highlight decorations */
  export function updateMiniLocations(editor: EditorView, locations: unknown[]): void;
  /** Highlight haps at a specific time — alternative to updateMiniLocations */
  export function highlightMiniLocations(editor: EditorView, atTime: number, haps: unknown[]): void;
  export const theme: unknown;
}

declare module '@strudel/web' {
  export function initStrudel(options?: Record<string, unknown>): Promise<{
    scheduler: {
      start(): void
      stop(): void
      setPattern(p: unknown): void
      now(): number
    }
    evaluate: (code: string, autostart?: boolean) => Promise<unknown>
    start: () => void
    stop: () => void
    /** Live REPL state — updated after each evaluation */
    state: {
      miniLocations: unknown[]
      pattern: { queryArc(begin: number, end: number): unknown[] } | null
      activeCode: string
      [key: string]: unknown
    }
    [key: string]: unknown
  }>
}

declare module '@strudel/draw' {
  export function pianoroll(options?: Record<string, unknown>): unknown
  export function scope(options?: Record<string, unknown>): unknown
  export function punchcard(options?: Record<string, unknown>): unknown
}

declare module '@strudel/xen' {
  const xen: unknown
  export default xen
}

declare module '@strudel/soundfonts' {
  export function soundfonts(url?: string): Promise<void>
}

declare module '@strudel/osc' {
  export function osc(options?: Record<string, unknown>): unknown
}

declare module '@strudel/midi' {
  export function midin(device?: string): unknown
  export function midi(options?: Record<string, unknown>): unknown
}

declare module '@strudel/serial' {
  export function serial(options?: Record<string, unknown>): unknown
}

declare module 'superdough' {
  export function samples(
    sampleMap: string | Record<string, unknown>,
    baseUrl?: string,
    options?: Record<string, unknown>,
  ): Promise<void>
  export function getAudioContext(): AudioContext
  export function gainNode(): GainNode | null
  export function getSuperdoughAudioController(): {
    output: {
      destinationGain: GainNode | null;
      channelMerger: ChannelMergerNode | null;
    };
    connectToDestination: (node: AudioNode, channels?: number[]) => void;
  } | null
  export function getAnalyserById(id: string | number, fftSize?: number, smoothing?: number): AnalyserNode
}
