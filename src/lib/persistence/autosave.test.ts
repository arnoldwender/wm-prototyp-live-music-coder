// SPDX-License-Identifier: AGPL-3.0-or-later
// Copyright (c) 2026 Arnold Wender / Wender Media

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { startAutosave, AUTOSAVE_ID, AUTOSAVE_SCHEMA_VERSION } from './autosave';
import { deserializeProject } from './local';
import { DEFAULT_LAYOUT } from '../constants';
import type { Project } from '../../types/project';

const project = (): Project => ({
  id: 'p',
  name: 'n',
  version: 1,
  created: '',
  updated: '',
  bpm: 120,
  defaultEngine: 'strudel',
  files: [{ id: 'f', name: 'main.js', engine: 'strudel', code: 's("bd")', active: true }],
  graph: { nodes: [], edges: [], viewport: { x: 0, y: 0, zoom: 1 } },
  layout: DEFAULT_LAYOUT,
});

describe('autosave slot', () => {
  it('uses a single fixed id so recovery cannot fan out into a project list', () => {
    expect(AUTOSAVE_ID).toBe('autosave');
    expect(AUTOSAVE_SCHEMA_VERSION).toBeGreaterThanOrEqual(1);
  });
});

describe('startAutosave', () => {
  beforeEach(() => vi.useFakeTimers());
  afterEach(() => vi.useRealTimers());

  it('debounces: a burst of changes produces one write, not one per change', () => {
    let listener: (() => void) | null = null;
    const subscribe = (l: () => void) => {
      listener = l;
      return () => { listener = null; };
    };
    const getProject = vi.fn(project);

    const stop = startAutosave(subscribe, getProject, 100);

    listener!();
    vi.advanceTimersByTime(50);
    listener!();
    vi.advanceTimersByTime(50);
    listener!();
    expect(getProject).not.toHaveBeenCalled(); // still inside the debounce

    vi.advanceTimersByTime(100);
    expect(getProject).toHaveBeenCalledTimes(1);

    stop();
  });

  it('writes nothing when the store never changes', () => {
    const subscribe = () => () => {};
    const getProject = vi.fn(project);
    const stop = startAutosave(subscribe, getProject, 100);

    vi.advanceTimersByTime(10_000);
    expect(getProject).not.toHaveBeenCalled();

    stop();
  });

  it('cancels a pending write on cleanup', () => {
    let listener: (() => void) | null = null;
    const subscribe = (l: () => void) => { listener = l; return () => {}; };
    const getProject = vi.fn(project);

    const stop = startAutosave(subscribe, getProject, 100);
    listener!();
    stop();
    vi.advanceTimersByTime(500);

    expect(getProject).not.toHaveBeenCalled();
  });
});

describe('deserializeProject layout fallback', () => {
  it('restores every panel DEFAULT_LAYOUT defines, not a stale subset', () => {
    // The hand-written literal that used to live here listed 4 visiblePanels
    // while DEFAULT_LAYOUT defines 7, so punchcard, spiral and pitchwheel came
    // back undefined for any project saved without a layout. tsc could not catch
    // it because the parsed JSON is `any`.
    const restored = deserializeProject(JSON.stringify({ files: [], bpm: 120 }));

    const expected = Object.keys(DEFAULT_LAYOUT.visiblePanels).sort();
    const actual = Object.keys(restored.layout.visiblePanels).sort();
    expect(actual).toEqual(expected);

    for (const key of expected) {
      expect(
        restored.layout.visiblePanels[key as keyof typeof restored.layout.visiblePanels],
        `visiblePanels.${key} must not be undefined`,
      ).toBeTypeOf('boolean');
    }
  });

  it('does not alias the module-level default', () => {
    const a = deserializeProject(JSON.stringify({}));
    a.layout.visiblePanels.waveform = !a.layout.visiblePanels.waveform;
    const b = deserializeProject(JSON.stringify({}));
    expect(b.layout.visiblePanels.waveform).toBe(DEFAULT_LAYOUT.visiblePanels.waveform);
  });
});
