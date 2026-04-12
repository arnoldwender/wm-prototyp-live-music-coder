/* SPDX-License-Identifier: MIT
   Copyright (c) 2026 Arnold Wender / Wender Media
   ──────────────────────────────────────────────────────────
   MIDI Learn — maps CC messages to named parameters.

   Workflow: call startMidiLearn("cutoff"), then move a knob
   on the MIDI controller. The first CC message received gets
   bound to "cutoff". Mappings persist in localStorage.
   ────────────────────────────────────────────────────────── */

/* eslint-disable @typescript-eslint/no-explicit-any */

/** Reactive state exposed to consumers */
export interface MidiLearnState {
  learning: boolean
  targetParam: string | null
  mappings: Record<string, number> // param name -> CC number
}

/** localStorage key for persisted mappings */
const STORAGE_KEY = 'lmc-midi-learn'

/** Internal state */
const state: MidiLearnState = {
  learning: false,
  targetParam: null,
  mappings: loadMappings(),
}

/** Subscribers notified on every state change */
const subscribers = new Set<(s: MidiLearnState) => void>()

/** MIDI access reference — lazily acquired once */
let midiAccess: MIDIAccess | null = null

/** Track which inputs already have our listener attached */
const attachedInputs = new Set<string>()

/* ───────────── persistence helpers ───────────── */

/** Load mappings from localStorage */
function loadMappings(): Record<string, number> {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (raw) return JSON.parse(raw) as Record<string, number>
  } catch { /* corrupt data — start fresh */ }
  return {}
}

/** Save current mappings to localStorage */
function saveMappings(): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state.mappings))
  } catch { /* storage full or unavailable */ }
}

/** Notify all subscribers with a shallow copy of state */
function notify(): void {
  const snapshot: MidiLearnState = {
    learning: state.learning,
    targetParam: state.targetParam,
    mappings: { ...state.mappings },
  }
  subscribers.forEach((fn) => fn(snapshot))
}

/* ───────────── MIDI listener ───────────── */

/** Handle incoming MIDI message — captures CC during learn mode */
function handleMidiMessage(e: Event): void {
  const midiEvent = e as MIDIMessageEvent
  const data = midiEvent.data
  if (!data || data.length < 3) return

  const status = data[0] & 0xf0

  /* Only react to CC messages (0xB0) */
  if (status !== 0xb0) return

  const cc = data[1]

  /* If we're in learn mode, bind this CC to the target parameter */
  if (state.learning && state.targetParam !== null) {
    /* Save param name before nullifying — avoids stale-closure log ("null") */
    const mappedParam = state.targetParam
    state.mappings[mappedParam] = cc
    state.learning = false
    state.targetParam = null
    saveMappings()
    notify()
    console.log(`[MidiLearn] Mapped CC ${cc} → "${mappedParam}"`)
  }
}

/** Attach listener to a single MIDI input (idempotent) */
function attachInput(input: MIDIInput): void {
  const inputId = input.id || input.name || 'unknown'
  if (attachedInputs.has(inputId)) return
  attachedInputs.add(inputId)
  input.addEventListener('midimessage', handleMidiMessage)
}

/** Ensure we have MIDI access and listeners on all inputs */
async function ensureMidiAccess(): Promise<void> {
  if (midiAccess) return
  if (!navigator.requestMIDIAccess) {
    import.meta.env.DEV && console.warn('[MidiLearn] Web MIDI not supported')
    return
  }

  try {
    midiAccess = await navigator.requestMIDIAccess({ sysex: false })

    /* Attach to all current inputs */
    for (const input of midiAccess.inputs.values()) {
      attachInput(input)
    }

    /* Listen for hot-plugged devices */
    midiAccess.onstatechange = (e) => {
      const port = (e as MIDIConnectionEvent).port
      if (port && port.type === 'input' && port.state === 'connected') {
        attachInput(port as MIDIInput)
      }
    }
  } catch (err) {
    console.error('[MidiLearn] MIDI access failed:', err)
  }
}

/* ───────────── public API ───────────── */

/**
 * Start listening for the next CC message.
 * When a CC arrives, it gets mapped to `paramName`.
 */
export async function startMidiLearn(paramName: string): Promise<void> {
  await ensureMidiAccess()
  state.learning = true
  state.targetParam = paramName
  notify()
  console.log(`[MidiLearn] Waiting for CC → "${paramName}"...`)
}

/** Cancel the current learn session without saving */
export function stopMidiLearn(): void {
  state.learning = false
  state.targetParam = null
  notify()
  import.meta.env.DEV && console.log('[MidiLearn] Cancelled')
}

/** Get the CC number mapped to a parameter, or undefined */
export function getMidiMapping(paramName: string): number | undefined {
  return state.mappings[paramName]
}

/** Get a copy of all current mappings */
export function getAllMappings(): Record<string, number> {
  return { ...state.mappings }
}

/** Remove a single mapping */
export function clearMapping(paramName: string): void {
  delete state.mappings[paramName]
  saveMappings()
  notify()
}

/** Remove all mappings */
export function clearAllMappings(): void {
  state.mappings = {}
  saveMappings()
  notify()
}

/** Subscribe to state changes. Returns unsubscribe function. */
export function onMidiLearnChange(fn: (s: MidiLearnState) => void): () => void {
  subscribers.add(fn)
  return () => subscribers.delete(fn)
}

/** Get a snapshot of the current state (non-reactive) */
export function getMidiLearnState(): MidiLearnState {
  return {
    learning: state.learning,
    targetParam: state.targetParam,
    mappings: { ...state.mappings },
  }
}
