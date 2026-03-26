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
  /* ── Interactive controls ────────────────────────────── */
  { label: 'slider', type: 'function', detail: 'Interactive slider widget (drag to adjust)', apply: 'slider(0.5, 0, 1, 0.01)' },
  { label: 'mouseX', type: 'property', detail: 'Mouse X position (0-1)', apply: 'mouseX' },
  { label: 'mouseY', type: 'property', detail: 'Mouse Y position (0-1)', apply: 'mouseY' },
  { label: 'range', type: 'function', detail: 'Map value to range', apply: '.range(0, 1)' },
  /* ── Advanced pattern transforms ────────────────────── */
  { label: 'mask', type: 'function', detail: 'Silence events not matching mask', apply: '.mask("")' },
  { label: 'struct', type: 'function', detail: 'Apply rhythmic structure', apply: '.struct("")' },
  { label: 'euclid', type: 'function', detail: 'Euclidean rhythm (pulses, steps)', apply: '.euclid(3, 8)' },
  { label: 'chop', type: 'function', detail: 'Cut sample into N pieces', apply: '.chop(4)' },
  { label: 'striate', type: 'function', detail: 'Layer sample slices', apply: '.striate(4)' },
  { label: 'loopAt', type: 'function', detail: 'Loop sample to fit N cycles', apply: '.loopAt(1)' },
  { label: 'ply', type: 'function', detail: 'Repeat each event N times', apply: '.ply(2)' },
  { label: 'off', type: 'function', detail: 'Layer with offset copy', apply: '.off(0.125, x => x.note(12))' },
  { label: 'superimpose', type: 'function', detail: 'Layer with transformed copy', apply: '.superimpose(x => x.fast(2))' },
  { label: 'legato', type: 'function', detail: 'Relative note duration', apply: '.legato(0.5)' },
  { label: 'attack', type: 'function', detail: 'Envelope attack time', apply: '.attack(0.01)' },
  { label: 'release', type: 'function', detail: 'Envelope release time', apply: '.release(0.1)' },
  { label: 'crush', type: 'function', detail: 'Bit crush effect', apply: '.crush(4)' },
  { label: 'coarse', type: 'function', detail: 'Sample rate reduction', apply: '.coarse(8)' },
  { label: 'shape', type: 'function', detail: 'Waveshaper distortion', apply: '.shape(0.5)' },
  { label: 'vowel', type: 'function', detail: 'Formant filter (a, e, i, o, u)', apply: '.vowel("a")' },
  { label: 'pianoroll', type: 'function', detail: 'Visualize as piano roll', apply: '.pianoroll()' },
  { label: 'scope', type: 'function', detail: 'Visualize as oscilloscope', apply: '.scope()' },
  /* ── Tonal music theory ────────────────────────────── */
  { label: 'scale', type: 'function', detail: 'Map to musical scale', apply: '.scale("C:minor")' },
  { label: 'voicings', type: 'function', detail: 'Automatic chord voicings', apply: '.voicings("lefthand")' },
  { label: 'chord', type: 'function', detail: 'Play chord pattern', apply: 'chord("")' },
  { label: 'transpose', type: 'function', detail: 'Transpose by semitones', apply: '.transpose(7)' },
  /* ── All 218 Dirt-Samples ─────────────────────────────── */

  /* 808 / 909 kits */
  { label: '808', type: 'keyword', detail: 'completions.strudel.sample' },
  { label: '808bd', type: 'keyword', detail: 'completions.strudel.sample' },
  { label: '808cy', type: 'keyword', detail: 'completions.strudel.sample' },
  { label: '808hc', type: 'keyword', detail: 'completions.strudel.sample' },
  { label: '808ht', type: 'keyword', detail: 'completions.strudel.sample' },
  { label: '808lc', type: 'keyword', detail: 'completions.strudel.sample' },
  { label: '808lt', type: 'keyword', detail: 'completions.strudel.sample' },
  { label: '808mc', type: 'keyword', detail: 'completions.strudel.sample' },
  { label: '808mt', type: 'keyword', detail: 'completions.strudel.sample' },
  { label: '808oh', type: 'keyword', detail: 'completions.strudel.sample' },
  { label: '808sd', type: 'keyword', detail: 'completions.strudel.sample' },
  { label: '909', type: 'keyword', detail: 'completions.strudel.sample' },

  /* Kick drums */
  { label: 'bd', type: 'keyword', detail: 'completions.strudel.sample' },
  { label: 'clubkick', type: 'keyword', detail: 'completions.strudel.sample' },
  { label: 'hardkick', type: 'keyword', detail: 'completions.strudel.sample' },
  { label: 'kicklinn', type: 'keyword', detail: 'completions.strudel.sample' },
  { label: 'popkick', type: 'keyword', detail: 'completions.strudel.sample' },
  { label: 'reverbkick', type: 'keyword', detail: 'completions.strudel.sample' },

  /* Snare / clap */
  { label: 'sd', type: 'keyword', detail: 'completions.strudel.sample' },
  { label: 'sn', type: 'keyword', detail: 'completions.strudel.sample' },
  { label: 'cp', type: 'keyword', detail: 'completions.strudel.sample' },
  { label: 'realclaps', type: 'keyword', detail: 'completions.strudel.sample' },

  /* Hi-hat / cymbal */
  { label: 'hh', type: 'keyword', detail: 'completions.strudel.sample' },
  { label: 'hh27', type: 'keyword', detail: 'completions.strudel.sample' },
  { label: 'linnhats', type: 'keyword', detail: 'completions.strudel.sample' },
  { label: 'oh', type: 'keyword', detail: 'completions.strudel.sample' },
  { label: 'cr', type: 'keyword', detail: 'completions.strudel.sample' },
  { label: 'cb', type: 'keyword', detail: 'completions.strudel.sample' },

  /* Toms */
  { label: 'lt', type: 'keyword', detail: 'completions.strudel.sample' },
  { label: 'mt', type: 'keyword', detail: 'completions.strudel.sample' },
  { label: 'ht', type: 'keyword', detail: 'completions.strudel.sample' },

  /* Percussion */
  { label: 'clak', type: 'keyword', detail: 'completions.strudel.sample' },
  { label: 'click', type: 'keyword', detail: 'completions.strudel.sample' },
  { label: 'hand', type: 'keyword', detail: 'completions.strudel.sample' },
  { label: 'perc', type: 'keyword', detail: 'completions.strudel.sample' },
  { label: 'stomp', type: 'keyword', detail: 'completions.strudel.sample' },
  { label: 'tok', type: 'keyword', detail: 'completions.strudel.sample' },
  { label: 'tink', type: 'keyword', detail: 'completions.strudel.sample' },

  /* Drum machines */
  { label: 'dr', type: 'keyword', detail: 'completions.strudel.sample' },
  { label: 'dr2', type: 'keyword', detail: 'completions.strudel.sample' },
  { label: 'dr55', type: 'keyword', detail: 'completions.strudel.sample' },
  { label: 'dr_few', type: 'keyword', detail: 'completions.strudel.sample' },
  { label: 'drum', type: 'keyword', detail: 'completions.strudel.sample' },
  { label: 'drumtraks', type: 'keyword', detail: 'completions.strudel.sample' },
  { label: 'electro1', type: 'keyword', detail: 'completions.strudel.sample' },
  { label: 'gretsch', type: 'keyword', detail: 'completions.strudel.sample' },

  /* Bass */
  { label: 'bass', type: 'keyword', detail: 'completions.strudel.sample' },
  { label: 'bass0', type: 'keyword', detail: 'completions.strudel.sample' },
  { label: 'bass1', type: 'keyword', detail: 'completions.strudel.sample' },
  { label: 'bass2', type: 'keyword', detail: 'completions.strudel.sample' },
  { label: 'bass3', type: 'keyword', detail: 'completions.strudel.sample' },
  { label: 'bassdm', type: 'keyword', detail: 'completions.strudel.sample' },
  { label: 'bassfoo', type: 'keyword', detail: 'completions.strudel.sample' },
  { label: 'jvbass', type: 'keyword', detail: 'completions.strudel.sample' },
  { label: 'jungbass', type: 'keyword', detail: 'completions.strudel.sample' },

  /* Synth / keys */
  { label: 'arpy', type: 'keyword', detail: 'completions.strudel.sample' },
  { label: 'arp', type: 'keyword', detail: 'completions.strudel.sample' },
  { label: 'casio', type: 'keyword', detail: 'completions.strudel.sample' },
  { label: 'fm', type: 'keyword', detail: 'completions.strudel.sample' },
  { label: 'juno', type: 'keyword', detail: 'completions.strudel.sample' },
  { label: 'moog', type: 'keyword', detail: 'completions.strudel.sample' },
  { label: 'newnotes', type: 'keyword', detail: 'completions.strudel.sample' },
  { label: 'notes', type: 'keyword', detail: 'completions.strudel.sample' },
  { label: 'pad', type: 'keyword', detail: 'completions.strudel.sample' },
  { label: 'padlong', type: 'keyword', detail: 'completions.strudel.sample' },
  { label: 'pluck', type: 'keyword', detail: 'completions.strudel.sample' },
  { label: 'psr', type: 'keyword', detail: 'completions.strudel.sample' },
  { label: 'simplesine', type: 'keyword', detail: 'completions.strudel.sample' },

  /* Guitar / sax / strings */
  { label: 'gtr', type: 'keyword', detail: 'completions.strudel.sample' },
  { label: 'sax', type: 'keyword', detail: 'completions.strudel.sample' },
  { label: 'sitar', type: 'keyword', detail: 'completions.strudel.sample' },

  /* Vocals / speech */
  { label: 'alphabet', type: 'keyword', detail: 'completions.strudel.sample' },
  { label: 'chin', type: 'keyword', detail: 'completions.strudel.sample' },
  { label: 'diphone', type: 'keyword', detail: 'completions.strudel.sample' },
  { label: 'diphone2', type: 'keyword', detail: 'completions.strudel.sample' },
  { label: 'hmm', type: 'keyword', detail: 'completions.strudel.sample' },
  { label: 'mouth', type: 'keyword', detail: 'completions.strudel.sample' },
  { label: 'msg', type: 'keyword', detail: 'completions.strudel.sample' },
  { label: 'numbers', type: 'keyword', detail: 'completions.strudel.sample' },
  { label: 'speech', type: 'keyword', detail: 'completions.strudel.sample' },
  { label: 'speechless', type: 'keyword', detail: 'completions.strudel.sample' },
  { label: 'speakspell', type: 'keyword', detail: 'completions.strudel.sample' },
  { label: 'baa', type: 'keyword', detail: 'completions.strudel.sample' },
  { label: 'baa2', type: 'keyword', detail: 'completions.strudel.sample' },

  /* Noise / FX / glitch */
  { label: 'noise', type: 'keyword', detail: 'completions.strudel.sample' },
  { label: 'noise2', type: 'keyword', detail: 'completions.strudel.sample' },
  { label: 'glitch', type: 'keyword', detail: 'completions.strudel.sample' },
  { label: 'glitch2', type: 'keyword', detail: 'completions.strudel.sample' },
  { label: 'dist', type: 'keyword', detail: 'completions.strudel.sample' },
  { label: 'industrial', type: 'keyword', detail: 'completions.strudel.sample' },
  { label: 'bleep', type: 'keyword', detail: 'completions.strudel.sample' },
  { label: 'blip', type: 'keyword', detail: 'completions.strudel.sample' },

  /* Nature / environment */
  { label: 'birds', type: 'keyword', detail: 'completions.strudel.sample' },
  { label: 'birds3', type: 'keyword', detail: 'completions.strudel.sample' },
  { label: 'bubble', type: 'keyword', detail: 'completions.strudel.sample' },
  { label: 'crow', type: 'keyword', detail: 'completions.strudel.sample' },
  { label: 'fire', type: 'keyword', detail: 'completions.strudel.sample' },
  { label: 'insect', type: 'keyword', detail: 'completions.strudel.sample' },
  { label: 'outdoor', type: 'keyword', detail: 'completions.strudel.sample' },
  { label: 'wind', type: 'keyword', detail: 'completions.strudel.sample' },
  { label: 'water', type: 'keyword', detail: 'completions.strudel.sample' },

  /* Breaks / jungle */
  { label: 'amencutup', type: 'keyword', detail: 'completions.strudel.sample' },
  { label: 'breaks125', type: 'keyword', detail: 'completions.strudel.sample' },
  { label: 'breaks152', type: 'keyword', detail: 'completions.strudel.sample' },
  { label: 'breaks157', type: 'keyword', detail: 'completions.strudel.sample' },
  { label: 'breaks165', type: 'keyword', detail: 'completions.strudel.sample' },
  { label: 'jungle', type: 'keyword', detail: 'completions.strudel.sample' },

  /* Rave / gabba / hardcore */
  { label: 'gabba', type: 'keyword', detail: 'completions.strudel.sample' },
  { label: 'gabbaloud', type: 'keyword', detail: 'completions.strudel.sample' },
  { label: 'gabbalouder', type: 'keyword', detail: 'completions.strudel.sample' },
  { label: 'hardcore', type: 'keyword', detail: 'completions.strudel.sample' },
  { label: 'rave', type: 'keyword', detail: 'completions.strudel.sample' },
  { label: 'rave2', type: 'keyword', detail: 'completions.strudel.sample' },
  { label: 'ravemono', type: 'keyword', detail: 'completions.strudel.sample' },

  /* World / ethnic */
  { label: 'east', type: 'keyword', detail: 'completions.strudel.sample' },
  { label: 'tabla', type: 'keyword', detail: 'completions.strudel.sample' },
  { label: 'tabla2', type: 'keyword', detail: 'completions.strudel.sample' },
  { label: 'tablex', type: 'keyword', detail: 'completions.strudel.sample' },
  { label: 'world', type: 'keyword', detail: 'completions.strudel.sample' },
  { label: 'koy', type: 'keyword', detail: 'completions.strudel.sample' },
  { label: 'latibro', type: 'keyword', detail: 'completions.strudel.sample' },

  /* Retro / game */
  { label: 'invaders', type: 'keyword', detail: 'completions.strudel.sample' },
  { label: 'sid', type: 'keyword', detail: 'completions.strudel.sample' },
  { label: 'space', type: 'keyword', detail: 'completions.strudel.sample' },
  { label: 'subroc3d', type: 'keyword', detail: 'completions.strudel.sample' },
  { label: 'tacscan', type: 'keyword', detail: 'completions.strudel.sample' },

  /* Misc / remaining samples (A-Z) */
  { label: 'ab', type: 'keyword', detail: 'completions.strudel.sample' },
  { label: 'ade', type: 'keyword', detail: 'completions.strudel.sample' },
  { label: 'ades2', type: 'keyword', detail: 'completions.strudel.sample' },
  { label: 'ades3', type: 'keyword', detail: 'completions.strudel.sample' },
  { label: 'ades4', type: 'keyword', detail: 'completions.strudel.sample' },
  { label: 'alex', type: 'keyword', detail: 'completions.strudel.sample' },
  { label: 'armora', type: 'keyword', detail: 'completions.strudel.sample' },
  { label: 'auto', type: 'keyword', detail: 'completions.strudel.sample' },
  { label: 'battles', type: 'keyword', detail: 'completions.strudel.sample' },
  { label: 'bend', type: 'keyword', detail: 'completions.strudel.sample' },
  { label: 'bev', type: 'keyword', detail: 'completions.strudel.sample' },
  { label: 'bin', type: 'keyword', detail: 'completions.strudel.sample' },
  { label: 'blue', type: 'keyword', detail: 'completions.strudel.sample' },
  { label: 'bottle', type: 'keyword', detail: 'completions.strudel.sample' },
  { label: 'breath', type: 'keyword', detail: 'completions.strudel.sample' },
  { label: 'can', type: 'keyword', detail: 'completions.strudel.sample' },
  { label: 'cc', type: 'keyword', detail: 'completions.strudel.sample' },
  { label: 'circus', type: 'keyword', detail: 'completions.strudel.sample' },
  { label: 'co', type: 'keyword', detail: 'completions.strudel.sample' },
  { label: 'coins', type: 'keyword', detail: 'completions.strudel.sample' },
  { label: 'control', type: 'keyword', detail: 'completions.strudel.sample' },
  { label: 'cosmicg', type: 'keyword', detail: 'completions.strudel.sample' },
  { label: 'd', type: 'keyword', detail: 'completions.strudel.sample' },
  { label: 'db', type: 'keyword', detail: 'completions.strudel.sample' },
  { label: 'dork2', type: 'keyword', detail: 'completions.strudel.sample' },
  { label: 'dorkbot', type: 'keyword', detail: 'completions.strudel.sample' },
  { label: 'e', type: 'keyword', detail: 'completions.strudel.sample' },
  { label: 'em2', type: 'keyword', detail: 'completions.strudel.sample' },
  { label: 'erk', type: 'keyword', detail: 'completions.strudel.sample' },
  { label: 'f', type: 'keyword', detail: 'completions.strudel.sample' },
  { label: 'feel', type: 'keyword', detail: 'completions.strudel.sample' },
  { label: 'feelfx', type: 'keyword', detail: 'completions.strudel.sample' },
  { label: 'fest', type: 'keyword', detail: 'completions.strudel.sample' },
  { label: 'flick', type: 'keyword', detail: 'completions.strudel.sample' },
  { label: 'foo', type: 'keyword', detail: 'completions.strudel.sample' },
  { label: 'future', type: 'keyword', detail: 'completions.strudel.sample' },
  { label: 'gab', type: 'keyword', detail: 'completions.strudel.sample' },
  { label: 'glasstap', type: 'keyword', detail: 'completions.strudel.sample' },
  { label: 'h', type: 'keyword', detail: 'completions.strudel.sample' },
  { label: 'haw', type: 'keyword', detail: 'completions.strudel.sample' },
  { label: 'hc', type: 'keyword', detail: 'completions.strudel.sample' },
  { label: 'hit', type: 'keyword', detail: 'completions.strudel.sample' },
  { label: 'ho', type: 'keyword', detail: 'completions.strudel.sample' },
  { label: 'hoover', type: 'keyword', detail: 'completions.strudel.sample' },
  { label: 'house', type: 'keyword', detail: 'completions.strudel.sample' },
  { label: 'if', type: 'keyword', detail: 'completions.strudel.sample' },
  { label: 'ifdrums', type: 'keyword', detail: 'completions.strudel.sample' },
  { label: 'incoming', type: 'keyword', detail: 'completions.strudel.sample' },
  { label: 'jazz', type: 'keyword', detail: 'completions.strudel.sample' },
  { label: 'kurt', type: 'keyword', detail: 'completions.strudel.sample' },
  { label: 'led', type: 'keyword', detail: 'completions.strudel.sample' },
  { label: 'less', type: 'keyword', detail: 'completions.strudel.sample' },
  { label: 'lighter', type: 'keyword', detail: 'completions.strudel.sample' },
  { label: 'made', type: 'keyword', detail: 'completions.strudel.sample' },
  { label: 'made2', type: 'keyword', detail: 'completions.strudel.sample' },
  { label: 'mash', type: 'keyword', detail: 'completions.strudel.sample' },
  { label: 'mash2', type: 'keyword', detail: 'completions.strudel.sample' },
  { label: 'metal', type: 'keyword', detail: 'completions.strudel.sample' },
  { label: 'miniyeah', type: 'keyword', detail: 'completions.strudel.sample' },
  { label: 'monsterb', type: 'keyword', detail: 'completions.strudel.sample' },
  { label: 'mp3', type: 'keyword', detail: 'completions.strudel.sample' },
  { label: 'mute', type: 'keyword', detail: 'completions.strudel.sample' },
  { label: 'num', type: 'keyword', detail: 'completions.strudel.sample' },
  { label: 'oc', type: 'keyword', detail: 'completions.strudel.sample' },
  { label: 'odx', type: 'keyword', detail: 'completions.strudel.sample' },
  { label: 'off', type: 'keyword', detail: 'completions.strudel.sample' },
  { label: 'pebbles', type: 'keyword', detail: 'completions.strudel.sample' },
  { label: 'peri', type: 'keyword', detail: 'completions.strudel.sample' },
  { label: 'print', type: 'keyword', detail: 'completions.strudel.sample' },
  { label: 'proc', type: 'keyword', detail: 'completions.strudel.sample' },
  { label: 'procshort', type: 'keyword', detail: 'completions.strudel.sample' },
  { label: 'rm', type: 'keyword', detail: 'completions.strudel.sample' },
  { label: 'rs', type: 'keyword', detail: 'completions.strudel.sample' },
  { label: 'seawolf', type: 'keyword', detail: 'completions.strudel.sample' },
  { label: 'sequential', type: 'keyword', detail: 'completions.strudel.sample' },
  { label: 'sf', type: 'keyword', detail: 'completions.strudel.sample' },
  { label: 'sheffield', type: 'keyword', detail: 'completions.strudel.sample' },
  { label: 'short', type: 'keyword', detail: 'completions.strudel.sample' },
  { label: 'stab', type: 'keyword', detail: 'completions.strudel.sample' },
  { label: 'sugar', type: 'keyword', detail: 'completions.strudel.sample' },
  { label: 'sundance', type: 'keyword', detail: 'completions.strudel.sample' },
  { label: 'tech', type: 'keyword', detail: 'completions.strudel.sample' },
  { label: 'techno', type: 'keyword', detail: 'completions.strudel.sample' },
  { label: 'toys', type: 'keyword', detail: 'completions.strudel.sample' },
  { label: 'trump', type: 'keyword', detail: 'completions.strudel.sample' },
  { label: 'ul', type: 'keyword', detail: 'completions.strudel.sample' },
  { label: 'ulgab', type: 'keyword', detail: 'completions.strudel.sample' },
  { label: 'uxay', type: 'keyword', detail: 'completions.strudel.sample' },
  { label: 'v', type: 'keyword', detail: 'completions.strudel.sample' },
  { label: 'voodoo', type: 'keyword', detail: 'completions.strudel.sample' },
  { label: 'wobble', type: 'keyword', detail: 'completions.strudel.sample' },
  { label: 'xmas', type: 'keyword', detail: 'completions.strudel.sample' },
  { label: 'yeah', type: 'keyword', detail: 'completions.strudel.sample' },

  /* Synth types */
  { label: 'sawtooth', type: 'keyword', detail: 'completions.strudel.sawtooth' },
  { label: 'sine', type: 'keyword', detail: 'completions.strudel.sine' },
  { label: 'square', type: 'keyword', detail: 'completions.strudel.square' },
  { label: 'triangle', type: 'keyword', detail: 'completions.strudel.triangle' },
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
    /* Match simple word tokens — [\w]+ instead of [\w.]+ to avoid
     * swallowing method chains and to trigger more reliably on typing */
    const word = context.matchBefore(/[\w]+/);
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
