/* ──────────────────────────────────────────────────────────
   AudioGraph — directed acyclic graph of EngineBlocks.
   Manages blocks and connections with cycle prevention,
   BFS traversal, and full serialization support.
   ────────────────────────────────────────────────────────── */

import type { EngineBlock, Connection } from './types'

/** Serialized snapshot of the graph for persistence */
export interface AudioGraphData {
  blocks: EngineBlock[]
  connections: Connection[]
}

export class AudioGraph {
  private blocks: Map<string, EngineBlock> = new Map()
  private connections: Map<string, Connection> = new Map()
  private nextConnId = 1

  /* ── Block operations ─────────────────────────────────── */

  /** Adds a block to the graph */
  addBlock(block: EngineBlock): void {
    this.blocks.set(block.id, block)
  }

  /** Removes a block and all connections referencing it */
  removeBlock(id: string): void {
    this.blocks.delete(id)

    /* Purge connections that touch the removed block */
    for (const [connId, conn] of this.connections) {
      if (conn.sourceBlockId === id || conn.targetBlockId === id) {
        this.connections.delete(connId)
      }
    }
  }

  /** Returns a block by id, or undefined if not found */
  getBlock(id: string): EngineBlock | undefined {
    return this.blocks.get(id)
  }

  /** Returns all blocks as an array */
  getBlocks(): EngineBlock[] {
    return Array.from(this.blocks.values())
  }

  /* ── Connection operations ────────────────────────────── */

  /**
   * Connects two blocks. Returns the Connection on success,
   * or null if: blocks don't exist, duplicate, or would create a cycle.
   */
  connect(
    sourceBlockId: string,
    sourcePortId: string,
    targetBlockId: string,
    targetPortId: string,
  ): Connection | null {
    /* Validate both blocks exist */
    if (!this.blocks.has(sourceBlockId) || !this.blocks.has(targetBlockId)) {
      return null
    }

    /* Reject duplicate connections */
    for (const conn of this.connections.values()) {
      if (
        conn.sourceBlockId === sourceBlockId &&
        conn.sourcePortId === sourcePortId &&
        conn.targetBlockId === targetBlockId &&
        conn.targetPortId === targetPortId
      ) {
        return null
      }
    }

    /* Reject if adding this edge would create a cycle */
    if (this.wouldCreateCycle(sourceBlockId, targetBlockId)) {
      return null
    }

    const id = `conn-${this.nextConnId++}`
    const connection: Connection = {
      id,
      sourceBlockId,
      sourcePortId,
      targetBlockId,
      targetPortId,
    }
    this.connections.set(id, connection)
    return connection
  }

  /** Removes a connection by id */
  disconnect(connectionId: string): void {
    this.connections.delete(connectionId)
  }

  /** Returns all connections as an array */
  getConnections(): Connection[] {
    return Array.from(this.connections.values())
  }

  /* ── Graph traversal ──────────────────────────────────── */

  /**
   * Returns all blocks reachable downstream from the given
   * block via BFS (breadth-first search).
   */
  getDownstream(blockId: string): EngineBlock[] {
    const visited = new Set<string>()
    const queue: string[] = [blockId]
    const result: EngineBlock[] = []

    while (queue.length > 0) {
      const current = queue.shift()!
      if (visited.has(current)) continue
      visited.add(current)

      /* Find all blocks connected downstream from current */
      for (const conn of this.connections.values()) {
        if (conn.sourceBlockId === current && !visited.has(conn.targetBlockId)) {
          queue.push(conn.targetBlockId)
        }
      }

      /* Add to result (skip the starting block itself) */
      if (current !== blockId) {
        const block = this.blocks.get(current)
        if (block) result.push(block)
      }
    }

    return result
  }

  /* ── Serialization ────────────────────────────────────── */

  /** Exports the graph as a plain data object */
  serialize(): AudioGraphData {
    return {
      blocks: this.getBlocks(),
      connections: this.getConnections(),
    }
  }

  /** Reconstructs an AudioGraph from serialized data */
  static deserialize(data: AudioGraphData): AudioGraph {
    const graph = new AudioGraph()
    for (const block of data.blocks) {
      graph.addBlock(block)
    }
    for (const conn of data.connections) {
      graph.connections.set(conn.id, conn)
    }
    return graph
  }

  /* ── Utilities ────────────────────────────────────────── */

  /** Removes all blocks and connections */
  clear(): void {
    this.blocks.clear()
    this.connections.clear()
  }

  /**
   * Cycle detection — checks if adding an edge from source → target
   * would create a cycle. Uses BFS from targetBlockId to see if
   * sourceBlockId is reachable (meaning target can already reach source).
   */
  private wouldCreateCycle(sourceBlockId: string, targetBlockId: string): boolean {
    /* Self-loop is a trivial cycle */
    if (sourceBlockId === targetBlockId) return true

    /* BFS from target — can we reach source through existing edges? */
    const visited = new Set<string>()
    const queue: string[] = [targetBlockId]

    while (queue.length > 0) {
      const current = queue.shift()!
      if (current === sourceBlockId) return true
      if (visited.has(current)) continue
      visited.add(current)

      for (const conn of this.connections.values()) {
        if (conn.sourceBlockId === current && !visited.has(conn.targetBlockId)) {
          queue.push(conn.targetBlockId)
        }
      }
    }

    return false
  }
}
