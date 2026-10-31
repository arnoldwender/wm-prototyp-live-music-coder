// SPDX-License-Identifier: MIT
// Copyright (c) 2026 Arnold Wender / Wender Media
import { describe, expect, it } from 'vitest'
import de from './locales/de.json'
import en from './locales/en.json'
import es from './locales/es.json'

/*
 * The footer said "Some images on this website are AI-generated" from 2026-07-17 to 2026-10-31.
 * The site has no AI image: the icons and og-image come from scripts/render-icons.mjs. What is AI-made
 * are the sessions. Claiming otherwise misleads in the other direction (§ 5 UWG).
 */
describe('footer.aiDisclosure', () => {
  it.each([
    ['de', de.footer.aiDisclosure, /Bild/i, /KI-komponiert/],
    ['en', en.footer.aiDisclosure, /image/i, /AI-composed/],
    ['es', es.footer.aiDisclosure, /imagen/i, /compuestas por IA/],
  ])('%s names the sessions, not images', (_locale, text, images, sessions) => {
    expect(text).not.toMatch(images)
    expect(text).toMatch(sessions)
  })
})
