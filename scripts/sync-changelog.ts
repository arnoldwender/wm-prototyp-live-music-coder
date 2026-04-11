#!/usr/bin/env npx tsx
/* SPDX-License-Identifier: MIT
   Copyright (c) 2026 Arnold Wender / Wender Media
   ──────��───────────────────────────────────────────────────
   sync-changelog — generates CHANGELOG.md from the TypeScript
   data in src/data/changelog-library.ts. Run with:
     npx tsx scripts/sync-changelog.ts
   ────────────────────────────────────────────────────────── */

import { writeFileSync } from 'fs'
import { resolve } from 'path'
import { CHANGELOG } from '../src/data/changelog-library'

/* Group entries by version (versioned entries become section headers,
 * unversioned go under the most recent version or "Unreleased") */
interface VersionGroup {
  version: string
  date: string
  entries: typeof CHANGELOG
}

const groups: VersionGroup[] = []
let currentGroup: VersionGroup | null = null

/* Sort by date descending */
const sorted = [...CHANGELOG].sort((a, b) => b.date.localeCompare(a.date))

for (const entry of sorted) {
  if (entry.version) {
    currentGroup = { version: entry.version, date: entry.date, entries: [entry] }
    groups.push(currentGroup)
  } else if (currentGroup) {
    currentGroup.entries.push(entry)
  } else {
    /* Unversioned entry before any version — create "Unreleased" group */
    currentGroup = { version: 'Unreleased', date: entry.date, entries: [entry] }
    groups.push(currentGroup)
  }
}

/* Category label map */
const CATEGORY_LABEL: Record<string, string> = {
  feature: 'Added',
  bugfix: 'Fixed',
  content: 'Content',
  architecture: 'Changed',
  community: 'Community',
  release: 'Release',
}

/* Generate markdown */
let md = `# Changelog

All notable changes to [Live Music Coder](https://live-music-coder.pro) are documented here.

This file is auto-generated from \`src/data/changelog-library.ts\` — do not edit manually.
Run \`npx tsx scripts/sync-changelog.ts\` to regenerate.

The format follows [Keep a Changelog](https://keepachangelog.com/).

`

for (const group of groups) {
  const header = group.version === 'Unreleased'
    ? '## [Unreleased]'
    : `## [${group.version}] - ${group.date}`
  md += `${header}\n\n`

  /* Group entries by category within this version */
  const byCategory: Record<string, typeof CHANGELOG> = {}
  for (const entry of group.entries) {
    const cat = entry.category
    if (!byCategory[cat]) byCategory[cat] = []
    byCategory[cat].push(entry)
  }

  for (const [cat, entries] of Object.entries(byCategory)) {
    const label = CATEGORY_LABEL[cat] ?? cat
    md += `### ${label}\n\n`
    for (const entry of entries) {
      const pr = entry.pr ? ` ([#${entry.pr}](https://github.com/arnoldwender/wm-prototyp-live-music-coder/pull/${entry.pr}))` : ''
      /* First line of body as description, rest as sub-bullets */
      const bodyLines = entry.body.split('\n').filter(l => l.trim())
      const desc = bodyLines[0]?.replace(/\*\*/g, '') ?? entry.title
      md += `- **${entry.title}**${pr} — ${desc}\n`
    }
    md += '\n'
  }
}

md += `---\n\nCopyright (c) 2026 [Arnold Wender](https://arnoldwender.com) / [Wender Media](https://www.wendermedia.com)\n`

const outPath = resolve(import.meta.dirname, '..', 'CHANGELOG.md')
writeFileSync(outPath, md, 'utf-8')
console.log(`CHANGELOG.md generated (${groups.length} versions, ${sorted.length} entries)`)
