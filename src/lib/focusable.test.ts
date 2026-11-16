/* SPDX-License-Identifier: MIT
   Copyright (c) 2026 Arnold Wender / Wender Media
   ────────────────────────────────────────────────────────── */
import { readdirSync, readFileSync } from 'node:fs'
import path from 'node:path'
import { describe, expect, it } from 'vitest'
import { FOCUSABLE_SELECTOR } from './focusable'

function el(tag: string, attrs: Record<string, string> = {}): HTMLElement {
  const node = document.createElement(tag)
  for (const [name, value] of Object.entries(attrs)) node.setAttribute(name, value)
  return node
}

describe('FOCUSABLE_SELECTOR', () => {
  it('skips disabled controls, so the last match is one that can hold focus', () => {
    const dialog = el('div')
    dialog.append(
      el('button', { id: 'close' }),
      el('input', { id: 'url' }),
      el('a', { id: 'docs', href: '/docs' }),
      el('span', { id: 'custom', tabindex: '0' }),
      el('span', { id: 'skipped', tabindex: '-1' }),
      el('input', { id: 'off-input', disabled: '' }),
      el('select', { id: 'off-select', disabled: '' }),
      el('button', { id: 'load', disabled: '' }),
    )
    /* Sorted: jsdom returns a selector list's matches grouped by selector, browsers in document order */
    const matched = [...dialog.querySelectorAll<HTMLElement>(FOCUSABLE_SELECTOR)].map((node) => node.id).sort()
    expect(matched).toEqual(['close', 'custom', 'docs', 'url'])
  })

  it('is the only focus-trap selector in the components and pages', () => {
    /* A trap that spells out its own selector is how the disabled-button leak came back in. */
    const offenders: string[] = []
    const walk = (dir: string) => {
      for (const entry of readdirSync(dir, { withFileTypes: true })) {
        const full = path.join(dir, entry.name)
        if (entry.isDirectory()) walk(full)
        else if (entry.name.endsWith('.tsx') && readFileSync(full, 'utf8').includes("'button, [href]")) {
          offenders.push(path.relative(process.cwd(), full))
        }
      }
    }
    walk(path.join(process.cwd(), 'src/components'))
    walk(path.join(process.cwd(), 'src/pages'))
    expect(offenders).toEqual([])
  })
})
