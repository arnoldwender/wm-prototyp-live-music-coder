/* ──────────────────────────────────────────────────────────
   Base engine adapter — abstract foundation for all engines.
   Provides shared AudioContext access, master gain routing,
   per-block analyser creation, and common connect/disconnect.
   ────────────────────────────────────────────────────────── */

import type { EngineType, EngineAdapter, EngineBlock, AudioNodeWrapper, Connection } from '../../types/engine'
import { getSharedContext, getMasterGain } from '../audio/context'

/** Abstract base for all engine adapters.
 * Provides shared AudioContext access and master gain routing. */
export abstract class BaseEngine implements EngineAdapter {
  abstract name: EngineType
  protected nodes: Map<string, AudioNodeWrapper> = new Map()
  protected analysers: Map<string, AnalyserNode> = new Map()

  abstract init(): Promise<void>
  abstract createNode(block: EngineBlock): Promise<AudioNodeWrapper>
  abstract start(block: EngineBlock): void
  abstract stop(block: EngineBlock): void

  /* Connect two AudioNode wrappers at the Web Audio level */
  connect(source: AudioNodeWrapper, target: AudioNodeWrapper, _connection: Connection): void {
    source.node.connect(target.node)
  }

  /* Disconnect two AudioNode wrappers, ignoring errors if not connected */
  disconnect(source: AudioNodeWrapper, target: AudioNodeWrapper): void {
    try {
      source.node.disconnect(target.node)
    } catch {
      /* Ignore if not connected */
    }
  }

  /** Connect a node's output to the master gain (final output) */
  connectToMaster(wrapper: AudioNodeWrapper): void {
    wrapper.node.connect(getMasterGain())
  }

  /** Create a new analyser connected to the master gain */
  getAnalyserNode(): AnalyserNode {
    const ctx = getSharedContext()
    const analyser = ctx.createAnalyser()
    analyser.fftSize = 2048
    getMasterGain().connect(analyser)
    return analyser
  }

  /** Get or create a per-block analyser, cached in the analysers map */
  getAnalyserForBlock(blockId: string): AnalyserNode {
    if (this.analysers.has(blockId)) return this.analysers.get(blockId)!

    const ctx = getSharedContext()
    const analyser = ctx.createAnalyser()
    analyser.fftSize = 2048

    /* Connect the block's node to this analyser if it exists */
    const wrapper = this.nodes.get(blockId)
    if (wrapper) wrapper.node.connect(analyser)

    this.analysers.set(blockId, analyser)
    return analyser
  }

  /** Dispose all nodes and analysers */
  dispose(): void {
    for (const wrapper of this.nodes.values()) {
      try { wrapper.node.disconnect() } catch { /* ok */ }
    }
    for (const analyser of this.analysers.values()) {
      try { analyser.disconnect() } catch { /* ok */ }
    }
    this.nodes.clear()
    this.analysers.clear()
  }

  /** Shorthand access to the shared AudioContext */
  protected getContext(): AudioContext {
    return getSharedContext()
  }
}
