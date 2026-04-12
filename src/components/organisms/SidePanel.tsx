/* SPDX-License-Identifier: AGPL-3.0-or-later
   Copyright (c) 2026 Arnold Wender / Wender Media
   ──────────────────────────────────────────────────────────
   SidePanel — tabbed sidebar for Samples, Reference, Console,
   and Settings. Slides in from the right side of the editor.
   Surpasses Strudel's panel with richer features and better UX.
   ────────────────────────────────────────────────────────── */

import { useState, useRef, useEffect, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { Music, BookOpen, Terminal, Settings, X, Search, ChevronRight } from 'lucide-react';
import { useAppStore } from '../../lib/store';
import { useMediaQuery } from '../../lib/useMediaQuery';
import { Button } from '../atoms';
import { SampleDropZone } from '../molecules/SampleDropZone';

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
  const isMobile = useMediaQuery('(max-width: 768px)');
  const [activeTab, setActiveTab] = useState<TabId | null>(null);
  /* SidePanel is deprecated — replaced by ActivityBar + DetailPanel.
     Kept only for sub-component exports (SampleBrowser, ReferencePanel, etc.) */
  const showSidePanel = useAppStore((s) => s.activeDetailSection !== null);
  const toggleSidePanel = useAppStore((s) => () => s.setActiveDetailSection(null));

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
        ...(isMobile
          ? {
              position: 'fixed' as const,
              inset: 0,
              zIndex: 100,
              backgroundColor: 'var(--color-bg)',
              width: '100%',
            }
          : {
              borderLeft: '1px solid var(--color-border)',
              backgroundColor: 'var(--color-bg)',
              width: '320px',
              minWidth: '280px',
              maxWidth: '400px',
            }),
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
            aria-label={t(`sidePanel.${id}`)}
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
          aria-label="Close panel"
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
  { id: 'drums', label: 'Drum Machines', samples: ['bd', 'sd', 'hh', 'oh', 'cp', 'cr', 'cb', 'lt', 'mt', 'ht'] },
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

/* Engine-specific sample categories */
const TONEJS_CATEGORIES = [
  { id: 'synths', label: 'Synthesizers', samples: ['Synth', 'FMSynth', 'AMSynth', 'MonoSynth', 'PolySynth', 'PluckSynth', 'MembraneSynth', 'MetalSynth', 'NoiseSynth', 'DuoSynth'] },
  { id: 'oscillators', label: 'Oscillator Types', samples: ['sine', 'square', 'sawtooth', 'triangle', 'fatsine', 'fatsquare', 'fatsawtooth', 'fattriangle', 'pulse', 'pwm'] },
  { id: 'effects', label: 'Effects', samples: ['Reverb', 'FeedbackDelay', 'PingPongDelay', 'Chorus', 'Distortion', 'Phaser', 'Tremolo', 'Vibrato', 'AutoFilter', 'AutoPanner', 'AutoWah', 'BitCrusher', 'Chebyshev', 'Compressor', 'EQ3', 'Freeverb', 'JCReverb', 'Limiter', 'PitchShift', 'StereoWidener'] },
  { id: 'sources', label: 'Sources', samples: ['Player', 'GrainPlayer', 'Noise', 'Oscillator', 'OmniOscillator', 'FatOscillator', 'PWMOscillator', 'AMOscillator', 'FMOscillator'] },
  { id: 'scheduling', label: 'Scheduling', samples: ['Sequence', 'Loop', 'Part', 'Pattern', 'Transport'] },
  { id: 'analysis', label: 'Analysis', samples: ['Analyser', 'Meter', 'FFT', 'Waveform', 'DCMeter', 'Follower'] },
  { id: 'songs-tone', label: 'Full Songs', samples: ['Trance Arp', 'Ambient Pad', 'Drum Machine', 'Bass Sequence', 'Chiptune Melody', 'Jazz Chords', 'Cinematic Rise'] },
];

const WEBAUDIO_CATEGORIES = [
  { id: 'oscillators', label: 'Oscillator Types', samples: ['sine', 'square', 'sawtooth', 'triangle'] },
  { id: 'nodes', label: 'Audio Nodes', samples: ['GainNode', 'BiquadFilter', 'DelayNode', 'ConvolverNode', 'DynamicsCompressor', 'WaveShaper', 'StereoPanner', 'AnalyserNode', 'ChannelSplitter', 'ChannelMerger'] },
  { id: 'filter-types', label: 'Filter Types', samples: ['lowpass', 'highpass', 'bandpass', 'notch', 'allpass', 'lowshelf', 'highshelf', 'peaking'] },
  { id: 'params', label: 'AudioParam Methods', samples: ['setValueAtTime', 'linearRampToValueAtTime', 'exponentialRampToValueAtTime', 'setTargetAtTime', 'cancelScheduledValues'] },
  { id: 'songs-web', label: 'Full Songs', samples: ['Sine Melody', 'FM Synthesis', 'Drum Pattern', 'Ambient Drone', 'Glitch Beat'] },
];

export function SampleBrowser() {
  const [search, setSearch] = useState('');
  const [expandedCat, setExpandedCat] = useState<string | null>('drums');
  const inputRef = useRef<HTMLInputElement>(null);
  const activeEngine = useAppStore((s) => {
    const file = s.files.find(f => f.active);
    return file?.engine ?? 'strudel';
  });

  /* Pick categories based on active engine */
  const baseCats = activeEngine === 'tonejs' ? TONEJS_CATEGORIES
    : activeEngine === 'webaudio' ? WEBAUDIO_CATEGORIES
    : SAMPLE_CATEGORIES;

  const insertSample = useCallback((sample: string) => {
    /* Insert engine-appropriate sample code into the active file */
    const store = useAppStore.getState();
    const activeFile = store.files.find((f) => f.active);
    if (!activeFile) return;

    const engine = activeFile.engine;
    const code = activeFile.code;
    let insertion = '';

    /* Full song templates — replace entire code */
    const TONE_SONGS: Record<string, string> = {
      'Trance Arp': `const synth = new Tone.PolySynth(Tone.Synth, {
  oscillator: { type: "fatsawtooth", count: 3, spread: 30 },
  envelope: { attack: 0.01, decay: 0.3, sustain: 0.2, release: 0.8 }
}).toDestination();
const filter = new Tone.AutoFilter("8n").toDestination().start();
synth.connect(filter);
const reverb = new Tone.Reverb(2).toDestination();
synth.connect(reverb);

const notes = [["E4","G4","B4"],["D4","F#4","A4"],["C4","E4","G4"],["B3","D4","F#4"]];
const seq = new Tone.Sequence((time, chord) => {
  synth.triggerAttackRelease(chord, "8n", time);
}, notes, "4n").start(0);

const kick = new Tone.MembraneSynth().toDestination();
new Tone.Loop(time => kick.triggerAttackRelease("C1","8n",time), "4n").start(0);

Tone.getTransport().bpm.value = 138;
Tone.getTransport().start();`,
      'Ambient Pad': `const synth = new Tone.PolySynth(Tone.FMSynth, {
  harmonicity: 3, modulationIndex: 10,
  envelope: { attack: 2, decay: 1, sustain: 0.8, release: 4 }
}).toDestination();
const reverb = new Tone.Reverb(5).toDestination();
const delay = new Tone.FeedbackDelay("8n", 0.4).toDestination();
synth.connect(reverb);
synth.connect(delay);

const chords = [["C3","E3","G3","B3"],["A2","C3","E3","G3"],["F2","A2","C3","E3"],["G2","B2","D3","F3"]];
let i = 0;
new Tone.Loop(time => {
  synth.triggerAttackRelease(chords[i % chords.length], "2n", time);
  i++;
}, "1m").start(0);

Tone.getTransport().bpm.value = 72;
Tone.getTransport().start();`,
      'Drum Machine': `const kick = new Tone.MembraneSynth({ pitchDecay: 0.05, octaves: 6 }).toDestination();
const snare = new Tone.NoiseSynth({ noise: { type: "white" }, envelope: { decay: 0.15 } }).toDestination();
const hat = new Tone.MetalSynth({ frequency: 400, envelope: { decay: 0.05 }, harmonicity: 5.1, resonance: 4000 }).toDestination();
hat.volume.value = -10;

new Tone.Sequence((time, v) => { if(v) kick.triggerAttackRelease("C1","8n",time); },
  [1,0,0,0,1,0,0,0,1,0,0,0,1,0,0,0], "16n").start(0);
new Tone.Sequence((time, v) => { if(v) snare.triggerAttackRelease("8n",time); },
  [0,0,0,0,1,0,0,0,0,0,0,0,1,0,0,0], "16n").start(0);
new Tone.Sequence((time, v) => { if(v) hat.triggerAttackRelease("32n",time); },
  [1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1], "16n").start(0);

Tone.getTransport().bpm.value = 126;
Tone.getTransport().start();`,
      'Bass Sequence': `const bass = new Tone.MonoSynth({
  oscillator: { type: "square" },
  filter: { Q: 6, type: "lowpass", rolloff: -24 },
  envelope: { attack: 0.01, decay: 0.2, sustain: 0.4, release: 0.3 },
  filterEnvelope: { attack: 0.05, decay: 0.2, sustain: 0.3, release: 0.5, baseFrequency: 200, octaves: 2 }
}).toDestination();
const dist = new Tone.Distortion(0.4).toDestination();
bass.connect(dist);

const notes = ["C2","C2","Eb2","F2","F2","Ab2","Bb2","G2"];
new Tone.Sequence((time, note) => {
  bass.triggerAttackRelease(note, "8n", time);
}, notes, "8n").start(0);

Tone.getTransport().bpm.value = 140;
Tone.getTransport().start();`,
      'Chiptune Melody': `const synth = new Tone.Synth({
  oscillator: { type: "pulse", width: 0.3 },
  envelope: { attack: 0.01, decay: 0.1, sustain: 0.3, release: 0.1 }
}).toDestination();
const melody = ["E5","D5","C5","D5","E5","E5","E5","D5","D5","D5","E5","G5","G5",
  "E5","D5","C5","D5","E5","E5","E5","E5","D5","D5","E5","D5","C5"];
new Tone.Sequence((time, note) => {
  synth.triggerAttackRelease(note, "8n", time);
}, melody, "4n").start(0);

Tone.getTransport().bpm.value = 160;
Tone.getTransport().start();`,
      'Jazz Chords': `const piano = new Tone.PolySynth(Tone.Synth, {
  oscillator: { type: "triangle" },
  envelope: { attack: 0.02, decay: 0.5, sustain: 0.3, release: 1.5 }
}).toDestination();
const reverb = new Tone.Reverb(3).toDestination();
piano.connect(reverb);

const chords = [["Dm7","D3","F3","A3","C4"],["G7","G2","B2","D3","F3"],
  ["Cmaj7","C3","E3","G3","B3"],["Am7","A2","C3","E3","G3"]];
let i = 0;
new Tone.Loop(time => {
  piano.triggerAttackRelease(chords[i % chords.length].slice(1), "2n", time, 0.5);
  i++;
}, "2n").start(0);

Tone.getTransport().bpm.value = 100;
Tone.getTransport().start();`,
      'Cinematic Rise': `const synth = new Tone.FMSynth({
  harmonicity: 8, modulationIndex: 20,
  envelope: { attack: 4, decay: 0.5, sustain: 1, release: 2 }
}).toDestination();
const reverb = new Tone.Reverb(6).toDestination();
const delay = new Tone.PingPongDelay("8n", 0.3).toDestination();
synth.connect(reverb);
synth.connect(delay);

synth.triggerAttackRelease("C2", 6);
synth.frequency.rampTo("C5", 5);`,
    };

    const WEB_SONGS: Record<string, string> = {
      'Sine Melody': `const notes = [261.63,293.66,329.63,349.23,392.00,440.00,493.88,523.25];
notes.forEach((freq, i) => {
  const osc = ctx.createOscillator();
  const gain = ctx.createGain();
  osc.type = "sine";
  osc.frequency.value = freq;
  gain.gain.setValueAtTime(0.2, ctx.currentTime + i * 0.3);
  gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + i * 0.3 + 0.25);
  osc.connect(gain).connect(ctx.destination);
  osc.start(ctx.currentTime + i * 0.3);
  osc.stop(ctx.currentTime + i * 0.3 + 0.3);
});`,
      'FM Synthesis': `const carrier = ctx.createOscillator();
const modulator = ctx.createOscillator();
const modGain = ctx.createGain();
const masterGain = ctx.createGain();
carrier.frequency.value = 440;
modulator.frequency.value = 880;
modGain.gain.value = 200;
masterGain.gain.value = 0.3;
modulator.connect(modGain).connect(carrier.frequency);
carrier.connect(masterGain).connect(ctx.destination);
modulator.start();
carrier.start();
modGain.gain.linearRampToValueAtTime(0, ctx.currentTime + 3);
masterGain.gain.linearRampToValueAtTime(0, ctx.currentTime + 3);`,
      'Drum Pattern': `function kick(time) {
  const osc = ctx.createOscillator();
  const gain = ctx.createGain();
  osc.frequency.setValueAtTime(150, time);
  osc.frequency.exponentialRampToValueAtTime(0.01, time + 0.5);
  gain.gain.setValueAtTime(1, time);
  gain.gain.exponentialRampToValueAtTime(0.01, time + 0.5);
  osc.connect(gain).connect(ctx.destination);
  osc.start(time); osc.stop(time + 0.5);
}
function hat(time) {
  const buf = ctx.createBuffer(1, ctx.sampleRate * 0.05, ctx.sampleRate);
  const data = buf.getChannelData(0);
  for (let i = 0; i < data.length; i++) data[i] = Math.random() * 2 - 1;
  const src = ctx.createBufferSource();
  const gain = ctx.createGain();
  src.buffer = buf;
  gain.gain.setValueAtTime(0.3, time);
  gain.gain.exponentialRampToValueAtTime(0.01, time + 0.05);
  src.connect(gain).connect(ctx.destination);
  src.start(time);
}
for (let i = 0; i < 16; i++) {
  const t = ctx.currentTime + i * 0.25;
  if (i % 4 === 0) kick(t);
  hat(t);
}`,
      'Ambient Drone': `const oscs = [110, 165, 220, 330].map(freq => {
  const osc = ctx.createOscillator();
  const gain = ctx.createGain();
  osc.type = "sine";
  osc.frequency.value = freq;
  gain.gain.value = 0;
  gain.gain.linearRampToValueAtTime(0.08, ctx.currentTime + 3);
  osc.connect(gain).connect(ctx.destination);
  osc.start();
  return { osc, gain };
});
// Slow detune for movement
oscs.forEach((o, i) => {
  o.osc.detune.setValueAtTime(0, ctx.currentTime);
  o.osc.detune.linearRampToValueAtTime(i * 5, ctx.currentTime + 6);
});`,
      'Glitch Beat': `for (let i = 0; i < 32; i++) {
  const t = ctx.currentTime + i * 0.125;
  const osc = ctx.createOscillator();
  const gain = ctx.createGain();
  osc.type = ["sine","square","sawtooth","triangle"][Math.floor(Math.random()*4)];
  osc.frequency.value = 100 + Math.random() * 800;
  gain.gain.setValueAtTime(Math.random() * 0.3, t);
  gain.gain.exponentialRampToValueAtTime(0.01, t + 0.05 + Math.random() * 0.1);
  osc.connect(gain).connect(ctx.destination);
  osc.start(t); osc.stop(t + 0.15);
}`,
    };

    /* Generate code per engine */
    switch (engine) {
      case 'strudel': {
        /* Oscillator types need note().s(), not standalone s() */
        const oscTypes = ['sawtooth','sine','square','triangle','supersquare','supersaw','fatsawtooth','fatsquare','fattriangle','fatsine'];
        if (oscTypes.includes(sample)) {
          insertion = code.trim() ? `\nnote("c3 e3 g3 b3").s("${sample}")` : `note("c3 e3 g3 b3").s("${sample}")`;
        } else {
          insertion = code.trim() ? `\ns("${sample}")` : `s("${sample}")`;
        }
        break;
      }
      case 'tonejs':
        /* Full songs — replace entire code */
        if (TONE_SONGS[sample]) {
          store.updateFileCode(activeFile.id, TONE_SONGS[sample]);
          return;
        }
        if (['sine','square','sawtooth','triangle','fatsine','fatsquare','fatsawtooth','fattriangle','pulse','pwm'].includes(sample)) {
          insertion = `\nconst synth = new Tone.Synth({oscillator:{type:"${sample}"}}).toDestination();\nsynth.triggerAttackRelease("C4", "8n");`;
        } else if (sample.endsWith('Synth')) {
          insertion = `\nconst synth = new Tone.${sample}().toDestination();\nsynth.triggerAttackRelease("C4", "8n");`;
        } else if (['Reverb','FeedbackDelay','PingPongDelay','Chorus','Distortion','Phaser','Tremolo','Vibrato','AutoFilter','AutoPanner','AutoWah','BitCrusher','Chebyshev','Compressor','EQ3','Freeverb','JCReverb','Limiter','PitchShift','StereoWidener'].includes(sample)) {
          insertion = `\nconst effect = new Tone.${sample}().toDestination();\nconst synth = new Tone.Synth().connect(effect);\nsynth.triggerAttackRelease("C4", "8n");`;
        } else if (sample === 'Noise') {
          insertion = `\nconst noise = new Tone.Noise("white").toDestination();\nnoise.start();\nsetTimeout(() => noise.stop(), 1000);`;
        } else if (['Sequence','Loop','Part','Pattern','Transport'].includes(sample)) {
          insertion = `\n// Tone.${sample} — see Full Songs category for examples`;
        } else if (['Analyser','Meter','FFT','Waveform','DCMeter','Follower'].includes(sample)) {
          insertion = `\nconst ${sample.toLowerCase()} = new Tone.${sample}();\n// Connect a source: source.connect(${sample.toLowerCase()});`;
        } else {
          insertion = `\nconst synth = new Tone.Synth().toDestination();\nsynth.triggerAttackRelease("C4", "8n");`;
        }
        break;
      case 'webaudio':
        /* Full songs — replace entire code */
        if (WEB_SONGS[sample]) {
          store.updateFileCode(activeFile.id, WEB_SONGS[sample]);
          return;
        }
        if (['sine','square','sawtooth','triangle'].includes(sample)) {
          insertion = `\nconst osc = ctx.createOscillator();\nosc.type = "${sample}";\nosc.frequency.value = 440;\nconst gain = ctx.createGain();\ngain.gain.value = 0.3;\nosc.connect(gain).connect(ctx.destination);\nosc.start();`;
        } else if (['lowpass','highpass','bandpass','notch','allpass','lowshelf','highshelf','peaking'].includes(sample)) {
          insertion = `\nconst filter = ctx.createBiquadFilter();\nfilter.type = "${sample}";\nfilter.frequency.value = 1000;\nfilter.connect(ctx.destination);`;
        } else if (['setValueAtTime','linearRampToValueAtTime','exponentialRampToValueAtTime','setTargetAtTime','cancelScheduledValues'].includes(sample)) {
          insertion = `\n// gain.gain.${sample}(value, time);`;
        } else if (sample === 'GainNode') {
          insertion = `\nconst gain = ctx.createGain();\ngain.gain.value = 0.5;\ngain.connect(ctx.destination);`;
        } else if (sample === 'BiquadFilter') {
          insertion = `\nconst filter = ctx.createBiquadFilter();\nfilter.type = "lowpass";\nfilter.frequency.value = 800;\nfilter.connect(ctx.destination);`;
        } else {
          insertion = `\n// ${sample}\nconst node = ctx.create${sample.replace('Node', '')}();\nnode.connect(ctx.destination);`;
        }
        break;
      default:
        insertion = `\n// ${sample}`;
    }

    store.updateFileCode(activeFile.id, code + insertion);
  }, []);

  const filtered = search.trim()
    ? baseCats.map((cat) => ({
        ...cat,
        samples: cat.samples.filter((s) => s.toLowerCase().includes(search.toLowerCase())),
      })).filter((cat) => cat.samples.length > 0)
    : baseCats;

  return (
    <div style={{ padding: 'var(--space-2)' }}>
      {/* Search */}
      <div className="relative" style={{ marginBottom: 'var(--space-2)' }}>
        <Search size={12} style={{ position: 'absolute', left: '10px', top: '50%', transform: 'translateY(-50%)', color: 'var(--color-text-muted)', pointerEvents: 'none' }} />
        <input
          ref={inputRef}
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search samples..."
          aria-label={t('sidePanel.searchSamples')}
          style={{
            width: '100%',
            padding: 'var(--space-2) var(--space-3) var(--space-2) 30px',
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
            <span style={{ color: 'var(--color-text-muted)', marginLeft: 'auto', fontSize: 'var(--font-size-2xs)' }}>
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
                  title={`Insert ${sample}`}
                  style={{
                    padding: 'var(--space-1) var(--space-2)',
                    backgroundColor: 'var(--color-bg-elevated)',
                    color: 'var(--color-text-secondary)',
                    border: '1px solid var(--color-border)',
                    borderRadius: 'var(--radius-sm)',
                    cursor: 'pointer',
                    fontSize: 'var(--font-size-ui)',
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

      {/* Sample import drop zone — drag audio files to add custom samples */}
      <div style={{ padding: 'var(--space-2) 0' }}>
        <SampleDropZone onImport={(names) => console.log('[SampleBrowser] Imported:', names)} />
      </div>
    </div>
  );
}

/* ══════════════════════════════════════════════════════════
   REFERENCE PANEL — searchable API docs inline
   ══════════════════════════════════════════════════════════ */

/* Engine-specific API references */
const STRUDEL_REFERENCE = [
  { title: 'Sounds & Synths', items: [
    { fn: 's("name")', desc: 'Select sound/sample' },
    { fn: 'note("c3 e3 g3")', desc: 'Play pitched notes' },
    { fn: '.s("sine")', desc: 'Sine wave — pure, clean' },
    { fn: '.s("sawtooth")', desc: 'Sawtooth — rich harmonics, buzzy' },
    { fn: '.s("square")', desc: 'Square — hollow, retro, 8-bit' },
    { fn: '.s("triangle")', desc: 'Triangle — soft, muted' },
    { fn: '.s("superpiano")', desc: 'Piano sample sound' },
    { fn: 'samples("url")', desc: 'Load sample pack' },
  ]},
  { title: 'Envelope & Filter', items: [
    { fn: '.attack(0.1)', desc: 'Attack time (seconds)' },
    { fn: '.release(0.5)', desc: 'Release time (seconds)' },
    { fn: '.lpf(800)', desc: 'Low-pass filter Hz' },
    { fn: '.hpf(200)', desc: 'High-pass filter Hz' },
    { fn: '.lpenv(4)', desc: 'Filter envelope depth' },
    { fn: '.resonance(10)', desc: 'Filter resonance (Q)' },
  ]},
  { title: 'Pattern', items: [
    { fn: 'stack(a, b)', desc: 'Layer patterns' },
    { fn: 'cat(a, b)', desc: 'Concatenate patterns' },
    { fn: '.fast(2)', desc: 'Speed up N times' },
    { fn: '.slow(2)', desc: 'Slow down N times' },
    { fn: '.rev()', desc: 'Reverse pattern' },
    { fn: '.every(4, fn)', desc: 'Apply every N cycles' },
    { fn: '.sometimes(fn)', desc: '50% random apply' },
    { fn: '.off(t, fn)', desc: 'Offset layer' },
    { fn: '.jux(fn)', desc: 'Stereo split' },
    { fn: '.euclid(k, n)', desc: 'Euclidean rhythm' },
  ]},
  { title: 'Effects', items: [
    { fn: '.gain(0.8)', desc: 'Volume (0-1)' },
    { fn: '.lpf(800)', desc: 'Low-pass filter Hz' },
    { fn: '.hpf(200)', desc: 'High-pass filter Hz' },
    { fn: '.delay(0.5)', desc: 'Delay amount' },
    { fn: '.room(0.5)', desc: 'Reverb amount' },
    { fn: '.pan(0.5)', desc: 'Stereo position' },
    { fn: '.crush(4)', desc: 'Bit crush' },
    { fn: '.vowel("a")', desc: 'Formant filter' },
  ]},
  { title: 'Controls', items: [
    { fn: 'slider(v, min, max, step)', desc: 'Inline slider widget (drag to adjust)' },
    { fn: 'mouseX', desc: 'Mouse X position (0-1)' },
    { fn: 'mouseY', desc: 'Mouse Y position (0-1)' },
    { fn: '.range(lo, hi)', desc: 'Map value range' },
    { fn: 'createParams("name", 0)', desc: 'Custom named parameter' },
    { fn: 'getParam("name")', desc: 'Read parameter value' },
    { fn: 'setParam("name", v)', desc: 'Set parameter value' },
    { fn: 'onKey("a", () => ...)', desc: 'Bind keyboard shortcut' },
  ]},
  { title: 'Visualizers', items: [
    { fn: '._pianoroll()', desc: 'Inline piano roll (before transforms)' },
    { fn: '._punchcard()', desc: 'Inline punchcard (after transforms)' },
    { fn: '._scope()', desc: 'Inline oscilloscope' },
    { fn: '._spectrum()', desc: 'Inline spectrum analyzer' },
    { fn: '._spiral()', desc: 'Inline spiral visualization' },
    { fn: '._pitchwheel()', desc: 'Inline pitch wheel (12-tone circle)' },
    { fn: '.pianoroll()', desc: 'Background piano roll' },
    { fn: '.scope()', desc: 'Background oscilloscope' },
  ]},
  { title: 'MIDI Input/Output', items: [
    { fn: 'await midikeys(0)', desc: 'MIDI keyboard notes (any device)' },
    { fn: 'await midikeys("MPK mini 3")', desc: 'MIDI notes from specific device' },
    { fn: 'kb().s("sine")', desc: 'Play keys through a synth' },
    { fn: 'await midin(0)', desc: 'MIDI CC knobs/sliders (any device)' },
    { fn: 'cc(70).range(200, 5000)', desc: 'Map CC knob to value range' },
    { fn: '.midi()', desc: 'Send MIDI output to device' },
    { fn: 'gamepad(0)', desc: 'Gamepad analog stick values' },
  ]},
  { title: 'Mini-Notation', items: [
    { fn: '"a b c d"', desc: 'Sequence events' },
    { fn: '"[a b] c"', desc: 'Subdivide group' },
    { fn: '"<a b>"', desc: 'Alternate per cycle' },
    { fn: '"a ~ b"', desc: 'Rest / silence' },
    { fn: '"a*4"', desc: 'Repeat N times' },
    { fn: '"a(3,8)"', desc: 'Euclidean rhythm' },
  ]},
];

const TONEJS_REFERENCE = [
  { title: 'Synths', items: [
    { fn: 'new Tone.Synth()', desc: 'Basic synth' },
    { fn: 'new Tone.FMSynth()', desc: 'FM synthesis' },
    { fn: 'new Tone.AMSynth()', desc: 'AM synthesis' },
    { fn: 'new Tone.MonoSynth()', desc: 'Mono synth with filter' },
    { fn: 'new Tone.PolySynth()', desc: 'Polyphonic synth' },
    { fn: 'new Tone.MembraneSynth()', desc: 'Drum membrane' },
    { fn: 'new Tone.PluckSynth()', desc: 'Plucked string' },
  ]},
  { title: 'Playback', items: [
    { fn: '.toDestination()', desc: 'Connect to speakers' },
    { fn: '.triggerAttackRelease("C4","8n")', desc: 'Play a note' },
    { fn: '.triggerAttack("C4")', desc: 'Start note' },
    { fn: '.triggerRelease()', desc: 'Stop note' },
    { fn: '.connect(effect)', desc: 'Chain to effect' },
  ]},
  { title: 'Effects', items: [
    { fn: 'new Tone.Reverb()', desc: 'Reverb' },
    { fn: 'new Tone.Delay()', desc: 'Delay' },
    { fn: 'new Tone.Chorus()', desc: 'Chorus' },
    { fn: 'new Tone.Distortion()', desc: 'Distortion' },
    { fn: 'new Tone.AutoFilter()', desc: 'Auto filter LFO' },
    { fn: 'new Tone.Phaser()', desc: 'Phaser' },
  ]},
  { title: 'Scheduling', items: [
    { fn: 'new Tone.Sequence(cb, notes, "4n")', desc: 'Step sequencer' },
    { fn: 'new Tone.Loop(cb, "4n")', desc: 'Repeating callback' },
    { fn: 'new Tone.Part(cb, events)', desc: 'Scheduled events' },
    { fn: 'Tone.getTransport().start()', desc: 'Start transport' },
    { fn: 'Tone.getTransport().stop()', desc: 'Stop transport' },
    { fn: 'Tone.getTransport().bpm.value = 120', desc: 'Set BPM' },
  ]},
  { title: 'Sources', items: [
    { fn: 'new Tone.Player(url)', desc: 'Audio file player' },
    { fn: 'new Tone.Noise("white")', desc: 'Noise generator' },
    { fn: 'new Tone.Oscillator(440)', desc: 'Oscillator' },
  ]},
];

const WEBAUDIO_REFERENCE = [
  { title: 'Context', items: [
    { fn: 'ctx', desc: 'AudioContext (provided)' },
    { fn: 'ctx.currentTime', desc: 'Current time in seconds' },
    { fn: 'ctx.sampleRate', desc: 'Sample rate (Hz)' },
    { fn: 'ctx.destination', desc: 'Output (→ masterGain)' },
  ]},
  { title: 'Sources', items: [
    { fn: 'ctx.createOscillator()', desc: 'Create oscillator' },
    { fn: 'ctx.createBufferSource()', desc: 'Play audio buffer' },
    { fn: 'ctx.createConstantSource()', desc: 'DC offset source' },
    { fn: 'osc.type = "sine"', desc: 'sine/square/sawtooth/triangle' },
    { fn: 'osc.frequency.value = 440', desc: 'Set frequency Hz' },
    { fn: 'osc.start(time)', desc: 'Start at time' },
    { fn: 'osc.stop(time)', desc: 'Stop at time' },
  ]},
  { title: 'Processing', items: [
    { fn: 'ctx.createGain()', desc: 'Volume control' },
    { fn: 'ctx.createBiquadFilter()', desc: 'Filter node' },
    { fn: 'ctx.createDelay()', desc: 'Delay line' },
    { fn: 'ctx.createConvolver()', desc: 'Convolution reverb' },
    { fn: 'ctx.createDynamicsCompressor()', desc: 'Compressor' },
    { fn: 'ctx.createStereoPanner()', desc: 'Pan L/R' },
    { fn: 'ctx.createWaveShaper()', desc: 'Distortion' },
  ]},
  { title: 'Connections', items: [
    { fn: 'node.connect(dest)', desc: 'Connect nodes' },
    { fn: 'node.disconnect()', desc: 'Disconnect all' },
    { fn: 'gain.gain.setValueAtTime(v, t)', desc: 'Set at time' },
    { fn: 'gain.gain.linearRampToValueAtTime(v, t)', desc: 'Linear ramp' },
    { fn: 'gain.gain.exponentialRampToValueAtTime(v, t)', desc: 'Exp ramp' },
  ]},
];

const REFERENCE_BY_ENGINE: Record<string, typeof STRUDEL_REFERENCE> = {
  strudel: STRUDEL_REFERENCE,
  tonejs: TONEJS_REFERENCE,
  webaudio: WEBAUDIO_REFERENCE,
  midi: [{ title: 'MIDI', items: [{ fn: 'MIDI output only', desc: 'Connect external device in Settings' }] }],
};

export function ReferencePanel() {
  const [search, setSearch] = useState('');
  const activeEngine = useAppStore((s) => {
    const file = s.files.find(f => f.active);
    return file?.engine ?? 'strudel';
  });
  const sections = REFERENCE_BY_ENGINE[activeEngine] || STRUDEL_REFERENCE;

  const filtered = search.trim()
    ? sections.map((sec) => ({
        ...sec,
        items: sec.items.filter(
          (i) => i.fn.toLowerCase().includes(search.toLowerCase()) || i.desc.toLowerCase().includes(search.toLowerCase())
        ),
      })).filter((sec) => sec.items.length > 0)
    : sections;

  return (
    <div style={{ padding: 'var(--space-2)' }}>
      <div className="relative" style={{ marginBottom: 'var(--space-2)' }}>
        <Search size={12} style={{ position: 'absolute', left: '10px', top: '50%', transform: 'translateY(-50%)', color: 'var(--color-text-muted)', pointerEvents: 'none' }} />
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search API..."
          aria-label={t('sidePanel.searchApi')}
          style={{
            width: '100%',
            padding: 'var(--space-2) var(--space-3) var(--space-2) 30px',
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
            fontSize: 'var(--font-size-2xs)',
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
                fontSize: 'var(--font-size-ui)',
                borderRadius: 'var(--radius-sm)',
              }}
            >
              <code style={{
                fontFamily: 'var(--font-family-mono)',
                color: 'var(--color-text)',
                fontSize: 'var(--font-size-ui)',
              }}>
                {item.fn}
              </code>
              <span style={{ color: 'var(--color-text-muted)', fontSize: 'var(--font-size-2xs)', textAlign: 'right', marginLeft: 'var(--space-2)' }}>
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

export function ConsolePanel() {
  const [, forceUpdate] = useState(0);
  const scrollRef = useRef<HTMLDivElement>(null);

  /* Install console monkey-patch on mount; restore originals on unmount.
   * Moved from module-level side effect so cleanup is possible and HMR stays clean. */
  useEffect(() => {
    if ((window as any).__lmcConsolePatched) return;
    (window as any).__lmcConsolePatched = true;

    const originalLog = console.log;
    const originalError = console.error;
    const originalWarn = console.warn;

    const push = (type: 'log' | 'error' | 'warn', args: unknown[]) => {
      const message = args.map((a) => (typeof a === 'object' ? JSON.stringify(a) : String(a))).join(' ');
      /* Filter out noisy Strudel/Vite messages */
      if (message.includes('[vite]') || message.includes('i18next') || message.includes('locize')) return;
      logBuffer.push({ type, message, time: Date.now() });
      if (logBuffer.length > MAX_LOG_ENTRIES) logBuffer = logBuffer.slice(-MAX_LOG_ENTRIES);
      logListeners.forEach((l) => l());
    };

    console.log = (...args: unknown[]) => { originalLog(...args); push('log', args); };
    console.error = (...args: unknown[]) => { originalError(...args); push('error', args); };
    console.warn = (...args: unknown[]) => { originalWarn(...args); push('warn', args); };

    return () => {
      /* Restore original console methods and clear the patched flag */
      console.log = originalLog;
      console.warn = originalWarn;
      console.error = originalError;
      (window as any).__lmcConsolePatched = false;
    };
  }, []);

  useEffect(() => {
    const listener = () => forceUpdate((n) => n + 1);
    logListeners.push(listener);
    return () => { logListeners = logListeners.filter((l) => l !== listener); };
  }, []);

  /* Auto-scroll to bottom — only fires when new log entries arrive */
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [logBuffer.length]);

  const typeColors: Record<string, string> = {
    log: 'var(--color-text-secondary)',
    error: 'var(--color-error)',
    warn: 'var(--color-warning)',
    info: 'var(--color-primary)',
  };

  return (
    <div ref={scrollRef} className="h-full overflow-y-auto" style={{ padding: 'var(--space-2)', fontFamily: 'var(--font-family-mono)', fontSize: 'var(--font-size-ui)' }}>
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

export function SettingsPanel() {
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
    fontSize: 'var(--font-size-ui)',
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
        style={{ fontSize: 'var(--font-size-xs)', color: 'var(--color-text)' }}
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
          style={{ fontSize: 'var(--font-size-xs)', color: 'var(--color-text)' }}
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
