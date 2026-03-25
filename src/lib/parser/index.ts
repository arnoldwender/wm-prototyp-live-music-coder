import type { EngineType, EngineBlock, Connection } from '../../types/engine';

interface ParseResult {
  blocks: EngineBlock[];
  connections: Connection[];
}

/** Parse code to extract audio blocks and connections.
 * Uses pattern matching (regex), NOT a full AST. */
export function parseCode(code: string, engine: EngineType): ParseResult {
  if (!code.trim()) return { blocks: [], connections: [] };

  switch (engine) {
    case 'strudel': return parseStrudel(code);
    case 'tonejs': return parseToneJs(code);
    case 'webaudio': return parseWebAudio(code);
    case 'midi': return parseMidi(code);
  }
}

function parseStrudel(code: string): ParseResult {
  /* Strudel code is typically one pattern expression per file.
   * Treat the entire code as a single source block. */
  const blocks: EngineBlock[] = [{
    id: 'strudel_main',
    engine: 'strudel',
    type: 'source',
    code,
    params: {},
    inputs: [],
    outputs: [{ id: 'out', label: 'Output', type: 'audio' }],
  }];
  return { blocks, connections: [] };
}

/* Tone.js source constructors */
const TONE_SOURCES = /new\s+Tone\.(Synth|FMSynth|AMSynth|MonoSynth|DuoSynth|MembraneSynth|MetalSynth|NoiseSynth|PluckSynth|PolySynth|Sampler|Oscillator|Player)\b/;
/* Tone.js effect constructors */
const TONE_EFFECTS = /new\s+Tone\.(Reverb|Delay|FeedbackDelay|PingPongDelay|Chorus|Phaser|Tremolo|Vibrato|Distortion|BitCrusher|Chebyshev|AutoFilter|AutoPanner|AutoWah|Compressor|EQ3|Filter|Gain|Limiter|MultibandCompressor|Volume)\b/;

function parseToneJs(code: string): ParseResult {
  const blocks: EngineBlock[] = [];
  const connections: Connection[] = [];
  const varMap = new Map<string, string>(); /* varName -> blockId */
  const lines = code.split('\n');

  for (const line of lines) {
    const trimmed = line.trim();

    /* Match: const/let/var name = new Tone.X(...) */
    const varMatch = trimmed.match(/(?:const|let|var)\s+(\w+)\s*=\s*(new\s+Tone\.\w+)/);
    if (varMatch) {
      const [, varName, constructor] = varMatch;
      const isSource = TONE_SOURCES.test(constructor);
      const isEffect = TONE_EFFECTS.test(constructor);
      const blockId = `tonejs_${varName}`;

      blocks.push({
        id: blockId,
        engine: 'tonejs',
        type: isSource ? 'source' : isEffect ? 'effect' : 'effect',
        code: trimmed,
        params: {},
        inputs: isSource ? [] : [{ id: 'in', label: 'Input', type: 'audio' }],
        outputs: [{ id: 'out', label: 'Output', type: 'audio' }],
      });
      varMap.set(varName, blockId);
    }

    /* Match: x.connect(y) */
    const connectMatch = trimmed.match(/(\w+)\.connect\((\w+)\)/);
    if (connectMatch) {
      const [, src, tgt] = connectMatch;
      const srcId = varMap.get(src);
      const tgtId = varMap.get(tgt);
      if (srcId && tgtId) {
        connections.push({
          id: `conn_${srcId}_${tgtId}`,
          sourceBlockId: srcId,
          sourcePortId: 'out',
          targetBlockId: tgtId,
          targetPortId: 'in',
        });
      }
    }

    /* Match: x.chain(y, z, ...) */
    const chainMatch = trimmed.match(/(\w+)\.chain\(([^)]+)\)/);
    if (chainMatch) {
      const [, src, argsStr] = chainMatch;
      const args = argsStr.split(',').map(a => a.trim());
      let prevId = varMap.get(src);
      for (const arg of args) {
        const argId = varMap.get(arg);
        if (prevId && argId) {
          connections.push({
            id: `conn_${prevId}_${argId}`,
            sourceBlockId: prevId,
            sourcePortId: 'out',
            targetBlockId: argId,
            targetPortId: 'in',
          });
        }
        if (argId) prevId = argId;
      }
    }
  }

  return { blocks, connections };
}

/* Web Audio source creators */
const WA_SOURCES = /ctx\.create(Oscillator|BufferSource|ConstantSource|MediaElementSource|MediaStreamSource)\b/;
/* Web Audio effect/processing creators */
const WA_EFFECTS = /ctx\.create(Gain|BiquadFilter|Delay|DynamicsCompressor|WaveShaper|Convolver|StereoPanner|Panner|AnalyserNode?)\b/;

function parseWebAudio(code: string): ParseResult {
  const blocks: EngineBlock[] = [];
  const connections: Connection[] = [];
  const varMap = new Map<string, string>();
  const lines = code.split('\n');

  for (const line of lines) {
    const trimmed = line.trim();

    /* Match: const/let/var name = ctx.createX() */
    const varMatch = trimmed.match(/(?:const|let|var)\s+(\w+)\s*=\s*(ctx\.create\w+)/);
    if (varMatch) {
      const [, varName, creator] = varMatch;
      const isSource = WA_SOURCES.test(creator);
      const blockId = `webaudio_${varName}`;

      blocks.push({
        id: blockId,
        engine: 'webaudio',
        type: isSource ? 'source' : 'effect',
        code: trimmed,
        params: {},
        inputs: isSource ? [] : [{ id: 'in', label: 'Input', type: 'audio' }],
        outputs: [{ id: 'out', label: 'Output', type: 'audio' }],
      });
      varMap.set(varName, blockId);
    }

    /* Match: x.connect(y) */
    const connectMatch = trimmed.match(/(\w+)\.connect\((\w+)\)/);
    if (connectMatch) {
      const [, src, tgt] = connectMatch;
      const srcId = varMap.get(src);
      const tgtId = varMap.get(tgt);
      if (srcId && tgtId) {
        connections.push({
          id: `conn_${srcId}_${tgtId}`,
          sourceBlockId: srcId,
          sourcePortId: 'out',
          targetBlockId: tgtId,
          targetPortId: 'in',
        });
      }
    }
  }

  return { blocks, connections };
}

function parseMidi(code: string): ParseResult {
  /* MIDI code is imperative — treat as single output block */
  if (!code.trim()) return { blocks: [], connections: [] };
  return {
    blocks: [{
      id: 'midi_main',
      engine: 'midi',
      type: 'output',
      code,
      params: {},
      inputs: [{ id: 'in', label: 'Input', type: 'midi' }],
      outputs: [],
    }],
    connections: [],
  };
}
