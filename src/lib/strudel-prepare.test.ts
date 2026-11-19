/* SPDX-License-Identifier: MIT
   Copyright (c) 2026 Arnold Wender / Wender Media
   ────────────────────────────────────────────────────────── */
import { describe, expect, it } from 'vitest'
import {
  formatStrudelEvalError,
  normalizeStrudelHelperQuotes,
  prepareStrudelCode,
} from './strudel-extensions'

describe('normalizeStrudelHelperQuotes & prepareStrudelCode', () => {
  it('rewrites double-quoted URL arguments in samples() to single quotes', () => {
    const src = 'await samples("https://example.org/strudel.json", "https://example.org/bank/")\n$: s("bd sd")'
    const out = normalizeStrudelHelperQuotes(src)
    expect(out).toBe(
      "await samples('https://example.org/strudel.json', 'https://example.org/bank/')\n$: s(\"bd sd\")",
    )
  })

  it('rewrites github: shorthands and leaves pattern strings and comments untouched', () => {
    const src = [
      '// samples("https://commented.out/strudel.json")',
      '/* createParams("insideComment", 1) */',
      'samples("github:tidalcycles/dirt-samples")',
      'const lp = createParams("cutoff", 800)',
      'setParam("cutoff", 1200)',
      'const v = getParam("cutoff")',
      'onKey("a", () => s("bd"))',
      'note("c3 e3 g3").s("gm_piano").lpf(lp)',
    ].join('\n')

    const out = normalizeStrudelHelperQuotes(src)
    expect(out).toContain('// samples("https://commented.out/strudel.json")')
    expect(out).toContain('/* createParams("insideComment", 1) */')
    expect(out).toContain("samples('github:tidalcycles/dirt-samples')")
    expect(out).toContain("const lp = createParams('cutoff', 800)")
    expect(out).toContain("setParam('cutoff', 1200)")
    expect(out).toContain("const v = getParam('cutoff')")
    expect(out).toContain("onKey('a', () => s(\"bd\"))")
    expect(out).toContain('note("c3 e3 g3").s("gm_piano").lpf(lp)')
  })

  it('keeps s("...") / note("...") mini-notation double quotes intact and preserves _$: muting', () => {
    const src = '_$: samples("https://example.org/kit.json")\n$: note("c3 e3").s("sawtooth")'
    const prepared = prepareStrudelCode(src)
    expect(prepared).toBe(
      '// [muted] $: samples(\'https://example.org/kit.json\')\n$: note("c3 e3").s("sawtooth")',
    )
  })

  it('adds CSP guidance when fetch or Content Security Policy errors occur', () => {
    const err = new TypeError('Failed to fetch')
    const msg = formatStrudelEvalError(err)
    expect(msg).toContain('Failed to fetch')
    expect(msg).toContain('CSP/privacy')
    expect(msg).toContain('gm_*')

    expect(formatStrudelEvalError(new SyntaxError('Unexpected token'))).toBe('Unexpected token')
  })
})
