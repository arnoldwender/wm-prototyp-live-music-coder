// SPDX-License-Identifier: MIT
// Copyright (c) 2026 Arnold Wender / Wender Media
/* ──────────────────────────────────────────────────────────
   MIDI device profile tests — device inventory, auto-detection,
   profile lookup, and Strudel midimap generation.
   ────────────────────────────────────────────────────────── */

import { describe, it, expect } from 'vitest'
import {
  MIDI_DEVICES,
  detectDeviceProfile,
  getDeviceProfileById,
  generateStrudelMidimap,
} from './midi-devices'

describe('midi-devices', () => {
  /* --- Array integrity --- */

  it('MIDI_DEVICES array has entries', () => {
    expect(MIDI_DEVICES.length).toBeGreaterThan(0)
  })

  it('all devices have required fields: id, name, manufacturer', () => {
    for (const device of MIDI_DEVICES) {
      expect(device.id).toBeTruthy()
      expect(device.name).toBeTruthy()
      expect(device.manufacturer).toBeTruthy()
      expect(typeof device.defaultChannel).toBe('number')
    }
  })

  /* --- detectDeviceProfile --- */

  it('detects "MPK mini 3" as akai-mpk-mini-mk3', () => {
    const profile = detectDeviceProfile('MPK mini 3')
    expect(profile.id).toBe('akai-mpk-mini-mk3')
  })

  it('detects case-insensitively', () => {
    const profile = detectDeviceProfile('mpk mini 3')
    expect(profile.id).toBe('akai-mpk-mini-mk3')
  })

  it('returns generic-keyboard for unknown device', () => {
    const profile = detectDeviceProfile('unknown device xyz')
    expect(profile.id).toBe('generic-keyboard')
  })

  it('detects Novation Launchkey Mini', () => {
    const profile = detectDeviceProfile('Launchkey Mini MK3')
    expect(profile.id).toBe('novation-launchkey-mini-mk3')
  })

  /* --- getDeviceProfileById --- */

  it('returns correct profile for known ID', () => {
    const profile = getDeviceProfileById('akai-mpk-mini-mk3')
    expect(profile).toBeDefined()
    expect(profile!.name).toContain('MPK mini MK3')
  })

  it('returns undefined for unknown ID', () => {
    const profile = getDeviceProfileById('nonexistent-device')
    expect(profile).toBeUndefined()
  })

  it('returns generic-keyboard profile by ID', () => {
    const profile = getDeviceProfileById('generic-keyboard')
    expect(profile).toBeDefined()
    expect(profile!.manufacturer).toBe('Generic')
  })

  /* --- generateStrudelMidimap --- */

  it('generates CC mappings for a device with defaultParam knobs', () => {
    const profile = getDeviceProfileById('akai-mpk-mini-mk3')!
    const map = generateStrudelMidimap(profile)

    /* MPK mini MK3 has 8 knobs with defaultParam mappings */
    expect(Object.keys(map).length).toBeGreaterThan(0)
    expect(map['lpf']).toBe(70)
    expect(map['hpf']).toBe(71)
    expect(map['delay']).toBe(73)
    expect(map['gain']).toBe(74)
  })

  it('returns empty map for device without defaultParam knobs', () => {
    const profile = getDeviceProfileById('akai-mpk-mini-mk2')!
    const map = generateStrudelMidimap(profile)

    /* MK2 knobs have no defaultParam set */
    expect(Object.keys(map).length).toBe(0)
  })

  it('returns empty map for device with no knobs', () => {
    const profile = getDeviceProfileById('korg-nanokey2')!
    const map = generateStrudelMidimap(profile)
    expect(Object.keys(map).length).toBe(0)
  })
})
