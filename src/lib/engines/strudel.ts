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
  private replInstance: any = null

  async init(): Promise<void> {
    /* Use @strudel/web's initStrudel() — the all-in-one initializer.
     * It handles: repl creation, transpiler setup, mini-notation registration,
     * tonal functions, webaudio output, sample loading, and AudioContext.
     * This is the official way to embed Strudel. */
    const { initStrudel } = await import('@strudel/web')

    this.replInstance = await initStrudel()
    this.scheduler = this.replInstance.scheduler

    console.log('[Strudel] Engine initialized via initStrudel()')
  }

  /** Evaluate Strudel code using the repl's built-in evaluate().
   * This handles transpilation, mini-notation parsing, and pattern
   * scheduling automatically — no manual Function() needed. */
  async evaluate(code: string): Promise<void> {
    if (!this.replInstance) throw new Error('Strudel not initialized')

    try {
      /* Strip REPL-style $: prefix that users copy from Strudel REPL */
      const cleanCode = code.replace(/^\$\s*:\s*/gm, '')
      if (!cleanCode.trim()) return

      await this.replInstance.evaluate(cleanCode)
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
    this.replInstance?.start()
  }

  stop(): void {
    this.replInstance?.stop()
  }

  dispose(): void {
    this.stop()
    super.dispose()
    this.scheduler = null
    this.replInstance = null
  }
}
