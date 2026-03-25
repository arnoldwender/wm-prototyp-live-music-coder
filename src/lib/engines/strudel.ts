/* ──────────────────────────────────────────────────────────
   Strudel engine adapter — pattern-based live coding.
   Uses @strudel/core repl + scheduler for pattern evaluation.
   Audio routed through superdough → shared AudioContext.
   Dynamic imports for code splitting.
   ────────────────────────────────────────────────────────── */

import { BaseEngine } from './base'
import type { EngineType, EngineBlock, AudioNodeWrapper } from '../../types/engine'

/** Strudel engine adapter.
 * Uses @strudel/core repl + scheduler for pattern evaluation.
 * Audio routed through superdough → shared AudioContext. */
export class StrudelEngine extends BaseEngine {
  name: EngineType = 'strudel'
  private scheduler: any = null

  async init(): Promise<void> {
    /* Dynamic import to enable code splitting */
    const [{ repl }, webaudioModule] = await Promise.all([
      import('@strudel/core'),
      import('@strudel/webaudio'),
    ])

    const { initAudioOnFirstClick, webaudioOutput, getAudioContext } = webaudioModule

    /* Also load mini-notation and tonal for full pattern support */
    await Promise.all([
      import('@strudel/mini'),
      import('@strudel/tonal'),
    ])

    initAudioOnFirstClick()

    /* Load default Dirt-Samples from Strudel CDN so sounds like
     * bd, sd, hh, and banks like RolandTR808 work out of the box.
     * samples() lives in superdough, re-exported at runtime through
     * @strudel/webaudio but missing from its TS declarations. */
    try {
      const { samples } = await import('superdough')
      await samples('github:tidalcycles/Dirt-Samples/master')
    } catch (err) {
      console.warn('[Strudel] Failed to load default samples — oscillator sounds still work:', err)
    }

    /* Strudel creates its own AudioContext via getAudioContext().
     * We need to route its output through our master gain. */
    const strudelCtx = getAudioContext()

    const replInstance = repl({
      defaultOutput: webaudioOutput,
      getTime: () => strudelCtx.currentTime,
    })

    this.scheduler = replInstance.scheduler

  }

  /** Evaluate Strudel code and set as active pattern */
  async evaluate(code: string): Promise<void> {
    if (!this.scheduler) throw new Error('Strudel not initialized')

    try {
      /* Strip REPL-style $: prefix that users copy from Strudel REPL */
      const cleanCode = code.replace(/^\$\s*:\s*/gm, '')

      /* Use the transpiler for full syntax support */
      const { transpiler } = await import('@strudel/transpiler')
      const transpiled = transpiler(cleanCode)

      /* Evaluate the transpiled code to get a Pattern */
      const pattern = await Function(`"use strict"; return (async () => { ${transpiled} })()`)()
      if (pattern?.queryArc) {
        this.scheduler.setPattern(pattern)
      }
    } catch (err) {
      console.error('[Strudel] Evaluation error:', err)
      throw err
    }
  }

  async createNode(block: EngineBlock): Promise<AudioNodeWrapper> {
    const ctx = this.getContext()
    /* Strudel manages its own nodes internally via superdough.
     * We create a passthrough gain node as a handle for the graph. */
    const gain = ctx.createGain()
    const wrapper: AudioNodeWrapper = {
      id: `strudel_${block.id}`,
      blockId: block.id,
      node: gain,
    }
    this.nodes.set(block.id, wrapper)
    return wrapper
  }

  start(): void {
    this.scheduler?.start()
  }

  stop(): void {
    this.scheduler?.stop()
  }

  dispose(): void {
    this.stop()
    super.dispose()
    this.scheduler = null
  }
}
