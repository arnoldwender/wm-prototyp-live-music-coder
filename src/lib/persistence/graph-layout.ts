/* SPDX-License-Identifier: MIT
   Copyright (c) 2026 Arnold Wender / Wender Media
   ──────────────────────────────────────────────────────────
   Graph layout persistence — saves user-dragged React Flow
   node coordinates per active file in localStorage, isolated
   from evaluated audio code so manual layout changes survive
   reloads and edits without polluting pattern syntax.
   ────────────────────────────────────────────────────────── */

import { safeJsonParse } from './local'

const STORAGE_KEY = 'lmc-graph-positions'
const MAX_FILES = 50
const MAX_NODES_PER_FILE = 200

export interface NodePosition {
  x: number
  y: number
}

export type SavedNodePositions = Record<string, NodePosition>
type AllSavedPositions = Record<string, SavedNodePositions>

function isFinitePosition(value: unknown): value is NodePosition {
  if (!value || typeof value !== 'object' || Array.isArray(value)) return false
  const rec = value as Record<string, unknown>
  return (
    typeof rec.x === 'number' &&
    Number.isFinite(rec.x) &&
    typeof rec.y === 'number' &&
    Number.isFinite(rec.y)
  )
}

function readAllPositions(): AllSavedPositions {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return {}
    const parsed = safeJsonParse<unknown>(raw, null)
    if (!parsed || typeof parsed !== 'object' || Array.isArray(parsed)) return {}
    const sanitized: AllSavedPositions = {}
    for (const [fileId, nodes] of Object.entries(parsed as Record<string, unknown>).slice(0, MAX_FILES)) {
      if (!nodes || typeof nodes !== 'object' || Array.isArray(nodes)) continue
      const cleanNodes: SavedNodePositions = {}
      for (const [nodeId, pos] of Object.entries(nodes as Record<string, unknown>).slice(0, MAX_NODES_PER_FILE)) {
        if (isFinitePosition(pos)) {
          cleanNodes[nodeId] = { x: pos.x, y: pos.y }
        }
      }
      if (Object.keys(cleanNodes).length > 0) {
        sanitized[fileId] = cleanNodes
      }
    }
    return sanitized
  } catch {
    return {}
  }
}

function writeAllPositions(all: AllSavedPositions): void {
  try {
    const entries = Object.entries(all).slice(-MAX_FILES)
    localStorage.setItem(STORAGE_KEY, JSON.stringify(Object.fromEntries(entries)))
  } catch {
    /* Storage full or unavailable in restricted browser contexts */
  }
}

/** Read saved node coordinates for a given editor file ID. */
export function readSavedNodePositions(fileId: string): SavedNodePositions {
  if (!fileId) return {}
  return readAllPositions()[fileId] ?? {}
}

/** Persist a single node's dragged X/Y coordinates for a given file ID. */
export function saveNodePosition(fileId: string, nodeId: string, position: NodePosition): void {
  if (!fileId || !nodeId || !isFinitePosition(position)) return
  const all = readAllPositions()
  const fileMap = { ...(all[fileId] ?? {}) }
  fileMap[nodeId] = { x: position.x, y: position.y }

  const keys = Object.keys(fileMap)
  if (keys.length > MAX_NODES_PER_FILE) {
    for (const stale of keys.slice(0, keys.length - MAX_NODES_PER_FILE)) {
      delete fileMap[stale]
    }
  }

  all[fileId] = fileMap
  writeAllPositions(all)
}

/** Remove all saved node positions for a given file ID. */
export function clearSavedNodePositions(fileId: string): void {
  if (!fileId) return
  const all = readAllPositions()
  if (!(fileId in all)) return
  delete all[fileId]
  writeAllPositions(all)
}
