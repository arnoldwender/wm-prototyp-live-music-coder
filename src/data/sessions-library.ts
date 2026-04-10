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
