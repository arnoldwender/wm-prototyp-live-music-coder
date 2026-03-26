/* ──────────────────────────────────────────────────────────
   Engine registry — barrel exports + lazy factory + metadata.
   Engines are loaded on demand to avoid bundling Tone.js (636KB)
   and WebMidi (68KB) when only Strudel is used.
   ────────────────────────────────────────────────────────── */

import type { EngineType, EngineAdapter } from '../../types/engine'

/* Re-export base class (lightweight, always needed) */
export { BaseEngine } from './base'

/** Lazily create an engine adapter by type — code-splits heavy deps */
export async function createEngineAsync(type: EngineType): Promise<EngineAdapter> {
  switch (type) {
    case 'strudel': {
      const { StrudelEngine } = await import('./strudel')
      return new StrudelEngine()
    }
    case 'tonejs': {
      const { ToneJsEngine } = await import('./tonejs')
      return new ToneJsEngine()
    }
    case 'webaudio': {
      const { WebAudioEngine } = await import('./webaudio')
      return new WebAudioEngine()
    }
    case 'midi': {
      const { MidiEngine } = await import('./midi')
      return new MidiEngine()
    }
  }
}

/** Engine display metadata — label and description for UI */
export const ENGINE_META: Record<EngineType, { label: string; description: string }> = {
  strudel: { label: 'Strudel', description: 'Pattern-based live coding' },
  tonejs: { label: 'Tone.js', description: 'High-level synths and effects' },
  webaudio: { label: 'Web Audio', description: 'Low-level audio nodes' },
  midi: { label: 'MIDI', description: 'External MIDI device output' },
}
