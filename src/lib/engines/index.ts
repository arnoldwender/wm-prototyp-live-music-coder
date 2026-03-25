/* ──────────────────────────────────────────────────────────
   Engine registry — barrel exports + factory + metadata.
   Creates engine adapters by type and provides display info.
   ────────────────────────────────────────────────────────── */

import type { EngineType, EngineAdapter } from '../../types/engine'
import { StrudelEngine } from './strudel'
import { ToneJsEngine } from './tonejs'
import { WebAudioEngine } from './webaudio'
import { MidiEngine } from './midi'

/* Re-export all engine classes */
export { StrudelEngine } from './strudel'
export { ToneJsEngine } from './tonejs'
export { WebAudioEngine } from './webaudio'
export { MidiEngine } from './midi'
export { BaseEngine } from './base'

/** Create an engine adapter by type */
export function createEngine(type: EngineType): EngineAdapter {
  switch (type) {
    case 'strudel': return new StrudelEngine()
    case 'tonejs': return new ToneJsEngine()
    case 'webaudio': return new WebAudioEngine()
    case 'midi': return new MidiEngine()
  }
}

/** Engine display metadata — label and description for UI */
export const ENGINE_META: Record<EngineType, { label: string; description: string }> = {
  strudel: { label: 'Strudel', description: 'Pattern-based live coding' },
  tonejs: { label: 'Tone.js', description: 'High-level synths and effects' },
  webaudio: { label: 'Web Audio', description: 'Low-level audio nodes' },
  midi: { label: 'MIDI', description: 'External MIDI device output' },
}
