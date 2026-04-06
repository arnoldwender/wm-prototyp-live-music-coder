/* eslint-disable @typescript-eslint/no-explicit-any */
/* SPDX-License-Identifier: MIT
   Copyright (c) 2026 Arnold Wender / Wender Media
   ──────────────────────────────────────────────────────────
   Web Audio engine adapter — raw Web Audio API access.
   Tracks all created sources/nodes so they can be stopped
   on re-evaluate (prevents overlapping playback).
   ────────────────────────────────────────────────────────── */

import { BaseEngine } from './base'
import type { EngineType, EngineBlock, AudioNodeWrapper } from '../../types/engine'
import { getSharedContext, getMasterGain, getMasterAnalyser, resumeContext } from '../audio/context'
import { resetStrudelTap } from '../audio/strudel-tap'

export class WebAudioEngine extends BaseEngine {
  name: EngineType = 'webaudio'
  /* Track all sources created by user code so we can stop them on re-eval */
  private activeSources: AudioScheduledSourceNode[] = []

  async init(): Promise<void> {
    /* No external deps — Web Audio API is native */
  }

  async createNode(block: EngineBlock): Promise<AudioNodeWrapper> {
    const ctx = this.getContext()
    const gain = ctx.createGain()
    gain.connect(getMasterGain())

    const wrapper: AudioNodeWrapper = {
      id: `webaudio_${block.id}`,
      blockId: block.id,
      node: gain,
    }
    this.nodes.set(block.id, wrapper)
    return wrapper
  }

  /** Evaluate raw Web Audio code.
   * Stops all previous sources before running new code. */
  async evaluate(code: string): Promise<void> {
    await resumeContext()

    /* Stop all previously created sources to prevent overlapping playback */
    this.stopAllSources()

    const ctx = getSharedContext()
    const masterGain = getMasterGain()
    const activeSources = this.activeSources

    /* Proxy ctx: intercept .destination → masterGain, and track created sources */
    const ctxProxy = new Proxy(ctx, {
      get(target, prop) {
        if (prop === 'destination') return masterGain

        /* Intercept createOscillator/createBufferSource to track sources */
        if (prop === 'createOscillator' || prop === 'createBufferSource' || prop === 'createConstantSource') {
          return (...args: any[]) => {
            const source = (target as any)[prop](...args)
            activeSources.push(source)
            return source
          }
        }

        const val = (target as any)[prop]
        return typeof val === 'function' ? val.bind(target) : val
      }
    })

    /* Strip user's new AudioContext() */
    const patchedCode = code
      .replace(/(?:const|let|var)\s+ctx\s*=\s*new\s+AudioContext\s*\([^)]*\)\s*;?/g, '/* ctx provided by engine */')
      .replace(/new\s+AudioContext\s*\([^)]*\)/g, 'ctx')

    try {
      await Function('ctx', 'out', `"use strict"; return (async () => { ${patchedCode} })()`)(
        ctxProxy, masterGain
      )
      resetStrudelTap()
    } catch (err) {
      console.error('[WebAudio] Evaluation error:', err)
      throw err
    }
  }

  start(): void {
    /* Web Audio nodes are started individually via user code */
  }

  stop(): void {
    this.stopAllSources()
    for (const wrapper of this.nodes.values()) {
      try { wrapper.node.disconnect() } catch { /* ok */ }
    }
  }

  /** Stop and disconnect all tracked audio sources */
  private stopAllSources(): void {
    for (const src of this.activeSources) {
      try { src.stop() } catch { /* already stopped */ }
      try { src.disconnect() } catch { /* ok */ }
    }
    this.activeSources = []
    /* Reconnect masterGain chain in case user code added extra connections */
    try {
      const mg = getMasterGain()
      const an = getMasterAnalyser()
      mg.disconnect()
      mg.connect(an)
      an.connect(getSharedContext().destination)
    } catch { /* reconnect failed */ }
  }
}
