// SPDX-License-Identifier: AGPL-3.0-or-later
// Copyright (c) 2026 Arnold Wender / Wender Media

/* Custom midikeys implementation that bypasses @strudel/midi's broken
 * getIsStarted() check (caused by Vite's double @strudel/core instance).
 *
 * Uses the raw Web MIDI API (proven to work) and constructs Strudel
 * Pattern/Hap/TimeSpan from @strudel/web (same instance as the REPL).
 * This guarantees the pattern integrates with the REPL's scheduler. */

/* eslint-disable @typescript-eslint/no-explicit-any */

/** Buffered MIDI haps per device, keyed by device name/index */
const kHaps: Record<string, any[]> = {};

/** Track which devices have listeners attached */
const attachedDevices = new Set<string>();

/** Get the Strudel REPL reference */
function getRepl(): any {
  return (window as any).__strudelRepl;
}

/**
 * Custom midikeys — replacement for @strudel/midi's midikeys.
 * Uses raw Web MIDI API + @strudel/web's Pattern class (same REPL instance).
 *
 * @param device - Device index (0 = first), name string, or "*" for all
 * @returns async function: (noteLength?) => Pattern
 */
export async function customMidikeys(device: number | string = 0): Promise<(noteLength?: number) => any> {
  /* Request MIDI access */
  if (!navigator.requestMIDIAccess) {
    throw new Error('Your browser does not support WebMIDI.');
  }

  const midi = await navigator.requestMIDIAccess({ sysex: false });
  const inputs = [...midi.inputs.values()];

  if (inputs.length === 0) {
    throw new Error('No MIDI devices found. Connect a MIDI controller and reload.');
  }

  /* Find target device(s) */
  let targets: MIDIInput[];
  if (device === '*') {
    targets = inputs;
  } else if (typeof device === 'number') {
    const d = inputs[device];
    if (!d) throw new Error(`MIDI device ${device} not found. ${inputs.length} devices available.`);
    targets = [d];
  } else {
    const d = inputs.find(i => i.name?.includes(device as string));
    if (!d) throw new Error(`MIDI device "${device}" not found.`);
    targets = [d];
  }

  /* Import Strudel core from @strudel/web — the REPL's instance (instance A).
   * This gives us the REAL getTriggerFunc/getPattern/getCps that have state
   * set by the running REPL, unlike @strudel/midi's instance B imports. */
  const strudelWeb = await import('@strudel/web') as any;
  const { Pattern, Hap, TimeSpan } = strudelWeb;
  const { composeNoteOn, isComposeModeActive } = await import('./compose-mode');
  /* Create our OWN AudioContext — don't import from @strudel/webaudio
   * because that module also suffers from the double-instance bug.
   * A fresh AudioContext works after any user gesture (clicking Play). */
  let midiAudioCtx: AudioContext | null = null;
  function getMidiAudioCtx(): AudioContext {
    if (!midiAudioCtx || midiAudioCtx.state === 'closed') {
      midiAudioCtx = new (window.AudioContext || (window as any).webkitAudioContext)();
    }
    if (midiAudioCtx.state === 'suspended') midiAudioCtx.resume();
    return midiAudioCtx;
  }

  /* Device key for hap buffer */
  const deviceKey = typeof device === 'string' ? device : `midi_${device}`;
  if (!kHaps[deviceKey]) kHaps[deviceKey] = [];

  /* Attach note listeners to target devices */
  for (const input of targets) {
    const inputId = input.id || input.name || 'unknown';
    if (attachedDevices.has(inputId)) continue;
    attachedDevices.add(inputId);

    input.addEventListener('midimessage', ((e: MIDIMessageEvent) => {
      const data = e.data;
      if (!data || data.length < 3) return;

      const status = data[0];
      const type = status >> 4;
      const note = data[1];
      const velocity = data[2];

      /* Only handle Note On/Off */
      const isNoteOn = type === 9 && velocity > 0;
      const isNoteOff = type === 8 || (type === 9 && velocity === 0);
      if (!isNoteOn && !isNoteOff) return;
      if (isNoteOff) return;

      /* Throttle: skip if same note fired within 50ms (joystick/aftertouch spam) */
      const now_ms = Date.now();
      const lastKey = `${deviceKey}_${note}_last`;
      const lastTime = (globalThis as any)[lastKey] ?? 0;
      if (now_ms - lastTime < 50) return;
      (globalThis as any)[lastKey] = now_ms;

      /* Composition mode: write notes to editor instead of playing sound */
      if (isComposeModeActive()) {
        composeNoteOn(note, velocity);
        return; /* Don't trigger audio — just write to editor */
      }

      const replInst = getRepl();
      if (!replInst?.scheduler) return;

      const midiNote = Math.round(note);
      const vel = (velocity / 127).toFixed(2);
      const now = replInst.scheduler.now();
      const t = now + 0.01;

      const key = `${deviceKey}_${midiNote}`;
      const hapValue = { midikey: key, note: midiNote, velocity: velocity / 127 };

      /* Buffer hap for cyclist queries */
      const noteLen = 0.5;
      kHaps[deviceKey].push(new Hap(
        new TimeSpan(t, t + noteLen),
        new TimeSpan(t, t + noteLen),
        hapValue, {}
      ));

      /* IMMEDIATE TRIGGER: Always use OscillatorNode for guaranteed sound.
       * The REPL evaluate path has too many failure modes:
       * - "superpiano not found" (double superdough instance)
       * - SyntaxError from effect extraction
       * - Timing conflicts with the cyclist
       *
       * OscillatorNode is instant, reliable, and respects velocity.
       * The user's .s("synth") choice maps to an oscillator type. */
      const SYNTH_TO_OSC: Record<string, OscillatorType> = {
        sine: 'sine', sawtooth: 'sawtooth', square: 'square', triangle: 'triangle',
        supersaw: 'sawtooth', saw: 'sawtooth', pulse: 'square',
        /* Sample-based synths fall back to sine — the most musical default */
        superpiano: 'sine', piano: 'triangle', metal: 'square',
        bass: 'sawtooth', pluck: 'triangle', organ: 'sine',
      };

      const activeCode = replInst.state?.activeCode ?? '';
      const synthMatch = activeCode.match(/\.s\(\s*["']([^"']+)["']\s*\)/);
      const synthName = synthMatch?.[1] ?? 'sine';
      const oscType = SYNTH_TO_OSC[synthName] ?? 'sine';

      /* OscillatorNode — always produces sound, maps synth name to oscillator type */
      try {
        const ac = getMidiAudioCtx();
        const freq = 440 * Math.pow(2, (midiNote - 69) / 12);
        const vol = velocity / 127;

        const osc = ac.createOscillator();
        osc.type = oscType;
        osc.frequency.value = freq;

        const gainNode = ac.createGain();
        gainNode.gain.setValueAtTime(vol * 0.5, ac.currentTime);
        gainNode.gain.exponentialRampToValueAtTime(0.001, ac.currentTime + 0.4);

        osc.connect(gainNode);
        gainNode.connect(ac.destination);
        osc.start(ac.currentTime);
        osc.stop(ac.currentTime + 0.45);
      } catch { /* audio failed */ }

      console.log(`[midikeys] PLAYED note=${midiNote} vel=${vel} osc=${oscType} (${synthName})`);
    }) as EventListener);
  }

  const deviceName = targets.map(t => t.name).join(', ');
  console.log(`[midi] Midi enabled! Using "${deviceName}".`);

  /* Return function that creates a Pattern from the hap buffer */
  const kb = (noteLength: number | any = 0.5): any => {
    return new Pattern(function queryMidiKeys(state: any) {
      const begin = state.span.begin;
      const end = state.span.end;

      /* Collect haps that overlap the query window */
      const result: any[] = [];
      const remaining: any[] = [];

      for (const hap of kHaps[deviceKey]) {
        const hapTime = hap.whole?.begin ?? hap.part?.begin ?? 0;
        const resolvedLength = typeof noteLength === 'number' ? noteLength : 0.5;

        /* Hap is within query range + noteLength window */
        if (hapTime >= begin - resolvedLength && hapTime < end) {
          const hapEnd = hapTime + resolvedLength;
          const whole = new TimeSpan(hapTime, hapEnd);
          const part = new TimeSpan(
            Math.max(hapTime, begin),
            Math.min(hapEnd, end)
          );
          result.push(new Hap(whole, part, hap.value, hap.context || {}));
        }

        /* Keep haps from the last 2 seconds for re-query */
        const now = getRepl()?.scheduler?.now() ?? 0;
        if (hapTime > now - 2) {
          remaining.push(hap);
        }
      }

      /* Garbage collect old haps */
      kHaps[deviceKey] = remaining;

      return result;
    });
  };

  return kb;
}

/**
 * Custom midin — CC knob reader.
 * This one works fine from @strudel/midi since CC reading doesn't need
 * getIsStarted(). But we provide a fallback just in case.
 */
export async function customMidin(device: number | string = 0): Promise<(ccNum?: number) => any> {
  /* Try @strudel/midi's midin first — CC reading doesn't have the isStarted bug */
  try {
    const { midin } = await import('@strudel/midi') as any;
    if (midin) return await midin(device);
  } catch { /* fallback below */ }

  /* Fallback: raw CC reader */
  const midi = await navigator.requestMIDIAccess({ sysex: false });
  const inputs = [...midi.inputs.values()];
  const target = typeof device === 'number' ? inputs[device] : inputs.find(i => i.name?.includes(device as string));

  if (!target) throw new Error(`MIDI device not found`);

  const ccValues: Record<number, number> = {};

  target.addEventListener('midimessage', ((e: MIDIMessageEvent) => {
    const [status, cc, value] = e.data ?? [];
    if ((status >> 4) === 11) { /* CC message */
      ccValues[cc] = value / 127;
    }
  }) as EventListener);

  console.log(`[midi] CC input enabled on "${target.name}".`);

  const { ref } = await import('@strudel/web') as any;

  return (ccNum: number = 0) => {
    const r = ref(ccValues[ccNum] ?? 0);
    /* Poll CC value into the ref */
    const poll = () => {
      r.value = ccValues[ccNum] ?? 0;
      requestAnimationFrame(poll);
    };
    poll();
    return r;
  };
}
