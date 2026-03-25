/* ──────────────────────────────────────────────────────────
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

/* Categorized sample library from Dirt-Samples (~50 most useful) */
const SAMPLE_CATEGORIES = [
  {
    category: 'Drums',
    samples: [
      { name: 'bd', desc: 'Bass drum (24)' },
      { name: 'sd', desc: 'Snare drum (24)' },
      { name: 'hh', desc: 'Hi-hat closed (6)' },
      { name: 'oh', desc: 'Open hi-hat (4)' },
      { name: 'cp', desc: 'Clap (2)' },
      { name: 'cr', desc: 'Crash cymbal (6)' },
      { name: 'cb', desc: 'Cowbell (1)' },
      { name: 'lt', desc: 'Low tom (16)' },
      { name: 'mt', desc: 'Mid tom (8)' },
      { name: 'ht', desc: 'High tom (5)' },
    ],
  },
  {
    category: '808 Kit',
    samples: [
      { name: '808bd', desc: 'Bass drum' },
      { name: '808sd', desc: 'Snare' },
      { name: '808hc', desc: 'Hi-hat closed' },
      { name: '808ht', desc: 'High tom' },
      { name: '808lt', desc: 'Low tom' },
      { name: '808mt', desc: 'Mid tom' },
      { name: '808oh', desc: 'Open hi-hat' },
      { name: '808cy', desc: 'Cymbal' },
    ],
  },
  {
    category: 'Bass',
    samples: [
      { name: 'bass', desc: 'Bass (4)' },
      { name: 'bass0', desc: 'Bass variant 0' },
      { name: 'bass1', desc: 'Bass variant 1' },
      { name: 'bass2', desc: 'Bass variant 2' },
      { name: 'bass3', desc: 'Bass variant 3' },
      { name: 'bassdm', desc: 'Bass DM' },
      { name: 'bassfoo', desc: 'Bass Foo' },
    ],
  },
  {
    category: 'Melodic',
    samples: [
      { name: 'arpy', desc: 'Arpeggio (11)' },
      { name: 'casio', desc: 'Casio tones (3)' },
      { name: 'piano', desc: 'Piano (1)' },
      { name: 'pluck', desc: 'Pluck synth (1)' },
    ],
  },
  {
    category: 'Percussion',
    samples: [
      { name: 'can', desc: 'Can hits (14)' },
      { name: 'bottle', desc: 'Bottle (13)' },
      { name: 'click', desc: 'Click (4)' },
      { name: 'drum', desc: 'Drum misc (6)' },
      { name: 'metal', desc: 'Metal hits (10)' },
      { name: 'tabla', desc: 'Tabla (26)' },
    ],
  },
  {
    category: 'Vocal / FX',
    samples: [
      { name: 'mouth', desc: 'Mouth (1)' },
      { name: 'breath', desc: 'Breath (1)' },
      { name: 'crow', desc: 'Crow (4)' },
      { name: 'birds', desc: 'Birds (10)' },
      { name: 'bubble', desc: 'Bubble (8)' },
    ],
  },
  {
    category: 'Breaks',
    samples: [
      { name: 'breaks125', desc: '125 BPM' },
      { name: 'breaks152', desc: '152 BPM' },
      { name: 'breaks157', desc: '157 BPM' },
      { name: 'breaks165', desc: '165 BPM' },
      { name: 'amencutup', desc: 'Amen slices (32)' },
    ],
  },
  {
    category: 'Misc',
    samples: [
      { name: 'noise', desc: 'Noise (1)' },
      { name: 'coins', desc: 'Coins (1)' },
      { name: 'bleep', desc: 'Bleep (13)' },
      { name: 'blip', desc: 'Blip (2)' },
      { name: 'clubkick', desc: 'Club kick (5)' },
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
      className="fixed right-0 top-0 bottom-0 w-64 md:w-80 z-40 overflow-y-auto shadow-lg"
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
              <div key={cat.category}>
                <div
                  className="text-xs font-medium mb-1"
                  style={{ color: 'var(--color-text)' }}
                >
                  {cat.category}
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
                      {' — '}
                      <span className="opacity-70">{s.desc}</span>
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
            <div><span style={{ color: '#a855f7' }}>Strudel</span> — {t('help.engineStrudel')}</div>
            <div><span style={{ color: '#3b82f6' }}>Tone.js</span> — {t('help.engineTonejs')}</div>
            <div><span style={{ color: '#22c55e' }}>Web Audio</span> — {t('help.engineWebaudio')}</div>
            <div><span style={{ color: '#f97316' }}>MIDI</span> — {t('help.engineMidi')}</div>
          </div>
        </Section>
      </div>
    </aside>
  )
}
