/* ──────────────────────────────────────────────────────────
   HelpPanel molecule — slide-out panel with Strudel cheat
   sheet, common functions, keyboard shortcuts, and engine
   reference. Anchored to the right edge of the viewport.
   ────────────────────────────────────────────────────────── */

import { Button } from '../atoms'
import { X } from 'lucide-react'

interface HelpPanelProps {
  onClose: () => void
}

/** Slide-out help panel with cheat sheet and keyboard shortcuts */
export function HelpPanel({ onClose }: HelpPanelProps) {
  return (
    <aside
      className="fixed right-0 top-0 bottom-0 w-80 z-40 overflow-y-auto shadow-lg"
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
          Help
        </h2>
        <Button variant="ghost" onClick={onClose} aria-label="Close help">
          <X size={18} />
        </Button>
      </div>

      <div className="p-4 space-y-6">
        {/* --- Strudel mini-notation cheat sheet --- */}
        <section>
          <h3
            className="text-sm font-semibold mb-2"
            style={{ color: 'var(--color-text)' }}
          >
            Strudel Mini-Notation
          </h3>
          <div
            className="space-y-1 text-xs"
            style={{
              fontFamily: 'var(--font-family-mono)',
              color: 'var(--color-text-secondary)',
            }}
          >
            <div><span style={{ color: 'var(--color-primary)' }}>space</span> — sequence events</div>
            <div><span style={{ color: 'var(--color-primary)' }}>[  ]</span> — subdivide / group</div>
            <div><span style={{ color: 'var(--color-primary)' }}>&lt; &gt;</span> — one per cycle</div>
            <div><span style={{ color: 'var(--color-primary)' }}>~</span> — rest / silence</div>
            <div><span style={{ color: 'var(--color-primary)' }}>,</span> — play together (chord)</div>
            <div><span style={{ color: 'var(--color-primary)' }}>*N</span> — speed up N times</div>
            <div><span style={{ color: 'var(--color-primary)' }}>/N</span> — slow down N times</div>
            <div><span style={{ color: 'var(--color-primary)' }}>(k,n)</span> — Euclidean rhythm</div>
            <div><span style={{ color: 'var(--color-primary)' }}>?</span> — random removal (50%)</div>
          </div>
        </section>

        {/* --- Common Strudel functions --- */}
        <section>
          <h3
            className="text-sm font-semibold mb-2"
            style={{ color: 'var(--color-text)' }}
          >
            Common Functions
          </h3>
          <div
            className="space-y-1 text-xs"
            style={{
              fontFamily: 'var(--font-family-mono)',
              color: 'var(--color-text-secondary)',
            }}
          >
            <div><span style={{ color: 'var(--color-primary)' }}>note()</span> — set pitch</div>
            <div><span style={{ color: 'var(--color-primary)' }}>s()</span> — set sound/sample</div>
            <div><span style={{ color: 'var(--color-primary)' }}>lpf()</span> — low-pass filter</div>
            <div><span style={{ color: 'var(--color-primary)' }}>delay()</span> — delay effect</div>
            <div><span style={{ color: 'var(--color-primary)' }}>room()</span> — reverb amount</div>
            <div><span style={{ color: 'var(--color-primary)' }}>gain()</span> — volume</div>
            <div><span style={{ color: 'var(--color-primary)' }}>speed()</span> — playback speed</div>
            <div><span style={{ color: 'var(--color-primary)' }}>stack()</span> — layer patterns</div>
          </div>
        </section>

        {/* --- Keyboard shortcuts --- */}
        <section>
          <h3
            className="text-sm font-semibold mb-2"
            style={{ color: 'var(--color-text)' }}
          >
            Keyboard Shortcuts
          </h3>
          <div
            className="space-y-1 text-xs"
            style={{ color: 'var(--color-text-secondary)' }}
          >
            <div className="flex justify-between">
              <span>Undo</span>
              <kbd className="px-1 rounded" style={{ backgroundColor: 'var(--color-bg-elevated)' }}>Ctrl+Z</kbd>
            </div>
            <div className="flex justify-between">
              <span>Redo</span>
              <kbd className="px-1 rounded" style={{ backgroundColor: 'var(--color-bg-elevated)' }}>Ctrl+Shift+Z</kbd>
            </div>
            <div className="flex justify-between">
              <span>Search</span>
              <kbd className="px-1 rounded" style={{ backgroundColor: 'var(--color-bg-elevated)' }}>Ctrl+F</kbd>
            </div>
            <div className="flex justify-between">
              <span>Fold</span>
              <kbd className="px-1 rounded" style={{ backgroundColor: 'var(--color-bg-elevated)' }}>Ctrl+Shift+[</kbd>
            </div>
          </div>
        </section>

        {/* --- Engine reference --- */}
        <section>
          <h3
            className="text-sm font-semibold mb-2"
            style={{ color: 'var(--color-text)' }}
          >
            Engines
          </h3>
          <div
            className="space-y-2 text-xs"
            style={{ color: 'var(--color-text-secondary)' }}
          >
            <div><span style={{ color: '#a855f7' }}>Strudel</span> — Pattern-based live coding (strudel.cc)</div>
            <div><span style={{ color: '#3b82f6' }}>Tone.js</span> — High-level synths and effects</div>
            <div><span style={{ color: '#22c55e' }}>Web Audio</span> — Low-level native API</div>
            <div><span style={{ color: '#f97316' }}>MIDI</span> — External device output (output only)</div>
          </div>
        </section>
      </div>
    </aside>
  )
}
