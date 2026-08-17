/* SPDX-License-Identifier: MIT
   Copyright (c) 2026 Arnold Wender / Wender Media */
import { describe, it, expect } from 'vitest';
import { layoutGraph } from './layout';
import type { EngineBlock, Connection } from '../../types/engine';

function block(id: string): EngineBlock {
  return {
    id,
    engine: 'strudel',
    type: 'effect',
    code: id,
    params: {},
    inputs: [],
    outputs: [],
  };
}

function edge(from: string, to: string): Connection {
  return {
    id: `${from}_${to}`,
    sourceBlockId: from,
    sourcePortId: 'out',
    targetBlockId: to,
    targetPortId: 'in',
  };
}

describe('layoutGraph', () => {
  it('places every block', () => {
    const blocks = [block('a'), block('b')];
    expect(layoutGraph(blocks, []).size).toBe(2);
  });

  it('puts a downstream node in a column to the right of its source', () => {
    const positions = layoutGraph(
      [block('a'), block('b')],
      [edge('a', 'b')],
    );

    expect(positions.get('b')!.x).toBeGreaterThan(positions.get('a')!.x);
  });

  it('separates independent voices into different rows of the same column', () => {
    const positions = layoutGraph([block('a'), block('b')], []);

    expect(positions.get('a')!.x).toBe(positions.get('b')!.x);
    expect(positions.get('a')!.y).not.toBe(positions.get('b')!.y);
  });

  it('uses the longest path so no edge ever points backwards', () => {
    /* out is fed directly by a AND through the a→b→c chain. Shortest-path
       depth would put it at column 1, to the LEFT of c at column 2. */
    const blocks = ['a', 'b', 'c', 'out'].map(block);
    const positions = layoutGraph(blocks, [
      edge('a', 'b'),
      edge('b', 'c'),
      edge('c', 'out'),
      edge('a', 'out'),
    ]);

    expect(positions.get('out')!.x).toBeGreaterThan(positions.get('c')!.x);
  });

  it('terminates on a feedback loop', () => {
    const blocks = [block('a'), block('b')];
    const cyclic = [edge('a', 'b'), edge('b', 'a')];

    expect(() => layoutGraph(blocks, cyclic)).not.toThrow();
    expect(layoutGraph(blocks, cyclic).size).toBe(2);
  });
});
