/* eslint-disable @typescript-eslint/no-explicit-any */
/* ──────────────────────────────────────────────────────────
   Web Audio engine adapter — raw Web Audio API access.
   Provides a pre-resumed AudioContext with masterGain chain.
   Intercepts .connect(destination) calls to route through
   masterGain → masterAnalyser → destination for visualization.
   ────────────────────────────────────────────────────────── */

import { BaseEngine } from './base'
import type { EngineType, EngineBlock, AudioNodeWrapper } from '../../types/engine'
import { getSharedContext, getMasterGain, resumeContext } from '../audio/context'
import { resetStrudelTap } from '../audio/strudel-tap'

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

  /** Evaluate raw Web Audio code.
   * User code gets `ctx` (AudioContext) and `out` (masterGain → analyser → speakers).
   * No regex patching — user connects to `out` or `ctx.destination` directly.
   * We intercept ctx.destination connections via a Proxy. */
  async evaluate(code: string): Promise<void> {
    await resumeContext()
    const ctx = getSharedContext()
    const masterGain = getMasterGain()

    /* Create a proxy of ctx that intercepts .destination to return masterGain.
     * This way user code like `osc.connect(ctx.destination)` routes through
     * masterGain → masterAnalyser → real destination automatically. */
    const ctxProxy = new Proxy(ctx, {
      get(target, prop) {
        if (prop === 'destination') return masterGain
        const val = (target as any)[prop]
        return typeof val === 'function' ? val.bind(target) : val
      }
    })

    /* Strip user's `const/let/var ctx = new AudioContext()` — we inject our proxied ctx.
     * Also replace any standalone `new AudioContext()` with the proxied ctx. */
    const patchedCode = code
      .replace(/(?:const|let|var)\s+ctx\s*=\s*new\s+AudioContext\s*\([^)]*\)\s*;?/g, '/* ctx provided by engine */')
      .replace(/new\s+AudioContext\s*\([^)]*\)/g, 'ctx')

    try {
      /* `ctx` = proxied AudioContext (destination → masterGain)
       * `out` = masterGain directly (convenience alias) */
      await Function('ctx', 'out', `"use strict"; return (async () => { ${patchedCode} })()`)(
        ctxProxy, masterGain
      )
      /* Audio chain: user nodes → masterGain → masterAnalyser → speakers */
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
    for (const wrapper of this.nodes.values()) {
      try { wrapper.node.disconnect() } catch { /* ok */ }
    }
  }
}
