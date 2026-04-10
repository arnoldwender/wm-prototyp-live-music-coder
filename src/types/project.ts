/* SPDX-License-Identifier: MIT
   Copyright (c) 2026 Arnold Wender / Wender Media
   ──────────────────────────────────────────────────────────
   Project types — file management, graph state, and layout.
   ────────────────────────────────────────────────────────── */

import type { EngineType, EngineBlock, Connection } from './engine'

/** Panel layout configuration for the resizable IDE panels */
export interface PanelLayout {
  editorWidth: number
  graphWidth: number
  visualizerHeight: number
  showGraph: boolean
  visiblePanels: {
    waveform: boolean
    spectrum: boolean
    timeline: boolean
    pianoroll: boolean
    punchcard: boolean
    spiral: boolean
    pitchwheel: boolean
  }
}

/** Single code file within a project — one per engine tab */
export interface ProjectFile {
  id: string
  name: string
  engine: EngineType
  code: string
  active: boolean
}

/** Top-level project state — serialized to JSON for save/load */
export interface Project {
  id: string
  name: string
  version: 1
  created: string
  updated: string
  bpm: number
  defaultEngine: EngineType
  files: ProjectFile[]
  graph: {
    nodes: EngineBlock[]
    edges: Connection[]
    viewport: { x: number; y: number; zoom: number }
  }
  layout: PanelLayout
}
