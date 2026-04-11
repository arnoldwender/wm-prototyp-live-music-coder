/* SPDX-License-Identifier: MIT
   Copyright (c) 2026 Arnold Wender / Wender Media
   ──────────────────────────────────────────────────────────
   Blog library — long-form articles about the architecture,
   features, and community vision behind Live Music Coder.
   Each post has a stable slug for routing (`/blog/:slug`).

   Content language is English (matching the README).
   ────────────────────────────────────────────────────────── */

/* ══════════════════════════════════════════════════════════
   Types
   ══════════════════════════════════════════════════════════ */

/** Tag for categorizing blog posts. */
export type BlogTag =
  | 'feature'
  | 'bugfix'
  | 'architecture'
  | 'community'
  | 'release'

/** Ordered list of tags for UI display. */
export const BLOG_TAGS: BlogTag[] = [
  'feature',
  'bugfix',
  'architecture',
  'community',
  'release',
]

/** Author attribution for a blog post. */
export interface BlogAuthor {
  name: string
  url?: string
}

/** A single blog post. */
export interface BlogPost {
  /** URL-safe slug used as the route parameter. */
  slug: string
  /** Display title. */
  title: string
  /** One-sentence summary for listing pages and meta description. */
  summary: string
  /** ISO calendar date (YYYY-MM-DD). */
  date: string
  /** Author attribution. */
  author: BlogAuthor
  /** Content tags for filtering. */
  tags: BlogTag[]
  /** Full article body in Markdown. */
  body: string
  /** Optional hero image path (relative to /public). */
  heroImage?: string
  /** Estimated reading time in minutes. */
  readingTimeMin: number
}

/* ══════════════════════════════════════════════════════════
   Shared author
   ══════════════════════════════════════════════════════════ */

const ARNOLD: BlogAuthor = {
  name: 'Arnold Wender',
  url: 'https://arnoldwender.com',
}

/* ══════════════════════════════════════════════════════════
   Blog posts — newest first
   ══════════════════════════════════════════════════════════ */

export const BLOG_POSTS: BlogPost[] = [

  /* ── Post 1: Why Four Engines ────────────────────────── */

  {
    slug: 'why-four-engines',
    title: 'Why Live Music Coder Ships Four Audio Engines',
    summary:
      'A deep dive into the architecture behind supporting Strudel, Tone.js, raw Web Audio API, and MIDI in a single IDE.',
    date: '2026-04-11',
    author: ARNOLD,
    tags: ['architecture'],
    readingTimeMin: 8,
    body: [
      '## The problem with one engine',
      '',
      'Most live coding environments lock you into a single audio runtime.',
      'Sonic Pi uses SuperCollider. Tidal uses SuperDirt. Strudel runs its',
      'own pattern evaluator on top of Web Audio. Each one is powerful, but',
      'each one has blind spots.',
      '',
      'When I started Live Music Coder, the question was: what if an IDE',
      'could speak all four languages at once?',
      '',
      '## The engine adapter pattern',
      '',
      'Every engine in LMC implements a shared `EngineAdapter` interface:',
      '`init()`, `evaluate(code)`, `start()`, `stop()`, and `dispose()`.',
      'An `Orchestrator` class manages the active engine, the audio graph,',
      'and playback state. Switching engines is a single store action.',
      '',
      'The Strudel adapter wraps `@strudel/core` with its mini-notation',
      'parser and pattern evaluator. Tone.js gets a synth factory and',
      'transport bridge. The Web Audio adapter exposes the raw',
      '`AudioContext` for low-level DSP. The MIDI adapter uses WebMidi.js',
      'to talk to hardware.',
      '',
      '## Where it gets interesting',
      '',
      'The visual node graph (built on React Flow) does not care which',
      'engine produced the audio. It parses code blocks into a directed',
      'acyclic graph and renders connections between them. A code-to-graph',
      'parser extracts blocks; a graph-to-code generator writes them back.',
      '',
      'The 7 Canvas 2D visualizers (waveform, spectrum, timeline,',
      'punchcard, spiral, pitchwheel, plus inline widgets) all tap into',
      'a shared `AnalyserNode`. Whether the sound comes from a Strudel',
      'pattern or a Tone.js synth, the visualizers just work.',
      '',
      '## Trade-offs',
      '',
      'Supporting four engines means four sets of edge cases. The Strudel',
      'REPL sandbox has strict scoping rules that required exposing helper',
      'functions like `sliderWithID` on `globalThis`. Tone.js needs its',
      'transport started before scheduling. Web Audio has no built-in',
      'pattern language. MIDI requires OS-level permissions.',
      '',
      'The upside: users can start with Strudel for its ergonomic',
      'mini-notation, drop into Tone.js for synthesis, chain raw Web',
      'Audio nodes for effects, and route everything to hardware via MIDI.',
      'One IDE, four engines, zero context switches.',
    ].join('\n'),
  },

  /* ── Post 2: Sessions Collection Launch ──────────────── */

  {
    slug: 'sessions-collection-launch',
    title: 'Launching 43 AI-Composed Sessions',
    summary:
      'How we built a curated library of live coding pieces across 10 genres, composed inside AI conversations.',
    date: '2026-04-10',
    author: ARNOLD,
    tags: ['feature', 'community'],
    readingTimeMin: 6,
    body: [
      '## What is a Session?',
      '',
      'A Session is a complete live coding piece: a multi-movement',
      'composition with BPM, key signatures, composer notes, and genre',
      'metadata. Unlike the flat examples grid, each Session has its own',
      'detail page with long-form narrative context.',
      '',
      '## 43 pieces, 10 genres',
      '',
      'Over the course of four content sprints (PRs #11, #12, #14, #16),',
      'we built 43 sessions spanning Ambient, Blues, Deep Work, Dub,',
      'Electronic, Lo-Fi, Narrative, Retro, Techno, and Trance.',
      '',
      'Each session was composed inside a single AI conversation, then',
      'curated and tested by hand. The Strudel code runs against the',
      'AGPL-licensed runtime, which is why the sessions file carries',
      'an AGPL header while the rest of the app is MIT.',
      '',
      '## Filtering and search',
      '',
      'PR #15 added genre filters, free-text search, and sort options',
      'to the Sessions page. Categories are typed as a union type',
      '(`SessionCategory`) and rendered as filter chips in the UI.',
      '',
      '## From Session to Editor',
      '',
      'Clicking "Open in Editor" on any session hands the code off via',
      'React Router state. An earlier approach used URL hash fragments,',
      'but `HashRouter` clobbered them on navigation. The router state',
      'approach survives transitions cleanly and works in both the',
      'browser and the Electron desktop app.',
      '',
      '## i18n',
      '',
      'All Sessions UI chrome (buttons, labels, headings) is translated',
      'into German, English, and Spanish through the `sessions.*`',
      'i18n namespace. The session content itself is in German -- that',
      'is the artistic voice of the collection.',
    ].join('\n'),
  },

  /* ── Post 3: Building Seven Visualizers ──────────────── */

  {
    slug: 'building-seven-visualizers',
    title: 'Building Seven Visualizers with Canvas 2D',
    summary:
      'A walkthrough of the visualizer dashboard: waveform, spectrum, timeline, punchcard, spiral, pitchwheel, and inline widgets.',
    date: '2026-04-10',
    author: ARNOLD,
    tags: ['feature', 'architecture'],
    readingTimeMin: 7,
    body: [
      '## The CanvasVisualizer atom',
      '',
      'Every visualizer starts with the same atom: a `<canvas>` element',
      'wrapped in a resize observer, an animation loop driven by',
      '`requestAnimationFrame`, and a shared `AnalyserNode` that taps',
      'into the Strudel audio output.',
      '',
      'The atom handles mounting, unmounting, and DPI scaling. Individual',
      'visualizers only need to implement a `draw(ctx, data)` function.',
      '',
      '## The original three',
      '',
      'v1.0.0 shipped with waveform (time-domain oscilloscope), spectrum',
      '(frequency bars), and timeline (beat grid with playhead and level',
      'indicator). These three cover the basics: what does the sound look',
      'like, what frequencies are active, and where are we in the pattern.',
      '',
      '## Punchcard (PR #18)',
      '',
      'The punchcard maps note events onto a grid where the x-axis is',
      'time and the y-axis is pitch. Dot size encodes velocity. It gives',
      'an at-a-glance view of rhythmic density and melodic range.',
      '',
      '## Spiral and Pitchwheel (PR #21)',
      '',
      'The spiral visualizer plots audio energy along a logarithmic',
      'spiral, creating hypnotic rotating patterns. The pitchwheel maps',
      'the 12 chromatic pitch classes onto a circle, lighting up segments',
      'as notes trigger. Both are particularly effective for ambient and',
      'generative music.',
      '',
      '## Inline widgets',
      '',
      'PR #23 added inline visualizers that render directly inside the',
      'code editor: `_pianoroll`, `_scope`, and `_slider`. These are',
      'Strudel pattern methods registered on `Pattern.prototype`.',
      'Getting them to work required reading `repl.state.widgets` after',
      'eval and wiring an `afterEval` hook into the Strudel init chain.',
      '',
      '## Audio tap challenges',
      '',
      'Connecting to the Strudel audio output was not straightforward.',
      'The `AnalyserNode` tap needed multiple connection paths (PR #19)',
      'because Strudel does not expose a single master output node.',
      'The solution tries several connection strategies and falls back',
      'gracefully.',
    ].join('\n'),
  },

  /* ── Post 4: MIDI Keyboard Debugging Saga ────────────── */

  {
    slug: 'midi-keyboard-the-debugging-saga',
    title: 'MIDI Keyboard: The Debugging Saga',
    summary:
      'The story of adding MIDI keyboard input -- 6 PRs, a double @strudel/core instance, and the raw Web MIDI solution.',
    date: '2026-04-11',
    author: ARNOLD,
    tags: ['bugfix', 'feature'],
    readingTimeMin: 9,
    body: [
      '## The goal',
      '',
      'Let users plug in a MIDI keyboard and play notes through Strudel',
      'patterns using `midin()` and `midikeys()`. Sounds simple. It was',
      'not.',
      '',
      '## Attempt 1: npm install (PR #39)',
      '',
      'The first approach installed `@strudel/midi` as an npm dependency',
      'and imported `midin` and `midikeys` at the module level. The',
      'functions existed in JavaScript, but the Strudel REPL could not',
      'see them. The eval sandbox runs in a different scope than the',
      'host module.',
      '',
      '## Attempt 2: globalThis (PR #40)',
      '',
      'Next try: register `midin` and `midikeys` on `globalThis`.',
      'This works for most JavaScript, but the Strudel REPL uses a',
      'custom evaluation pipeline that does not look at `globalThis`.',
      'The functions were still invisible inside pattern code.',
      '',
      '## Attempt 3: window (PR #41)',
      '',
      'Putting the functions on `window` had the same problem. The',
      'REPL cannot resolve bare module specifiers or global references',
      'that were not registered through its own API.',
      '',
      '## Attempt 4: REPL.evaluate (PR #40 revisited)',
      '',
      'Calling `REPL.evaluate()` to register the symbols worked in',
      'theory, but a second instance of `@strudel/core` was being',
      'bundled by Vite. The `midin` from the npm package operated on',
      'a different `Pattern` prototype chain than the one the REPL',
      'used. Pattern methods added by one instance were invisible',
      'to the other.',
      '',
      '## Attempt 5: disable competing init (PR #42)',
      '',
      'The `initMidiInput` function from the npm package was racing',
      'with the CDN version and swallowing `enableWebMidi` errors.',
      'Disabling the competing initializer helped, but the scope',
      'problem remained.',
      '',
      '## The fix: CDN through REPL eval (PR #43)',
      '',
      'The solution that finally worked: load `@strudel/midi` via CDN',
      'inside a `REPL.evaluate()` call. This way the Strudel runtime',
      'itself fetches the package, registers the pattern methods on',
      'its own `Pattern.prototype`, and makes `midin`/`midikeys`',
      'available in the exact scope where user code runs.',
      '',
      'No npm dependency, no dual-instance conflict, no scope leakage.',
      '',
      '## Lessons learned',
      '',
      '1. **Eval sandboxes have their own scope rules.** Never assume',
      '   that `globalThis` or `window` bindings will be visible inside',
      '   a sandboxed evaluator.',
      '2. **Bundler deduplication is not guaranteed.** Vite may bundle',
      '   two copies of the same package if they enter through different',
      '   dependency paths.',
      '3. **CDN loading through the runtime itself** is the cleanest',
      '   integration point for plugins that need to register on the',
      '   runtime prototype chain.',
    ].join('\n'),
  },

  /* ── Post 5: Democratizing Live Coding ───────────────── */

  {
    slug: 'democratizing-live-coding',
    title: 'Democratizing Live Coding',
    summary:
      'Why Live Music Coder is open source, what algorave culture means for accessibility, and where the project is headed.',
    date: '2026-04-09',
    author: ARNOLD,
    tags: ['community'],
    readingTimeMin: 5,
    body: [
      '## Live coding should not require a PhD',
      '',
      'Algorave and live coding have deep roots in academic computer',
      'music. Tools like SuperCollider, TidalCycles, and Sonic Pi are',
      'brilliant, but each comes with a steep onboarding curve: install',
      'a runtime, configure audio, learn a domain-specific language.',
      '',
      'Live Music Coder removes that friction. Open a browser tab and',
      'start making sound. No installation, no audio driver config,',
      'no terminal commands.',
      '',
      '## Four engines, one UI',
      '',
      'Supporting Strudel, Tone.js, Web Audio, and MIDI in a single IDE',
      'means beginners can start with high-level pattern notation and',
      'gradually drop down to lower-level synthesis as they learn.',
      'The 190+ built-in examples and 43 curated sessions provide a',
      'library of starting points across genres.',
      '',
      '## The desktop app',
      '',
      'For performers who need offline reliability, the Electron build',
      'produces a native macOS app (arm64 + x64) with auto-update.',
      'The same codebase runs in the browser and on the desktop with',
      'conditional feature detection (no download CTA inside Electron,',
      'scroll behavior adapted for the native window chrome).',
      '',
      '## Open source and AGPL',
      '',
      'The combined app is AGPL-3.0-or-later because it bundles the',
      'AGPL-licensed Strudel runtime. Original components that do not',
      'depend on Strudel are dual-licensed under MIT. This means anyone',
      'can fork, modify, and redistribute as long as they share their',
      'changes under the same terms.',
      '',
      '## What is next',
      '',
      'The roadmap includes collaborative multi-user sessions via',
      'WebRTC, a plugin system for community-contributed engines,',
      'and deeper integration with the Strudel ecosystem. The clock',
      'sync feature already supports multi-tab jam sessions -- the',
      'next step is multi-device.',
      '',
      'Live coding is a performance art. The best tools get out of',
      'the way and let the musician think in sound, not in config files.',
      'That is what Live Music Coder aims to be.',
    ].join('\n'),
  },
]

/* ══════════════════════════════════════════════════════════
   Helpers
   ══════════════════════════════════════════════════════════ */

/**
 * Look up a blog post by its URL slug.
 * Returns `undefined` if no post matches.
 */
export function getBlogPostBySlug(slug: string): BlogPost | undefined {
  return BLOG_POSTS.find((post) => post.slug === slug)
}
