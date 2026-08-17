// SPDX-License-Identifier: AGPL-3.0-or-later
// Copyright (c) 2026 Arnold Wender / Wender Media

/* eslint-disable @typescript-eslint/no-explicit-any */
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
  private replInstance: any = null

  async init(): Promise<void> {
    /* Use @strudel/web's initStrudel() — the all-in-one initializer.
     * It handles: repl creation, transpiler setup, mini-notation registration,
     * tonal functions, webaudio output, sample loading, and AudioContext.
     * This is the official way to embed Strudel. */
    const { initStrudel } = await import('@strudel/web')

    /* Put superdough on the app's shared AudioContext before the REPL is built. */
    await (await import('../audio/context')).adoptSharedContextForStrudel()

    this.replInstance = await initStrudel()

    if (import.meta.env.DEV) console.log('[Strudel] Engine initialized via initStrudel()');
  }

  /** Evaluate Strudel code using the repl's built-in evaluate().
   * This handles transpilation, mini-notation parsing, and pattern
   * scheduling automatically — no manual Function() needed. */
  async evaluate(code: string): Promise<void> {
    if (!this.replInstance) throw new Error('Strudel not initialized')

    try {
      /* Pass the code through unmodified.
       *
       * This used to delete leading `$:` labels, on the theory that they were
       * REPL noise users had pasted in. They are not: Strudel's transpiler
       * compiles `$: pat` into `pat.p('$')` and the REPL stacks every such
       * registration, so removing them collapses a multi-layer pattern down to
       * whichever layer happened to be last. See src/lib/dollar-label.test.ts. */
      if (!code.trim()) return

      await this.replInstance.evaluate(code)
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

  /**
   * Set the tempo.
   *
   * Strudel is cycle-based, not beat-based: setcpm(140/4) is 140 bpm in 4/4, so
   * cpm = bpm / BARS_PER_CYCLE. Four is the assumption baked into every example
   * and session in this repo; it is named here rather than left as a magic 4.
   *
   * Targets window.__strudelRepl first because THAT is the REPL that plays. The
   * orchestrator holds its own StrudelEngine instance, but the shipped editor
   * path builds its own REPL in StrudelEditor and publishes it globally — so an
   * engine that only ever set its own replInstance would move a tempo nobody
   * hears. this.replInstance is the fallback for the orchestrator-only path.
   */
  setBpm(bpm: number): void {
    const BARS_PER_CYCLE = 4
    const cpm = bpm / BARS_PER_CYCLE
    const live = window.__strudelRepl
    if (typeof live?.setCpm === 'function') { live.setCpm(cpm); return }
    if (typeof live?.setCps === 'function') { live.setCps(cpm / 60); return }
    this.replInstance?.setCpm?.(cpm)
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
    this.replInstance = null
  }
}
