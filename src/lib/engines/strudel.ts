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
  private replEvaluate: ((code: string) => Promise<any>) | null = null
  private replStart: (() => void) | null = null
  private replStop: (() => void) | null = null

  async init(): Promise<void> {
    /* Dynamic import to enable code splitting */
    const [{ repl }, webaudioModule] = await Promise.all([
      import('@strudel/core'),
      import('@strudel/webaudio'),
    ])

    const { initAudioOnFirstClick, webaudioOutput, getAudioContext } = webaudioModule

    /* Load mini-notation and tonal for full pattern support */
    await Promise.all([
      import('@strudel/mini'),
      import('@strudel/tonal'),
    ])

    initAudioOnFirstClick()

    /* Load default Dirt-Samples from Strudel CDN so sounds like
     * bd, sd, hh, and banks like RolandTR808 work out of the box. */
    try {
      const { samples } = await import('superdough')
      await samples('github:tidalcycles/Dirt-Samples/master')
    } catch (err) {
      console.warn('[Strudel] Failed to load default samples — oscillator sounds still work:', err)
    }

    /* Import the transpiler so the REPL knows how to parse
     * mini-notation and resolve functions like note(), s(), etc. */
    const { transpiler } = await import('@strudel/transpiler')

    /* Create the Strudel REPL instance — with transpiler it handles
     * full Strudel syntax including mini-notation, function calls,
     * and pattern scheduling. */
    const strudelCtx = getAudioContext()
    const replInstance = repl({
      defaultOutput: webaudioOutput,
      getTime: () => strudelCtx.currentTime,
      transpiler,
    })

    this.scheduler = replInstance.scheduler
    this.replEvaluate = replInstance.evaluate
    this.replStart = replInstance.start
    this.replStop = replInstance.stop

    console.log('[Strudel] Engine initialized')
  }

  /** Evaluate Strudel code using the repl's built-in evaluate().
   * This handles transpilation, mini-notation parsing, and pattern
   * scheduling automatically — no manual Function() needed. */
  async evaluate(code: string): Promise<void> {
    if (!this.replEvaluate) throw new Error('Strudel not initialized')

    try {
      /* Strip REPL-style $: prefix that users copy from Strudel REPL */
      const cleanCode = code.replace(/^\$\s*:\s*/gm, '')
      if (!cleanCode.trim()) return

      await this.replEvaluate(cleanCode)
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
    this.replStart?.()
  }

  stop(): void {
    this.replStop?.()
  }

  dispose(): void {
    this.stop()
    super.dispose()
    this.scheduler = null
    this.replEvaluate = null
    this.replStart = null
    this.replStop = null
  }
}
