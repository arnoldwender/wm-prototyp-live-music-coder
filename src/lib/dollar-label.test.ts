// SPDX-License-Identifier: AGPL-3.0-or-later
// Copyright (c) 2026 Arnold Wender / Wender Media

/**
 * Regression guard for the `$:` label strip.
 *
 * Until 2026-08-17 both eval paths pre-processed the document with a regex that
 * deleted every leading `$:` label (see LEGACY_STRIP below — it cannot be quoted
 * inside a block comment, because the regex itself ends in a star-slash and
 * would close the comment early). That is
 * destructive: the transpiler compiles `$: pat` into `pat.p('$')`, the REPL
 * renames the id to `$0`, `$1`, … and `evaluate` stacks everything it finds in
 * `pPatterns`. Strip the labels and they become bare expression statements, of
 * which the transpiler returns only the LAST — so Run played a single layer of
 * a session that defines four, while the debounced live-eval path (which passed
 * the raw document) played all of them. The two paths disagreed about what the
 * same file means.
 *
 * Every session in src/data/sessions-library.ts uses stacked `$:`, and loading
 * a session calls handleEvaluate() directly, so the defect fired with no
 * keypress at all.
 *
 * These tests must run under Vitest rather than plain node: @strudel/core
 * reaches a CJS dependency that only resolves through Vite's `module` field.
 */

import { describe, it, expect } from 'vitest';
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';

/** The exact expression that used to be applied to the document before eval. */
const LEGACY_STRIP = /^\$\s*:\s*/gm;

const MULTI_LAYER = `setcps(1)
$: s("bd*4")
$: s("hh*8")
$: note("c e g")`;

describe('$: labels survive to the transpiler', () => {
  it('parses as labelled statements, which is what the transpiler keys on', async () => {
    // Assert on the AST rather than on transpiler output. @strudel/transpiler
    // cannot be imported directly even under Vitest — @strudel/core reaches
    // @kabelsalat/web, whose CJS build provides no `SalatRepl` named export.
    // acorn is the parser the transpiler itself uses, so this tests the exact
    // distinction its `isLabelStatement` -> `labelToP` conversion depends on.
    const { parse } = await import('acorn');

    const types = (src: string) =>
      parse(src, { ecmaVersion: 2022 }).body.map((n) => n.type);

    const withLabels = types(MULTI_LAYER);
    const withoutLabels = types(MULTI_LAYER.replace(LEGACY_STRIP, ''));

    // Three `$:` lines are three LabeledStatements -> three `.p('$')`
    // registrations -> three stacked layers.
    expect(withLabels.filter((t) => t === 'LabeledStatement')).toHaveLength(3);

    // Stripped, they are bare ExpressionStatements. The transpiler's addReturn
    // step promotes only the LAST statement to a return, so the other two
    // layers are silently dropped and never reach pPatterns.
    expect(withoutLabels.filter((t) => t === 'LabeledStatement')).toHaveLength(0);
    expect(withoutLabels.filter((t) => t === 'ExpressionStatement')).toHaveLength(4);
  });

  it('is not re-applied anywhere in the eval paths', () => {
    // Source-level invariant: this is what actually regressed, and a behavioural
    // test cannot catch it because the strip lives inline in a component.
    const files = [
      'src/components/organisms/StrudelEditor.tsx',
      'src/lib/engines/strudel.ts',
    ];

    for (const file of files) {
      const source = readFileSync(resolve(process.cwd(), file), 'utf-8');
      // Match the operation, not the comment describing why it is gone.
      const code = source
        .split('\n')
        .filter((line) => !line.trim().startsWith('*') && !line.trim().startsWith('//'))
        .join('\n');

      expect(code, `${file} must not strip $: labels before eval`).not.toMatch(
        /replace\(\s*\/\^\\\$/,
      );
    }
  });
});
