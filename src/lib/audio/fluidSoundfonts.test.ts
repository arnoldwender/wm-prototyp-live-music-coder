/* SPDX-License-Identifier: MIT
   Copyright (c) 2026 Arnold Wender / Wender Media
   ────────────────────────────────────────────────────────── */
import { describe, expect, it } from 'vitest'
import {
  FLUID_GM_NAMES,
  FLUID_GM_PRESETS,
  GM_SAMPLE_CATEGORIES,
  getDefaultSoundfontBaseUrl,
} from './fluidSoundfonts'

describe('FluidR3_GM SoundFonts configuration', () => {
  it('covers all 125 Strudel GM instruments using only FluidR3_GM presets', () => {
    expect(FLUID_GM_NAMES).toHaveLength(125)
    for (const name of FLUID_GM_NAMES) {
      const presets = FLUID_GM_PRESETS[name]
      expect(presets.length).toBeGreaterThan(0)
      for (const preset of presets) {
        expect(preset).toMatch(/^\d{4}_FluidR3_GM_sf2_file$/)
      }
    }
  })

  it('groups all 125 GM instruments without duplicates across browser categories', () => {
    const listed = GM_SAMPLE_CATEGORIES.flatMap((c) => [...c.samples])
    expect(listed).toHaveLength(125)
    expect(new Set(listed).size).toBe(125)
    for (const gmName of FLUID_GM_NAMES) {
      expect(listed).toContain(gmName)
    }
  })

  it('resolves same-origin proxy on web and production origin under Electron file://', () => {
    expect(getDefaultSoundfontBaseUrl('https:')).toBe('/soundfonts')
    expect(getDefaultSoundfontBaseUrl('http:')).toBe('/soundfonts')
    expect(getDefaultSoundfontBaseUrl('file:')).toBe('https://live-music-coder.pro/soundfonts')
  })
})
