/* SPDX-License-Identifier: MIT
   Copyright (c) 2026 Arnold Wender / Wender Media
   ──────────────────────────────────────────────────────────
   Sample import — loads audio files from local disk into the
   Strudel sample registry so they can be used in patterns.
   Supports WAV, MP3, OGG, FLAC, AAC, M4A.
   ────────────────────────────────────────────────────────── */

/** Accepted audio MIME types */
const AUDIO_TYPES = new Set([
  'audio/wav', 'audio/x-wav', 'audio/wave',
  'audio/mp3', 'audio/mpeg',
  'audio/ogg', 'audio/vorbis',
  'audio/flac',
  'audio/aac', 'audio/mp4', 'audio/x-m4a',
  'audio/webm',
]);

/** Accepted file extensions */
const AUDIO_EXTENSIONS = /\.(wav|mp3|ogg|flac|aac|m4a|webm)$/i;

/** Imported sample names for UI display */
const importedSamples: string[] = [];

/** Get list of imported sample names */
export function getImportedSamples(): string[] {
  return [...importedSamples];
}

/**
 * Import audio files into the Strudel sample registry.
 * Files become available as `s("filename")` in patterns.
 */
export async function importSampleFiles(files: FileList | File[]): Promise<string[]> {
  const names: string[] = [];

  for (const file of Array.from(files)) {
    /* Validate audio type */
    if (!AUDIO_TYPES.has(file.type) && !AUDIO_EXTENSIONS.test(file.name)) {
      console.warn(`[SampleImport] Skipping non-audio file: ${file.name}`);
      continue;
    }

    /* Strip extension for the sample name */
    const name = file.name.replace(/\.[^.]+$/, '')
      .replace(/[^a-zA-Z0-9_-]/g, '_')
      .toLowerCase();

    try {
      /* Read file as ArrayBuffer → create object URL */
      const url = URL.createObjectURL(file);

      /* Register with Strudel's sample system via REPL evaluate */
      const repl = (window as any).__strudelRepl;
      if (repl) {
        await repl.evaluate(
          `samples({ ${name}: [{ url: '${url}' }] })`,
          false, /* don't autoplay */
        );
        names.push(name);
        if (!importedSamples.includes(name)) {
          importedSamples.push(name);
        }
        console.log(`[SampleImport] Loaded: ${name} (${file.name})`);
      } else {
        console.error('[SampleImport] Strudel REPL not available');
      }
    } catch (err) {
      console.error(`[SampleImport] Failed to load ${file.name}:`, err);
    }
  }

  return names;
}

/** Check if a File is a valid audio file */
export function isAudioFile(file: File): boolean {
  return AUDIO_TYPES.has(file.type) || AUDIO_EXTENSIONS.test(file.name);
}
