/* ──────────────────────────────────────────────────────────
   Tests for AudioGraph — directed graph of EngineBlocks
   with cycle detection, serialization, and BFS traversal.
   Written first (TDD) before implementation.
   ────────────────────────────────────────────────────────── */

import { describe, it, expect } from 'vitest'
import { AudioGraph } from './graph'
import type { EngineBlock, EngineType } from './types'

/** Helper: creates a minimal EngineBlock with one input + one output port */
function makeBlock(id: string, engine: EngineType = 'strudel'): EngineBlock {
  return {
    id,
    engine,
    type: 'source',
    code: '',
    params: {},
    inputs: [{ id: `${id}-in`, label: 'Input', type: 'audio' }],
    outputs: [{ id: `${id}-out`, label: 'Output', type: 'audio' }],
  }
}

describe('AudioGraph', () => {
  it('starts empty with no blocks or connections', () => {
    const graph = new AudioGraph()

    expect(graph.getBlocks()).toHaveLength(0)
    expect(graph.getConnections()).toHaveLength(0)
  })

  it('adds a block and retrieves it', () => {
    const graph = new AudioGraph()
    const block = makeBlock('a')

    graph.addBlock(block)

    expect(graph.getBlocks()).toHaveLength(1)
    expect(graph.getBlock('a')).toBe(block)
  })

  it('removes a block and its connections', () => {
    const graph = new AudioGraph()
    const a = makeBlock('a')
    const b = makeBlock('b')

    graph.addBlock(a)
    graph.addBlock(b)
    graph.connect('a', 'a-out', 'b', 'b-in')

    graph.removeBlock('a')

    expect(graph.getBlocks()).toHaveLength(1)
    expect(graph.getBlock('a')).toBeUndefined()
    /* Connection involving removed block should also be gone */
    expect(graph.getConnections()).toHaveLength(0)
  })

  it('connects two blocks and returns the connection', () => {
    const graph = new AudioGraph()
    graph.addBlock(makeBlock('a'))
    graph.addBlock(makeBlock('b'))

    const conn = graph.connect('a', 'a-out', 'b', 'b-in')

    expect(conn).not.toBeNull()
    expect(conn!.sourceBlockId).toBe('a')
    expect(conn!.targetBlockId).toBe('b')
    expect(graph.getConnections()).toHaveLength(1)
  })

  it('prevents duplicate connections', () => {
    const graph = new AudioGraph()
    graph.addBlock(makeBlock('a'))
    graph.addBlock(makeBlock('b'))

    graph.connect('a', 'a-out', 'b', 'b-in')
    const dup = graph.connect('a', 'a-out', 'b', 'b-in')

    expect(dup).toBeNull()
    expect(graph.getConnections()).toHaveLength(1)
  })

  it('returns null when connecting non-existent blocks', () => {
    const graph = new AudioGraph()
    graph.addBlock(makeBlock('a'))

    const conn = graph.connect('a', 'a-out', 'missing', 'missing-in')

    expect(conn).toBeNull()
  })

  it('disconnects a connection by id', () => {
    const graph = new AudioGraph()
    graph.addBlock(makeBlock('a'))
    graph.addBlock(makeBlock('b'))

    const conn = graph.connect('a', 'a-out', 'b', 'b-in')!
    graph.disconnect(conn.id)

    expect(graph.getConnections()).toHaveLength(0)
  })

  it('detects cycles and prevents them (A→B→C→A)', () => {
    const graph = new AudioGraph()
    graph.addBlock(makeBlock('a'))
    graph.addBlock(makeBlock('b'))
    graph.addBlock(makeBlock('c'))

    graph.connect('a', 'a-out', 'b', 'b-in')
    graph.connect('b', 'b-out', 'c', 'c-in')

    /* This would create a cycle: C → A when A → B → C already exists */
    const cyclic = graph.connect('c', 'c-out', 'a', 'a-in')

    expect(cyclic).toBeNull()
    expect(graph.getConnections()).toHaveLength(2)
  })

  it('gets downstream blocks via BFS', () => {
    const graph = new AudioGraph()
    graph.addBlock(makeBlock('a'))
    graph.addBlock(makeBlock('b'))
    graph.addBlock(makeBlock('c'))
    graph.addBlock(makeBlock('d'))

    /* a → b → c, a → d */
    graph.connect('a', 'a-out', 'b', 'b-in')
    graph.connect('b', 'b-out', 'c', 'c-in')
    graph.connect('a', 'a-out', 'd', 'd-in')

    const downstream = graph.getDownstream('a')
    const ids = downstream.map((b) => b.id).sort()

    expect(ids).toEqual(['b', 'c', 'd'])
  })

  it('serializes and deserializes the graph', () => {
    const graph = new AudioGraph()
    graph.addBlock(makeBlock('a'))
    graph.addBlock(makeBlock('b'))
    graph.connect('a', 'a-out', 'b', 'b-in')

    const data = graph.serialize()
    const restored = AudioGraph.deserialize(data)

    expect(restored.getBlocks()).toHaveLength(2)
    expect(restored.getConnections()).toHaveLength(1)
    expect(restored.getBlock('a')!.id).toBe('a')
    expect(restored.getConnections()[0].sourceBlockId).toBe('a')
  })

  it('clears all blocks and connections', () => {
    const graph = new AudioGraph()
    graph.addBlock(makeBlock('a'))
    graph.addBlock(makeBlock('b'))
    graph.connect('a', 'a-out', 'b', 'b-in')

    graph.clear()

    expect(graph.getBlocks()).toHaveLength(0)
    expect(graph.getConnections()).toHaveLength(0)
  })
})
