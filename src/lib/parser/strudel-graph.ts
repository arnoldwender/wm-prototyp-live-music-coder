/* SPDX-License-Identifier: MIT
   Copyright (c) 2026 Arnold Wender / Wender Media
   ──────────────────────────────────────────────────────────
   Strudel pattern → signal-flow graph.

   The old parser returned ONE block for any Strudel file and the
   panel drew an empty state saying "a pattern is a single
   expression". A pattern is a single expression, but it is not a
   flat one: `$:` voices run in parallel, `.lpf().room()` is an
   ordered chain, and `stack(a, b)` mixes independent branches.
   That structure is the graph — it is not a Web Audio node graph
   (Strudel has no user-visible routing), it is the shape of the
   pattern itself, which is what the panel is for.
   ────────────────────────────────────────────────────────── */
import type { EngineBlock, Connection, PortDefinition } from '../../types/engine';
import { stripComments, splitStatements, splitChain, splitTopLevel } from './source-split';

/* Heads that COMBINE patterns: every argument is an independent branch feeding
   in, which is what turns a flat chain into a graph with real convergence.
   Chain-position combinators (.superimpose, .layer, .off) are deliberately
   absent — they read as an effect applied to the pattern carrying them. */
const COMBINATORS = new Set([
  'stack',
  'cat',
  'slowcat',
  'fastcat',
  'timeCat',
  'timecat',
  'seq',
  'sequence',
  'arrange',
  'polymeter',
  'pm',
  'randcat',
]);

const AUDIO_IN: PortDefinition[] = [{ id: 'in', label: 'Input', type: 'audio' }];
const AUDIO_OUT: PortDefinition[] = [{ id: 'out', label: 'Output', type: 'audio' }];

/* A stack of stacks is legal and nothing stops a pathological nesting depth
   from arriving through a shared session link. The cap keeps a visualisation
   from taking the editor down with it. */
const MAX_DEPTH = 12;

/** Matches `const x = …` / `let x = …` — a named pattern, not a voice. */
const DECLARATION = /^(?:const|let|var)\s+([A-Za-z_$][\w$]*)\s*=\s*([\s\S]+)$/;

/** Matches `$: …` and `name: …` — a labelled voice. */
const LABELLED_VOICE = /^(\$|[A-Za-z_$][\w$]*)\s*:\s*([\s\S]+)$/;

/** Matches a bare identifier — a reference to something declared earlier. */
const BARE_IDENTIFIER = /^[A-Za-z_$][\w$]*$/;

/** Matches the function name of a call expression. */
const CALL_HEAD = /^([A-Za-z_$][\w$]*)\s*\(/;

export interface StrudelGraph {
  blocks: EngineBlock[];
  connections: Connection[];
}

/**
 * Build the signal-flow graph of a Strudel file.
 *
 * Returns an empty graph for code that yields no pattern, so the caller can
 * keep showing its empty state rather than a lone synthetic output node.
 */
export function buildStrudelGraph(code: string): StrudelGraph {
  const blocks: EngineBlock[] = [];
  const connections: Connection[] = [];

  /* Declared name → id of the node its signal leaves from, so a later
     `stack(bass, drums)` draws edges from the real nodes instead of inventing
     two dead sources named after variables. */
  const declared = new Map<string, string>();

  let counter = 0;

  function addBlock(type: EngineBlock['type'], snippet: string): string {
    counter += 1;
    const id = `strudel_${counter}`;
    blocks.push({
      id,
      engine: 'strudel',
      type,
      code: snippet,
      params: {},
      inputs: type === 'source' ? [] : AUDIO_IN,
      outputs: type === 'output' ? [] : AUDIO_OUT,
    });
    return id;
  }

  function connect(fromId: string, toId: string): void {
    connections.push({
      id: `conn_${fromId}_${toId}`,
      sourceBlockId: fromId,
      sourcePortId: 'out',
      targetBlockId: toId,
      targetPortId: 'in',
    });
  }

  /**
   * Build one expression and return the id of the node its signal leaves from,
   * or null when there is nothing to draw.
   */
  function buildExpression(expression: string, depth: number): string | null {
    if (depth > MAX_DEPTH) return null;

    const { head, links } = splitChain(expression.trim());
    if (!head) return null;

    let tailId: string;
    const callName = head.match(CALL_HEAD)?.[1];

    if (callName && COMBINATORS.has(callName) && head.endsWith(')')) {
      /* A combinator is a mixer: one incoming edge per argument. */
      tailId = addBlock('effect', head);
      const argsSource = head.slice(head.indexOf('(') + 1, head.lastIndexOf(')'));
      for (const argument of splitTopLevel(argsSource, ',')) {
        const branchId = buildExpression(argument, depth + 1);
        if (branchId) connect(branchId, tailId);
      }
    } else if (BARE_IDENTIFIER.test(head) && declared.has(head)) {
      /* Reference to a declared pattern — branch off the existing node. */
      tailId = declared.get(head)!;
    } else {
      tailId = addBlock('source', head);
    }

    for (const link of links) {
      const linkId = addBlock('effect', link);
      connect(tailId, linkId);
      tailId = linkId;
    }

    return tailId;
  }

  const voiceTails: string[] = [];

  for (const statement of splitStatements(stripComments(code))) {
    const declaration = statement.match(DECLARATION);
    if (declaration) {
      /* A declaration on its own makes no sound: build it so references can
         reach it, but do not wire it to the output. */
      const tailId = buildExpression(declaration[2], 0);
      if (tailId) declared.set(declaration[1], tailId);
      continue;
    }

    const labelled = statement.match(LABELLED_VOICE);
    const tailId = buildExpression(labelled ? labelled[2] : statement, 0);
    if (tailId) voiceTails.push(tailId);
  }

  if (voiceTails.length === 0) return { blocks: [], connections: [] };

  /* Every voice sums into superdough's destination. Drawing it makes the
     convergence visible, which is the whole point of showing parallel voices. */
  const outputId = addBlock('output', 'output');
  for (const tailId of voiceTails) connect(tailId, outputId);

  return { blocks, connections };
}
