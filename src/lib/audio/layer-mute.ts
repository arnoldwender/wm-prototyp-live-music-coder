// SPDX-License-Identifier: AGPL-3.0-or-later
// Copyright (c) 2026 Arnold Wender / Wender Media

/**
 * Layer mute, done through the mechanism that actually works.
 *
 * src/lib/audio/solo-mute.ts keeps mute/solo in a module-level Set that nothing
 * reads: `isMuted`, `isSoloed`, `getSoloMuteState` and `clearSoloMute` have zero
 * consumers, so the Alt+1..9 shortcuts flipped a flag and logged. Meanwhile the
 * mute that DOES work is textual — `processMutedLabels` (strudel-extensions.ts)
 * rewrites a leading `_$:` or `_d1:` into a comment before evaluation, and
 * Strudel's own `Pattern.prototype.p` returns silence for `_`-prefixed ids.
 *
 * So muting a layer means toggling the `_` prefix in the DOCUMENT and
 * re-evaluating, not mutating a Set. That also makes the state visible: the user
 * can see which layers are muted by reading their own code.
 */

/** A labelled line: `$:`, `d1:`, and their muted `_` forms. */
const LABEL_LINE = /^(\s*)(_?)(\$|d\d+)(\s*:)/;

export interface LayerLabel {
  /** 0-based index among labelled lines, in document order. */
  index: number;
  /** Line number, 0-based. */
  line: number;
  /** The label without its mute prefix, e.g. "$" or "d1". */
  label: string;
  muted: boolean;
}

/** List every labelled layer in document order. */
export function findLayers(code: string): LayerLabel[] {
  const out: LayerLabel[] = [];
  code.split('\n').forEach((text, line) => {
    const m = text.match(LABEL_LINE);
    if (m) out.push({ index: out.length, line, label: m[3], muted: m[2] === '_' });
  });
  return out;
}

/**
 * Toggle the mute prefix on the nth labelled layer (0-based).
 *
 * Returns the code unchanged when there is no such layer, so a shortcut pressed
 * against a two-layer pattern is a no-op rather than an error.
 */
export function toggleLayerMute(code: string, index: number): string {
  const lines = code.split('\n');
  const target = findLayers(code)[index];
  if (!target) return code;

  lines[target.line] = lines[target.line].replace(
    LABEL_LINE,
    (_full, indent: string, prefix: string, label: string, colon: string) =>
      `${indent}${prefix === '_' ? '' : '_'}${label}${colon}`,
  );
  return lines.join('\n');
}

/**
 * Solo the nth layer: mute every other labelled layer, unmute this one.
 * Soloing an already-soloed layer clears the solo instead, so the same key
 * toggles rather than trapping the user in a solo.
 */
export function toggleLayerSolo(code: string, index: number): string {
  const layers = findLayers(code);
  const target = layers[index];
  if (!target) return code;

  const alreadySoloed =
    !target.muted && layers.every((l) => l.index === index || l.muted);

  const lines = code.split('\n');
  for (const layer of layers) {
    const shouldMute = alreadySoloed ? false : layer.index !== index;
    if (layer.muted === shouldMute) continue;
    lines[layer.line] = lines[layer.line].replace(
      LABEL_LINE,
      (_full, indent: string, _prefix: string, label: string, colon: string) =>
        `${indent}${shouldMute ? '_' : ''}${label}${colon}`,
    );
  }
  return lines.join('\n');
}
