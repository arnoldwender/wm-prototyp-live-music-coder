/* ──────────────────────────────────────────────────────────
   History manager tests — TDD: written before implementation.
   Verifies undo/redo stack behavior, max size trimming.
   ────────────────────────────────────────────────────────── */

import { History } from './history'

describe('History', () => {
  it('starts with no undo/redo available', () => {
    const h = new History<string>()
    expect(h.canUndo()).toBe(false)
    expect(h.canRedo()).toBe(false)
  })

  it('records and undoes', () => {
    const h = new History<string>()
    h.push('a')
    h.push('b')
    h.push('c')

    expect(h.canUndo()).toBe(true)
    expect(h.undo()).toBe('b')
    expect(h.undo()).toBe('a')
    expect(h.canUndo()).toBe(false)
  })

  it('redoes after undo', () => {
    const h = new History<string>()
    h.push('a')
    h.push('b')
    h.push('c')

    h.undo() // back to 'b'
    expect(h.canRedo()).toBe(true)
    expect(h.redo()).toBe('c')
    expect(h.canRedo()).toBe(false)
  })

  it('clears redo stack on new push', () => {
    const h = new History<string>()
    h.push('a')
    h.push('b')
    h.push('c')

    h.undo() // back to 'b'
    h.push('d') // new branch — redo should be gone

    expect(h.canRedo()).toBe(false)
    expect(h.undo()).toBe('b')
  })

  it('respects max size', () => {
    const h = new History<number>(5)

    /* Push 10 items — only the last 5 should remain in the undo stack */
    for (let i = 0; i < 10; i++) {
      h.push(i)
    }

    /* canUndo needs > 1 entries, so with maxSize=5 we can undo 4 times */
    let undoCount = 0
    while (h.canUndo()) {
      h.undo()
      undoCount++
    }
    expect(undoCount).toBe(4)
  })

  it('clear resets both stacks', () => {
    const h = new History<string>()
    h.push('a')
    h.push('b')
    h.undo()

    h.clear()
    expect(h.canUndo()).toBe(false)
    expect(h.canRedo()).toBe(false)
  })

  it('undo returns undefined when no history', () => {
    const h = new History<string>()
    expect(h.undo()).toBeUndefined()
  })

  it('redo returns undefined when no redo available', () => {
    const h = new History<string>()
    expect(h.redo()).toBeUndefined()
  })
})
