/* ──────────────────────────────────────────────────────────
   SidePanel — tabbed sidebar for Samples, Reference, Console,
   and Settings. Slides in from the right side of the editor.
   Surpasses Strudel's panel with richer features and better UX.
   ────────────────────────────────────────────────────────── */

import { useState, useRef, useEffect, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { Music, BookOpen, Terminal, Settings, X, Search, ChevronRight } from 'lucide-react';
import { useAppStore } from '../../lib/store';
import { Button } from '../atoms';

/* ── Tab definitions ── */
type TabId = 'samples' | 'reference' | 'console' | 'settings';

const TABS: { id: TabId; Icon: typeof Music }[] = [
  { id: 'samples', Icon: Music },
  { id: 'reference', Icon: BookOpen },
  { id: 'console', Icon: Terminal },
  { id: 'settings', Icon: Settings },
];

/* ── Sidebar component ── */
export function SidePanel() {
  const { t } = useTranslation();
  const [activeTab, setActiveTab] = useState<TabId | null>(null);
  const showSidePanel = useAppStore((s) => s.showSidePanel);
  const toggleSidePanel = useAppStore((s) => s.toggleSidePanel);

  /* Close on Escape */
  useEffect(() => {
    if (!showSidePanel) return;
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'Escape') toggleSidePanel();
    };
    document.addEventListener('keydown', handler);
    return () => document.removeEventListener('keydown', handler);
  }, [showSidePanel, toggleSidePanel]);

  /* Auto-select first tab when panel opens */
  useEffect(() => {
    if (showSidePanel && !activeTab) setActiveTab('samples');
  }, [showSidePanel, activeTab]);

  if (!showSidePanel) return null;

  return (
    <aside
      className="flex h-full"
      style={{
        borderLeft: '1px solid var(--color-border)',
        backgroundColor: 'var(--color-bg)',
        width: '320px',
        minWidth: '280px',
        maxWidth: '400px',
      }}
    >
      {/* Tab strip — vertical icons */}
      <nav
        className="flex flex-col items-center gap-1 shrink-0"
        style={{
          width: '40px',
          padding: 'var(--space-2) 0',
          backgroundColor: 'var(--color-bg-alt)',
          borderRight: '1px solid var(--color-border)',
        }}
        aria-label="Side panel tabs"
      >
        {TABS.map(({ id, Icon }) => (
          <button
            key={id}
            type="button"
            onClick={() => setActiveTab(id)}
            aria-selected={activeTab === id}
            title={t(`sidePanel.${id}`)}
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              width: '32px',
              height: '32px',
              borderRadius: 'var(--radius-md)',
              border: 'none',
              backgroundColor: activeTab === id ? 'var(--color-bg-hover)' : 'transparent',
              color: activeTab === id ? 'var(--color-primary)' : 'var(--color-text-muted)',
              cursor: 'pointer',
              transition: 'var(--transition-fast)',
            }}
          >
            <Icon size={16} />
          </button>
        ))}

        {/* Close button at bottom */}
        <div style={{ flex: 1 }} />
        <button
          type="button"
          onClick={toggleSidePanel}
          title="Close panel"
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            width: '32px',
            height: '32px',
            borderRadius: 'var(--radius-md)',
            border: 'none',
            backgroundColor: 'transparent',
            color: 'var(--color-text-muted)',
            cursor: 'pointer',
          }}
        >
          <X size={14} />
        </button>
      </nav>

      {/* Tab content */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Tab header */}
        <div
          className="flex items-center justify-between shrink-0"
          style={{
            padding: 'var(--space-2) var(--space-3)',
            borderBottom: '1px solid var(--color-border)',
          }}
        >
          <span style={{
            fontSize: 'var(--font-size-sm)',
            fontWeight: 'var(--font-weight-semibold)',
            color: 'var(--color-text)',
          }}>
            {activeTab && t(`sidePanel.${activeTab}`)}
          </span>
        </div>

        {/* Scrollable content area */}
        <div className="flex-1 overflow-y-auto overflow-x-hidden">
          {activeTab === 'samples' && <SampleBrowser />}
          {activeTab === 'reference' && <ReferencePanel />}
          {activeTab === 'console' && <ConsolePanel />}
          {activeTab === 'settings' && <SettingsPanel />}
        </div>
      </div>
    </aside>
  );
}

/* ══════════════════════════════════════════════════════════
   SAMPLE BROWSER — searchable, categorized, click-to-insert
   ══════════════════════════════════════════════════════════ */

/* Inline sample data — categories with top samples */
const SAMPLE_CATEGORIES = [
  { id: 'drums', label: 'Drum Machines', samples: ['bd', 'sd', 'hh', 'oh', 'cp', 'cr', 'cb', 'lt', 'mt', 'ht', 'rim'] },
  { id: 'kits', label: '808 / 909', samples: ['808', '808bd', '808sd', '808hc', '808ht', '808lt', '808oh', '909'] },
  { id: 'synths', label: 'Synths', samples: ['sawtooth', 'sine', 'square', 'triangle', 'supersquare', 'supersaw'] },
  { id: 'bass', label: 'Bass', samples: ['bass', 'bass0', 'bass1', 'bass2', 'bass3', 'dbass'] },
  { id: 'keys', label: 'Keys & Pads', samples: ['piano', 'rhodes', 'gtr', 'jvbass', 'superpiano'] },
  { id: 'perc', label: 'Percussion', samples: ['perc', 'clak', 'click', 'tabla', 'tabla2', 'hand'] },
  { id: 'vocal', label: 'Vocals', samples: ['alphabet', 'voice', 'speechless', 'mouth'] },
  { id: 'fx', label: 'FX & Noise', samples: ['industrial', 'noise', 'noise2', 'metal', 'pebbles'] },
  { id: 'world', label: 'World', samples: ['tabla', 'tabla2', 'sitar', 'pluck', 'kalimba'] },
  { id: 'misc', label: 'Misc', samples: ['birds', 'birds3', 'wind', 'numbers', 'can'] },
];

function SampleBrowser() {
  const [search, setSearch] = useState('');
  const [expandedCat, setExpandedCat] = useState<string | null>('drums');
  const inputRef = useRef<HTMLInputElement>(null);

  const insertSample = useCallback((sample: string) => {
    /* Insert sample code into the active file */
    const store = useAppStore.getState();
    const activeFile = store.files.find((f) => f.active);
    if (activeFile) {
      const code = activeFile.code;
      const insertion = code.trim() ? `\n.s("${sample}")` : `s("${sample}")`;
      store.updateFileCode(activeFile.id, code + insertion);
    }
  }, []);

  const filtered = search.trim()
    ? SAMPLE_CATEGORIES.map((cat) => ({
        ...cat,
        samples: cat.samples.filter((s) => s.toLowerCase().includes(search.toLowerCase())),
      })).filter((cat) => cat.samples.length > 0)
    : SAMPLE_CATEGORIES;

  return (
    <div style={{ padding: 'var(--space-2)' }}>
      {/* Search */}
      <div className="relative" style={{ marginBottom: 'var(--space-2)' }}>
        <Search size={12} style={{ position: 'absolute', left: '8px', top: '50%', transform: 'translateY(-50%)', color: 'var(--color-text-muted)' }} />
        <input
          ref={inputRef}
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search samples..."
          style={{
            width: '100%',
            padding: 'var(--space-2) var(--space-2) var(--space-2) var(--space-8)',
            backgroundColor: 'var(--color-bg-elevated)',
            color: 'var(--color-text)',
            border: '1px solid var(--color-border)',
            borderRadius: 'var(--radius-md)',
            fontSize: 'var(--font-size-xs)',
            fontFamily: 'var(--font-family-mono)',
            outline: 'none',
          }}
        />
      </div>

      {/* Category accordion */}
      {filtered.map((cat) => (
        <div key={cat.id} style={{ marginBottom: 'var(--space-1)' }}>
          <button
            type="button"
            onClick={() => setExpandedCat(expandedCat === cat.id ? null : cat.id)}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 'var(--space-2)',
              width: '100%',
              padding: 'var(--space-2)',
              backgroundColor: 'transparent',
              color: 'var(--color-text)',
              border: 'none',
              cursor: 'pointer',
              fontSize: 'var(--font-size-xs)',
              fontWeight: 'var(--font-weight-medium)',
              textAlign: 'left',
              borderRadius: 'var(--radius-sm)',
            }}
          >
            <ChevronRight
              size={12}
              style={{
                transform: expandedCat === cat.id ? 'rotate(90deg)' : 'rotate(0deg)',
                transition: 'var(--transition-fast)',
                color: 'var(--color-text-muted)',
              }}
            />
            {cat.label}
            <span style={{ color: 'var(--color-text-muted)', marginLeft: 'auto', fontSize: '10px' }}>
              {cat.samples.length}
            </span>
          </button>

          {expandedCat === cat.id && (
            <div className="flex flex-wrap gap-1" style={{ padding: '0 var(--space-2) var(--space-2)' }}>
              {cat.samples.map((sample) => (
                <button
                  key={sample}
                  type="button"
                  onClick={() => insertSample(sample)}
                  title={`Insert s("${sample}")`}
                  style={{
                    padding: 'var(--space-1) var(--space-2)',
                    backgroundColor: 'var(--color-bg-elevated)',
                    color: 'var(--color-text-secondary)',
                    border: '1px solid var(--color-border)',
                    borderRadius: 'var(--radius-sm)',
                    cursor: 'pointer',
                    fontSize: '11px',
                    fontFamily: 'var(--font-family-mono)',
                    transition: 'var(--transition-fast)',
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.borderColor = 'var(--color-primary)';
                    e.currentTarget.style.color = 'var(--color-text)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.borderColor = 'var(--color-border)';
                    e.currentTarget.style.color = 'var(--color-text-secondary)';
                  }}
                >
                  {sample}
                </button>
              ))}
            </div>
          )}
        </div>
      ))}
    </div>
  );
}

/* ══════════════════════════════════════════════════════════
   REFERENCE PANEL — searchable API docs inline
   ══════════════════════════════════════════════════════════ */

const REFERENCE_SECTIONS = [
  {
    title: 'Sounds',
    items: [
      { fn: 's("name")', desc: 'Select sound/sample' },
      { fn: 'note("c3 e3 g3")', desc: 'Play pitched notes' },
      { fn: 'sound("bd sd")', desc: 'Alias for s()' },
      { fn: 'samples("url")', desc: 'Load sample pack' },
    ],
  },
  {
    title: 'Pattern',
    items: [
      { fn: 'stack(a, b)', desc: 'Layer patterns' },
      { fn: 'cat(a, b)', desc: 'Concatenate patterns' },
      { fn: '.fast(2)', desc: 'Speed up N times' },
      { fn: '.slow(2)', desc: 'Slow down N times' },
      { fn: '.rev()', desc: 'Reverse pattern' },
      { fn: '.every(4, fn)', desc: 'Apply every N cycles' },
      { fn: '.sometimes(fn)', desc: '50% random apply' },
      { fn: '.off(t, fn)', desc: 'Offset layer' },
      { fn: '.jux(fn)', desc: 'Stereo split' },
      { fn: '.ply(n)', desc: 'Repeat events N times' },
      { fn: '.euclid(k, n)', desc: 'Euclidean rhythm' },
    ],
  },
  {
    title: 'Effects',
    items: [
      { fn: '.gain(0.8)', desc: 'Volume (0-1)' },
      { fn: '.lpf(800)', desc: 'Low-pass filter Hz' },
      { fn: '.hpf(200)', desc: 'High-pass filter Hz' },
      { fn: '.delay(0.5)', desc: 'Delay amount' },
      { fn: '.room(0.5)', desc: 'Reverb amount' },
      { fn: '.pan(0.5)', desc: 'Stereo position' },
      { fn: '.speed(1)', desc: 'Playback speed' },
      { fn: '.crush(4)', desc: 'Bit crush' },
      { fn: '.shape(0.5)', desc: 'Waveshaper' },
      { fn: '.vowel("a")', desc: 'Formant filter' },
    ],
  },
  {
    title: 'Controls',
    items: [
      { fn: 'slider(v, min, max)', desc: 'Inline slider widget' },
      { fn: 'mouseX', desc: 'Mouse X position' },
      { fn: 'mouseY', desc: 'Mouse Y position' },
      { fn: '.range(lo, hi)', desc: 'Map value range' },
    ],
  },
  {
    title: 'Tonal',
    items: [
      { fn: '.scale("C:minor")', desc: 'Map to scale' },
      { fn: '.transpose(7)', desc: 'Transpose semitones' },
      { fn: '.voicings("left")', desc: 'Chord voicings' },
      { fn: 'chord("Cm7")', desc: 'Chord pattern' },
    ],
  },
  {
    title: 'Sample Manip',
    items: [
      { fn: '.chop(n)', desc: 'Cut into N slices' },
      { fn: '.striate(n)', desc: 'Layer slices' },
      { fn: '.loopAt(n)', desc: 'Loop to fit N cycles' },
      { fn: '.legato(0.5)', desc: 'Note duration' },
      { fn: '.attack(0.01)', desc: 'Envelope attack' },
      { fn: '.release(0.1)', desc: 'Envelope release' },
    ],
  },
  {
    title: 'Mini-Notation',
    items: [
      { fn: '"a b c d"', desc: 'Sequence events' },
      { fn: '"[a b] c"', desc: 'Subdivide group' },
      { fn: '"<a b>"', desc: 'Alternate per cycle' },
      { fn: '"a ~ b"', desc: 'Rest / silence' },
      { fn: '"a*4"', desc: 'Repeat N times' },
      { fn: '"a(3,8)"', desc: 'Euclidean rhythm' },
      { fn: '"a,b"', desc: 'Play together' },
      { fn: '"a?"', desc: 'Random 50%' },
    ],
  },
];

function ReferencePanel() {
  const [search, setSearch] = useState('');

  const filtered = search.trim()
    ? REFERENCE_SECTIONS.map((sec) => ({
        ...sec,
        items: sec.items.filter(
          (i) => i.fn.toLowerCase().includes(search.toLowerCase()) || i.desc.toLowerCase().includes(search.toLowerCase())
        ),
      })).filter((sec) => sec.items.length > 0)
    : REFERENCE_SECTIONS;

  return (
    <div style={{ padding: 'var(--space-2)' }}>
      <div className="relative" style={{ marginBottom: 'var(--space-2)' }}>
        <Search size={12} style={{ position: 'absolute', left: '8px', top: '50%', transform: 'translateY(-50%)', color: 'var(--color-text-muted)' }} />
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search API..."
          style={{
            width: '100%',
            padding: 'var(--space-2) var(--space-2) var(--space-2) var(--space-8)',
            backgroundColor: 'var(--color-bg-elevated)',
            color: 'var(--color-text)',
            border: '1px solid var(--color-border)',
            borderRadius: 'var(--radius-md)',
            fontSize: 'var(--font-size-xs)',
            fontFamily: 'var(--font-family-mono)',
            outline: 'none',
          }}
        />
      </div>

      {filtered.map((sec) => (
        <div key={sec.title} style={{ marginBottom: 'var(--space-3)' }}>
          <div style={{
            fontSize: '10px',
            fontWeight: 'var(--font-weight-semibold)',
            color: 'var(--color-primary)',
            textTransform: 'uppercase',
            letterSpacing: '0.05em',
            padding: 'var(--space-1) var(--space-2)',
          }}>
            {sec.title}
          </div>
          {sec.items.map((item) => (
            <div
              key={item.fn}
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                padding: 'var(--space-1) var(--space-2)',
                fontSize: '11px',
                borderRadius: 'var(--radius-sm)',
              }}
            >
              <code style={{
                fontFamily: 'var(--font-family-mono)',
                color: 'var(--color-text)',
                fontSize: '11px',
              }}>
                {item.fn}
              </code>
              <span style={{ color: 'var(--color-text-muted)', fontSize: '10px', textAlign: 'right', marginLeft: 'var(--space-2)' }}>
                {item.desc}
              </span>
            </div>
          ))}
        </div>
      ))}
    </div>
  );
}

/* ══════════════════════════════════════════════════════════
   CONSOLE PANEL — shows evaluation output, errors, log
   ══════════════════════════════════════════════════════════ */

/* Global console log buffer */
const MAX_LOG_ENTRIES = 200;
let logBuffer: { type: 'log' | 'error' | 'warn' | 'info'; message: string; time: number }[] = [];
let logListeners: (() => void)[] = [];

/* Intercept console for Strudel output */
if (typeof window !== 'undefined' && !(window as any).__lmcConsolePatched) {
  (window as any).__lmcConsolePatched = true;
  const origLog = console.log;
  const origError = console.error;
  const origWarn = console.warn;

  const push = (type: 'log' | 'error' | 'warn', args: unknown[]) => {
    const message = args.map((a) => (typeof a === 'object' ? JSON.stringify(a) : String(a))).join(' ');
    /* Filter out noisy Strudel/Vite messages */
    if (message.includes('[vite]') || message.includes('i18next') || message.includes('locize')) return;
    logBuffer.push({ type, message, time: Date.now() });
    if (logBuffer.length > MAX_LOG_ENTRIES) logBuffer = logBuffer.slice(-MAX_LOG_ENTRIES);
    logListeners.forEach((l) => l());
  };

  console.log = (...args: unknown[]) => { origLog(...args); push('log', args); };
  console.error = (...args: unknown[]) => { origError(...args); push('error', args); };
  console.warn = (...args: unknown[]) => { origWarn(...args); push('warn', args); };
}

function ConsolePanel() {
  const [, forceUpdate] = useState(0);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const listener = () => forceUpdate((n) => n + 1);
    logListeners.push(listener);
    return () => { logListeners = logListeners.filter((l) => l !== listener); };
  }, []);

  /* Auto-scroll to bottom */
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  });

  const typeColors: Record<string, string> = {
    log: 'var(--color-text-secondary)',
    error: 'var(--color-error)',
    warn: 'var(--color-warning)',
    info: 'var(--color-primary)',
  };

  return (
    <div ref={scrollRef} className="h-full overflow-y-auto" style={{ padding: 'var(--space-2)', fontFamily: 'var(--font-family-mono)', fontSize: '11px' }}>
      {logBuffer.length === 0 ? (
        <div style={{ color: 'var(--color-text-muted)', padding: 'var(--space-4)', textAlign: 'center' }}>
          Console output appears here
        </div>
      ) : (
        logBuffer.map((entry, i) => (
          <div
            key={i}
            style={{
              color: typeColors[entry.type] || 'var(--color-text)',
              padding: '1px 0',
              borderBottom: '1px solid var(--color-border)',
              wordBreak: 'break-all',
              lineHeight: '1.4',
            }}
          >
            <span style={{ color: 'var(--color-text-muted)', marginRight: 'var(--space-2)' }}>
              {new Date(entry.time).toLocaleTimeString('de', { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
            </span>
            {entry.message}
          </div>
        ))
      )}
      <Button
        variant="ghost"
        className="!text-xs mt-2"
        onClick={() => { logBuffer = []; forceUpdate((n) => n + 1); }}
      >
        Clear
      </Button>
    </div>
  );
}

/* ══════════════════════════════════════════════════════════
   SETTINGS PANEL — audio device, font, keybindings, toggles
   ══════════════════════════════════════════════════════════ */

function SettingsPanel() {
  const [devices, setDevices] = useState<MediaDeviceInfo[]>([]);
  const [selectedDevice, setSelectedDevice] = useState('');
  const [fontSize, setFontSize] = useState(() => parseInt(localStorage.getItem('lmc-font-size') || '14'));
  const [lineWrap, setLineWrap] = useState(() => localStorage.getItem('lmc-line-wrap') !== 'false');
  const [lineNumbers, setLineNumbers] = useState(() => localStorage.getItem('lmc-line-numbers') !== 'false');
  const [highlightEvents, setHighlightEvents] = useState(() => localStorage.getItem('lmc-highlight-events') !== 'false');
  const [flashOnEval, setFlashOnEval] = useState(() => localStorage.getItem('lmc-flash-eval') === 'true');
  const [keybindings, setKeybindings] = useState(() => localStorage.getItem('lmc-keybindings') || 'default');
  const zenMode = useAppStore((s) => s.zenMode);
  const toggleZenMode = useAppStore((s) => s.toggleZenMode);

  /* Enumerate audio output devices */
  useEffect(() => {
    navigator.mediaDevices?.enumerateDevices().then((all) => {
      const outputs = all.filter((d) => d.kind === 'audiooutput');
      setDevices(outputs);
    }).catch(() => {});
  }, []);

  /* Change audio output device */
  const handleDeviceChange = useCallback(async (deviceId: string) => {
    setSelectedDevice(deviceId);
    try {
      const { getAudioContext } = await import('@strudel/webaudio');
      const ctx = getAudioContext();
      if (ctx && 'setSinkId' in ctx) {
        await (ctx as any).setSinkId(deviceId);
      }
    } catch { /* device change failed */ }
  }, []);

  const saveSetting = (key: string, value: string) => {
    localStorage.setItem(key, value);
  };

  const inputStyle = {
    width: '100%',
    padding: 'var(--space-2)',
    backgroundColor: 'var(--color-bg-elevated)',
    color: 'var(--color-text)',
    border: '1px solid var(--color-border)',
    borderRadius: 'var(--radius-md)',
    fontSize: 'var(--font-size-xs)',
    outline: 'none',
  };

  const labelStyle = {
    display: 'block',
    fontSize: '11px',
    color: 'var(--color-text-muted)',
    marginBottom: 'var(--space-1)',
    fontWeight: 'var(--font-weight-medium)' as const,
  };

  return (
    <div style={{ padding: 'var(--space-3)', display: 'flex', flexDirection: 'column' as const, gap: 'var(--space-4)' }}>
      {/* Audio output device */}
      <div>
        <label style={labelStyle}>Audio Output Device</label>
        <select
          value={selectedDevice}
          onChange={(e) => handleDeviceChange(e.target.value)}
          style={inputStyle}
        >
          <option value="">Default</option>
          {devices.map((d) => (
            <option key={d.deviceId} value={d.deviceId}>
              {d.label || `Device ${d.deviceId.slice(0, 8)}`}
            </option>
          ))}
        </select>
      </div>

      {/* Font size */}
      <div>
        <label style={labelStyle}>Font Size: {fontSize}px</label>
        <input
          type="range"
          min="10"
          max="24"
          value={fontSize}
          onChange={(e) => {
            const v = parseInt(e.target.value);
            setFontSize(v);
            saveSetting('lmc-font-size', String(v));
          }}
          style={{ width: '100%', accentColor: 'var(--color-primary)' }}
        />
      </div>

      {/* Keybinding mode */}
      <div>
        <label style={labelStyle}>Keybindings</label>
        <select
          value={keybindings}
          onChange={(e) => {
            setKeybindings(e.target.value);
            saveSetting('lmc-keybindings', e.target.value);
          }}
          aria-label="Keybindings"
          style={inputStyle}
        >
          <option value="default">CodeMirror (Default)</option>
          <option value="vim">Vim</option>
          <option value="emacs">Emacs</option>
          <option value="vscode">VS Code</option>
        </select>
      </div>

      {/* Zen mode */}
      <label
        className="flex items-center gap-2 cursor-pointer"
        style={{ fontSize: '12px', color: 'var(--color-text)' }}
      >
        <input
          type="checkbox"
          checked={zenMode}
          onChange={() => toggleZenMode()}
          style={{ accentColor: 'var(--color-primary)' }}
        />
        Zen Mode (hide UI, focus on code)
      </label>

      {/* Toggle settings */}
      {[
        { key: 'lmc-highlight-events', label: 'Highlight active events in code', state: highlightEvents, set: setHighlightEvents },
        { key: 'lmc-line-numbers', label: 'Display line numbers', state: lineNumbers, set: setLineNumbers },
        { key: 'lmc-line-wrap', label: 'Enable line wrapping', state: lineWrap, set: setLineWrap },
        { key: 'lmc-flash-eval', label: 'Flash on evaluation', state: flashOnEval, set: setFlashOnEval },
      ].map(({ key, label, state, set }) => (
        <label
          key={key}
          className="flex items-center gap-2 cursor-pointer"
          style={{ fontSize: '12px', color: 'var(--color-text)' }}
        >
          <input
            type="checkbox"
            checked={state}
            onChange={(e) => {
              set(e.target.checked);
              saveSetting(key, String(e.target.checked));
            }}
            style={{ accentColor: 'var(--color-primary)' }}
          />
          {label}
        </label>
      ))}

      {/* Reset settings */}
      <Button
        variant="ghost"
        className="!text-xs"
        onClick={() => {
          ['lmc-font-size', 'lmc-line-wrap', 'lmc-line-numbers', 'lmc-highlight-events', 'lmc-flash-eval'].forEach((k) => localStorage.removeItem(k));
          setFontSize(14);
          setLineWrap(true);
          setLineNumbers(true);
          setHighlightEvents(true);
          setFlashOnEval(false);
        }}
      >
        Reset Settings
      </Button>
    </div>
  );
}
