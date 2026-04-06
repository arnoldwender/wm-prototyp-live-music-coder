/* SPDX-License-Identifier: MIT
   Copyright (c) 2026 Arnold Wender / Wender Media
   ──────────────────────────────────────────────────────────
   HelpPanel molecule — slide-out panel with getting started
   guide, copyable example patterns, sample/bank reference,
   mini-notation cheat sheet, functions, shortcuts, and
   engine info. Anchored to the right edge of the viewport.
   ────────────────────────────────────────────────────────── */

import { useState, useCallback } from 'react'
import { useTranslation } from 'react-i18next'
import { Button } from '../atoms'
import { X, Copy, Check } from 'lucide-react'

interface HelpPanelProps {
  onClose: () => void
}

/* Example patterns users can copy or click to try */
const EXAMPLE_PATTERNS = [
  {
    labelKey: 'help.exampleMelody',
    code: 'note("c3 e3 g3 b3").s("sawtooth").lpf(800)',
  },
  {
    labelKey: 'help.exampleDrums',
    code: 's("bd sd [~ bd] sd")',
  },
  {
    labelKey: 'help.exampleEffects',
    code: 'note("c3 e3 g3").s("sawtooth").delay(.5).room(.3)',
  },
  {
    labelKey: 'help.exampleEuclidean',
    code: 's("bd(3,8) hh(5,8) sd(2,8)")',
  },
  {
    labelKey: 'help.exampleStack',
    code: 'stack(s("bd sd"), s("hh*8").gain(.4))',
  },
] as const

/* Categorized sample library from Dirt-Samples (218 total, ~120 shown in help) */
const SAMPLE_CATEGORIES = [
  {
    categoryKey: 'help.catKicks',
    samples: [
      { name: 'bd', desc: '(24)' },
      { name: 'clubkick', desc: '(5)' },
      { name: 'hardkick', desc: '(6)' },
      { name: 'popkick', desc: '(10)' },
      { name: 'reverbkick', desc: '(1)' },
      { name: 'kicklinn', desc: '(1)' },
    ],
  },
  {
    categoryKey: 'help.catSnare',
    samples: [
      { name: 'sd', desc: '(2)' },
      { name: 'sn', desc: '(52)' },
      { name: 'realclaps', desc: '(4)' },
    ],
  },
  {
    categoryKey: 'help.catHihat',
    samples: [
      { name: 'hh', desc: '(13)' },
      { name: 'hh27', desc: '(13)' },
      { name: 'linnhats', desc: '(6)' },
    ],
  },
  {
    categoryKey: 'help.catCymbal',
    samples: [
      { name: 'oh', desc: '(1)' },
      { name: 'cr', desc: '(6)' },
      { name: 'cb', desc: '(1)' },
    ],
  },
  {
    categoryKey: 'help.catPerc',
    samples: [
      { name: 'cp', desc: '(2)' },
      { name: 'clak', desc: '(2)' },
      { name: 'perc', desc: '(6)' },
      { name: 'click', desc: '(4)' },
      { name: 'stomp', desc: '(10)' },
      { name: 'hand', desc: '(17)' },
    ],
  },
  {
    categoryKey: 'help.catToms',
    samples: [
      { name: 'lt', desc: '(16)' },
      { name: 'mt', desc: '(16)' },
      { name: 'ht', desc: '(16)' },
    ],
  },
  {
    categoryKey: 'help.cat808',
    samples: [
      { name: '808', desc: '' },
      { name: '808bd', desc: '' },
      { name: '808sd', desc: '' },
      { name: '808hc', desc: '' },
      { name: '808ht', desc: '' },
      { name: '808lt', desc: '' },
      { name: '808mt', desc: '' },
      { name: '808oh', desc: '' },
      { name: '808cy', desc: '' },
    ],
  },
  {
    categoryKey: 'help.cat909',
    samples: [
      { name: '909', desc: '' },
    ],
  },
  {
    categoryKey: 'help.catDrumMachines',
    samples: [
      { name: 'dr', desc: '(42)' },
      { name: 'dr2', desc: '' },
      { name: 'dr55', desc: '' },
      { name: 'dr_few', desc: '' },
      { name: 'drum', desc: '' },
      { name: 'drumtraks', desc: '' },
      { name: 'gretsch', desc: '(24)' },
      { name: 'electro1', desc: '' },
    ],
  },
  {
    categoryKey: 'help.catBass',
    samples: [
      { name: 'bass', desc: '(4)' },
      { name: 'bass0', desc: '' },
      { name: 'bass1', desc: '(30)' },
      { name: 'bass2', desc: '' },
      { name: 'bass3', desc: '' },
      { name: 'bassdm', desc: '(24)' },
      { name: 'bassfoo', desc: '' },
      { name: 'jvbass', desc: '(13)' },
      { name: 'jungbass', desc: '(20)' },
    ],
  },
  {
    categoryKey: 'help.catSynth',
    samples: [
      { name: 'arpy', desc: '(11)' },
      { name: 'casio', desc: '(3)' },
      { name: 'juno', desc: '(12)' },
      { name: 'moog', desc: '(7)' },
      { name: 'fm', desc: '(17)' },
      { name: 'pad', desc: '(3)' },
      { name: 'pluck', desc: '(17)' },
    ],
  },
  {
    categoryKey: 'help.catGuitar',
    samples: [
      { name: 'gtr', desc: '(3)' },
    ],
  },
  {
    categoryKey: 'help.catSax',
    samples: [
      { name: 'sax', desc: '(22)' },
    ],
  },
  {
    categoryKey: 'help.catStrings',
    samples: [
      { name: 'sitar', desc: '(8)' },
    ],
  },
  {
    categoryKey: 'help.catVocals',
    samples: [
      { name: 'mouth', desc: '(15)' },
      { name: 'speech', desc: '(7)' },
      { name: 'speechless', desc: '(10)' },
      { name: 'speakspell', desc: '(12)' },
      { name: 'diphone', desc: '(38)' },
      { name: 'diphone2', desc: '' },
    ],
  },
  {
    categoryKey: 'help.catNoiseFx',
    samples: [
      { name: 'noise', desc: '(1)' },
      { name: 'noise2', desc: '' },
      { name: 'glitch', desc: '(8)' },
      { name: 'glitch2', desc: '' },
      { name: 'dist', desc: '(16)' },
      { name: 'industrial', desc: '(32)' },
    ],
  },
  {
    categoryKey: 'help.catNature',
    samples: [
      { name: 'birds', desc: '(10)' },
      { name: 'birds3', desc: '' },
      { name: 'insect', desc: '(3)' },
      { name: 'wind', desc: '(10)' },
      { name: 'crow', desc: '(4)' },
      { name: 'bubble', desc: '(8)' },
    ],
  },
  {
    categoryKey: 'help.catBreaks',
    samples: [
      { name: 'breaks125', desc: '' },
      { name: 'breaks152', desc: '' },
      { name: 'breaks157', desc: '' },
      { name: 'breaks165', desc: '' },
      { name: 'amencutup', desc: '(32)' },
      { name: 'jungle', desc: '(13)' },
    ],
  },
  {
    categoryKey: 'help.catRave',
    samples: [
      { name: 'rave', desc: '(8)' },
      { name: 'rave2', desc: '' },
      { name: 'ravemono', desc: '' },
      { name: 'gabba', desc: '(4)' },
      { name: 'gabbaloud', desc: '' },
      { name: 'gabbalouder', desc: '' },
      { name: 'hardcore', desc: '(12)' },
    ],
  },
  {
    categoryKey: 'help.catWorld',
    samples: [
      { name: 'tabla', desc: '(26)' },
      { name: 'tabla2', desc: '(46)' },
      { name: 'world', desc: '(3)' },
      { name: 'east', desc: '(9)' },
    ],
  },
  {
    categoryKey: 'help.catRetro',
    samples: [
      { name: 'invaders', desc: '(18)' },
      { name: 'sid', desc: '(12)' },
      { name: 'subroc3d', desc: '(11)' },
      { name: 'tacscan', desc: '(22)' },
      { name: 'space', desc: '(18)' },
    ],
  },
  {
    categoryKey: 'help.catMisc',
    samples: [
      { name: 'stab', desc: '(23)' },
      { name: 'hit', desc: '(6)' },
      { name: 'hoover', desc: '(6)' },
      { name: 'future', desc: '(17)' },
      { name: 'techno', desc: '(7)' },
      { name: 'tech', desc: '(13)' },
      { name: 'house', desc: '(8)' },
      { name: 'jazz', desc: '(8)' },
    ],
  },
] as const

/** Copyable code block with copy-to-clipboard button */
function CodeBlock({ code, label }: { code: string; label: string }) {
  const [copied, setCopied] = useState(false)

  const handleCopy = useCallback(() => {
    navigator.clipboard.writeText(code).then(() => {
      setCopied(true)
      setTimeout(() => setCopied(false), 1500)
    }).catch(() => {
      /* Clipboard API may fail in insecure contexts or denied permissions */
      setCopied(false)
    })
  }, [code])

  return (
    <div className="mb-2">
      <div
        className="text-xs mb-1"
        style={{ color: 'var(--color-text-secondary)' }}
      >
        {label}
      </div>
      <div
        className="flex items-start gap-1 rounded p-2"
        style={{
          backgroundColor: 'var(--color-bg)',
          border: '1px solid var(--color-border)',
        }}
      >
        <code
          className="flex-1 text-xs break-all"
          style={{
            fontFamily: 'var(--font-family-mono)',
            color: 'var(--color-primary)',
          }}
        >
          {code}
        </code>
        <button
          type="button"
          onClick={handleCopy}
          className="shrink-0 p-1 rounded hover:opacity-80"
          style={{ color: 'var(--color-text-secondary)' }}
          aria-label={`Copy: ${code}`}
        >
          {copied ? <Check size={14} /> : <Copy size={14} />}
        </button>
      </div>
    </div>
  )
}

/** Section wrapper with translated heading */
function Section({
  titleKey,
  children,
}: {
  titleKey: string
  children: React.ReactNode
}) {
  const { t } = useTranslation()

  return (
    <section>
      <h3
        className="text-sm font-semibold mb-2"
        style={{ color: 'var(--color-text)' }}
      >
        {t(titleKey)}
      </h3>
      {children}
    </section>
  )
}

/** Slide-out help panel with getting started guide, examples, and reference */
export function HelpPanel({ onClose }: HelpPanelProps) {
  const { t } = useTranslation()

  return (
    <aside
      className="fixed right-0 top-0 bottom-0 w-full max-w-64 md:max-w-80 z-40 overflow-y-auto shadow-lg"
      style={{
        backgroundColor: 'var(--color-bg-alt)',
        borderLeft: '1px solid var(--color-border)',
      }}
    >
      {/* Panel header with close button */}
      <div
        className="flex items-center justify-between p-4"
        style={{ borderBottom: '1px solid var(--color-border)' }}
      >
        <h2 className="font-semibold" style={{ color: 'var(--color-text)' }}>
          {t('help.title')}
        </h2>
        <Button variant="ghost" onClick={onClose} aria-label={t('help.close')}>
          <X size={18} />
        </Button>
      </div>

      <div className="p-4 space-y-6">
        {/* --- Getting Started guide --- */}
        <Section titleKey="help.gettingStarted">
          <div
            className="space-y-3 text-xs"
            style={{ color: 'var(--color-text-secondary)' }}
          >
            {/* Step 1 */}
            <div className="flex gap-2">
              <span
                className="shrink-0 w-5 h-5 rounded-full flex items-center justify-center text-xs font-bold"
                style={{
                  backgroundColor: 'var(--color-primary)',
                  color: 'var(--color-bg)',
                }}
              >
                1
              </span>
              <div>
                <div className="font-medium" style={{ color: 'var(--color-text)' }}>
                  {t('help.step1Title')}
                </div>
                <code
                  className="text-xs block mt-1 p-1 rounded"
                  style={{
                    fontFamily: 'var(--font-family-mono)',
                    backgroundColor: 'var(--color-bg)',
                    color: 'var(--color-primary)',
                  }}
                >
                  note("c3 e3 g3").s("sawtooth")
                </code>
              </div>
            </div>
            {/* Step 2 */}
            <div className="flex gap-2">
              <span
                className="shrink-0 w-5 h-5 rounded-full flex items-center justify-center text-xs font-bold"
                style={{
                  backgroundColor: 'var(--color-primary)',
                  color: 'var(--color-bg)',
                }}
              >
                2
              </span>
              <div>
                <div className="font-medium" style={{ color: 'var(--color-text)' }}>
                  {t('help.step2Title')}
                </div>
                <div className="mt-1">{t('help.step2Desc')}</div>
              </div>
            </div>
            {/* Step 3 */}
            <div className="flex gap-2">
              <span
                className="shrink-0 w-5 h-5 rounded-full flex items-center justify-center text-xs font-bold"
                style={{
                  backgroundColor: 'var(--color-primary)',
                  color: 'var(--color-bg)',
                }}
              >
                3
              </span>
              <div>
                <div className="font-medium" style={{ color: 'var(--color-text)' }}>
                  {t('help.step3Title')}
                </div>
                <div className="mt-1">{t('help.step3Desc')}</div>
              </div>
            </div>
          </div>
        </Section>

        {/* --- Copyable example patterns --- */}
        <Section titleKey="help.examples">
          {EXAMPLE_PATTERNS.map((ex) => (
            <CodeBlock key={ex.labelKey} code={ex.code} label={t(ex.labelKey)} />
          ))}
        </Section>

        {/* --- Categorized sample library --- */}
        <Section titleKey="help.samples">
          <div className="space-y-3">
            {SAMPLE_CATEGORIES.map((cat) => (
              <div key={cat.categoryKey}>
                <div
                  className="text-xs font-medium mb-1"
                  style={{ color: 'var(--color-text)' }}
                >
                  {t(cat.categoryKey)}
                </div>
                <div
                  className="grid grid-cols-2 gap-x-2 gap-y-0.5 text-xs"
                  style={{
                    fontFamily: 'var(--font-family-mono)',
                    color: 'var(--color-text-secondary)',
                  }}
                >
                  {cat.samples.map((s) => (
                    <div key={s.name} className="truncate">
                      <span style={{ color: 'var(--color-primary)' }}>{s.name}</span>
                      {s.desc && (
                        <>
                          {' '}
                          <span className="opacity-70">{s.desc}</span>
                        </>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </Section>

        {/* --- Strudel mini-notation cheat sheet --- */}
        <Section titleKey="help.miniNotation">
          <div
            className="space-y-1 text-xs"
            style={{
              fontFamily: 'var(--font-family-mono)',
              color: 'var(--color-text-secondary)',
            }}
          >
            <div><span style={{ color: 'var(--color-primary)' }}>space</span> — {t('help.mnSequence')}</div>
            <div><span style={{ color: 'var(--color-primary)' }}>[  ]</span> — {t('help.mnSubdivide')}</div>
            <div><span style={{ color: 'var(--color-primary)' }}>&lt; &gt;</span> — {t('help.mnAlternate')}</div>
            <div><span style={{ color: 'var(--color-primary)' }}>~</span> — {t('help.mnRest')}</div>
            <div><span style={{ color: 'var(--color-primary)' }}>,</span> — {t('help.mnChord')}</div>
            <div><span style={{ color: 'var(--color-primary)' }}>*N</span> — {t('help.mnSpeedUp')}</div>
            <div><span style={{ color: 'var(--color-primary)' }}>/N</span> — {t('help.mnSlowDown')}</div>
            <div><span style={{ color: 'var(--color-primary)' }}>(k,n)</span> — {t('help.mnEuclidean')}</div>
            <div><span style={{ color: 'var(--color-primary)' }}>?</span> — {t('help.mnRandom')}</div>
          </div>
        </Section>

        {/* --- Common Strudel functions --- */}
        <Section titleKey="help.functions">
          <div
            className="space-y-1 text-xs"
            style={{
              fontFamily: 'var(--font-family-mono)',
              color: 'var(--color-text-secondary)',
            }}
          >
            <div><span style={{ color: 'var(--color-primary)' }}>note()</span> — {t('help.fnNote')}</div>
            <div><span style={{ color: 'var(--color-primary)' }}>s()</span> — {t('help.fnSound')}</div>
            <div><span style={{ color: 'var(--color-primary)' }}>lpf()</span> — {t('help.fnLpf')}</div>
            <div><span style={{ color: 'var(--color-primary)' }}>delay()</span> — {t('help.fnDelay')}</div>
            <div><span style={{ color: 'var(--color-primary)' }}>room()</span> — {t('help.fnRoom')}</div>
            <div><span style={{ color: 'var(--color-primary)' }}>gain()</span> — {t('help.fnGain')}</div>
            <div><span style={{ color: 'var(--color-primary)' }}>speed()</span> — {t('help.fnSpeed')}</div>
            <div><span style={{ color: 'var(--color-primary)' }}>stack()</span> — {t('help.fnStack')}</div>
          </div>
        </Section>

        {/* --- Keyboard shortcuts --- */}
        <Section titleKey="help.shortcuts">
          <div
            className="space-y-1 text-xs"
            style={{ color: 'var(--color-text-secondary)' }}
          >
            <div className="flex justify-between">
              <span>{t('help.scUndo')}</span>
              <kbd className="px-1 rounded" style={{ backgroundColor: 'var(--color-bg-elevated)' }}>Ctrl+Z</kbd>
            </div>
            <div className="flex justify-between">
              <span>{t('help.scRedo')}</span>
              <kbd className="px-1 rounded" style={{ backgroundColor: 'var(--color-bg-elevated)' }}>Ctrl+Shift+Z</kbd>
            </div>
            <div className="flex justify-between">
              <span>{t('help.scSearch')}</span>
              <kbd className="px-1 rounded" style={{ backgroundColor: 'var(--color-bg-elevated)' }}>Ctrl+F</kbd>
            </div>
            <div className="flex justify-between">
              <span>{t('help.scFold')}</span>
              <kbd className="px-1 rounded" style={{ backgroundColor: 'var(--color-bg-elevated)' }}>Ctrl+Shift+[</kbd>
            </div>
            <div className="flex justify-between">
              <span>{t('help.scRun')}</span>
              <kbd className="px-1 rounded" style={{ backgroundColor: 'var(--color-bg-elevated)' }}>Ctrl+Enter</kbd>
            </div>
          </div>
        </Section>

        {/* --- Engine reference --- */}
        <Section titleKey="help.engines">
          <div
            className="space-y-2 text-xs"
            style={{ color: 'var(--color-text-secondary)' }}
          >
            <div><span style={{ color: 'var(--color-strudel)' }}>Strudel</span> — {t('help.engineStrudel')}</div>
            <div><span style={{ color: 'var(--color-tonejs)' }}>Tone.js</span> — {t('help.engineTonejs')}</div>
            <div><span style={{ color: 'var(--color-webaudio)' }}>Web Audio</span> — {t('help.engineWebaudio')}</div>
            <div><span style={{ color: 'var(--color-midi)' }}>MIDI</span> — {t('help.engineMidi')}</div>
          </div>
        </Section>
      </div>
    </aside>
  )
}
