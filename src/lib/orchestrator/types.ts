/* SPDX-License-Identifier: MIT
   Copyright (c) 2026 Arnold Wender / Wender Media
   ──────────────────────────────────────────────────────────
   Orchestrator types — re-exports engine types and adds
   orchestrator-specific state and event definitions.
   ────────────────────────────────────────────────────────── */

export type {
  EngineType,
  ParamValue,
  PortDefinition,
  EngineBlock,
  Connection,
  AudioNodeWrapper,
  EngineAdapter,
} from '../../types/engine'

/** Current playback state of the orchestrator */
export type OrchestratorState = 'stopped' | 'playing' | 'paused'

/** Events emitted by the orchestrator for UI updates */
export interface OrchestratorEvent {
  type: 'block-added' | 'block-removed' | 'connected' | 'disconnected' | 'state-changed' | 'cleared'
  blockId?: string
  connectionId?: string
  state?: OrchestratorState
}
