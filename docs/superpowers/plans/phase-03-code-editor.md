# Phase 3: Code Editor — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build a multi-tab code editor using CodeMirror 6 with per-engine syntax highlighting, live code evaluation, error display, and hot-reload on next audio cycle. Replace the placeholder editor panel with a real, working code editor.

**Architecture:** CodeMirror 6 as the editor core. Each tab is a ProjectFile with its own engine type. Code changes trigger evaluation via the orchestrator (debounced 500ms). @strudel/codemirror provides Strudel-specific language extensions. Tone.js and Web Audio tabs use JavaScript syntax. The editor is the source of truth — all code flows through it.

**Tech Stack:** CodeMirror 6 (@codemirror/state, @codemirror/view, @codemirror/lang-javascript, @codemirror/autocomplete, @codemirror/commands, @codemirror/search), @strudel/codemirror, Vitest

**Spec:** `docs/superpowers/specs/2026-03-25-live-music-coder-design.md` (Sections 3, 4)

---

## Strudel CodeMirror Research

`@strudel/codemirror` provides `StrudelMirror` — a full CodeMirror 6 editor with Strudel integration. However, since we need a custom multi-tab editor with multiple engine support, we'll use CodeMirror 6 directly and cherry-pick Strudel extensions where possible. The `@strudel/codemirror` package depends on many @strudel/* packages already installed.

For our use case:
- Use CM6 directly for the editor shell (multi-tab, themes, keybindings)
- Use `@codemirror/lang-javascript` for Tone.js and Web Audio tabs
- Import Strudel-specific extensions from `@strudel/codemirror` for pattern highlighting/autocomplete
- All engines share the same dark theme

---

## File Structure (Phase 3)

```
src/
├── components/
│   ├── atoms/
│   │   └── TabButton.tsx           # Tab button for file tabs (name, engine badge, close, active state)
│   ├── molecules/
│   │   └── FileTabs.tsx            # Tab bar: list of open files + "new file" button
│   └── organisms/
│       └── CodeEditor.tsx          # Main code editor organism — CM6 + tabs + evaluation
├── lib/
│   ├── editor/
│   │   ├── setup.ts               # CodeMirror 6 base setup (theme, keybindings, extensions)
│   │   ├── theme.ts               # Dark theme matching our design tokens
│   │   ├── extensions.ts          # Per-engine extension sets (Strudel, JS, etc.)
│   │   ├── evaluate.ts            # Debounced code evaluation bridge to orchestrator
│   │   └── evaluate.test.ts       # Evaluation tests
│   └── store.ts                   # (modify) Add file management actions to Zustand store
```

---

### Task 1: Install CodeMirror 6 dependencies

**Files:**
- Modify: `package.json`

- [ ] **Step 1: Install CM6 packages**

```bash
cd /Users/arnold/Development/wm-prototyp-live-music-coder
npm install @codemirror/state @codemirror/view @codemirror/lang-javascript @codemirror/autocomplete @codemirror/commands @codemirror/search @codemirror/language @strudel/codemirror
```

- [ ] **Step 2: Verify build**

```bash
npm run build
```

- [ ] **Step 3: Commit**

```bash
git add package.json package-lock.json
git commit -m "[Deps] Add CodeMirror 6 and @strudel/codemirror dependencies"
```

---

### Task 2: Add file management to Zustand store

**Files:**
- Modify: `src/lib/store.ts`
- Create: `src/lib/store-files.test.ts`

- [ ] **Step 1: Write file management tests first (TDD)**

Create `src/lib/store-files.test.ts`:

```typescript
import { describe, it, expect, beforeEach } from 'vitest';
import { useAppStore } from './store';

describe('File management in store', () => {
  beforeEach(() => {
    useAppStore.setState(useAppStore.getInitialState());
  });

  it('starts with one default file', () => {
    const files = useAppStore.getState().files;
    expect(files.length).toBe(1);
    expect(files[0].name).toBe('main.js');
    expect(files[0].engine).toBe('strudel');
    expect(files[0].active).toBe(true);
  });

  it('adds a new file', () => {
    useAppStore.getState().addFile('drums.js', 'strudel');
    const files = useAppStore.getState().files;
    expect(files.length).toBe(2);
    expect(files[1].name).toBe('drums.js');
  });

  it('removes a file', () => {
    useAppStore.getState().addFile('drums.js', 'strudel');
    const id = useAppStore.getState().files[1].id;
    useAppStore.getState().removeFile(id);
    expect(useAppStore.getState().files.length).toBe(1);
  });

  it('prevents removing the last file', () => {
    const id = useAppStore.getState().files[0].id;
    useAppStore.getState().removeFile(id);
    expect(useAppStore.getState().files.length).toBe(1);
  });

  it('sets active file', () => {
    useAppStore.getState().addFile('drums.js', 'strudel');
    const id = useAppStore.getState().files[1].id;
    useAppStore.getState().setActiveFile(id);
    expect(useAppStore.getState().files[1].active).toBe(true);
    expect(useAppStore.getState().files[0].active).toBe(false);
  });

  it('updates file code', () => {
    const id = useAppStore.getState().files[0].id;
    useAppStore.getState().updateFileCode(id, 'note("c3 e3")');
    expect(useAppStore.getState().files[0].code).toBe('note("c3 e3")');
  });

  it('renames a file', () => {
    const id = useAppStore.getState().files[0].id;
    useAppStore.getState().renameFile(id, 'melody.js');
    expect(useAppStore.getState().files[0].name).toBe('melody.js');
  });

  it('gets active file', () => {
    const active = useAppStore.getState().getActiveFile();
    expect(active).toBeDefined();
    expect(active?.active).toBe(true);
  });
});
```

- [ ] **Step 2: Run tests to verify failure**

```bash
npm run test
```

Expected: FAIL — files, addFile, etc. not in store.

- [ ] **Step 3: Add file management to store**

Modify `src/lib/store.ts` to add:

State:
```typescript
files: ProjectFile[]
```

Actions:
```typescript
addFile: (name: string, engine: EngineType) => void
removeFile: (fileId: string) => void
setActiveFile: (fileId: string) => void
updateFileCode: (fileId: string, code: string) => void
renameFile: (fileId: string, name: string) => void
getActiveFile: () => ProjectFile | undefined
```

Initial state — one default file:
```typescript
files: [{
  id: 'file_1',
  name: 'main.js',
  engine: 'strudel' as EngineType,
  code: 'note("c3 e3 g3 b3").s("sawtooth").lpf(800)',
  active: true,
}]
```

addFile: creates file with unique id (`file_${Date.now()}`), sets active false initially.
removeFile: only if files.length > 1. If removing active file, set first remaining file as active.
setActiveFile: sets all files active=false except the target.
updateFileCode: finds file by id, updates code.
renameFile: finds file by id, updates name.
getActiveFile: returns files.find(f => f.active).

Import ProjectFile type from `../types/project` and EngineType from `../types/engine`.

- [ ] **Step 4: Run tests to verify pass**

```bash
npm run test
```

Expected: All file management tests pass.

- [ ] **Step 5: Commit**

```bash
git add src/lib/store.ts src/lib/store-files.test.ts
git commit -m "[Store] Add file management — add, remove, rename, activate, update code"
```

---

### Task 3: CodeMirror dark theme + base setup

**Files:**
- Create: `src/lib/editor/theme.ts`, `src/lib/editor/setup.ts`, `src/lib/editor/extensions.ts`

- [ ] **Step 1: Create dark theme**

Create `src/lib/editor/theme.ts`:

```typescript
import { EditorView } from '@codemirror/view';
import { HighlightStyle, syntaxHighlighting } from '@codemirror/language';
import { tags } from '@lezer/highlight';

/** Dark theme matching our design tokens */
export const darkTheme = EditorView.theme({
  '&': {
    backgroundColor: '#09090b',
    color: '#fafafa',
    height: '100%',
  },
  '.cm-content': {
    fontFamily: "'JetBrains Mono', 'Fira Code', ui-monospace, monospace",
    fontSize: '14px',
    lineHeight: '1.6',
    caretColor: '#a855f7',
  },
  '.cm-cursor': {
    borderLeftColor: '#a855f7',
    borderLeftWidth: '2px',
  },
  '.cm-activeLine': {
    backgroundColor: '#18181b',
  },
  '.cm-selectionBackground, &.cm-focused .cm-selectionBackground': {
    backgroundColor: '#3f3f46 !important',
  },
  '.cm-gutters': {
    backgroundColor: '#09090b',
    color: '#71717a',
    borderRight: '1px solid #27272a',
  },
  '.cm-activeLineGutter': {
    backgroundColor: '#18181b',
    color: '#a1a1aa',
  },
  '.cm-foldGutter': {
    color: '#71717a',
  },
  '.cm-matchingBracket': {
    backgroundColor: '#3f3f46',
    outline: '1px solid #a855f7',
  },
  '.cm-searchMatch': {
    backgroundColor: '#854d0e44',
  },
  '.cm-tooltip': {
    backgroundColor: '#27272a',
    color: '#fafafa',
    border: '1px solid #3f3f46',
  },
  '.cm-tooltip-autocomplete': {
    backgroundColor: '#27272a',
  },
  '.cm-completionIcon': {
    color: '#a855f7',
  },
}, { dark: true });

/** Syntax highlighting colors */
export const darkHighlight = syntaxHighlighting(HighlightStyle.define([
  { tag: tags.keyword, color: '#c084fc' },
  { tag: tags.string, color: '#86efac' },
  { tag: tags.number, color: '#fbbf24' },
  { tag: tags.bool, color: '#fbbf24' },
  { tag: tags.null, color: '#71717a' },
  { tag: tags.comment, color: '#71717a', fontStyle: 'italic' },
  { tag: tags.variableName, color: '#93c5fd' },
  { tag: tags.function(tags.variableName), color: '#c4b5fd' },
  { tag: tags.definition(tags.variableName), color: '#67e8f9' },
  { tag: tags.propertyName, color: '#fca5a5' },
  { tag: tags.operator, color: '#a1a1aa' },
  { tag: tags.punctuation, color: '#71717a' },
  { tag: tags.typeName, color: '#67e8f9' },
  { tag: tags.className, color: '#67e8f9' },
  { tag: tags.regexp, color: '#fca5a5' },
]));
```

Note: Install @lezer/highlight if not already a transitive dep: `npm install @lezer/highlight`

- [ ] **Step 2: Create base setup**

Create `src/lib/editor/setup.ts`:

```typescript
import { keymap, lineNumbers, highlightActiveLineGutter, highlightSpecialChars, drawSelection, highlightActiveLine, rectangularSelection, crosshairCursor } from '@codemirror/view';
import { EditorState } from '@codemirror/state';
import { defaultKeymap, history, historyKeymap, indentWithTab } from '@codemirror/commands';
import { searchKeymap, highlightSelectionMatches } from '@codemirror/search';
import { autocompletion, completionKeymap, closeBrackets, closeBracketsKeymap } from '@codemirror/autocomplete';
import { bracketMatching, indentOnInput, foldGutter, foldKeymap } from '@codemirror/language';
import { darkTheme, darkHighlight } from './theme';
import type { Extension } from '@codemirror/state';

/** Base CodeMirror extensions shared across all engine modes */
export function getBaseExtensions(): Extension[] {
  return [
    /* Visual */
    lineNumbers(),
    highlightActiveLineGutter(),
    highlightSpecialChars(),
    drawSelection(),
    highlightActiveLine(),
    rectangularSelection(),
    crosshairCursor(),
    highlightSelectionMatches(),

    /* Editing */
    history(),
    indentOnInput(),
    bracketMatching(),
    closeBrackets(),
    autocompletion(),
    foldGutter(),

    /* Keybindings */
    keymap.of([
      ...closeBracketsKeymap,
      ...defaultKeymap,
      ...searchKeymap,
      ...historyKeymap,
      ...foldKeymap,
      ...completionKeymap,
      indentWithTab,
    ]),

    /* Theme */
    darkTheme,
    darkHighlight,

    /* Tab size */
    EditorState.tabSize.of(2),
  ];
}
```

- [ ] **Step 3: Create per-engine extensions**

Create `src/lib/editor/extensions.ts`:

```typescript
import { javascript } from '@codemirror/lang-javascript';
import type { Extension } from '@codemirror/state';
import type { EngineType } from '../../types/engine';

/** Get language extensions based on engine type */
export function getEngineExtensions(engine: EngineType): Extension[] {
  switch (engine) {
    case 'strudel':
      /* Strudel uses JavaScript with Strudel-specific patterns.
       * For now, use JS mode. @strudel/codemirror extensions
       * can be added later for pattern visualization. */
      return [javascript()];

    case 'tonejs':
      return [javascript()];

    case 'webaudio':
      return [javascript()];

    case 'midi':
      return [javascript()];
  }
}
```

- [ ] **Step 4: Verify build**

```bash
npm run build
```

- [ ] **Step 5: Commit**

```bash
git add src/lib/editor/
git commit -m "[Editor] Add CodeMirror 6 dark theme, base setup, and per-engine extensions"
```

---

### Task 4: Code evaluation bridge

**Files:**
- Create: `src/lib/editor/evaluate.ts`, `src/lib/editor/evaluate.test.ts`

- [ ] **Step 1: Write evaluation tests**

Create `src/lib/editor/evaluate.test.ts`:

```typescript
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { createEvaluator } from './evaluate';

describe('createEvaluator', () => {
  it('debounces evaluation calls', async () => {
    const evalFn = vi.fn().mockResolvedValue(undefined);
    const evaluator = createEvaluator(evalFn, 100);

    evaluator.evaluate('code1');
    evaluator.evaluate('code2');
    evaluator.evaluate('code3');

    /* Only the last call should fire after debounce */
    await new Promise(r => setTimeout(r, 150));
    expect(evalFn).toHaveBeenCalledTimes(1);
    expect(evalFn).toHaveBeenCalledWith('code3');
  });

  it('reports errors via callback', async () => {
    const error = new Error('syntax error');
    const evalFn = vi.fn().mockRejectedValue(error);
    const onError = vi.fn();
    const evaluator = createEvaluator(evalFn, 50, onError);

    evaluator.evaluate('bad code');
    await new Promise(r => setTimeout(r, 100));
    expect(onError).toHaveBeenCalledWith(error);
  });

  it('can be cancelled', async () => {
    const evalFn = vi.fn().mockResolvedValue(undefined);
    const evaluator = createEvaluator(evalFn, 100);

    evaluator.evaluate('code');
    evaluator.cancel();
    await new Promise(r => setTimeout(r, 150));
    expect(evalFn).not.toHaveBeenCalled();
  });

  it('clears error on successful evaluation', async () => {
    const evalFn = vi.fn().mockResolvedValue(undefined);
    const onError = vi.fn();
    const onSuccess = vi.fn();
    const evaluator = createEvaluator(evalFn, 50, onError, onSuccess);

    evaluator.evaluate('good code');
    await new Promise(r => setTimeout(r, 100));
    expect(onSuccess).toHaveBeenCalled();
  });
});
```

- [ ] **Step 2: Implement evaluator**

Create `src/lib/editor/evaluate.ts`:

```typescript
/** Debounced code evaluator that bridges the editor to the orchestrator.
 * Prevents rapid re-evaluation during typing. Reports errors for UI display. */
export interface Evaluator {
  evaluate: (code: string) => void;
  cancel: () => void;
}

export function createEvaluator(
  evalFn: (code: string) => Promise<void>,
  debounceMs = 500,
  onError?: (error: Error) => void,
  onSuccess?: () => void,
): Evaluator {
  let timer: ReturnType<typeof setTimeout> | null = null;

  return {
    evaluate(code: string) {
      if (timer) clearTimeout(timer);
      timer = setTimeout(async () => {
        try {
          await evalFn(code);
          onSuccess?.();
        } catch (err) {
          onError?.(err instanceof Error ? err : new Error(String(err)));
        }
      }, debounceMs);
    },
    cancel() {
      if (timer) {
        clearTimeout(timer);
        timer = null;
      }
    },
  };
}
```

- [ ] **Step 3: Run tests**

```bash
npm run test
```

Expected: All evaluator tests pass.

- [ ] **Step 4: Commit**

```bash
git add src/lib/editor/evaluate.ts src/lib/editor/evaluate.test.ts
git commit -m "[Editor] Add debounced code evaluation bridge with error handling + tests"
```

---

### Task 5: TabButton atom + FileTabs molecule

**Files:**
- Create: `src/components/atoms/TabButton.tsx`
- Create: `src/components/molecules/FileTabs.tsx`
- Modify: `src/components/atoms/index.ts`, `src/components/molecules/index.ts`

- [ ] **Step 1: Create TabButton atom**

Create `src/components/atoms/TabButton.tsx`:

```tsx
import { X } from 'lucide-react';
import type { EngineType } from '../../types/engine';
import { ENGINE_COLORS } from '../../lib/constants';

interface TabButtonProps {
  name: string;
  engine: EngineType;
  active: boolean;
  onClick: () => void;
  onClose: () => void;
  closable: boolean;
}

/** Single file tab button with engine color indicator and close button */
export function TabButton({ name, engine, active, onClick, onClose, closable }: TabButtonProps) {
  return (
    <button
      onClick={onClick}
      className="group flex items-center gap-1 px-3 py-1 text-sm border-b-2 transition-colors cursor-pointer"
      style={{
        borderBottomColor: active ? ENGINE_COLORS[engine] : 'transparent',
        color: active ? 'var(--color-text)' : 'var(--color-text-muted)',
        backgroundColor: active ? 'var(--color-bg-elevated)' : 'transparent',
      }}
      aria-selected={active}
      role="tab"
    >
      {/* Engine color dot */}
      <span
        className="w-2 h-2 rounded-full shrink-0"
        style={{ backgroundColor: ENGINE_COLORS[engine] }}
      />
      <span className="truncate max-w-24">{name}</span>
      {closable && (
        <span
          role="button"
          tabIndex={0}
          aria-label={`Close ${name}`}
          onClick={(e) => { e.stopPropagation(); onClose(); }}
          onKeyDown={(e) => { if (e.key === 'Enter') { e.stopPropagation(); onClose(); } }}
          className="opacity-0 group-hover:opacity-100 ml-1 p-0.5 rounded hover:bg-[var(--color-bg-hover)] transition-opacity"
        >
          <X size={12} />
        </span>
      )}
    </button>
  );
}
```

- [ ] **Step 2: Create FileTabs molecule**

Create `src/components/molecules/FileTabs.tsx`:

```tsx
import { Plus } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { useAppStore } from '../../lib/store';
import { TabButton } from '../atoms/TabButton';
import { Button } from '../atoms';

/** Tab bar showing all open files + new file button */
export function FileTabs() {
  const { t } = useTranslation();
  const files = useAppStore((s) => s.files);
  const defaultEngine = useAppStore((s) => s.defaultEngine);
  const setActiveFile = useAppStore((s) => s.setActiveFile);
  const removeFile = useAppStore((s) => s.removeFile);
  const addFile = useAppStore((s) => s.addFile);

  const handleNewFile = () => {
    const count = files.length + 1;
    addFile(`file${count}.js`, defaultEngine);
  };

  return (
    <nav
      className="flex items-center border-b overflow-x-auto shrink-0"
      style={{ borderColor: 'var(--color-border)', backgroundColor: 'var(--color-bg-alt)' }}
      role="tablist"
      aria-label={t('panels.editor')}
    >
      {files.map((file) => (
        <TabButton
          key={file.id}
          name={file.name}
          engine={file.engine}
          active={file.active}
          onClick={() => setActiveFile(file.id)}
          onClose={() => removeFile(file.id)}
          closable={files.length > 1}
        />
      ))}
      <Button
        variant="ghost"
        onClick={handleNewFile}
        aria-label="New file"
        className="!p-1 ml-1"
      >
        <Plus size={14} />
      </Button>
    </nav>
  );
}
```

- [ ] **Step 3: Add to barrel exports**

Add `TabButton` to `src/components/atoms/index.ts`.
Add `FileTabs` to `src/components/molecules/index.ts`.

- [ ] **Step 4: Commit**

```bash
git add src/components/atoms/TabButton.tsx src/components/atoms/index.ts src/components/molecules/FileTabs.tsx src/components/molecules/index.ts
git commit -m "[UI] Add TabButton atom and FileTabs molecule for multi-tab editor"
```

---

### Task 6: CodeEditor organism

**Files:**
- Create: `src/components/organisms/CodeEditor.tsx`
- Modify: `src/components/organisms/index.ts`

- [ ] **Step 1: Create CodeEditor organism**

Create `src/components/organisms/CodeEditor.tsx`:

```tsx
import { useEffect, useRef, useCallback } from 'react';
import { EditorState } from '@codemirror/state';
import { EditorView } from '@codemirror/view';
import { useAppStore } from '../../lib/store';
import { getOrchestrator } from '../../lib/orchestrator';
import { getBaseExtensions } from '../../lib/editor/setup';
import { getEngineExtensions } from '../../lib/editor/extensions';
import { createEvaluator } from '../../lib/editor/evaluate';
import { FileTabs } from '../molecules/FileTabs';

/** Main code editor — CodeMirror 6 with multi-tab support and live evaluation */
export function CodeEditor() {
  const editorRef = useRef<HTMLDivElement>(null);
  const viewRef = useRef<EditorView | null>(null);
  const evaluatorRef = useRef<ReturnType<typeof createEvaluator> | null>(null);

  const files = useAppStore((s) => s.files);
  const updateFileCode = useAppStore((s) => s.updateFileCode);
  const isPlaying = useAppStore((s) => s.isPlaying);
  const activeFile = files.find((f) => f.active);

  /** Set up evaluator for live code changes */
  const setupEvaluator = useCallback(() => {
    if (!activeFile) return;
    evaluatorRef.current?.cancel();
    const orch = getOrchestrator();
    evaluatorRef.current = createEvaluator(
      (code) => orch.evaluate(code, activeFile.engine),
      500,
      (err) => console.error('[CodeEditor] Eval error:', err.message),
      () => {},
    );
  }, [activeFile?.id, activeFile?.engine]);

  /** Create or recreate the CM6 editor when active file changes */
  useEffect(() => {
    if (!editorRef.current || !activeFile) return;

    /* Destroy previous editor */
    viewRef.current?.destroy();

    /* Create update listener */
    const updateListener = EditorView.updateListener.of((update) => {
      if (update.docChanged) {
        const code = update.state.doc.toString();
        updateFileCode(activeFile.id, code);
        /* Auto-evaluate when playing */
        if (isPlaying) {
          evaluatorRef.current?.evaluate(code);
        }
      }
    });

    /* Create new editor state */
    const state = EditorState.create({
      doc: activeFile.code,
      extensions: [
        ...getBaseExtensions(),
        ...getEngineExtensions(activeFile.engine),
        updateListener,
      ],
    });

    /* Create new editor view */
    viewRef.current = new EditorView({
      state,
      parent: editorRef.current,
    });

    setupEvaluator();

    return () => {
      evaluatorRef.current?.cancel();
      viewRef.current?.destroy();
      viewRef.current = null;
    };
  }, [activeFile?.id, activeFile?.engine]);

  /* Sync playing state with evaluator */
  useEffect(() => {
    setupEvaluator();
  }, [setupEvaluator]);

  return (
    <div className="flex flex-col h-full" style={{ backgroundColor: 'var(--color-bg)' }}>
      <FileTabs />
      <div ref={editorRef} className="flex-1 min-h-0 overflow-hidden" />
    </div>
  );
}
```

- [ ] **Step 2: Add to barrel export**

Add `CodeEditor` to `src/components/organisms/index.ts`.

- [ ] **Step 3: Commit**

```bash
git add src/components/organisms/CodeEditor.tsx src/components/organisms/index.ts
git commit -m "[Editor] Add CodeEditor organism — CM6 with multi-tab, live evaluation"
```

---

### Task 7: Wire CodeEditor into Editor page

**Files:**
- Modify: `src/pages/Editor.tsx`

- [ ] **Step 1: Replace placeholder with CodeEditor**

In `src/pages/Editor.tsx`:
- Import `CodeEditor` from `../components/organisms`
- Replace the editor PlaceholderPanel with `<CodeEditor />`
- Remove the demo pattern useEffect (no longer needed — the default file code handles it)

- [ ] **Step 2: Verify it works**

```bash
npm run dev
```

Expected:
1. Navigate to /editor
2. See a real code editor with syntax highlighting in the left panel
3. Tab bar shows "main.js" with Strudel purple dot
4. Click "+" to add new file tab
5. Click Play → code evaluates and produces sound
6. Edit code while playing → sound updates after 500ms debounce

- [ ] **Step 3: Run all tests**

```bash
npm run test
```

Expected: All tests pass.

- [ ] **Step 4: Type check + build**

```bash
npx tsc --noEmit && npm run build
```

- [ ] **Step 5: Commit and push**

```bash
git add src/pages/Editor.tsx
git commit -m "[App] Wire CodeEditor into Editor page — real code editing with live audio"
git push
```

---

## Phase 3 Completion Criteria

After all 7 tasks:
- CodeMirror 6 editor with dark theme matching design tokens
- Multi-tab file management (add, close, rename, switch)
- Per-engine syntax highlighting (JavaScript for all engines in v1)
- Live code evaluation while playing (debounced 500ms)
- Error handling (errors logged, audio doesn't crash)
- File state managed in Zustand store
- Tab bar with engine color indicators

**Next:** Phase 4 — Node Graph & Sync (React Flow, bidirectional code sync, codegen, parser)
