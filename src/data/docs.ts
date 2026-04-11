/* SPDX-License-Identifier: MIT
   Copyright (c) 2026 Arnold Wender / Wender Media
   ──────────────────────────────────────────────────────────
   Documentation silo — structured content for the /docs page.
   Text content uses i18n keys; code examples are language-agnostic.
   ────────────────────────────────────────────────────────── */

/** Single block of documentation content */
export interface DocBlock {
  type: 'heading' | 'text' | 'code' | 'list';
  /** i18n key for heading/text blocks */
  contentKey?: string;
  /** Raw code string for code blocks */
  code?: string;
  /** Array of i18n keys for list items */
  items?: string[];
}

/** A documentation section with sidebar entry and content blocks */
export interface DocSection {
  id: string;
  titleKey: string;
  content: DocBlock[];
}

/* --- All 7 documentation sections --- */
export const docSections: DocSection[] = [
  /* 1. Getting Started */
  {
    id: 'getting-started',
    titleKey: 'docs.gettingStarted.title',
    content: [
      { type: 'text', contentKey: 'docs.gettingStarted.intro' },
      { type: 'heading', contentKey: 'docs.gettingStarted.firstPatternHeading' },
      { type: 'text', contentKey: 'docs.gettingStarted.firstPatternText' },
      { type: 'code', code: 'sound("bd sd hh sd")' },
      { type: 'heading', contentKey: 'docs.gettingStarted.workflowHeading' },
      { type: 'list', items: [
        'docs.gettingStarted.step1',
        'docs.gettingStarted.step2',
        'docs.gettingStarted.step3',
        'docs.gettingStarted.step4',
      ]},
      { type: 'text', contentKey: 'docs.gettingStarted.tip' },
    ],
  },

  /* 2. Strudel Basics */
  {
    id: 'strudel-basics',
    titleKey: 'docs.strudelBasics.title',
    content: [
      { type: 'text', contentKey: 'docs.strudelBasics.intro' },
      { type: 'heading', contentKey: 'docs.strudelBasics.whatIsHeading' },
      { type: 'text', contentKey: 'docs.strudelBasics.whatIsText' },
      { type: 'heading', contentKey: 'docs.strudelBasics.firstPatternsHeading' },
      { type: 'text', contentKey: 'docs.strudelBasics.firstPatternsText' },
      { type: 'code', code: 'note("c3 e3 g3 b3").s("sawtooth")' },
      { type: 'code', code: 'sound("bd sd [hh hh] sd")' },
      { type: 'heading', contentKey: 'docs.strudelBasics.chainingHeading' },
      { type: 'text', contentKey: 'docs.strudelBasics.chainingText' },
      { type: 'code', code: 'note("c3 e3 g3").s("sawtooth")\n  .lpf(800).room(0.5).gain(0.7)' },
    ],
  },

  /* 3. Mini-Notation */
  {
    id: 'mini-notation',
    titleKey: 'docs.miniNotation.title',
    content: [
      { type: 'text', contentKey: 'docs.miniNotation.intro' },
      { type: 'heading', contentKey: 'docs.miniNotation.syntaxHeading' },
      { type: 'list', items: [
        'docs.miniNotation.space',
        'docs.miniNotation.brackets',
        'docs.miniNotation.angle',
        'docs.miniNotation.tilde',
        'docs.miniNotation.star',
        'docs.miniNotation.slash',
        'docs.miniNotation.comma',
        'docs.miniNotation.parens',
        'docs.miniNotation.question',
      ]},
      { type: 'heading', contentKey: 'docs.miniNotation.examplesHeading' },
      { type: 'code', code: '// Subdivide hi-hats inside one step\nsound("bd [hh hh hh] sd hh")' },
      { type: 'code', code: '// Alternate bass notes each cycle\nsound("<bd:0 bd:1 bd:2> sd hh sd")' },
      { type: 'code', code: '// Euclidean rhythm: 3 hits over 8 steps\nsound("bd(3,8)")' },
    ],
  },

  /* 4. Sounds & Samples */
  {
    id: 'sounds-samples',
    titleKey: 'docs.soundsSamples.title',
    content: [
      { type: 'text', contentKey: 'docs.soundsSamples.intro' },
      { type: 'heading', contentKey: 'docs.soundsSamples.drumsHeading' },
      { type: 'list', items: [
        'docs.soundsSamples.bd',
        'docs.soundsSamples.sd',
        'docs.soundsSamples.hh',
        'docs.soundsSamples.oh',
        'docs.soundsSamples.cp',
        'docs.soundsSamples.lt',
        'docs.soundsSamples.mt',
        'docs.soundsSamples.ht',
      ]},
      { type: 'heading', contentKey: 'docs.soundsSamples.banksHeading' },
      { type: 'text', contentKey: 'docs.soundsSamples.banksText' },
      { type: 'code', code: 'sound("bd sd hh sd")\nsound("808 808:1 808:2 808:3")' },
      { type: 'heading', contentKey: 'docs.soundsSamples.oscillatorsHeading' },
      { type: 'text', contentKey: 'docs.soundsSamples.oscillatorsText' },
      { type: 'code', code: 'note("c3 e3 g3").s("sawtooth")\nnote("a3 c4 e4").s("sine")' },
    ],
  },

  /* 5. Effects */
  {
    id: 'effects',
    titleKey: 'docs.effects.title',
    content: [
      { type: 'text', contentKey: 'docs.effects.intro' },
      { type: 'heading', contentKey: 'docs.effects.filterHeading' },
      { type: 'text', contentKey: 'docs.effects.filterText' },
      { type: 'code', code: 'note("c2 e2 g2").s("sawtooth")\n  .lpf(600).hpf(100)' },
      { type: 'heading', contentKey: 'docs.effects.reverbDelayHeading' },
      { type: 'text', contentKey: 'docs.effects.reverbDelayText' },
      { type: 'code', code: 'sound("hh*8").room(0.8).delay(0.5)' },
      { type: 'heading', contentKey: 'docs.effects.dynamicsHeading' },
      { type: 'list', items: [
        'docs.effects.gain',
        'docs.effects.pan',
        'docs.effects.speed',
        'docs.effects.dec',
        'docs.effects.sustain',
      ]},
      { type: 'code', code: 'sound("bd sd hh sd")\n  .gain("0.8 0.6 0.4 0.6")\n  .pan("0 0.5 1 0.5")' },
    ],
  },

  /* 6. Pattern Tricks */
  {
    id: 'pattern-tricks',
    titleKey: 'docs.patternTricks.title',
    content: [
      { type: 'text', contentKey: 'docs.patternTricks.intro' },
      { type: 'heading', contentKey: 'docs.patternTricks.layeringHeading' },
      { type: 'text', contentKey: 'docs.patternTricks.layeringText' },
      { type: 'code', code: 'stack(\n  sound("bd ~ sd ~"),\n  sound("hh*8").gain(0.4),\n  note("c2 e2 g2 e2").s("sawtooth").lpf(400)\n)' },
      { type: 'heading', contentKey: 'docs.patternTricks.transformHeading' },
      { type: 'list', items: [
        'docs.patternTricks.fast',
        'docs.patternTricks.slow',
        'docs.patternTricks.rev',
        'docs.patternTricks.jux',
        'docs.patternTricks.every',
        'docs.patternTricks.sometimes',
      ]},
      { type: 'code', code: 'note("c3 e3 g3 b3").s("sawtooth")\n  .every(4, x => x.rev())\n  .jux(x => x.fast(2))' },
      { type: 'heading', contentKey: 'docs.patternTricks.euclideanHeading' },
      { type: 'text', contentKey: 'docs.patternTricks.euclideanText' },
      { type: 'code', code: 'sound("bd(3,8)")\nsound("sd(2,5)")' },
    ],
  },

  /* 7. Keyboard Shortcuts */
  {
    id: 'keyboard-shortcuts',
    titleKey: 'docs.shortcuts.title',
    content: [
      { type: 'text', contentKey: 'docs.shortcuts.intro' },
      { type: 'heading', contentKey: 'docs.shortcuts.editorHeading' },
      { type: 'list', items: [
        'docs.shortcuts.run',
        'docs.shortcuts.undo',
        'docs.shortcuts.redo',
        'docs.shortcuts.search',
        'docs.shortcuts.fold',
      ]},
      { type: 'heading', contentKey: 'docs.shortcuts.transportHeading' },
      { type: 'list', items: [
        'docs.shortcuts.play',
        'docs.shortcuts.stop',
      ]},
      { type: 'heading', contentKey: 'docs.shortcuts.tipsHeading' },
      { type: 'text', contentKey: 'docs.shortcuts.tipsText' },
    ],
  },

  /* 8. Interactive Controls */
  {
    id: 'interactive-controls',
    titleKey: 'docs.controls.title',
    content: [
      { type: 'heading', contentKey: 'docs.controls.sliderHeading' },
      { type: 'text', contentKey: 'docs.controls.sliderText' },
      { type: 'code', code: `// Slider appears inline in the editor — drag to adjust
note("c3 e3 g3 c4")
  .s("sawtooth")
  .lpf(slider(800, 100, 5000))
  .gain(slider(0.5, 0, 1))
  .room(0.3)` },
      { type: 'heading', contentKey: 'docs.controls.onkeyHeading' },
      { type: 'text', contentKey: 'docs.controls.onkeyText' },
      { type: 'code', code: `// Bind keys (outside editor focus)
onKey('a', () => s("bd").play())
onKey('s', () => s("sd").play())` },
      { type: 'heading', contentKey: 'docs.controls.paramsHeading' },
      { type: 'text', contentKey: 'docs.controls.paramsText' },
      { type: 'code', code: `const cutoff = createParams("cutoff", 1000)
note("c2 e2 g2").s("sawtooth").lpf(cutoff)
// Later: setParam("cutoff", 2000)` },
    ],
  },

  /* 9. Visualizers */
  {
    id: 'visualizers',
    titleKey: 'docs.visualizers.title',
    content: [
      { type: 'heading', contentKey: 'docs.visualizers.inlineHeading' },
      { type: 'text', contentKey: 'docs.visualizers.inlineText' },
      { type: 'code', code: `// Piano roll — shows notes as horizontal bars
note("c4 e4 g4 c5")._pianoroll()

// Oscilloscope — shows waveform
note("c3").s("sawtooth")._scope()

// Punchcard — dots for events
s("bd hh sd hh")._punchcard()` },
      { type: 'heading', contentKey: 'docs.visualizers.panelHeading' },
      { type: 'text', contentKey: 'docs.visualizers.panelText' },
      { type: 'list', items: [
        'docs.visualizers.waveform',
        'docs.visualizers.spectrum',
        'docs.visualizers.timeline',
        'docs.visualizers.pianoroll',
        'docs.visualizers.punchcard',
        'docs.visualizers.spiral',
        'docs.visualizers.pitchwheel',
      ]},
    ],
  },

  /* 10. Settings & Preferences */
  {
    id: 'settings',
    titleKey: 'docs.settings.title',
    content: [
      { type: 'heading', contentKey: 'docs.settings.themesHeading' },
      { type: 'text', contentKey: 'docs.settings.themesText' },
      { type: 'list', items: [
        'docs.settings.themePurple',
        'docs.settings.themeAmber',
        'docs.settings.themeCyan',
        'docs.settings.themeMatrix',
      ]},
      { type: 'heading', contentKey: 'docs.settings.editorHeading' },
      { type: 'text', contentKey: 'docs.settings.editorText' },
      { type: 'list', items: [
        'docs.settings.fontSize',
        'docs.settings.vimMode',
        'docs.settings.wordWrap',
        'docs.settings.lineNumbers',
        'docs.settings.zenMode',
      ]},
    ],
  },
]
