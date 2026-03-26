/* eslint-disable @typescript-eslint/no-explicit-any */
/* ──────────────────────────────────────────────────────────
   Tone.js engine adapter — high-level synths and effects.
   Uses shared AudioContext + connects Tone's Destination to
   masterAnalyser for visualization. setContext() called in
   init() BEFORE any Tone nodes are created.
   ────────────────────────────────────────────────────────── */

import { BaseEngine } from './base'
import type { EngineType, EngineBlock, AudioNodeWrapper } from '../../types/engine'
import { getSharedContext, getMasterGain, getMasterAnalyser } from '../audio/context'
import { resetStrudelTap } from '../audio/strudel-tap'

/** Tone.js engine adapter. */
export class ToneJsEngine extends BaseEngine {
  name: EngineType = 'tonejs'
  private Tone: typeof import('tone') | null = null

  async init(): Promise<void> {
    this.Tone = await import('tone')

    /* Force Tone onto the shared AudioContext — MUST happen before any nodes.
     * This makes .toDestination() route through sharedCtx.destination. */
    const sharedCtx = getSharedContext()
    this.Tone.setContext(sharedCtx)

    /* Tap Tone's master output for visualizers.
     * Tone.getDestination().connect(node) adds a parallel connection from
     * Destination's output GainNode to our masterAnalyser, without breaking
     * the existing Destination → speakers chain. */
    const analyser = getMasterAnalyser()
    this.Tone.getDestination().connect(analyser)
  }

  async createNode(block: EngineBlock): Promise<AudioNodeWrapper> {
    if (!this.Tone) throw new Error('Tone.js not initialized')

    const synthType = block.params.synthType?.value ?? 0
    const synth = this.createSynth(synthType)

    const rawOutput = (synth as any).output as AudioNode
    rawOutput.connect(getMasterGain())

    const wrapper: AudioNodeWrapper = {
      id: `tonejs_${block.id}`,
      blockId: block.id,
      node: rawOutput,
    }
    this.nodes.set(block.id, wrapper)
    return wrapper
  }

  /** Evaluate Tone.js code with Tone in scope.
   * SECURITY NOTE: Uses Function() constructor intentionally — this is a live
   * coding IDE where executing user-written code is the core feature. */
  async evaluate(code: string): Promise<void> {
    if (!this.Tone) throw new Error('Tone.js not initialized')

    /* Resume AudioContext — browsers suspend until user gesture */
    try {
      const ctx = this.Tone.getContext().rawContext
      if (ctx && (ctx as AudioContext).state === 'suspended') {
        await (ctx as AudioContext).resume()
      }
    } catch { /* context resume failed */ }

    /* Stop previous transport to start fresh */
    try {
      this.Tone.getTransport().stop()
      this.Tone.getTransport().cancel()
    } catch { /* transport not started */ }

    try {
      const Tone = this.Tone
      await Function('Tone', `"use strict"; return (async () => { ${code} })()`)(Tone)
      console.log('[Tone.js] Code evaluated successfully')
      /* Reset visualizer tap to force reconnect */
      resetStrudelTap()
      setTimeout(() => resetStrudelTap(), 300)
    } catch (err) {
      console.error('[Tone.js] Evaluation error:', err)
      throw err
    }
  }

  start(): void {
    this.Tone?.getTransport().start()
  }

  stop(): void {
    this.Tone?.getTransport().stop()
    this.Tone?.getTransport().cancel()
  }

  setBpm(bpm: number): void {
    if (this.Tone) {
      this.Tone.getTransport().bpm.value = bpm
    }
  }

  dispose(): void {
    this.stop()
    super.dispose()
    this.Tone = null
  }

  private createSynth(type: number): any {
    if (!this.Tone) throw new Error('Tone.js not initialized')
    const synthMap: Record<number, () => any> = {
      0: () => new this.Tone!.Synth(),
      1: () => new this.Tone!.FMSynth(),
      2: () => new this.Tone!.AMSynth(),
      3: () => new this.Tone!.MonoSynth(),
      4: () => new this.Tone!.MembraneSynth(),
      5: () => new this.Tone!.MetalSynth(),
      6: () => new this.Tone!.PluckSynth(),
    }
    return (synthMap[type] ?? synthMap[0])()
  }
}
