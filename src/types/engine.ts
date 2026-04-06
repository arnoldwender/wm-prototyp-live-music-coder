/* SPDX-License-Identifier: MIT
   Copyright (c) 2026 Arnold Wender / Wender Media
   ──────────────────────────────────────────────────────────
   Engine types — audio engine blocks, connections, adapters
   Each engine (Strudel, Tone.js, WebAudio, MIDI) implements
   the EngineAdapter interface for unified control.
   ────────────────────────────────────────────────────────── */

/** Supported audio engine identifiers */
export type EngineType = 'strudel' | 'tonejs' | 'webaudio' | 'midi'

/** Numeric parameter with range constraints for UI knobs/sliders */
export interface ParamValue {
  value: number
  min: number
  max: number
  step: number
  label: string
}

/** Connection port on a block — typed for routing validation */
export interface PortDefinition {
  id: string
  label: string
  type: 'audio' | 'data' | 'midi'
}

/** Single processing node in the audio graph */
export interface EngineBlock {
  id: string
  engine: EngineType
  type: 'source' | 'effect' | 'output'
  code: string
  params: Record<string, ParamValue>
  inputs: PortDefinition[]
  outputs: PortDefinition[]
}

/** Edge between two blocks in the audio graph */
export interface Connection {
  id: string
  sourceBlockId: string
  sourcePortId: string
  targetBlockId: string
  targetPortId: string
}

/** Runtime wrapper around a Web Audio node for visualization */
export interface AudioNodeWrapper {
  id: string
  blockId: string
  node: AudioNode
  analyser?: AnalyserNode
}

/** Unified interface that each audio engine must implement */
export interface EngineAdapter {
  name: EngineType
  init(): Promise<void>
  createNode(block: EngineBlock): Promise<AudioNodeWrapper>
  connect(source: AudioNodeWrapper, target: AudioNodeWrapper, connection: Connection): void
  disconnect(source: AudioNodeWrapper, target: AudioNodeWrapper): void
  start(block: EngineBlock): void
  stop(block: EngineBlock): void
  dispose(): void
  getAnalyserNode(): AnalyserNode | null
  getAnalyserForBlock(blockId: string): AnalyserNode | null
}
