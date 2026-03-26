/* ──────────────────────────────────────────────────────────
   Web Audio engine adapter — raw Web Audio API access.
   Maximum flexibility — users create oscillators, filters,
   gains directly. Code is evaluated with AudioContext in scope.
   ────────────────────────────────────────────────────────── */

import { BaseEngine } from './base'
import type { EngineType, EngineBlock, AudioNodeWrapper } from '../../types/engine'
import { getMasterGain } from '../audio/context'

/** Raw Web Audio API engine adapter.
 * Maximum flexibility — users create oscillators, filters, gains directly.
 * Code is evaluated with AudioContext in scope. */
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

  /** Evaluate raw Web Audio code with ctx and masterGain in scope.
   * SECURITY NOTE: Uses Function() constructor intentionally — this is a live
   * coding IDE where executing user-written code is the core feature. Code runs
   * in the browser sandbox. Users must press Play to evaluate (no auto-eval). */
  async evaluate(code: string): Promise<void> {
    const ctx = this.getContext()
    const masterGain = getMasterGain()
    try {
      await Function('ctx', 'masterGain', `"use strict"; return (async () => { ${code} })()`)(ctx, masterGain)
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
