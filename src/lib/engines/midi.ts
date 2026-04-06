/* eslint-disable @typescript-eslint/no-explicit-any */
/* SPDX-License-Identifier: MIT
   Copyright (c) 2026 Arnold Wender / Wender Media
   ──────────────────────────────────────────────────────────
   MIDI engine adapter — external MIDI device output.
   Sends note/CC data to external MIDI devices via WebMIDI.
   Does NOT produce audio — output-only in v1.
   ────────────────────────────────────────────────────────── */

import { BaseEngine } from './base'
import type { EngineType, EngineBlock, AudioNodeWrapper } from '../../types/engine'

/** MIDI output-only engine adapter.
 * Sends note/CC data to external MIDI devices via WebMIDI.
 * Does NOT produce audio — output-only in v1. */
export class MidiEngine extends BaseEngine {
  name: EngineType = 'midi'
  private WebMidi: any = null
  private selectedOutput: any = null

  async init(): Promise<void> {
    try {
      const { WebMidi } = await import('webmidi')
      await WebMidi.enable()
      this.WebMidi = WebMidi

      /* Auto-select first available output */
      if (WebMidi.outputs.length > 0) {
        this.selectedOutput = WebMidi.outputs[0]
      }
    } catch (err) {
      console.warn('[MIDI] WebMIDI not available:', err)
    }
  }

  /** Get list of available MIDI outputs */
  getOutputs(): { id: string; name: string }[] {
    if (!this.WebMidi) return []
    return this.WebMidi.outputs.map((out: any) => ({
      id: out.id,
      name: out.name,
    }))
  }

  /** Select a MIDI output by index */
  selectOutput(index: number): void {
    if (this.WebMidi?.outputs[index]) {
      this.selectedOutput = this.WebMidi.outputs[index]
    }
  }

  /** Send a MIDI note with duration and velocity */
  playNote(note: string, duration = 500, velocity = 0.8): void {
    if (this.selectedOutput) {
      this.selectedOutput.playNote(note, { duration, attack: velocity })
    }
  }

  /** Send a MIDI CC message on a specific channel */
  sendCC(controller: number, value: number, channel = 1): void {
    if (this.selectedOutput) {
      this.selectedOutput.sendControlChange(controller, value, channel)
    }
  }

  async createNode(block: EngineBlock): Promise<AudioNodeWrapper> {
    /* MIDI doesn't create audio nodes — return a dummy gain for graph compatibility */
    const ctx = this.getContext()
    const gain = ctx.createGain()
    gain.gain.value = 0 /* silent — MIDI is output-only */

    const wrapper: AudioNodeWrapper = {
      id: `midi_${block.id}`,
      blockId: block.id,
      node: gain,
    }
    this.nodes.set(block.id, wrapper)
    return wrapper
  }

  start(): void {
    /* MIDI messages sent on demand */
  }

  stop(): void {
    /* Send all-notes-off (CC 123) on all 16 channels */
    if (this.selectedOutput) {
      for (let ch = 1; ch <= 16; ch++) {
        this.selectedOutput.sendControlChange(123, 0, ch)
      }
    }
  }

  dispose(): void {
    this.stop()
    super.dispose()
    this.WebMidi?.disable()
    this.WebMidi = null
    this.selectedOutput = null
  }
}
