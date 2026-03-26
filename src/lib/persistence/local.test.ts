import { describe, it, expect } from 'vitest';
import { serializeProject, deserializeProject } from './local';
import type { Project } from '../../types/project';

/* Note: Full IndexedDB tests require fake-indexeddb.
 * These test serialization/deserialization logic. */

function createMockProject(): Project {
  return {
    id: 'test-1',
    name: 'Test Project',
    version: 1,
    created: new Date().toISOString(),
    updated: new Date().toISOString(),
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
      editorWidth: 100,
      graphWidth: 0,
      visualizerHeight: 30,
      showGraph: false,
      visiblePanels: { waveform: true, spectrum: true, timeline: true, pianoroll: false, beatlings: true, brain: false },
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
