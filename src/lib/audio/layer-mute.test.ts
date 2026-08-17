// SPDX-License-Identifier: AGPL-3.0-or-later
// Copyright (c) 2026 Arnold Wender / Wender Media

import { describe, it, expect } from 'vitest';
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { findLayers, toggleLayerMute, toggleLayerSolo } from './layer-mute';

const CODE = `setcps(1)
$: s("bd*4")
$: s("hh*8")
$: note("c e g")`;

describe('findLayers', () => {
  it('sees labelled lines only, in document order', () => {
    const layers = findLayers(CODE);
    expect(layers).toHaveLength(3);
    expect(layers.map((l) => l.line)).toEqual([1, 2, 3]);
    expect(layers.every((l) => !l.muted)).toBe(true);
  });

  it('recognises an already-muted layer', () => {
    expect(findLayers('_$: s("bd")')[0].muted).toBe(true);
  });

  it('handles d1-style labels and indentation', () => {
    const layers = findLayers('  d1: s("bd")\n  _d2: s("hh")');
    expect(layers.map((l) => [l.label, l.muted])).toEqual([
      ['d1', false],
      ['d2', true],
    ]);
  });
});

describe('toggleLayerMute', () => {
  it('mutes and unmutes the same layer symmetrically', () => {
    const muted = toggleLayerMute(CODE, 1);
    expect(muted.split('\n')[2]).toBe('_$: s("hh*8")');
    expect(toggleLayerMute(muted, 1)).toBe(CODE);
  });

  it('leaves the other layers alone', () => {
    const muted = toggleLayerMute(CODE, 1).split('\n');
    expect(muted[1]).toBe('$: s("bd*4")');
    expect(muted[3]).toBe('$: note("c e g")');
  });

  it('is a no-op when there is no such layer', () => {
    expect(toggleLayerMute(CODE, 7)).toBe(CODE);
  });

  it('preserves indentation', () => {
    expect(toggleLayerMute('  $: s("bd")', 0)).toBe('  _$: s("bd")');
  });
});

describe('toggleLayerSolo', () => {
  it('mutes every other layer', () => {
    const soloed = toggleLayerSolo(CODE, 0).split('\n');
    expect(soloed[1]).toBe('$: s("bd*4")');
    expect(soloed[2]).toBe('_$: s("hh*8")');
    expect(soloed[3]).toBe('_$: note("c e g")');
  });

  it('clears the solo when the same layer is soloed twice', () => {
    const once = toggleLayerSolo(CODE, 0);
    expect(toggleLayerSolo(once, 0)).toBe(CODE);
  });
});

describe('the shortcut binding', () => {
  it('does not use Alt, which cannot fire on macOS', () => {
    // CodeMirror refuses the keyCode fallback on mac+Alt, so Alt+1 arrives as
    // key "¡" and never matches. That killed 18 shortcuts on the primary
    // platform. Playwright's synthetic Alt+1 reports a false PASS, so this is a
    // source-level assertion on purpose.
    const editor = readFileSync(
      resolve(process.cwd(), 'src/components/organisms/StrudelEditor.tsx'),
      'utf-8',
    );
    expect(editor).not.toMatch(/key: `Alt-\$\{/);
    expect(editor).toMatch(/key: `Ctrl-\$\{/);
  });
});
