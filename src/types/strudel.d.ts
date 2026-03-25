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
  export function highlightExtension(): unknown[];
  export function updateMiniLocations(editor: EditorView, locations: unknown[]): void;
  export const theme: unknown;
}

declare module '@strudel/web' {
  export function initStrudel(options?: Record<string, unknown>): Promise<{
    scheduler: { start(): void; stop(): void; setPattern(p: unknown): void }
    evaluate: (code: string, autostart?: boolean) => Promise<unknown>
    start: () => void
    stop: () => void
    [key: string]: unknown
  }>
}

declare module 'superdough' {
  /** Load a sample map from a URL (e.g. 'github:tidalcycles/Dirt-Samples/master') */
  export function samples(
    sampleMap: string | Record<string, unknown>,
    baseUrl?: string,
    options?: Record<string, unknown>,
  ): Promise<void>
}
