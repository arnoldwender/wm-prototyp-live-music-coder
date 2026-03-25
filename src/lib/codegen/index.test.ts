import { describe, it, expect } from 'vitest';
import { generateCode } from './index';
import type { EngineBlock, Connection } from '../../types/engine';

describe('generateCode', () => {
  it('returns empty string for no blocks', () => {
    expect(generateCode([], [], 'strudel')).toBe('');
  });

  it('generates Strudel code from a source block', () => {
    const blocks: EngineBlock[] = [{
      id: 'strudel_main',
      engine: 'strudel',
      type: 'source',
      code: 'note("c3 e3 g3").s("sawtooth")',
      params: {},
      inputs: [],
      outputs: [{ id: 'out', label: 'Output', type: 'audio' }],
    }];
    const code = generateCode(blocks, [], 'strudel');
    expect(code).toContain('note("c3 e3 g3")');
  });

  it('generates Web Audio code with connections', () => {
    const blocks: EngineBlock[] = [
      { id: 'webaudio_osc', engine: 'webaudio', type: 'source', code: 'const osc = ctx.createOscillator()', params: {}, inputs: [], outputs: [{ id: 'out', label: 'Output', type: 'audio' }] },
      { id: 'webaudio_gain', engine: 'webaudio', type: 'effect', code: 'const gain = ctx.createGain()', params: {}, inputs: [{ id: 'in', label: 'Input', type: 'audio' }], outputs: [{ id: 'out', label: 'Output', type: 'audio' }] },
    ];
    const connections: Connection[] = [{
      id: 'conn_1', sourceBlockId: 'webaudio_osc', sourcePortId: 'out', targetBlockId: 'webaudio_gain', targetPortId: 'in',
    }];
    const code = generateCode(blocks, connections, 'webaudio');
    expect(code).toContain('createOscillator');
    expect(code).toContain('createGain');
    expect(code).toContain('.connect(');
  });

  it('preserves block code as-is for Tone.js', () => {
    const blocks: EngineBlock[] = [{
      id: 'tonejs_synth',
      engine: 'tonejs',
      type: 'source',
      code: 'const synth = new Tone.Synth()',
      params: {},
      inputs: [],
      outputs: [{ id: 'out', label: 'Output', type: 'audio' }],
    }];
    const code = generateCode(blocks, [], 'tonejs');
    expect(code).toContain('new Tone.Synth()');
  });
});
