/* SPDX-License-Identifier: AGPL-3.0-or-later
   Copyright (c) 2026 Arnold Wender / Wender Media
   ──────────────────────────────────────────────────────────
   First-party FluidR3_GM SoundFont loader (125/125 GM voices).

   Restricts Strudel General MIDI presets exclusively to the MIT-licensed
   FluidR3_GM bank served via our same-origin /soundfonts/* edge proxy
   (pinned to commit 23ca907d4370a04fd89ca483a92915e4d6159ab9) instead
   of third-party felixroos.github.io requests or unverified SF2 packs.
   ────────────────────────────────────────────────────────── */

const PRODUCTION_ORIGIN = 'https://live-music-coder.pro'

/** Complete 125-instrument General MIDI preset table (MIT FluidR3_GM only). */
export const FLUID_GM_PRESETS: Readonly<Record<string, readonly string[]>> = {
  gm_piano: ['0000_FluidR3_GM_sf2_file', '0001_FluidR3_GM_sf2_file'],
  gm_epiano1: ['0040_FluidR3_GM_sf2_file', '0041_FluidR3_GM_sf2_file'],
  gm_epiano2: ['0050_FluidR3_GM_sf2_file', '0051_FluidR3_GM_sf2_file'],
  gm_harpsichord: ['0060_FluidR3_GM_sf2_file'],
  gm_clavinet: ['0070_FluidR3_GM_sf2_file'],
  gm_celesta: ['0080_FluidR3_GM_sf2_file', '0081_FluidR3_GM_sf2_file'],
  gm_glockenspiel: ['0090_FluidR3_GM_sf2_file'],
  gm_music_box: ['0100_FluidR3_GM_sf2_file'],
  gm_vibraphone: ['0110_FluidR3_GM_sf2_file', '0111_FluidR3_GM_sf2_file'],
  gm_marimba: ['0120_FluidR3_GM_sf2_file', '0121_FluidR3_GM_sf2_file'],
  gm_xylophone: ['0130_FluidR3_GM_sf2_file', '0131_FluidR3_GM_sf2_file'],
  gm_tubular_bells: ['0140_FluidR3_GM_sf2_file', '0141_FluidR3_GM_sf2_file'],
  gm_dulcimer: ['0150_FluidR3_GM_sf2_file', '0151_FluidR3_GM_sf2_file'],
  gm_drawbar_organ: ['0160_FluidR3_GM_sf2_file', '0161_FluidR3_GM_sf2_file'],
  gm_percussive_organ: ['0170_FluidR3_GM_sf2_file', '0171_FluidR3_GM_sf2_file', '0172_FluidR3_GM_sf2_file'],
  gm_rock_organ: ['0180_FluidR3_GM_sf2_file'],
  gm_church_organ: ['0190_FluidR3_GM_sf2_file'],
  gm_reed_organ: ['0200_FluidR3_GM_sf2_file', '0201_FluidR3_GM_sf2_file'],
  gm_accordion: ['0210_FluidR3_GM_sf2_file', '0211_FluidR3_GM_sf2_file'],
  gm_harmonica: ['0220_FluidR3_GM_sf2_file', '0221_FluidR3_GM_sf2_file'],
  gm_bandoneon: ['0230_FluidR3_GM_sf2_file', '0231_FluidR3_GM_sf2_file', '0232_FluidR3_GM_sf2_file', '0233_FluidR3_GM_sf2_file'],
  gm_acoustic_guitar_nylon: ['0240_FluidR3_GM_sf2_file'],
  gm_acoustic_guitar_steel: ['0250_FluidR3_GM_sf2_file'],
  gm_electric_guitar_jazz: ['0260_FluidR3_GM_sf2_file'],
  gm_electric_guitar_clean: ['0270_FluidR3_GM_sf2_file'],
  gm_electric_guitar_muted: ['0281_FluidR3_GM_sf2_file', '0282_FluidR3_GM_sf2_file'],
  gm_overdriven_guitar: ['0290_FluidR3_GM_sf2_file'],
  gm_distortion_guitar: ['0300_FluidR3_GM_sf2_file'],
  gm_guitar_harmonics: ['0310_FluidR3_GM_sf2_file'],
  gm_acoustic_bass: ['0320_FluidR3_GM_sf2_file'],
  gm_electric_bass_finger: ['0330_FluidR3_GM_sf2_file'],
  gm_electric_bass_pick: ['0340_FluidR3_GM_sf2_file'],
  gm_fretless_bass: ['0350_FluidR3_GM_sf2_file'],
  gm_slap_bass_1: ['0360_FluidR3_GM_sf2_file'],
  gm_slap_bass_2: ['0370_FluidR3_GM_sf2_file'],
  gm_synth_bass_1: ['0380_FluidR3_GM_sf2_file', '0381_FluidR3_GM_sf2_file'],
  gm_synth_bass_2: ['0390_FluidR3_GM_sf2_file', '0391_FluidR3_GM_sf2_file', '0392_FluidR3_GM_sf2_file'],
  gm_violin: ['0400_FluidR3_GM_sf2_file', '0401_FluidR3_GM_sf2_file'],
  gm_viola: ['0410_FluidR3_GM_sf2_file', '0411_FluidR3_GM_sf2_file'],
  gm_cello: ['0420_FluidR3_GM_sf2_file', '0421_FluidR3_GM_sf2_file'],
  gm_contrabass: ['0430_FluidR3_GM_sf2_file'],
  gm_tremolo_strings: ['0440_FluidR3_GM_sf2_file'],
  gm_pizzicato_strings: ['0450_FluidR3_GM_sf2_file', '0451_FluidR3_GM_sf2_file'],
  gm_orchestral_harp: ['0460_FluidR3_GM_sf2_file', '0461_FluidR3_GM_sf2_file'],
  gm_timpani: ['0470_FluidR3_GM_sf2_file', '0471_FluidR3_GM_sf2_file'],
  gm_string_ensemble_1: ['0480_FluidR3_GM_sf2_file', '0481_FluidR3_GM_sf2_file'],
  gm_string_ensemble_2: ['0490_FluidR3_GM_sf2_file'],
  gm_synth_strings_1: ['0501_FluidR3_GM_sf2_file', '0503_FluidR3_GM_sf2_file', '0505_FluidR3_GM_sf2_file'],
  gm_synth_strings_2: ['0510_FluidR3_GM_sf2_file'],
  gm_choir_aahs: ['0520_FluidR3_GM_sf2_file', '0521_FluidR3_GM_sf2_file'],
  gm_voice_oohs: ['0530_FluidR3_GM_sf2_file', '0531_FluidR3_GM_sf2_file'],
  gm_synth_choir: ['0540_FluidR3_GM_sf2_file', '0541_FluidR3_GM_sf2_file'],
  gm_orchestra_hit: ['0550_FluidR3_GM_sf2_file', '0551_FluidR3_GM_sf2_file'],
  gm_trumpet: ['0560_FluidR3_GM_sf2_file'],
  gm_trombone: ['0570_FluidR3_GM_sf2_file'],
  gm_tuba: ['0580_FluidR3_GM_sf2_file'],
  gm_muted_trumpet: ['0590_FluidR3_GM_sf2_file'],
  gm_french_horn: ['0600_FluidR3_GM_sf2_file', '0601_FluidR3_GM_sf2_file'],
  gm_brass_section: ['0610_FluidR3_GM_sf2_file'],
  gm_synth_brass_1: ['0620_FluidR3_GM_sf2_file', '0621_FluidR3_GM_sf2_file'],
  gm_synth_brass_2: ['0630_FluidR3_GM_sf2_file', '0631_FluidR3_GM_sf2_file', '0632_FluidR3_GM_sf2_file', '0633_FluidR3_GM_sf2_file'],
  gm_soprano_sax: ['0640_FluidR3_GM_sf2_file', '0641_FluidR3_GM_sf2_file'],
  gm_alto_sax: ['0650_FluidR3_GM_sf2_file', '0651_FluidR3_GM_sf2_file'],
  gm_tenor_sax: ['0660_FluidR3_GM_sf2_file'],
  gm_baritone_sax: ['0670_FluidR3_GM_sf2_file', '0671_FluidR3_GM_sf2_file'],
  gm_oboe: ['0680_FluidR3_GM_sf2_file', '0681_FluidR3_GM_sf2_file'],
  gm_english_horn: ['0690_FluidR3_GM_sf2_file', '0691_FluidR3_GM_sf2_file'],
  gm_bassoon: ['0700_FluidR3_GM_sf2_file', '0701_FluidR3_GM_sf2_file'],
  gm_clarinet: ['0710_FluidR3_GM_sf2_file', '0711_FluidR3_GM_sf2_file'],
  gm_piccolo: ['0720_FluidR3_GM_sf2_file', '0721_FluidR3_GM_sf2_file'],
  gm_flute: ['0730_FluidR3_GM_sf2_file', '0731_FluidR3_GM_sf2_file'],
  gm_recorder: ['0740_FluidR3_GM_sf2_file'],
  gm_pan_flute: ['0750_FluidR3_GM_sf2_file', '0751_FluidR3_GM_sf2_file'],
  gm_blown_bottle: ['0760_FluidR3_GM_sf2_file', '0761_FluidR3_GM_sf2_file'],
  gm_shakuhachi: ['0771_FluidR3_GM_sf2_file', '0770_FluidR3_GM_sf2_file'],
  gm_whistle: ['0780_FluidR3_GM_sf2_file'],
  gm_ocarina: ['0790_FluidR3_GM_sf2_file'],
  gm_lead_1_square: ['0800_FluidR3_GM_sf2_file'],
  gm_lead_2_sawtooth: ['0810_FluidR3_GM_sf2_file'],
  gm_lead_3_calliope: ['0820_FluidR3_GM_sf2_file', '0821_FluidR3_GM_sf2_file'],
  gm_lead_4_chiff: ['0830_FluidR3_GM_sf2_file', '0831_FluidR3_GM_sf2_file'],
  gm_lead_5_charang: ['0840_FluidR3_GM_sf2_file', '0841_FluidR3_GM_sf2_file', '0842_FluidR3_GM_sf2_file'],
  gm_lead_6_voice: ['0850_FluidR3_GM_sf2_file', '0851_FluidR3_GM_sf2_file'],
  gm_lead_7_fifths: ['0860_FluidR3_GM_sf2_file'],
  gm_lead_8_bass_lead: ['0870_FluidR3_GM_sf2_file'],
  gm_pad_new_age: ['0880_FluidR3_GM_sf2_file', '0881_FluidR3_GM_sf2_file'],
  gm_pad_warm: ['0890_FluidR3_GM_sf2_file', '0891_FluidR3_GM_sf2_file'],
  gm_pad_poly: ['0900_FluidR3_GM_sf2_file', '0901_FluidR3_GM_sf2_file'],
  gm_pad_choir: ['0910_FluidR3_GM_sf2_file'],
  gm_pad_bowed: ['0920_FluidR3_GM_sf2_file'],
  gm_pad_metallic: ['0930_FluidR3_GM_sf2_file', '0931_FluidR3_GM_sf2_file'],
  gm_pad_halo: ['0940_FluidR3_GM_sf2_file', '0941_FluidR3_GM_sf2_file'],
  gm_pad_sweep: ['0950_FluidR3_GM_sf2_file', '0951_FluidR3_GM_sf2_file'],
  gm_fx_rain: ['0960_FluidR3_GM_sf2_file', '0961_FluidR3_GM_sf2_file'],
  gm_fx_soundtrack: ['0970_FluidR3_GM_sf2_file', '0971_FluidR3_GM_sf2_file'],
  gm_fx_crystal: ['0981_FluidR3_GM_sf2_file'],
  gm_fx_atmosphere: ['0990_FluidR3_GM_sf2_file', '0991_FluidR3_GM_sf2_file', '0992_FluidR3_GM_sf2_file'],
  gm_fx_brightness: ['1000_FluidR3_GM_sf2_file', '1001_FluidR3_GM_sf2_file', '1002_FluidR3_GM_sf2_file'],
  gm_fx_goblins: ['1010_FluidR3_GM_sf2_file', '1011_FluidR3_GM_sf2_file'],
  gm_fx_echoes: ['1020_FluidR3_GM_sf2_file', '1021_FluidR3_GM_sf2_file'],
  gm_fx_sci_fi: ['1030_FluidR3_GM_sf2_file', '1031_FluidR3_GM_sf2_file', '1032_FluidR3_GM_sf2_file'],
  gm_sitar: ['1040_FluidR3_GM_sf2_file', '1041_FluidR3_GM_sf2_file'],
  gm_banjo: ['1050_FluidR3_GM_sf2_file'],
  gm_shamisen: ['1060_FluidR3_GM_sf2_file', '1061_FluidR3_GM_sf2_file'],
  gm_koto: ['1070_FluidR3_GM_sf2_file', '1071_FluidR3_GM_sf2_file'],
  gm_kalimba: ['1080_FluidR3_GM_sf2_file'],
  gm_bagpipe: ['1090_FluidR3_GM_sf2_file'],
  gm_fiddle: ['1100_FluidR3_GM_sf2_file', '1101_FluidR3_GM_sf2_file'],
  gm_shanai: ['1110_FluidR3_GM_sf2_file'],
  gm_tinkle_bell: ['1120_FluidR3_GM_sf2_file'],
  gm_agogo: ['1130_FluidR3_GM_sf2_file', '1131_FluidR3_GM_sf2_file'],
  gm_steel_drums: ['1140_FluidR3_GM_sf2_file', '1141_FluidR3_GM_sf2_file'],
  gm_woodblock: ['1150_FluidR3_GM_sf2_file', '1151_FluidR3_GM_sf2_file', '1152_FluidR3_GM_sf2_file'],
  gm_taiko_drum: ['1160_FluidR3_GM_sf2_file', '1161_FluidR3_GM_sf2_file', '1162_FluidR3_GM_sf2_file', '1163_FluidR3_GM_sf2_file'],
  gm_melodic_tom: ['1170_FluidR3_GM_sf2_file', '1171_FluidR3_GM_sf2_file', '1172_FluidR3_GM_sf2_file', '1173_FluidR3_GM_sf2_file'],
  gm_synth_drum: ['1180_FluidR3_GM_sf2_file', '1181_FluidR3_GM_sf2_file'],
  gm_reverse_cymbal: ['1190_FluidR3_GM_sf2_file'],
  gm_guitar_fret_noise: ['1200_FluidR3_GM_sf2_file'],
  gm_breath_noise: ['1210_FluidR3_GM_sf2_file'],
  gm_seashore: ['1220_FluidR3_GM_sf2_file'],
  gm_bird_tweet: ['1230_FluidR3_GM_sf2_file'],
  gm_telephone: ['1240_FluidR3_GM_sf2_file'],
  gm_helicopter: ['1250_FluidR3_GM_sf2_file', '1251_FluidR3_GM_sf2_file', '1252_FluidR3_GM_sf2_file'],
  gm_applause: ['1260_FluidR3_GM_sf2_file'],
  gm_gunshot: ['1270_FluidR3_GM_sf2_file'],
}

export const FLUID_GM_NAMES: readonly string[] = Object.keys(FLUID_GM_PRESETS)

/** Grouped General MIDI instrument names for the IDE Sound Browser. */
export const GM_SAMPLE_CATEGORIES: readonly { id: string; label: string; samples: readonly string[] }[] = [
  { id: 'gm-keys', label: 'GM Keys & Organ', samples: ['gm_piano', 'gm_epiano1', 'gm_epiano2', 'gm_harpsichord', 'gm_clavinet', 'gm_celesta', 'gm_glockenspiel', 'gm_music_box', 'gm_vibraphone', 'gm_marimba', 'gm_xylophone', 'gm_tubular_bells', 'gm_dulcimer', 'gm_drawbar_organ', 'gm_percussive_organ', 'gm_rock_organ', 'gm_church_organ', 'gm_reed_organ', 'gm_accordion', 'gm_harmonica', 'gm_bandoneon'] },
  { id: 'gm-guitar-bass', label: 'GM Guitar & Bass', samples: ['gm_acoustic_guitar_nylon', 'gm_acoustic_guitar_steel', 'gm_electric_guitar_jazz', 'gm_electric_guitar_clean', 'gm_electric_guitar_muted', 'gm_overdriven_guitar', 'gm_distortion_guitar', 'gm_guitar_harmonics', 'gm_acoustic_bass', 'gm_electric_bass_finger', 'gm_electric_bass_pick', 'gm_fretless_bass', 'gm_slap_bass_1', 'gm_slap_bass_2', 'gm_synth_bass_1', 'gm_synth_bass_2'] },
  { id: 'gm-strings-choir', label: 'GM Strings & Choir', samples: ['gm_violin', 'gm_viola', 'gm_cello', 'gm_contrabass', 'gm_tremolo_strings', 'gm_pizzicato_strings', 'gm_orchestral_harp', 'gm_timpani', 'gm_string_ensemble_1', 'gm_string_ensemble_2', 'gm_synth_strings_1', 'gm_synth_strings_2', 'gm_choir_aahs', 'gm_voice_oohs', 'gm_synth_choir', 'gm_orchestra_hit'] },
  { id: 'gm-brass-reed', label: 'GM Brass & Winds', samples: ['gm_trumpet', 'gm_trombone', 'gm_tuba', 'gm_muted_trumpet', 'gm_french_horn', 'gm_brass_section', 'gm_synth_brass_1', 'gm_synth_brass_2', 'gm_soprano_sax', 'gm_alto_sax', 'gm_tenor_sax', 'gm_baritone_sax', 'gm_oboe', 'gm_english_horn', 'gm_bassoon', 'gm_clarinet', 'gm_piccolo', 'gm_flute', 'gm_recorder', 'gm_pan_flute', 'gm_blown_bottle', 'gm_shakuhachi', 'gm_whistle', 'gm_ocarina'] },
  { id: 'gm-synth-fx', label: 'GM Synth, Ethnic & FX', samples: ['gm_lead_1_square', 'gm_lead_2_sawtooth', 'gm_lead_3_calliope', 'gm_lead_4_chiff', 'gm_lead_5_charang', 'gm_lead_6_voice', 'gm_lead_7_fifths', 'gm_lead_8_bass_lead', 'gm_pad_new_age', 'gm_pad_warm', 'gm_pad_poly', 'gm_pad_choir', 'gm_pad_bowed', 'gm_pad_metallic', 'gm_pad_halo', 'gm_pad_sweep', 'gm_fx_rain', 'gm_fx_soundtrack', 'gm_fx_crystal', 'gm_fx_atmosphere', 'gm_fx_brightness', 'gm_fx_goblins', 'gm_fx_echoes', 'gm_fx_sci_fi', 'gm_sitar', 'gm_banjo', 'gm_shamisen', 'gm_koto', 'gm_kalimba', 'gm_bagpipe', 'gm_fiddle', 'gm_shanai', 'gm_tinkle_bell', 'gm_agogo', 'gm_steel_drums', 'gm_woodblock', 'gm_taiko_drum', 'gm_melodic_tom', 'gm_synth_drum', 'gm_reverse_cymbal', 'gm_guitar_fret_noise', 'gm_breath_noise', 'gm_seashore', 'gm_bird_tweet', 'gm_telephone', 'gm_helicopter', 'gm_applause', 'gm_gunshot'] },
]

/** Resolve SoundFont proxy base URL for web vs Electron packaged file:// origin. */
export function getDefaultSoundfontBaseUrl(protocol?: string): string {
  const activeProtocol =
    protocol ?? (typeof window !== 'undefined' ? window.location.protocol : 'https:')
  return activeProtocol === 'file:' ? `${PRODUCTION_ORIGIN}/soundfonts` : '/soundfonts'
}

let registered = false

/** Register all 125 FluidR3_GM voices against the first-party /soundfonts proxy. */
export async function registerFluidSoundfonts(): Promise<void> {
  if (registered) return
  const [
    { getSoundIndex },
    { getFontBufferSource, setSoundfontUrl },
    {
      getADSRValues,
      getAudioContext,
      getParamADSR,
      getPitchEnvelope,
      getVibratoOscillator,
      onceEnded,
      registerSound,
      releaseAudioNode,
    },
  ] = await Promise.all([
    import('@strudel/core'),
    import('@strudel/soundfonts'),
    import('@strudel/webaudio'),
  ])

  setSoundfontUrl(getDefaultSoundfontBaseUrl())

  for (const [name, fonts] of Object.entries(FLUID_GM_PRESETS)) {
    registerSound(
      name,
      async (time, value, onended) => {
        const [attack, decay, sustain, release] = getADSRValues([
          value.attack,
          value.decay,
          value.sustain,
          value.release,
        ])
        const duration = typeof value.duration === 'number' ? value.duration : 0.5
        const n = getSoundIndex(value.n, fonts.length)
        const font = fonts[n]
        const ctx = getAudioContext()
        const bufferSource = await getFontBufferSource(font, value, ctx)
        bufferSource.start(time)
        const envGain = ctx.createGain()
        bufferSource.connect(envGain)
        const node = envGain
        const holdEnd = time + duration
        getParamADSR(node.gain, attack, decay, sustain, release, 0, 0.3, time, holdEnd, 'linear')
        const envEnd = holdEnd + release + 0.01

        const vibratoHandle = getVibratoOscillator(bufferSource.detune, value, time)
        getPitchEnvelope(bufferSource.detune, value, time, holdEnd)

        bufferSource.stop(envEnd)
        const stop = () => {}
        onceEnded(bufferSource, () => {
          releaseAudioNode(bufferSource)
          vibratoHandle?.stop?.()
          onended()
        })
        return {
          node,
          stop,
          nodes: { source: [bufferSource], ...(vibratoHandle?.nodes ?? {}) },
        }
      },
      { type: 'soundfont', prebake: true, fonts: [...fonts] },
    )
  }
  registered = true
}
