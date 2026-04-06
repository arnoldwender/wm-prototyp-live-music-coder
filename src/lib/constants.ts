/* SPDX-License-Identifier: MIT
   Copyright (c) 2026 Arnold Wender / Wender Media
   ──────────────────────────────────────────────────────────
   Application constants — BPM limits, default engine,
   engine color tokens, and default panel layout.
   ────────────────────────────────────────────────────────── */

import type { EngineType } from '../types/engine'
import type { PanelLayout } from '../types/project'

/* Transport defaults */
export const DEFAULT_BPM = 120
export const MIN_BPM = 20
export const MAX_BPM = 300

/* Default audio engine on startup */
export const DEFAULT_ENGINE: EngineType = 'strudel'

/* Map each engine to its CSS custom property color token */
export const ENGINE_COLORS: Record<EngineType, string> = {
  strudel: 'var(--color-strudel)',
  tonejs: 'var(--color-tonejs)',
  webaudio: 'var(--color-webaudio)',
  midi: 'var(--color-midi)',
}

/* Default panel layout — full-width editor, graph hidden by default */
export const DEFAULT_LAYOUT: PanelLayout = {
  editorWidth: 100,
  graphWidth: 0,
  visualizerHeight: 30,
  showGraph: false,
  visiblePanels: {
    waveform: true,
    spectrum: true,
    timeline: false,
    pianoroll: false,
  },
}
