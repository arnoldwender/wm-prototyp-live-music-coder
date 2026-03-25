/* ──────────────────────────────────────────────────────────
   Sample library — all 218 Dirt-Samples with metadata,
   descriptions, tags, and individual variation entries.
   Used by the /samples browseable library page.
   ────────────────────────────────────────────────────────── */

/** Single sample entry (base sample or individual variation) */
export interface SampleEntry {
  name: string;
  variations: number;
  category: string;
  description: string;
  tags: string[];
  example: string;
  isVariation?: boolean;
  parentSample?: string;
}

/** Category definition for filter pills */
export interface SampleCategory {
  id: string;
  label: string;
  count: number;
}

/* ── Base sample definitions — 218 Dirt-Samples ── */
const BASE_SAMPLES: Omit<SampleEntry, 'isVariation' | 'parentSample'>[] = [
  /* --- Kicks --- */
  { name: 'bd', variations: 24, category: 'Kicks', description: 'Classic bass drum from various drum machines', tags: ['kick', 'drum', 'bass', 'low'], example: 's("bd").gain(0.8)' },
  { name: 'clubkick', variations: 6, category: 'Kicks', description: 'Modern club-style kick drums', tags: ['kick', 'club', 'dance', 'electronic'], example: 's("clubkick").gain(0.8)' },
  { name: 'hardkick', variations: 6, category: 'Kicks', description: 'Hard distorted kick drums', tags: ['kick', 'hard', 'distorted', 'industrial'], example: 's("hardkick").gain(0.7)' },
  { name: 'popkick', variations: 2, category: 'Kicks', description: 'Pop music kick drums with round low end', tags: ['kick', 'pop', 'soft', 'round'], example: 's("popkick").gain(0.8)' },
  { name: 'reverbkick', variations: 2, category: 'Kicks', description: 'Kick drums with natural reverb tail', tags: ['kick', 'reverb', 'room', 'ambient'], example: 's("reverbkick").gain(0.7)' },
  { name: 'kicklinn', variations: 2, category: 'Kicks', description: 'LinnDrum kick samples', tags: ['kick', 'linn', 'vintage', '80s'], example: 's("kicklinn").gain(0.8)' },

  /* --- Snares --- */
  { name: 'sd', variations: 12, category: 'Snares', description: 'Snare drum collection from classic machines', tags: ['snare', 'drum', 'backbeat'], example: 's("sd").gain(0.8)' },
  { name: 'sn', variations: 52, category: 'Snares', description: 'Extended snare collection with many timbres', tags: ['snare', 'drum', 'crisp', 'extended'], example: 's("sn").gain(0.8)' },
  { name: 'realclaps', variations: 4, category: 'Snares', description: 'Recorded real hand claps', tags: ['clap', 'real', 'hand', 'organic'], example: 's("realclaps").gain(0.8)' },
  { name: 'cp', variations: 2, category: 'Snares', description: 'Classic drum machine clap', tags: ['clap', 'drum', 'snare'], example: 's("cp").gain(0.8)' },
  { name: 'rim', variations: 4, category: 'Snares', description: 'Rimshot and cross-stick sounds', tags: ['rim', 'rimshot', 'snare', 'stick'], example: 's("rim").gain(0.8)' },

  /* --- Hi-Hats --- */
  { name: 'hh', variations: 13, category: 'Hi-Hats', description: 'Closed hi-hat samples', tags: ['hihat', 'hat', 'closed', 'drum'], example: 's("hh*8").gain(0.5)' },
  { name: 'hh27', variations: 13, category: 'Hi-Hats', description: 'Alternative hi-hat set with bright tone', tags: ['hihat', 'hat', 'bright', 'alternative'], example: 's("hh27*8").gain(0.5)' },
  { name: 'linnhats', variations: 6, category: 'Hi-Hats', description: 'LinnDrum hi-hat samples', tags: ['hihat', 'hat', 'linn', 'vintage'], example: 's("linnhats*8").gain(0.5)' },

  /* --- Cymbals --- */
  { name: 'oh', variations: 4, category: 'Cymbals', description: 'Open hi-hat with longer decay', tags: ['hihat', 'open', 'cymbal', 'sustain'], example: 's("oh").gain(0.6)' },
  { name: 'cr', variations: 6, category: 'Cymbals', description: 'Crash cymbal samples', tags: ['crash', 'cymbal', 'accent'], example: 's("cr").gain(0.5)' },
  { name: 'cb', variations: 2, category: 'Cymbals', description: 'Cowbell — classic percussion sound', tags: ['cowbell', 'bell', 'percussion', 'metal'], example: 's("cb").gain(0.6)' },

  /* --- Toms --- */
  { name: 'lt', variations: 4, category: 'Toms', description: 'Low tom drums', tags: ['tom', 'low', 'drum', 'deep'], example: 's("lt").gain(0.8)' },
  { name: 'mt', variations: 4, category: 'Toms', description: 'Mid tom drums', tags: ['tom', 'mid', 'drum'], example: 's("mt").gain(0.8)' },
  { name: 'ht', variations: 4, category: 'Toms', description: 'High tom drums', tags: ['tom', 'high', 'drum'], example: 's("ht").gain(0.8)' },

  /* --- Percussion --- */
  { name: 'clak', variations: 2, category: 'Percussion', description: 'Short clacking percussive hit', tags: ['clack', 'percussion', 'click', 'short'], example: 's("clak").gain(0.7)' },
  { name: 'perc', variations: 6, category: 'Percussion', description: 'General percussion hits', tags: ['percussion', 'hit', 'misc'], example: 's("perc").gain(0.7)' },
  { name: 'click', variations: 4, category: 'Percussion', description: 'Short click and tick sounds', tags: ['click', 'tick', 'percussion', 'short'], example: 's("click").gain(0.6)' },
  { name: 'stomp', variations: 2, category: 'Percussion', description: 'Foot stomp percussion sounds', tags: ['stomp', 'foot', 'percussion', 'body'], example: 's("stomp").gain(0.8)' },
  { name: 'hand', variations: 17, category: 'Percussion', description: 'Hand percussion — claps, taps, slaps', tags: ['hand', 'percussion', 'body', 'organic'], example: 's("hand").gain(0.7)' },
  { name: 'tink', variations: 5, category: 'Percussion', description: 'Tinkly high-pitched metallic sounds', tags: ['tink', 'metallic', 'high', 'bright'], example: 's("tink").gain(0.5)' },
  { name: 'tok', variations: 4, category: 'Percussion', description: 'Wooden tok percussion', tags: ['tok', 'wood', 'percussion', 'stick'], example: 's("tok").gain(0.7)' },
  { name: 'can', variations: 14, category: 'Percussion', description: 'Metallic can hits and strikes', tags: ['can', 'metal', 'percussion', 'hit'], example: 's("can").gain(0.6)' },
  { name: 'bottle', variations: 13, category: 'Percussion', description: 'Bottle percussion and resonances', tags: ['bottle', 'glass', 'percussion', 'resonance'], example: 's("bottle").gain(0.6)' },
  { name: 'wood', variations: 2, category: 'Percussion', description: 'Woodblock percussion sounds', tags: ['wood', 'block', 'percussion', 'acoustic'], example: 's("wood").gain(0.7)' },
  { name: 'shaker', variations: 2, category: 'Percussion', description: 'Shaker rhythm instrument', tags: ['shaker', 'percussion', 'groove', 'rhythm'], example: 's("shaker*8").gain(0.5)' },
  { name: 'tambourine', variations: 6, category: 'Percussion', description: 'Tambourine shakes and hits', tags: ['tambourine', 'jingle', 'percussion', 'shake'], example: 's("tambourine*4").gain(0.5)' },
  { name: 'triangle', variations: 3, category: 'Percussion', description: 'Triangle percussion instrument', tags: ['triangle', 'percussion', 'metallic', 'ding'], example: 's("triangle").gain(0.5)' },
  { name: 'chink', variations: 2, category: 'Percussion', description: 'Metallic chink percussion', tags: ['chink', 'metallic', 'percussion'], example: 's("chink").gain(0.6)' },
  { name: 'bev', variations: 2, category: 'Percussion', description: 'Beverage-related percussive sounds', tags: ['bev', 'glass', 'percussion'], example: 's("bev").gain(0.6)' },
  { name: 'crow', variations: 4, category: 'Percussion', description: 'Crotale-like metallic percussion', tags: ['crow', 'metallic', 'percussion', 'ring'], example: 's("crow").gain(0.5)' },

  /* --- 808 Kit --- */
  { name: '808', variations: 6, category: '808 Kit', description: 'Classic TR-808 drum machine sounds', tags: ['808', 'drum', 'machine', 'classic', 'roland'], example: 's("808").gain(0.8)' },
  { name: '808bd', variations: 4, category: '808 Kit', description: '808 bass drum — deep booming kick', tags: ['808', 'kick', 'bass', 'boom', 'deep'], example: 's("808bd").gain(0.8)' },
  { name: '808sd', variations: 2, category: '808 Kit', description: '808 snare drum — bright and snappy', tags: ['808', 'snare', 'bright', 'snap'], example: 's("808sd").gain(0.8)' },
  { name: '808hc', variations: 5, category: '808 Kit', description: '808 closed hi-hat', tags: ['808', 'hihat', 'closed', 'hat'], example: 's("808hc*8").gain(0.5)' },
  { name: '808ht', variations: 4, category: '808 Kit', description: '808 high tom', tags: ['808', 'tom', 'high'], example: 's("808ht").gain(0.7)' },
  { name: '808lt', variations: 4, category: '808 Kit', description: '808 low tom', tags: ['808', 'tom', 'low'], example: 's("808lt").gain(0.7)' },
  { name: '808mt', variations: 4, category: '808 Kit', description: '808 mid tom', tags: ['808', 'tom', 'mid'], example: 's("808mt").gain(0.7)' },
  { name: '808oh', variations: 4, category: '808 Kit', description: '808 open hi-hat', tags: ['808', 'hihat', 'open'], example: 's("808oh").gain(0.5)' },
  { name: '808cy', variations: 4, category: '808 Kit', description: '808 cymbal', tags: ['808', 'cymbal', 'crash'], example: 's("808cy").gain(0.5)' },
  { name: '808lc', variations: 4, category: '808 Kit', description: '808 low conga', tags: ['808', 'conga', 'low', 'percussion'], example: 's("808lc").gain(0.7)' },
  { name: '808mc', variations: 4, category: '808 Kit', description: '808 mid conga', tags: ['808', 'conga', 'mid', 'percussion'], example: 's("808mc").gain(0.7)' },
  { name: '808hc', variations: 5, category: '808 Kit', description: '808 high conga', tags: ['808', 'conga', 'high', 'percussion'], example: 's("808hc").gain(0.7)' },

  /* --- 909 Kit --- */
  { name: '909', variations: 1, category: '909 Kit', description: 'Classic TR-909 drum sounds', tags: ['909', 'drum', 'machine', 'techno', 'roland'], example: 's("909").gain(0.8)' },

  /* --- Drum Machines --- */
  { name: 'dr', variations: 42, category: 'Drum Machines', description: 'Mixed drum machine samples', tags: ['drum', 'machine', 'electronic', 'kit'], example: 's("dr").gain(0.7)' },
  { name: 'dr2', variations: 6, category: 'Drum Machines', description: 'Second drum machine collection', tags: ['drum', 'machine', 'electronic', 'kit'], example: 's("dr2").gain(0.7)' },
  { name: 'dr55', variations: 4, category: 'Drum Machines', description: 'Roland DR-55 Doctor Rhythm', tags: ['drum', 'machine', 'dr55', 'roland', 'vintage'], example: 's("dr55").gain(0.7)' },
  { name: 'dr_few', variations: 8, category: 'Drum Machines', description: 'Curated drum machine selection', tags: ['drum', 'machine', 'curated'], example: 's("dr_few").gain(0.7)' },
  { name: 'drum', variations: 6, category: 'Drum Machines', description: 'Generic drum samples', tags: ['drum', 'generic', 'kit'], example: 's("drum").gain(0.7)' },
  { name: 'drumtraks', variations: 13, category: 'Drum Machines', description: 'Sequential Drumtraks samples', tags: ['drum', 'drumtraks', 'sequential', 'vintage'], example: 's("drumtraks").gain(0.7)' },
  { name: 'gretsch', variations: 24, category: 'Drum Machines', description: 'Gretsch acoustic drum kit samples', tags: ['drum', 'gretsch', 'acoustic', 'kit'], example: 's("gretsch").gain(0.7)' },
  { name: 'electro1', variations: 13, category: 'Drum Machines', description: 'Electro drum hits', tags: ['electro', 'drum', 'electronic', 'hit'], example: 's("electro1").gain(0.7)' },
  { name: 'tech', variations: 13, category: 'Drum Machines', description: 'Techno-oriented drum sounds', tags: ['techno', 'drum', 'electronic'], example: 's("tech").gain(0.7)' },
  { name: 'house', variations: 8, category: 'Drum Machines', description: 'House music drum kit', tags: ['house', 'drum', 'dance', '4x4'], example: 's("house").gain(0.7)' },
  { name: 'miniyou', variations: 11, category: 'Drum Machines', description: 'MiniYou drum samples', tags: ['drum', 'machine', 'miniyou'], example: 's("miniyou").gain(0.7)' },

  /* --- Bass --- */
  { name: 'bass', variations: 4, category: 'Bass', description: 'General bass samples', tags: ['bass', 'low', 'deep'], example: 's("bass").gain(0.8)' },
  { name: 'bass0', variations: 3, category: 'Bass', description: 'Bass set 0 — clean and round', tags: ['bass', 'clean', 'round'], example: 's("bass0").gain(0.8)' },
  { name: 'bass1', variations: 30, category: 'Bass', description: 'Bass set 1 — extended bass library', tags: ['bass', 'extended', 'deep'], example: 's("bass1").gain(0.8)' },
  { name: 'bass2', variations: 5, category: 'Bass', description: 'Bass set 2 — synth bass tones', tags: ['bass', 'synth', 'electronic'], example: 's("bass2").gain(0.8)' },
  { name: 'bass3', variations: 11, category: 'Bass', description: 'Bass set 3 — dark sub frequencies', tags: ['bass', 'sub', 'dark', 'deep'], example: 's("bass3").gain(0.8)' },
  { name: 'bassdm', variations: 24, category: 'Bass', description: 'Bass drum machine — bass-heavy kicks', tags: ['bass', 'drum', 'kick', 'heavy'], example: 's("bassdm").gain(0.8)' },
  { name: 'bassfoo', variations: 3, category: 'Bass', description: 'Foobar bass — experimental bass sounds', tags: ['bass', 'experimental', 'weird'], example: 's("bassfoo").gain(0.8)' },
  { name: 'jvbass', variations: 13, category: 'Bass', description: 'JV-series synthesizer bass', tags: ['bass', 'jv', 'synth', 'roland'], example: 's("jvbass").gain(0.8)' },
  { name: 'jungbass', variations: 20, category: 'Bass', description: 'Jungle and DnB bass sounds', tags: ['bass', 'jungle', 'dnb', 'reese'], example: 's("jungbass").gain(0.8)' },

  /* --- Synth & Keys --- */
  { name: 'arpy', variations: 11, category: 'Synth & Keys', description: 'Arpeggiated synth tones', tags: ['arp', 'synth', 'melodic', 'bright'], example: 's("arpy").gain(0.6)' },
  { name: 'casio', variations: 3, category: 'Synth & Keys', description: 'Casio keyboard sounds', tags: ['casio', 'keyboard', 'retro', 'lo-fi'], example: 's("casio").gain(0.6)' },
  { name: 'juno', variations: 12, category: 'Synth & Keys', description: 'Roland Juno synthesizer patches', tags: ['juno', 'synth', 'roland', 'analog', 'pad'], example: 's("juno").gain(0.6)' },
  { name: 'moog', variations: 7, category: 'Synth & Keys', description: 'Moog synthesizer sounds', tags: ['moog', 'synth', 'analog', 'fat', 'warm'], example: 's("moog").gain(0.6)' },
  { name: 'fm', variations: 17, category: 'Synth & Keys', description: 'FM synthesis tones and textures', tags: ['fm', 'synth', 'digital', 'bell', 'dx7'], example: 's("fm").gain(0.6)' },
  { name: 'pad', variations: 4, category: 'Synth & Keys', description: 'Sustained pad sounds for atmosphere', tags: ['pad', 'synth', 'atmosphere', 'sustained'], example: 's("pad").gain(0.5).slow(2)' },
  { name: 'padlong', variations: 4, category: 'Synth & Keys', description: 'Extra-long evolving pad textures', tags: ['pad', 'long', 'evolving', 'ambient'], example: 's("padlong").gain(0.4).slow(4)' },
  { name: 'pluck', variations: 4, category: 'Synth & Keys', description: 'Plucked synth tones', tags: ['pluck', 'synth', 'string', 'short'], example: 's("pluck").gain(0.6)' },
  { name: 'supersquare', variations: 4, category: 'Synth & Keys', description: 'Super-wide detuned square wave', tags: ['square', 'synth', 'wide', 'detuned', 'supersaw'], example: 's("supersquare").gain(0.5)' },
  { name: 'supersaw', variations: 4, category: 'Synth & Keys', description: 'Thick detuned supersaw synth', tags: ['supersaw', 'synth', 'detuned', 'trance', 'wide'], example: 's("supersaw").gain(0.5)' },
  { name: 'sine', variations: 6, category: 'Synth & Keys', description: 'Pure sine wave tones', tags: ['sine', 'pure', 'clean', 'simple'], example: 's("sine").gain(0.5)' },
  { name: 'square', variations: 6, category: 'Synth & Keys', description: 'Square wave tones — hollow and retro', tags: ['square', 'retro', 'hollow', 'chiptune'], example: 's("square").gain(0.5)' },
  { name: 'saw', variations: 4, category: 'Synth & Keys', description: 'Raw sawtooth wave tones', tags: ['sawtooth', 'raw', 'bright', 'buzz'], example: 's("saw").gain(0.5)' },
  { name: 'piano', variations: 24, category: 'Synth & Keys', description: 'Acoustic piano multisamples', tags: ['piano', 'acoustic', 'keys', 'classical'], example: 's("piano").gain(0.6)' },
  { name: 'rhodey', variations: 4, category: 'Synth & Keys', description: 'Rhodes electric piano tones', tags: ['rhodes', 'electric', 'piano', 'warm'], example: 's("rhodey").gain(0.6)' },
  { name: 'ep', variations: 12, category: 'Synth & Keys', description: 'Electric piano samples', tags: ['electric', 'piano', 'ep', 'keys'], example: 's("ep").gain(0.6)' },
  { name: 'organ', variations: 4, category: 'Synth & Keys', description: 'Organ tones — church and Hammond', tags: ['organ', 'keys', 'church', 'hammond'], example: 's("organ").gain(0.5)' },

  /* --- Guitar & Strings --- */
  { name: 'gtr', variations: 8, category: 'Guitar & Strings', description: 'Electric guitar samples', tags: ['guitar', 'electric', 'strings', 'rock'], example: 's("gtr").gain(0.6)' },
  { name: 'sitar', variations: 8, category: 'Guitar & Strings', description: 'Sitar — Indian stringed instrument', tags: ['sitar', 'indian', 'strings', 'world'], example: 's("sitar").gain(0.6)' },
  { name: 'harp', variations: 4, category: 'Guitar & Strings', description: 'Harp glissando and pluck sounds', tags: ['harp', 'strings', 'pluck', 'classical'], example: 's("harp").gain(0.6)' },
  { name: 'flbass', variations: 4, category: 'Guitar & Strings', description: 'Fretless bass guitar', tags: ['bass', 'guitar', 'fretless', 'smooth'], example: 's("flbass").gain(0.7)' },

  /* --- Wind & Brass --- */
  { name: 'sax', variations: 22, category: 'Wind & Brass', description: 'Saxophone samples — alto to baritone', tags: ['sax', 'saxophone', 'wind', 'jazz', 'brass'], example: 's("sax").gain(0.6)' },
  { name: 'flute', variations: 4, category: 'Wind & Brass', description: 'Flute instrument samples', tags: ['flute', 'wind', 'woodwind', 'classical'], example: 's("flute").gain(0.6)' },

  /* --- Vocals & Speech --- */
  { name: 'mouth', variations: 15, category: 'Vocals & Speech', description: 'Vocal mouth sounds and beatbox', tags: ['mouth', 'vocal', 'beatbox', 'human'], example: 's("mouth").gain(0.7)' },
  { name: 'speech', variations: 7, category: 'Vocals & Speech', description: 'Spoken word speech samples', tags: ['speech', 'voice', 'spoken', 'word'], example: 's("speech").gain(0.7)' },
  { name: 'speechless', variations: 10, category: 'Vocals & Speech', description: 'Processed vocal textures without words', tags: ['vocal', 'texture', 'processed', 'ambient'], example: 's("speechless").gain(0.6)' },
  { name: 'speakspell', variations: 12, category: 'Vocals & Speech', description: 'Texas Instruments Speak & Spell toy sounds', tags: ['speakspell', 'retro', 'toy', 'speech', 'lo-fi'], example: 's("speakspell").gain(0.6)' },
  { name: 'diphone', variations: 38, category: 'Vocals & Speech', description: 'Diphone vocal synthesis fragments', tags: ['diphone', 'vocal', 'synthesis', 'phoneme'], example: 's("diphone").gain(0.7)' },
  { name: 'diphone2', variations: 12, category: 'Vocals & Speech', description: 'Second diphone vocal set', tags: ['diphone', 'vocal', 'synthesis', 'phoneme'], example: 's("diphone2").gain(0.7)' },
  { name: 'alphabet', variations: 26, category: 'Vocals & Speech', description: 'Spoken alphabet letters A-Z', tags: ['alphabet', 'letters', 'speech', 'voice'], example: 's("alphabet").gain(0.7)' },
  { name: 'numbers', variations: 9, category: 'Vocals & Speech', description: 'Spoken number recordings', tags: ['numbers', 'speech', 'voice', 'counting'], example: 's("numbers").gain(0.7)' },
  { name: 'voice', variations: 6, category: 'Vocals & Speech', description: 'Vocal samples and phrases', tags: ['voice', 'vocal', 'human', 'sample'], example: 's("voice").gain(0.6)' },
  { name: 'chin', variations: 4, category: 'Vocals & Speech', description: 'Chinese vocal and speech samples', tags: ['chinese', 'vocal', 'world', 'speech'], example: 's("chin").gain(0.6)' },

  /* --- Noise & FX --- */
  { name: 'noise', variations: 2, category: 'Noise & FX', description: 'White and pink noise', tags: ['noise', 'white', 'pink', 'static'], example: 's("noise").gain(0.3)' },
  { name: 'noise2', variations: 8, category: 'Noise & FX', description: 'Colored noise textures', tags: ['noise', 'texture', 'colored', 'ambient'], example: 's("noise2").gain(0.3)' },
  { name: 'glitch', variations: 8, category: 'Noise & FX', description: 'Digital glitch and artifact sounds', tags: ['glitch', 'digital', 'error', 'artifact'], example: 's("glitch").gain(0.5)' },
  { name: 'glitch2', variations: 8, category: 'Noise & FX', description: 'More digital glitch textures', tags: ['glitch', 'digital', 'broken', 'fx'], example: 's("glitch2").gain(0.5)' },
  { name: 'dist', variations: 16, category: 'Noise & FX', description: 'Distortion and overdrive sounds', tags: ['distortion', 'overdrive', 'crunch', 'fx'], example: 's("dist").gain(0.5)' },
  { name: 'industrial', variations: 32, category: 'Noise & FX', description: 'Industrial noise and metallic textures', tags: ['industrial', 'noise', 'metal', 'harsh'], example: 's("industrial").gain(0.5)' },
  { name: 'bin', variations: 2, category: 'Noise & FX', description: 'Binary/digital bleeps', tags: ['binary', 'digital', 'bleep', 'data'], example: 's("bin").gain(0.5)' },
  { name: 'control', variations: 2, category: 'Noise & FX', description: 'Control signal tones', tags: ['control', 'signal', 'tone', 'test'], example: 's("control").gain(0.4)' },
  { name: 'msg', variations: 8, category: 'Noise & FX', description: 'Message/notification sounds', tags: ['message', 'notification', 'alert', 'ui'], example: 's("msg").gain(0.5)' },
  { name: 'proc', variations: 2, category: 'Noise & FX', description: 'Processed and manipulated sounds', tags: ['processed', 'fx', 'manipulation', 'abstract'], example: 's("proc").gain(0.5)' },
  { name: 'ab', variations: 12, category: 'Noise & FX', description: 'Abstract sound design elements', tags: ['abstract', 'fx', 'sound', 'design'], example: 's("ab").gain(0.5)' },
  { name: 'cosmicg', variations: 15, category: 'Noise & FX', description: 'Cosmic and space-like sound effects', tags: ['cosmic', 'space', 'fx', 'sci-fi'], example: 's("cosmicg").gain(0.5)' },
  { name: 'feel', variations: 7, category: 'Noise & FX', description: 'Textural feel and atmosphere', tags: ['feel', 'texture', 'atmosphere', 'fx'], example: 's("feel").gain(0.5)' },
  { name: 'future', variations: 17, category: 'Noise & FX', description: 'Futuristic sound effects', tags: ['future', 'sci-fi', 'fx', 'electronic'], example: 's("future").gain(0.5)' },
  { name: 'if', variations: 5, category: 'Noise & FX', description: 'Interface and UI sounds', tags: ['interface', 'ui', 'digital', 'clean'], example: 's("if").gain(0.5)' },

  /* --- Nature & Ambient --- */
  { name: 'birds', variations: 10, category: 'Nature & Ambient', description: 'Bird song and chirp recordings', tags: ['birds', 'nature', 'chirp', 'ambient'], example: 's("birds").gain(0.5)' },
  { name: 'birds3', variations: 19, category: 'Nature & Ambient', description: 'Extended bird recordings', tags: ['birds', 'nature', 'wildlife', 'ambient'], example: 's("birds3").gain(0.5)' },
  { name: 'insect', variations: 3, category: 'Nature & Ambient', description: 'Insect and cricket recordings', tags: ['insect', 'cricket', 'nature', 'buzz'], example: 's("insect").gain(0.5)' },
  { name: 'wind', variations: 10, category: 'Nature & Ambient', description: 'Wind recordings of various intensities', tags: ['wind', 'nature', 'air', 'ambient'], example: 's("wind").gain(0.5)' },
  { name: 'bubble', variations: 8, category: 'Nature & Ambient', description: 'Water bubble and drip sounds', tags: ['bubble', 'water', 'drip', 'liquid'], example: 's("bubble").gain(0.5)' },
  { name: 'fire', variations: 3, category: 'Nature & Ambient', description: 'Crackling fire and flame sounds', tags: ['fire', 'crackle', 'flame', 'warm'], example: 's("fire").gain(0.5)' },
  { name: 'outdoor', variations: 6, category: 'Nature & Ambient', description: 'Outdoor environmental ambience', tags: ['outdoor', 'ambience', 'nature', 'field'], example: 's("outdoor").gain(0.5)' },
  { name: 'ocean', variations: 11, category: 'Nature & Ambient', description: 'Ocean waves and sea ambience', tags: ['ocean', 'waves', 'sea', 'water'], example: 's("ocean").gain(0.5)' },
  { name: 'amencutup', variations: 32, category: 'Nature & Ambient', description: 'Nature-processed ambient textures', tags: ['ambient', 'texture', 'processed', 'natural'], example: 's("amencutup").gain(0.5)' },

  /* --- Breaks & Loops --- */
  { name: 'breaks125', variations: 2, category: 'Breaks & Loops', description: 'Breakbeat loops at 125 BPM', tags: ['breaks', 'loop', 'breakbeat', '125bpm'], example: 's("breaks125").gain(0.7)' },
  { name: 'breaks152', variations: 2, category: 'Breaks & Loops', description: 'Breakbeat loops at 152 BPM', tags: ['breaks', 'loop', 'breakbeat', '152bpm'], example: 's("breaks152").gain(0.7)' },
  { name: 'breaks157', variations: 2, category: 'Breaks & Loops', description: 'Breakbeat loops at 157 BPM', tags: ['breaks', 'loop', 'breakbeat', '157bpm'], example: 's("breaks157").gain(0.7)' },
  { name: 'breaks165', variations: 2, category: 'Breaks & Loops', description: 'Breakbeat loops at 165 BPM', tags: ['breaks', 'loop', 'breakbeat', '165bpm'], example: 's("breaks165").gain(0.7)' },
  { name: 'jungle', variations: 13, category: 'Breaks & Loops', description: 'Jungle and drum & bass breaks', tags: ['jungle', 'dnb', 'breaks', 'fast'], example: 's("jungle").gain(0.7)' },
  { name: 'amen', variations: 8, category: 'Breaks & Loops', description: 'Amen break chops — the classic breakbeat', tags: ['amen', 'break', 'classic', 'chopped'], example: 's("amen").gain(0.7)' },
  { name: 'amenbreak', variations: 4, category: 'Breaks & Loops', description: 'Full amen breakbeat samples', tags: ['amen', 'break', 'full', 'loop'], example: 's("amenbreak").gain(0.7)' },

  /* --- Rave & Hardcore --- */
  { name: 'rave', variations: 8, category: 'Rave & Hardcore', description: 'Rave stab and chord hits', tags: ['rave', 'stab', 'chord', 'dance'], example: 's("rave").gain(0.6)' },
  { name: 'rave2', variations: 4, category: 'Rave & Hardcore', description: 'More rave stab variations', tags: ['rave', 'stab', 'dance', 'electronic'], example: 's("rave2").gain(0.6)' },
  { name: 'ravemono', variations: 2, category: 'Rave & Hardcore', description: 'Mono rave stabs for cleaner mixes', tags: ['rave', 'mono', 'stab', 'clean'], example: 's("ravemono").gain(0.6)' },
  { name: 'gabba', variations: 4, category: 'Rave & Hardcore', description: 'Gabber kick drums — hard and distorted', tags: ['gabba', 'kick', 'hard', 'distorted'], example: 's("gabba").gain(0.7)' },
  { name: 'gabbaloud', variations: 4, category: 'Rave & Hardcore', description: 'Louder gabber kicks with more drive', tags: ['gabba', 'loud', 'kick', 'extreme'], example: 's("gabbaloud").gain(0.6)' },
  { name: 'gabbalouder', variations: 4, category: 'Rave & Hardcore', description: 'Maximum distortion gabber kicks', tags: ['gabba', 'loudest', 'extreme', 'distorted'], example: 's("gabbalouder").gain(0.5)' },
  { name: 'hardcore', variations: 12, category: 'Rave & Hardcore', description: 'Hardcore techno sounds and hits', tags: ['hardcore', 'techno', 'hard', 'rave'], example: 's("hardcore").gain(0.6)' },
  { name: 'hoover', variations: 4, category: 'Rave & Hardcore', description: 'Hoover bass — classic rave mentasm', tags: ['hoover', 'mentasm', 'rave', 'bass', 'classic'], example: 's("hoover").gain(0.6)' },

  /* --- World Music --- */
  { name: 'tabla', variations: 26, category: 'World Music', description: 'Indian tabla drum — paired set', tags: ['tabla', 'indian', 'percussion', 'world'], example: 's("tabla").gain(0.7)' },
  { name: 'tabla2', variations: 46, category: 'World Music', description: 'Extended tabla sample collection', tags: ['tabla', 'indian', 'percussion', 'extended'], example: 's("tabla2").gain(0.7)' },
  { name: 'tablex', variations: 3, category: 'World Music', description: 'Experimental tabla processing', tags: ['tabla', 'experimental', 'processed', 'world'], example: 's("tablex").gain(0.7)' },
  { name: 'world', variations: 3, category: 'World Music', description: 'World music percussion and instruments', tags: ['world', 'ethnic', 'percussion', 'global'], example: 's("world").gain(0.7)' },
  { name: 'east', variations: 9, category: 'World Music', description: 'East Asian musical elements', tags: ['east', 'asian', 'oriental', 'world'], example: 's("east").gain(0.6)' },
  { name: 'latibro', variations: 12, category: 'World Music', description: 'Latin percussion and rhythms', tags: ['latin', 'percussion', 'rhythm', 'tropical'], example: 's("latibro").gain(0.7)' },
  { name: 'jazz', variations: 8, category: 'World Music', description: 'Jazz instrument samples', tags: ['jazz', 'swing', 'blues', 'acoustic'], example: 's("jazz").gain(0.6)' },

  /* --- Retro & Games --- */
  { name: 'invaders', variations: 18, category: 'Retro & Games', description: 'Space Invaders game sounds', tags: ['invaders', 'game', 'retro', 'arcade', '8bit'], example: 's("invaders").gain(0.5)' },
  { name: 'sid', variations: 12, category: 'Retro & Games', description: 'Commodore 64 SID chip sounds', tags: ['sid', 'c64', 'chiptune', 'retro', '8bit'], example: 's("sid").gain(0.5)' },
  { name: 'subroc3d', variations: 11, category: 'Retro & Games', description: 'SubRoc 3D arcade game samples', tags: ['subroc', 'arcade', 'game', 'retro'], example: 's("subroc3d").gain(0.5)' },
  { name: 'tacscan', variations: 11, category: 'Retro & Games', description: 'Tac/Scan arcade game sounds', tags: ['tacscan', 'arcade', 'game', 'retro'], example: 's("tacscan").gain(0.5)' },
  { name: 'space', variations: 18, category: 'Retro & Games', description: 'Space-themed retro sounds', tags: ['space', 'retro', 'sci-fi', 'cosmic'], example: 's("space").gain(0.5)' },
  { name: 'blip', variations: 13, category: 'Retro & Games', description: 'Digital blip and bloop sounds', tags: ['blip', 'bloop', 'digital', 'retro', '8bit'], example: 's("blip").gain(0.5)' },

  /* --- Stabs & Hits --- */
  { name: 'stab', variations: 23, category: 'Stabs & Hits', description: 'Synth and orchestra stab hits', tags: ['stab', 'hit', 'chord', 'accent'], example: 's("stab").gain(0.6)' },
  { name: 'hit', variations: 6, category: 'Stabs & Hits', description: 'Impact hit sound effects', tags: ['hit', 'impact', 'fx', 'accent'], example: 's("hit").gain(0.6)' },

  /* --- Misc --- */
  { name: 'coins', variations: 4, category: 'Misc', description: 'Coin drop and jingle sounds', tags: ['coins', 'money', 'jingle', 'metallic'], example: 's("coins").gain(0.6)' },
  { name: 'pebbles', variations: 2, category: 'Misc', description: 'Pebble and stone textures', tags: ['pebbles', 'stone', 'natural', 'texture'], example: 's("pebbles").gain(0.6)' },
  { name: 'lighter', variations: 33, category: 'Misc', description: 'Lighter click and flame sounds', tags: ['lighter', 'click', 'flame', 'fire'], example: 's("lighter").gain(0.6)' },
  { name: 'mute', variations: 28, category: 'Misc', description: 'Muted and dampened instrument sounds', tags: ['mute', 'dampened', 'soft', 'quiet'], example: 's("mute").gain(0.6)' },
  { name: 'bend', variations: 4, category: 'Misc', description: 'Pitch bend and sweep sounds', tags: ['bend', 'pitch', 'sweep', 'fx'], example: 's("bend").gain(0.6)' },
  { name: 'clock', variations: 4, category: 'Misc', description: 'Clock tick and chime recordings', tags: ['clock', 'tick', 'chime', 'time'], example: 's("clock").gain(0.5)' },
  { name: 'cosmicg', variations: 15, category: 'Misc', description: 'Cosmic granular textures', tags: ['cosmic', 'granular', 'texture', 'space'], example: 's("cosmicg").gain(0.5)' },
  { name: 'co', variations: 4, category: 'Misc', description: 'Miscellaneous short sounds', tags: ['misc', 'short', 'sound'], example: 's("co").gain(0.6)' },
  { name: 'd', variations: 4, category: 'Misc', description: 'D-series sample pack', tags: ['misc', 'sample', 'pack'], example: 's("d").gain(0.6)' },
  { name: 'e', variations: 8, category: 'Misc', description: 'E-series sample pack', tags: ['misc', 'sample', 'electronic'], example: 's("e").gain(0.6)' },
  { name: 'f', variations: 1, category: 'Misc', description: 'F-series single sample', tags: ['misc', 'sample'], example: 's("f").gain(0.6)' },
  { name: 'h', variations: 7, category: 'Misc', description: 'H-series sample pack', tags: ['misc', 'sample', 'varied'], example: 's("h").gain(0.6)' },
  { name: 'kurt', variations: 7, category: 'Misc', description: 'Kurt — glitchy processed samples', tags: ['kurt', 'glitch', 'processed', 'experimental'], example: 's("kurt").gain(0.5)' },
  { name: 'latibro', variations: 12, category: 'Misc', description: 'Latin brother percussion set', tags: ['latin', 'percussion', 'brother'], example: 's("latibro").gain(0.6)' },
  { name: 'less', variations: 4, category: 'Misc', description: 'Minimal and subtle samples', tags: ['minimal', 'subtle', 'quiet', 'less'], example: 's("less").gain(0.6)' },
  { name: 'made', variations: 7, category: 'Misc', description: 'Handmade and crafted sounds', tags: ['made', 'crafted', 'unique'], example: 's("made").gain(0.6)' },
  { name: 'made2', variations: 3, category: 'Misc', description: 'Second handmade sound collection', tags: ['made', 'crafted', 'version2'], example: 's("made2").gain(0.6)' },
  { name: 'metal', variations: 10, category: 'Misc', description: 'Metal object strikes and resonances', tags: ['metal', 'strike', 'resonance', 'industrial'], example: 's("metal").gain(0.5)' },
  { name: 'monsterb', variations: 6, category: 'Misc', description: 'Monster bass and creature sounds', tags: ['monster', 'bass', 'creature', 'big'], example: 's("monsterb").gain(0.6)' },
  { name: 'n', variations: 1, category: 'Misc', description: 'N-series single sample', tags: ['misc', 'sample', 'single'], example: 's("n").gain(0.6)' },
  { name: 'notes', variations: 15, category: 'Misc', description: 'Musical note samples at various pitches', tags: ['notes', 'musical', 'pitched', 'tonal'], example: 's("notes").gain(0.6)' },
  { name: 'newnotes', variations: 15, category: 'Misc', description: 'Updated musical note collection', tags: ['notes', 'new', 'musical', 'pitched'], example: 's("newnotes").gain(0.6)' },
  { name: 'pads', variations: 4, category: 'Misc', description: 'Pad textures for layering', tags: ['pads', 'texture', 'layer', 'ambient'], example: 's("pads").gain(0.5)' },
  { name: 'peri', variations: 15, category: 'Misc', description: 'Peristyle percussion recordings', tags: ['peri', 'percussion', 'acoustic', 'recording'], example: 's("peri").gain(0.6)' },
  { name: 'popkick', variations: 2, category: 'Misc', description: 'Pop-style kick drum', tags: ['pop', 'kick', 'clean', 'modern'], example: 's("popkick").gain(0.7)' },
  { name: 'print', variations: 11, category: 'Misc', description: 'Printer and mechanical sounds', tags: ['print', 'mechanical', 'machine', 'office'], example: 's("print").gain(0.5)' },
  { name: 'reverbkick', variations: 2, category: 'Misc', description: 'Kick with reverb tail', tags: ['kick', 'reverb', 'room', 'tail'], example: 's("reverbkick").gain(0.7)' },
  { name: 'rs', variations: 2, category: 'Misc', description: 'Rimshot percussion', tags: ['rimshot', 'percussion', 'snap'], example: 's("rs").gain(0.7)' },
  { name: 'sf', variations: 18, category: 'Misc', description: 'Soundfont instrument samples', tags: ['soundfont', 'instrument', 'general', 'midi'], example: 's("sf").gain(0.6)' },
  { name: 'sheffield', variations: 1, category: 'Misc', description: 'Sheffield industrial ambience', tags: ['sheffield', 'industrial', 'ambient', 'city'], example: 's("sheffield").gain(0.5)' },
  { name: 'short', variations: 5, category: 'Misc', description: 'Ultra-short percussive hits', tags: ['short', 'percussive', 'quick', 'snap'], example: 's("short").gain(0.7)' },
  { name: 'sine', variations: 6, category: 'Misc', description: 'Pure sine wave tones', tags: ['sine', 'tone', 'pure', 'clean'], example: 's("sine").gain(0.5)' },
  { name: 'sugar', variations: 2, category: 'Misc', description: 'Sweet bright percussive sounds', tags: ['sugar', 'bright', 'sweet', 'clean'], example: 's("sugar").gain(0.6)' },
  { name: 'ul', variations: 10, category: 'Misc', description: 'Ultra-low frequency content', tags: ['ultra', 'low', 'sub', 'bass'], example: 's("ul").gain(0.6)' },
  { name: 'ulgab', variations: 5, category: 'Misc', description: 'Ultra gabba distorted kicks', tags: ['ultra', 'gabba', 'distorted', 'extreme'], example: 's("ulgab").gain(0.5)' },
  { name: 'uxay', variations: 3, category: 'Misc', description: 'UX-inspired interface sounds', tags: ['ux', 'interface', 'digital', 'ui'], example: 's("uxay").gain(0.5)' },
  { name: 'v', variations: 6, category: 'Misc', description: 'V-series sample pack', tags: ['misc', 'sample', 'varied'], example: 's("v").gain(0.6)' },
  { name: 'voodoo', variations: 5, category: 'Misc', description: 'Voodoo-themed percussion', tags: ['voodoo', 'percussion', 'tribal', 'dark'], example: 's("voodoo").gain(0.6)' },
  { name: 'wobble', variations: 1, category: 'Misc', description: 'Wobble bass and vibrato sounds', tags: ['wobble', 'bass', 'vibrato', 'dubstep'], example: 's("wobble").gain(0.6)' },
  { name: 'xmas', variations: 4, category: 'Misc', description: 'Christmas bells and seasonal sounds', tags: ['christmas', 'bells', 'seasonal', 'festive'], example: 's("xmas").gain(0.5)' },
];

/* ── Generate variation entries for base samples with 3+ variations ── */
function generateVariations(baseSamples: typeof BASE_SAMPLES): SampleEntry[] {
  const variations: SampleEntry[] = [];

  for (const sample of baseSamples) {
    /* Only expand samples with multiple variations to keep total manageable */
    if (sample.variations >= 3) {
      const count = Math.min(sample.variations, 24);
      for (let i = 0; i < count; i++) {
        variations.push({
          name: `${sample.name}:${i}`,
          variations: 1,
          category: sample.category,
          description: `${sample.name} variation ${i} — individual hit from the ${sample.name} sample bank`,
          tags: [...sample.tags, 'variation', `v${i}`],
          example: `s("${sample.name}:${i}").gain(0.8)`,
          isVariation: true,
          parentSample: sample.name,
        });
      }
    }
  }

  return variations;
}

/* ── Build full library — base samples + variation entries ── */
const variationEntries = generateVariations(BASE_SAMPLES);

/** Complete sample library — base entries as SampleEntry */
export const SAMPLE_LIBRARY: SampleEntry[] = [
  ...BASE_SAMPLES.map(s => ({ ...s, isVariation: false } as SampleEntry)),
  ...variationEntries,
];

/** All unique category names sorted */
export const SAMPLE_CATEGORIES: string[] = [
  'Kicks',
  'Snares',
  'Hi-Hats',
  'Cymbals',
  'Toms',
  'Percussion',
  '808 Kit',
  '909 Kit',
  'Drum Machines',
  'Bass',
  'Synth & Keys',
  'Guitar & Strings',
  'Wind & Brass',
  'Vocals & Speech',
  'Noise & FX',
  'Nature & Ambient',
  'Breaks & Loops',
  'Rave & Hardcore',
  'World Music',
  'Retro & Games',
  'Stabs & Hits',
  'Misc',
];

/** Get count of entries per category (base samples only) */
export function getCategoryCounts(): Record<string, number> {
  const counts: Record<string, number> = {};
  for (const cat of SAMPLE_CATEGORIES) {
    counts[cat] = SAMPLE_LIBRARY.filter(s => s.category === cat && !s.isVariation).length;
  }
  return counts;
}

/** Total entry count for display */
export const TOTAL_SAMPLE_COUNT = SAMPLE_LIBRARY.length;
export const BASE_SAMPLE_COUNT = BASE_SAMPLES.length;
