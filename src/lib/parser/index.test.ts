/* SPDX-License-Identifier: MIT
   Copyright (c) 2026 Arnold Wender / Wender Media
   ────────────────────────────────────────────────────────── */
import { describe, it, expect } from 'vitest';
import { parseCode } from './index';

describe('parseCode', () => {
  it('returns empty for empty code', () => {
    const result = parseCode('', 'strudel');
    expect(result.blocks).toEqual([]);
    expect(result.connections).toEqual([]);
  });

  it('extracts a Strudel pattern as a source block', () => {
    const code = 'note("c3 e3 g3").s("sawtooth")';
    const result = parseCode(code, 'strudel');
    expect(result.blocks.length).toBe(1);
    expect(result.blocks[0].engine).toBe('strudel');
    expect(result.blocks[0].type).toBe('source');
    expect(result.blocks[0].code).toBe(code);
  });

  it('extracts Tone.js synth creation', () => {
    const code = 'const synth = new Tone.Synth()';
    const result = parseCode(code, 'tonejs');
    expect(result.blocks.length).toBe(1);
    expect(result.blocks[0].engine).toBe('tonejs');
    expect(result.blocks[0].type).toBe('source');
  });

  it('extracts Tone.js effect', () => {
    const code = 'const reverb = new Tone.Reverb(2)';
    const result = parseCode(code, 'tonejs');
    expect(result.blocks.length).toBe(1);
    expect(result.blocks[0].type).toBe('effect');
  });

  it('extracts Web Audio oscillator', () => {
    const code = 'const osc = ctx.createOscillator()';
    const result = parseCode(code, 'webaudio');
    expect(result.blocks.length).toBe(1);
    expect(result.blocks[0].type).toBe('source');
  });

  it('extracts Web Audio gain node', () => {
    const code = 'const gain = ctx.createGain()';
    const result = parseCode(code, 'webaudio');
    expect(result.blocks.length).toBe(1);
    expect(result.blocks[0].type).toBe('effect');
  });

  it('detects .connect() as a connection', () => {
    const code = `const osc = ctx.createOscillator()
const gain = ctx.createGain()
osc.connect(gain)`;
    const result = parseCode(code, 'webaudio');
    expect(result.connections.length).toBe(1);
    expect(result.connections[0].sourceBlockId).toContain('osc');
    expect(result.connections[0].targetBlockId).toContain('gain');
  });

  it('detects Tone.js .chain() as connections', () => {
    const code = `const synth = new Tone.Synth()
const reverb = new Tone.Reverb(2)
synth.chain(reverb, Tone.getDestination())`;
    const result = parseCode(code, 'tonejs');
    expect(result.connections.length).toBeGreaterThanOrEqual(1);
  });

  it('handles multiple blocks in same code', () => {
    const code = `const osc = ctx.createOscillator()
const gain = ctx.createGain()
const filter = ctx.createBiquadFilter()`;
    const result = parseCode(code, 'webaudio');
    expect(result.blocks.length).toBe(3);
  });
});
