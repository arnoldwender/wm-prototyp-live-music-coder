/* ──────────────────────────────────────────────────────────
   Tone.js engine adapter — high-level synths and effects.
   Provides synth factory (7 types), transport control, and
   BPM sync. Uses shared AudioContext via Tone.setContext().
   ────────────────────────────────────────────────────────── */

import { BaseEngine } from './base'
import type { EngineType, EngineBlock, AudioNodeWrapper } from '../../types/engine'
import { getSharedContext, getMasterGain } from '../audio/context'

/** Tone.js engine adapter.
 * Provides high-level synth creation and transport control.
 * Uses shared AudioContext via Tone.setContext(). */
export class ToneJsEngine extends BaseEngine {
  name: EngineType = 'tonejs'
  private Tone: typeof import('tone') | null = null

  async init(): Promise<void> {
    /* Dynamic import for code splitting */
    this.Tone = await import('tone')
    /* Use our shared AudioContext */
    this.Tone.setContext(getSharedContext())
  }

  async createNode(block: EngineBlock): Promise<AudioNodeWrapper> {
    if (!this.Tone) throw new Error('Tone.js not initialized')

    /* Create a synth based on block params or default to basic Synth */
    const synthType = block.params.synthType?.value ?? 0
    const synth = this.createSynth(synthType)

    /* Connect to master gain via the raw Web Audio output node */
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

  /** Evaluate Tone.js code with Tone in scope */
  async evaluate(code: string): Promise<void> {
    if (!this.Tone) throw new Error('Tone.js not initialized')
    try {
      const Tone = this.Tone
      await Function('Tone', `"use strict"; return (async () => { ${code} })()`)(Tone)
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

  /** Set BPM on Tone.js transport */
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

  /** Factory: create a Tone.js synth by numeric type index
   * 0=Synth, 1=FMSynth, 2=AMSynth, 3=MonoSynth,
   * 4=MembraneSynth, 5=MetalSynth, 6=PluckSynth */
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
