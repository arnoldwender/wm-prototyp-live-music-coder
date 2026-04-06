// SPDX-License-Identifier: MIT
// Copyright (c) 2026 Arnold Wender / Wender Media
/* eslint-disable @typescript-eslint/no-explicit-any */
/* ──────────────────────────────────────────────────────────
   Orchestrator — central manager for engines, audio graph,
   and playback state. Evaluates code from the editor and
   routes it to the appropriate engine. Singleton pattern.
   ────────────────────────────────────────────────────────── */

import { AudioGraph } from './graph'
import { createEngineAsync } from '../engines'
import { resumeContext } from '../audio/context'
import type { EngineType, EngineAdapter } from '../../types/engine'
import type { OrchestratorState } from './types'

export type { OrchestratorState } from './types'

/** Central orchestrator — manages engines, audio graph, and playback state.
 * Evaluates code from the editor and routes it to the appropriate engine. */
export class Orchestrator {
  private engines: Map<EngineType, EngineAdapter> = new Map()
  private initializedEngines: Set<EngineType> = new Set()
  private graph: AudioGraph
  private state: OrchestratorState = 'stopped'
  private bpm = 120

  constructor() {
    this.graph = new AudioGraph()
  }

  /** Lazily initialize an engine (only when first needed) */
  async getEngine(type: EngineType): Promise<EngineAdapter> {
    /* Lazy-load engine module on first access — code-splits heavy deps */
    if (!this.engines.has(type)) {
      const engine = await createEngineAsync(type)
      this.engines.set(type, engine)
    }
    const engine = this.engines.get(type)!

    /* Initialize once on first access */
    if (!this.initializedEngines.has(type)) {
      await engine.init()
      this.initializedEngines.add(type)
    }
    return engine
  }

  /** Evaluate code with the specified engine */
  async evaluate(code: string, engineType: EngineType): Promise<void> {
    const engine = await this.getEngine(engineType)
    if ('evaluate' in engine && typeof (engine as any).evaluate === 'function') {
      await (engine as any).evaluate(code)
    }
  }

  /** Start playback — resumes AudioContext and starts all active engines */
  async start(): Promise<void> {
    await resumeContext()
    for (const engine of this.engines.values()) {
      /* start() requires an EngineBlock param in the interface,
       * but engines handle global start with no args */
      (engine as any).start()
    }
    this.state = 'playing'
  }

  /** Stop playback — stops all active engines */
  stop(): void {
    for (const engine of this.engines.values()) {
      (engine as any).stop()
    }
    this.state = 'stopped'
  }

  /** Set BPM across all engines that support it */
  setBpm(bpm: number): void {
    this.bpm = bpm
    for (const [type, engine] of this.engines) {
      if (type === 'tonejs' && 'setBpm' in engine) {
        (engine as any).setBpm(bpm)
      }
    }
  }

  /** Current playback state */
  getState(): OrchestratorState {
    return this.state
  }

  /** The directed audio graph of blocks and connections */
  getGraph(): AudioGraph {
    return this.graph
  }

  /** Current BPM */
  getBpm(): number {
    return this.bpm
  }

  /** Get or create a per-block analyser node, delegating to the engine adapter.
   * Returns null if the engine is not yet initialized or doesn't support it. */
  getAnalyserForBlock(blockId: string, engineType: EngineType): AnalyserNode | null {
    const engine = this.engines.get(engineType)
    if (!engine || !this.initializedEngines.has(engineType)) return null

    /* Delegate to the engine's per-block analyser cache */
    if ('getAnalyserForBlock' in engine && typeof (engine as any).getAnalyserForBlock === 'function') {
      return (engine as any).getAnalyserForBlock(blockId)
    }
    return null
  }

  /** Dispose all engines and clean up */
  dispose(): void {
    this.stop()
    for (const engine of this.engines.values()) {
      engine.dispose()
    }
    this.engines.clear()
    this.initializedEngines.clear()
    this.graph.clear()
  }
}

/* ── Singleton ─────────────────────────────────────────── */

let orchestratorInstance: Orchestrator | null = null

/** Get or create the singleton Orchestrator */
export function getOrchestrator(): Orchestrator {
  if (!orchestratorInstance) {
    orchestratorInstance = new Orchestrator()
  }
  return orchestratorInstance
}

/** Dispose the singleton Orchestrator and release resources */
export function disposeOrchestrator(): void {
  orchestratorInstance?.dispose()
  orchestratorInstance = null
}
