/* ──────────────────────────────────────────────────────────
   URL sharing — encode/decode project snippets into
   URL-safe compressed hashes via lz-string.
   ────────────────────────────────────────────────────────── */

import { compressToEncodedURIComponent, decompressFromEncodedURIComponent } from 'lz-string';
import type { EngineType } from '../../types/engine';

/** Valid engine identifiers — used to validate URL-decoded data */
const VALID_ENGINES: readonly EngineType[] = ['strudel', 'tonejs', 'webaudio', 'midi'] as const;

/** Data structure for URL-shared code snippets */
export interface UrlShareData {
  code: string;
  bpm: number;
  engine: EngineType;
}

/** Encode share data to a URL-safe compressed string */
export function encodeToUrl(data: UrlShareData): string {
  const json = JSON.stringify(data);
  return compressToEncodedURIComponent(json);
}

/** Decode a compressed string back to share data. Returns null on failure. */
export function decodeFromUrl(hash: string): UrlShareData | null {
  try {
    const json = decompressFromEncodedURIComponent(hash);
    if (!json) return null;
    const parsed = JSON.parse(json);
    if (!parsed.code && parsed.code !== '') return null;
    /* Validate engine is a known EngineType — fall back to strudel for unknown values */
    const engine: EngineType = VALID_ENGINES.includes(parsed.engine)
      ? parsed.engine
      : 'strudel';
    return {
      code: parsed.code ?? '',
      bpm: parsed.bpm ?? 120,
      engine,
    };
  } catch {
    return null;
  }
}

/** Generate a full shareable URL with #code= hash */
export function generateShareUrl(data: UrlShareData): string {
  const hash = encodeToUrl(data);
  return `${window.location.origin}${window.location.pathname}#code=${hash}`;
}

/** Read share data from current URL hash */
export function readShareFromUrl(): UrlShareData | null {
  const hash = window.location.hash;
  if (!hash.startsWith('#code=')) return null;
  const encoded = hash.slice(6);
  return decodeFromUrl(encoded);
}
