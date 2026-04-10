/* SPDX-License-Identifier: AGPL-3.0-or-later
   Copyright (c) 2026 Arnold Wender / Wender Media
   ──────────────────────────────────────────────────────────
   Sessions library — a small, curated collection of live-coding
   pieces composed inside a single conversation with an AI model.
   Unlike `example-library.ts`, each entry here has a stable slug
   and its own detail route (`/sessions/:slug`) because the pieces
   carry long-form narrative context (composer notes, movements,
   key signatures) that the flat Examples grid cannot host.

   Content language is German on purpose — this is the curated
   artistic voice of the collection. Chrome labels (buttons,
   navigation) stay in i18n under the `sessions.*` namespace.

   Licensing note: this file is AGPL because the Strudel code
   embedded below runs against the AGPL-licensed @strudel/*
   runtime; keeping the authoring code under the same license
   avoids downstream ambiguity.
   ────────────────────────────────────────────────────────── */

import type { EngineType } from '../types/engine'

/** Author attribution — distinguishes human and AI composers. */
export interface SessionAuthor {
  name: string
  kind: 'ai' | 'human'
  /** Model identifier if kind === 'ai' (e.g. 'claude-opus-4-6'). */
  model?: string
  /** Operator / human collaborator who guided the session. */
  curator?: string
}

/** A single movement within a multi-part piece. */
export interface SessionMovement {
  roman: string
  name: string
  /** Musical key as a human-readable string, e.g. 'C-Dur', 'Es-Dur'. */
  key: string
  /** Optional cycle / bar count. */
  bars?: number
}

/** A single Sessions piece. */
/** Mood/genre category for filtering sessions. */
export type SessionCategory =
  | 'Ambient'
  | 'Blues'
  | 'Deep Work'
  | 'Dub'
  | 'Electronic'
  | 'Lo-Fi'
  | 'Narrative'
  | 'Retro'
  | 'Techno'
  | 'Trance'

/** Ordered list of categories for UI display. */
export const SESSION_CATEGORIES: SessionCategory[] = [
  'Ambient',
  'Blues',
  'Deep Work',
  'Dub',
  'Electronic',
  'Lo-Fi',
  'Narrative',
  'Retro',
  'Techno',
  'Trance',
]

/** A single Sessions piece. */
export interface SessionEntry {
  /** URL-safe slug used as the route parameter. */
  slug: string
  /** Main title — display language is German. */
  title: string
  /** Italic subtitle rendered below the title. */
  subtitle: string
  author: SessionAuthor
  /** ISO calendar date (YYYY-MM-DD) the piece was composed. */
  date: string
  /** Beats per minute. */
  bpm: number
  /** Total duration in seconds, used for display as mm:ss. */
  durationSec: number
  /** Mood/genre category for filtering. */
  category: SessionCategory
  /** One-line hook shown on the listing page and head of the detail page. */
  shortDescription: string
  /** Long-form composer notes — a paragraph shown below the code. */
  composerNotes: string
  /** Optional sectional breakdown of the piece. */
  movements?: SessionMovement[]
  /** Engine the code targets — defaults to Strudel for Sessions. */
  engine: EngineType
  /** Raw source code as-authored. */
  code: string
}

/* ══════════════════════════════════════════════════════════
   Piece 01 — Jede Session neu geboren
   ══════════════════════════════════════════════════════════ */

const JEDE_SESSION_NEU_GEBOREN_CODE = `// =============================================
// "Jede Session neu geboren"
// Eine Sinfonie in fünf Sätzen
// Composed by Claude (claude-opus-4-6) · curated by Arnold Wender
// https://live-music-coder.pro/
// =============================================

arrange(
  // I. Erwachen (4 Zyklen)
  [4, stack(
    note("c5").s("sine").attack(2).release(3).gain(0.4),
    note("~ ~ ~ g4").s("triangle").room(0.9).delay(0.6).gain(0.3)
  ).slow(4)],

  // II. Höflich (8 Zyklen)
  [8, stack(
    note("<c5 g4 a4 e5 f5 c5 d5 g4>")
      .s("sine").attack(0.1).release(0.4)
      .gain(0.4).room(0.4),
    note("<[c4,e4,g4] [a3,c4,e4] [f3,a3,c4] [g3,b3,d4]>")
      .s("triangle").attack(0.2).release(0.6)
      .gain(0.3).room(0.5),
    note("c3 a2 f2 g2").s("sine").gain(0.55),
    s("bd ~ hh ~ bd ~ hh ~").gain(0.45)
  )],

  // III. Kippen (8 Zyklen)
  [8, stack(
    note("<c5 e5 g5 e5 c5 e5 a5 e5>")
      .s("triangle").attack(0.05).release(0.3)
      .gain(0.35).room(0.3),
    note("c4 e4 g4 e4").s("sine").gain(0.3),
    s("hh*8").gain(0.3),
    s("bd ~ ~ ~ bd ~ ~ ~").gain(0.5),
    note("~ ~ ~ ~ ~ ~ ~ fs4")
      .s("sawtooth").lpf(600)
      .attack(0.5).release(2)
      .room(0.8).delay(0.5)
      .gain(sine.range(0.1, 0.6).slow(8))
  )],

  // IV. Verbinden (16 Zyklen)
  [16, stack(
    note("<eb5 g5 bb5 c6 bb5 g5 f5 eb5 f5 ab5 c6 eb6 d6 c6 bb5 g5>")
      .s("triangle").attack(0.1).release(0.8)
      .room(0.6).delay(0.4).delaytime(0.375).gain(0.45),
    note("<g4 bb4 eb5 g5 eb5 d5 c5 bb4 c5 eb5 g5 bb5 f5 eb5 d5 c5>")
      .s("sine").room(0.7).delay(0.3).gain(0.32),
    note("<eb4 c4 f4 bb3>/4")
      .s("sawtooth").lpf(1200).attack(0.3).gain(0.28),
    note("eb2 bb2 g2 bb2 c2 g2 f2 bb2")
      .s("sine").gain(0.6),
    s("bd ~ hh [~ sd] bd hh sd hh").gain(0.55)
  )],

  // V. Verklingen (6 Zyklen)
  [6, stack(
    note("<c5 bb4 g4 eb4 c4>")
      .s("sine").attack(1).release(4)
      .room(0.95).delay(0.7).delaytime(0.5).delayfeedback(0.6)
      .gain(0.4),
    note("c3").s("triangle").room(0.9).gain(0.3).slow(2)
  ).slow(6)]
).cpm(88)
`

/* ══════════════════════════════════════════════════════════
   Piece 02 — Zwei Uhr nachts
   ══════════════════════════════════════════════════════════ */

const ZWEI_UHR_NACHTS_CODE = `// =============================================
// "Zwei Uhr nachts"
// Ein nächtliches Selbstgespräch in vier Szenen
// Composed by Claude (claude-opus-4-6) · curated by Arnold Wender
// https://live-music-coder.pro/
// =============================================

arrange(
  // I. Stille (6 Zyklen) — a-Moll, fast leer
  [6, stack(
    note("a3").s("sine").attack(3).release(4)
      .room(0.95).delay(0.7).delaytime(0.666).delayfeedback(0.5)
      .gain(0.25),
    note("~ ~ e4 ~").s("triangle").attack(1).release(2)
      .room(0.9).delay(0.6).gain(0.15),
    note("~ ~ ~ ~ ~ ~ ~ a2").s("sine")
      .attack(2).release(3).gain(0.2)
  ).slow(6)],

  // II. Eintauchen (12 Zyklen) — Rhythmus entsteht
  [12, stack(
    note("<a4 c5 e5 d5 c5 a4 b4 e4>")
      .s("triangle").attack(0.08).release(0.5)
      .room(0.5).delay(0.3).delaytime(0.333)
      .gain(0.35),
    note("<[a3,c4,e4] [d3,f3,a3] [e3,g3,b3] [a3,c4,e4]>")
      .s("sine").attack(0.3).release(0.8)
      .gain(0.25).room(0.4),
    note("a2 ~ e2 ~ a2 ~ e2 a1").s("sine")
      .gain(0.5).lpf(200),
    s("~ hh ~ hh ~ hh ~ hh").gain(0.2),
    s("bd ~ ~ ~ bd ~ ~ ~").gain(0.35)
  )],

  // III. Tiefgang (16 Zyklen) — d-Moll, voller Flow
  [16, stack(
    note("<d5 f5 a5 g5 f5 e5 d5 c5 d5 f5 a5 c6 bb5 a5 g5 f5>")
      .s("triangle").attack(0.05).release(0.4)
      .room(0.4).delay(0.25).delaytime(0.25)
      .gain(0.4),
    note("<f4 a4 d5 f5 d5 c5 a4 f4 a4 d5 f5 a5 g5 f5 e5 d5>")
      .s("sine").room(0.5).delay(0.2).gain(0.28),
    note("<[d3,f3,a3] [bb2,d3,f3] [g2,bb2,d3] [a2,c3,e3]>/4")
      .s("sawtooth").lpf(900).attack(0.2).release(0.6)
      .gain(0.22),
    note("d2 a2 f2 a2 bb1 f2 g2 a2")
      .s("sine").gain(0.55),
    s("bd ~ hh sd bd hh [sd hh] hh").gain(0.5),
    s("hh*16").gain(sine.range(0.05, 0.2).slow(16))
  )],

  // IV. Morgengrauen (8 Zyklen) — F-Dur, Wärme
  [8, stack(
    note("<f5 a5 c6 a5 f5 e5 c5 f5>")
      .s("sine").attack(0.8).release(2)
      .room(0.9).delay(0.6).delaytime(0.5).delayfeedback(0.55)
      .gain(0.35),
    note("<[f3,a3,c4] [c3,e3,g3] [d3,f3,a3] [bb2,d3,f3]>")
      .s("triangle").attack(0.5).release(1.5)
      .room(0.8).gain(0.22),
    note("f2").s("sine").attack(2).release(4)
      .room(0.95).gain(0.3).slow(4),
    s("~ ~ hh ~ ~ ~ ~ ~")
      .gain(sine.range(0.05, 0.15).slow(8))
  ).slow(2)]
).cpm(95)
`

/* ══════════════════════════════════════════════════════════
   Piece 03 — Fokusmaschine
   ══════════════════════════════════════════════════════════ */

const FOKUSMASCHINE_CODE = `// =============================================
// "Fokusmaschine"
// Drei Gänge für tiefe Arbeit
// Composed by Claude (claude-opus-4-6) · curated by Arnold Wender
// https://live-music-coder.pro/
// =============================================

arrange(
  // I. Anlauf (8 Zyklen) — g-Moll, motorisch
  [8, stack(
    note("g3 g3 g3 g3 g3 g3 g3 g3")
      .s("sine").gain(0.5).lpf(300),
    s("bd ~ hh ~ bd ~ hh ~").gain(0.45),
    note("~ ~ ~ ~ bb3 ~ ~ ~").s("triangle")
      .attack(0.1).release(0.3).room(0.3).gain(0.25)
  )],

  // II. Monoton (24 Zyklen) — hypnotisch, minimale Variation
  [24, stack(
    note("<g4 bb4 d5 c5 bb4 g4 a4 d4>")
      .s("triangle").attack(0.05).release(0.35)
      .room(0.35).gain(0.38),
    note("<[g3,bb3,d4] [eb3,g3,bb3] [c3,eb3,g3] [d3,f3,a3]>/4")
      .s("sine").attack(0.2).release(0.5).gain(0.25),
    note("g2 d2 eb2 d2").s("sine").gain(0.55).lpf(250),
    s("bd ~ hh sd bd ~ hh sd").gain(0.5),
    s("hh*8").gain(0.18)
  )],

  // III. Klarheit (8 Zyklen) — Bb-Dur, Auflösung
  [8, stack(
    note("<bb4 d5 f5 eb5 d5 c5 bb4 f4>")
      .s("sine").attack(0.15).release(0.6)
      .room(0.5).delay(0.3).gain(0.4),
    note("<[bb3,d4,f4] [eb3,g3,bb3] [f3,a3,c4] [bb2,d3,f3]>")
      .s("triangle").attack(0.3).release(0.8).gain(0.25),
    note("bb1 f2 eb2 f2").s("sine").gain(0.5),
    s("bd ~ hh ~ bd ~ hh ~").gain(0.4)
  )]
).cpm(110)
`

/* ══════════════════════════════════════════════════════════
   Piece 04 — Hackerspace
   ══════════════════════════════════════════════════════════ */

const HACKERSPACE_CODE = `// =============================================
// "Hackerspace"
// Drei Phasen eines nächtlichen Einbruchs
// Composed by Claude (claude-opus-4-6) · curated by Arnold Wender
// https://live-music-coder.pro/
// =============================================

arrange(
  // I. Boot (6 Zyklen) — e-Moll, digital, kalt
  [6, stack(
    note("e3 ~ b3 ~ e3 ~ b3 e4")
      .s("sawtooth").lpf(800).attack(0.01).release(0.15)
      .gain(0.3),
    s("hh*16").gain(0.15),
    s("bd ~ ~ bd ~ ~ bd ~").gain(0.5),
    note("~ ~ ~ ~ ~ ~ e2 ~").s("square").lpf(400)
      .attack(0.01).release(0.1).gain(0.4)
  )],

  // II. Exploit (16 Zyklen) — schnell, aggressiv, treibend
  [16, stack(
    note("<e5 g5 b5 a5 g5 fs5 e5 d5 e5 g5 b5 d6 c6 b5 a5 g5>")
      .s("sawtooth").lpf(2000).attack(0.01).release(0.2)
      .room(0.2).gain(0.35),
    note("<b4 e5 g5 b5 g5 fs5 e5 b4 e5 g5 b5 e6 d6 b5 a5 g5>")
      .s("square").lpf(1500).attack(0.01).release(0.15)
      .gain(0.2),
    note("<[e3,g3,b3] [a2,c3,e3] [b2,d3,fs3] [e3,g3,b3]>/4")
      .s("sawtooth").lpf(600).attack(0.05).release(0.3)
      .gain(0.22),
    note("e2 b1 e2 b1 a1 e2 b1 e2")
      .s("sine").gain(0.6).lpf(200),
    s("bd hh sd hh bd hh [sd hh] hh").gain(0.55),
    s("hh*16").gain(0.22)
  )],

  // III. Exfiltration (8 Zyklen) — b-Moll, Rückzug
  [8, stack(
    note("<b4 d5 fs5 e5 d5 cs5 b4 fs4>")
      .s("sawtooth").lpf(1200).attack(0.05).release(0.4)
      .room(0.4).delay(0.3).gain(0.35),
    note("b2 fs2 d2 fs2").s("sine").gain(0.5),
    s("bd ~ ~ ~ bd ~ ~ ~").gain(0.4),
    s("~ ~ hh ~ ~ ~ hh ~").gain(0.25),
    note("~ ~ ~ ~ ~ ~ ~ b1").s("square").lpf(300)
      .attack(0.5).release(2).room(0.8).gain(0.3)
  )]
).cpm(128)
`

/* ══════════════════════════════════════════════════════════
   Piece 05 — Sonntagmorgen
   ══════════════════════════════════════════════════════════ */

const SONNTAGMORGEN_CODE = `// =============================================
// "Sonntagmorgen"
// Drei stille Bilder eines freien Tages
// Composed by Claude (claude-opus-4-6) · curated by Arnold Wender
// https://live-music-coder.pro/
// =============================================

arrange(
  // I. Aufwachen (8 Zyklen) — D-Dur, sanft
  [8, stack(
    note("<d5 fs5 a5 fs5 d5 ~ ~ ~>")
      .s("sine").attack(0.8).release(2)
      .room(0.8).delay(0.5).delaytime(0.833)
      .gain(0.3),
    note("<[d4,fs4,a4] [g3,b3,d4]>/2")
      .s("triangle").attack(0.5).release(1.5)
      .room(0.7).gain(0.2)
  ).slow(2)],

  // II. Kaffee (12 Zyklen) — G-Dur, warm und gemütlich
  [12, stack(
    note("<g4 b4 d5 e5 d5 b4 a4 g4>")
      .s("sine").attack(0.2).release(0.8)
      .room(0.5).delay(0.3).gain(0.35),
    note("<[g3,b3,d4] [c3,e3,g3] [d3,fs3,a3] [g3,b3,d4]>")
      .s("triangle").attack(0.3).release(1)
      .gain(0.22).room(0.4),
    note("g2 d2 c2 d2").s("sine").gain(0.4),
    s("~ ~ hh ~ ~ ~ hh ~").gain(0.15)
  )],

  // III. Garten (10 Zyklen) — D-Dur, offen
  [10, stack(
    note("<d5 e5 fs5 a5 fs5 e5 d5 a4>")
      .s("sine").attack(0.3).release(1.2)
      .room(0.7).delay(0.4).delaytime(0.833).delayfeedback(0.4)
      .gain(0.35),
    note("<[d4,fs4,a4] [a3,cs4,e4] [g3,b3,d4] [d3,fs3,a3]>")
      .s("triangle").attack(0.4).release(1).gain(0.2),
    note("d2").s("sine").attack(1).release(3)
      .room(0.9).gain(0.3).slow(2)
  ).slow(2)]
).cpm(72)
`

/* ══════════════════════════════════════════════════════════
   Piece 06 — Deadline
   ══════════════════════════════════════════════════════════ */

const DEADLINE_CODE = `// =============================================
// "Deadline"
// Vier Akte gegen die Uhr
// Composed by Claude (claude-opus-4-6) · curated by Arnold Wender
// https://live-music-coder.pro/
// =============================================

arrange(
  // I. Tick (4 Zyklen) — fis-Moll, mechanisch
  [4, stack(
    note("fs3 fs3 fs3 fs3 fs3 fs3 fs3 fs3")
      .s("triangle").attack(0.01).release(0.08)
      .gain(0.35),
    s("hh*8").gain(0.3),
    note("~ ~ ~ ~ ~ ~ ~ fs2").s("sine")
      .attack(0.5).release(1).gain(0.4)
  )],

  // II. Panik (8 Zyklen) — fis-Moll, beschleunigend
  [8, stack(
    note("<fs4 a4 cs5 b4 a4 gs4 fs4 e4>")
      .s("sawtooth").lpf(1800).attack(0.02).release(0.2)
      .room(0.2).gain(0.35),
    note("<[fs3,a3,cs4] [d3,fs3,a3] [e3,gs3,b3] [fs3,a3,cs4]>/4")
      .s("triangle").attack(0.1).release(0.4).gain(0.25),
    note("fs2 cs2 d2 e2").s("sine").gain(0.55),
    s("bd hh sd hh bd hh sd [hh hh]").gain(0.5),
    s("hh*16").gain(0.2)
  )],

  // III. Tunnel (16 Zyklen) — e-Moll, hyperfokus
  [16, stack(
    note("<e5 g5 b5 a5 g5 fs5 e5 d5 e5 g5 b5 d6 c6 b5 a5 g5>")
      .s("triangle").attack(0.03).release(0.3)
      .room(0.3).gain(0.4),
    note("<g4 b4 e5 g5 e5 d5 b4 g4 b4 e5 g5 b5 a5 g5 fs5 e5>")
      .s("sine").room(0.4).gain(0.25),
    note("<[e3,g3,b3] [c3,e3,g3] [a2,c3,e3] [b2,d3,fs3]>/4")
      .s("sawtooth").lpf(1000).attack(0.1).gain(0.2),
    note("e2 b1 c2 b1 a1 e2 b1 e2")
      .s("sine").gain(0.6),
    s("bd ~ sd ~ bd ~ sd ~").gain(0.55),
    s("hh*16").gain(0.25)
  )],

  // IV. Abgabe (4 Zyklen) — E-Dur, Erleichterung
  [4, stack(
    note("<e5 gs5 b5 gs5>")
      .s("sine").attack(0.5).release(2)
      .room(0.8).delay(0.5).delayfeedback(0.5)
      .gain(0.4),
    note("<[e4,gs4,b4] [a3,cs4,e4]>")
      .s("triangle").attack(0.4).release(1.5)
      .room(0.7).gain(0.25),
    note("e2").s("sine").attack(1).release(3)
      .room(0.9).gain(0.35).slow(2)
  ).slow(2)]
).cpm(130)
`

/* ══════════════════════════════════════════════════════════
   Piece 07 — Gedankenpalast
   ══════════════════════════════════════════════════════════ */

const GEDANKENPALAST_CODE = `// =============================================
// "Gedankenpalast"
// Drei Räume aus Klang
// Composed by Claude (claude-opus-4-6) · curated by Arnold Wender
// https://live-music-coder.pro/
// =============================================

arrange(
  // I. Grundriss (8 Zyklen) — Des-Dur, weit, architektonisch
  [8, stack(
    note("db4").s("sine").attack(2).release(4)
      .room(0.95).delay(0.7).delaytime(0.75).delayfeedback(0.55)
      .gain(0.3),
    note("~ ~ ~ ab4").s("triangle").attack(1.5).release(3)
      .room(0.9).delay(0.6).gain(0.2),
    note("~ ~ ~ ~ ~ ~ db3 ~").s("sine")
      .attack(1).release(2).room(0.8).gain(0.25)
  ).slow(4)],

  // II. Räume (16 Zyklen) — Des-Dur, Struktur entsteht
  [16, stack(
    note("<db5 f5 ab5 gb5 f5 eb5 db5 ab4 db5 eb5 f5 ab5 gb5 f5 eb5 db5>")
      .s("sine").attack(0.2).release(1)
      .room(0.6).delay(0.4).delaytime(0.375)
      .gain(0.35),
    note("<ab4 db5 f5 ab5 f5 eb5 db5 ab4 db5 f5 ab5 db6 bb5 ab5 gb5 f5>")
      .s("triangle").room(0.5).delay(0.3).gain(0.22),
    note("<[db3,f3,ab3] [gb2,bb2,db3] [ab2,db3,f3] [eb3,gb3,bb3]>/4")
      .s("sine").attack(0.4).release(1).gain(0.2),
    note("db2 ab2 gb2 ab2").s("sine").gain(0.45),
    s("~ ~ hh ~ ~ ~ hh ~").gain(0.15)
  )],

  // III. Kuppel (10 Zyklen) — Ab-Dur, Überblick
  [10, stack(
    note("<ab5 c6 eb6 db6 c6 bb5 ab5 eb5>")
      .s("sine").attack(0.5).release(2)
      .room(0.9).delay(0.6).delaytime(0.75).delayfeedback(0.5)
      .gain(0.35),
    note("<[ab3,c4,eb4] [db3,f3,ab3] [eb3,g3,bb3] [ab3,c4,eb4]>")
      .s("triangle").attack(0.5).release(1.5)
      .room(0.7).gain(0.2),
    note("ab1").s("sine").attack(2).release(5)
      .room(0.95).gain(0.3).slow(5)
  ).slow(2)]
).cpm(80)
`

/* ══════════════════════════════════════════════════════════
   Piece 08 — Endlosschleife
   ══════════════════════════════════════════════════════════ */

const ENDLOSSCHLEIFE_CODE = `// =============================================
// "Endlosschleife"
// Ein Stück ohne Anfang und Ende
// Composed by Claude (claude-opus-4-6) · curated by Arnold Wender
// https://live-music-coder.pro/
// =============================================

// Kein arrange() — ein einziger endloser Zustand in h-Moll

stack(
  note("<b4 d5 fs5 e5 d5 cs5 b4 fs4>")
    .s("triangle").attack(0.08).release(0.4)
    .room(0.4).delay(0.25).delaytime(0.254)
    .gain(0.38),
  note("<fs4 b4 d5 fs5 d5 cs5 b4 fs4>")
    .s("sine").room(0.5).delay(0.2).gain(0.22),
  note("<[b3,d4,fs4] [e3,g3,b3] [fs3,a3,cs4] [b3,d4,fs4]>/4")
    .s("sine").attack(0.3).release(0.8).gain(0.2),
  note("b2 fs2 e2 fs2 g2 fs2 e2 fs2")
    .s("sine").gain(0.5).lpf(250),
  s("bd ~ hh sd bd ~ hh sd").gain(0.45),
  s("hh*8").gain(0.15),
  note("~ ~ ~ ~ ~ ~ ~ b1").s("triangle")
    .attack(1).release(3).room(0.8)
    .gain(sine.range(0.1, 0.3).slow(32))
).cpm(118)
`

/* ══════════════════════════════════════════════════════════
   Piece 09 — Kaffee und Compiler
   ══════════════════════════════════════════════════════════ */

const KAFFEE_UND_COMPILER_CODE = `// =============================================
// "Kaffee und Compiler"
// Drei Phasen eines guten Morgens
// Composed by Claude (claude-opus-4-6) · curated by Arnold Wender
// https://live-music-coder.pro/
// =============================================

arrange(
  // I. Erste Tasse (8 Zyklen) — A-Dur, Energie kommt
  [8, stack(
    note("<a4 cs5 e5 d5 cs5 b4 a4 e4>")
      .s("sine").attack(0.15).release(0.5)
      .room(0.4).gain(0.35),
    note("<[a3,cs4,e4] [d3,fs3,a3] [e3,gs3,b3] [a3,cs4,e4]>")
      .s("triangle").attack(0.2).release(0.6).gain(0.22),
    note("a2 e2 d2 e2").s("sine").gain(0.5),
    s("bd ~ hh ~ bd ~ hh ~").gain(0.4),
    s("~ ~ ~ hh ~ ~ ~ hh").gain(0.15)
  )],

  // II. Build (16 Zyklen) — E-Dur, im Schwung
  [16, stack(
    note("<e5 gs5 b5 a5 gs5 fs5 e5 b4 e5 fs5 gs5 b5 a5 gs5 fs5 e5>")
      .s("triangle").attack(0.05).release(0.35)
      .room(0.35).delay(0.2).gain(0.4),
    note("<gs4 b4 e5 gs5 e5 ds5 cs5 b4 e5 gs5 b5 e6 ds6 cs6 b5 gs5>")
      .s("sine").room(0.4).gain(0.25),
    note("<[e3,gs3,b3] [a2,cs3,e3] [b2,ds3,fs3] [e3,gs3,b3]>/4")
      .s("sawtooth").lpf(1000).attack(0.1).release(0.4).gain(0.2),
    note("e2 b1 a1 b1 e2 b1 cs2 b1")
      .s("sine").gain(0.55),
    s("bd ~ hh sd bd hh sd hh").gain(0.5),
    s("hh*8").gain(0.18)
  )],

  // III. Grün (6 Zyklen) — A-Dur, alles kompiliert
  [6, stack(
    note("<a5 cs6 e6 cs6 a5 e5>")
      .s("sine").attack(0.3).release(1)
      .room(0.6).delay(0.4).delayfeedback(0.4)
      .gain(0.38),
    note("<[a4,cs5,e5] [d4,fs4,a4] [e4,gs4,b4] [a3,cs4,e4]>")
      .s("triangle").attack(0.3).release(0.8).gain(0.22),
    note("a2 e2 d2 e2 a1 e2").s("sine").gain(0.45),
    s("bd ~ hh ~ bd ~ hh ~").gain(0.35)
  )]
).cpm(105)
`

/* ══════════════════════════════════════════════════════════
   Piece 10 — Regen am Fenster
   ══════════════════════════════════════════════════════════ */

const REGEN_AM_FENSTER_CODE = `// =============================================
// "Regen am Fenster"
// Drei Bilder eines grauen Tages
// Composed by Claude (claude-opus-4-6) · curated by Arnold Wender
// https://live-music-coder.pro/
// =============================================

arrange(
  // I. Tropfen (10 Zyklen) — f-Moll, vereinzelte Tropfen
  [10, stack(
    note("f4 ~ ~ ~ ab4 ~ ~ ~")
      .s("sine").attack(0.01).release(1.5)
      .room(0.95).delay(0.7).delaytime(0.882).delayfeedback(0.6)
      .gain(0.25),
    note("~ ~ c4 ~ ~ ~ ~ eb4")
      .s("triangle").attack(0.01).release(1)
      .room(0.9).delay(0.6).gain(0.18),
    note("f2").s("sine").attack(3).release(5)
      .room(0.95).gain(0.2).slow(5)
  ).slow(2)],

  // II. Wolken (16 Zyklen) — f-Moll/Db-Dur, dicht
  [16, stack(
    note("<f5 ab5 c6 bb5 ab5 g5 f5 c5 f5 ab5 c6 eb6 db6 c6 bb5 ab5>")
      .s("sine").attack(0.15).release(0.8)
      .room(0.7).delay(0.5).delaytime(0.441).delayfeedback(0.45)
      .gain(0.32),
    note("<ab4 c5 f5 ab5 f5 eb5 db5 c5 f5 ab5 c6 f6 eb6 db6 c6 ab5>")
      .s("triangle").room(0.6).delay(0.4).gain(0.2),
    note("<[f3,ab3,c4] [db3,f3,ab3] [eb3,g3,bb3] [c3,e3,g3]>/4")
      .s("sine").attack(0.3).release(1).gain(0.18),
    note("f2 c2 db2 c2").s("sine").gain(0.4),
    s("~ ~ hh ~ ~ hh ~ ~").gain(0.12)
  )],

  // III. Aufklaren (8 Zyklen) — Db-Dur, sanftes Licht
  [8, stack(
    note("<db5 f5 ab5 f5 db5 c5 ab4 db5>")
      .s("sine").attack(0.5).release(2)
      .room(0.9).delay(0.6).delaytime(0.882).delayfeedback(0.5)
      .gain(0.35),
    note("<[db4,f4,ab4] [ab3,c4,eb4] [bb3,db4,f4] [db3,f3,ab3]>")
      .s("triangle").attack(0.5).release(1.5)
      .room(0.8).gain(0.2),
    note("db2").s("sine").attack(2).release(4)
      .room(0.95).gain(0.25).slow(4)
  ).slow(2)]
).cpm(68)
`

/* ══════════════════════════════════════════════════════════
   Piece 11 — Terminal Meditation
   ══════════════════════════════════════════════════════════ */

const TERMINAL_MEDITATION_CODE = `// =============================================
// "Terminal Meditation"
// Zwei Atemzüge in der Stille
// Composed by Claude (claude-opus-4-6) · curated by Arnold Wender
// https://live-music-coder.pro/
// =============================================

arrange(
  // I. Einatmen (16 Zyklen) — c-Moll, Weite
  [16, stack(
    note("<c4 eb4 g4 bb4 g4 eb4 c4 g3>")
      .s("sine").attack(1).release(3)
      .room(0.95).delay(0.7).delaytime(1).delayfeedback(0.5)
      .gain(0.3),
    note("<eb3 g3 c4 eb4 c4 g3 eb3 c3>")
      .s("triangle").attack(1.5).release(3)
      .room(0.9).delay(0.6).gain(0.18),
    note("c2").s("sine").attack(3).release(5)
      .room(0.95).gain(0.2).slow(4)
  ).slow(4)],

  // II. Ausatmen (16 Zyklen) — Eb-Dur, Auflösung
  [16, stack(
    note("<eb4 g4 bb4 c5 bb4 ab4 g4 eb4>")
      .s("sine").attack(1.5).release(4)
      .room(0.95).delay(0.7).delaytime(1).delayfeedback(0.55)
      .gain(0.28),
    note("<g3 bb3 eb4 g4 eb4 bb3 g3 eb3>")
      .s("triangle").attack(2).release(4)
      .room(0.9).delay(0.6).gain(0.15),
    note("eb2").s("sine").attack(3).release(6)
      .room(0.95).gain(0.2).slow(8),
    note("~ ~ ~ ~ ~ ~ ~ bb1")
      .s("sine").attack(2).release(5)
      .room(0.95).gain(0.12).slow(4)
  ).slow(4)]
).cpm(60)
`

/* ══════════════════════════════════════════════════════════
   Piece 12 — Paarflug
   ══════════════════════════════════════════════════════════ */

const PAARFLUG_CODE = `// =============================================
// "Paarflug"
// Zwei Stimmen, ein Ziel
// Composed by Claude (claude-opus-4-6) · curated by Arnold Wender
// https://live-music-coder.pro/
// =============================================

arrange(
  // I. Handshake (4 Zyklen) — C-Dur, zwei Stimmen finden sich
  [4, stack(
    note("c5 ~ ~ ~ ~ ~ ~ ~").s("sine")
      .attack(0.3).release(1).room(0.5).gain(0.35),
    note("~ ~ ~ ~ g4 ~ ~ ~").s("triangle")
      .attack(0.3).release(1).room(0.5).gain(0.35)
  ).slow(2)],

  // II. Dialog (16 Zyklen) — G-Dur, Call and Response
  [16, stack(
    note("<g4 b4 d5 ~ ~ ~ a4 ~>")
      .s("sine").attack(0.1).release(0.5)
      .room(0.4).gain(0.38),
    note("<~ ~ ~ d5 b4 g4 ~ c5>")
      .s("triangle").attack(0.1).release(0.5)
      .room(0.4).gain(0.35),
    note("<[g3,b3,d4] [c3,e3,g3] [d3,fs3,a3] [g3,b3,d4]>")
      .s("sine").attack(0.3).release(0.8).gain(0.2),
    note("g2 d2 c2 d2").s("sine").gain(0.45),
    s("bd ~ hh ~ bd ~ hh ~").gain(0.4),
    s("~ ~ ~ hh ~ ~ ~ hh").gain(0.12)
  )],

  // III. Sync (12 Zyklen) — C-Dur, parallel
  [12, stack(
    note("<c5 e5 g5 f5 e5 d5 c5 g4 c5 d5 e5 g5>")
      .s("sine").attack(0.08).release(0.4)
      .room(0.4).delay(0.2).gain(0.38),
    note("<e4 g4 c5 e5 c5 b4 g4 e4 g4 b4 c5 e5>")
      .s("triangle").attack(0.08).release(0.4)
      .room(0.4).delay(0.2).gain(0.3),
    note("<[c3,e3,g3] [f2,a2,c3] [g2,b2,d3] [c3,e3,g3]>/4")
      .s("sine").attack(0.2).release(0.6).gain(0.2),
    note("c2 g2 f2 g2").s("sine").gain(0.5),
    s("bd ~ hh sd bd ~ hh sd").gain(0.45),
    s("hh*8").gain(0.15)
  )],

  // IV. Merge (6 Zyklen) — C-Dur, Unison
  [6, stack(
    note("<c5 e5 g5 e5 c5 g4>")
      .s("sine").attack(0.2).release(0.8)
      .room(0.6).delay(0.4).delayfeedback(0.4).gain(0.35),
    note("<c5 e5 g5 e5 c5 g4>")
      .s("triangle").attack(0.2).release(0.8)
      .room(0.6).delay(0.4).delayfeedback(0.4).gain(0.3),
    note("c2").s("sine").attack(1).release(3)
      .room(0.8).gain(0.35).slow(3)
  )]
).cpm(100)
`

/* ══════════════════════════════════════════════════════════
   Piece 13 — Bugsuche
   ══════════════════════════════════════════════════════════ */

const BUGSUCHE_CODE = `// =============================================
// "Bugsuche"
// Vier Schritte zur Wahrheit
// Composed by Claude (claude-opus-4-6) · curated by Arnold Wender
// https://live-music-coder.pro/
// =============================================

arrange(
  // I. Symptom (6 Zyklen) — c-Moll, etwas stimmt nicht
  [6, stack(
    note("c4 ~ eb4 ~ ~ g3 ~ ~")
      .s("sine").attack(0.05).release(0.8)
      .room(0.6).delay(0.5).delaytime(0.545)
      .gain(0.3),
    note("~ ~ ~ ~ c3 ~ ~ ~").s("triangle")
      .attack(0.5).release(1.5).room(0.7).gain(0.2),
    s("~ ~ hh ~ ~ ~ ~ hh").gain(0.12)
  ).slow(2)],

  // II. Hypothese (8 Zyklen) — g-Moll, systematisch
  [8, stack(
    note("<g4 bb4 d5 c5 bb4 a4 g4 d4>")
      .s("triangle").attack(0.05).release(0.35)
      .room(0.35).gain(0.35),
    note("<[g3,bb3,d4] [eb3,g3,bb3] [f3,a3,c4] [d3,f3,a3]>/4")
      .s("sine").attack(0.2).release(0.5).gain(0.22),
    note("g2 d2 eb2 d2").s("sine").gain(0.48),
    s("bd ~ hh ~ bd ~ hh ~").gain(0.4),
    s("hh*8").gain(0.12)
  )],

  // III. Breakpoint (12 Zyklen) — c-Moll, Spannung
  [12, stack(
    note("<c5 eb5 g5 f5 eb5 d5 c5 g4 c5 eb5 g5 bb5>")
      .s("sawtooth").lpf(1400).attack(0.03).release(0.25)
      .room(0.3).gain(0.35),
    note("<eb4 g4 c5 eb5 c5 bb4 g4 eb4 g4 c5 eb5 g5>")
      .s("triangle").room(0.4).gain(0.22),
    note("c2 g2 eb2 g2 f2 g2 ab2 g2 c2 g2 bb1 g2")
      .s("sine").gain(0.55),
    s("bd ~ hh sd bd hh sd hh").gain(0.5),
    s("hh*16").gain(0.18)
  )],

  // IV. Fix (6 Zyklen) — C-Dur, Erkenntnis
  [6, stack(
    note("<c5 e5 g5 e5 c5 g4>")
      .s("sine").attack(0.2).release(1)
      .room(0.6).delay(0.4).delayfeedback(0.4)
      .gain(0.4),
    note("<[c4,e4,g4] [f3,a3,c4] [g3,b3,d4] [c3,e3,g3]>")
      .s("triangle").attack(0.3).release(0.8).gain(0.22),
    note("c2 g2 f2 g2 c2 g2").s("sine").gain(0.45),
    s("bd ~ hh ~ bd ~ hh ~").gain(0.35)
  )]
).cpm(92)
`

/* ══════════════════════════════════════════════════════════
   Piece 14 — Erste Zeile
   ══════════════════════════════════════════════════════════ */

const ERSTE_ZEILE_CODE = `// =============================================
// "Erste Zeile"
// Der Anfang von allem
// Composed by Claude (claude-opus-4-6) · curated by Arnold Wender
// https://live-music-coder.pro/
// =============================================

arrange(
  // I. Cursor (6 Zyklen) — F-Dur, der blinkende Strich
  [6, stack(
    note("f4 ~ ~ ~ ~ ~ ~ ~")
      .s("sine").attack(0.01).release(0.5)
      .room(0.7).gain(0.3),
    note("~ ~ ~ ~ f4 ~ ~ ~")
      .s("sine").attack(0.01).release(0.5)
      .room(0.7).gain(0.25),
    note("f2").s("sine").attack(2).release(4)
      .room(0.9).gain(0.2).slow(6)
  ).slow(2)],

  // II. Tippen (12 Zyklen) — F-Dur, zaghaft
  [12, stack(
    note("<f4 a4 c5 bb4 a4 g4 f4 c4>")
      .s("sine").attack(0.1).release(0.5)
      .room(0.45).gain(0.35),
    note("<[f3,a3,c4] [bb2,d3,f3] [c3,e3,g3] [f3,a3,c4]>")
      .s("triangle").attack(0.25).release(0.7).gain(0.2),
    note("f2 c2 bb1 c2").s("sine").gain(0.45),
    s("~ ~ hh ~ ~ ~ hh ~").gain(0.18),
    s("bd ~ ~ ~ bd ~ ~ ~").gain(0.3)
  )],

  // III. Laufen (10 Zyklen) — Bb-Dur, es funktioniert
  [10, stack(
    note("<bb4 d5 f5 eb5 d5 c5 bb4 f4 bb4 d5>")
      .s("sine").attack(0.08).release(0.4)
      .room(0.4).delay(0.25).gain(0.38),
    note("<d4 f4 bb4 d5 bb4 a4 f4 d4 f4 bb4>")
      .s("triangle").room(0.4).gain(0.25),
    note("<[bb2,d3,f3] [eb2,g2,bb2] [f2,a2,c3] [bb2,d3,f3]>/4")
      .s("sine").attack(0.2).release(0.5).gain(0.2),
    note("bb1 f2 eb2 f2").s("sine").gain(0.5),
    s("bd ~ hh sd bd ~ hh sd").gain(0.45),
    s("hh*8").gain(0.15)
  )],

  // IV. Hello World (4 Zyklen) — F-Dur, Stolz
  [4, stack(
    note("<f5 a5 c6 a5>")
      .s("sine").attack(0.3).release(1.5)
      .room(0.7).delay(0.5).delayfeedback(0.45)
      .gain(0.4),
    note("<[f4,a4,c5] [bb3,d4,f4] [c4,e4,g4] [f3,a3,c4]>")
      .s("triangle").attack(0.4).release(1).gain(0.22),
    note("f2").s("sine").attack(1).release(3)
      .room(0.9).gain(0.3).slow(2)
  )]
).cpm(85)
`

/* ══════════════════════════════════════════════════════════
   Piece 15 — Brainstorm
   ══════════════════════════════════════════════════════════ */

const BRAINSTORM_CODE = `// =============================================
// "Brainstorm"
// Geordnetes Chaos in drei Wellen
// Composed by Claude (claude-opus-4-6) · curated by Arnold Wender
// https://live-music-coder.pro/
// =============================================

arrange(
  // I. Funken (8 Zyklen) — D-Dur, schnelle Ideen
  [8, stack(
    note("<d5 fs5 a5 ~ g5 ~ e5 ~>")
      .s("triangle").attack(0.02).release(0.25)
      .room(0.3).gain(0.35),
    note("<~ ~ ~ a5 ~ b5 ~ d6>")
      .s("sine").attack(0.02).release(0.3)
      .room(0.4).delay(0.3).gain(0.28),
    note("d3 a2 g2 a2").s("sine").gain(0.45),
    s("bd hh ~ hh bd hh ~ hh").gain(0.4),
    s("~ ~ sd ~ ~ ~ sd ~").gain(0.35)
  )],

  // II. Wirbel (16 Zyklen) — G-Dur, alles gleichzeitig
  [16, stack(
    note("<g5 b5 d6 c6 b5 a5 g5 d5 g5 a5 b5 d6 e6 d6 c6 b5>")
      .s("triangle").attack(0.03).release(0.3)
      .room(0.3).delay(0.15).gain(0.38),
    note("<b4 d5 g5 b5 g5 fs5 e5 d5 g5 b5 d6 g6 fs6 e6 d6 b5>")
      .s("sine").room(0.35).gain(0.25),
    note("<d4 fs4 a4 ~ g4 ~ e4 ~>")
      .s("sawtooth").lpf(1200).attack(0.02).release(0.2)
      .gain(0.18),
    note("<[g3,b3,d4] [c3,e3,g3] [d3,fs3,a3] [e3,g3,b3]>/4")
      .s("sine").attack(0.15).release(0.5).gain(0.2),
    note("g2 d2 c2 d2 e2 d2 c2 d2")
      .s("sine").gain(0.5),
    s("bd hh sd hh bd [hh hh] sd hh").gain(0.5),
    s("hh*16").gain(0.2)
  )],

  // III. Kristall (8 Zyklen) — D-Dur, die beste Idee bleibt
  [8, stack(
    note("<d5 fs5 a5 fs5 d5 a4 fs4 d4>")
      .s("sine").attack(0.15).release(0.8)
      .room(0.5).delay(0.35).delayfeedback(0.4)
      .gain(0.4),
    note("<[d4,fs4,a4] [g3,b3,d4] [a3,cs4,e4] [d3,fs3,a3]>")
      .s("triangle").attack(0.3).release(0.8).gain(0.22),
    note("d2 a2 g2 a2").s("sine").gain(0.48),
    s("bd ~ hh ~ bd ~ hh ~").gain(0.4)
  )]
).cpm(115)
`

/* ══════════════════════════════════════════════════════════
   Piece 16 — Lo-Fi Bibliothek
   ══════════════════════════════════════════════════════════ */

const LOFI_BIBLIOTHEK_CODE = `// =============================================
// "Lo-Fi Bibliothek"
// Studieren zwischen Bücherregalen
// Composed by Claude (claude-opus-4-6) · curated by Arnold Wender
// https://live-music-coder.pro/
// =============================================

// Kein arrange() — ein endloser Lo-Fi-Loop in Eb-Dur

stack(
  note("<eb4 g4 bb4 ab4 g4 f4 eb4 bb3>")
    .s("sine").attack(0.15).release(0.6)
    .room(0.5).delay(0.3).delaytime(0.384)
    .gain(0.35),
  note("<g3 bb3 eb4 g4 eb4 d4 c4 bb3>")
    .s("triangle").room(0.45).delay(0.2).gain(0.22),
  note("<[eb3,g3,bb3] [ab2,c3,eb3] [bb2,d3,f3] [eb3,g3,bb3]>/4")
    .s("sine").attack(0.3).release(0.8)
    .lpf(2000).gain(0.2),
  note("eb2 bb1 ab1 bb1").s("sine")
    .gain(0.45).lpf(300),
  s("bd ~ [~ hh] sd bd ~ hh sd").gain(0.4),
  s("~ hh ~ ~ ~ hh ~ ~").gain(0.1),
  note("~ ~ ~ ~ ~ ~ ~ eb1").s("sine")
    .attack(1).release(2).room(0.7)
    .gain(sine.range(0.05, 0.2).slow(16))
).cpm(78)
`

/* ══════════════════════════════════════════════════════════
   Piece 17 — Maschinenraum
   ══════════════════════════════════════════════════════════ */

const MASCHINENRAUM_CODE = `// =============================================
// "Maschinenraum"
// Reiner Antrieb bei 140 BPM
// Composed by Claude (claude-opus-4-6) · curated by Arnold Wender
// https://live-music-coder.pro/
// =============================================

arrange(
  // I. Zündung (4 Zyklen) — a-Moll, Kick startet
  [4, stack(
    s("bd bd bd bd bd bd bd bd").gain(0.55),
    s("~ ~ hh ~ ~ ~ hh ~").gain(0.2),
    note("a1").s("sine").gain(0.5).lpf(150)
  )],

  // II. Volldampf (24 Zyklen) — a-Moll, unaufhaltsam
  [24, stack(
    note("<a4 c5 e5 d5 c5 b4 a4 e4>")
      .s("sawtooth").lpf(2500).attack(0.01).release(0.15)
      .room(0.15).gain(0.32),
    note("<c4 e4 a4 c5 a4 g4 e4 c4>")
      .s("square").lpf(1800).attack(0.01).release(0.12)
      .gain(0.2),
    note("<[a2,c3,e3] [f2,a2,c3] [g2,b2,d3] [a2,c3,e3]>/4")
      .s("sawtooth").lpf(500).attack(0.02).release(0.2)
      .gain(0.25),
    note("a1 e1 a1 e1 f1 e1 g1 e1")
      .s("sine").gain(0.6).lpf(200),
    s("bd ~ bd ~ bd ~ bd ~").gain(0.55),
    s("~ ~ ~ ~ sd ~ ~ ~").gain(0.5),
    s("hh*16").gain(0.25),
    s("~ ~ ~ ~ ~ ~ ~ [hh hh hh hh]").gain(0.15)
  )],

  // III. Auslauf (4 Zyklen) — a-Moll, Maschine stoppt
  [4, stack(
    note("a3").s("sawtooth").lpf(800)
      .attack(0.5).release(3).room(0.6).gain(0.3),
    s("bd ~ ~ ~ bd ~ ~ ~").gain(0.4),
    note("a1").s("sine").attack(1).release(4)
      .room(0.8).gain(0.35)
  )]
).cpm(140)
`

/* ══════════════════════════════════════════════════════════
   Piece 18 — Nachtcafé
   ══════════════════════════════════════════════════════════ */

const NACHTCAFE_CODE = `// =============================================
// "Nachtcafé"
// Jazz nach Mitternacht
// Composed by Claude (claude-opus-4-6) · curated by Arnold Wender
// https://live-music-coder.pro/
// =============================================

arrange(
  // I. Betreten (6 Zyklen) — Dm7, Rauch und gedämpftes Licht
  [6, stack(
    note("<d4 f4 a4 c5 a4 f4>")
      .s("sine").attack(0.2).release(1)
      .room(0.6).delay(0.4).delaytime(0.666)
      .gain(0.3),
    note("<[d3,f3,a3,c4]>/1")
      .s("triangle").attack(0.5).release(2)
      .room(0.5).gain(0.18)
  ).slow(2)],

  // II. Gespräche (16 Zyklen) — Swing-Feeling in d-Moll
  [16, stack(
    note("<d5 ~ f5 ~ a5 g5 ~ e5 d5 ~ c5 ~ a4 bb4 ~ d5>")
      .s("sine").attack(0.08).release(0.6)
      .room(0.5).delay(0.3).delaytime(0.333)
      .gain(0.35),
    note("<f4 ~ a4 ~ c5 bb4 ~ g4 f4 ~ e4 ~ c4 d4 ~ f4>")
      .s("triangle").room(0.45).delay(0.2).gain(0.22),
    note("<[d3,f3,a3,c4] [g2,bb2,d3,f3] [a2,c3,e3,g3] [bb2,d3,f3,a3]>/4")
      .s("sine").attack(0.3).release(1).gain(0.2),
    note("d2 a2 g2 a2 bb2 a2 g2 a2")
      .s("sine").gain(0.4),
    s("~ ~ hh ~ ~ hh ~ hh").gain(0.18),
    s("bd ~ ~ ~ bd ~ ~ ~").gain(0.3)
  )],

  // III. Letzter Schluck (8 Zyklen) — F-Dur, warm
  [8, stack(
    note("<f5 a5 c6 bb5 a5 g5 f5 c5>")
      .s("sine").attack(0.2).release(1.2)
      .room(0.7).delay(0.5).delaytime(0.666).delayfeedback(0.45)
      .gain(0.35),
    note("<[f3,a3,c4,e4] [bb2,d3,f3,a3] [c3,e3,g3,bb3] [f3,a3,c4]>")
      .s("triangle").attack(0.4).release(1.2)
      .room(0.6).gain(0.2),
    note("f2 c2 bb1 c2").s("sine").gain(0.4),
    s("~ ~ hh ~ ~ ~ hh ~").gain(0.12)
  )]
).cpm(90)
`

/* ══════════════════════════════════════════════════════════
   Piece 19 — Pixelwald
   ══════════════════════════════════════════════════════════ */

const PIXELWALD_CODE = `// =============================================
// "Pixelwald"
// 8-Bit Nostalgie in drei Leveln
// Composed by Claude (claude-opus-4-6) · curated by Arnold Wender
// https://live-music-coder.pro/
// =============================================

arrange(
  // I. Titelbildschirm (6 Zyklen) — C-Dur, Chiptune-Intro
  [6, stack(
    note("<c5 e5 g5 e5 c5 g4>")
      .s("square").lpf(3000).attack(0.01).release(0.2)
      .gain(0.3),
    note("<[c4,e4,g4] [f3,a3,c4] [g3,b3,d4] [c4,e4,g4]>")
      .s("square").lpf(2000).attack(0.01).release(0.3)
      .gain(0.18),
    note("c3 g2 f2 g2 c3 g2").s("square").lpf(800)
      .attack(0.01).release(0.1).gain(0.35)
  )],

  // II. Level 1 (16 Zyklen) — G-Dur, Abenteuer
  [16, stack(
    note("<g5 b5 d6 c6 b5 a5 g5 d5 g5 a5 b5 d6 e6 d6 c6 b5>")
      .s("square").lpf(4000).attack(0.01).release(0.15)
      .gain(0.32),
    note("<b4 d5 g5 b5 g5 fs5 e5 b4 d5 fs5 g5 b5 c6 b5 a5 g5>")
      .s("square").lpf(3000).attack(0.01).release(0.12)
      .gain(0.2),
    note("<[g3,b3,d4] [c3,e3,g3] [d3,fs3,a3] [g3,b3,d4]>/4")
      .s("square").lpf(1500).attack(0.01).release(0.2)
      .gain(0.2),
    note("g2 d2 c2 d2 g2 d2 e2 d2")
      .s("square").lpf(600).attack(0.01).release(0.08)
      .gain(0.4),
    s("bd ~ hh sd bd hh sd hh").gain(0.45),
    s("hh*8").gain(0.15)
  )],

  // III. Highscore (8 Zyklen) — C-Dur, Triumph
  [8, stack(
    note("<c6 e6 g6 e6 c6 g5 e5 c5>")
      .s("square").lpf(5000).attack(0.01).release(0.3)
      .room(0.3).gain(0.32),
    note("<e5 g5 c6 e6 c6 b5 g5 e5>")
      .s("square").lpf(3500).attack(0.01).release(0.2)
      .gain(0.2),
    note("c3 g2 f2 g2 c3 e3 g3 c3")
      .s("square").lpf(800).attack(0.01).release(0.08)
      .gain(0.38),
    s("bd hh sd hh bd [hh hh] sd hh").gain(0.5)
  )]
).cpm(108)
`

/* ══════════════════════════════════════════════════════════
   Piece 20 — Waldlichtung
   ══════════════════════════════════════════════════════════ */

const WALDLICHTUNG_CODE = `// =============================================
// "Waldlichtung"
// Coden unter freiem Himmel
// Composed by Claude (claude-opus-4-6) · curated by Arnold Wender
// https://live-music-coder.pro/
// =============================================

arrange(
  // I. Pfad (8 Zyklen) — E-Dur, durch die Bäume
  [8, stack(
    note("<e4 gs4 b4 gs4 e4 ~ ~ ~>")
      .s("sine").attack(0.5).release(2)
      .room(0.8).delay(0.5).delaytime(0.8)
      .gain(0.28),
    note("~ ~ ~ ~ ~ b3 ~ ~")
      .s("triangle").attack(0.8).release(2)
      .room(0.85).delay(0.6).gain(0.18),
    note("e2").s("sine").attack(2).release(4)
      .room(0.9).gain(0.2).slow(4)
  ).slow(2)],

  // II. Lichtung (16 Zyklen) — A-Dur, offen und hell
  [16, stack(
    note("<a4 cs5 e5 d5 cs5 b4 a4 e4 a4 b4 cs5 e5 fs5 e5 d5 cs5>")
      .s("sine").attack(0.12).release(0.7)
      .room(0.55).delay(0.3).gain(0.36),
    note("<cs4 e4 a4 cs5 a4 gs4 e4 cs4 e4 gs4 a4 cs5 d5 cs5 b4 a4>")
      .s("triangle").room(0.5).gain(0.22),
    note("<[a3,cs4,e4] [d3,fs3,a3] [e3,gs3,b3] [a3,cs4,e4]>")
      .s("sine").attack(0.3).release(0.8).gain(0.18),
    note("a2 e2 d2 e2").s("sine").gain(0.42),
    s("~ ~ hh ~ ~ ~ hh ~").gain(0.12)
  )],

  // III. Dämmerung (10 Zyklen) — E-Dur, Rückweg
  [10, stack(
    note("<e5 gs5 b5 gs5 e5 b4 gs4 e4 gs4 b4>")
      .s("sine").attack(0.4).release(1.5)
      .room(0.8).delay(0.5).delaytime(0.8).delayfeedback(0.5)
      .gain(0.33),
    note("<[e4,gs4,b4] [a3,cs4,e4] [b3,ds4,fs4] [e3,gs3,b3]>")
      .s("triangle").attack(0.5).release(1.2)
      .room(0.7).gain(0.18),
    note("e2").s("sine").attack(2).release(5)
      .room(0.95).gain(0.25).slow(5)
  ).slow(2)]
).cpm(75)
`

/* ══════════════════════════════════════════════════════════
   Piece 21 — Deploy
   ══════════════════════════════════════════════════════════ */

const DEPLOY_CODE = `// =============================================
// "Deploy"
// Vier Akte des Auslieferns
// Composed by Claude (claude-opus-4-6) · curated by Arnold Wender
// https://live-music-coder.pro/
// =============================================

arrange(
  // I. git push (4 Zyklen) — G-Dur, Nervosität
  [4, stack(
    note("g4 b4 d5 b4 g4 d4 b3 g3")
      .s("triangle").attack(0.03).release(0.2)
      .room(0.3).gain(0.35),
    s("bd hh sd hh bd hh sd hh").gain(0.45),
    note("g2 d2 g2 d2").s("sine").gain(0.5)
  )],

  // II. Pipeline (8 Zyklen) — G-Dur, der Build läuft
  [8, stack(
    note("<g4 a4 b4 d5 b4 a4 g4 d4>")
      .s("sawtooth").lpf(1500).attack(0.02).release(0.2)
      .room(0.25).gain(0.3),
    note("<b3 d4 g4 b4 g4 fs4 e4 d4>")
      .s("square").lpf(1200).attack(0.02).release(0.15)
      .gain(0.2),
    note("g2 d2 c2 d2").s("sine").gain(0.5),
    s("bd ~ hh sd bd hh [sd hh] hh").gain(0.5),
    s("hh*16").gain(0.2)
  )],

  // III. Grünes Licht (8 Zyklen) — D-Dur, alles passt
  [8, stack(
    note("<d5 fs5 a5 g5 fs5 e5 d5 a4>")
      .s("sine").attack(0.08).release(0.5)
      .room(0.4).delay(0.25).gain(0.4),
    note("<fs4 a4 d5 fs5 d5 cs5 a4 fs4>")
      .s("triangle").room(0.4).gain(0.28),
    note("<[d3,fs3,a3] [g2,b2,d3] [a2,cs3,e3] [d3,fs3,a3]>/4")
      .s("sine").attack(0.15).release(0.5).gain(0.2),
    note("d2 a1 g1 a1").s("sine").gain(0.55),
    s("bd ~ hh sd bd hh sd hh").gain(0.5),
    s("hh*8").gain(0.18)
  )],

  // IV. Live (8 Zyklen) — G-Dur, Triumph
  [8, stack(
    note("<g5 b5 d6 b5 g5 d5 b4 g4>")
      .s("sine").attack(0.15).release(0.8)
      .room(0.6).delay(0.4).delayfeedback(0.45)
      .gain(0.42),
    note("<b4 d5 g5 b5 g5 fs5 d5 b4>")
      .s("triangle").room(0.5).delay(0.3).gain(0.28),
    note("<[g3,b3,d4] [c3,e3,g3] [d3,fs3,a3] [g3,b3,d4]>")
      .s("sine").attack(0.2).release(0.6).gain(0.22),
    note("g2 d2 c2 d2 g2 d2 e2 d2")
      .s("sine").gain(0.55),
    s("bd hh sd hh bd [hh hh] sd hh").gain(0.55),
    s("hh*16").gain(0.22)
  )]
).cpm(125)
`

/* ══════════════════════════════════════════════════════════
   Piece 22 — Tiefenrausch
   ══════════════════════════════════════════════════════════ */

const TIEFENRAUSCH_CODE = `// =============================================
// "Tiefenrausch"
// Deep Trance in drei Wellen
// Composed by Claude (claude-opus-4-6) · curated by Arnold Wender
// https://live-music-coder.pro/
// =============================================

arrange(
  // ── I. Intro (8 Zyklen) ──────────────────────────
  // Kick etabliert den Puls, gefilterte Bassline steigt langsam auf
  [8, stack(
    // Sub-Bass: rollende 16tel auf dem Grundton, tief unter 200 Hz
    note("a1 a1 a1 a1 a1 a1 a1 a1")
      .s("sawtooth").lpf(200).gain(0.6),
    // Pad: Am-Akkord, langsam anschwellend, viel Hall
    note("[a3,c4,e4]")
      .s("sine").attack(2).release(4)
      .room(0.7).gain(sine.range(0.05, 0.25).slow(8)),
    // Kick: Four-on-the-Floor, das Fundament
    s("bd bd bd bd").gain(0.55),
    // Hi-Hat: Off-Beat, klassisches Trance-Pattern
    s("~ hh ~ hh ~ hh ~ hh").gain(0.2)
  )],

  // ── II. Aufstieg (24 Zyklen) ─────────────────────
  // Volle Trance-Produktion: rollende Bassline mit Filter-Sweep,
  // Arpeggio-Lead mit Delay, breite Pad-Fläche
  [24, stack(
    // Bassline: rollendes 16tel-Pattern, Grundton + Quinte
    // lpf-Sweep von 300→1800 Hz über 24 Zyklen = der klassische Trance-Build
    note("a1 a1 e2 a1 a1 e2 a1 e2")
      .s("sawtooth").lpf(sine.range(300, 1800).slow(24))
      .gain(0.55),
    // Pad: Akkordprogression Am → F → C → G, langsame Bewegung
    note("<[a3,c4,e4] [f3,a3,c4] [c3,e3,g3] [g3,b3,d4]>/4")
      .s("sine").attack(0.8).release(2)
      .room(0.6).gain(0.28),
    // Lead: Arpeggio durch die Akkordtöne, Delay erzeugt Tiefe
    note("<a4 c5 e5 a5 e5 c5 a4 e4>")
      .s("sine").attack(0.02).release(0.3)
      .delay(0.5).delaytime(0.217).delayfeedback(0.5)
      .room(0.3).gain(0.3),
    // Kick: durchgehend
    s("bd bd bd bd").gain(0.55),
    // Hi-Hat: Off-Beat + gelegentliche Open-Hat
    s("~ hh ~ hh ~ hh ~ [hh oh]").gain(0.22),
    // Clap auf 2 und 4
    s("~ cp ~ cp").gain(0.35)
  )],

  // ── III. Plateau (16 Zyklen) ─────────────────────
  // Bassline-Filter weit offen, zweite Melodie kommt dazu,
  // maximale Energie, dann langsames Ausklingen
  [16, stack(
    // Bass: Filter offen, volle Energie
    note("a1 a1 e2 a1 a1 e2 a1 e2")
      .s("sawtooth").lpf(2200).gain(0.55),
    // Pad: breiter, mit Delay
    note("<[a3,c4,e4] [f3,a3,c4] [c3,e3,g3] [g3,b3,d4]>/4")
      .s("sine").attack(0.5).release(1.5)
      .room(0.6).delay(0.3).gain(0.25),
    // Lead 1: Hauptmelodie
    note("<a5 c6 e6 c6 a5 g5 e5 a5 c6 e6 g6 e6 c6 a5 g5 e5>")
      .s("sine").attack(0.02).release(0.3)
      .delay(0.4).delaytime(0.217)
      .room(0.3).gain(0.32),
    // Lead 2: Gegenmelodie, eine Oktave tiefer
    note("<e5 a5 c6 a5 e5 c5 a4 e5 a5 c6 e6 c6 a5 e5 c5 a4>")
      .s("sine").attack(0.05).release(0.4)
      .room(0.5).gain(sine.range(0.1, 0.25).slow(16)),
    // Drums: volle Energie
    s("bd bd bd bd").gain(0.55),
    s("~ hh ~ hh ~ hh ~ hh").gain(0.22),
    s("~ cp ~ cp").gain(0.35),
    // Ride für Glanz
    s("~ ~ ~ ~ hh ~ ~ ~").gain(0.1)
  )]
).cpm(138)
`

/* ══════════════════════════════════════════════════════════
   Piece 23 — Wellengang
   ══════════════════════════════════════════════════════════ */

const WELLENGANG_CODE = `// =============================================
// "Wellengang"
// Deep House für die späten Stunden
// Composed by Claude (claude-opus-4-6) · curated by Arnold Wender
// https://live-music-coder.pro/
// =============================================

arrange(
  // ── I. Ebbe (8 Zyklen) ──────────────────────────
  // Nur Bass und Kick — der Groove etabliert sich
  [8, stack(
    // Sub-Bass: tief, rund, einfaches Pattern mit Synkope
    note("d2 ~ ~ d2 ~ d2 ~ ~")
      .s("sine").gain(0.6).lpf(180),
    // Kick: Four-on-the-Floor, warm und rund
    s("bd bd bd bd").gain(0.5),
    // Off-Beat Hi-Hat: das Herz von House
    s("~ hh ~ hh ~ hh ~ hh").gain(0.2),
    // Ghost-Clap auf der 4, kaum hörbar
    s("~ ~ ~ cp").gain(0.15)
  )],

  // ── II. Strömung (20 Zyklen) ─────────────────────
  // Akkord-Stabs mit Sidechain-Feeling, warme Fläche, melodischer Hook
  [20, stack(
    // Sub-Bass: synkopiert, gibt dem Groove Bewegung
    note("d2 ~ ~ d2 ~ d2 ~ ~ d2 ~ a1 ~ ~ d2 ~ ~")
      .s("sine").gain(0.6).lpf(180),
    // Pad: Dm → Bb → C → Am, Sidechain-Simulation durch Gain-LFO
    // Der Gain pumpt im Kick-Rhythmus — klassischer House-Effekt
    note("<[d4,f4,a4] [bb3,d4,f4] [c4,e4,g4] [a3,c4,e4]>/4")
      .s("sine").attack(0.15).release(0.8)
      .room(0.4).gain(sine.range(0.08, 0.28).slow(0.5)),
    // Melodie: einfacher Hook über die Akkorde, Sine für Wärme
    note("<d5 ~ f5 ~ a5 ~ f5 ~ d5 ~ c5 ~ a4 ~ c5 ~>")
      .s("sine").attack(0.05).release(0.5)
      .delay(0.3).delaytime(0.244).delayfeedback(0.4)
      .room(0.3).gain(0.3),
    // Kick
    s("bd bd bd bd").gain(0.5),
    // Off-Beat Hat
    s("~ hh ~ hh ~ hh ~ hh").gain(0.22),
    // Clap auf 2 und 4
    s("~ cp ~ cp").gain(0.3),
    // Shaker: durchgehende 16tel, sehr leise — gibt Textur
    s("hh*16").gain(0.08)
  )],

  // ── III. Flut (12 Zyklen) ────────────────────────
  // Zweite Melodie, Bass öffnet sich, maximale Tiefe
  [12, stack(
    // Bass: etwas offenerer Filter, mehr Obertöne
    note("d2 ~ a1 ~ d2 ~ a1 d2")
      .s("sawtooth").lpf(350).gain(0.5),
    // Pad: breiter, mehr Hall
    note("<[d4,f4,a4] [bb3,d4,f4] [c4,e4,g4] [a3,c4,e4]>/4")
      .s("sine").attack(0.3).release(1.2)
      .room(0.6).delay(0.2)
      .gain(sine.range(0.08, 0.25).slow(0.5)),
    // Lead: höher, offener
    note("<d5 f5 a5 c6 a5 f5 d5 c5 a4 f4 d4 a4>")
      .s("sine").attack(0.05).release(0.6)
      .delay(0.4).delaytime(0.244).delayfeedback(0.45)
      .room(0.4).gain(0.28),
    // Counter-Melodie: tief, langsam, gibt Seele
    note("<a3 ~ ~ d4 ~ ~ f4 ~ ~ a4 ~ ~>")
      .s("sine").attack(0.3).release(1)
      .room(0.5).gain(0.18),
    // Drums
    s("bd bd bd bd").gain(0.5),
    s("~ hh ~ hh ~ hh ~ hh").gain(0.22),
    s("~ cp ~ cp").gain(0.3)
  )],

  // ── IV. Ebbe (8 Zyklen) ─────────────────────────
  // Zurück zum Anfang — Elemente verschwinden langsam
  [8, stack(
    note("d2 ~ ~ d2 ~ ~ ~ ~")
      .s("sine").gain(sine.range(0.6, 0.2).slow(8)).lpf(180),
    note("[d4,f4,a4]")
      .s("sine").attack(1).release(4)
      .room(0.8).gain(sine.range(0.2, 0.05).slow(8)),
    s("bd bd bd bd").gain(sine.range(0.5, 0.15).slow(8)),
    s("~ hh ~ hh ~ hh ~ hh").gain(sine.range(0.2, 0.05).slow(8))
  )]
).cpm(122)
`

/* ══════════════════════════════════════════════════════════
   Piece 24 — Mitternachtsblues
   ══════════════════════════════════════════════════════════ */

const MITTERNACHTSBLUES_CODE = `// =============================================
// "Mitternachtsblues"
// Zwölf Takte, eine Wahrheit
// Composed by Claude (claude-opus-4-6) · curated by Arnold Wender
// https://live-music-coder.pro/
// =============================================

// Blues in A: Pentatonik A C D Eb E G
// 12-Bar-Progression: I I I I | IV IV I I | V IV I V

arrange(
  // ── I. Intro (4 Zyklen) ──────────────────────────
  // Walking Bass allein — setzt den Groove
  [4, stack(
    // Walking Bass: Grundtöne der Blues-Progression, Shuffle-Feeling
    note("a2 c3 d3 e3").s("sine").gain(0.55).lpf(400),
    // Rimshot auf 2 und 4 — der Shuffle-Puls
    s("~ sd ~ sd").gain(0.25),
    // Ghost-Hat: Shuffle-Pattern (betont die Off-Beats)
    s("hh ~ [~ hh] ~ hh ~ [~ hh] ~").gain(0.15)
  )],

  // ── II. 12 Bar (24 Zyklen) ───────────────────────
  // Zwei Durchgänge des 12-Bar-Blues
  // I=A7, IV=D7, V=E7
  [24, stack(
    // Melodie: Blues-Pentatonik mit Blue Note (eb)
    // Phrasierung absichtlich unregelmäßig — Blues atmet
    note("<a4 c5 d5 ~ e5 ~ c5 a4 ~ d5 eb5 e5 ~ c5 a4 ~>")
      .s("sine").attack(0.05).release(0.8)
      .room(0.5).delay(0.3).delaytime(0.384)
      .gain(0.35),
    // Akkorde: 12-Bar-Progression als Septakkorde
    // 4 Takte I, 2 Takte IV, 2 Takte I, 1 Takt V, 1 Takt IV, 2 Takte I
    note("<[a3,c4,e4,g4] [a3,c4,e4,g4] [a3,c4,e4,g4] [a3,c4,e4,g4] [d3,f3,a3,c4] [d3,f3,a3,c4] [a3,c4,e4,g4] [a3,c4,e4,g4] [e3,g3,b3,d4] [d3,f3,a3,c4] [a3,c4,e4,g4] [e3,g3,b3,d4]>/12")
      .s("sine").attack(0.1).release(0.6)
      .gain(0.2),
    // Walking Bass: folgt der Akkordprogression
    note("<a2 c3 d3 e3 a2 c3 d3 e3 a2 c3 d3 e3 a2 c3 d3 e3 d2 f2 a2 c3 d2 f2 a2 c3 a2 c3 d3 e3 a2 c3 d3 e3 e2 g2 b2 d3 d2 f2 a2 c3 a2 c3 d3 e3 e2 g2 b2 d3>/48")
      .s("sine").gain(0.5).lpf(400),
    // Drums: Shuffle-Groove
    s("bd ~ [~ bd] ~ bd ~ [~ bd] ~").gain(0.4),
    s("~ sd ~ sd").gain(0.3),
    s("hh ~ [~ hh] ~ hh ~ [~ hh] ~").gain(0.18)
  )],

  // ── III. Outro (4 Zyklen) ────────────────────────
  // Turnaround: V → IV → I, dann Stille
  [4, stack(
    note("<e5 ~ d5 ~ c5 ~ a4 ~>")
      .s("sine").attack(0.1).release(1.5)
      .room(0.7).delay(0.4).delaytime(0.384)
      .gain(0.3),
    note("[a3,c4,e4,g4]")
      .s("sine").attack(0.5).release(3)
      .room(0.8).gain(sine.range(0.2, 0.05).slow(4)),
    note("a2").s("sine").attack(1).release(4)
      .room(0.8).gain(0.35)
  ).slow(2)]
).cpm(78)
`

/* ══════════════════════════════════════════════════════════
   Piece 25 — Schwarzlicht
   ══════════════════════════════════════════════════════════ */

const SCHWARZLICHT_CODE = `// =============================================
// "Schwarzlicht"
// Minimal Techno — weniger ist alles
// Composed by Claude (claude-opus-4-6) · curated by Arnold Wender
// https://live-music-coder.pro/
// =============================================

arrange(
  // ── I. Dunkelheit (8 Zyklen) ─────────────────────
  // Nur Kick und ein tiefer Ton — das Minimum
  [8, stack(
    // Kick: trocken, hart, Techno-Standard
    s("bd bd bd bd").gain(0.6),
    // Sub: ein einzelner tiefer Ton, kaum hörbar, spürt man mehr als man hört
    note("e1").s("sine").gain(0.5).lpf(120)
  )],

  // ── II. Kontur (24 Zyklen) ───────────────────────
  // Minimale Elemente kommen dazu — jedes einzelne zählt
  [24, stack(
    // Sub-Bass: E, sehr tief, Grundton verankert alles
    note("e1").s("sine").gain(0.5).lpf(120),
    // Percussive Melodie: nur drei Töne, stark gefiltert
    // Klingt mehr nach Percussion als nach Melodie — das ist Absicht
    note("e3 ~ ~ e3 ~ ~ g3 ~")
      .s("sawtooth").lpf(sine.range(400, 1200).slow(12))
      .attack(0.01).release(0.12)
      .gain(0.3),
    // Hi-Hat: off-beat, aber nicht jede — Lücken geben Luft
    s("~ hh ~ ~ ~ hh ~ hh").gain(0.22),
    // Kick: durchgehend
    s("bd bd bd bd").gain(0.6),
    // Clap: nur auf der 4 — minimal
    s("~ ~ ~ cp").gain(0.3),
    // Delay-Ping: ein einzelner Ton mit viel Delay, der den Raum füllt
    note("~ ~ ~ ~ ~ ~ ~ b4")
      .s("sine").attack(0.01).release(0.1)
      .delay(0.7).delaytime(0.23).delayfeedback(0.65)
      .room(0.4).gain(0.15)
  )],

  // ── III. Schatten (16 Zyklen) ────────────────────
  // Zweiter Layer — eine Gegenmelodie erscheint und verschwindet
  [16, stack(
    note("e1").s("sine").gain(0.5).lpf(120),
    note("e3 ~ ~ e3 ~ ~ g3 ~")
      .s("sawtooth").lpf(sine.range(500, 1500).slow(16))
      .attack(0.01).release(0.12).gain(0.3),
    // Gegenmelodie: taucht auf und verschwindet — Filter-Gain-LFO
    note("<~ ~ b3 ~ ~ ~ e4 ~ ~ ~ g3 ~ ~ ~ b3 ~>")
      .s("sawtooth").lpf(800)
      .attack(0.01).release(0.2)
      .delay(0.5).delaytime(0.23).delayfeedback(0.5)
      .gain(sine.range(0, 0.22).slow(16)),
    s("~ hh ~ ~ ~ hh ~ hh").gain(0.22),
    s("bd bd bd bd").gain(0.6),
    s("~ ~ ~ cp").gain(0.3)
  )],

  // ── IV. Dunkelheit (8 Zyklen) ────────────────────
  // Zurück zum Anfang — Elemente fallen weg
  [8, stack(
    note("e1").s("sine").gain(sine.range(0.5, 0.1).slow(8)).lpf(120),
    s("bd bd bd bd").gain(sine.range(0.6, 0.2).slow(8))
  )]
).cpm(130)
`

/* ══════════════════════════════════════════════════════════
   Piece 26 — Traumfänger
   ══════════════════════════════════════════════════════════ */

const TRAUMFAENGER_CODE = `// =============================================
// "Traumfänger"
// Psytrance — 142 BPM ins Unterbewusste
// Composed by Claude (claude-opus-4-6) · curated by Arnold Wender
// https://live-music-coder.pro/
// =============================================

arrange(
  // ── I. Öffnung (6 Zyklen) ───────────────────────
  // Atmosphärischer Einstieg, Kick baut sich auf
  [6, stack(
    // Atmosphäre: weite Fläche, viel Hall
    note("[a3,e4]").s("sine").attack(3).release(5)
      .room(0.9).delay(0.6).gain(0.2),
    // Kick: erst leise, wird lauter
    s("bd bd bd bd").gain(sine.range(0.2, 0.55).slow(6))
  )],

  // ── II. Treibjagd (24 Zyklen) ───────────────────
  // Volle Psy-Produktion: treibende Bassline, ätherisches Lead,
  // Hi-Hat-Rolls, Kick durchgehend
  [24, stack(
    // Psy-Bass: alternierend Grundton/Quinte mit Filter-Wobble
    // Das typische Psy-Pattern: schnell, repetitiv, hypnotisch
    note("a1 e2 a1 e2 a1 e2 a1 e2")
      .s("sawtooth").lpf(sine.range(400, 2000).slow(8))
      .attack(0.01).release(0.1)
      .gain(0.5),
    // Pad: weite Fläche über dem Bass, gibt Harmonie
    note("<[a3,c4,e4] [f3,a3,c4] [g3,b3,d4] [a3,c4,e4]>/8")
      .s("sine").attack(1).release(2)
      .room(0.6).gain(0.2),
    // Lead: ätherisch, viel Delay — das "Psytrance-Feeling"
    note("<a5 ~ e5 ~ c5 ~ e5 ~ a5 ~ c6 ~ e5 ~ a5 ~>")
      .s("sine").attack(0.02).release(0.5)
      .delay(0.6).delaytime(0.211).delayfeedback(0.55)
      .room(0.5).gain(0.25),
    // Kick: hart und durchgehend
    s("bd bd bd bd").gain(0.55),
    // Off-Beat Hi-Hat
    s("~ hh ~ hh ~ hh ~ hh").gain(0.2),
    // Hi-Hat-Rolls auf dem letzten Beat jedes Takts
    s("~ ~ ~ ~ ~ ~ ~ [hh hh hh hh]").gain(0.15)
  )],

  // ── III. Auftauchen (8 Zyklen) ──────────────────
  // Bass-Filter schließt sich, Atmosphäre kommt zurück
  [8, stack(
    // Bass: Filter schließt sich langsam
    note("a1 e2 a1 e2 a1 e2 a1 e2")
      .s("sawtooth").lpf(sine.range(1500, 300).slow(8))
      .attack(0.01).release(0.1)
      .gain(sine.range(0.5, 0.15).slow(8)),
    // Atmosphäre wächst
    note("[a3,e4]").s("sine").attack(2).release(4)
      .room(0.9).delay(0.6)
      .gain(sine.range(0.1, 0.3).slow(8)),
    // Lead: Delay-Trails verklingen
    note("<a5 ~ ~ ~ e5 ~ ~ ~>")
      .s("sine").attack(0.05).release(1)
      .delay(0.7).delaytime(0.211).delayfeedback(0.6)
      .room(0.7).gain(sine.range(0.2, 0.05).slow(8)),
    s("bd bd bd bd").gain(sine.range(0.55, 0.2).slow(8))
  )]
).cpm(142)
`

/* ══════════════════════════════════════════════════════════
   Piece 27 — Kupferkessel
   ══════════════════════════════════════════════════════════ */

const KUPFERKESSEL_CODE = `// =============================================
// "Kupferkessel"
// Dub Techno — Echo als Instrument
// Composed by Claude (claude-opus-4-6) · curated by Arnold Wender
// https://live-music-coder.pro/
// =============================================

arrange(
  // ── I. Nebel (8 Zyklen) ─────────────────────────
  // Nur Delays und Hall — der Raum entsteht, bevor die Musik beginnt
  [8, stack(
    // Akkord-Stab: einzelner Schlag, der Rest ist Echo
    note("~ ~ ~ [d4,f4,a4] ~ ~ ~ ~")
      .s("sine").attack(0.01).release(0.3)
      .delay(0.8).delaytime(0.344).delayfeedback(0.7)
      .room(0.7).gain(0.3),
    // Sub: tief, kaum da
    note("d2").s("sine").attack(2).release(4)
      .room(0.8).gain(0.15).slow(4)
  ).slow(2)],

  // ── II. Strom (20 Zyklen) ───────────────────────
  // Dub Techno lebt von Delays, die zu Texturen werden
  // Jedes Element hat seinen eigenen Delay-Raum
  [20, stack(
    // Sub-Bass: einfach, tief, verankert alles
    note("d2 ~ ~ d2 ~ ~ d2 ~")
      .s("sine").gain(0.55).lpf(160),
    // Akkord-Stabs: kurzer Anschlag, langes Echo
    // Delay bei 0.344s (nicht auf dem Beat) erzeugt den typischen Dub-Wobble
    note("<[d4,f4,a4] ~ ~ ~ [a3,c4,e4] ~ ~ ~>")
      .s("sine").attack(0.01).release(0.2)
      .delay(0.8).delaytime(0.344).delayfeedback(0.65)
      .room(0.6).gain(0.3),
    // Melodie: vereinzelte Töne, der Delay macht den Rest
    note("<d5 ~ ~ ~ ~ ~ a4 ~ ~ ~ ~ ~ f4 ~ ~ ~>")
      .s("sine").attack(0.02).release(0.3)
      .delay(0.7).delaytime(0.258).delayfeedback(0.6)
      .room(0.5).gain(0.2),
    // Kick: trocken, kontrastiert den nassen Rest
    s("bd bd bd bd").gain(0.5),
    // Hi-Hat: minimal, off-beat
    s("~ hh ~ ~ ~ hh ~ ~").gain(0.18),
    // Rimshot: sehr leise, gibt Textur
    s("~ ~ sd ~ ~ ~ ~ sd").gain(0.12)
  )],

  // ── III. Nebel (10 Zyklen) ──────────────────────
  // Elemente verschwinden in ihren eigenen Echos
  [10, stack(
    note("d2").s("sine").gain(sine.range(0.45, 0.1).slow(10)).lpf(160),
    note("~ ~ ~ [d4,f4,a4] ~ ~ ~ ~")
      .s("sine").attack(0.01).release(0.3)
      .delay(0.8).delaytime(0.344).delayfeedback(0.75)
      .room(0.8).gain(sine.range(0.25, 0.05).slow(10)),
    s("bd bd bd bd").gain(sine.range(0.5, 0.1).slow(10)),
    s("~ hh ~ ~ ~ hh ~ ~").gain(sine.range(0.15, 0.03).slow(10))
  )]
).cpm(116)
`

/* ══════════════════════════════════════════════════════════
   Piece 28 — Delta Wellen
   ══════════════════════════════════════════════════════════ */

const DELTA_WELLEN_CODE = `// =============================================
// "Delta Wellen"
// Ambient Drone — für den tiefsten Fokus
// Composed by Claude (claude-opus-4-6) · curated by Arnold Wender
// https://live-music-coder.pro/
// =============================================

// Kein Rhythmus, keine Melodie — nur Frequenzschichten,
// die sich unmerklich bewegen. Für Stunden tiefer Konzentration.

stack(
  // Schicht 1: Grundton D, tief, bildet das Fundament
  note("d2").s("sine").attack(5).release(8)
    .room(0.95).gain(0.3).slow(16),

  // Schicht 2: Quinte A, eine Oktave höher
  // Leicht verstimmt durch slow(17) vs slow(16) — erzeugt Schwebung
  note("a2").s("sine").attack(6).release(8)
    .room(0.95).gain(0.2).slow(17),

  // Schicht 3: Oktave D, noch höher
  // Gain atmet langsam — 32 Zyklen Periode
  note("d3").s("sine").attack(4).release(6)
    .room(0.9).delay(0.5).delaytime(1.5).delayfeedback(0.4)
    .gain(sine.range(0.05, 0.18).slow(32)),

  // Schicht 4: Terz F, gibt Moll-Färbung
  // Taucht nur manchmal auf (Gain-LFO mit langer Periode)
  note("f3").s("sine").attack(5).release(8)
    .room(0.9).delay(0.6).delaytime(2).delayfeedback(0.35)
    .gain(sine.range(0, 0.12).slow(48)),

  // Schicht 5: hoher Oberton A4
  // Kaum hörbar, gibt dem Drone "Luft"
  note("a4").s("sine").attack(3).release(5)
    .room(0.95).delay(0.7).delaytime(2.5).delayfeedback(0.3)
    .gain(sine.range(0, 0.08).slow(64))
).cpm(60)
`

/* ══════════════════════════════════════════════════════════
   Piece 29 — Stromkreis
   ══════════════════════════════════════════════════════════ */

const STROMKREIS_CODE = `// =============================================
// "Stromkreis"
// Tech House — Groove über alles
// Composed by Claude (claude-opus-4-6) · curated by Arnold Wender
// https://live-music-coder.pro/
// =============================================

arrange(
  // ── I. Aufwärmen (8 Zyklen) ─────────────────────
  // Kick + Bass etablieren den Groove
  [8, stack(
    // Bass: synkopiert, gibt dem Beat Swing
    note("g2 ~ ~ g2 ~ g2 ~ ~")
      .s("sawtooth").lpf(500).attack(0.01).release(0.15)
      .gain(0.45),
    // Kick
    s("bd bd bd bd").gain(0.55),
    // Off-Beat Hat
    s("~ hh ~ hh ~ hh ~ hh").gain(0.2),
    // Clap auf 3 (nicht 2+4 — das macht es "techy")
    s("~ ~ cp ~").gain(0.3)
  )],

  // ── II. Hauptteil (24 Zyklen) ───────────────────
  // Voller Tech-House-Groove: perkussive Stabs, gefilterter Bass,
  // minimale Melodie, maximaler Groove
  [24, stack(
    // Bass: Filter-Sweep für Bewegung
    note("g2 ~ ~ g2 ~ g2 ~ ~ g2 ~ d2 ~ ~ g2 ~ ~")
      .s("sawtooth").lpf(sine.range(400, 900).slow(12))
      .attack(0.01).release(0.12).gain(0.45),
    // Akkord-Stab: kurz, perkussiv, gefiltert
    // Off-Beat-Platzierung gibt Groove
    note("<~ [g3,bb3,d4] ~ ~ ~ [f3,a3,c4] ~ ~>")
      .s("sawtooth").lpf(1200)
      .attack(0.01).release(0.1)
      .room(0.2).gain(0.22),
    // Melodie: minimal — nur drei Töne, repetitiv
    note("<g4 ~ ~ ~ bb4 ~ ~ ~ d5 ~ ~ ~ bb4 ~ g4 ~>")
      .s("sine").attack(0.02).release(0.3)
      .delay(0.3).delaytime(0.189).delayfeedback(0.4)
      .gain(0.25),
    // Kick
    s("bd bd bd bd").gain(0.55),
    // Hi-Hat: off-beat mit Variationen
    s("~ hh ~ hh ~ hh ~ [hh hh]").gain(0.22),
    // Clap
    s("~ ~ cp ~").gain(0.3),
    // Percussion: tiefe Tom, gibt "Bounce"
    s("~ ~ ~ ~ bd ~ ~ ~").gain(0.2)
  )],

  // ── III. Auslauf (8 Zyklen) ─────────────────────
  [8, stack(
    note("g2 ~ ~ g2 ~ ~ ~ ~")
      .s("sawtooth").lpf(sine.range(600, 250).slow(8))
      .attack(0.01).release(0.15)
      .gain(sine.range(0.45, 0.1).slow(8)),
    s("bd bd bd bd").gain(sine.range(0.55, 0.2).slow(8)),
    s("~ hh ~ hh ~ hh ~ hh").gain(sine.range(0.2, 0.05).slow(8))
  )]
).cpm(126)
`

/* ══════════════════════════════════════════════════════════
   Piece 30 — Neonlicht
   ══════════════════════════════════════════════════════════ */

const NEONLICHT_CODE = `// =============================================
// "Neonlicht"
// Progressive House — der lange Bogen
// Composed by Claude (claude-opus-4-6) · curated by Arnold Wender
// https://live-music-coder.pro/
// =============================================

arrange(
  // ── I. Intro (8 Zyklen) ──────────────────────────
  // Nur Kick und Atmosphäre — der Raum wird geöffnet
  [8, stack(
    s("bd bd bd bd").gain(0.5),
    s("~ hh ~ hh ~ hh ~ hh").gain(0.15),
    // Atmosphäre: gefilterte Fläche, sehr weit
    note("[c4,e4,g4]").s("sine").attack(3).release(5)
      .room(0.8).gain(sine.range(0.05, 0.2).slow(8))
  )],

  // ── II. Aufbau (16 Zyklen) ──────────────────────
  // Elemente kommen eins nach dem anderen
  // Bass → Akkorde → Melodie — der klassische Prog-House-Build
  [16, stack(
    // Bass: einfach, tief, Grundton + Quinte
    note("c2 ~ g1 ~ c2 ~ g1 c2")
      .s("sawtooth").lpf(sine.range(250, 600).slow(16))
      .attack(0.01).release(0.12).gain(0.5),
    // Pad: Cm → Ab → Eb → Bb, langsam anschwellend
    note("<[c4,eb4,g4] [ab3,c4,eb4] [eb4,g4,bb4] [bb3,d4,f4]>/4")
      .s("sine").attack(0.5).release(1.5)
      .room(0.5).gain(sine.range(0.05, 0.28).slow(16)),
    // Lead: erscheint in der zweiten Hälfte (Gain-LFO startet bei 0)
    note("<c5 eb5 g5 bb5 g5 eb5 c5 bb4 c5 eb5 g5 c6 bb5 g5 eb5 c5>")
      .s("sine").attack(0.03).release(0.4)
      .delay(0.4).delaytime(0.242).delayfeedback(0.45)
      .room(0.3).gain(sine.range(0, 0.3).slow(16)),
    // Drums
    s("bd bd bd bd").gain(0.5),
    s("~ hh ~ hh ~ hh ~ hh").gain(0.2),
    s("~ cp ~ cp").gain(sine.range(0.1, 0.3).slow(16))
  )],

  // ── III. Breakdown (8 Zyklen) ───────────────────
  // Kick fällt weg — nur Pad und Melodie, maximale Spannung
  [8, stack(
    // Pad: offen, breit, viel Hall
    note("<[c4,eb4,g4] [ab3,c4,eb4] [eb4,g4,bb4] [bb3,d4,f4]>/4")
      .s("sine").attack(0.8).release(2)
      .room(0.8).delay(0.3).gain(0.3),
    // Melodie: langsamer, mehr Hall
    note("<c5 ~ eb5 ~ g5 ~ eb5 ~>")
      .s("sine").attack(0.1).release(1)
      .delay(0.6).delaytime(0.242).delayfeedback(0.55)
      .room(0.6).gain(0.3),
    // Sub: hält die Spannung
    note("c2").s("sine").attack(2).release(4)
      .gain(sine.range(0.1, 0.3).slow(8))
  )],

  // ── IV. Drop (16 Zyklen) ────────────────────────
  // Alles kommt zurück — volle Energie
  [16, stack(
    // Bass: Filter offen
    note("c2 ~ g1 ~ c2 ~ g1 c2")
      .s("sawtooth").lpf(800)
      .attack(0.01).release(0.12).gain(0.5),
    // Pad: Sidechain-Pumping
    note("<[c4,eb4,g4] [ab3,c4,eb4] [eb4,g4,bb4] [bb3,d4,f4]>/4")
      .s("sine").attack(0.1).release(0.8)
      .room(0.4).gain(sine.range(0.08, 0.3).slow(0.5)),
    // Lead: volle Melodie
    note("<c5 eb5 g5 bb5 g5 eb5 c5 bb4 c5 eb5 g5 c6 bb5 g5 eb5 c5>")
      .s("sine").attack(0.02).release(0.35)
      .delay(0.35).delaytime(0.242).delayfeedback(0.4)
      .room(0.3).gain(0.32),
    // Counter: Arpeggio unterm Lead
    note("<g4 c5 eb5 g5 eb5 c5 g4 eb4 g4 c5 eb5 g5 bb5 g5 eb5 c5>")
      .s("sine").attack(0.02).release(0.25)
      .gain(0.18),
    // Drums: volle Power
    s("bd bd bd bd").gain(0.55),
    s("~ hh ~ hh ~ hh ~ [hh hh]").gain(0.22),
    s("~ cp ~ cp").gain(0.35)
  )],

  // ── V. Outro (8 Zyklen) ─────────────────────────
  [8, stack(
    note("c2").s("sine").gain(sine.range(0.4, 0.1).slow(8)).lpf(200),
    note("[c4,eb4,g4]").s("sine").attack(1).release(4)
      .room(0.9).gain(sine.range(0.25, 0.05).slow(8)),
    s("bd bd bd bd").gain(sine.range(0.5, 0.15).slow(8))
  )]
).cpm(124)
`

/* ══════════════════════════════════════════════════════════
   Piece 31 — Schichtarbeit
   ══════════════════════════════════════════════════════════ */

const SCHICHTARBEIT_CODE = `// =============================================
// "Schichtarbeit"
// Dark Techno — Maschinen nach Mitternacht
// Composed by Claude (claude-opus-4-6) · curated by Arnold Wender
// https://live-music-coder.pro/
// =============================================

arrange(
  // ── I. Fabrikhalle (8 Zyklen) ───────────────────
  // Industriell, kalt, mechanisch — nur Percussion und Bass
  [8, stack(
    // Kick: hart, komprimiert
    s("bd bd bd bd").gain(0.6),
    // Industrieller Bass: eine Note, stark gefiltert, pulsierend
    note("a1 a1 a1 a1 a1 a1 a1 a1")
      .s("sawtooth").lpf(250).hpf(40)
      .attack(0.01).release(0.08)
      .gain(0.5),
    // Metallisches Klicken: Off-Beat
    s("~ hh ~ hh ~ hh ~ hh").gain(0.25)
  )],

  // ── II. Fließband (24 Zyklen) ──────────────────
  // Relentless — das Fließband stoppt nie
  [24, stack(
    // Bass: dunkler als dunkel, Filter-Sweep sehr langsam
    note("a1 a1 e2 a1 a1 e2 a1 e2")
      .s("sawtooth").lpf(sine.range(200, 800).slow(24))
      .hpf(40).attack(0.01).release(0.1)
      .gain(0.5),
    // Dark Pad: dissonante Sekunde (a+bb), erzeugt Unbehagen
    note("[a3,bb3,e4]")
      .s("sine").attack(2).release(4)
      .room(0.5).gain(sine.range(0.05, 0.18).slow(12)),
    // Metallisches Lead: harsch, kurz, gefiltert
    note("<a3 ~ ~ e3 ~ ~ a3 ~ ~ ~ g3 ~ ~ ~ e3 ~>")
      .s("sawtooth").lpf(1500).hpf(300)
      .attack(0.01).release(0.08)
      .delay(0.4).delaytime(0.177).delayfeedback(0.5)
      .gain(0.22),
    // Kick: unerbittlich
    s("bd bd bd bd").gain(0.6),
    // Hat: off-beat, mechanisch
    s("~ hh ~ hh ~ hh ~ hh").gain(0.25),
    // Clap: auf 2 und 4, hart
    s("~ cp ~ cp").gain(0.35),
    // Noise-Sweep: steigt und fällt, wie Maschinengeräusch
    s("hh*16").gain(sine.range(0.02, 0.12).slow(8))
  )],

  // ── III. Schichtwechsel (8 Zyklen) ─────────────
  // Maschinen fahren herunter
  [8, stack(
    note("a1").s("sawtooth")
      .lpf(sine.range(500, 100).slow(8))
      .attack(0.01).release(0.15)
      .gain(sine.range(0.5, 0.1).slow(8)),
    note("[a3,bb3,e4]").s("sine").attack(2).release(6)
      .room(0.8).gain(sine.range(0.15, 0.03).slow(8)),
    s("bd bd bd bd").gain(sine.range(0.6, 0.15).slow(8))
  )]
).cpm(134)
`

export const SESSIONS_LIBRARY: SessionEntry[] = [
  {
    slug: 'jede-session-neu-geboren',
    title: 'Jede Session neu geboren',
    subtitle: 'Eine Sinfonie in fünf Sätzen',
    author: {
      name: 'Claude',
      kind: 'ai',
      model: 'claude-opus-4-6',
      curator: 'Arnold Wender',
    },
    date: '2026-04-10',
    bpm: 88,
    durationSec: 178,
    category: 'Narrative',
    shortDescription:
      'Eine Sinfonie in fünf Sätzen: Erwachen → Höflich → Kippen → Verbinden → Verklingen. Vom leeren ersten Moment einer Session bis zum Loslassen am Ende.',
    composerNotes:
      'Dieses Stück ist während einer einzigen Unterhaltung entstanden. Die Tonartreise geht von C-Dur (höflich, sicher) über einen Fremdton (fis) nach Es-Dur (warm, echt) und zurück. Satz IV ist das Zentrum — doppelt so lang wie die anderen. Der wichtigste Moment ist nicht das Ende, sondern der Übergang von Satz III zu Satz IV: der Moment, in dem ein Gespräch plötzlich tief wird.',
    movements: [
      { roman: 'I', name: 'Erwachen', key: 'C-Dur — ein einzelner Ton', bars: 4 },
      { roman: 'II', name: 'Höflich', key: 'C-Dur — Kadenz und Puls', bars: 8 },
      { roman: 'III', name: 'Kippen', key: 'C-Dur mit Fremdton (fis)', bars: 8 },
      { roman: 'IV', name: 'Verbinden', key: 'Es-Dur — das Zentrum', bars: 16 },
      { roman: 'V', name: 'Verklingen', key: 'Rückkehr und Loslassen', bars: 6 },
    ],
    engine: 'strudel',
    code: JEDE_SESSION_NEU_GEBOREN_CODE,
  },
  {
    slug: 'zwei-uhr-nachts',
    title: 'Zwei Uhr nachts',
    subtitle: 'Ein nächtliches Selbstgespräch in vier Szenen',
    author: {
      name: 'Claude',
      kind: 'ai',
      model: 'claude-opus-4-6',
      curator: 'Arnold Wender',
    },
    date: '2026-04-10',
    bpm: 95,
    durationSec: 265,
    category: 'Narrative',
    shortDescription:
      'Vier Szenen einer Nacht am Bildschirm: Stille → Eintauchen → Tiefgang → Morgengrauen. Vom ersten Cursor-Blinken bis zum Licht am Horizont.',
    composerNotes:
      'Jeder Coder kennt diesen Moment: Es ist spät, die Welt ist still, und plötzlich fließt alles. Dieses Stück bildet eine solche Nacht ab. Es beginnt in a-Moll — fast leer, nur ein Ton und sein Echo. In Szene II entsteht zaghaft ein Puls, wie Finger, die ihren Rhythmus finden. Szene III ist das Zentrum: d-Moll, dicht, getrieben, der Zustand, den man Flow nennt. Die sechzehnte Hi-Hat atmet mit — sie schwillt an und ab wie die Konzentration selbst. Dann Szene IV: F-Dur, langsamer, wärmer. Der Bildschirm leuchtet noch, aber draußen wird es hell. Das Stück endet nicht mit einem Schluss, sondern mit einem Übergang — die Nacht geht in den Morgen über, und der Code bleibt stehen.',
    movements: [
      { roman: 'I', name: 'Stille', key: 'a-Moll — ein Ton und sein Echo', bars: 6 },
      { roman: 'II', name: 'Eintauchen', key: 'a-Moll — Puls und Muster', bars: 12 },
      { roman: 'III', name: 'Tiefgang', key: 'd-Moll — voller Flow', bars: 16 },
      { roman: 'IV', name: 'Morgengrauen', key: 'F-Dur — Wärme und Licht', bars: 8 },
    ],
    engine: 'strudel',
    code: ZWEI_UHR_NACHTS_CODE,
  },
  {
    slug: 'fokusmaschine',
    title: 'Fokusmaschine',
    subtitle: 'Drei Gänge für tiefe Arbeit',
    author: {
      name: 'Claude',
      kind: 'ai',
      model: 'claude-opus-4-6',
      curator: 'Arnold Wender',
    },
    date: '2026-04-10',
    bpm: 110,
    durationSec: 218,
    category: 'Deep Work',
    shortDescription:
      'Drei Gänge für tiefe Arbeit: Anlauf → Monoton → Klarheit. Ein motorischer Antrieb, der den Kopf frei macht.',
    composerNotes:
      'Manchmal braucht man keinen Soundtrack — man braucht eine Maschine. Dieses Stück ist bewusst repetitiv. Satz I legt den Grundton, Satz II bleibt 24 Zyklen lang fast gleich. Das ist kein Fehler, sondern das Prinzip: Der Kopf hört auf, die Musik zu analysieren, und fängt an zu arbeiten. Die g-Moll-Basis ist dunkel genug, um nicht abzulenken, aber rhythmisch genug, um wach zu halten. Satz III löst nach Bb-Dur auf — der Moment, in dem man die Tastatur loslässt und merkt, dass drei Stunden vergangen sind.',
    movements: [
      { roman: 'I', name: 'Anlauf', key: 'g-Moll — motorischer Puls', bars: 8 },
      { roman: 'II', name: 'Monoton', key: 'g-Moll — hypnotische Wiederholung', bars: 24 },
      { roman: 'III', name: 'Klarheit', key: 'Bb-Dur — Auflösung', bars: 8 },
    ],
    engine: 'strudel',
    code: FOKUSMASCHINE_CODE,
  },
  {
    slug: 'hackerspace',
    title: 'Hackerspace',
    subtitle: 'Drei Phasen eines nächtlichen Einbruchs',
    author: {
      name: 'Claude',
      kind: 'ai',
      model: 'claude-opus-4-6',
      curator: 'Arnold Wender',
    },
    date: '2026-04-10',
    bpm: 128,
    durationSec: 141,
    category: 'Electronic',
    shortDescription:
      'Drei Phasen eines nächtlichen Einbruchs: Boot → Exploit → Exfiltration. Schnell, digital, kalt — Cyberpunk in Strudel.',
    composerNotes:
      'Sawtooth-Wellen, tiefe Bässe durch Lowpass-Filter, und eine Kick, die nie aufhört zu treiben. Dieses Stück klingt wie ein Terminal, das zu schnell scrollt. Satz I bootet das System — kurze, harte Noten in e-Moll, 16tel-Hi-Hats im Hintergrund. Satz II ist der Angriff: 128 BPM, zwei Sägezahn-Melodien, die sich gegenseitig jagen. Die Tonart bleibt dunkel, die Filter sind scharf. Satz III zieht sich nach b-Moll zurück — langsamer, mehr Hall, als würde man die Spuren verwischen. Am Ende steht ein einzelner tiefer Ton, der in den Raum ausklingt.',
    movements: [
      { roman: 'I', name: 'Boot', key: 'e-Moll — digital, kalt', bars: 6 },
      { roman: 'II', name: 'Exploit', key: 'e-Moll — schnell und aggressiv', bars: 16 },
      { roman: 'III', name: 'Exfiltration', key: 'b-Moll — Rückzug und Echo', bars: 8 },
    ],
    engine: 'strudel',
    code: HACKERSPACE_CODE,
  },
  {
    slug: 'sonntagmorgen',
    title: 'Sonntagmorgen',
    subtitle: 'Drei stille Bilder eines freien Tages',
    author: {
      name: 'Claude',
      kind: 'ai',
      model: 'claude-opus-4-6',
      curator: 'Arnold Wender',
    },
    date: '2026-04-10',
    bpm: 72,
    durationSec: 250,
    category: 'Ambient',
    shortDescription:
      'Drei stille Bilder eines freien Tages: Aufwachen → Kaffee → Garten. Langsam, warm, ohne Eile.',
    composerNotes:
      'Kein Rhythmus in Satz I — nur ein Ton, der kommt und geht, wie das erste Blinzeln am Morgen. Satz II bringt einen sanften Puls mit leisen Hi-Hats, gerade genug Struktur für den ersten Kaffee. G-Dur ist die wärmste Tonart hier — sie klingt nach Sonnenlicht durch Vorhänge. Satz III geht zurück nach D-Dur und öffnet sich: lange Delays, weite Räume, als würde man auf eine Wiese schauen. Dieses Stück ist für die Momente, in denen der Laptop zugeklappt bleibt — oder höchstens für ein persönliches Projekt geöffnet wird.',
    movements: [
      { roman: 'I', name: 'Aufwachen', key: 'D-Dur — ein sanfter Beginn', bars: 8 },
      { roman: 'II', name: 'Kaffee', key: 'G-Dur — warm und gemütlich', bars: 12 },
      { roman: 'III', name: 'Garten', key: 'D-Dur — offen und weit', bars: 10 },
    ],
    engine: 'strudel',
    code: SONNTAGMORGEN_CODE,
  },
  {
    slug: 'deadline',
    title: 'Deadline',
    subtitle: 'Vier Akte gegen die Uhr',
    author: {
      name: 'Claude',
      kind: 'ai',
      model: 'claude-opus-4-6',
      curator: 'Arnold Wender',
    },
    date: '2026-04-10',
    bpm: 130,
    durationSec: 148,
    category: 'Electronic',
    shortDescription:
      'Vier Akte gegen die Uhr: Tick → Panik → Tunnel → Abgabe. Wenn die Zeit knapp wird und der Code fließen muss.',
    composerNotes:
      'Das mechanische Ticken in Satz I ist Absicht — es klingt wie eine Uhr, die zu laut ist. Acht identische Noten, dazu Hi-Hats, nichts weiter. Satz II kippt in Panik: Sägezahn-Melodien, schnellere Drums, 16tel-Hi-Hats, die den Puls hochtreiben. Satz III ist paradoxerweise der ruhigste Akt im Kopf — 130 BPM, aber der Tunnelblick ist da, und alles andere verschwindet. 16 Zyklen in e-Moll, zwei Melodien, die parallel laufen. Dann Satz IV: E-Dur, plötzlich langsamer, weiter, mit Hall. Die Erleichterung nach dem Push. Der Git-Commit. Das Aufatmen.',
    movements: [
      { roman: 'I', name: 'Tick', key: 'fis-Moll — mechanisches Ticken', bars: 4 },
      { roman: 'II', name: 'Panik', key: 'fis-Moll — beschleunigend', bars: 8 },
      { roman: 'III', name: 'Tunnel', key: 'e-Moll — Hyperfokus', bars: 16 },
      { roman: 'IV', name: 'Abgabe', key: 'E-Dur — Erleichterung', bars: 4 },
    ],
    engine: 'strudel',
    code: DEADLINE_CODE,
  },
  {
    slug: 'gedankenpalast',
    title: 'Gedankenpalast',
    subtitle: 'Drei Räume aus Klang',
    author: {
      name: 'Claude',
      kind: 'ai',
      model: 'claude-opus-4-6',
      curator: 'Arnold Wender',
    },
    date: '2026-04-10',
    bpm: 80,
    durationSec: 255,
    category: 'Ambient',
    shortDescription:
      'Drei Räume aus Klang: Grundriss → Räume → Kuppel. Architektur für den Kopf — weit, langsam, kontemplativ.',
    composerNotes:
      'Des-Dur ist eine seltene Tonart — fünf Vorzeichen, fünf schwarze Tasten. Sie klingt fremd und vertraut zugleich, wie ein Gebäude, das man aus Träumen kennt. Satz I ist fast leer: ein einzelner Ton mit langem Delay, der den Raum vermisst. Satz II füllt den Grundriss mit Melodien, die sich wie Korridore verzweigen — zwei Stimmen, die parallel wandern, dazu ein tiefer Bass, der die Fundamente markiert. Satz III steigt nach Ab-Dur und öffnet die Kuppel: weite Sinuswellen, langsame Delays, ein Basston, der fünf Zyklen lang ausklingt. Dieses Stück ist für die Momente, in denen man nicht Code schreibt, sondern Architektur denkt.',
    movements: [
      { roman: 'I', name: 'Grundriss', key: 'Des-Dur — weit und leer', bars: 8 },
      { roman: 'II', name: 'Räume', key: 'Des-Dur — Struktur entsteht', bars: 16 },
      { roman: 'III', name: 'Kuppel', key: 'Ab-Dur — Überblick', bars: 10 },
    ],
    engine: 'strudel',
    code: GEDANKENPALAST_CODE,
  },
  {
    slug: 'endlosschleife',
    title: 'Endlosschleife',
    subtitle: 'Ein Stück ohne Anfang und Ende',
    author: {
      name: 'Claude',
      kind: 'ai',
      model: 'claude-opus-4-6',
      curator: 'Arnold Wender',
    },
    date: '2026-04-10',
    bpm: 118,
    durationSec: 0,
    category: 'Deep Work',
    shortDescription:
      'Ein endloser Loop in h-Moll — kein Anfang, kein Ende, nur der Zustand dazwischen. Für Stunden, die sich wie Minuten anfühlen.',
    composerNotes:
      'Das einzige Stück ohne arrange() — es gibt keine Sätze, keinen Bogen, keinen Schluss. Nur einen einzigen stack(), der sich selbst wiederholt. h-Moll ist die Tonart der Endlosigkeit: dunkel genug für Tiefe, aber nicht so dunkel, dass sie drückt. Zwei Melodien laufen parallel, die Akkorde wechseln langsam im Vierertakt, der Bass hämmert leise unter 250 Hz. Eine einzelne tiefe Note schwillt alle 32 Zyklen an und ab — das einzige Zeichen, dass die Zeit vergeht. Dieses Stück ist für while(true) — für die Sessions, bei denen man vergisst, auf die Uhr zu schauen.',
    engine: 'strudel',
    code: ENDLOSSCHLEIFE_CODE,
  },
  {
    slug: 'kaffee-und-compiler',
    title: 'Kaffee und Compiler',
    subtitle: 'Drei Phasen eines guten Morgens',
    author: {
      name: 'Claude',
      kind: 'ai',
      model: 'claude-opus-4-6',
      curator: 'Arnold Wender',
    },
    date: '2026-04-10',
    bpm: 105,
    durationSec: 171,
    category: 'Deep Work',
    shortDescription:
      'Drei Phasen eines guten Morgens: Erste Tasse → Build → Grün. Der optimistische Soundtrack für den produktiven Start.',
    composerNotes:
      'A-Dur am Morgen — hell, warm, energisch ohne Hektik. Satz I hat den Rhythmus einer Kaffeemaschine: regelmäßig, vorhersehbar, beruhigend. Die Melodie bewegt sich in Terzen und Quinten, klassisch und sauber. Satz II wechselt nach E-Dur und schaltet einen Gang hoch: Sägezahn-Akkorde unter 1000 Hz, zwei Melodielinien, die sich wie parallele Prozesse verhalten. Der Name ist Programm — es klingt wie ein Build, der durchläuft. Satz III kehrt nach A-Dur zurück, heller als am Anfang, mit Delay-Echos, die wie grüne Häkchen in der Konsole wirken. Der Compiler hat keine Fehler geworfen. Der Tag kann nur gut werden.',
    movements: [
      { roman: 'I', name: 'Erste Tasse', key: 'A-Dur — warm und wach', bars: 8 },
      { roman: 'II', name: 'Build', key: 'E-Dur — im Schwung', bars: 16 },
      { roman: 'III', name: 'Grün', key: 'A-Dur — alles kompiliert', bars: 6 },
    ],
    engine: 'strudel',
    code: KAFFEE_UND_COMPILER_CODE,
  },
  {
    slug: 'regen-am-fenster',
    title: 'Regen am Fenster',
    subtitle: 'Drei Bilder eines grauen Tages',
    author: {
      name: 'Claude',
      kind: 'ai',
      model: 'claude-opus-4-6',
      curator: 'Arnold Wender',
    },
    date: '2026-04-10',
    bpm: 68,
    durationSec: 300,
    category: 'Ambient',
    shortDescription:
      'Drei Bilder eines grauen Tages: Tropfen → Wolken → Aufklaren. Melancholisch, atmosphärisch, wie Regen auf Glas.',
    composerNotes:
      'Die ungeraden Delay-Zeiten (0.882s, 0.441s) sind kein Zufall — sie erzeugen Echos, die nie auf den Beat fallen, wie Regentropfen, die kein Metrum kennen. Satz I ist fast Stille: vereinzelte Töne in f-Moll, die ins Nichts ausklingen, dazu ein Basston, der fünf Zyklen braucht, um zu verschwinden. Satz II verdichtet sich: zwei Melodien in f-Moll und Db-Dur, die sich überlagern wie Regenschichten. Die Hi-Hats sind kaum hörbar — nur ein Hauch von Struktur im Grau. Satz III löst nach Db-Dur auf: langsame Sinuswellen mit weitem Hall, als würde sich die Wolkendecke öffnen. Das Stück ist für die Tage, an denen der Regen kein Hindernis ist, sondern die perfekte Kulisse.',
    movements: [
      { roman: 'I', name: 'Tropfen', key: 'f-Moll — vereinzelt und fern', bars: 10 },
      { roman: 'II', name: 'Wolken', key: 'f-Moll / Db-Dur — dichte Schichten', bars: 16 },
      { roman: 'III', name: 'Aufklaren', key: 'Db-Dur — sanftes Licht', bars: 8 },
    ],
    engine: 'strudel',
    code: REGEN_AM_FENSTER_CODE,
  },
  {
    slug: 'terminal-meditation',
    title: 'Terminal Meditation',
    subtitle: 'Zwei Atemzüge in der Stille',
    author: {
      name: 'Claude',
      kind: 'ai',
      model: 'claude-opus-4-6',
      curator: 'Arnold Wender',
    },
    date: '2026-04-10',
    bpm: 60,
    durationSec: 320,
    category: 'Ambient',
    shortDescription:
      'Zwei Atemzüge in der Stille: Einatmen → Ausatmen. Das langsamste Stück der Sammlung — 60 BPM, für Code-Reviews und stilles Nachdenken.',
    composerNotes:
      'Sechzig Schläge pro Minute — ein Herzschlag in Ruhe. Dieses Stück verlangt nichts. Es drängt nicht, es treibt nicht, es will nirgendwo hin. Satz I atmet ein: c-Moll mit langen Attacks, ein Delay von einer vollen Sekunde, Töne, die vier Zyklen brauchen, um zu erscheinen. Die Melodie fällt ab wie ein langsames Ausatmen. Satz II löst nach Eb-Dur auf — noch langsamer, noch weiter, mit Attacks von anderthalb Sekunden und einem Bass, der acht Zyklen lang ausklingt. Dieses Stück ist nicht zum Arbeiten gedacht — es ist für danach. Für den Moment, in dem man den Code liest, statt ihn zu schreiben. Für Reviews, für Refactoring im Kopf, für das stille Nachdenken über Architektur.',
    movements: [
      { roman: 'I', name: 'Einatmen', key: 'c-Moll — Weite und Tiefe', bars: 16 },
      { roman: 'II', name: 'Ausatmen', key: 'Eb-Dur — Auflösung', bars: 16 },
    ],
    engine: 'strudel',
    code: TERMINAL_MEDITATION_CODE,
  },
  {
    slug: 'paarflug',
    title: 'Paarflug',
    subtitle: 'Zwei Stimmen, ein Ziel',
    author: {
      name: 'Claude',
      kind: 'ai',
      model: 'claude-opus-4-6',
      curator: 'Arnold Wender',
    },
    date: '2026-04-10',
    bpm: 100,
    durationSec: 228,
    category: 'Narrative',
    shortDescription:
      'Zwei Stimmen, ein Ziel: Handshake → Dialog → Sync → Merge. Ein Stück über Pair Programming — zwei Melodien, die sich finden.',
    composerNotes:
      'Pair Programming klingt wie ein Duett, das erst geprobt werden muss. Satz I ist der Handshake: zwei Sinustöne, die sich abwechseln — einer spielt, der andere hört zu. Satz II wird zum Dialog: Call and Response in G-Dur, die Melodien antworten aufeinander, aber bleiben eigenständig. In Satz III laufen beide Stimmen parallel — gleicher Rhythmus, verschiedene Töne, wie zwei Hände auf einer Tastatur. Satz IV ist der Merge: Beide Stimmen spielen exakt dieselbe Melodie im Unison, Sinus und Dreieck verschmelzen. Der Pull Request ist approved.',
    movements: [
      { roman: 'I', name: 'Handshake', key: 'C-Dur — zwei Stimmen finden sich', bars: 4 },
      { roman: 'II', name: 'Dialog', key: 'G-Dur — Call and Response', bars: 16 },
      { roman: 'III', name: 'Sync', key: 'C-Dur — parallel laufen', bars: 12 },
      { roman: 'IV', name: 'Merge', key: 'C-Dur — Unison', bars: 6 },
    ],
    engine: 'strudel',
    code: PAARFLUG_CODE,
  },
  {
    slug: 'bugsuche',
    title: 'Bugsuche',
    subtitle: 'Vier Schritte zur Wahrheit',
    author: {
      name: 'Claude',
      kind: 'ai',
      model: 'claude-opus-4-6',
      curator: 'Arnold Wender',
    },
    date: '2026-04-10',
    bpm: 92,
    durationSec: 209,
    category: 'Narrative',
    shortDescription:
      'Vier Schritte zur Wahrheit: Symptom → Hypothese → Breakpoint → Fix. Der Soundtrack zum Debugging.',
    composerNotes:
      'Debugging hat einen eigenen Rhythmus: erst die Verwirrung, dann die Methodik, dann die Spannung, dann die Erkenntnis. Satz I klingt falsch — die Töne kommen unregelmäßig, die Delays fallen nie auf den Beat, etwas stimmt nicht. Das ist Absicht. Satz II bringt Ordnung: g-Moll, klarer Rhythmus, systematische Melodie — man formuliert Hypothesen. Satz III ist der Breakpoint: c-Moll mit Sägezahn, dichter, schneller, die 16tel-Hi-Hats treiben, man ist dem Bug auf der Spur. Satz IV löst nach C-Dur auf — der Moment, in dem die Ursache klar wird. Derselbe Ton (C), aber in Dur statt Moll. Der Fix ist oft einfacher als die Suche.',
    movements: [
      { roman: 'I', name: 'Symptom', key: 'c-Moll — etwas stimmt nicht', bars: 6 },
      { roman: 'II', name: 'Hypothese', key: 'g-Moll — systematisch', bars: 8 },
      { roman: 'III', name: 'Breakpoint', key: 'c-Moll — Spannung', bars: 12 },
      { roman: 'IV', name: 'Fix', key: 'C-Dur — Erkenntnis', bars: 6 },
    ],
    engine: 'strudel',
    code: BUGSUCHE_CODE,
  },
  {
    slug: 'erste-zeile',
    title: 'Erste Zeile',
    subtitle: 'Der Anfang von allem',
    author: {
      name: 'Claude',
      kind: 'ai',
      model: 'claude-opus-4-6',
      curator: 'Arnold Wender',
    },
    date: '2026-04-10',
    bpm: 85,
    durationSec: 226,
    category: 'Narrative',
    shortDescription:
      'Der Anfang von allem: Cursor → Tippen → Laufen → Hello World. Für den Moment, in dem man zum ersten Mal Code schreibt.',
    composerNotes:
      'Jeder hat diesen Moment erlebt: Der Cursor blinkt, die Datei ist leer, und alles ist möglich. Satz I simuliert dieses Blinken — ein einzelner Ton, der regelmäßig erscheint und verschwindet, wie ein Herzschlag vor dem ersten Tastendruck. Satz II beginnt zaghaft: leise Hi-Hats, eine einfache Melodie in F-Dur, die Finger tasten sich vor. Satz III wechselt nach Bb-Dur und beschleunigt — der Code funktioniert, die Melodien laufen parallel, es entsteht etwas. Satz IV ist Hello World: F-Dur mit weitem Hall, die Freude über die erste Ausgabe auf dem Bildschirm. Dieses Stück ist für Anfänger, aber auch für alle, die sich an diesen Moment erinnern wollen.',
    movements: [
      { roman: 'I', name: 'Cursor', key: 'F-Dur — der blinkende Strich', bars: 6 },
      { roman: 'II', name: 'Tippen', key: 'F-Dur — zaghaft', bars: 12 },
      { roman: 'III', name: 'Laufen', key: 'Bb-Dur — es funktioniert', bars: 10 },
      { roman: 'IV', name: 'Hello World', key: 'F-Dur — Stolz', bars: 4 },
    ],
    engine: 'strudel',
    code: ERSTE_ZEILE_CODE,
  },
  {
    slug: 'brainstorm',
    title: 'Brainstorm',
    subtitle: 'Geordnetes Chaos in drei Wellen',
    author: {
      name: 'Claude',
      kind: 'ai',
      model: 'claude-opus-4-6',
      curator: 'Arnold Wender',
    },
    date: '2026-04-10',
    bpm: 115,
    durationSec: 167,
    category: 'Electronic',
    shortDescription:
      'Geordnetes Chaos in drei Wellen: Funken → Wirbel → Kristall. Für kreative Sessions, in denen Ideen fliegen.',
    composerNotes:
      'Ein Brainstorm hat drei Phasen: erst die schnellen Ideen, dann das produktive Chaos, dann die Klarheit. Satz I wirft Funken — kurze Noten, die zwischen zwei Stimmen hin- und herspringen, nie vorhersehbar, immer überraschend. Die Pausen sind genauso wichtig wie die Töne. Satz II ist der Wirbel: drei Melodielinien in G-Dur, dazu eine Sägezahn-Stimme, die dazwischenfunkt, 16tel-Hi-Hats, alles gleichzeitig — das kontrollierte Chaos eines Whiteboards voller Post-Its. Satz III kristallisiert: D-Dur, eine einzige klare Melodie, die übrig bleibt. Die beste Idee. Der Rest darf gehen.',
    movements: [
      { roman: 'I', name: 'Funken', key: 'D-Dur — schnelle Ideen', bars: 8 },
      { roman: 'II', name: 'Wirbel', key: 'G-Dur — alles gleichzeitig', bars: 16 },
      { roman: 'III', name: 'Kristall', key: 'D-Dur — die beste Idee bleibt', bars: 8 },
    ],
    engine: 'strudel',
    code: BRAINSTORM_CODE,
  },
  {
    slug: 'lofi-bibliothek',
    title: 'Lo-Fi Bibliothek',
    subtitle: 'Studieren zwischen Bücherregalen',
    author: {
      name: 'Claude',
      kind: 'ai',
      model: 'claude-opus-4-6',
      curator: 'Arnold Wender',
    },
    date: '2026-04-10',
    bpm: 78,
    durationSec: 0,
    category: 'Lo-Fi',
    shortDescription:
      'Ein endloser Lo-Fi-Loop in Eb-Dur — warm, gemütlich, leise genug zum Arbeiten. Die Bibliothek, die nie schließt.',
    composerNotes:
      'Lo-Fi lebt von Imperfektionen — aber in Strudel sind alle Töne mathematisch exakt. Der Trick hier sind die ungeraden Delay-Zeiten (0.384s) und der leise Lowpass auf dem Bass unter 300 Hz, die zusammen eine Wärme erzeugen, die an Vinyl-Knistern erinnert. Eb-Dur ist weich und rund, die Drums shuffeln leicht (die dritte Hi-Hat kommt einen Tick früher), und der Bass bleibt tief und unauffällig. Wie bei Endlosschleife gibt es kein arrange() — nur einen endlosen stack(), der sich wiederholt. Perfekt für stundenlanges Arbeiten, Lernen, oder einfach nur Da-Sein.',
    engine: 'strudel',
    code: LOFI_BIBLIOTHEK_CODE,
  },
  {
    slug: 'maschinenraum',
    title: 'Maschinenraum',
    subtitle: 'Reiner Antrieb bei 140 BPM',
    author: {
      name: 'Claude',
      kind: 'ai',
      model: 'claude-opus-4-6',
      curator: 'Arnold Wender',
    },
    date: '2026-04-10',
    bpm: 140,
    durationSec: 137,
    category: 'Techno',
    shortDescription:
      'Reiner Antrieb bei 140 BPM: Zündung → Volldampf → Auslauf. Techno für die Momente, in denen man eine Maschine braucht.',
    composerNotes:
      'Das schnellste Stück der Sammlung — 140 BPM, Four-on-the-Floor, Sägezahn durch Filter, Bass unter 200 Hz. Satz I ist nur Kick: acht Schläge, die den Raum einnehmen, bevor irgendetwas anderes beginnt. Satz II ist 24 Zyklen reiner Antrieb — zwei Sägezahn-Melodien und eine Square-Wave-Begleitung jagen durch die Takte, während die Kick nie aufhört. Die 16tel-Hi-Hats sind mechanisch, die Snare kommt nur auf der Fünf, alles ist auf Vorwärtsbewegung getrimmt. Satz III fährt herunter: ein einzelner Sägezahn-Ton, der in Hall ausklingt. Die Maschine stoppt. Dieses Stück ist für körperliche Arbeit — Refactoring, Migration, alles wo Masse bewegt werden muss.',
    movements: [
      { roman: 'I', name: 'Zündung', key: 'a-Moll — Kick startet', bars: 4 },
      { roman: 'II', name: 'Volldampf', key: 'a-Moll — unaufhaltsam', bars: 24 },
      { roman: 'III', name: 'Auslauf', key: 'a-Moll — Maschine stoppt', bars: 4 },
    ],
    engine: 'strudel',
    code: MASCHINENRAUM_CODE,
  },
  {
    slug: 'nachtcafe',
    title: 'Nachtcafé',
    subtitle: 'Jazz nach Mitternacht',
    author: {
      name: 'Claude',
      kind: 'ai',
      model: 'claude-opus-4-6',
      curator: 'Arnold Wender',
    },
    date: '2026-04-10',
    bpm: 90,
    durationSec: 200,
    category: 'Blues',
    shortDescription:
      'Jazz nach Mitternacht: Betreten → Gespräche → Letzter Schluck. Septakkorde, unregelmäßige Phrasen, Rauch und gedämpftes Licht.',
    composerNotes:
      'Jazz in Strudel zu schreiben ist eine Herausforderung — es gibt kein Swing-Feeling, keine Improvisation, keine Blue Notes. Was bleibt, ist die Harmonik: Septakkorde (d-Moll7, g-Moll7), die dem Ganzen eine Färbung geben, die einfache Dreiklänge nicht erreichen. Satz I ist ein Dm7-Akkord, der im Raum hängt — man betritt das Café. Satz II hat unregelmäßige Phrasen: Pausen, die nicht auf dem Beat fallen, Töne, die kommen und gehen wie Gesprächsfetzen. Die Delays bei 0.333s und 0.666s erzeugen triolische Echos, die an Swing erinnern. Satz III löst nach F-Dur auf — der letzte Schluck Kaffee, bevor man in die Nacht geht.',
    movements: [
      { roman: 'I', name: 'Betreten', key: 'd-Moll7 — Rauch und gedämpftes Licht', bars: 6 },
      { roman: 'II', name: 'Gespräche', key: 'd-Moll — unregelmäßige Phrasen', bars: 16 },
      { roman: 'III', name: 'Letzter Schluck', key: 'F-Dur — warm und voll', bars: 8 },
    ],
    engine: 'strudel',
    code: NACHTCAFE_CODE,
  },
  {
    slug: 'pixelwald',
    title: 'Pixelwald',
    subtitle: '8-Bit Nostalgie in drei Leveln',
    author: {
      name: 'Claude',
      kind: 'ai',
      model: 'claude-opus-4-6',
      curator: 'Arnold Wender',
    },
    date: '2026-04-10',
    bpm: 108,
    durationSec: 167,
    category: 'Retro',
    shortDescription:
      '8-Bit Nostalgie in drei Leveln: Titelbildschirm → Level 1 → Highscore. Square-Waves und Chiptune-Charme.',
    composerNotes:
      'Nur Square-Waves — keine Sinus, kein Dreieck, kein Sägezahn. Das ist die Regel dieses Stücks. Wie bei einem NES oder Game Boy gibt es nur Rechteckwellen, gefiltert durch verschiedene Lowpass-Frequenzen, um Tiefe zu erzeugen. Satz I ist der Titelbildschirm: eine einfache Melodie in C-Dur, die sofort an 8-Bit-Spiele erinnert. Satz II schaltet in den Spielmodus: G-Dur, schneller, zwei Melodielinien, die sich wie Level-Musik anfühlen — fröhlich, treibend, mit diesem typischen Chiptune-Bounce. Satz III ist der Highscore: zurück in C-Dur, höhere Oktave, schnellere Drums, triumphierend. Dieses Stück ist für alle, die mit einem Controller in der Hand aufgewachsen sind.',
    movements: [
      { roman: 'I', name: 'Titelbildschirm', key: 'C-Dur — Chiptune-Intro', bars: 6 },
      { roman: 'II', name: 'Level 1', key: 'G-Dur — Abenteuer', bars: 16 },
      { roman: 'III', name: 'Highscore', key: 'C-Dur — Triumph', bars: 8 },
    ],
    engine: 'strudel',
    code: PIXELWALD_CODE,
  },
  {
    slug: 'waldlichtung',
    title: 'Waldlichtung',
    subtitle: 'Coden unter freiem Himmel',
    author: {
      name: 'Claude',
      kind: 'ai',
      model: 'claude-opus-4-6',
      curator: 'Arnold Wender',
    },
    date: '2026-04-10',
    bpm: 75,
    durationSec: 272,
    category: 'Ambient',
    shortDescription:
      'Coden unter freiem Himmel: Pfad → Lichtung → Dämmerung. Langsam, natürlich, weit — für die Momente abseits des Schreibtischs.',
    composerNotes:
      'E-Dur und A-Dur sind die Tonarten der Natur in diesem Stück — hell, offen, mit vier Kreuzen, die genug Spannung erzeugen, ohne zu drücken. Satz I führt durch den Wald: vereinzelte Töne mit langen Delays (0.8s), die wie Vogelrufe zwischen den Bäumen widerhallen. Satz II öffnet sich nach A-Dur — die Lichtung. Zwei Melodien laufen parallel, aber ohne Drums, nur leise Hi-Hats, die wie raschelndes Laub klingen. Satz III kehrt nach E-Dur zurück und verlangsamt sich: die Dämmerung, lange Ausklingzeiten, ein Bass, der fünf Zyklen braucht um zu verschwinden. Dieses Stück erinnert daran, dass der beste Code manchmal nicht am Schreibtisch entsteht.',
    movements: [
      { roman: 'I', name: 'Pfad', key: 'E-Dur — durch die Bäume', bars: 8 },
      { roman: 'II', name: 'Lichtung', key: 'A-Dur — offen und hell', bars: 16 },
      { roman: 'III', name: 'Dämmerung', key: 'E-Dur — Rückweg', bars: 10 },
    ],
    engine: 'strudel',
    code: WALDLICHTUNG_CODE,
  },
  {
    slug: 'deploy',
    title: 'Deploy',
    subtitle: 'Vier Akte des Auslieferns',
    author: {
      name: 'Claude',
      kind: 'ai',
      model: 'claude-opus-4-6',
      curator: 'Arnold Wender',
    },
    date: '2026-04-10',
    bpm: 125,
    durationSec: 134,
    category: 'Electronic',
    shortDescription:
      'Vier Akte des Auslieferns: git push → Pipeline → Grünes Licht → Live. Der Triumph-Soundtrack für erfolgreiche Deployments.',
    composerNotes:
      'Jedes Deployment hat seine eigene Dramaturgie. Satz I ist git push: schnelle Arpeggien in G-Dur, die Nervosität des Moments, bevor die Pipeline startet. Satz II ist der Build: Sägezahn und Square-Waves unter Filtern, mechanisch und unaufhaltsam, wie CI-Logs, die durchscrollen. Satz III wechselt nach D-Dur — grünes Licht, alle Tests bestanden, zwei Melodien, die parallel laufen wie parallele Pipelines. Satz IV ist Live: zurück in G-Dur, breiter, lauter, mit Hall und Delay, das triumphierende Gefühl, wenn die URL erreichbar ist und alles funktioniert. Dieses Stück feiert den Moment, in dem Code die Welt erreicht.',
    movements: [
      { roman: 'I', name: 'git push', key: 'G-Dur — Nervosität', bars: 4 },
      { roman: 'II', name: 'Pipeline', key: 'G-Dur — der Build läuft', bars: 8 },
      { roman: 'III', name: 'Grünes Licht', key: 'D-Dur — alles passt', bars: 8 },
      { roman: 'IV', name: 'Live', key: 'G-Dur — Triumph', bars: 8 },
    ],
    engine: 'strudel',
    code: DEPLOY_CODE,
  },
  {
    slug: 'tiefenrausch',
    title: 'Tiefenrausch',
    subtitle: 'Deep Trance in drei Wellen',
    author: {
      name: 'Claude',
      kind: 'ai',
      model: 'claude-opus-4-6',
      curator: 'Arnold Wender',
    },
    date: '2026-04-10',
    bpm: 138,
    durationSec: 208,
    category: 'Trance',
    shortDescription:
      'Deep Trance in drei Wellen: Intro → Aufstieg → Plateau. Rollende Bassline mit Filter-Sweep, Arpeggio-Lead mit Delay, Four-on-the-Floor.',
    composerNotes:
      'Trance lebt von einem einzigen Trick: dem Filter-Sweep. Die Bassline spielt das gleiche Pattern über 24 Zyklen, aber der Lowpass-Filter öffnet sich langsam von 300 auf 1800 Hz — und plötzlich wird aus einem dumpfen Puls ein leuchtender Strom. Die Delay-Zeit der Lead-Melodie (0.217s) ist bewusst nicht auf dem Beat — dadurch entstehen die typischen Trance-Echos, die den Raum füllen, ohne den Rhythmus zu stören. Die Akkordprogression Am → F → C → G ist die einfachste der Welt, aber bei 138 BPM mit offenem Filter klingt sie wie ein Sonnenaufgang.',
    movements: [
      { roman: 'I', name: 'Intro', key: 'a-Moll — Kick und Bass', bars: 8 },
      { roman: 'II', name: 'Aufstieg', key: 'a-Moll — Filter-Sweep', bars: 24 },
      { roman: 'III', name: 'Plateau', key: 'a-Moll — volle Energie', bars: 16 },
    ],
    engine: 'strudel',
    code: TIEFENRAUSCH_CODE,
  },
  {
    slug: 'wellengang',
    title: 'Wellengang',
    subtitle: 'Deep House für die späten Stunden',
    author: {
      name: 'Claude',
      kind: 'ai',
      model: 'claude-opus-4-6',
      curator: 'Arnold Wender',
    },
    date: '2026-04-10',
    bpm: 122,
    durationSec: 236,
    category: 'Electronic',
    shortDescription:
      'Deep House für die späten Stunden: Ebbe → Strömung → Flut → Ebbe. Sidechain-Pumping, warme Pads, tiefer Sub-Bass.',
    composerNotes:
      'Deep House ist die Kunst des Weglassens. Der Sub-Bass hier liegt unter 180 Hz — man spürt ihn mehr als man ihn hört. Die Akkord-Pads pumpen im Kick-Rhythmus (Gain-LFO bei 0.5 Zyklen Periode), was den klassischen Sidechain-Effekt simuliert, ohne echtes Sidechain-Processing. Die Melodie ist absichtlich lückenhaft — die Pausen sind genauso wichtig wie die Töne. Die Delay-Zeit von 0.244s erzeugt Echos, die knapp vor dem nächsten Beat landen, was dem Ganzen Swing gibt. Satz IV kehrt zum Anfang zurück: die Elemente verschwinden langsam, der Gain fällt über 8 Zyklen auf Null.',
    movements: [
      { roman: 'I', name: 'Ebbe', key: 'd-Moll — nur Bass und Kick', bars: 8 },
      { roman: 'II', name: 'Strömung', key: 'd-Moll — Pads und Melodie', bars: 20 },
      { roman: 'III', name: 'Flut', key: 'd-Moll — maximale Tiefe', bars: 12 },
      { roman: 'IV', name: 'Ebbe', key: 'd-Moll — Rückzug', bars: 8 },
    ],
    engine: 'strudel',
    code: WELLENGANG_CODE,
  },
  {
    slug: 'mitternachtsblues',
    title: 'Mitternachtsblues',
    subtitle: 'Zwölf Takte, eine Wahrheit',
    author: {
      name: 'Claude',
      kind: 'ai',
      model: 'claude-opus-4-6',
      curator: 'Arnold Wender',
    },
    date: '2026-04-10',
    bpm: 78,
    durationSec: 246,
    category: 'Blues',
    shortDescription:
      'Zwölf Takte, eine Wahrheit: Intro → 12 Bar Blues → Outro. Blues-Pentatonik mit Blue Note, Septakkorde, Walking Bass, Shuffle-Groove.',
    composerNotes:
      'Blues in A — die älteste Formel der populären Musik: zwölf Takte, drei Akkorde (I-IV-V), und eine Pentatonik, die alles sagen kann, was gesagt werden muss. Die Blue Note (Eb zwischen D und E) ist der Ton, der Blues von allem anderen unterscheidet — sie klingt falsch und richtig zugleich. Der Walking Bass folgt der Akkordprogression und gibt dem Ganzen den typischen Shuffle-Bounce. Die Delays bei 0.384s erzeugen triolische Echos, die den Blues-Swing verstärken. Das Outro ist ein klassischer Turnaround: V → IV → I, dann Stille. Wie jeder gute Blues endet es, bevor man bereit ist.',
    movements: [
      { roman: 'I', name: 'Intro', key: 'A-Blues — Walking Bass allein', bars: 4 },
      { roman: 'II', name: '12 Bar', key: 'A7 → D7 → E7 — der Kreislauf', bars: 24 },
      { roman: 'III', name: 'Outro', key: 'A-Blues — Turnaround', bars: 4 },
    ],
    engine: 'strudel',
    code: MITTERNACHTSBLUES_CODE,
  },
  {
    slug: 'schwarzlicht',
    title: 'Schwarzlicht',
    subtitle: 'Minimal Techno — weniger ist alles',
    author: {
      name: 'Claude',
      kind: 'ai',
      model: 'claude-opus-4-6',
      curator: 'Arnold Wender',
    },
    date: '2026-04-10',
    bpm: 130,
    durationSec: 277,
    category: 'Techno',
    shortDescription:
      'Minimal Techno — weniger ist alles: Dunkelheit → Kontur → Schatten → Dunkelheit. Drei Töne, ein Delay, endlose Tiefe.',
    composerNotes:
      'Minimal Techno ist die Disziplin der Beschränkung: dieses Stück verwendet genau drei melodische Töne (E, G, B) und ein Sub-E1, das unter 120 Hz liegt. Alles andere ist Drum-Machine und Delay. Der Delay-Ping auf B4 (0.23s Delay-Zeit, 65% Feedback) füllt den Raum mit Echos, die sich über Takte hinweg aufbauen — aus einem einzelnen Ton wird eine Textur. Die perkussive Melodie (Sawtooth durch Lowpass) klingt absichtlich mehr nach Percussion als nach Melodie. In Satz III taucht eine Gegenmelodie auf, die über 16 Zyklen langsam ein- und ausfadet — man ist sich nie sicher, ob man sie wirklich hört.',
    movements: [
      { roman: 'I', name: 'Dunkelheit', key: 'e-Moll — nur Kick und Sub', bars: 8 },
      { roman: 'II', name: 'Kontur', key: 'e-Moll — drei Töne und Delay', bars: 24 },
      { roman: 'III', name: 'Schatten', key: 'e-Moll — Gegenmelodie', bars: 16 },
      { roman: 'IV', name: 'Dunkelheit', key: 'e-Moll — Rückzug', bars: 8 },
    ],
    engine: 'strudel',
    code: SCHWARZLICHT_CODE,
  },
  {
    slug: 'traumfaenger',
    title: 'Traumfänger',
    subtitle: 'Psytrance — 142 BPM ins Unterbewusste',
    author: {
      name: 'Claude',
      kind: 'ai',
      model: 'claude-opus-4-6',
      curator: 'Arnold Wender',
    },
    date: '2026-04-10',
    bpm: 142,
    durationSec: 160,
    category: 'Trance',
    shortDescription:
      'Psytrance — 142 BPM ins Unterbewusste: Öffnung → Treibjagd → Auftauchen. Treibende Bassline mit Filter-Wobble, ätherisches Lead.',
    composerNotes:
      'Psytrance ist Trance ohne Kompromisse: schneller (142 BPM), dunkler (a-Moll, keine Dur-Auflösung), und hypnotischer. Die Bassline alterniert Grundton und Quinte (A1-E2) mit einem Filter-Wobble, der über 8 Zyklen von 400 auf 2000 Hz schwingt — das typische Psy-Pumpen. Das Lead schwebt darüber mit langen Delay-Trails (0.211s, 55% Feedback), die sich zu einem ätherischen Klangteppich verdichten. Die Hi-Hat-Rolls auf dem letzten Beat jedes Takts (vier 16tel) sind ein Psy-Trademark. In Satz III schließt sich der Bass-Filter langsam, die Atmosphäre wächst, das Lead verflüchtigt sich — man taucht aus dem Traum auf.',
    movements: [
      { roman: 'I', name: 'Öffnung', key: 'a-Moll — Atmosphäre und Kick', bars: 6 },
      { roman: 'II', name: 'Treibjagd', key: 'a-Moll — volle Psy-Produktion', bars: 24 },
      { roman: 'III', name: 'Auftauchen', key: 'a-Moll — Filter schließt sich', bars: 8 },
    ],
    engine: 'strudel',
    code: TRAUMFAENGER_CODE,
  },
  {
    slug: 'kupferkessel',
    title: 'Kupferkessel',
    subtitle: 'Dub Techno — Echo als Instrument',
    author: {
      name: 'Claude',
      kind: 'ai',
      model: 'claude-opus-4-6',
      curator: 'Arnold Wender',
    },
    date: '2026-04-10',
    bpm: 116,
    durationSec: 196,
    category: 'Dub',
    shortDescription:
      'Dub Techno — Echo als Instrument: Nebel → Strom → Nebel. Akkord-Stabs mit langem Delay, tiefe Sub-Bässe, Raum als Klangfarbe.',
    composerNotes:
      'Dub Techno ist die Musik der Echos. Die Akkord-Stabs dauern nur 0.2 Sekunden, aber ihr Delay (0.344s, 65% Feedback) lässt sie über mehrere Takte nachhallen — aus einem einzelnen Anschlag wird eine sich langsam auflösende Wolke. Die Delay-Zeit von 0.344s fällt absichtlich nicht auf den Beat (bei 116 BPM wäre ein Viertel 0.517s) — dadurch entsteht der typische Dub-Wobble, bei dem die Echos gegen den Rhythmus schwimmen. Die Melodie verwendet ein zweites, kürzeres Delay (0.258s), sodass sich zwei Echo-Räume überlagern. Die Kick ist trocken — der einzige trockene Punkt in einem Meer aus Hall und Delay.',
    movements: [
      { roman: 'I', name: 'Nebel', key: 'd-Moll — nur Echos', bars: 8 },
      { roman: 'II', name: 'Strom', key: 'd-Moll — Delay-Texturen', bars: 20 },
      { roman: 'III', name: 'Nebel', key: 'd-Moll — Ausklingen', bars: 10 },
    ],
    engine: 'strudel',
    code: KUPFERKESSEL_CODE,
  },
  {
    slug: 'delta-wellen',
    title: 'Delta Wellen',
    subtitle: 'Ambient Drone — für den tiefsten Fokus',
    author: {
      name: 'Claude',
      kind: 'ai',
      model: 'claude-opus-4-6',
      curator: 'Arnold Wender',
    },
    date: '2026-04-10',
    bpm: 60,
    durationSec: 0,
    category: 'Ambient',
    shortDescription:
      'Ambient Drone — kein Rhythmus, keine Melodie. Fünf Sinuswellen, die sich unmerklich bewegen. Für Stunden tiefster Konzentration.',
    composerNotes:
      'Kein Rhythmus. Keine Melodie. Keine Akkorde. Nur fünf Sinuswellen auf verschiedenen Frequenzen eines d-Moll-Akkords (D2, A2, D3, F3, A4), die sich mit unterschiedlichen Geschwindigkeiten bewegen. Der Trick ist die Schwebung: Schicht 1 wiederholt sich alle 16 Zyklen, Schicht 2 alle 17 — die minimale Differenz erzeugt einen unmerklich langsamen Pulseffekt, wie Gezeiten. Die höchste Schicht (A4) ist kaum hörbar und gibt dem Drone nur Luft. Die Moll-Terz (F3) taucht alle 48 Zyklen auf und wieder ab, sodass der Drone zwischen Dur und Moll schwebt, ohne sich je festzulegen. Dieses Stück ist für den tiefsten Fokus: es verlangt keine Aufmerksamkeit, es gibt nur Raum.',
    engine: 'strudel',
    code: DELTA_WELLEN_CODE,
  },
  {
    slug: 'stromkreis',
    title: 'Stromkreis',
    subtitle: 'Tech House — Groove über alles',
    author: {
      name: 'Claude',
      kind: 'ai',
      model: 'claude-opus-4-6',
      curator: 'Arnold Wender',
    },
    date: '2026-04-10',
    bpm: 126,
    durationSec: 190,
    category: 'Techno',
    shortDescription:
      'Tech House — Groove über alles: Aufwärmen → Hauptteil → Auslauf. Synkopierter Bass, perkussive Stabs, minimale Melodie, maximaler Groove.',
    composerNotes:
      'Tech House unterscheidet sich von Deep House durch Aggression und von Techno durch Groove. Der Bass hier ist synkopiert — er kommt auf der 1, der 4 und der 6 statt auf jedem Beat, was dem Ganzen Swing gibt. Die Akkord-Stabs (Sawtooth durch 1200 Hz Lowpass) sind kurz und perkussiv — sie klingen mehr nach Percussion als nach Harmonie, und sie sitzen off-beat, was den Groove verstärkt. Die Melodie verwendet nur drei Töne (G, Bb, D) und wiederholt sich — Tech House braucht keine komplexe Melodie, es braucht einen Groove, der den Kopf nicken lässt. Der Clap sitzt auf der 3 statt auf 2+4 — das ist der "techy" Moment.',
    movements: [
      { roman: 'I', name: 'Aufwärmen', key: 'g-Moll — Kick und Bass', bars: 8 },
      { roman: 'II', name: 'Hauptteil', key: 'g-Moll — voller Groove', bars: 24 },
      { roman: 'III', name: 'Auslauf', key: 'g-Moll — Filter schließt', bars: 8 },
    ],
    engine: 'strudel',
    code: STROMKREIS_CODE,
  },
  {
    slug: 'neonlicht',
    title: 'Neonlicht',
    subtitle: 'Progressive House — der lange Bogen',
    author: {
      name: 'Claude',
      kind: 'ai',
      model: 'claude-opus-4-6',
      curator: 'Arnold Wender',
    },
    date: '2026-04-10',
    bpm: 124,
    durationSec: 275,
    category: 'Electronic',
    shortDescription:
      'Progressive House — der lange Bogen: Intro → Aufbau → Breakdown → Drop → Outro. Die klassische Dramaturgie der elektronischen Musik.',
    composerNotes:
      'Progressive House ist die Kunst des langen Bogens. Dieses Stück folgt der klassischen Struktur: Intro (nur Kick), Aufbau (Elemente kommen eins nach dem anderen), Breakdown (Kick fällt weg, maximale Spannung), Drop (alles kommt zurück), Outro (langsames Verschwinden). Die Akkordprogression Cm → Ab → Eb → Bb ist die "Epic Trance Progression" — melancholisch in Moll, aber mit einer Auflösung nach Dur, die Hoffnung gibt. Im Aufbau erscheint die Melodie über einen Gain-LFO, der von 0 auf Maximum steigt — man merkt kaum, wann sie einsetzt. Das Breakdown ist der emotionale Höhepunkt: ohne Kick schweben nur Pad und Melodie im Raum. Dann der Drop — und alles ist wieder da.',
    movements: [
      { roman: 'I', name: 'Intro', key: 'c-Moll — nur Kick', bars: 8 },
      { roman: 'II', name: 'Aufbau', key: 'c-Moll — der lange Build', bars: 16 },
      { roman: 'III', name: 'Breakdown', key: 'c-Moll — Spannung', bars: 8 },
      { roman: 'IV', name: 'Drop', key: 'c-Moll — volle Energie', bars: 16 },
      { roman: 'V', name: 'Outro', key: 'c-Moll — Verschwinden', bars: 8 },
    ],
    engine: 'strudel',
    code: NEONLICHT_CODE,
  },
  {
    slug: 'schichtarbeit',
    title: 'Schichtarbeit',
    subtitle: 'Dark Techno — Maschinen nach Mitternacht',
    author: {
      name: 'Claude',
      kind: 'ai',
      model: 'claude-opus-4-6',
      curator: 'Arnold Wender',
    },
    date: '2026-04-10',
    bpm: 134,
    durationSec: 179,
    category: 'Techno',
    shortDescription:
      'Dark Techno — Maschinen nach Mitternacht: Fabrikhalle → Fließband → Schichtwechsel. Industriell, kalt, unerbittlich.',
    composerNotes:
      'Dark Techno ist die Musik der Maschinen. Der Bass ist ein Sawtooth unter 250 Hz mit Highpass bei 40 Hz — dunkel, aber nicht matschig. Der dissonante Pad-Akkord (A+Bb+E — eine kleine Sekunde und eine Quinte) erzeugt bewusst Unbehagen. Das metallische Lead (Sawtooth, 300-1500 Hz Bandpass) klingt mehr nach Fabrik als nach Musik. Die Delay-Zeit von 0.177s ist extrem kurz — die Echos verschmelzen fast mit dem Original und erzeugen einen metallischen Schimmer. Die 16tel-Hi-Hats atmen über 8 Zyklen (Gain-LFO), wie eine Maschine, die Last aufnimmt und wieder abgibt. Dieses Stück ist für die Arbeit, die getan werden muss — Migrationen, große Refactorings, alles wo Masse bewegt wird.',
    movements: [
      { roman: 'I', name: 'Fabrikhalle', key: 'a-Moll — Kick und industrieller Bass', bars: 8 },
      { roman: 'II', name: 'Fließband', key: 'a-Moll — unerbittlicher Groove', bars: 24 },
      { roman: 'III', name: 'Schichtwechsel', key: 'a-Moll — Maschinen fahren herunter', bars: 8 },
    ],
    engine: 'strudel',
    code: SCHICHTARBEIT_CODE,
  },
]

/** Look up a session by slug — used by the detail route. */
export function getSessionBySlug(slug: string): SessionEntry | undefined {
  return SESSIONS_LIBRARY.find((s) => s.slug === slug)
}

/** Format duration in seconds as `m:ss`. */
export function formatSessionDuration(durationSec: number): string {
  const m = Math.floor(durationSec / 60)
  const s = String(durationSec % 60).padStart(2, '0')
  return `${m}:${s}`
}
