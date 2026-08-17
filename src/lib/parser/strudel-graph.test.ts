/* SPDX-License-Identifier: MIT
   Copyright (c) 2026 Arnold Wender / Wender Media */
import { describe, it, expect } from 'vitest';
import { buildStrudelGraph } from './strudel-graph';
import { stripComments, splitStatements, splitChain, splitTopLevel } from './source-split';

/** Edge helper — "does the signal go from the node whose code is A to the one B?" */
function hasEdge(
  graph: ReturnType<typeof buildStrudelGraph>,
  fromCode: string,
  toCode: string,
): boolean {
  const from = graph.blocks.find((b) => b.code === fromCode);
  const to = graph.blocks.find((b) => b.code === toCode);
  if (!from || !to) return false;
  return graph.connections.some(
    (c) => c.sourceBlockId === from.id && c.targetBlockId === to.id,
  );
}

describe('source-split', () => {
  it('keeps a decimal point from being read as a chain link', () => {
    /* The bug this guards: splitting on every dot turns room(.5) into a
       phantom node named "5)". */
    const { head, links } = splitChain('s("bd").room(.5)');
    expect(head).toBe('s("bd")');
    expect(links).toEqual(['room(.5)']);
  });

  it('does not split on a top-level dot that starts a number', () => {
    expect(splitChain('.5').links).toEqual([]);
  });

  it('leaves a mini-notation dot inside a string alone', () => {
    /* `.` is a real mini-notation operator — "bd . hh hh" groups subdivisions. */
    const { head, links } = splitChain('s("bd . hh hh").gain(.8)');
    expect(head).toBe('s("bd . hh hh")');
    expect(links).toEqual(['gain(.8)']);
  });

  it('leaves a dotted filename inside a string alone', () => {
    /* Loading a sample map is ordinary Strudel. Without quote tracking the
       `.json` in the URL becomes a chain link and the real call is truncated. */
    const { head, links } = splitChain('samples("https://x.dev/strudel.json").s("bd")');
    expect(head).toBe('samples("https://x.dev/strudel.json")');
    expect(links).toEqual(['s("bd")']);
  });

  it('leaves a chained call inside an argument alone', () => {
    /* The dot in `x.fast(2)` belongs to the callback, not to the outer chain;
       promoting it would put a node in the graph that no signal flows through. */
    const { head, links } = splitChain('s("bd").when(x => x.fast(2))');
    expect(head).toBe('s("bd")');
    expect(links).toEqual(['when(x => x.fast(2))']);
  });

  it('treats a comma inside mini-notation as pattern content, not a separator', () => {
    expect(splitTopLevel('s("bd, hh"), n("0 1")', ',')).toHaveLength(2);
  });

  it('folds a chain broken across lines into one statement', () => {
    const statements = splitStatements('s("bd*4")\n  .lpf(400)\n  .room(.5)');
    expect(statements).toEqual(['s("bd*4").lpf(400).room(.5)']);
  });

  it('keeps statements separate across a multi-line block comment', () => {
    /* Collapsing the comment's newlines would glue both patterns into one. */
    const statements = splitStatements(
      stripComments('s("bd")\n/* two\nlines */\ns("hh")'),
    );
    expect(statements).toEqual(['s("bd")', 's("hh")']);
  });

  it('leaves comment markers inside a string alone', () => {
    expect(stripComments('s("bd // not a comment")')).toBe('s("bd // not a comment")');
  });
});

describe('buildStrudelGraph', () => {
  it('returns an empty graph for code with no pattern', () => {
    expect(buildStrudelGraph('')).toEqual({ blocks: [], connections: [] });
    expect(buildStrudelGraph('// just a comment\n')).toEqual({
      blocks: [],
      connections: [],
    });
  });

  it('turns a chain into one node per call, in signal order', () => {
    const graph = buildStrudelGraph('s("bd*4").lpf(400).room(.5)');

    expect(graph.blocks.map((b) => b.code)).toEqual([
      's("bd*4")',
      'lpf(400)',
      'room(.5)',
      'output',
    ]);
    expect(hasEdge(graph, 's("bd*4")', 'lpf(400)')).toBe(true);
    expect(hasEdge(graph, 'lpf(400)', 'room(.5)')).toBe(true);
    expect(hasEdge(graph, 'room(.5)', 'output')).toBe(true);
  });

  it('gives the source no input port and the output no output port', () => {
    const graph = buildStrudelGraph('s("bd")');
    const source = graph.blocks.find((b) => b.type === 'source')!;
    const output = graph.blocks.find((b) => b.type === 'output')!;

    expect(source.inputs).toHaveLength(0);
    expect(output.outputs).toHaveLength(0);
  });

  it('draws each $: label as its own voice converging on the output', () => {
    const graph = buildStrudelGraph('$: s("bd*4")\n$: note("c e g")');

    expect(hasEdge(graph, 's("bd*4")', 'output')).toBe(true);
    expect(hasEdge(graph, 'note("c e g")', 'output')).toBe(true);
    expect(graph.blocks.filter((b) => b.type === 'output')).toHaveLength(1);
  });

  it('feeds every stack argument into the stack node', () => {
    const graph = buildStrudelGraph('stack(s("bd*4"), s("hh*8"))');

    const stackNode = graph.blocks.find((b) => b.code.startsWith('stack('))!;
    expect(stackNode).toBeDefined();

    const incoming = graph.connections.filter((c) => c.targetBlockId === stackNode.id);
    expect(incoming).toHaveLength(2);
    expect(hasEdge(graph, 's("bd*4")', stackNode.code)).toBe(true);
    expect(hasEdge(graph, 's("hh*8")', stackNode.code)).toBe(true);
  });

  it('chains calls applied to a stack after the stack itself', () => {
    const graph = buildStrudelGraph('stack(s("bd"), s("hh")).gain(.8)');
    const stackNode = graph.blocks.find((b) => b.code.startsWith('stack('))!;

    expect(hasEdge(graph, stackNode.code, 'gain(.8)')).toBe(true);
    expect(hasEdge(graph, 'gain(.8)', 'output')).toBe(true);
  });

  it('branches a reference off the declared pattern instead of inventing a source', () => {
    /* Without the declaration map, `bass` would become a dead node named after
       a variable, and the pattern it refers to would float unconnected. */
    const graph = buildStrudelGraph('const bass = note("c2")\n$: bass.lpf(200)');

    expect(graph.blocks.some((b) => b.code === 'bass')).toBe(false);
    expect(hasEdge(graph, 'note("c2")', 'lpf(200)')).toBe(true);
  });

  it('leaves a declared but unused pattern off the output', () => {
    /* A declaration on its own makes no sound; wiring it to the output would
       claim it does. */
    const graph = buildStrudelGraph('const unused = s("bd")\n$: s("hh")');

    expect(hasEdge(graph, 's("bd")', 'output')).toBe(false);
    expect(hasEdge(graph, 's("hh")', 'output')).toBe(true);
  });

  it('gives every block a unique id', () => {
    const graph = buildStrudelGraph('$: s("bd").lpf(400)\n$: s("hh").lpf(400)');
    const ids = graph.blocks.map((b) => b.id);

    expect(new Set(ids).size).toBe(ids.length);
  });

  it('survives pathological nesting without recursing away', () => {
    const nested = `${'stack('.repeat(40)}s("bd")${')'.repeat(40)}`;
    expect(() => buildStrudelGraph(nested)).not.toThrow();
  });
});
