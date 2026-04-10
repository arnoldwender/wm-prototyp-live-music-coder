/* SPDX-License-Identifier: AGPL-3.0-or-later
   Copyright (c) 2026 Arnold Wender / Wender Media
   ──────────────────────────────────────────────────────────
   Solo/Mute system for labeled Strudel patterns.
   Strudel patterns can be labeled with d1:, d2:, $: syntax.
   This module tracks which labels are muted/soloed and
   wraps the pattern to silence muted voices.
   ────────────────────────────────────────────────────────── */

/** Muted pattern labels — patterns with these labels are silenced */
const mutedLabels = new Set<string>();

/** Soloed pattern label — if set, only this pattern plays */
let soloLabel: string | null = null;

/** Toggle mute for a labeled pattern */
export function toggleMute(label: string): void {
  if (mutedLabels.has(label)) {
    mutedLabels.delete(label);
  } else {
    mutedLabels.add(label);
    /* Clear solo if we're muting the soloed pattern */
    if (soloLabel === label) soloLabel = null;
  }
}

/** Toggle solo for a labeled pattern — only this one plays */
export function toggleSolo(label: string): void {
  soloLabel = soloLabel === label ? null : label;
}

/** Check if a label is muted (either explicitly or via solo) */
export function isMuted(label: string): boolean {
  if (soloLabel) return label !== soloLabel;
  return mutedLabels.has(label);
}

/** Check if a label is soloed */
export function isSoloed(label: string): boolean {
  return soloLabel === label;
}

/** Get current solo/mute state for UI display */
export function getSoloMuteState(): { muted: Set<string>; solo: string | null } {
  return { muted: new Set(mutedLabels), solo: soloLabel };
}

/** Clear all mute/solo states */
export function clearSoloMute(): void {
  mutedLabels.clear();
  soloLabel = null;
}

/**
 * Extract labeled pattern names from Strudel code.
 * Looks for patterns like: d1: ..., d2: ..., $: ...
 * Also matches: let name = ... patterns
 */
export function extractLabels(code: string): string[] {
  const labels: string[] = [];
  /* Match d1:, d2:, $: style labels */
  const labelRegex = /^\s*(d\d+|[a-z_]\w*|\$)\s*:/gm;
  let match;
  while ((match = labelRegex.exec(code)) !== null) {
    labels.push(match[1]);
  }
  /* Match $: shorthand at start of line */
  const dollarRegex = /^\s*\$\s*:/gm;
  while ((match = dollarRegex.exec(code)) !== null) {
    if (!labels.includes('$')) labels.push('$');
  }
  return [...new Set(labels)];
}
