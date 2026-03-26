/* ──────────────────────────────────────────────────────────
   Web Audio engine adapter — raw Web Audio API access.
   Maximum flexibility — users create oscillators, filters,
   gains directly. Provides AudioContext already resumed.
   ────────────────────────────────────────────────────────── */

import { BaseEngine } from './base'
import type { EngineType, EngineBlock, AudioNodeWrapper } from '../../types/engine'
import { getSharedContext, getMasterGain, resumeContext } from '../audio/context'
import { resetStrudelTap } from '../audio/strudel-tap'

/** Raw Web Audio API engine adapter.
 * Maximum flexibility — users create oscillators, filters, gains directly.
 * Intercepts `new AudioContext()` so user code uses the shared (resumed) context. */
export class WebAudioEngine extends BaseEngine {
  name: EngineType = 'webaudio'

  async init(): Promise<void> {
    /* No external deps — Web Audio API is native */
  }

  async createNode(block: EngineBlock): Promise<AudioNodeWrapper> {
    const ctx = this.getContext()
    const gain = ctx.createGain()
    gain.connect(getMasterGain())

    const wrapper: AudioNodeWrapper = {
      id: `webaudio_${block.id}`,
      blockId: block.id,
      node: gain,
    }
    this.nodes.set(block.id, wrapper)
    return wrapper
  }

  /** Evaluate raw Web Audio code with AudioContext in scope.
   * Intercepts `new AudioContext()` so user code reuses the shared (resumed) context.
   * SECURITY NOTE: Uses Function() constructor intentionally — this is a live
   * coding IDE where executing user-written code is the core feature. */
  async evaluate(code: string): Promise<void> {
    /* Resume shared context before eval (browser requires user gesture) */
    await resumeContext()
    const ctx = getSharedContext()
    const masterGain = getMasterGain()

    /* Patch user code:
     * 1. Strip `const ctx = new AudioContext()` — we inject ctx
     * 2. Replace `new AudioContext()` with ctx
     * 3. Replace `ctx.destination` with destination (our masterGain)
     *    so visualizers capture the audio */
    const patchedCode = code
      .replace(/(?:const|let|var)\s+ctx\s*=\s*new\s+AudioContext\s*\(\s*\)\s*;?/g, '/* ctx provided by engine */')
      .replace(/new\s+AudioContext\s*\(\s*\)/g, 'ctx')
      .replace(/ctx\.destination/g, 'destination')

    try {
      /* Provide `destination` as masterGain — anything connected here flows
       * through masterGain → masterAnalyser → real destination (speakers) */
      await Function('ctx', 'masterGain', 'destination', `"use strict"; return (async () => { ${patchedCode} })()`)(
        ctx, masterGain, masterGain
      )
      console.log('[WebAudio] Code evaluated successfully')
      resetStrudelTap()
    } catch (err) {
      console.error('[WebAudio] Evaluation error:', err)
      throw err
    }
  }

  start(): void {
    /* Web Audio nodes are started individually via code */
  }

  stop(): void {
    /* Stop all active oscillators/sources by disconnecting */
    for (const wrapper of this.nodes.values()) {
      try { wrapper.node.disconnect() } catch { /* ok */ }
    }
  }
}
