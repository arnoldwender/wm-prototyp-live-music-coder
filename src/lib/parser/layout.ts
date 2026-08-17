/* SPDX-License-Identifier: MIT
   Copyright (c) 2026 Arnold Wender / Wender Media
   ──────────────────────────────────────────────────────────
   Graph layout — place nodes in columns by signal depth.

   The panel used to position nodes at `index * 220`, which reads
   as a row of unrelated boxes with edges crossing over them: the
   order blocks happen to be parsed in says nothing about how the
   signal flows. Laying columns out by depth makes an edge always
   point rightwards, which is what makes a chain legible.
   ────────────────────────────────────────────────────────── */
import type { EngineBlock, Connection } from '../../types/engine';

export interface NodePosition {
  x: number;
  y: number;
}

const COLUMN_WIDTH = 240;
const ROW_HEIGHT = 120;

/**
 * Assign a position to every block.
 *
 * Depth is the LONGEST path from a root, not the shortest: with the shortest,
 * a node fed by both a source and a long chain would be drawn to the left of
 * its own upstream and the edge would point backwards.
 */
export function layoutGraph(
  blocks: EngineBlock[],
  connections: Connection[],
): Map<string, NodePosition> {
  const depth = new Map<string, number>();
  for (const block of blocks) depth.set(block.id, 0);

  /* Relax until stable, bounded by the block count. The bound is what makes a
     feedback loop — legal in Web Audio, and drawable — settle at some depth
     instead of spinning forever. */
  for (let pass = 0; pass < blocks.length; pass += 1) {
    let changed = false;

    for (const connection of connections) {
      const from = depth.get(connection.sourceBlockId);
      const to = depth.get(connection.targetBlockId);
      if (from === undefined || to === undefined) continue;

      if (from + 1 > to) {
        depth.set(connection.targetBlockId, from + 1);
        changed = true;
      }
    }

    if (!changed) break;
  }

  const rowsUsed = new Map<number, number>();
  const positions = new Map<string, NodePosition>();

  for (const block of blocks) {
    const column = depth.get(block.id) ?? 0;
    const row = rowsUsed.get(column) ?? 0;
    rowsUsed.set(column, row + 1);
    positions.set(block.id, { x: column * COLUMN_WIDTH, y: row * ROW_HEIGHT });
  }

  return positions;
}
