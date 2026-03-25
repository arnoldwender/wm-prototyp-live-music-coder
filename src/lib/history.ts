/* ──────────────────────────────────────────────────────────
   History manager — generic undo/redo stack.
   Used to track code editor state changes for undo/redo.
   ────────────────────────────────────────────────────────── */

export class History<T> {
  /** Stack of past states (most recent at end) */
  private undoStack: T[] = []
  /** Stack of undone states available for redo */
  private redoStack: T[] = []
  /** Maximum entries in the undo stack */
  private maxSize: number

  constructor(maxSize = 100) {
    this.maxSize = maxSize
  }

  /** Push a new state — clears redo stack and trims if over maxSize */
  push(state: T): void {
    this.undoStack.push(state)
    this.redoStack = []

    /* Trim oldest entries if stack exceeds maxSize */
    if (this.undoStack.length > this.maxSize) {
      this.undoStack = this.undoStack.slice(this.undoStack.length - this.maxSize)
    }
  }

  /** Undo — move current state to redo stack, return previous state */
  undo(): T | undefined {
    if (!this.canUndo()) return undefined

    const current = this.undoStack.pop()!
    this.redoStack.push(current)
    return this.undoStack[this.undoStack.length - 1]
  }

  /** Redo — pop from redo stack, push to undo stack, return it */
  redo(): T | undefined {
    if (!this.canRedo()) return undefined

    const state = this.redoStack.pop()!
    this.undoStack.push(state)
    return state
  }

  /** Can undo if there are at least 2 entries (current + previous) */
  canUndo(): boolean {
    return this.undoStack.length > 1
  }

  /** Can redo if the redo stack is not empty */
  canRedo(): boolean {
    return this.redoStack.length > 0
  }

  /** Clear both stacks */
  clear(): void {
    this.undoStack = []
    this.redoStack = []
  }
}
