/* ──────────────────────────────────────────────────────────
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
  strudel: 'var(--color-engine-strudel)',
  tonejs: 'var(--color-engine-tonejs)',
  webaudio: 'var(--color-engine-webaudio)',
  midi: 'var(--color-engine-midi)',
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
    timeline: true,
    pianoroll: false,
    beatlings: true,
    brain: true,
  },
}
