/* ──────────────────────────────────────────────────────────
   IndexedDB local persistence via idb — autosave projects,
   serialize/deserialize with defaults for missing fields.
   ────────────────────────────────────────────────────────── */

import { openDB, type IDBPDatabase } from 'idb';
import type { Project } from '../../types/project';

const DB_NAME = 'live-music-coder';
const DB_VERSION = 1;
const STORE_PROJECTS = 'projects';
const STORE_COLLECTION = 'collection';

let db: IDBPDatabase | null = null;

/** Open or reuse the IndexedDB connection */
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
  await database.put(STORE_PROJECTS, { ...project, updated: new Date().toISOString() });
}

/** Load project from IndexedDB */
export async function loadProject(id: string): Promise<Project | undefined> {
  const database = await getDb();
  return database.get(STORE_PROJECTS, id);
}

/** List all saved projects (id, name, updated) */
export async function listProjects(): Promise<{ id: string; name: string; updated: string }[]> {
  const database = await getDb();
  const all = await database.getAll(STORE_PROJECTS);
  return all.map((p) => ({ id: p.id, name: p.name, updated: p.updated }));
}

/** Delete a project from IndexedDB */
export async function deleteProject(id: string): Promise<void> {
  const database = await getDb();
  await database.delete(STORE_PROJECTS, id);
}

/** Serialize project to JSON string (for export/sharing) */
export function serializeProject(project: Project): string {
  return JSON.stringify(project);
}

/** Valid engine types for input validation */
const VALID_ENGINES = new Set(['strudel', 'tonejs', 'webaudio', 'midi']);

/** Deserialize JSON to project with defaults for missing fields */
export function deserializeProject(json: string): Project {
  const parsed = JSON.parse(json);

  /* Validate critical fields to prevent unsafe deserialization */
  if (parsed.files != null && !Array.isArray(parsed.files)) {
    throw new Error('Invalid project: files must be an array');
  }
  if (parsed.bpm != null && (typeof parsed.bpm !== 'number' || !Number.isFinite(parsed.bpm))) {
    throw new Error('Invalid project: bpm must be a finite number');
  }
  if (parsed.defaultEngine != null && !VALID_ENGINES.has(parsed.defaultEngine)) {
    throw new Error(`Invalid project: unknown engine "${parsed.defaultEngine}"`);
  }

  const now = new Date().toISOString();
  return {
    id: parsed.id ?? `project_${Date.now()}`,
    name: parsed.name ?? 'Untitled',
    version: 1,
    created: parsed.created ?? now,
    updated: parsed.updated ?? now,
    bpm: parsed.bpm ?? 120,
    defaultEngine: parsed.defaultEngine ?? 'strudel',
    files: parsed.files ?? [{ id: 'file_1', name: 'main.js', engine: 'strudel', code: '', active: true }],
    graph: parsed.graph ?? { nodes: [], edges: [], viewport: { x: 0, y: 0, zoom: 1 } },
    layout: parsed.layout ?? {
      editorWidth: 50, graphWidth: 50, visualizerHeight: 30, showGraph: false,
      visiblePanels: { waveform: true, spectrum: true, timeline: true, beatlings: true },
    },
    ecosystem: parsed.ecosystem ?? { creatures: [], golGrid: { width: 64, height: 64, liveCells: [] }, collection: [] },
  };
}

/** Set up autosave interval — returns cleanup function */
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
