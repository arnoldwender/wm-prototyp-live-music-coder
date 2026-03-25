/* Autocomplete completions for each audio engine.
 * Descriptions are i18n-ready — keyed by function name.
 * CM6 autocompletion triggers on typing or Ctrl+Space. */

import { autocompletion, type CompletionContext, type CompletionResult } from '@codemirror/autocomplete';
import type { Extension } from '@codemirror/state';
import type { EngineType } from '../../types/engine';
import i18n from '../../i18n';

interface CompletionItem {
  label: string;
  type: 'function' | 'keyword' | 'property';
  detail: string;
  info?: string;
  apply?: string;
}

/* Strudel pattern functions */
const STRUDEL_COMPLETIONS: CompletionItem[] = [
  { label: 'note', type: 'function', detail: 'completions.strudel.note', apply: 'note("")' },
  { label: 's', type: 'function', detail: 'completions.strudel.s', apply: 's("")' },
  { label: 'sound', type: 'function', detail: 'completions.strudel.sound', apply: 'sound("")' },
  { label: 'stack', type: 'function', detail: 'completions.strudel.stack', apply: 'stack()' },
  { label: 'cat', type: 'function', detail: 'completions.strudel.cat', apply: 'cat()' },
  { label: 'seq', type: 'function', detail: 'completions.strudel.seq', apply: 'seq()' },
  { label: 'lpf', type: 'function', detail: 'completions.strudel.lpf', apply: '.lpf(800)' },
  { label: 'hpf', type: 'function', detail: 'completions.strudel.hpf', apply: '.hpf(200)' },
  { label: 'gain', type: 'function', detail: 'completions.strudel.gain', apply: '.gain(0.8)' },
  { label: 'speed', type: 'function', detail: 'completions.strudel.speed', apply: '.speed(1)' },
  { label: 'delay', type: 'function', detail: 'completions.strudel.delay', apply: '.delay(0.5)' },
  { label: 'room', type: 'function', detail: 'completions.strudel.room', apply: '.room(0.5)' },
  { label: 'pan', type: 'function', detail: 'completions.strudel.pan', apply: '.pan(0.5)' },
  { label: 'rev', type: 'function', detail: 'completions.strudel.rev', apply: '.rev()' },
  { label: 'jux', type: 'function', detail: 'completions.strudel.jux', apply: '.jux(rev)' },
  { label: 'every', type: 'function', detail: 'completions.strudel.every', apply: '.every(4, x => x.rev())' },
  { label: 'sometimes', type: 'function', detail: 'completions.strudel.sometimes', apply: '.sometimes(x => x.delay(0.5))' },
  { label: 'fast', type: 'function', detail: 'completions.strudel.fast', apply: '.fast(2)' },
  { label: 'slow', type: 'function', detail: 'completions.strudel.slow', apply: '.slow(2)' },
  { label: 'dec', type: 'function', detail: 'completions.strudel.dec', apply: '.dec(0.2)' },
  { label: 'sustain', type: 'function', detail: 'completions.strudel.sustain', apply: '.sustain(0.5)' },
  /* Common samples */
  { label: 'bd', type: 'keyword', detail: 'completions.strudel.bd' },
  { label: 'sd', type: 'keyword', detail: 'completions.strudel.sd' },
  { label: 'hh', type: 'keyword', detail: 'completions.strudel.hh' },
  { label: 'oh', type: 'keyword', detail: 'completions.strudel.oh' },
  { label: 'cp', type: 'keyword', detail: 'completions.strudel.cp' },
  /* Synth types */
  { label: 'sawtooth', type: 'keyword', detail: 'completions.strudel.sawtooth' },
  { label: 'sine', type: 'keyword', detail: 'completions.strudel.sine' },
  { label: 'square', type: 'keyword', detail: 'completions.strudel.square' },
  { label: 'triangle', type: 'keyword', detail: 'completions.strudel.triangle' },
  /* Numeric sample packs */
  { label: '808', type: 'keyword', detail: 'completions.strudel.s808' },
  { label: '909', type: 'keyword', detail: 'completions.strudel.s909' },
];

/* Tone.js completions */
const TONEJS_COMPLETIONS: CompletionItem[] = [
  { label: 'Tone.Synth', type: 'function', detail: 'completions.tonejs.synth', apply: 'new Tone.Synth()' },
  { label: 'Tone.FMSynth', type: 'function', detail: 'completions.tonejs.fmsynth', apply: 'new Tone.FMSynth()' },
  { label: 'Tone.AMSynth', type: 'function', detail: 'completions.tonejs.amsynth', apply: 'new Tone.AMSynth()' },
  { label: 'Tone.PolySynth', type: 'function', detail: 'completions.tonejs.polysynth', apply: 'new Tone.PolySynth(Tone.Synth)' },
  { label: 'Tone.MembraneSynth', type: 'function', detail: 'completions.tonejs.membrane', apply: 'new Tone.MembraneSynth()' },
  { label: 'Tone.MetalSynth', type: 'function', detail: 'completions.tonejs.metal', apply: 'new Tone.MetalSynth()' },
  { label: 'Tone.PluckSynth', type: 'function', detail: 'completions.tonejs.pluck', apply: 'new Tone.PluckSynth()' },
  { label: 'Tone.Reverb', type: 'function', detail: 'completions.tonejs.reverb', apply: 'new Tone.Reverb(2)' },
  { label: 'Tone.Delay', type: 'function', detail: 'completions.tonejs.delay', apply: 'new Tone.FeedbackDelay("8n", 0.5)' },
  { label: 'Tone.Chorus', type: 'function', detail: 'completions.tonejs.chorus', apply: 'new Tone.Chorus(4, 2.5, 0.5)' },
  { label: 'Tone.Distortion', type: 'function', detail: 'completions.tonejs.distortion', apply: 'new Tone.Distortion(0.4)' },
  { label: 'Tone.Loop', type: 'function', detail: 'completions.tonejs.loop', apply: 'new Tone.Loop((time) => {\n  \n}, "4n")' },
  { label: 'toDestination', type: 'function', detail: 'completions.tonejs.todest', apply: '.toDestination()' },
  { label: 'triggerAttackRelease', type: 'function', detail: 'completions.tonejs.trigger', apply: '.triggerAttackRelease("C4", "8n")' },
  { label: 'chain', type: 'function', detail: 'completions.tonejs.chain', apply: '.chain()' },
  { label: 'getTransport', type: 'function', detail: 'completions.tonejs.transport', apply: 'Tone.getTransport()' },
];

/* Web Audio API completions */
const WEBAUDIO_COMPLETIONS: CompletionItem[] = [
  { label: 'createOscillator', type: 'function', detail: 'completions.webaudio.osc', apply: 'ctx.createOscillator()' },
  { label: 'createGain', type: 'function', detail: 'completions.webaudio.gain', apply: 'ctx.createGain()' },
  { label: 'createBiquadFilter', type: 'function', detail: 'completions.webaudio.filter', apply: 'ctx.createBiquadFilter()' },
  { label: 'createDelay', type: 'function', detail: 'completions.webaudio.delay', apply: 'ctx.createDelay()' },
  { label: 'createDynamicsCompressor', type: 'function', detail: 'completions.webaudio.compressor', apply: 'ctx.createDynamicsCompressor()' },
  { label: 'createConvolver', type: 'function', detail: 'completions.webaudio.convolver', apply: 'ctx.createConvolver()' },
  { label: 'createWaveShaper', type: 'function', detail: 'completions.webaudio.waveshaper', apply: 'ctx.createWaveShaper()' },
  { label: 'connect', type: 'function', detail: 'completions.webaudio.connect', apply: '.connect()' },
  { label: 'masterGain', type: 'property', detail: 'completions.webaudio.mastergain' },
];

const COMPLETION_MAP: Record<EngineType, CompletionItem[]> = {
  strudel: STRUDEL_COMPLETIONS,
  tonejs: TONEJS_COMPLETIONS,
  webaudio: WEBAUDIO_COMPLETIONS,
  midi: [],
};

/** Resolve the i18n description — falls back to the key itself */
function getDescription(key: string): string {
  const translated = i18n.t(key);
  return translated !== key ? translated : key.split('.').pop() ?? key;
}

/** Create a CM6 autocompletion source for the given engine */
function engineCompletionSource(engine: EngineType) {
  const items = COMPLETION_MAP[engine];
  return (context: CompletionContext): CompletionResult | null => {
    const word = context.matchBefore(/[\w.]+/);
    if (!word && !context.explicit) return null;

    return {
      from: word?.from ?? context.pos,
      options: items.map((item) => ({
        label: item.label,
        type: item.type,
        detail: getDescription(item.detail),
        apply: item.apply,
        boost: item.type === 'function' ? 1 : 0,
      })),
    };
  };
}

/** Get the autocompletion extension for an engine */
export function getEngineCompletions(engine: EngineType): Extension {
  return autocompletion({
    override: [engineCompletionSource(engine)],
    activateOnTyping: true,
  });
}
