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
    date: '2026-04-09',
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
