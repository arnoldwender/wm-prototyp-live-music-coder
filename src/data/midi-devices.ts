/* SPDX-License-Identifier: MIT
   Copyright (c) 2026 Arnold Wender / Wender Media
   ──────────────────────────────────────────────────────────
   MIDI device profiles — CC mappings, pad banks, and transport
   controls for popular MIDI controllers. Used by the MIDI panel
   and quick-action menu for auto-detection and preset loading.

   Sources:
   - midi.guide (CC BY-SA 4.0) — 331 devices, 99 manufacturers
   - Ardour MIDI Binding Maps (GPL) — 50+ controller presets
   - Official manufacturer documentation (Akai, Novation, Arturia, Korg)
   ────────────────────────────────────────────────────────── */

/** CC mapping for a single knob/slider/fader */
export interface MidiCC {
  /** CC number (0-127) */
  ccn: number
  /** Human-readable label */
  label: string
  /** Default parameter mapping (Strudel parameter name) */
  defaultParam?: string
  /** Value range for scaling */
  min?: number
  max?: number
}

/** Pad bank configuration */
export interface MidiPadBank {
  /** Bank name (e.g. "Bank A", "Bank B") */
  name: string
  /** MIDI note numbers for each pad (left-to-right, bottom-to-top) */
  notes: number[]
}

/** Complete MIDI device profile */
export interface MidiDeviceProfile {
  /** Unique identifier (kebab-case) */
  id: string
  /** Display name */
  name: string
  /** Manufacturer */
  manufacturer: string
  /** USB device names reported by Web MIDI API (for auto-detection) */
  usbNames: string[]
  /** Number of keys (0 for pad-only controllers) */
  keys: number
  /** Knob/slider CC mappings */
  knobs: MidiCC[]
  /** Pad banks */
  pads: MidiPadBank[]
  /** Transport button CC numbers */
  transport?: {
    play?: number
    stop?: number
    record?: number
  }
  /** Default MIDI channel (0-indexed, usually 0) */
  defaultChannel: number
  /** Notes about the controller */
  notes?: string
}

/* ── Device Profiles ──────────────────────────────────── */

export const MIDI_DEVICES: MidiDeviceProfile[] = [
  {
    id: 'akai-mpk-mini-mk3',
    name: 'AKAI MPK mini MK3',
    manufacturer: 'Akai Professional',
    usbNames: ['MPK mini 3', 'MPK Mini Mk3', 'MPK mini Play'],
    keys: 25,
    knobs: [
      { ccn: 70, label: 'K1', defaultParam: 'lpf' },
      { ccn: 71, label: 'K2', defaultParam: 'hpf' },
      { ccn: 72, label: 'K3', defaultParam: 'room' },
      { ccn: 73, label: 'K4', defaultParam: 'delay' },
      { ccn: 74, label: 'K5', defaultParam: 'gain' },
      { ccn: 75, label: 'K6', defaultParam: 'speed' },
      { ccn: 76, label: 'K7', defaultParam: 'pan' },
      { ccn: 77, label: 'K8', defaultParam: 'crush' },
    ],
    pads: [
      { name: 'Bank A', notes: [36, 37, 38, 39, 44, 45, 46, 47] },
      { name: 'Bank B', notes: [48, 49, 50, 51, 55, 56, 57, 58] },
    ],
    transport: { play: 118, stop: 117, record: 119 },
    defaultChannel: 0,
    notes: 'Default preset (Preset 1). Knob CCs change with preset selection on the hardware.',
  },
  {
    id: 'akai-mpk-mini-mk2',
    name: 'AKAI MPK mini MK2',
    manufacturer: 'Akai Professional',
    usbNames: ['MPK mini', 'MPK mini MkII'],
    keys: 25,
    knobs: [
      { ccn: 1, label: 'K1' },
      { ccn: 2, label: 'K2' },
      { ccn: 3, label: 'K3' },
      { ccn: 4, label: 'K4' },
      { ccn: 5, label: 'K5' },
      { ccn: 6, label: 'K6' },
      { ccn: 7, label: 'K7' },
      { ccn: 8, label: 'K8' },
    ],
    pads: [
      { name: 'Bank A', notes: [36, 37, 38, 39, 44, 45, 46, 47] },
      { name: 'Bank B', notes: [48, 49, 50, 51, 55, 56, 57, 58] },
    ],
    defaultChannel: 0,
  },
  {
    id: 'novation-launchkey-mini-mk3',
    name: 'Novation Launchkey Mini MK3',
    manufacturer: 'Novation',
    usbNames: ['Launchkey Mini MK3', 'Launchkey Mini'],
    keys: 25,
    knobs: [
      { ccn: 21, label: 'K1', defaultParam: 'lpf' },
      { ccn: 22, label: 'K2', defaultParam: 'hpf' },
      { ccn: 23, label: 'K3', defaultParam: 'room' },
      { ccn: 24, label: 'K4', defaultParam: 'delay' },
      { ccn: 25, label: 'K5', defaultParam: 'gain' },
      { ccn: 26, label: 'K6', defaultParam: 'speed' },
      { ccn: 27, label: 'K7', defaultParam: 'pan' },
      { ccn: 28, label: 'K8', defaultParam: 'crush' },
    ],
    pads: [
      { name: 'Pads', notes: [36, 37, 38, 39, 40, 41, 42, 43, 44, 45, 46, 47, 48, 49, 50, 51] },
    ],
    transport: { play: 115, stop: 116, record: 117 },
    defaultChannel: 0,
    notes: 'InControl mode must be OFF for standard MIDI CC output.',
  },
  {
    id: 'arturia-minilab-mk2',
    name: 'Arturia MiniLab MkII',
    manufacturer: 'Arturia',
    usbNames: ['Arturia MiniLab mkII', 'MiniLab mkII'],
    keys: 25,
    knobs: [
      { ccn: 7, label: 'K1' },
      { ccn: 74, label: 'K2' },
      { ccn: 71, label: 'K3' },
      { ccn: 76, label: 'K4' },
      { ccn: 77, label: 'K5' },
      { ccn: 93, label: 'K6' },
      { ccn: 73, label: 'K7' },
      { ccn: 75, label: 'K8' },
      { ccn: 114, label: 'K9' },
      { ccn: 18, label: 'K10' },
      { ccn: 19, label: 'K11' },
      { ccn: 16, label: 'K12' },
      { ccn: 17, label: 'K13' },
      { ccn: 91, label: 'K14' },
      { ccn: 79, label: 'K15' },
      { ccn: 72, label: 'K16' },
    ],
    pads: [
      { name: 'Pads', notes: [36, 37, 38, 39, 40, 41, 42, 43, 44, 45, 46, 47, 48, 49, 50, 51] },
    ],
    defaultChannel: 0,
  },
  {
    id: 'korg-nanokontrol2',
    name: 'Korg nanoKONTROL2',
    manufacturer: 'Korg',
    usbNames: ['nanoKONTROL2', 'nanoKONTROL2 MIDI'],
    keys: 0,
    knobs: [
      { ccn: 0, label: 'Slider 1' },
      { ccn: 1, label: 'Slider 2' },
      { ccn: 2, label: 'Slider 3' },
      { ccn: 3, label: 'Slider 4' },
      { ccn: 4, label: 'Slider 5' },
      { ccn: 5, label: 'Slider 6' },
      { ccn: 6, label: 'Slider 7' },
      { ccn: 7, label: 'Slider 8' },
      { ccn: 16, label: 'Knob 1' },
      { ccn: 17, label: 'Knob 2' },
      { ccn: 18, label: 'Knob 3' },
      { ccn: 19, label: 'Knob 4' },
      { ccn: 20, label: 'Knob 5' },
      { ccn: 21, label: 'Knob 6' },
      { ccn: 22, label: 'Knob 7' },
      { ccn: 23, label: 'Knob 8' },
    ],
    pads: [],
    transport: { play: 41, stop: 42, record: 45 },
    defaultChannel: 0,
    notes: 'CC assignments depend on Scene selection. These are Scene 1 defaults.',
  },
  {
    id: 'korg-nanokey2',
    name: 'Korg nanoKEY2',
    manufacturer: 'Korg',
    usbNames: ['nanoKEY2', 'nanoKEY2 MIDI'],
    keys: 25,
    knobs: [],
    pads: [],
    defaultChannel: 0,
  },
  {
    id: 'akai-mpd218',
    name: 'AKAI MPD218',
    manufacturer: 'Akai Professional',
    usbNames: ['MPD218', 'Akai MPD218'],
    keys: 0,
    knobs: [
      { ccn: 3, label: 'K1' },
      { ccn: 9, label: 'K2' },
      { ccn: 12, label: 'K3' },
      { ccn: 13, label: 'K4' },
      { ccn: 14, label: 'K5' },
      { ccn: 15, label: 'K6' },
    ],
    pads: [
      { name: 'Bank A', notes: [36, 37, 38, 39, 40, 41, 42, 43, 44, 45, 46, 47, 48, 49, 50, 51] },
      { name: 'Bank B', notes: [52, 53, 54, 55, 56, 57, 58, 59, 60, 61, 62, 63, 64, 65, 66, 67] },
      { name: 'Bank C', notes: [68, 69, 70, 71, 72, 73, 74, 75, 76, 77, 78, 79, 80, 81, 82, 83] },
    ],
    defaultChannel: 0,
    notes: '16 velocity-sensitive pads, 6 knobs. Primarily a drum/finger pad controller.',
  },
  {
    id: 'novation-launch-control',
    name: 'Novation Launch Control',
    manufacturer: 'Novation',
    usbNames: ['Launch Control', 'Launch Control MIDI'],
    keys: 0,
    knobs: [
      { ccn: 21, label: 'Knob 1' },
      { ccn: 22, label: 'Knob 2' },
      { ccn: 23, label: 'Knob 3' },
      { ccn: 24, label: 'Knob 4' },
      { ccn: 25, label: 'Knob 5' },
      { ccn: 26, label: 'Knob 6' },
      { ccn: 27, label: 'Knob 7' },
      { ccn: 28, label: 'Knob 8' },
      { ccn: 41, label: 'Knob 9' },
      { ccn: 42, label: 'Knob 10' },
      { ccn: 43, label: 'Knob 11' },
      { ccn: 44, label: 'Knob 12' },
      { ccn: 45, label: 'Knob 13' },
      { ccn: 46, label: 'Knob 14' },
      { ccn: 47, label: 'Knob 15' },
      { ccn: 48, label: 'Knob 16' },
    ],
    pads: [
      { name: 'Pads', notes: [9, 10, 11, 12, 25, 26, 27, 28] },
    ],
    defaultChannel: 0,
    notes: '16 knobs + 8 pads. Factory template 1.',
  },
  {
    id: 'generic-keyboard',
    name: 'Generic MIDI Keyboard',
    manufacturer: 'Generic',
    usbNames: [],
    keys: 49,
    knobs: [
      { ccn: 1, label: 'Mod Wheel' },
      { ccn: 7, label: 'Volume' },
      { ccn: 10, label: 'Pan' },
      { ccn: 11, label: 'Expression' },
      { ccn: 64, label: 'Sustain Pedal' },
      { ccn: 74, label: 'Filter (Brightness)' },
    ],
    pads: [],
    defaultChannel: 0,
    notes: 'Fallback profile for unrecognized MIDI keyboards. Uses standard GM CC assignments.',
  },
]

/* ── Auto-detection ───────────────────────────────────── */

/**
 * Find a device profile by matching the USB device name
 * reported by Web MIDI API's MIDIInput.name.
 * Falls back to 'generic-keyboard' if no match found.
 */
export function detectDeviceProfile(usbName: string): MidiDeviceProfile {
  const lower = usbName.toLowerCase()
  const match = MIDI_DEVICES.find((d) =>
    d.usbNames.some((n) => lower.includes(n.toLowerCase()))
  )
  return match ?? MIDI_DEVICES.find((d) => d.id === 'generic-keyboard')!
}

/**
 * Get a device profile by its unique ID.
 */
export function getDeviceProfileById(id: string): MidiDeviceProfile | undefined {
  return MIDI_DEVICES.find((d) => d.id === id)
}

/**
 * Generate a Strudel midimaps config object from a device profile.
 * Maps knob CC numbers to their default Strudel parameters.
 */
export function generateStrudelMidimap(profile: MidiDeviceProfile): Record<string, number> {
  const map: Record<string, number> = {}
  for (const knob of profile.knobs) {
    if (knob.defaultParam) {
      map[knob.defaultParam] = knob.ccn
    }
  }
  return map
}
