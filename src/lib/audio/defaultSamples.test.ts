/* SPDX-License-Identifier: MIT
   Copyright (c) 2026 Arnold Wender / Wender Media */

import { describe, expect, it } from 'vitest'
import { getDefaultSampleUrls, getDefaultSamplesReplExpression } from './defaultSamples'

describe('defaultSamples', () => {
  it('uses same-origin first-party paths on web origins', () => {
    expect(getDefaultSampleUrls('https:')).toEqual({
      manifestUrl: '/samples/dirt-samples.json',
      baseUrl: '/dirt-samples/',
    })
  })

  it('resolves against live-music-coder.pro first-party proxy under Electron file: origin', () => {
    expect(getDefaultSampleUrls('file:')).toEqual({
      manifestUrl: 'https://live-music-coder.pro/samples/dirt-samples.json',
      baseUrl: 'https://live-music-coder.pro/dirt-samples/',
    })
  })

  it('emits single-quoted strings so Strudel never transpiles URLs as mini-notation', () => {
    const webExpr = getDefaultSamplesReplExpression('https:')
    const desktopExpr = getDefaultSamplesReplExpression('file:')

    expect(webExpr).toBe("samples('/samples/dirt-samples.json', '/dirt-samples/')")
    expect(desktopExpr).toBe(
      "samples('https://live-music-coder.pro/samples/dirt-samples.json', 'https://live-music-coder.pro/dirt-samples/')",
    )
    expect(webExpr).not.toContain('"')
    expect(desktopExpr).not.toContain('"')
  })
})
