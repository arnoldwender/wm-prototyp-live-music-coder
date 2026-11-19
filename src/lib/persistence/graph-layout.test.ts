/* SPDX-License-Identifier: MIT
   Copyright (c) 2026 Arnold Wender / Wender Media
   ────────────────────────────────────────────────────────── */
import { beforeEach, describe, expect, it } from 'vitest'
import {
  clearSavedNodePositions,
  readSavedNodePositions,
  saveNodePosition,
} from './graph-layout'

function ensureLocalStorage(): void {
  if (typeof globalThis.localStorage === 'undefined' || typeof globalThis.localStorage.setItem !== 'function') {
    const store: Record<string, string> = {}
    globalThis.localStorage = {
      getItem: (key: string) => store[key] ?? null,
      setItem: (key: string, value: string) => { store[key] = value },
      removeItem: (key: string) => { delete store[key] },
      clear: () => { Object.keys(store).forEach((k) => delete store[k]) },
      get length() { return Object.keys(store).length },
      key: (index: number) => Object.keys(store)[index] ?? null,
    }
  }
}

describe('NodeGraph layout persistence', () => {
  beforeEach(() => {
    ensureLocalStorage()
    localStorage.clear()
  })

  it('saves, reads, and clears node coordinates per file without cross-file leakage', () => {
    saveNodePosition('file_1', 'node_a', { x: 120, y: 240 })
    saveNodePosition('file_1', 'node_b', { x: 360, y: 80 })
    saveNodePosition('file_2', 'node_a', { x: 42, y: 99 })

    expect(readSavedNodePositions('file_1')).toEqual({
      node_a: { x: 120, y: 240 },
      node_b: { x: 360, y: 80 },
    })
    expect(readSavedNodePositions('file_2')).toEqual({
      node_a: { x: 42, y: 99 },
    })

    clearSavedNodePositions('file_1')
    expect(readSavedNodePositions('file_1')).toEqual({})
    expect(readSavedNodePositions('file_2')).toEqual({ node_a: { x: 42, y: 99 } })
  })

  it('ignores non-finite coordinates and malformed stored payloads safely', () => {
    saveNodePosition('file_1', 'bad', { x: Number.NaN, y: 10 })
    saveNodePosition('file_1', 'bad2', { x: 10, y: Number.POSITIVE_INFINITY })
    expect(readSavedNodePositions('file_1')).toEqual({})

    localStorage.setItem('lmc-graph-positions', '{"file_1":{"__proto__":{},"ok":{"x":1,"y":2}}}')
    expect(readSavedNodePositions('file_1')).toEqual({})

    localStorage.setItem('lmc-graph-positions', '{corrupt json')
    expect(readSavedNodePositions('file_1')).toEqual({})
  })
})
