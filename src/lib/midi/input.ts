/* SPDX-License-Identifier: MIT
   Copyright (c) 2026 Arnold Wender / Wender Media
   ──────────────────────────────────────────────────────────
   MIDI input — listens for MIDI CC messages from external
   controllers and makes values available as reactive getters
   for use in Strudel patterns.
   ────────────────────────────────────────────────────────── */

/** CC value store — maps "channel:cc" → value (0-1) */
const ccValues = new Map<string, number>();

/** Note state — maps "channel:note" → velocity (0 = off) */
const noteState = new Map<string, number>();

/** Listeners notified when any CC value changes */
const listeners = new Set<(channel: number, cc: number, value: number) => void>();

/** Listeners notified when the MIDI device list changes */
const deviceListeners = new Set<(names: string[]) => void>();

let midiAccess: MIDIAccess | null = null;
let initialized = false;

/** Initialize Web MIDI API and listen on all inputs */
export async function initMidiInput(): Promise<boolean> {
  if (initialized) return true;
  if (!navigator.requestMIDIAccess) {
    import.meta.env.DEV && console.warn('[MidiInput] Web MIDI not supported');
    return false;
  }

  try {
    midiAccess = await navigator.requestMIDIAccess({ sysex: false });
    initialized = true;

    /* Listen on all current inputs */
    for (const input of midiAccess.inputs.values()) {
      attachInput(input);
    }

    /* Listen for new devices — fires on both connect and disconnect */
    midiAccess.onstatechange = (e) => {
      const port = (e as MIDIConnectionEvent).port;
      if (!port || port.type !== 'input') return;
      if (port.state === 'connected') {
        attachInput(port as MIDIInput);
        console.log(`[MidiInput] Connected: ${port.name}`);
      } else if (port.state === 'disconnected') {
        console.log(`[MidiInput] Disconnected: ${port.name}`);
      }
      notifyDeviceListeners();
    };

    console.log(`[MidiInput] Initialized with ${midiAccess.inputs.size} inputs`);
    return true;
  } catch (err) {
    console.error('[MidiInput] Failed to init:', err);
    return false;
  }
}

function attachInput(input: MIDIInput): void {
  /* Use addEventListener instead of onmidimessage — the onmidimessage property
   * is exclusive (only one handler), and @strudel/midi's webmidi library uses it
   * for midikeys()/midin(). Setting it here would STEAL note events from Strudel.
   * addEventListener allows both handlers to coexist. */
  input.addEventListener('midimessage', handleMessage as EventListener);
}

function handleMessage(e: MIDIMessageEvent): void {
  const data = e.data;
  if (!data || data.length < 2) return;

  const status = data[0] & 0xf0;
  const channel = (data[0] & 0x0f) + 1;

  switch (status) {
    case 0xb0: {
      /* CC message: channel, cc number, value */
      const cc = data[1];
      const value = data[2] / 127;
      const key = `${channel}:${cc}`;
      ccValues.set(key, value);
      listeners.forEach((fn) => fn(channel, cc, value));
      break;
    }
    case 0x90: {
      /* Note On */
      const note = data[1];
      const velocity = data[2] / 127;
      noteState.set(`${channel}:${note}`, velocity);
      break;
    }
    case 0x80: {
      /* Note Off */
      const note = data[1];
      noteState.set(`${channel}:${note}`, 0);
      break;
    }
  }
}

/** Get CC value (0-1) for a specific channel and CC number */
export function getCCValue(channel: number, cc: number): number {
  return ccValues.get(`${channel}:${cc}`) ?? 0;
}

/** Get note velocity (0-1) for a specific channel and note */
export function getNoteVelocity(channel: number, note: number): number {
  return noteState.get(`${channel}:${note}`) ?? 0;
}

/** Subscribe to CC changes */
export function onCCChange(fn: (channel: number, cc: number, value: number) => void): () => void {
  listeners.add(fn);
  return () => listeners.delete(fn);
}

/** Get all available MIDI input device names */
export function getMidiInputNames(): string[] {
  if (!midiAccess) return [];
  return [...midiAccess.inputs.values()].map((i) => i.name ?? 'Unknown');
}

/** Check if MIDI is available and initialized */
export function isMidiAvailable(): boolean {
  return initialized && midiAccess !== null;
}

/** Subscribe to MIDI device connect/disconnect events */
export function onDeviceListChange(fn: (names: string[]) => void): () => void {
  deviceListeners.add(fn);
  return () => deviceListeners.delete(fn);
}

/** Notify all device list subscribers */
function notifyDeviceListeners(): void {
  const names = getMidiInputNames();
  deviceListeners.forEach((fn) => fn(names));
}
