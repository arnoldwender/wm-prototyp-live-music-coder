# Phase 7: Persistence & Sharing — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add IndexedDB autosave, URL sharing (lz-string compressed), GitHub Gist save/load, and audio recording (WAV export). Projects persist across sessions. Users can share code via URL or Gist.

**Architecture:** IndexedDB via `idb` package for local persistence. Autosave every 10s + on code change. URL sharing encodes code+BPM+engine into hash via lz-string. Gist integration uses octokit with PAT stored in sessionStorage (localStorage opt-in). Audio recording via MediaRecorder + master gain output.

**Tech Stack:** idb, lz-string, @octokit/rest, MediaRecorder API, Vitest

**Spec:** `docs/superpowers/specs/2026-03-25-live-music-coder-design.md` (Section 7)

---

## File Structure (Phase 7)

```
src/lib/persistence/
├── local.ts            # IndexedDB autosave via idb
├── local.test.ts       # Local persistence tests
├── url.ts              # URL hash encode/decode via lz-string
├── url.test.ts         # URL sharing tests
├── gist.ts             # GitHub Gist API via octokit
└── gist.test.ts        # Gist integration tests

src/lib/audio/
└── recorder.ts         # Audio recording via MediaRecorder → WAV download

src/components/
├── molecules/
│   └── ShareDialog.tsx  # Share via URL dialog
└── organisms/
    └── GistDialog.tsx   # Gist save/load dialog with PAT management
```

---

### Task 1: Install persistence dependencies

**Files:**
- Modify: `package.json`

- [ ] **Step 1: Install packages**

```bash
cd /Users/arnold/Development/wm-prototyp-live-music-coder
npm install idb lz-string @octokit/rest
npm install -D @types/lz-string
```

- [ ] **Step 2: Verify build**

```bash
npm run build
```

- [ ] **Step 3: Commit**

```bash
git add package.json package-lock.json
git commit -m "[Deps] Add idb, lz-string, and octokit for persistence and sharing"
```

---

### Task 2: IndexedDB local persistence (TDD)

**Files:**
- Create: `src/lib/persistence/local.ts`, `src/lib/persistence/local.test.ts`

- [ ] **Step 1: Write tests**

Create `src/lib/persistence/local.test.ts`:

```typescript
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { serializeProject, deserializeProject } from './local';
import type { Project } from '../../types/project';

/* Note: Full IndexedDB tests require fake-indexeddb.
 * These test serialization/deserialization logic. */

function createMockProject(): Project {
  return {
    id: 'test-1',
    name: 'Test Project',
    version: 1,
    created: Date.now(),
    updated: Date.now(),
    bpm: 120,
    defaultEngine: 'strudel',
    files: [{
      id: 'file_1',
      name: 'main.js',
      engine: 'strudel',
      code: 'note("c3 e3")',
      active: true,
    }],
    graph: { nodes: [], edges: [], viewport: { x: 0, y: 0, zoom: 1 } },
    layout: {
      editorWidth: 50,
      graphWidth: 50,
      visualizerHeight: 30,
      visiblePanels: { waveform: true, spectrum: true, timeline: true, beatlings: true },
    },
    ecosystem: {
      creatures: [],
      golGrid: { width: 64, height: 64, liveCells: [] },
      collection: [],
    },
  };
}

describe('Local persistence', () => {
  it('serializes a project to JSON string', () => {
    const project = createMockProject();
    const json = serializeProject(project);
    expect(typeof json).toBe('string');
    expect(json).toContain('test-1');
  });

  it('deserializes JSON back to project', () => {
    const project = createMockProject();
    const json = serializeProject(project);
    const restored = deserializeProject(json);
    expect(restored.id).toBe('test-1');
    expect(restored.bpm).toBe(120);
    expect(restored.files).toHaveLength(1);
  });

  it('handles missing fields gracefully', () => {
    const partial = JSON.stringify({ id: 'partial', name: 'Partial' });
    const restored = deserializeProject(partial);
    expect(restored.id).toBe('partial');
    expect(restored.bpm).toBeDefined();
  });
});
```

- [ ] **Step 2: Implement local persistence**

Create `src/lib/persistence/local.ts`:

```typescript
import { openDB, type IDBPDatabase } from 'idb';
import type { Project } from '../../types/project';

const DB_NAME = 'live-music-coder';
const DB_VERSION = 1;
const STORE_PROJECTS = 'projects';
const STORE_COLLECTION = 'collection';

let db: IDBPDatabase | null = null;

async function getDb(): Promise<IDBPDatabase> {
  if (db) return db;
  db = await openDB(DB_NAME, DB_VERSION, {
    upgrade(database) {
      if (!database.objectStoreNames.contains(STORE_PROJECTS)) {
        database.createObjectStore(STORE_PROJECTS, { keyPath: 'id' });
      }
      if (!database.objectStoreNames.contains(STORE_COLLECTION)) {
        database.createObjectStore(STORE_COLLECTION, { keyPath: 'id' });
      }
    },
  });
  return db;
}

/** Save project to IndexedDB */
export async function saveProject(project: Project): Promise<void> {
  const database = await getDb();
  await database.put(STORE_PROJECTS, { ...project, updated: Date.now() });
}

/** Load project from IndexedDB */
export async function loadProject(id: string): Promise<Project | undefined> {
  const database = await getDb();
  return database.get(STORE_PROJECTS, id);
}

/** List all saved projects */
export async function listProjects(): Promise<{ id: string; name: string; updated: number }[]> {
  const database = await getDb();
  const all = await database.getAll(STORE_PROJECTS);
  return all.map((p) => ({ id: p.id, name: p.name, updated: p.updated }));
}

/** Delete a project */
export async function deleteProject(id: string): Promise<void> {
  const database = await getDb();
  await database.delete(STORE_PROJECTS, id);
}

/** Serialize project to JSON string (for export/sharing) */
export function serializeProject(project: Project): string {
  return JSON.stringify(project);
}

/** Deserialize JSON to project with defaults for missing fields */
export function deserializeProject(json: string): Project {
  const parsed = JSON.parse(json);
  return {
    id: parsed.id ?? `project_${Date.now()}`,
    name: parsed.name ?? 'Untitled',
    version: 1,
    created: parsed.created ?? Date.now(),
    updated: parsed.updated ?? Date.now(),
    bpm: parsed.bpm ?? 120,
    defaultEngine: parsed.defaultEngine ?? 'strudel',
    files: parsed.files ?? [{ id: 'file_1', name: 'main.js', engine: 'strudel', code: '', active: true }],
    graph: parsed.graph ?? { nodes: [], edges: [], viewport: { x: 0, y: 0, zoom: 1 } },
    layout: parsed.layout ?? {
      editorWidth: 50, graphWidth: 50, visualizerHeight: 30,
      visiblePanels: { waveform: true, spectrum: true, timeline: true, beatlings: true },
    },
    ecosystem: parsed.ecosystem ?? { creatures: [], golGrid: { width: 64, height: 64, liveCells: [] }, collection: [] },
  };
}

/** Set up autosave interval (returns cleanup function) */
export function setupAutosave(getProject: () => Project, intervalMs = 10000): () => void {
  const timer = setInterval(async () => {
    try {
      await saveProject(getProject());
    } catch (err) {
      console.error('[Autosave] Failed:', err);
    }
  }, intervalMs);
  return () => clearInterval(timer);
}
```

- [ ] **Step 3: Run tests**

```bash
npm run test
```

- [ ] **Step 4: Commit**

```bash
git add src/lib/persistence/local.ts src/lib/persistence/local.test.ts
git commit -m "[Persistence] Add IndexedDB local storage with autosave, serialize/deserialize + tests"
```

---

### Task 3: URL sharing (TDD)

**Files:**
- Create: `src/lib/persistence/url.ts`, `src/lib/persistence/url.test.ts`

- [ ] **Step 1: Write tests**

Create `src/lib/persistence/url.test.ts`:

```typescript
import { describe, it, expect } from 'vitest';
import { encodeToUrl, decodeFromUrl, type UrlShareData } from './url';

describe('URL sharing', () => {
  it('encodes and decodes share data', () => {
    const data: UrlShareData = {
      code: 'note("c3 e3 g3").s("sawtooth")',
      bpm: 140,
      engine: 'strudel',
    };
    const hash = encodeToUrl(data);
    expect(hash).toBeTruthy();
    expect(typeof hash).toBe('string');

    const decoded = decodeFromUrl(hash);
    expect(decoded).not.toBeNull();
    expect(decoded!.code).toBe(data.code);
    expect(decoded!.bpm).toBe(140);
    expect(decoded!.engine).toBe('strudel');
  });

  it('handles empty code', () => {
    const data: UrlShareData = { code: '', bpm: 120, engine: 'strudel' };
    const hash = encodeToUrl(data);
    const decoded = decodeFromUrl(hash);
    expect(decoded!.code).toBe('');
  });

  it('returns null for invalid hash', () => {
    expect(decodeFromUrl('invalid-data!!!')).toBeNull();
  });

  it('compresses data significantly', () => {
    const longCode = 'note("c3 e3 g3").s("sawtooth").lpf(800).delay(0.5)'.repeat(10);
    const data: UrlShareData = { code: longCode, bpm: 120, engine: 'strudel' };
    const hash = encodeToUrl(data);
    expect(hash.length).toBeLessThan(longCode.length);
  });
});
```

- [ ] **Step 2: Implement URL sharing**

Create `src/lib/persistence/url.ts`:

```typescript
import { compressToEncodedURIComponent, decompressFromEncodedURIComponent } from 'lz-string';
import type { EngineType } from '../../types/engine';

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
    return {
      code: parsed.code ?? '',
      bpm: parsed.bpm ?? 120,
      engine: parsed.engine ?? 'strudel',
    };
  } catch {
    return null;
  }
}

/** Generate a full shareable URL */
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
```

- [ ] **Step 3: Run tests**

```bash
npm run test
```

- [ ] **Step 4: Commit**

```bash
git add src/lib/persistence/url.ts src/lib/persistence/url.test.ts
git commit -m "[Persistence] Add URL sharing with lz-string compression + tests"
```

---

### Task 4: GitHub Gist integration (TDD)

**Files:**
- Create: `src/lib/persistence/gist.ts`, `src/lib/persistence/gist.test.ts`

- [ ] **Step 1: Write tests**

Create `src/lib/persistence/gist.test.ts`:

```typescript
import { describe, it, expect } from 'vitest';
import { getStoredToken, setStoredToken, clearStoredToken } from './gist';

describe('Gist token management', () => {
  it('stores token in sessionStorage by default', () => {
    setStoredToken('test-token', false);
    expect(getStoredToken()).toBe('test-token');
    clearStoredToken();
  });

  it('stores token in localStorage when remember=true', () => {
    setStoredToken('test-token', true);
    expect(getStoredToken()).toBe('test-token');
    clearStoredToken();
  });

  it('clears token from both storages', () => {
    setStoredToken('test-token', true);
    clearStoredToken();
    expect(getStoredToken()).toBeNull();
  });
});
```

- [ ] **Step 2: Implement Gist integration**

Create `src/lib/persistence/gist.ts`:

```typescript
import { Octokit } from '@octokit/rest';
import type { Project } from '../../types/project';
import { serializeProject, deserializeProject } from './local';

const TOKEN_KEY_SESSION = 'lmc-gist-token';
const TOKEN_KEY_LOCAL = 'lmc-gist-token-persist';

/** Get stored GitHub PAT (checks both storages) */
export function getStoredToken(): string | null {
  return sessionStorage.getItem(TOKEN_KEY_SESSION)
    ?? localStorage.getItem(TOKEN_KEY_LOCAL)
    ?? null;
}

/** Store GitHub PAT. remember=true uses localStorage. */
export function setStoredToken(token: string, remember: boolean): void {
  clearStoredToken();
  if (remember) {
    localStorage.setItem(TOKEN_KEY_LOCAL, token);
  } else {
    sessionStorage.setItem(TOKEN_KEY_SESSION, token);
  }
}

/** Clear token from both storages */
export function clearStoredToken(): void {
  sessionStorage.removeItem(TOKEN_KEY_SESSION);
  localStorage.removeItem(TOKEN_KEY_LOCAL);
}

function getOctokit(): Octokit | null {
  const token = getStoredToken();
  if (!token) return null;
  return new Octokit({ auth: token });
}

/** Save project as a GitHub Gist */
export async function saveToGist(
  project: Project,
  gistId?: string,
): Promise<{ id: string; url: string }> {
  const octokit = getOctokit();
  if (!octokit) throw new Error('No GitHub token configured');

  const files: Record<string, { content: string }> = {
    'project.json': { content: serializeProject(project) },
  };

  /* Add individual code files for readability on GitHub */
  for (const file of project.files) {
    files[file.name] = { content: file.code };
  }

  if (gistId) {
    /* Update existing gist */
    const response = await octokit.gists.update({
      gist_id: gistId,
      description: `Live Music Coder: ${project.name}`,
      files,
    });
    return { id: response.data.id!, url: response.data.html_url! };
  } else {
    /* Create new gist */
    const response = await octokit.gists.create({
      description: `Live Music Coder: ${project.name}`,
      public: false,
      files,
    });
    return { id: response.data.id!, url: response.data.html_url! };
  }
}

/** Load project from a GitHub Gist */
export async function loadFromGist(gistId: string): Promise<Project> {
  const octokit = getOctokit();
  if (!octokit) throw new Error('No GitHub token configured');

  const response = await octokit.gists.get({ gist_id: gistId });
  const files = response.data.files;
  if (!files) throw new Error('Gist has no files');

  const projectFile = files['project.json'];
  if (!projectFile?.content) throw new Error('Gist missing project.json');

  return deserializeProject(projectFile.content);
}

/** Extract Gist ID from a URL or raw ID */
export function parseGistId(input: string): string | null {
  /* Full URL: https://gist.github.com/user/abc123 */
  const urlMatch = input.match(/gist\.github\.com\/[\w-]+\/([a-f0-9]+)/);
  if (urlMatch) return urlMatch[1];

  /* Just the ID */
  if (/^[a-f0-9]+$/.test(input.trim())) return input.trim();

  return null;
}
```

- [ ] **Step 3: Run tests**

```bash
npm run test
```

- [ ] **Step 4: Commit**

```bash
git add src/lib/persistence/gist.ts src/lib/persistence/gist.test.ts
git commit -m "[Persistence] Add GitHub Gist save/load with PAT management + tests"
```

---

### Task 5: Audio recorder

**Files:**
- Create: `src/lib/audio/recorder.ts`

- [ ] **Step 1: Implement audio recorder**

Create `src/lib/audio/recorder.ts`:

```typescript
import { getSharedContext, getMasterGain } from './context';

/** Records audio from the master gain node and exports as WAV download. */
export class AudioRecorder {
  private mediaRecorder: MediaRecorder | null = null;
  private chunks: Blob[] = [];
  private stream: MediaStream | null = null;
  private destination: MediaStreamAudioDestinationNode | null = null;

  /** Start recording */
  start(): void {
    const ctx = getSharedContext();
    this.destination = ctx.createMediaStreamDestination();
    getMasterGain().connect(this.destination);
    this.stream = this.destination.stream;

    this.chunks = [];
    this.mediaRecorder = new MediaRecorder(this.stream, {
      mimeType: 'audio/webm;codecs=opus',
    });

    this.mediaRecorder.ondataavailable = (e) => {
      if (e.data.size > 0) this.chunks.push(e.data);
    };

    this.mediaRecorder.start(100);
  }

  /** Stop recording and return the audio blob */
  stop(): Promise<Blob> {
    return new Promise((resolve, reject) => {
      if (!this.mediaRecorder) {
        reject(new Error('Not recording'));
        return;
      }

      this.mediaRecorder.onstop = () => {
        const blob = new Blob(this.chunks, { type: 'audio/webm' });
        this.cleanup();
        resolve(blob);
      };

      this.mediaRecorder.stop();
    });
  }

  /** Stop recording and trigger a download */
  async stopAndDownload(filename = 'recording'): Promise<void> {
    const blob = await this.stop();
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${filename}.webm`;
    a.click();
    URL.revokeObjectURL(url);
  }

  isRecording(): boolean {
    return this.mediaRecorder?.state === 'recording';
  }

  private cleanup(): void {
    if (this.destination) {
      try { getMasterGain().disconnect(this.destination); } catch { /* ok */ }
    }
    this.mediaRecorder = null;
    this.destination = null;
    this.stream = null;
    this.chunks = [];
  }
}

/** Singleton recorder instance */
let recorderInstance: AudioRecorder | null = null;

export function getRecorder(): AudioRecorder {
  if (!recorderInstance) recorderInstance = new AudioRecorder();
  return recorderInstance;
}
```

- [ ] **Step 2: Commit**

```bash
git add src/lib/audio/recorder.ts
git commit -m "[Audio] Add AudioRecorder — record master output to WebM download"
```

---

### Task 6: Share + Gist dialogs + wire into toolbar

**Files:**
- Create: `src/components/molecules/ShareDialog.tsx`, `src/components/organisms/GistDialog.tsx`
- Modify: `src/components/organisms/TransportBar.tsx`
- Modify: `src/components/molecules/index.ts`, `src/components/organisms/index.ts`

- [ ] **Step 1: Create ShareDialog**

Create `src/components/molecules/ShareDialog.tsx`:

```tsx
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useAppStore } from '../../lib/store';
import { generateShareUrl } from '../../lib/persistence/url';
import { Button } from '../atoms';
import { Copy, Check, X } from 'lucide-react';

interface ShareDialogProps {
  onClose: () => void;
}

/** Dialog for sharing the current code via URL */
export function ShareDialog({ onClose }: ShareDialogProps) {
  const { t } = useTranslation();
  const files = useAppStore((s) => s.files);
  const bpm = useAppStore((s) => s.bpm);
  const activeFile = files.find((f) => f.active);
  const [copied, setCopied] = useState(false);

  const shareUrl = activeFile
    ? generateShareUrl({ code: activeFile.code, bpm, engine: activeFile.engine })
    : '';

  const handleCopy = async () => {
    await navigator.clipboard.writeText(shareUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center" style={{ backgroundColor: 'rgba(0,0,0,0.6)' }}>
      <div className="rounded-lg p-6 max-w-lg w-full mx-4" style={{ backgroundColor: 'var(--color-bg-elevated)', border: '1px solid var(--color-border)' }}>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold" style={{ color: 'var(--color-text)' }}>{t('toolbar.share')}</h2>
          <Button variant="ghost" onClick={onClose} aria-label="Close"><X size={18} /></Button>
        </div>
        <input
          readOnly
          value={shareUrl}
          className="w-full p-2 rounded text-sm mb-4"
          style={{
            backgroundColor: 'var(--color-bg)',
            color: 'var(--color-text)',
            border: '1px solid var(--color-border)',
            fontFamily: 'var(--font-family-mono)',
          }}
          onFocus={(e) => e.target.select()}
        />
        <Button variant="primary" onClick={handleCopy} className="w-full">
          {copied ? <Check size={16} /> : <Copy size={16} />}
          {copied ? 'Copied!' : 'Copy URL'}
        </Button>
      </div>
    </div>
  );
}
```

- [ ] **Step 2: Create GistDialog**

Create `src/components/organisms/GistDialog.tsx`:

```tsx
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useAppStore } from '../../lib/store';
import { getStoredToken, setStoredToken, clearStoredToken, saveToGist, loadFromGist, parseGistId } from '../../lib/persistence/gist';
import { Button } from '../atoms';
import { X, Upload, Download, Trash2 } from 'lucide-react';
import type { Project } from '../../types/project';

interface GistDialogProps {
  onClose: () => void;
}

/** Dialog for GitHub Gist save/load with PAT management */
export function GistDialog({ onClose }: GistDialogProps) {
  const { t } = useTranslation();
  const [token, setToken] = useState(getStoredToken() ?? '');
  const [remember, setRemember] = useState(false);
  const [gistInput, setGistInput] = useState('');
  const [status, setStatus] = useState('');
  const [saving, setSaving] = useState(false);

  const store = useAppStore.getState();
  const hasToken = !!getStoredToken();

  const handleSaveToken = () => {
    setStoredToken(token, remember);
    setStatus('Token saved');
  };

  const handleClearToken = () => {
    clearStoredToken();
    setToken('');
    setStatus('Token cleared');
  };

  const handleSave = async () => {
    setSaving(true);
    setStatus('Saving...');
    try {
      const project: Project = {
        id: `project_${Date.now()}`,
        name: 'Live Music Coder Project',
        version: 1,
        created: Date.now(),
        updated: Date.now(),
        bpm: store.bpm,
        defaultEngine: store.defaultEngine,
        files: store.files,
        graph: { nodes: [], edges: [], viewport: { x: 0, y: 0, zoom: 1 } },
        layout: store.layout,
        ecosystem: { creatures: [], golGrid: { width: 64, height: 64, liveCells: [] }, collection: [] },
      };
      const result = await saveToGist(project);
      setStatus(`Saved! Gist ID: ${result.id}`);
    } catch (err) {
      setStatus(`Error: ${err instanceof Error ? err.message : 'Unknown'}`);
    }
    setSaving(false);
  };

  const handleLoad = async () => {
    const gistId = parseGistId(gistInput);
    if (!gistId) { setStatus('Invalid Gist ID or URL'); return; }
    setStatus('Loading...');
    try {
      const project = await loadFromGist(gistId);
      /* Apply loaded project to store */
      useAppStore.setState({
        bpm: project.bpm,
        defaultEngine: project.defaultEngine,
        files: project.files,
        layout: project.layout,
      });
      setStatus('Loaded successfully!');
    } catch (err) {
      setStatus(`Error: ${err instanceof Error ? err.message : 'Unknown'}`);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center" style={{ backgroundColor: 'rgba(0,0,0,0.6)' }}>
      <div className="rounded-lg p-6 max-w-lg w-full mx-4" style={{ backgroundColor: 'var(--color-bg-elevated)', border: '1px solid var(--color-border)' }}>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold" style={{ color: 'var(--color-text)' }}>{t('toolbar.gist')}</h2>
          <Button variant="ghost" onClick={onClose} aria-label="Close"><X size={18} /></Button>
        </div>

        {/* Token management */}
        <section className="mb-4">
          <label className="block text-sm mb-1" style={{ color: 'var(--color-text-secondary)' }}>GitHub Personal Access Token</label>
          <input
            type="password"
            value={token}
            onChange={(e) => setToken(e.target.value)}
            placeholder="ghp_..."
            className="w-full p-2 rounded text-sm mb-2"
            style={{ backgroundColor: 'var(--color-bg)', color: 'var(--color-text)', border: '1px solid var(--color-border)' }}
          />
          <div className="flex items-center gap-2 mb-2">
            <label className="flex items-center gap-1 text-xs cursor-pointer" style={{ color: 'var(--color-text-muted)' }}>
              <input type="checkbox" checked={remember} onChange={(e) => setRemember(e.target.checked)} />
              Remember token (localStorage)
            </label>
          </div>
          <div className="flex gap-2">
            <Button variant="secondary" onClick={handleSaveToken} className="text-sm">Save Token</Button>
            {hasToken && <Button variant="ghost" onClick={handleClearToken} className="text-sm"><Trash2 size={14} /> Clear</Button>}
          </div>
        </section>

        {/* Save to Gist */}
        <section className="mb-4">
          <Button variant="primary" onClick={handleSave} disabled={!hasToken || saving} className="w-full">
            <Upload size={16} /> Save to Gist
          </Button>
        </section>

        {/* Load from Gist */}
        <section className="mb-4">
          <label className="block text-sm mb-1" style={{ color: 'var(--color-text-secondary)' }}>Load from Gist (URL or ID)</label>
          <input
            value={gistInput}
            onChange={(e) => setGistInput(e.target.value)}
            placeholder="https://gist.github.com/user/abc123"
            className="w-full p-2 rounded text-sm mb-2"
            style={{ backgroundColor: 'var(--color-bg)', color: 'var(--color-text)', border: '1px solid var(--color-border)', fontFamily: 'var(--font-family-mono)' }}
          />
          <Button variant="secondary" onClick={handleLoad} disabled={!hasToken || !gistInput} className="w-full">
            <Download size={16} /> Load from Gist
          </Button>
        </section>

        {/* Status */}
        {status && (
          <p className="text-sm text-center" style={{ color: 'var(--color-text-muted)' }}>{status}</p>
        )}
      </div>
    </div>
  );
}
```

- [ ] **Step 3: Wire Share/Gist/Record into TransportBar**

Modify `src/components/organisms/TransportBar.tsx`:
- Import ShareDialog, GistDialog, getRecorder
- Add state: `showShare`, `showGist`
- Share button onClick → setShowShare(true)
- Gist button onClick → setShowGist(true)
- Record button: if recording → stopAndDownload, else → start recording
- Render ShareDialog and GistDialog conditionally

- [ ] **Step 4: Update barrel exports**

Add ShareDialog to molecules/index.ts, GistDialog to organisms/index.ts.

- [ ] **Step 5: Run tests + build**

```bash
npm run test && npx tsc --noEmit && npm run build
```

- [ ] **Step 6: Commit and push**

```bash
git add src/components/ src/lib/persistence/ src/lib/audio/recorder.ts
git commit -m "[Persistence] Add Share dialog, Gist dialog, audio recording, and wire into toolbar"
git push
```

---

## Phase 7 Completion Criteria

After all 6 tasks:
- IndexedDB persistence with autosave (serialize/deserialize with defaults)
- URL sharing via lz-string compression (#code=... hash)
- GitHub Gist save/load with PAT management (sessionStorage default, localStorage opt-in)
- Audio recording via MediaRecorder → WebM download
- Share dialog (copy URL to clipboard)
- Gist dialog (save/load with token management)
- Record button triggers recording in toolbar
- All tests passing

**Next:** Phase 8 — Landing Page & Onboarding (hero, starter templates, help panel, first-run tutorial)
