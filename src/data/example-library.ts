/* SPDX-License-Identifier: MIT
   Copyright (c) 2026 Arnold Wender / Wender Media
   ──────────────────────────────────────────────────────────
   Example pattern library — 165+ curated patterns across
   Strudel, Tone.js, and Web Audio engines.
   Organized by category and difficulty level.
   Used by the /examples browseable library page.
   ────────────────────────────────────────────────────────── */

/** Single example pattern entry */
export interface ExampleEntry {
  id: string;
  name: string;
  category: string;
  description: string;
  engine: 'strudel' | 'tonejs' | 'webaudio';
  code: string;
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  tags: string[];
}

/** All example patterns */
export const EXAMPLE_LIBRARY: ExampleEntry[] = [

  /* ══════════════════════════════════════════════════════════
     Beginner — simple patterns for learning the basics
     ══════════════════════════════════════════════════════════ */
  {
    id: 'beginner-first-sound',
    name: 'Your First Sound',
    category: 'Beginner',
    description: 'Play a single bass drum — the simplest possible pattern',
    engine: 'strudel',
    code: `s("bd")`,
    difficulty: 'beginner',
    tags: ['first', 'simple', 'kick', 'start'],
  },
  {
    id: 'beginner-four-on-floor',
    name: 'Four on the Floor',
    category: 'Beginner',
    description: 'The most basic dance beat — kick on every beat',
    engine: 'strudel',
    code: `s("bd bd bd bd")`,
    difficulty: 'beginner',
    tags: ['kick', 'basic', 'dance', '4x4'],
  },
  {
    id: 'beginner-kick-snare',
    name: 'Kick + Snare',
    category: 'Beginner',
    description: 'Classic rock beat foundation — kick and snare alternating',
    engine: 'strudel',
    code: `s("bd sd bd sd")`,
    difficulty: 'beginner',
    tags: ['kick', 'snare', 'basic', 'rock'],
  },
  {
    id: 'beginner-add-hihats',
    name: 'Add Hi-Hats',
    category: 'Beginner',
    description: 'Layer hi-hats on top of kick and snare using stack()',
    engine: 'strudel',
    code: `stack(
  s("bd sd bd sd"),
  s("hh*8").gain(0.4)
)`,
    difficulty: 'beginner',
    tags: ['hihat', 'stack', 'layer', 'drums'],
  },
  {
    id: 'beginner-first-melody',
    name: 'First Melody',
    category: 'Beginner',
    description: 'Play a simple C major arpeggio with a sawtooth synth',
    engine: 'strudel',
    code: `note("c3 e3 g3 c4")
.s("sawtooth")
.lpf(800)
.gain(0.5)`,
    difficulty: 'beginner',
    tags: ['melody', 'note', 'arpeggio', 'synth'],
  },
  {
    id: 'beginner-rest-silence',
    name: 'Using Rests',
    category: 'Beginner',
    description: 'The tilde ~ creates silence — essential for groove',
    engine: 'strudel',
    code: `s("bd ~ sd ~")`,
    difficulty: 'beginner',
    tags: ['rest', 'silence', 'tilde', 'groove'],
  },
  {
    id: 'beginner-speed-up',
    name: 'Subdivisions',
    category: 'Beginner',
    description: 'Use * to repeat sounds within a step — hh*4 plays 4 hi-hats',
    engine: 'strudel',
    code: `stack(
  s("bd ~ bd ~"),
  s("~ sd ~ sd"),
  s("hh*4").gain(0.4)
)`,
    difficulty: 'beginner',
    tags: ['subdivision', 'multiply', 'fast', 'hihat'],
  },
  {
    id: 'beginner-samples',
    name: 'Try Different Samples',
    category: 'Beginner',
    description: 'Explore different drum samples — cp, oh, rim, lt',
    engine: 'strudel',
    code: `stack(
  s("bd ~ bd ~"),
  s("~ cp ~ cp"),
  s("oh*2").gain(0.3),
  s("rim*4").gain(0.2)
)`,
    difficulty: 'beginner',
    tags: ['samples', 'explore', 'clap', 'variety'],
  },
  {
    id: 'beginner-chords',
    name: 'First Chords',
    category: 'Beginner',
    description: 'Play notes together using comma — creates a chord',
    engine: 'strudel',
    code: `note("[c3,e3,g3] [f3,a3,c4] [a2,c3,e3] [g2,b2,d3]")
.s("sawtooth")
.lpf(600)
.gain(0.3)
.room(0.5)`,
    difficulty: 'beginner',
    tags: ['chords', 'harmony', 'comma', 'progression'],
  },
  {
    id: 'beginner-effects',
    name: 'Adding Effects',
    category: 'Beginner',
    description: 'Chain effects — reverb with room(), echo with delay()',
    engine: 'strudel',
    code: `note("c4 e4 g4 c5")
.s("triangle")
.gain(0.4)
.room(0.6)
.delay(0.3)
.lpf(1200)`,
    difficulty: 'beginner',
    tags: ['effects', 'reverb', 'delay', 'filter'],
  },

  /* ══════════════════════════════════════════════════════════
     Drums — beat patterns across genres
     ══════════════════════════════════════════════════════════ */
  {
    id: 'drums-simple-beat',
    name: 'Simple Beat',
    category: 'Drums',
    description: 'Standard pop/rock drum beat with kick, snare, and hi-hats',
    engine: 'strudel',
    code: `stack(
  s("bd ~ bd ~").gain(1),
  s("~ sd ~ sd").gain(0.9),
  s("hh*8").gain(0.4)
)`,
    difficulty: 'beginner',
    tags: ['drums', 'pop', 'rock', 'simple'],
  },
  {
    id: 'drums-house',
    name: 'House Beat',
    category: 'Drums',
    description: 'Classic 4/4 house groove with open hi-hat offbeats',
    engine: 'strudel',
    code: `stack(
  s("bd bd bd bd").gain(1),
  s("~ cp ~ cp").gain(0.8),
  s("~ oh ~ oh").gain(0.3),
  s("hh*8").gain(0.35).pan(sine.range(0.3, 0.7))
)`,
    difficulty: 'beginner',
    tags: ['house', 'dance', '4x4', 'electronic'],
  },
  {
    id: 'drums-techno',
    name: 'Techno Pulse',
    category: 'Drums',
    description: 'Driving techno beat with pounding kick and metallic hats',
    engine: 'strudel',
    code: `stack(
  s("bd bd bd bd").gain(1.1),
  s("~ [~ sd] ~ sd").gain(0.7),
  s("hh*16").gain(rand.range(0.2, 0.5)),
  s("oh(3,8)").gain(0.25)
)`,
    difficulty: 'intermediate',
    tags: ['techno', 'driving', 'hard', 'industrial'],
  },
  {
    id: 'drums-trap',
    name: 'Trap Pattern',
    category: 'Drums',
    description: 'Trap beat with rolling hi-hats and 808 sub kick',
    engine: 'strudel',
    code: `stack(
  s("808bd ~ ~ ~ 808bd ~ ~ ~").gain(1),
  s("~ ~ ~ ~ ~ sd ~ ~").gain(0.8),
  s("hh hh hh [hh hh hh hh] hh hh [hh hh hh] hh").gain(0.4),
  s("~ ~ oh ~").gain(0.3)
)`,
    difficulty: 'intermediate',
    tags: ['trap', 'hiphop', '808', 'rolling'],
  },
  {
    id: 'drums-dnb',
    name: 'Drum & Bass',
    category: 'Drums',
    description: 'Fast DnB pattern with syncopated kick and snare',
    engine: 'strudel',
    code: `stack(
  s("bd ~ ~ bd ~ ~ bd ~").gain(1),
  s("~ ~ sd ~ ~ sd ~ ~").gain(0.85),
  s("hh*16").gain(0.3),
  s("oh(3,8)").gain(0.2)
).fast(1.4)`,
    difficulty: 'intermediate',
    tags: ['dnb', 'jungle', 'fast', 'syncopated'],
  },
  {
    id: 'drums-breakbeat',
    name: 'Complex Breakbeat',
    category: 'Drums',
    description: 'Intricate breakbeat with ghost notes and fills',
    engine: 'strudel',
    code: `stack(
  s("bd ~ [bd ~] ~ bd ~ ~ [~ bd]").gain(1),
  s("~ sd ~ [sd ~] ~ sd ~ sd").gain(0.8),
  s("hh*8").gain(0.3).sometimes(x => x.speed(1.5)),
  s("oh(2,8)").gain(0.2),
  s("rim(3,8)").gain(0.15)
)`,
    difficulty: 'advanced',
    tags: ['breakbeat', 'complex', 'ghost', 'fill'],
  },
  {
    id: 'drums-reggaeton',
    name: 'Reggaeton Dembow',
    category: 'Drums',
    description: 'Classic dembow rhythm — the backbone of reggaeton',
    engine: 'strudel',
    code: `stack(
  s("bd ~ ~ bd ~ ~ bd ~").gain(1),
  s("~ ~ sd ~ ~ sd ~ ~").gain(0.8),
  s("hh*8").gain(0.35),
  s("~ rim ~ rim").gain(0.3)
)`,
    difficulty: 'beginner',
    tags: ['reggaeton', 'dembow', 'latin', 'tropical'],
  },
  {
    id: 'drums-euclidean-kit',
    name: 'Euclidean Drum Kit',
    category: 'Drums',
    description: 'Each drum layer uses Euclidean distribution for organic feel',
    engine: 'strudel',
    code: `stack(
  s("bd(3,8)").gain(1),
  s("sd(2,8)").gain(0.8),
  s("hh(7,16)").gain(0.35),
  s("oh(1,8)").gain(0.25),
  s("rim(5,16)").gain(0.2)
)`,
    difficulty: 'intermediate',
    tags: ['euclidean', 'algorithmic', 'organic', 'math'],
  },
  {
    id: 'drums-halftime',
    name: 'Half-Time Feel',
    category: 'Drums',
    description: 'Heavy half-time beat for dubstep and hip-hop',
    engine: 'strudel',
    code: `stack(
  s("bd ~ ~ ~ ~ ~ ~ ~").gain(1.1),
  s("~ ~ ~ ~ sd ~ ~ ~").gain(0.9),
  s("hh*8").gain(0.3),
  s("~ ~ ~ oh ~ ~ ~ ~").gain(0.2)
).slow(1.5)`,
    difficulty: 'beginner',
    tags: ['halftime', 'dubstep', 'heavy', 'slow'],
  },
  {
    id: 'drums-polyrhythm',
    name: 'Polyrhythmic Drums',
    category: 'Drums',
    description: 'Layered patterns with 3-against-4 polyrhythm',
    engine: 'strudel',
    code: `stack(
  s("bd(3,8)").gain(1),
  s("sd(4,12)").gain(0.7),
  s("hh(5,8)").gain(0.35),
  s("rim(7,16)").gain(0.2),
  s("oh(2,12)").gain(0.25)
)`,
    difficulty: 'advanced',
    tags: ['polyrhythm', 'complex', 'african', 'layers'],
  },

  /* ══════════════════════════════════════════════════════════
     Bass — bassline patterns
     ══════════════════════════════════════════════════════════ */
  {
    id: 'bass-sub',
    name: 'Deep Sub Bass',
    category: 'Bass',
    description: 'Ultra-low sub bass with minimal movement',
    engine: 'strudel',
    code: `note("<c1 c1 eb1 f1>(3,8)")
.s("sine")
.gain(0.8)
.lpf(200)
.sustain(0.3)`,
    difficulty: 'beginner',
    tags: ['sub', 'bass', 'deep', 'low', 'minimal'],
  },
  {
    id: 'bass-acid',
    name: 'Acid Bassline',
    category: 'Bass',
    description: 'TB-303 inspired acid line with resonant filter sweep',
    engine: 'strudel',
    code: `note("c2 [c2 c3] eb2 [~ f2]")
.s("sawtooth")
.lpf(sine.range(200, 3000).slow(4))
.resonance(15)
.decay(0.1)
.sustain(0)`,
    difficulty: 'intermediate',
    tags: ['acid', '303', 'filter', 'resonance', 'squelch'],
  },
  {
    id: 'bass-walking',
    name: 'Walking Bass',
    category: 'Bass',
    description: 'Jazz-style walking bassline moving through chord tones',
    engine: 'strudel',
    code: `note("c2 e2 g2 a2 f2 a2 c3 a2")
.s("triangle")
.lpf(500)
.gain(0.7)
.sustain(0.2)`,
    difficulty: 'intermediate',
    tags: ['walking', 'jazz', 'upright', 'groove'],
  },
  {
    id: 'bass-slap',
    name: 'Slap Bass Groove',
    category: 'Bass',
    description: 'Funky slap bass pattern with octave jumps',
    engine: 'strudel',
    code: `note("c2 ~ c3 c2 ~ eb2 ~ f2")
.s("sawtooth")
.lpf(1200)
.gain(0.6)
.decay(0.05)
.sustain(0)`,
    difficulty: 'intermediate',
    tags: ['slap', 'funk', 'octave', 'groove'],
  },
  {
    id: 'bass-reese',
    name: 'Reese Bass',
    category: 'Bass',
    description: 'Detuned sawtooth bass for jungle and DnB',
    engine: 'strudel',
    code: `note("c1 ~ c1 ~ eb1 ~ f1 ~")
.s("sawtooth")
.lpf(sine.range(100, 800).slow(8))
.gain(0.6)
.room(0.2)`,
    difficulty: 'intermediate',
    tags: ['reese', 'jungle', 'dnb', 'detuned', 'dark'],
  },
  {
    id: 'bass-wobble',
    name: 'Wobble Bass',
    category: 'Bass',
    description: 'Dubstep-style wobble with LFO-modulated filter',
    engine: 'strudel',
    code: `note("c1 c1 c1 c1")
.s("sawtooth")
.lpf(sine.range(100, 2000).fast(2))
.gain(0.6)
.sustain(0.5)`,
    difficulty: 'intermediate',
    tags: ['wobble', 'dubstep', 'lfo', 'filter'],
  },
  {
    id: 'bass-808-bounce',
    name: '808 Bass Bounce',
    category: 'Bass',
    description: 'Long 808 bass hits with pitch slides',
    engine: 'strudel',
    code: `note("c1 ~ ~ c1 ~ ~ eb1 ~")
.s("sine")
.gain(0.9)
.sustain(0.5)
.lpf(300)
.decay(0.3)`,
    difficulty: 'beginner',
    tags: ['808', 'bounce', 'trap', 'hip-hop'],
  },
  {
    id: 'bass-funk',
    name: 'Funk Bass',
    category: 'Bass',
    description: 'Syncopated funk bassline with chromatic passing tones',
    engine: 'strudel',
    code: `note("c2 ~ eb2 e2 ~ g2 ~ c2")
.s("sawtooth")
.lpf(800)
.gain(0.6)
.sustain(0.15)
.decay(0.1)`,
    difficulty: 'intermediate',
    tags: ['funk', 'syncopated', 'chromatic', 'groove'],
  },

  /* ══════════════════════════════════════════════════════════
     Melody — melodic patterns
     ══════════════════════════════════════════════════════════ */
  {
    id: 'melody-simple-scale',
    name: 'Simple Scale',
    category: 'Melody',
    description: 'C major scale ascending and descending',
    engine: 'strudel',
    code: `note("c4 d4 e4 f4 g4 a4 b4 c5")
.s("sawtooth")
.lpf(1200)
.gain(0.4)
.room(0.3)`,
    difficulty: 'beginner',
    tags: ['scale', 'major', 'ascending', 'simple'],
  },
  {
    id: 'melody-arpeggio',
    name: 'Classic Arpeggio',
    category: 'Melody',
    description: 'Fast arpeggiated chord with triangle wave',
    engine: 'strudel',
    code: `note("c4 e4 g4 b4 c5 b4 g4 e4")
.s("triangle")
.lpf(1200)
.gain(0.5)
.delay(0.25)
.delaytime(0.125)
.room(0.3)`,
    difficulty: 'beginner',
    tags: ['arpeggio', 'chord', 'triangle', 'classic'],
  },
  {
    id: 'melody-chord-progression',
    name: 'Chord Progression',
    category: 'Melody',
    description: 'I-V-vi-IV pop chord progression with warm pads',
    engine: 'strudel',
    code: `note("<[c3,e3,g3] [g2,b2,d3] [a2,c3,e3] [f2,a2,c3]>")
.s("sawtooth")
.lpf(sine.range(400, 1500).slow(8))
.gain(0.3)
.room(0.6)`,
    difficulty: 'intermediate',
    tags: ['chords', 'progression', 'pop', 'pads'],
  },
  {
    id: 'melody-pentatonic',
    name: 'Pentatonic Melody',
    category: 'Melody',
    description: 'Wandering melody using the pentatonic scale — always sounds good',
    engine: 'strudel',
    code: `note("c4 d4 e4 g4 a4 g4 e4 d4".shuffle())
.s("triangle")
.gain(0.4)
.lpf(1000)
.room(0.5)
.delay(0.2)`,
    difficulty: 'beginner',
    tags: ['pentatonic', 'shuffle', 'wandering', 'melodic'],
  },
  {
    id: 'melody-minor-key',
    name: 'Minor Key Melody',
    category: 'Melody',
    description: 'Dark minor key melody with filter movement',
    engine: 'strudel',
    code: `note("c4 eb4 f4 g4 ab4 g4 f4 eb4")
.s("sawtooth")
.lpf(sine.range(400, 2000).slow(4))
.gain(0.4)
.room(0.4)
.delay(0.15)`,
    difficulty: 'intermediate',
    tags: ['minor', 'dark', 'emotional', 'filter'],
  },
  {
    id: 'melody-call-response',
    name: 'Call & Response',
    category: 'Melody',
    description: 'Two alternating melodic phrases that answer each other',
    engine: 'strudel',
    code: `stack(
  note("c4 e4 g4 ~").s("sawtooth")
    .lpf(1500).gain(0.4),
  note("~ ~ ~ [c5 b4 g4 e4]").s("triangle")
    .lpf(1200).gain(0.35).delay(0.2)
)`,
    difficulty: 'intermediate',
    tags: ['call', 'response', 'dialogue', 'two-voice'],
  },
  {
    id: 'melody-ostinato',
    name: 'Hypnotic Ostinato',
    category: 'Melody',
    description: 'Repeating melodic figure with slowly changing filter',
    engine: 'strudel',
    code: `note("c4 eb4 g4 c5 g4 eb4")
.s("square")
.lpf(sine.range(300, 3000).slow(16))
.gain(0.3)
.delay(0.3)
.delaytime(0.166)
.room(0.4)`,
    difficulty: 'intermediate',
    tags: ['ostinato', 'hypnotic', 'repeating', 'minimal'],
  },
  {
    id: 'melody-bell',
    name: 'Bell Melody',
    category: 'Melody',
    description: 'Bright bell-like tones with long reverb tail',
    engine: 'strudel',
    code: `note("c5 g4 e5 c5 a4 g4 e4 c4".shuffle())
.s("sine")
.gain(0.35)
.room(0.8)
.delay(0.4)
.delaytime(0.25)
.decay(0.3)
.sustain(0)`,
    difficulty: 'intermediate',
    tags: ['bell', 'bright', 'reverb', 'crystalline'],
  },

  /* ══════════════════════════════════════════════════════════
     Ambient — atmospheric textures
     ══════════════════════════════════════════════════════════ */
  {
    id: 'ambient-drone',
    name: 'Ambient Drone',
    category: 'Ambient',
    description: 'Slow evolving drone with deep reverb — meditative',
    engine: 'strudel',
    code: `note("<c2 [c2,g2] [c2,e2] [c2,g2,c3]>")
.s("sine")
.gain(0.2)
.lpf(sine.range(200, 800).slow(16))
.room(0.9)
.delay(0.5)
.slow(4)`,
    difficulty: 'beginner',
    tags: ['drone', 'meditative', 'slow', 'deep'],
  },
  {
    id: 'ambient-shimmer',
    name: 'Shimmering Texture',
    category: 'Ambient',
    description: 'Crystalline tones with randomized order and heavy reverb',
    engine: 'strudel',
    code: `note("c4 e4 g4 a4 c5 e5".shuffle())
.s("triangle")
.gain(0.15)
.lpf(sine.range(300, 1500).slow(12))
.room(0.8)
.delay(0.4)
.delaytime(0.333)
.slow(2)`,
    difficulty: 'intermediate',
    tags: ['shimmer', 'crystal', 'random', 'sparkle'],
  },
  {
    id: 'ambient-pad-wash',
    name: 'Pad Wash',
    category: 'Ambient',
    description: 'Wide sustained pad chords fading in and out',
    engine: 'strudel',
    code: `note("<[c3,g3,c4] [eb3,bb3,eb4] [f3,c4,f4] [ab3,eb4,ab4]>")
.s("sawtooth")
.lpf(sine.range(200, 1000).slow(16))
.gain(0.15)
.room(0.9)
.delay(0.5)
.slow(4)`,
    difficulty: 'intermediate',
    tags: ['pad', 'wash', 'wide', 'sustained'],
  },
  {
    id: 'ambient-rain-texture',
    name: 'Rain Texture',
    category: 'Ambient',
    description: 'Percussive texture evoking rainfall with random hits',
    engine: 'strudel',
    code: `stack(
  s("hh*16").gain(rand.range(0.05, 0.2))
    .pan(rand).speed(rand.range(0.5, 2)),
  note("c5 e5 g5 a5".shuffle()).s("sine")
    .gain(0.08).room(0.9).delay(0.6).slow(4)
)`,
    difficulty: 'intermediate',
    tags: ['rain', 'texture', 'random', 'percussive'],
  },
  {
    id: 'ambient-underwater',
    name: 'Underwater World',
    category: 'Ambient',
    description: 'Filtered bubbling textures and low-pass drones',
    engine: 'strudel',
    code: `stack(
  note("<c2 [c2,eb2]>").s("sine")
    .gain(0.2).lpf(200).room(0.9).slow(8),
  note("g4 c5 eb5 g5".shuffle()).s("sine")
    .gain(0.08).lpf(sine.range(200, 600).slow(8))
    .room(0.9).delay(0.7).slow(3)
)`,
    difficulty: 'intermediate',
    tags: ['underwater', 'deep', 'filtered', 'mysterious'],
  },
  {
    id: 'ambient-night-sky',
    name: 'Night Sky',
    category: 'Ambient',
    description: 'Sparse twinkling notes over a dark pad bed',
    engine: 'strudel',
    code: `stack(
  note("<[c2,g2] [eb2,bb2]>").s("sine")
    .gain(0.15).lpf(300).room(0.9).slow(8),
  note("c5 ~ ~ g5 ~ ~ e5 ~".shuffle()).s("triangle")
    .gain(0.08).room(0.8).delay(0.5).slow(2)
)`,
    difficulty: 'intermediate',
    tags: ['night', 'stars', 'sparse', 'dark'],
  },
  {
    id: 'ambient-forest',
    name: 'Forest Ambience',
    category: 'Ambient',
    description: 'Layered nature-inspired sounds with organic rhythms',
    engine: 'strudel',
    code: `stack(
  note("<c3 d3 e3 g3>").s("sine")
    .gain(0.12).room(0.9).lpf(400).slow(8),
  s("hh(5,16)").gain(0.08).speed(rand.range(0.3, 1.5))
    .pan(rand).room(0.7),
  note("c5 e5 g5".shuffle()).s("triangle")
    .gain(0.06).room(0.8).delay(0.6).slow(4)
)`,
    difficulty: 'advanced',
    tags: ['forest', 'nature', 'organic', 'layered'],
  },
  {
    id: 'ambient-tape-loop',
    name: 'Tape Loop',
    category: 'Ambient',
    description: 'Lo-fi tape loop aesthetic with degrading repetition',
    engine: 'strudel',
    code: `note("c4 e4 g4 e4")
.s("sawtooth")
.lpf(sine.range(200, 600).slow(8))
.gain(0.2)
.room(0.7)
.delay(0.6)
.delaytime(0.5)
.slow(2)`,
    difficulty: 'intermediate',
    tags: ['tape', 'lofi', 'degraded', 'warm'],
  },

  /* ══════════════════════════════════════════════════════════
     Cinematic — epic and dramatic
     ══════════════════════════════════════════════════════════ */
  {
    id: 'cinematic-synthwave',
    name: 'Synthwave Drive',
    category: 'Cinematic',
    description: 'Retro 80s synthwave with pulsing bass and bright arps',
    engine: 'strudel',
    code: `stack(
  note("c2 c2 f1 g1").s("sawtooth")
    .lpf(sine.range(200, 800).slow(8))
    .gain(0.6).sustain(0.4),
  note("c4 e4 g4 c5 g4 e4").s("square")
    .lpf(2000).gain(0.25)
    .delay(0.3).delaytime(0.166).fast(2),
  s("bd ~ bd ~, ~ cp ~ cp, hh*8")
    .gain(0.5)
).slow(2)`,
    difficulty: 'advanced',
    tags: ['synthwave', '80s', 'retro', 'neon'],
  },
  {
    id: 'cinematic-spy',
    name: 'Spy Theme',
    category: 'Cinematic',
    description: 'Suspenseful spy jazz with walking bass and muted stabs',
    engine: 'strudel',
    code: `stack(
  note("c2 ~ eb2 ~ f2 ~ g2 ~").s("triangle")
    .gain(0.7).lpf(400).sustain(0.2),
  note("<[eb4,gb4] ~ [f4,ab4] ~>")
    .s("square").lpf(1200).gain(0.2)
    .delay(0.25).delaytime(0.333),
  s("hh*4").gain(0.2).pan(sine.range(0.3, 0.7)),
  s("~ rim ~ rim").gain(0.35)
)`,
    difficulty: 'advanced',
    tags: ['spy', 'jazz', 'suspense', 'noir'],
  },
  {
    id: 'cinematic-horror',
    name: 'Horror Drone',
    category: 'Cinematic',
    description: 'Dark ambient tension with low drones and dissonant intervals',
    engine: 'strudel',
    code: `stack(
  note("<c1 [c1,db1]>").s("sine")
    .gain(0.3).lpf(150).room(0.9).slow(8),
  note("<gb3 f3 e3 eb3>").s("sawtooth")
    .gain(0.08).lpf(sine.range(100, 600).slow(16))
    .room(0.8).delay(0.6).slow(4),
  note("c5 ~ ~ db5 ~ ~ ~ ~").s("triangle")
    .gain(0.05).delay(0.7).delaytime(0.5)
    .room(0.9).slow(3)
)`,
    difficulty: 'advanced',
    tags: ['horror', 'dark', 'dissonant', 'tension'],
  },
  {
    id: 'cinematic-epic-strings',
    name: 'Epic Strings',
    category: 'Cinematic',
    description: 'Cinematic orchestral feel with wide chords and slow movement',
    engine: 'strudel',
    code: `stack(
  note("<[c3,e3,g3,c4] [f3,a3,c4,f4] [ab3,c4,eb4,ab4] [g3,b3,d4,g4]>")
    .s("sawtooth").lpf(sine.range(600, 1800).slow(16))
    .gain(0.25).room(0.8).slow(4),
  note("<c2 f2 ab2 g2>").s("sawtooth")
    .gain(0.35).lpf(300).sustain(0.8).slow(4),
  note("g4 ~ c5 ~ e5 ~ g5 ~").s("sine")
    .gain(0.1).delay(0.4).room(0.7).slow(8)
)`,
    difficulty: 'advanced',
    tags: ['epic', 'orchestral', 'strings', 'cinematic'],
  },
  {
    id: 'cinematic-retrogame',
    name: 'Retro Game',
    category: 'Cinematic',
    description: '8-bit chiptune with square waves and fast arpeggios',
    engine: 'strudel',
    code: `stack(
  note("c5 e5 g5 c6 g5 e5 c5 g4").s("square")
    .lpf(3000).gain(0.3).fast(2),
  note("c3 g3 c3 e3").s("square")
    .lpf(800).gain(0.4).sustain(0.15),
  s("bd ~ bd ~, ~ sd ~ sd, hh*8")
    .gain(0.4).speed(1.5)
).delay(0.1).delaytime(0.08)`,
    difficulty: 'intermediate',
    tags: ['retro', 'game', '8bit', 'chiptune'],
  },
  {
    id: 'cinematic-chase',
    name: 'Chase Scene',
    category: 'Cinematic',
    description: 'Urgent driving pattern building tension',
    engine: 'strudel',
    code: `stack(
  note("c3 c3 eb3 f3").s("sawtooth")
    .lpf(sine.range(300, 1500).fast(1))
    .gain(0.5).sustain(0.1),
  s("bd bd [bd bd] bd").gain(0.9),
  s("~ sd ~ sd").gain(0.7),
  s("hh*16").gain(0.3),
  note("c5 eb5 g5 c6").s("square")
    .lpf(2000).gain(0.15).delay(0.2).fast(2)
)`,
    difficulty: 'advanced',
    tags: ['chase', 'urgent', 'fast', 'action'],
  },
  {
    id: 'cinematic-sunset',
    name: 'Golden Sunset',
    category: 'Cinematic',
    description: 'Warm, expansive chords with glowing harmonics',
    engine: 'strudel',
    code: `stack(
  note("<[d3,f#3,a3] [g3,b3,d4] [e3,g3,b3] [a3,c#4,e4]>")
    .s("sawtooth").lpf(sine.range(500, 1200).slow(12))
    .gain(0.2).room(0.8).slow(4),
  note("a4 ~ d5 ~ f#5 ~ a5 ~").s("sine")
    .gain(0.08).room(0.9).delay(0.5).slow(4)
)`,
    difficulty: 'intermediate',
    tags: ['sunset', 'warm', 'expansive', 'golden'],
  },
  {
    id: 'cinematic-space-odyssey',
    name: 'Space Odyssey',
    category: 'Cinematic',
    description: 'Vast cosmic soundscape with slowly drifting harmonics',
    engine: 'strudel',
    code: `stack(
  note("<c2 [c2,g2,c3]>").s("sine")
    .gain(0.2).lpf(sine.range(80, 400).slow(32))
    .room(0.95).slow(8),
  note("e5 g5 b5 e6".shuffle()).s("triangle")
    .gain(0.05).room(0.9).delay(0.7)
    .delaytime(0.5).slow(4),
  note("<[c4,e4] [g3,b3]>").s("sine")
    .gain(0.08).room(0.8).slow(6)
)`,
    difficulty: 'advanced',
    tags: ['space', 'cosmic', 'vast', 'drifting'],
  },
  {
    id: 'cinematic-noir',
    name: 'Film Noir',
    category: 'Cinematic',
    description: 'Smoky jazz-noir atmosphere with muted tones',
    engine: 'strudel',
    code: `stack(
  note("c2 ~ g2 ~ ab2 ~ g2 ~").s("triangle")
    .gain(0.5).lpf(350).sustain(0.2),
  note("<[eb4,g4] ~ [ab4,c5] ~>")
    .s("sawtooth").lpf(800).gain(0.12)
    .room(0.6).delay(0.3),
  s("~ rim ~ rim").gain(0.2),
  s("hh*4").gain(0.12).pan(rand)
)`,
    difficulty: 'advanced',
    tags: ['noir', 'jazz', 'smoky', 'dark'],
  },
  {
    id: 'cinematic-triumph',
    name: 'Triumphal March',
    category: 'Cinematic',
    description: 'Victorious fanfare with powerful chords and driving rhythm',
    engine: 'strudel',
    code: `stack(
  note("<[c3,e3,g3,c4] [c3,e3,g3,c4] [f3,a3,c4,f4] [g3,b3,d4,g4]>")
    .s("sawtooth").lpf(2000).gain(0.3).room(0.5),
  note("c2 c2 f2 g2").s("sawtooth")
    .gain(0.4).lpf(400).sustain(0.3),
  s("bd bd bd bd").gain(0.8),
  s("~ sd ~ sd").gain(0.7),
  s("hh*8").gain(0.3)
).slow(2)`,
    difficulty: 'intermediate',
    tags: ['triumph', 'victory', 'fanfare', 'powerful'],
  },

  /* ══════════════════════════════════════════════════════════
     World — global rhythms and instruments
     ══════════════════════════════════════════════════════════ */
  {
    id: 'world-tabla-groove',
    name: 'Tabla Groove',
    category: 'World',
    description: 'Indian tabla rhythm pattern with traditional feel',
    engine: 'strudel',
    code: `s("tabla tabla:3 tabla:8 tabla:5 tabla:1 tabla:9 tabla:2 tabla:7")
.gain(0.7)
.room(0.3)`,
    difficulty: 'intermediate',
    tags: ['tabla', 'indian', 'percussion', 'traditional'],
  },
  {
    id: 'world-african-poly',
    name: 'African Polyrhythm',
    category: 'World',
    description: 'Multi-layered West African-inspired polyrhythmic drumming',
    engine: 'strudel',
    code: `stack(
  s("bd(3,8)").gain(0.9),
  s("sd(2,8)").gain(0.6),
  s("hh(5,8)").gain(0.35),
  s("rim(7,16)").gain(0.25),
  s("oh(3,16)").gain(0.2)
)`,
    difficulty: 'intermediate',
    tags: ['african', 'polyrhythm', 'percussion', 'euclidean'],
  },
  {
    id: 'world-latin-clave',
    name: 'Latin Son Clave',
    category: 'World',
    description: 'Classic 3-2 son clave pattern — the heartbeat of Afro-Cuban music',
    engine: 'strudel',
    code: `stack(
  s("rim ~ ~ rim ~ ~ rim ~ ~ ~ rim ~ ~ rim ~ ~").gain(0.7),
  s("bd ~ ~ ~ bd ~ ~ ~").gain(0.8),
  s("~ ~ ~ ~ ~ sd ~ ~").gain(0.6),
  s("hh*8").gain(0.3)
)`,
    difficulty: 'intermediate',
    tags: ['latin', 'clave', 'cuban', 'son'],
  },
  {
    id: 'world-middle-east',
    name: 'Middle Eastern Scale',
    category: 'World',
    description: 'Hijaz scale melody with ornamental feel',
    engine: 'strudel',
    code: `note("c4 db4 e4 f4 g4 ab4 b4 c5")
.s("triangle")
.lpf(1500)
.gain(0.4)
.room(0.5)
.delay(0.2)`,
    difficulty: 'intermediate',
    tags: ['middle-east', 'hijaz', 'scale', 'ornamental'],
  },
  {
    id: 'world-gamelan',
    name: 'Gamelan Texture',
    category: 'World',
    description: 'Indonesian gamelan-inspired interlocking metallic patterns',
    engine: 'strudel',
    code: `stack(
  note("c5 e5 g5 c6").s("sine")
    .gain(0.2).decay(0.1).sustain(0).room(0.6),
  note("e4 g4 c5 e5").s("sine")
    .gain(0.15).decay(0.15).sustain(0).room(0.5).slow(1.5),
  note("c3 g3").s("sine")
    .gain(0.25).decay(0.3).sustain(0).room(0.4).slow(4)
)`,
    difficulty: 'advanced',
    tags: ['gamelan', 'indonesian', 'metallic', 'interlocking'],
  },

  /* ══════════════════════════════════════════════════════════
     Experimental — generative, polyrhythmic, unconventional
     ══════════════════════════════════════════════════════════ */
  {
    id: 'experimental-generative',
    name: 'Generative Melody',
    category: 'Experimental',
    description: 'Self-evolving pattern using shuffled notes and random parameters',
    engine: 'strudel',
    code: `note("c3 e3 g3 a3 c4".shuffle())
.s("<sawtooth triangle>")
.lpf(rand.range(300, 2000))
.gain(rand.range(0.2, 0.6))
.delay(rand.range(0, 0.5))
.room(0.4)`,
    difficulty: 'intermediate',
    tags: ['generative', 'random', 'evolving', 'algorithmic'],
  },
  {
    id: 'experimental-polyrhythm',
    name: 'Irrational Polyrhythm',
    category: 'Experimental',
    description: 'Three layers with prime-number timing — never exactly repeats',
    engine: 'strudel',
    code: `stack(
  note("c3 e3 g3").s("sine").slow(3),
  note("a3 d4 f4 a4 c5").s("triangle").slow(5),
  note("e4 g4").s("square").lpf(800).slow(7)
).gain(0.3).room(0.5)`,
    difficulty: 'advanced',
    tags: ['polyrhythm', 'prime', 'irrational', 'complex'],
  },
  {
    id: 'experimental-microrhythm',
    name: 'Microrhythmic Texture',
    category: 'Experimental',
    description: 'Dense rapid-fire micro-events creating a cloud of sound',
    engine: 'strudel',
    code: `stack(
  s("hh*32").gain(rand.range(0.02, 0.15))
    .pan(rand).speed(rand.range(0.5, 3)),
  note("c5 e5 g5".shuffle()).s("sine")
    .gain(0.06).room(0.8).fast(4),
  s("bd(3,16)").gain(0.3)
)`,
    difficulty: 'advanced',
    tags: ['micro', 'dense', 'cloud', 'texture'],
  },
  {
    id: 'experimental-noise-sculpture',
    name: 'Noise Sculpture',
    category: 'Experimental',
    description: 'Shaped noise textures with rhythmic gating',
    engine: 'strudel',
    code: `stack(
  s("noise*4").gain(0.15)
    .lpf(sine.range(100, 3000).fast(2))
    .sustain(0.05),
  s("glitch(5,8)").gain(0.2).speed(rand.range(0.5, 2)),
  s("bd(3,8)").gain(0.5)
)`,
    difficulty: 'advanced',
    tags: ['noise', 'sculpture', 'gated', 'abstract'],
  },
  {
    id: 'experimental-phase',
    name: 'Phase Music',
    category: 'Experimental',
    description: 'Two identical patterns at slightly different speeds drift in and out of phase',
    engine: 'strudel',
    code: `stack(
  note("c4 e4 g4 c5 e5 c5 g4 e4").s("sine")
    .gain(0.3).pan(0.3),
  note("c4 e4 g4 c5 e5 c5 g4 e4").s("sine")
    .gain(0.3).pan(0.7).slow(1.01)
).room(0.4)`,
    difficulty: 'advanced',
    tags: ['phase', 'minimalism', 'reich', 'drift'],
  },
  {
    id: 'experimental-feedback-loop',
    name: 'Feedback Cascade',
    category: 'Experimental',
    description: 'Extreme delay feedback creating cascading echoes',
    engine: 'strudel',
    code: `note("c4 ~ ~ eb4 ~ ~ g4 ~")
.s("sawtooth")
.lpf(sine.range(200, 1500).slow(8))
.gain(0.2)
.delay(0.8)
.delaytime(0.333)
.room(0.7)
.slow(2)`,
    difficulty: 'intermediate',
    tags: ['feedback', 'cascade', 'echo', 'delay'],
  },
];

/** All unique categories — grouped by engine */
export const EXAMPLE_CATEGORIES: string[] = [
  /* Strudel */
  'Beginner',
  'Drums',
  'Bass',
  'Melody',
  'Ambient',
  'Cinematic',
  'World',
  'Experimental',
  /* Tone.js */
  'Tone.js Synths',
  'Tone.js Effects',
  'Tone.js Sequencing',
  'Tone.js Routing',
  'Tone.js Advanced',
  /* Web Audio */
  'Web Audio Basics',
  'Web Audio Filters',
  'Web Audio Effects',
  'Web Audio Routing',
  'Web Audio Synthesis',
];

/** Get patterns filtered by category */
export function getExamplesByCategory(category: string): ExampleEntry[] {
  return EXAMPLE_LIBRARY.filter(e => e.category === category);
}

/** Get patterns filtered by difficulty */
export function getExamplesByDifficulty(difficulty: ExampleEntry['difficulty']): ExampleEntry[] {
  return EXAMPLE_LIBRARY.filter(e => e.difficulty === difficulty);
}

/** Total example count */
export const TOTAL_EXAMPLE_COUNT = EXAMPLE_LIBRARY.length;

/* ═══════════════════════════════════════════════════════
   TONE.JS EXAMPLES (50)
   ═══════════════════════════════════════════════════════ */

// Tone.js Synths
[
  { id: 'tj-basic-synth', name: 'Basic Synth', category: 'Tone.js Synths', description: 'Simple oscillator with amplitude envelope', engine: 'tonejs' as const, code: `const synth = new Tone.Synth().toDestination()\nsynth.triggerAttackRelease("C4", "4n")`, difficulty: 'beginner' as const, tags: ['synth', 'basic'] },
  { id: 'tj-fm-synth', name: 'FM Synth', category: 'Tone.js Synths', description: 'Frequency modulation synthesis', engine: 'tonejs' as const, code: `const synth = new Tone.FMSynth({ modulationIndex: 12 }).toDestination()\nsynth.triggerAttackRelease("A3", "2n")`, difficulty: 'beginner' as const, tags: ['fm', 'synth'] },
  { id: 'tj-am-synth', name: 'AM Synth', category: 'Tone.js Synths', description: 'Amplitude modulation synthesis', engine: 'tonejs' as const, code: `const synth = new Tone.AMSynth().toDestination()\nsynth.triggerAttackRelease("E4", "4n")`, difficulty: 'beginner' as const, tags: ['am', 'synth'] },
  { id: 'tj-mono-synth', name: 'Mono Synth', category: 'Tone.js Synths', description: 'Monophonic synth with filter envelope', engine: 'tonejs' as const, code: `const synth = new Tone.MonoSynth({ filterEnvelope: { attack: 0.1, decay: 0.3, sustain: 0.5 } }).toDestination()\nsynth.triggerAttackRelease("C3", "8n")`, difficulty: 'intermediate' as const, tags: ['mono', 'filter'] },
  { id: 'tj-poly-synth', name: 'Poly Synth Chords', category: 'Tone.js Synths', description: 'Polyphonic synth playing chords', engine: 'tonejs' as const, code: `const synth = new Tone.PolySynth(Tone.Synth).toDestination()\nsynth.triggerAttackRelease(["C4","E4","G4"], "2n")`, difficulty: 'beginner' as const, tags: ['poly', 'chord'] },
  { id: 'tj-membrane', name: 'Membrane Kick', category: 'Tone.js Synths', description: 'Pitched membrane for kick drums', engine: 'tonejs' as const, code: `const kick = new Tone.MembraneSynth().toDestination()\nkick.triggerAttackRelease("C1", "8n")`, difficulty: 'beginner' as const, tags: ['kick', 'drum'] },
  { id: 'tj-metal', name: 'Metal Hi-Hat', category: 'Tone.js Synths', description: 'Metallic percussion sound', engine: 'tonejs' as const, code: `const hat = new Tone.MetalSynth({ frequency: 400, resonance: 2000 }).toDestination()\nhat.triggerAttackRelease("16n")`, difficulty: 'beginner' as const, tags: ['hihat', 'metal'] },
  { id: 'tj-pluck', name: 'Plucked String', category: 'Tone.js Synths', description: 'Karplus-Strong plucked string', engine: 'tonejs' as const, code: `const pluck = new Tone.PluckSynth().toDestination()\npluck.triggerAttack("E3")`, difficulty: 'beginner' as const, tags: ['pluck', 'string'] },
  { id: 'tj-noise', name: 'Noise Burst', category: 'Tone.js Synths', description: 'Noise generator with envelope', engine: 'tonejs' as const, code: `const noise = new Tone.NoiseSynth().toDestination()\nnoise.triggerAttackRelease("16n")`, difficulty: 'beginner' as const, tags: ['noise', 'percussion'] },
  { id: 'tj-duo', name: 'Duo Synth', category: 'Tone.js Synths', description: 'Two-voice harmonized synth', engine: 'tonejs' as const, code: `const synth = new Tone.DuoSynth({ harmonicity: 1.5 }).toDestination()\nsynth.triggerAttackRelease("G3", "4n")`, difficulty: 'intermediate' as const, tags: ['duo', 'harmony'] },
].forEach((e: ExampleEntry) => EXAMPLE_LIBRARY.push(e));

// Tone.js Effects
[
  { id: 'tj-reverb', name: 'Reverb', category: 'Tone.js Effects', description: 'Synth through reverb', engine: 'tonejs' as const, code: `const reverb = new Tone.Reverb(3).toDestination()\nconst synth = new Tone.Synth().connect(reverb)\nsynth.triggerAttackRelease("C4", "4n")`, difficulty: 'beginner' as const, tags: ['reverb', 'space'] },
  { id: 'tj-delay', name: 'Feedback Delay', category: 'Tone.js Effects', description: 'Echo with feedback', engine: 'tonejs' as const, code: `const delay = new Tone.FeedbackDelay("8n", 0.5).toDestination()\nconst synth = new Tone.Synth().connect(delay)\nsynth.triggerAttackRelease("E4", "16n")`, difficulty: 'beginner' as const, tags: ['delay', 'echo'] },
  { id: 'tj-chorus', name: 'Chorus', category: 'Tone.js Effects', description: 'Thick chorus effect', engine: 'tonejs' as const, code: `const chorus = new Tone.Chorus(4, 2.5, 0.5).toDestination().start()\nconst synth = new Tone.Synth().connect(chorus)\nsynth.triggerAttackRelease("A3", "2n")`, difficulty: 'intermediate' as const, tags: ['chorus', 'thick'] },
  { id: 'tj-phaser', name: 'Phaser', category: 'Tone.js Effects', description: 'Phaser sweep effect', engine: 'tonejs' as const, code: `const phaser = new Tone.Phaser({ frequency: 0.5, octaves: 3 }).toDestination()\nconst synth = new Tone.Synth().connect(phaser)\nsynth.triggerAttackRelease("D4", "2n")`, difficulty: 'intermediate' as const, tags: ['phaser', 'sweep'] },
  { id: 'tj-dist', name: 'Distortion', category: 'Tone.js Effects', description: 'Overdrive distortion', engine: 'tonejs' as const, code: `const dist = new Tone.Distortion(0.8).toDestination()\nconst synth = new Tone.Synth().connect(dist)\nsynth.triggerAttackRelease("E2", "4n")`, difficulty: 'beginner' as const, tags: ['distortion', 'overdrive'] },
  { id: 'tj-tremolo', name: 'Tremolo', category: 'Tone.js Effects', description: 'Amplitude modulation effect', engine: 'tonejs' as const, code: `const trem = new Tone.Tremolo(9, 0.75).toDestination().start()\nconst synth = new Tone.Synth().connect(trem)\nsynth.triggerAttackRelease("B3", "2n")`, difficulty: 'intermediate' as const, tags: ['tremolo', 'modulation'] },
  { id: 'tj-vibrato', name: 'Vibrato', category: 'Tone.js Effects', description: 'Pitch wobble effect', engine: 'tonejs' as const, code: `const vib = new Tone.Vibrato(5, 0.1).toDestination()\nconst synth = new Tone.Synth().connect(vib)\nsynth.triggerAttackRelease("G4", "2n")`, difficulty: 'intermediate' as const, tags: ['vibrato', 'pitch'] },
  { id: 'tj-autofilter', name: 'Auto Filter', category: 'Tone.js Effects', description: 'Automated filter sweep', engine: 'tonejs' as const, code: `const filter = new Tone.AutoFilter("4n").toDestination().start()\nconst synth = new Tone.Synth().connect(filter)\nsynth.triggerAttackRelease("C3", "1n")`, difficulty: 'intermediate' as const, tags: ['filter', 'auto'] },
  { id: 'tj-autopanner', name: 'Auto Panner', category: 'Tone.js Effects', description: 'Stereo auto-panning', engine: 'tonejs' as const, code: `const panner = new Tone.AutoPanner("4n").toDestination().start()\nconst synth = new Tone.Synth().connect(panner)\nsynth.triggerAttackRelease("A4", "2n")`, difficulty: 'intermediate' as const, tags: ['panner', 'stereo'] },
  { id: 'tj-bitcrush', name: 'Bit Crusher', category: 'Tone.js Effects', description: 'Lo-fi bit reduction', engine: 'tonejs' as const, code: `const crush = new Tone.BitCrusher(4).toDestination()\nconst synth = new Tone.Synth().connect(crush)\nsynth.triggerAttackRelease("E3", "4n")`, difficulty: 'intermediate' as const, tags: ['bitcrush', 'lofi'] },
].forEach((e: ExampleEntry) => EXAMPLE_LIBRARY.push(e));

// Tone.js Sequencing
[
  { id: 'tj-loop', name: 'Simple Loop', category: 'Tone.js Sequencing', description: 'Repeating note every beat', engine: 'tonejs' as const, code: `const synth = new Tone.Synth().toDestination()\nconst loop = new Tone.Loop(t => synth.triggerAttackRelease("C4","8n",t), "4n")\nloop.start(0)\nTone.getTransport().start()`, difficulty: 'beginner' as const, tags: ['loop', 'basic'] },
  { id: 'tj-sequence', name: 'Note Sequence', category: 'Tone.js Sequencing', description: 'Melodic sequence of notes', engine: 'tonejs' as const, code: `const synth = new Tone.Synth().toDestination()\nconst seq = new Tone.Sequence((t,n) => synth.triggerAttackRelease(n,"8n",t), ["C4","E4","G4","B4"], "4n")\nseq.start(0)\nTone.getTransport().start()`, difficulty: 'beginner' as const, tags: ['sequence', 'melody'] },
  { id: 'tj-pattern', name: 'Random Pattern', category: 'Tone.js Sequencing', description: 'Random note selection', engine: 'tonejs' as const, code: `const synth = new Tone.Synth().toDestination()\nconst pat = new Tone.Pattern((t,n) => synth.triggerAttackRelease(n,"8n",t), ["C4","D4","E4","G4","A4"], "random")\npat.start(0)\nTone.getTransport().start()`, difficulty: 'intermediate' as const, tags: ['pattern', 'random'] },
  { id: 'tj-transport', name: 'Transport Schedule', category: 'Tone.js Sequencing', description: 'Scheduled events on transport', engine: 'tonejs' as const, code: `const synth = new Tone.Synth().toDestination()\nTone.getTransport().schedule(t => synth.triggerAttackRelease("C4","8n",t), "0:0")\nTone.getTransport().schedule(t => synth.triggerAttackRelease("E4","8n",t), "0:1")\nTone.getTransport().schedule(t => synth.triggerAttackRelease("G4","8n",t), "0:2")\nTone.getTransport().loop = true\nTone.getTransport().loopEnd = "1m"\nTone.getTransport().start()`, difficulty: 'intermediate' as const, tags: ['transport', 'schedule'] },
  { id: 'tj-multi-loop', name: 'Multi Loop', category: 'Tone.js Sequencing', description: 'Multiple synchronized loops', engine: 'tonejs' as const, code: `const kick = new Tone.MembraneSynth().toDestination()\nconst hat = new Tone.MetalSynth({resonance:3000}).toDestination()\nnew Tone.Loop(t => kick.triggerAttackRelease("C1","8n",t), "2n").start(0)\nnew Tone.Loop(t => hat.triggerAttackRelease("32n",t), "8n").start(0)\nTone.getTransport().start()`, difficulty: 'intermediate' as const, tags: ['multi', 'drums'] },
  { id: 'tj-arp-loop', name: 'Arpeggiator', category: 'Tone.js Sequencing', description: 'Arpeggiated chord pattern', engine: 'tonejs' as const, code: `const synth = new Tone.Synth().toDestination()\nconst seq = new Tone.Sequence((t,n) => synth.triggerAttackRelease(n,"16n",t), ["C4","E4","G4","C5","G4","E4"], "8n")\nseq.start(0)\nTone.getTransport().start()`, difficulty: 'beginner' as const, tags: ['arpeggio', 'sequence'] },
  { id: 'tj-drum-loop', name: 'Drum Machine', category: 'Tone.js Sequencing', description: 'Kick and snare pattern', engine: 'tonejs' as const, code: `const kick = new Tone.MembraneSynth().toDestination()\nconst snare = new Tone.NoiseSynth({envelope:{decay:0.1}}).toDestination()\nnew Tone.Sequence((t,v) => { if(v) kick.triggerAttackRelease("C1","8n",t) }, [1,0,0,0,1,0,0,0], "8n").start(0)\nnew Tone.Sequence((t,v) => { if(v) snare.triggerAttackRelease("16n",t) }, [0,0,1,0,0,0,1,0], "8n").start(0)\nTone.getTransport().start()`, difficulty: 'intermediate' as const, tags: ['drum', 'machine'] },
  { id: 'tj-random-notes', name: 'Random Melody', category: 'Tone.js Sequencing', description: 'Randomly chosen notes each loop', engine: 'tonejs' as const, code: `const synth = new Tone.Synth().toDestination()\nconst notes = ["C4","D4","E4","F4","G4","A4","B4"]\nnew Tone.Loop(t => {\n  const n = notes[Math.floor(Math.random()*notes.length)]\n  synth.triggerAttackRelease(n,"16n",t)\n}, "8n").start(0)\nTone.getTransport().start()`, difficulty: 'intermediate' as const, tags: ['random', 'generative'] },
  { id: 'tj-bass-melody', name: 'Bass + Melody', category: 'Tone.js Sequencing', description: 'Two layers: bass and melody', engine: 'tonejs' as const, code: `const bass = new Tone.Synth({oscillator:{type:"triangle"}}).toDestination()\nconst lead = new Tone.Synth().toDestination()\nnew Tone.Sequence((t,n) => bass.triggerAttackRelease(n,"4n",t), ["C2","C2","F2","G2"], "4n").start(0)\nnew Tone.Sequence((t,n) => lead.triggerAttackRelease(n,"8n",t), ["E4","G4","C5","B4"], "4n").start(0)\nTone.getTransport().start()`, difficulty: 'intermediate' as const, tags: ['bass', 'melody', 'layers'] },
  { id: 'tj-step-seq', name: 'Step Sequencer', category: 'Tone.js Sequencing', description: '16-step drum sequencer', engine: 'tonejs' as const, code: `const kick = new Tone.MembraneSynth().toDestination()\nconst hat = new Tone.MetalSynth({resonance:4000}).toDestination()\nconst sn = new Tone.NoiseSynth({envelope:{decay:0.05}}).toDestination()\nconst k=[1,0,0,0,1,0,0,0,1,0,0,0,1,0,0,0]\nconst h=[1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1]\nconst s=[0,0,0,0,1,0,0,0,0,0,0,0,1,0,0,0]\nnew Tone.Sequence((t,i)=>{if(k[i])kick.triggerAttackRelease("C1","8n",t);if(h[i])hat.triggerAttackRelease("32n",t);if(s[i])sn.triggerAttackRelease("16n",t)},Array.from({length:16},(_,i)=>i),"16n").start(0)\nTone.getTransport().start()`, difficulty: 'advanced' as const, tags: ['step', 'sequencer', 'drums'] },
].forEach((e: ExampleEntry) => EXAMPLE_LIBRARY.push(e));

// Tone.js Multi-Node Routing
[
  { id: 'tj-chain-reverb', name: 'Synth → Reverb', category: 'Tone.js Routing', description: 'Simple effects chain', engine: 'tonejs' as const, code: `const reverb = new Tone.Reverb(2).toDestination()\nconst synth = new Tone.Synth().connect(reverb)\nsynth.triggerAttackRelease("C4","4n")`, difficulty: 'beginner' as const, tags: ['chain', 'reverb'] },
  { id: 'tj-chain-delay-chorus', name: 'Delay → Chorus', category: 'Tone.js Routing', description: 'Two effects in series', engine: 'tonejs' as const, code: `const chorus = new Tone.Chorus(4,2.5,0.5).toDestination().start()\nconst delay = new Tone.FeedbackDelay("8n",0.4).connect(chorus)\nconst synth = new Tone.Synth().connect(delay)\nsynth.triggerAttackRelease("E4","8n")`, difficulty: 'intermediate' as const, tags: ['chain', 'delay', 'chorus'] },
  { id: 'tj-3-synths', name: '3 Synths Mixed', category: 'Tone.js Routing', description: 'Three synths to one output', engine: 'tonejs' as const, code: `const s1 = new Tone.Synth().toDestination()\nconst s2 = new Tone.FMSynth().toDestination()\nconst s3 = new Tone.AMSynth().toDestination()\ns1.triggerAttackRelease("C4","4n")\nsetTimeout(()=>s2.triggerAttackRelease("E4","4n"),200)\nsetTimeout(()=>s3.triggerAttackRelease("G4","4n"),400)`, difficulty: 'intermediate' as const, tags: ['mix', 'three'] },
  { id: 'tj-parallel-fx', name: 'Parallel Effects', category: 'Tone.js Routing', description: 'Dry + wet parallel chains', engine: 'tonejs' as const, code: `const reverb = new Tone.Reverb(3).toDestination()\nconst delay = new Tone.FeedbackDelay("4n",0.3).toDestination()\nconst synth = new Tone.Synth()\nsynth.connect(reverb)\nsynth.connect(delay)\nsynth.toDestination()\nsynth.triggerAttackRelease("A3","4n")`, difficulty: 'advanced' as const, tags: ['parallel', 'routing'] },
  { id: 'tj-eq-comp', name: 'EQ + Compressor', category: 'Tone.js Routing', description: 'EQ3 into compressor chain', engine: 'tonejs' as const, code: `const comp = new Tone.Compressor(-24,4).toDestination()\nconst eq = new Tone.EQ3({low:6,mid:-3,high:2}).connect(comp)\nconst synth = new Tone.Synth().connect(eq)\nsynth.triggerAttackRelease("C3","2n")`, difficulty: 'advanced' as const, tags: ['eq', 'compressor'] },
  { id: 'tj-drum-kit', name: 'Full Drum Kit', category: 'Tone.js Routing', description: 'Kick + snare + hat with loops', engine: 'tonejs' as const, code: `const kick = new Tone.MembraneSynth().toDestination()\nconst snare = new Tone.NoiseSynth({envelope:{decay:0.08}}).toDestination()\nconst hat = new Tone.MetalSynth({frequency:300,resonance:3000}).toDestination()\nnew Tone.Loop(t=>kick.triggerAttackRelease("C1","8n",t),"2n").start(0)\nnew Tone.Loop(t=>snare.triggerAttackRelease("16n",t),"2n").start("4n")\nnew Tone.Loop(t=>hat.triggerAttackRelease("32n",t),"8n").start(0)\nTone.getTransport().start()`, difficulty: 'intermediate' as const, tags: ['drums', 'kit', 'loop'] },
  { id: 'tj-pad-lead', name: 'Pad + Lead', category: 'Tone.js Routing', description: 'Pad chords with arpeggiated lead', engine: 'tonejs' as const, code: `const reverb = new Tone.Reverb(4).toDestination()\nconst pad = new Tone.PolySynth(Tone.Synth,{oscillator:{type:"triangle"}}).connect(reverb)\nconst lead = new Tone.Synth().toDestination()\nnew Tone.Loop(t=>pad.triggerAttackRelease(["C3","E3","G3"],"1n",t),"1m").start(0)\nnew Tone.Sequence((t,n)=>lead.triggerAttackRelease(n,"16n",t),["C5","E5","G5","E5"],"8n").start(0)\nTone.getTransport().start()`, difficulty: 'advanced' as const, tags: ['pad', 'lead', 'layers'] },
  { id: 'tj-full-mix', name: 'Bass + Melody + Drums', category: 'Tone.js Routing', description: 'Complete 3-layer mix', engine: 'tonejs' as const, code: `const kick = new Tone.MembraneSynth().toDestination()\nconst bass = new Tone.Synth({oscillator:{type:"triangle"}}).toDestination()\nconst lead = new Tone.Synth().toDestination()\nnew Tone.Loop(t=>kick.triggerAttackRelease("C1","8n",t),"2n").start(0)\nnew Tone.Sequence((t,n)=>bass.triggerAttackRelease(n,"8n",t),["C2","C2","F2","G2"],"4n").start(0)\nnew Tone.Sequence((t,n)=>lead.triggerAttackRelease(n,"16n",t),["E4","G4","C5","B4","A4","G4"],"8n").start(0)\nTone.getTransport().start()`, difficulty: 'advanced' as const, tags: ['full', 'mix', 'three'] },
  { id: 'tj-complex-route', name: 'Complex Routing', category: 'Tone.js Routing', description: 'Multiple sends and returns', engine: 'tonejs' as const, code: `const verb = new Tone.Reverb(3).toDestination()\nconst del = new Tone.FeedbackDelay("8n",0.3).toDestination()\nconst comp = new Tone.Compressor(-20,4).toDestination()\nconst synth = new Tone.FMSynth()\nsynth.connect(verb)\nsynth.connect(del)\nsynth.connect(comp)\nnew Tone.Loop(t=>synth.triggerAttackRelease("C3","8n",t),"4n").start(0)\nTone.getTransport().start()`, difficulty: 'advanced' as const, tags: ['complex', 'sends'] },
  { id: 'tj-sidechain', name: 'Volume Ducking', category: 'Tone.js Routing', description: 'Simulated sidechain compression', engine: 'tonejs' as const, code: `const pad = new Tone.PolySynth(Tone.Synth).toDestination()\nconst kick = new Tone.MembraneSynth().toDestination()\nnew Tone.Loop(t=>{\n  kick.triggerAttackRelease("C1","8n",t)\n  pad.volume.setValueAtTime(-12,t)\n  pad.volume.linearRampToValueAtTime(0,t+0.3)\n},"2n").start(0)\nnew Tone.Loop(t=>pad.triggerAttackRelease(["C3","E3","G3"],"1n",t),"1m").start(0)\nTone.getTransport().start()`, difficulty: 'advanced' as const, tags: ['sidechain', 'duck'] },
].forEach((e: ExampleEntry) => EXAMPLE_LIBRARY.push(e));

// Tone.js Advanced
[
  { id: 'tj-envelope', name: 'Envelope Shaping', category: 'Tone.js Advanced', description: 'Custom ADSR envelope', engine: 'tonejs' as const, code: `const synth = new Tone.Synth({envelope:{attack:0.5,decay:0.3,sustain:0.4,release:1}}).toDestination()\nsynth.triggerAttackRelease("C4","1n")`, difficulty: 'intermediate' as const, tags: ['envelope', 'adsr'] },
  { id: 'tj-lfo', name: 'LFO Modulation', category: 'Tone.js Advanced', description: 'LFO controlling filter cutoff', engine: 'tonejs' as const, code: `const filter = new Tone.Filter(800,"lowpass").toDestination()\nconst lfo = new Tone.LFO("2n",200,2000).connect(filter.frequency).start()\nconst synth = new Tone.Synth({oscillator:{type:"sawtooth"}}).connect(filter)\nnew Tone.Loop(t=>synth.triggerAttackRelease("C3","4n",t),"2n").start(0)\nTone.getTransport().start()`, difficulty: 'advanced' as const, tags: ['lfo', 'filter'] },
  { id: 'tj-fm-index', name: 'FM Index Sweep', category: 'Tone.js Advanced', description: 'Modulation index changes over time', engine: 'tonejs' as const, code: `const synth = new Tone.FMSynth({modulationIndex:1}).toDestination()\nsynth.modulationIndex.setValueAtTime(1,Tone.now())\nsynth.modulationIndex.linearRampToValueAtTime(20,Tone.now()+2)\nsynth.triggerAttackRelease("A2","2n")`, difficulty: 'advanced' as const, tags: ['fm', 'sweep'] },
  { id: 'tj-freq-ramp', name: 'Frequency Ramp', category: 'Tone.js Advanced', description: 'Pitch slides between notes', engine: 'tonejs' as const, code: `const synth = new Tone.Synth().toDestination()\nsynth.triggerAttack("C3")\nsynth.frequency.linearRampToValueAtTime(Tone.Frequency("C5").toFrequency(),Tone.now()+1)\nsetTimeout(()=>synth.triggerRelease(),1200)`, difficulty: 'advanced' as const, tags: ['ramp', 'pitch'] },
  { id: 'tj-gain-auto', name: 'Gain Automation', category: 'Tone.js Advanced', description: 'Automated volume changes', engine: 'tonejs' as const, code: `const gain = new Tone.Gain(0).toDestination()\nconst synth = new Tone.Synth({oscillator:{type:"sawtooth"}}).connect(gain)\ngain.gain.setValueAtTime(0,Tone.now())\ngain.gain.linearRampToValueAtTime(0.5,Tone.now()+1)\ngain.gain.linearRampToValueAtTime(0,Tone.now()+2)\nsynth.triggerAttack("E3")`, difficulty: 'advanced' as const, tags: ['gain', 'automation'] },
  { id: 'tj-pan-auto', name: 'Pan Automation', category: 'Tone.js Advanced', description: 'Stereo panning movement', engine: 'tonejs' as const, code: `const panner = new Tone.Panner(0).toDestination()\nconst synth = new Tone.Synth().connect(panner)\nnew Tone.Loop(t=>{\n  panner.pan.setValueAtTime(-1,t)\n  panner.pan.linearRampToValueAtTime(1,t+0.5)\n  synth.triggerAttackRelease("C4","8n",t)\n},"4n").start(0)\nTone.getTransport().start()`, difficulty: 'advanced' as const, tags: ['pan', 'stereo'] },
  { id: 'tj-polyrhythm', name: 'Polyrhythm', category: 'Tone.js Advanced', description: 'Two loops with different periods', engine: 'tonejs' as const, code: `const s1 = new Tone.Synth().toDestination()\nconst s2 = new Tone.Synth({oscillator:{type:"triangle"}}).toDestination()\nnew Tone.Loop(t=>s1.triggerAttackRelease("C4","16n",t),"4n").start(0)\nnew Tone.Loop(t=>s2.triggerAttackRelease("E4","16n",t),"4n.").start(0)\nTone.getTransport().start()`, difficulty: 'advanced' as const, tags: ['polyrhythm', 'time'] },
  { id: 'tj-osc-types', name: 'Oscillator Types', category: 'Tone.js Advanced', description: 'Compare sine, saw, square, triangle', engine: 'tonejs' as const, code: `const types = ["sine","sawtooth","square","triangle"]\nlet i = 0\nconst synth = new Tone.Synth().toDestination()\nnew Tone.Loop(t=>{\n  synth.oscillator.type = types[i%4]\n  synth.triggerAttackRelease("C4","8n",t)\n  i++\n},"4n").start(0)\nTone.getTransport().start()`, difficulty: 'beginner' as const, tags: ['oscillator', 'compare'] },
  { id: 'tj-filter-sweep', name: 'Filter Sweep', category: 'Tone.js Advanced', description: 'Automated filter cutoff', engine: 'tonejs' as const, code: `const filter = new Tone.Filter(200,"lowpass").toDestination()\nconst synth = new Tone.Synth({oscillator:{type:"sawtooth"}}).connect(filter)\nfilter.frequency.setValueAtTime(200,Tone.now())\nfilter.frequency.exponentialRampToValueAtTime(5000,Tone.now()+2)\nsynth.triggerAttackRelease("C2","2n")`, difficulty: 'intermediate' as const, tags: ['filter', 'sweep'] },
  { id: 'tj-noise-gate', name: 'Gated Noise', category: 'Tone.js Advanced', description: 'Noise through tight gate', engine: 'tonejs' as const, code: `const noise = new Tone.NoiseSynth({envelope:{attack:0.001,decay:0.05,sustain:0,release:0.01}}).toDestination()\nnew Tone.Loop(t=>noise.triggerAttackRelease("32n",t),"16n").start(0)\nTone.getTransport().start()`, difficulty: 'intermediate' as const, tags: ['noise', 'gate'] },
].forEach((e: ExampleEntry) => EXAMPLE_LIBRARY.push(e));

/* ═══════════════════════════════════════════════════════
   WEB AUDIO EXAMPLES (50)
   ═══════════════════════════════════════════════════════ */

// Web Audio Basics
[
  { id: 'wa-sine', name: 'Sine Oscillator', category: 'Web Audio Basics', description: 'Pure sine tone', engine: 'webaudio' as const, code: `const osc = ctx.createOscillator()\nconst g = ctx.createGain()\nosc.type = "sine"\nosc.frequency.value = 440\ng.gain.value = 0.3\nosc.connect(g)\ng.connect(masterGain)\nosc.start()`, difficulty: 'beginner' as const, tags: ['sine', 'basic'] },
  { id: 'wa-saw', name: 'Sawtooth Oscillator', category: 'Web Audio Basics', description: 'Bright sawtooth wave', engine: 'webaudio' as const, code: `const osc = ctx.createOscillator()\nconst g = ctx.createGain()\nosc.type = "sawtooth"\nosc.frequency.value = 220\ng.gain.value = 0.2\nosc.connect(g)\ng.connect(masterGain)\nosc.start()`, difficulty: 'beginner' as const, tags: ['sawtooth', 'basic'] },
  { id: 'wa-square', name: 'Square Oscillator', category: 'Web Audio Basics', description: 'Hollow square wave', engine: 'webaudio' as const, code: `const osc = ctx.createOscillator()\nconst g = ctx.createGain()\nosc.type = "square"\nosc.frequency.value = 330\ng.gain.value = 0.15\nosc.connect(g)\ng.connect(masterGain)\nosc.start()`, difficulty: 'beginner' as const, tags: ['square', 'basic'] },
  { id: 'wa-triangle', name: 'Triangle Oscillator', category: 'Web Audio Basics', description: 'Soft triangle wave', engine: 'webaudio' as const, code: `const osc = ctx.createOscillator()\nconst g = ctx.createGain()\nosc.type = "triangle"\nosc.frequency.value = 523\ng.gain.value = 0.3\nosc.connect(g)\ng.connect(masterGain)\nosc.start()`, difficulty: 'beginner' as const, tags: ['triangle', 'basic'] },
  { id: 'wa-gain', name: 'Gain Control', category: 'Web Audio Basics', description: 'Volume fade in and out', engine: 'webaudio' as const, code: `const osc = ctx.createOscillator()\nconst g = ctx.createGain()\nosc.connect(g)\ng.connect(masterGain)\ng.gain.setValueAtTime(0, ctx.currentTime)\ng.gain.linearRampToValueAtTime(0.3, ctx.currentTime + 1)\ng.gain.linearRampToValueAtTime(0, ctx.currentTime + 3)\nosc.start()`, difficulty: 'beginner' as const, tags: ['gain', 'fade'] },
  { id: 'wa-freq-sweep', name: 'Frequency Sweep', category: 'Web Audio Basics', description: 'Pitch rising over time', engine: 'webaudio' as const, code: `const osc = ctx.createOscillator()\nconst g = ctx.createGain()\ng.gain.value = 0.2\nosc.connect(g)\ng.connect(masterGain)\nosc.frequency.setValueAtTime(100, ctx.currentTime)\nosc.frequency.exponentialRampToValueAtTime(2000, ctx.currentTime + 2)\nosc.start()`, difficulty: 'beginner' as const, tags: ['sweep', 'frequency'] },
  { id: 'wa-detune', name: 'Detuned Oscillators', category: 'Web Audio Basics', description: 'Two oscillators slightly detuned', engine: 'webaudio' as const, code: `const o1 = ctx.createOscillator()\nconst o2 = ctx.createOscillator()\nconst g = ctx.createGain()\ng.gain.value = 0.15\no1.frequency.value = 440\no2.frequency.value = 440\no2.detune.value = 10\no1.connect(g)\no2.connect(g)\ng.connect(masterGain)\no1.start()\no2.start()`, difficulty: 'beginner' as const, tags: ['detune', 'thick'] },
  { id: 'wa-multi-osc', name: 'Chord (3 Oscillators)', category: 'Web Audio Basics', description: 'Three oscillators forming a chord', engine: 'webaudio' as const, code: `const g = ctx.createGain()\ng.gain.value = 0.1\ng.connect(masterGain)\n;[261.6, 329.6, 392.0].forEach(f => {\n  const o = ctx.createOscillator()\n  o.type = "triangle"\n  o.frequency.value = f\n  o.connect(g)\n  o.start()\n})`, difficulty: 'beginner' as const, tags: ['chord', 'multiple'] },
  { id: 'wa-start-stop', name: 'Timed Note', category: 'Web Audio Basics', description: 'Oscillator starts and stops after 1 second', engine: 'webaudio' as const, code: `const osc = ctx.createOscillator()\nconst g = ctx.createGain()\ng.gain.value = 0.3\nosc.frequency.value = 440\nosc.connect(g)\ng.connect(masterGain)\nosc.start()\nosc.stop(ctx.currentTime + 1)`, difficulty: 'beginner' as const, tags: ['timed', 'note'] },
  { id: 'wa-noise', name: 'White Noise', category: 'Web Audio Basics', description: 'White noise via buffer', engine: 'webaudio' as const, code: `const buf = ctx.createBuffer(1, ctx.sampleRate * 2, ctx.sampleRate)\nconst data = buf.getChannelData(0)\nfor (let i = 0; i < data.length; i++) data[i] = Math.random() * 2 - 1\nconst src = ctx.createBufferSource()\nconst g = ctx.createGain()\ng.gain.value = 0.1\nsrc.buffer = buf\nsrc.connect(g)\ng.connect(masterGain)\nsrc.start()`, difficulty: 'intermediate' as const, tags: ['noise', 'white'] },
].forEach((e: ExampleEntry) => EXAMPLE_LIBRARY.push(e));

// Web Audio Filters
[
  { id: 'wa-lowpass', name: 'Low-Pass Filter', category: 'Web Audio Filters', description: 'Cut high frequencies', engine: 'webaudio' as const, code: `const osc = ctx.createOscillator()\nconst filt = ctx.createBiquadFilter()\nconst g = ctx.createGain()\nosc.type = "sawtooth"\nfilt.type = "lowpass"\nfilt.frequency.value = 800\ng.gain.value = 0.2\nosc.connect(filt)\nfilt.connect(g)\ng.connect(masterGain)\nosc.start()`, difficulty: 'beginner' as const, tags: ['lowpass', 'filter'] },
  { id: 'wa-highpass', name: 'High-Pass Filter', category: 'Web Audio Filters', description: 'Cut low frequencies', engine: 'webaudio' as const, code: `const osc = ctx.createOscillator()\nconst filt = ctx.createBiquadFilter()\nconst g = ctx.createGain()\nosc.type = "sawtooth"\nfilt.type = "highpass"\nfilt.frequency.value = 1000\ng.gain.value = 0.2\nosc.connect(filt)\nfilt.connect(g)\ng.connect(masterGain)\nosc.start()`, difficulty: 'beginner' as const, tags: ['highpass', 'filter'] },
  { id: 'wa-bandpass', name: 'Band-Pass Filter', category: 'Web Audio Filters', description: 'Pass only a frequency band', engine: 'webaudio' as const, code: `const osc = ctx.createOscillator()\nconst filt = ctx.createBiquadFilter()\nconst g = ctx.createGain()\nosc.type = "sawtooth"\nfilt.type = "bandpass"\nfilt.frequency.value = 1000\nfilt.Q.value = 10\ng.gain.value = 0.3\nosc.connect(filt)\nfilt.connect(g)\ng.connect(masterGain)\nosc.start()`, difficulty: 'intermediate' as const, tags: ['bandpass', 'filter'] },
  { id: 'wa-notch', name: 'Notch Filter', category: 'Web Audio Filters', description: 'Remove a specific frequency', engine: 'webaudio' as const, code: `const osc = ctx.createOscillator()\nconst filt = ctx.createBiquadFilter()\nconst g = ctx.createGain()\nosc.type = "sawtooth"\nfilt.type = "notch"\nfilt.frequency.value = 1000\nfilt.Q.value = 5\ng.gain.value = 0.2\nosc.connect(filt)\nfilt.connect(g)\ng.connect(masterGain)\nosc.start()`, difficulty: 'intermediate' as const, tags: ['notch', 'filter'] },
  { id: 'wa-filter-sweep', name: 'Filter Sweep', category: 'Web Audio Filters', description: 'Automated filter cutoff', engine: 'webaudio' as const, code: `const osc = ctx.createOscillator()\nconst filt = ctx.createBiquadFilter()\nconst g = ctx.createGain()\nosc.type = "sawtooth"\nfilt.type = "lowpass"\nfilt.frequency.setValueAtTime(200, ctx.currentTime)\nfilt.frequency.exponentialRampToValueAtTime(5000, ctx.currentTime + 2)\ng.gain.value = 0.2\nosc.connect(filt)\nfilt.connect(g)\ng.connect(masterGain)\nosc.start()`, difficulty: 'intermediate' as const, tags: ['sweep', 'filter'] },
  { id: 'wa-resonant', name: 'Resonant Filter', category: 'Web Audio Filters', description: 'High Q creates resonance', engine: 'webaudio' as const, code: `const osc = ctx.createOscillator()\nconst filt = ctx.createBiquadFilter()\nconst g = ctx.createGain()\nosc.type = "sawtooth"\nosc.frequency.value = 110\nfilt.type = "lowpass"\nfilt.frequency.value = 500\nfilt.Q.value = 20\ng.gain.value = 0.15\nosc.connect(filt)\nfilt.connect(g)\ng.connect(masterGain)\nosc.start()`, difficulty: 'intermediate' as const, tags: ['resonant', 'q'] },
  { id: 'wa-dyn-cutoff', name: 'Dynamic Cutoff', category: 'Web Audio Filters', description: 'LFO modulates filter frequency', engine: 'webaudio' as const, code: `const osc = ctx.createOscillator()\nconst lfo = ctx.createOscillator()\nconst lfoGain = ctx.createGain()\nconst filt = ctx.createBiquadFilter()\nconst g = ctx.createGain()\nosc.type = "sawtooth"\nosc.frequency.value = 110\nlfo.frequency.value = 2\nlfoGain.gain.value = 800\nfilt.type = "lowpass"\nfilt.frequency.value = 1000\ng.gain.value = 0.2\nlfo.connect(lfoGain)\nlfoGain.connect(filt.frequency)\nosc.connect(filt)\nfilt.connect(g)\ng.connect(masterGain)\nosc.start()\nlfo.start()`, difficulty: 'advanced' as const, tags: ['lfo', 'dynamic'] },
  { id: 'wa-formant', name: 'Formant Filter', category: 'Web Audio Filters', description: 'Vowel-like resonances', engine: 'webaudio' as const, code: `const osc = ctx.createOscillator()\nosc.type = "sawtooth"\nosc.frequency.value = 150\nconst g = ctx.createGain()\ng.gain.value = 0.1\n;[800, 1200, 2500].forEach(f => {\n  const bp = ctx.createBiquadFilter()\n  bp.type = "bandpass"\n  bp.frequency.value = f\n  bp.Q.value = 10\n  osc.connect(bp)\n  bp.connect(g)\n})\ng.connect(masterGain)\nosc.start()`, difficulty: 'advanced' as const, tags: ['formant', 'vowel'] },
  { id: 'wa-multi-filter', name: 'Cascaded Filters', category: 'Web Audio Filters', description: 'Two filters in series for steeper rolloff', engine: 'webaudio' as const, code: `const osc = ctx.createOscillator()\nconst f1 = ctx.createBiquadFilter()\nconst f2 = ctx.createBiquadFilter()\nconst g = ctx.createGain()\nosc.type = "sawtooth"\nf1.type = f2.type = "lowpass"\nf1.frequency.value = f2.frequency.value = 600\ng.gain.value = 0.2\nosc.connect(f1)\nf1.connect(f2)\nf2.connect(g)\ng.connect(masterGain)\nosc.start()`, difficulty: 'intermediate' as const, tags: ['cascade', 'steep'] },
  { id: 'wa-allpass', name: 'Allpass Phase Shift', category: 'Web Audio Filters', description: 'Phase shifting without gain change', engine: 'webaudio' as const, code: `const osc = ctx.createOscillator()\nconst ap = ctx.createBiquadFilter()\nconst g = ctx.createGain()\nosc.type = "sawtooth"\nap.type = "allpass"\nap.frequency.value = 1000\nap.Q.value = 5\ng.gain.value = 0.2\nosc.connect(ap)\nap.connect(g)\ng.connect(masterGain)\nosc.start()`, difficulty: 'advanced' as const, tags: ['allpass', 'phase'] },
].forEach((e: ExampleEntry) => EXAMPLE_LIBRARY.push(e));

// Web Audio Effects + Routing + Synthesis (30 more)
[
  { id: 'wa-delay', name: 'Simple Delay', category: 'Web Audio Effects', description: 'Echo effect with delay node', engine: 'webaudio' as const, code: `const osc = ctx.createOscillator()\nconst delay = ctx.createDelay()\nconst fb = ctx.createGain()\nconst g = ctx.createGain()\ndelay.delayTime.value = 0.3\nfb.gain.value = 0.4\ng.gain.value = 0.2\nosc.connect(g)\nosc.connect(delay)\ndelay.connect(fb)\nfb.connect(delay)\ndelay.connect(g)\ng.connect(masterGain)\nosc.frequency.value = 440\nosc.start()\nosc.stop(ctx.currentTime + 0.1)`, difficulty: 'intermediate' as const, tags: ['delay', 'echo'] },
  { id: 'wa-distortion', name: 'Waveshaper Distortion', category: 'Web Audio Effects', description: 'Overdrive via waveshaper', engine: 'webaudio' as const, code: `const osc = ctx.createOscillator()\nconst ws = ctx.createWaveShaper()\nconst g = ctx.createGain()\nconst curve = new Float32Array(256)\nfor(let i=0;i<256;i++){const x=i*2/256-1;curve[i]=Math.tanh(x*3)}\nws.curve = curve\nosc.type = "sawtooth"\nosc.frequency.value = 220\ng.gain.value = 0.2\nosc.connect(ws)\nws.connect(g)\ng.connect(masterGain)\nosc.start()`, difficulty: 'intermediate' as const, tags: ['distortion', 'waveshaper'] },
  { id: 'wa-compressor', name: 'Dynamics Compressor', category: 'Web Audio Effects', description: 'Compress dynamic range', engine: 'webaudio' as const, code: `const osc = ctx.createOscillator()\nconst comp = ctx.createDynamicsCompressor()\nconst g = ctx.createGain()\ncomp.threshold.value = -20\ncomp.ratio.value = 12\ng.gain.value = 0.3\nosc.connect(comp)\ncomp.connect(g)\ng.connect(masterGain)\nosc.start()`, difficulty: 'intermediate' as const, tags: ['compressor', 'dynamics'] },
  { id: 'wa-stereo-pan', name: 'Stereo Panner', category: 'Web Audio Effects', description: 'Pan audio left to right', engine: 'webaudio' as const, code: `const osc = ctx.createOscillator()\nconst pan = ctx.createStereoPanner()\nconst g = ctx.createGain()\ng.gain.value = 0.3\npan.pan.setValueAtTime(-1,ctx.currentTime)\npan.pan.linearRampToValueAtTime(1,ctx.currentTime+2)\nosc.connect(pan)\npan.connect(g)\ng.connect(masterGain)\nosc.start()`, difficulty: 'beginner' as const, tags: ['pan', 'stereo'] },
  { id: 'wa-adsr', name: 'ADSR Envelope', category: 'Web Audio Effects', description: 'Attack-Decay-Sustain-Release', engine: 'webaudio' as const, code: `const osc = ctx.createOscillator()\nconst g = ctx.createGain()\nconst now = ctx.currentTime\ng.gain.setValueAtTime(0,now)\ng.gain.linearRampToValueAtTime(0.5,now+0.05)\ng.gain.linearRampToValueAtTime(0.3,now+0.2)\ng.gain.setValueAtTime(0.3,now+0.8)\ng.gain.linearRampToValueAtTime(0,now+1.2)\nosc.connect(g)\ng.connect(masterGain)\nosc.start()\nosc.stop(now+1.5)`, difficulty: 'intermediate' as const, tags: ['adsr', 'envelope'] },
  { id: 'wa-tremolo', name: 'Tremolo', category: 'Web Audio Effects', description: 'LFO on amplitude', engine: 'webaudio' as const, code: `const osc = ctx.createOscillator()\nconst lfo = ctx.createOscillator()\nconst lfoGain = ctx.createGain()\nconst g = ctx.createGain()\nosc.frequency.value = 440\nlfo.frequency.value = 8\nlfoGain.gain.value = 0.15\ng.gain.value = 0.15\nlfo.connect(lfoGain)\nlfoGain.connect(g.gain)\nosc.connect(g)\ng.connect(masterGain)\nosc.start()\nlfo.start()`, difficulty: 'intermediate' as const, tags: ['tremolo', 'lfo'] },
  { id: 'wa-ring-mod', name: 'Ring Modulation', category: 'Web Audio Effects', description: 'Multiply two signals', engine: 'webaudio' as const, code: `const carrier = ctx.createOscillator()\nconst mod = ctx.createOscillator()\nconst modGain = ctx.createGain()\nconst g = ctx.createGain()\ncarrier.frequency.value = 440\nmod.frequency.value = 120\nmodGain.gain.value = 0\nmod.connect(modGain.gain)\ncarrier.connect(modGain)\nmodGain.connect(g)\ng.gain.value = 0.3\ng.connect(masterGain)\ncarrier.start()\nmod.start()`, difficulty: 'advanced' as const, tags: ['ring', 'modulation'] },
  { id: 'wa-osc-gain-out', name: 'Osc → Gain → Out', category: 'Web Audio Routing', description: 'Simplest audio graph', engine: 'webaudio' as const, code: `const osc = ctx.createOscillator()\nconst g = ctx.createGain()\ng.gain.value = 0.3\nosc.connect(g)\ng.connect(masterGain)\nosc.start()`, difficulty: 'beginner' as const, tags: ['basic', 'routing'] },
  { id: 'wa-osc-filt-gain', name: 'Osc → Filter → Gain', category: 'Web Audio Routing', description: 'Filtered oscillator', engine: 'webaudio' as const, code: `const osc = ctx.createOscillator()\nconst filt = ctx.createBiquadFilter()\nconst g = ctx.createGain()\nosc.type = "sawtooth"\nfilt.frequency.value = 800\ng.gain.value = 0.2\nosc.connect(filt)\nfilt.connect(g)\ng.connect(masterGain)\nosc.start()`, difficulty: 'beginner' as const, tags: ['filter', 'routing'] },
  { id: 'wa-2osc-mix', name: '2 Oscillator Mixer', category: 'Web Audio Routing', description: 'Mix two oscillators together', engine: 'webaudio' as const, code: `const o1 = ctx.createOscillator()\nconst o2 = ctx.createOscillator()\nconst g = ctx.createGain()\no1.type = "sawtooth"\no1.frequency.value = 220\no2.type = "square"\no2.frequency.value = 221\ng.gain.value = 0.15\no1.connect(g)\no2.connect(g)\ng.connect(masterGain)\no1.start()\no2.start()`, difficulty: 'beginner' as const, tags: ['mix', 'two'] },
  { id: 'wa-4node-chain', name: '4-Node Chain', category: 'Web Audio Routing', description: 'Osc → Filter → Delay → Gain', engine: 'webaudio' as const, code: `const osc = ctx.createOscillator()\nconst filt = ctx.createBiquadFilter()\nconst del = ctx.createDelay()\nconst g = ctx.createGain()\nosc.type = "sawtooth"\nosc.frequency.value = 220\nfilt.frequency.value = 600\ndel.delayTime.value = 0.2\ng.gain.value = 0.2\nosc.connect(filt)\nfilt.connect(del)\ndel.connect(g)\nosc.connect(g)\ng.connect(masterGain)\nosc.start()`, difficulty: 'intermediate' as const, tags: ['chain', 'four'] },
  { id: 'wa-fm-synth', name: 'FM Synthesis', category: 'Web Audio Synthesis', description: 'Oscillator modulating another', engine: 'webaudio' as const, code: `const carrier = ctx.createOscillator()\nconst mod = ctx.createOscillator()\nconst modGain = ctx.createGain()\nconst g = ctx.createGain()\ncarrier.frequency.value = 440\nmod.frequency.value = 440\nmodGain.gain.value = 200\nmod.connect(modGain)\nmodGain.connect(carrier.frequency)\ncarrier.connect(g)\ng.gain.value = 0.2\ng.connect(masterGain)\ncarrier.start()\nmod.start()`, difficulty: 'advanced' as const, tags: ['fm', 'synthesis'] },
  { id: 'wa-additive', name: 'Additive Synthesis', category: 'Web Audio Synthesis', description: 'Multiple harmonics summed', engine: 'webaudio' as const, code: `const g = ctx.createGain()\ng.gain.value = 0.05\ng.connect(masterGain)\nfor(let i=1;i<=8;i++){\n  const o = ctx.createOscillator()\n  const h = ctx.createGain()\n  o.frequency.value = 220*i\n  h.gain.value = 1/i\n  o.connect(h)\n  h.connect(g)\n  o.start()\n}`, difficulty: 'advanced' as const, tags: ['additive', 'harmonics'] },
  { id: 'wa-subtractive', name: 'Subtractive Synthesis', category: 'Web Audio Synthesis', description: 'Saw wave through LP filter', engine: 'webaudio' as const, code: `const osc = ctx.createOscillator()\nconst filt = ctx.createBiquadFilter()\nconst env = ctx.createGain()\nosc.type = "sawtooth"\nosc.frequency.value = 220\nfilt.type = "lowpass"\nfilt.frequency.value = 300\nfilt.Q.value = 5\nenv.gain.value = 0.2\nosc.connect(filt)\nfilt.connect(env)\nenv.connect(masterGain)\nosc.start()\nfilt.frequency.setValueAtTime(300,ctx.currentTime)\nfilt.frequency.exponentialRampToValueAtTime(3000,ctx.currentTime+0.5)\nfilt.frequency.exponentialRampToValueAtTime(300,ctx.currentTime+2)`, difficulty: 'intermediate' as const, tags: ['subtractive', 'filter'] },
  { id: 'wa-808-kick', name: '808 Kick Drum', category: 'Web Audio Synthesis', description: 'Pitched oscillator with decay', engine: 'webaudio' as const, code: `const osc = ctx.createOscillator()\nconst g = ctx.createGain()\nconst now = ctx.currentTime\nosc.frequency.setValueAtTime(150,now)\nosc.frequency.exponentialRampToValueAtTime(40,now+0.1)\ng.gain.setValueAtTime(1,now)\ng.gain.exponentialRampToValueAtTime(0.01,now+0.5)\nosc.connect(g)\ng.connect(masterGain)\nosc.start(now)\nosc.stop(now+0.5)`, difficulty: 'intermediate' as const, tags: ['808', 'kick', 'drum'] },
  { id: 'wa-hihat', name: 'Hi-Hat (Noise)', category: 'Web Audio Synthesis', description: 'Bandpass filtered noise burst', engine: 'webaudio' as const, code: `const buf = ctx.createBuffer(1,ctx.sampleRate*0.1,ctx.sampleRate)\nconst d = buf.getChannelData(0)\nfor(let i=0;i<d.length;i++)d[i]=Math.random()*2-1\nconst src = ctx.createBufferSource()\nconst bp = ctx.createBiquadFilter()\nconst g = ctx.createGain()\nsrc.buffer = buf\nbp.type = "bandpass"\nbp.frequency.value = 8000\nbp.Q.value = 1\ng.gain.setValueAtTime(0.3,ctx.currentTime)\ng.gain.exponentialRampToValueAtTime(0.01,ctx.currentTime+0.08)\nsrc.connect(bp)\nbp.connect(g)\ng.connect(masterGain)\nsrc.start()`, difficulty: 'intermediate' as const, tags: ['hihat', 'noise'] },
  { id: 'wa-snare', name: 'Noise Snare', category: 'Web Audio Synthesis', description: 'Noise burst + tone body', engine: 'webaudio' as const, code: `const now = ctx.currentTime\nconst buf = ctx.createBuffer(1,ctx.sampleRate*0.2,ctx.sampleRate)\nconst d = buf.getChannelData(0)\nfor(let i=0;i<d.length;i++)d[i]=Math.random()*2-1\nconst noise = ctx.createBufferSource()\nnoise.buffer = buf\nconst nG = ctx.createGain()\nnG.gain.setValueAtTime(0.3,now)\nnG.gain.exponentialRampToValueAtTime(0.01,now+0.15)\nnoise.connect(nG)\nnG.connect(masterGain)\nconst osc = ctx.createOscillator()\nconst oG = ctx.createGain()\nosc.frequency.value = 200\noG.gain.setValueAtTime(0.5,now)\noG.gain.exponentialRampToValueAtTime(0.01,now+0.1)\nosc.connect(oG)\noG.connect(masterGain)\nnoise.start(now)\nosc.start(now)\nosc.stop(now+0.15)`, difficulty: 'advanced' as const, tags: ['snare', 'drum'] },
  { id: 'wa-clap', name: 'Clap Sound', category: 'Web Audio Synthesis', description: 'Multiple noise bursts', engine: 'webaudio' as const, code: `const now = ctx.currentTime\nfor(let i=0;i<3;i++){\n  const buf = ctx.createBuffer(1,ctx.sampleRate*0.02,ctx.sampleRate)\n  const d = buf.getChannelData(0)\n  for(let j=0;j<d.length;j++)d[j]=Math.random()*2-1\n  const s = ctx.createBufferSource()\n  const g = ctx.createGain()\n  const bp = ctx.createBiquadFilter()\n  s.buffer = buf\n  bp.type = "bandpass"\n  bp.frequency.value = 2000\n  g.gain.setValueAtTime(0.3,now+i*0.01)\n  g.gain.exponentialRampToValueAtTime(0.01,now+i*0.01+0.05)\n  s.connect(bp)\n  bp.connect(g)\n  g.connect(masterGain)\n  s.start(now+i*0.01)\n}`, difficulty: 'advanced' as const, tags: ['clap', 'drum'] },
  /* ── Interactive Controls ────────────────────────────── */
  { id: 'ctrl-slider-gain', name: 'Slider — Volume Control', category: 'Controls', description: 'Use slider() to control gain in real-time — drag the inline widget', engine: 'strudel' as const, code: `note("c3 e3 g3 c4")\n  .s("sine")\n  .gain(slider(0.5, 0, 1, 0.01))\n  .room(0.4)`, difficulty: 'beginner' as const, tags: ['slider', 'gain', 'interactive'] },
  { id: 'ctrl-slider-filter', name: 'Slider — Filter Sweep', category: 'Controls', description: 'Control the low-pass filter cutoff with a slider — hear the brightness change', engine: 'strudel' as const, code: `note("c2 e2 g2 c3 e3 g3 c4 e4")\n  .s("sawtooth")\n  .lpf(slider(800, 100, 5000, 10))\n  .gain(0.4)\n  .room(0.3)`, difficulty: 'beginner' as const, tags: ['slider', 'filter', 'lpf'] },
  { id: 'ctrl-slider-multi', name: 'Multiple Sliders', category: 'Controls', description: 'Multiple sliders controlling gain, filter, delay, and reverb at once', engine: 'strudel' as const, code: `stack(\n  s("bd sd bd [sd hh]")\n    .gain(slider(0.5, 0, 1)),\n  note("c3 e3 g3 b3")\n    .s("sawtooth")\n    .lpf(slider(1200, 200, 4000))\n    .gain(0.3)\n    .delay(slider(0.3, 0, 0.8))\n    .room(slider(0.2, 0, 0.9))\n)`, difficulty: 'intermediate' as const, tags: ['slider', 'multi', 'filter', 'delay'] },
  { id: 'ctrl-onkey', name: 'onKey — Keyboard Triggers', category: 'Controls', description: 'Bind keys a/s/d/f to trigger sounds — press outside the editor', engine: 'strudel' as const, code: `// Press a, s, d, f (when editor is not focused)\nonKey('a', () => s("bd").play())\nonKey('s', () => s("sd").play())\nonKey('d', () => s("hh").play())\nonKey('f', () => note("c4").s("sine").play())\n\n// Main loop\ns("bd ~ hh ~ bd ~ hh sd").gain(0.5)`, difficulty: 'intermediate' as const, tags: ['keyboard', 'onkey', 'trigger'] },
  { id: 'ctrl-params', name: 'createParams — Named Parameters', category: 'Controls', description: 'Create named parameters controllable by MIDI CC or setParam()', engine: 'strudel' as const, code: `// Create a named parameter\nconst cutoff = createParams("cutoff", 1000)\n\nnote("c2 e2 g2 c3")\n  .s("sawtooth")\n  .lpf(cutoff)\n  .gain(0.4)\n  .room(0.3)\n\n// Change: setParam("cutoff", 2000)`, difficulty: 'intermediate' as const, tags: ['params', 'createParams', 'control'] },

  /* ── Visualizers ─────────────────────────────────────── */
  { id: 'viz-pianoroll', name: 'Inline Piano Roll', category: 'Visualizers', description: 'Add ._pianoroll() to see notes as a scrolling piano roll below the code', engine: 'strudel' as const, code: `note("<c4 e4 g4 c5 g4 e4>")\n  .s("sine")\n  .gain(0.5)\n  .room(0.4)\n  ._pianoroll()`, difficulty: 'beginner' as const, tags: ['pianoroll', 'visualizer', 'inline'] },
  { id: 'viz-scope', name: 'Inline Oscilloscope', category: 'Visualizers', description: 'Add ._scope() to see the waveform rendered inline below your code', engine: 'strudel' as const, code: `note("c3")\n  .s("sawtooth")\n  .lpf(800)\n  .gain(0.4)\n  ._scope()`, difficulty: 'beginner' as const, tags: ['scope', 'oscilloscope', 'waveform'] },
  { id: 'viz-punchcard', name: 'Inline Punchcard', category: 'Visualizers', description: 'Punchcard shows post-transformation events as dots — lighter than pianoroll', engine: 'strudel' as const, code: `note("c3 e3 g3 c4")\n  .fast(2)\n  .sometimes(x => x.rev())\n  ._punchcard()`, difficulty: 'beginner' as const, tags: ['punchcard', 'visualizer', 'dots'] },
  { id: 'viz-combo', name: 'Multiple Visualizers', category: 'Visualizers', description: 'Combine pianoroll and scope on different layers for full visual feedback', engine: 'strudel' as const, code: `stack(\n  note("<c4 e4 g4 c5>")\n    .s("sine")\n    .gain(0.4)\n    .room(0.3)\n    ._pianoroll(),\n  s("bd ~ hh sd")\n    .gain(0.5)\n    ._scope()\n)`, difficulty: 'intermediate' as const, tags: ['pianoroll', 'scope', 'combo'] },
  { id: 'viz-slider-pianoroll', name: 'Slider + Piano Roll', category: 'Visualizers', description: 'Control filter with slider while watching the pianoroll — full interactive setup', engine: 'strudel' as const, code: `note("<c4 e4 g4 b4 c5 b4 g4 e4>")\n  .s("sawtooth")\n  .lpf(slider(1200, 200, 4000))\n  .gain(slider(0.4, 0, 1))\n  .delay(0.3)\n  .room(0.4)\n  ._pianoroll()`, difficulty: 'intermediate' as const, tags: ['slider', 'pianoroll', 'interactive'] },

  { id: 'wa-drum-machine', name: 'Simple Drum Machine', category: 'Web Audio Synthesis', description: '808 kick + hat + snare loop', engine: 'webaudio' as const, code: `function kick(t){\n  const o=ctx.createOscillator(),g=ctx.createGain()\n  o.frequency.setValueAtTime(150,t)\n  o.frequency.exponentialRampToValueAtTime(40,t+0.1)\n  g.gain.setValueAtTime(0.8,t)\n  g.gain.exponentialRampToValueAtTime(0.01,t+0.4)\n  o.connect(g);g.connect(masterGain);o.start(t);o.stop(t+0.4)\n}\nfunction hat(t){\n  const b=ctx.createBuffer(1,2048,ctx.sampleRate)\n  const d=b.getChannelData(0)\n  for(let i=0;i<2048;i++)d[i]=Math.random()*2-1\n  const s=ctx.createBufferSource(),g=ctx.createGain(),f=ctx.createBiquadFilter()\n  s.buffer=b;f.type="bandpass";f.frequency.value=8000\n  g.gain.setValueAtTime(0.2,t);g.gain.exponentialRampToValueAtTime(0.01,t+0.05)\n  s.connect(f);f.connect(g);g.connect(masterGain);s.start(t)\n}\nconst now=ctx.currentTime\nfor(let i=0;i<8;i++){\n  kick(now+i*0.5)\n  hat(now+i*0.25)\n  if(i%2===1){\n    const b=ctx.createBuffer(1,4096,ctx.sampleRate)\n    const d=b.getChannelData(0)\n    for(let j=0;j<4096;j++)d[j]=Math.random()*2-1\n    const s=ctx.createBufferSource(),g=ctx.createGain()\n    s.buffer=b;g.gain.setValueAtTime(0.2,now+i*0.5);g.gain.exponentialRampToValueAtTime(0.01,now+i*0.5+0.1)\n    s.connect(g);g.connect(masterGain);s.start(now+i*0.5)\n  }\n}`, difficulty: 'advanced' as const, tags: ['drum', 'machine', 'loop'] },
].forEach((e: ExampleEntry) => EXAMPLE_LIBRARY.push(e));
