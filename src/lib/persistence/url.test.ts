import { describe, it, expect } from 'vitest';
import { encodeToUrl, decodeFromUrl, type UrlShareData } from './url';

describe('URL sharing', () => {
  it('encodes and decodes share data', () => {
    const data: UrlShareData = {
      code: 'note("c3 e3 g3").s("sawtooth")',
      bpm: 140,
      engine: 'strudel',
    };
    const hash = encodeToUrl(data);
    expect(hash).toBeTruthy();
    expect(typeof hash).toBe('string');

    const decoded = decodeFromUrl(hash);
    expect(decoded).not.toBeNull();
    expect(decoded!.code).toBe(data.code);
    expect(decoded!.bpm).toBe(140);
    expect(decoded!.engine).toBe('strudel');
  });

  it('handles empty code', () => {
    const data: UrlShareData = { code: '', bpm: 120, engine: 'strudel' };
    const hash = encodeToUrl(data);
    const decoded = decodeFromUrl(hash);
    expect(decoded!.code).toBe('');
  });

  it('returns null for invalid hash', () => {
    expect(decodeFromUrl('invalid-data!!!')).toBeNull();
  });

  it('compresses data significantly', () => {
    const longCode = 'note("c3 e3 g3").s("sawtooth").lpf(800).delay(0.5)'.repeat(10);
    const data: UrlShareData = { code: longCode, bpm: 120, engine: 'strudel' };
    const hash = encodeToUrl(data);
    expect(hash.length).toBeLessThan(longCode.length);
  });
});
