// SPDX-License-Identifier: MIT
// Copyright (c) 2026 Arnold Wender / Wender Media
/* ──────────────────────────────────────────────────────────
   Store tests — transport, engine, and layout state
   ────────────────────────────────────────────────────────── */

import { describe, it, expect, beforeEach } from 'vitest'
import { useAppStore } from './store'
import { DEFAULT_BPM, MIN_BPM, MAX_BPM } from './constants'

describe('useAppStore', () => {
  /* Reset store state before each test */
  beforeEach(() => {
    useAppStore.setState(useAppStore.getInitialState())
  })

  /* --- Transport --- */

  it('has default BPM of 120', () => {
    expect(useAppStore.getState().bpm).toBe(DEFAULT_BPM)
    expect(useAppStore.getState().bpm).toBe(120)
  })

  it('togglePlay toggles isPlaying', () => {
    expect(useAppStore.getState().isPlaying).toBe(false)
    useAppStore.getState().togglePlay()
    expect(useAppStore.getState().isPlaying).toBe(true)
    useAppStore.getState().togglePlay()
    expect(useAppStore.getState().isPlaying).toBe(false)
  })

  it('stop sets isPlaying and isRecording to false', () => {
    useAppStore.setState({ isPlaying: true, isRecording: true })
    useAppStore.getState().stop()
    expect(useAppStore.getState().isPlaying).toBe(false)
    expect(useAppStore.getState().isRecording).toBe(false)
  })

  it('toggleRecord toggles isRecording', () => {
    expect(useAppStore.getState().isRecording).toBe(false)
    useAppStore.getState().toggleRecord()
    expect(useAppStore.getState().isRecording).toBe(true)
  })

  it('setBpm updates bpm value', () => {
    useAppStore.getState().setBpm(140)
    expect(useAppStore.getState().bpm).toBe(140)
  })

  it('setBpm clamps to MIN_BPM when value is too low', () => {
    useAppStore.getState().setBpm(5)
    expect(useAppStore.getState().bpm).toBe(MIN_BPM)
  })

  it('setBpm clamps to MAX_BPM when value is too high', () => {
    useAppStore.getState().setBpm(999)
    expect(useAppStore.getState().bpm).toBe(MAX_BPM)
  })

  /* --- Engine --- */

  it('has default engine of strudel', () => {
    expect(useAppStore.getState().defaultEngine).toBe('strudel')
  })

  it('setDefaultEngine updates the engine', () => {
    useAppStore.getState().setDefaultEngine('tonejs')
    expect(useAppStore.getState().defaultEngine).toBe('tonejs')
    useAppStore.getState().setDefaultEngine('midi')
    expect(useAppStore.getState().defaultEngine).toBe('midi')
  })

  /* --- Layout --- */

  it('togglePanel toggles panel visibility', () => {
    expect(useAppStore.getState().layout.visiblePanels.waveform).toBe(true)
    useAppStore.getState().togglePanel('waveform')
    expect(useAppStore.getState().layout.visiblePanels.waveform).toBe(false)
    useAppStore.getState().togglePanel('waveform')
    expect(useAppStore.getState().layout.visiblePanels.waveform).toBe(true)
  })

  it('setEditorWidth updates editor and graph widths', () => {
    useAppStore.getState().setEditorWidth(70)
    expect(useAppStore.getState().layout.editorWidth).toBe(70)
    expect(useAppStore.getState().layout.graphWidth).toBe(30)
  })

  it('setVisualizerHeight updates visualizer height', () => {
    useAppStore.getState().setVisualizerHeight(50)
    expect(useAppStore.getState().layout.visualizerHeight).toBe(50)
  })
})
