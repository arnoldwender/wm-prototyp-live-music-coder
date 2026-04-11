/* SPDX-License-Identifier: MIT
   Copyright (c) 2026 Arnold Wender / Wender Media
   ──────────────────────────────────────────────────────────
   VirtualKeyboard atom — on-screen piano keyboard.
   Renders a configurable octave range of white/black keys,
   handles pointer + touch input, exposes onNoteOn/onNoteOff
   callbacks, and binds the standard QWERTY mapping
   (A=C, W=C#, S=D, ...) for desktop play.
   ────────────────────────────────────────────────────────── */

import { useCallback, useEffect, useMemo, useRef, useState } from 'react'

interface VirtualKeyboardProps {
  /** Lowest octave (MIDI octave number) — default 3 (C3 = MIDI 48) */
  startOctave?: number
  /** Number of octaves to render — default 2 */
  octaves?: number
  /** Currently held MIDI notes (highlighted) — controlled from parent */
  activeNotes?: number[]
  /** Note-on callback — fires on press, velocity in 0–1 range */
  onNoteOn: (midiNote: number, velocity: number) => void
  /** Note-off callback — fires on release */
  onNoteOff: (midiNote: number) => void
}

/** Pitch class indices for white keys within an octave (C D E F G A B) */
const WHITE_KEY_PITCHES = [0, 2, 4, 5, 7, 9, 11] as const

/* Black key offsets relative to the white key they sit AFTER, plus their pitch
 * class. Black keys appear after C, D, F, G, A (white indices 0, 1, 3, 4, 5). */
const BLACK_KEY_DEFS = [
  { afterWhiteIndex: 0, pitch: 1 },  /* C# */
  { afterWhiteIndex: 1, pitch: 3 },  /* D# */
  { afterWhiteIndex: 3, pitch: 6 },  /* F# */
  { afterWhiteIndex: 4, pitch: 8 },  /* G# */
  { afterWhiteIndex: 5, pitch: 10 }, /* A# */
] as const

/** QWERTY → pitch class within the lowest octave (covers one full octave) */
const QWERTY_MAP: Record<string, number> = {
  a: 0,  /* C  */
  w: 1,  /* C# */
  s: 2,  /* D  */
  e: 3,  /* D# */
  d: 4,  /* E  */
  f: 5,  /* F  */
  t: 6,  /* F# */
  g: 7,  /* G  */
  y: 8,  /* G# */
  h: 9,  /* A  */
  u: 10, /* A# */
  j: 11, /* B  */
}

/** White key dimensions (matched against design system spacing) */
const WHITE_KEY_WIDTH = 40
const WHITE_KEY_HEIGHT = 120
const BLACK_KEY_WIDTH = 24
const BLACK_KEY_HEIGHT = 72

/** Compute MIDI note number for octave + pitch class — C-1 = 0, C0 = 12, C3 = 48 */
function midiNote(octave: number, pitchClass: number): number {
  return (octave + 1) * 12 + pitchClass
}

function VirtualKeyboard({
  startOctave: initialOctave = 3,
  octaves = 2,
  activeNotes = [],
  onNoteOn,
  onNoteOff,
}: VirtualKeyboardProps) {
  /* Octave shift — independent of the prop so users can transpose live */
  const [octaveShift, setOctaveShift] = useState(0)
  const baseOctave = initialOctave + octaveShift

  /* Internal pressed-note set — merged with externally controlled activeNotes */
  const [internalPressed, setInternalPressed] = useState<Set<number>>(new Set())
  const containerRef = useRef<HTMLDivElement>(null)

  /* Set of all currently lit notes — internal presses ∪ external activeNotes */
  const litNotes = useMemo(() => {
    const s = new Set(internalPressed)
    for (const n of activeNotes) s.add(n)
    return s
  }, [internalPressed, activeNotes])

  /* Build the white key list once per render — used for both layout and lookup */
  const whiteKeys = useMemo(() => {
    const result: { note: number; index: number }[] = []
    for (let o = 0; o < octaves; o++) {
      for (let i = 0; i < WHITE_KEY_PITCHES.length; i++) {
        result.push({
          note: midiNote(baseOctave + o, WHITE_KEY_PITCHES[i]),
          index: o * WHITE_KEY_PITCHES.length + i,
        })
      }
    }
    return result
  }, [baseOctave, octaves])

  /* Build the black key list — positioned absolutely over white keys */
  const blackKeys = useMemo(() => {
    const result: { note: number; left: number }[] = []
    for (let o = 0; o < octaves; o++) {
      for (const def of BLACK_KEY_DEFS) {
        const whiteIndexInRow = o * WHITE_KEY_PITCHES.length + def.afterWhiteIndex
        /* Center the black key on the boundary between two white keys */
        const left = (whiteIndexInRow + 1) * WHITE_KEY_WIDTH - BLACK_KEY_WIDTH / 2
        result.push({
          note: midiNote(baseOctave + o, def.pitch),
          left,
        })
      }
    }
    return result
  }, [baseOctave, octaves])

  /* ── Note trigger helpers ── */
  const triggerNoteOn = useCallback(
    (note: number, velocity: number) => {
      setInternalPressed((prev) => {
        if (prev.has(note)) return prev
        const next = new Set(prev)
        next.add(note)
        return next
      })
      onNoteOn(note, velocity)
    },
    [onNoteOn]
  )

  const triggerNoteOff = useCallback(
    (note: number) => {
      setInternalPressed((prev) => {
        if (!prev.has(note)) return prev
        const next = new Set(prev)
        next.delete(note)
        return next
      })
      onNoteOff(note)
    },
    [onNoteOff]
  )

  /* ── Pointer handlers (mouse + touch via Pointer Events) ──
   * Velocity derives from Y position within the key — top = soft, bottom = loud.
   * This mirrors how DAWs handle on-screen keyboards. */
  const handlePointerDown = useCallback(
    (note: number) => (e: React.PointerEvent<HTMLButtonElement>) => {
      e.preventDefault()
      ;(e.currentTarget as HTMLButtonElement).setPointerCapture(e.pointerId)
      const rect = e.currentTarget.getBoundingClientRect()
      const yPct = Math.min(1, Math.max(0, (e.clientY - rect.top) / rect.height))
      /* Velocity range 0.4–1.0 — never silent on touch, full volume at the bottom */
      const velocity = 0.4 + yPct * 0.6
      triggerNoteOn(note, velocity)
    },
    [triggerNoteOn]
  )

  const handlePointerUp = useCallback(
    (note: number) => (e: React.PointerEvent<HTMLButtonElement>) => {
      e.preventDefault()
      try {
        ;(e.currentTarget as HTMLButtonElement).releasePointerCapture(e.pointerId)
      } catch { /* pointer might already be released */ }
      triggerNoteOff(note)
    },
    [triggerNoteOff]
  )

  const handlePointerLeave = useCallback(
    (note: number) => () => {
      /* Only release if it was actually pressed via pointer (not via QWERTY) */
      if (internalPressed.has(note)) triggerNoteOff(note)
    },
    [internalPressed, triggerNoteOff]
  )

  /* ── QWERTY keyboard binding ──
   * Listens at window level so the user can play without focusing the keyboard.
   * Holds repeated keydown events get suppressed via the heldKeys set. */
  const heldKeysRef = useRef<Set<string>>(new Set())

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      /* Skip when the user is typing in an input/textarea/contenteditable */
      const target = e.target as HTMLElement | null
      if (target) {
        const tag = target.tagName
        if (tag === 'INPUT' || tag === 'TEXTAREA' || target.isContentEditable) return
      }
      if (e.metaKey || e.ctrlKey || e.altKey) return

      const key = e.key.toLowerCase()
      const pitch = QWERTY_MAP[key]
      if (pitch === undefined) return
      if (heldKeysRef.current.has(key)) return
      heldKeysRef.current.add(key)
      const note = midiNote(baseOctave, pitch)
      /* Default velocity for keyboard — comfortably loud */
      triggerNoteOn(note, 0.8)
    }

    const handleKeyUp = (e: KeyboardEvent) => {
      const key = e.key.toLowerCase()
      const pitch = QWERTY_MAP[key]
      if (pitch === undefined) return
      heldKeysRef.current.delete(key)
      const note = midiNote(baseOctave, pitch)
      triggerNoteOff(note)
    }

    window.addEventListener('keydown', handleKeyDown)
    window.addEventListener('keyup', handleKeyUp)
    return () => {
      window.removeEventListener('keydown', handleKeyDown)
      window.removeEventListener('keyup', handleKeyUp)
    }
  }, [baseOctave, triggerNoteOn, triggerNoteOff])

  /* Keyboard width = number of white keys × white key width */
  const keyboardWidth = whiteKeys.length * WHITE_KEY_WIDTH

  /* Octave shift handlers — clamp to a sane range */
  const shiftOctaveDown = useCallback(() => setOctaveShift((s) => Math.max(-3, s - 1)), [])
  const shiftOctaveUp = useCallback(() => setOctaveShift((s) => Math.min(3, s + 1)), [])

  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: 'var(--space-3)',
        padding: 'var(--space-3)',
      }}
    >
      {/* Octave down */}
      <button
        type="button"
        onClick={shiftOctaveDown}
        aria-label="Octave down"
        style={{
          padding: 'var(--space-2) var(--space-3)',
          backgroundColor: 'var(--color-bg-elevated)',
          color: 'var(--color-text)',
          border: '1px solid var(--color-border)',
          borderRadius: 'var(--radius-md)',
          cursor: 'pointer',
          fontSize: 'var(--font-size-sm)',
          fontFamily: 'var(--font-family-sans)',
          minWidth: '32px',
          minHeight: '32px',
        }}
      >
        −
      </button>

      {/* Keyboard surface — relative container so black keys can absolute-position */}
      <div
        ref={containerRef}
        role="group"
        aria-label="Virtual piano keyboard"
        style={{
          position: 'relative',
          width: `${keyboardWidth}px`,
          height: `${WHITE_KEY_HEIGHT}px`,
          touchAction: 'none',
        }}
      >
        {/* White keys — render first so black keys overlay them */}
        {whiteKeys.map(({ note, index }) => {
          const isActive = litNotes.has(note)
          return (
            <button
              key={`w-${note}`}
              type="button"
              role="button"
              aria-label={`White key MIDI ${note}`}
              aria-pressed={isActive}
              data-note={note}
              data-key-type="white"
              onPointerDown={handlePointerDown(note)}
              onPointerUp={handlePointerUp(note)}
              onPointerLeave={handlePointerLeave(note)}
              onPointerCancel={handlePointerUp(note)}
              style={{
                position: 'absolute',
                left: `${index * WHITE_KEY_WIDTH}px`,
                top: 0,
                width: `${WHITE_KEY_WIDTH}px`,
                height: `${WHITE_KEY_HEIGHT}px`,
                backgroundColor: isActive ? 'var(--color-primary)' : 'var(--color-bg-alt)',
                border: '1px solid var(--color-border)',
                borderRadius: '0 0 var(--radius-sm) var(--radius-sm)',
                cursor: 'pointer',
                padding: 0,
                boxShadow: isActive
                  ? '0 0 8px var(--color-primary), inset 0 -4px 0 rgba(0,0,0,0.1)'
                  : 'inset 0 -4px 0 rgba(0,0,0,0.1)',
                transition: 'var(--transition-fast)',
              }}
            />
          )
        })}

        {/* Black keys — absolutely positioned, taller z-index */}
        {blackKeys.map(({ note, left }) => {
          const isActive = litNotes.has(note)
          return (
            <button
              key={`b-${note}`}
              type="button"
              role="button"
              aria-label={`Black key MIDI ${note}`}
              aria-pressed={isActive}
              data-note={note}
              data-key-type="black"
              onPointerDown={handlePointerDown(note)}
              onPointerUp={handlePointerUp(note)}
              onPointerLeave={handlePointerLeave(note)}
              onPointerCancel={handlePointerUp(note)}
              style={{
                position: 'absolute',
                left: `${left}px`,
                top: 0,
                width: `${BLACK_KEY_WIDTH}px`,
                height: `${BLACK_KEY_HEIGHT}px`,
                backgroundColor: isActive ? 'var(--color-primary)' : 'var(--color-bg)',
                border: '1px solid var(--color-border)',
                borderRadius: '0 0 var(--radius-sm) var(--radius-sm)',
                cursor: 'pointer',
                padding: 0,
                zIndex: 2,
                boxShadow: isActive
                  ? '0 0 6px var(--color-primary)'
                  : '0 2px 4px rgba(0,0,0,0.4)',
                transition: 'var(--transition-fast)',
              }}
            />
          )
        })}
      </div>

      {/* Octave up */}
      <button
        type="button"
        onClick={shiftOctaveUp}
        aria-label="Octave up"
        style={{
          padding: 'var(--space-2) var(--space-3)',
          backgroundColor: 'var(--color-bg-elevated)',
          color: 'var(--color-text)',
          border: '1px solid var(--color-border)',
          borderRadius: 'var(--radius-md)',
          cursor: 'pointer',
          fontSize: 'var(--font-size-sm)',
          fontFamily: 'var(--font-family-sans)',
          minWidth: '32px',
          minHeight: '32px',
        }}
      >
        +
      </button>
    </div>
  )
}

export default VirtualKeyboard
