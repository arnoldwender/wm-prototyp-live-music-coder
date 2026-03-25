/* ──────────────────────────────────────────────────────────
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

/** All unique categories */
export const EXAMPLE_CATEGORIES: string[] = [
  'Beginner',
  'Drums',
  'Bass',
  'Melody',
  'Ambient',
  'Cinematic',
  'World',
  'Experimental',
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
