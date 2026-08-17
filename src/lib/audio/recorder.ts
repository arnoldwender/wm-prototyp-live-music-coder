/* SPDX-License-Identifier: MIT
   Copyright (c) 2026 Arnold Wender / Wender Media
   ──────────────────────────────────────────────────────────
   AudioRecorder — captures master gain output via MediaRecorder
   and exports as WebM (opus) for download.
   Uses MediaStreamAudioDestinationNode to tap the signal chain.
   ────────────────────────────────────────────────────────── */

import { getSharedContext, getMasterGain } from './context'
import { getStrudelOutputNode } from './strudel-tap'

/** Records audio from the master gain node and exports as WebM download. */
export class AudioRecorder {
  private mediaRecorder: MediaRecorder | null = null
  private chunks: Blob[] = []
  private stream: MediaStream | null = null
  private destination: MediaStreamAudioDestinationNode | null = null

  /** Node tapped in addition to masterGain, kept so stop() can disconnect it. */
  private strudelTap: AudioNode | null = null

  /**
   * Start recording — taps master gain into a MediaStreamDestination.
   *
   * Strudel is tapped SEPARATELY and deliberately. superdough terminates at
   * `audioContext.destination`, not at masterGain, so a recording that only
   * tapped the master bus captured silence for the default engine — which is
   * every session in the library. adoptSharedContextForStrudel() puts both on
   * the same context, which is what makes a single MediaStreamDestination able
   * to receive both.
   */
  start(): void {
    const ctx = getSharedContext()
    this.destination = ctx.createMediaStreamDestination()
    getMasterGain().connect(this.destination)

    /* Fire-and-forget: superdough's controller only exists once a note has
     * played. If it is not up yet the recording still captures Tone.js and
     * WebAudio; if it comes up during the take, it joins from that point. */
    void getStrudelOutputNode().then((node) => {
      if (!node || !this.destination) return
      if (node.context !== this.destination.context) return
      node.connect(this.destination)
      this.strudelTap = node
    })

    this.stream = this.destination.stream

    this.chunks = []
    this.mediaRecorder = new MediaRecorder(this.stream, {
      mimeType: 'audio/webm;codecs=opus',
    })

    this.mediaRecorder.ondataavailable = (e) => {
      if (e.data.size > 0) this.chunks.push(e.data)
    }

    /* Collect data every 100ms for near-real-time chunk availability */
    this.mediaRecorder.start(100)
  }

  /** Stop recording and return the audio blob */
  stop(): Promise<Blob> {
    return new Promise((resolve, reject) => {
      if (!this.mediaRecorder) {
        reject(new Error('Not recording'))
        return
      }

      this.mediaRecorder.onstop = () => {
        const blob = new Blob(this.chunks, { type: 'audio/webm' })
        this.cleanup()
        resolve(blob)
      }

      this.mediaRecorder.onerror = (event) => {
        this.cleanup()
        reject(new Error(`MediaRecorder error: ${event instanceof ErrorEvent ? event.message : 'unknown'}`))
      }

      this.mediaRecorder.stop()
    })
  }

  /** Stop recording and trigger a browser download */
  async stopAndDownload(filename = 'recording'): Promise<void> {
    const blob = await this.stop()
    const url = URL.createObjectURL(blob)

    /* Programmatic anchor click to trigger download dialog */
    const a = document.createElement('a')
    a.href = url
    a.download = `${filename}.webm`
    a.click()
    URL.revokeObjectURL(url)
  }

  /** Whether the recorder is currently capturing audio */
  isRecording(): boolean {
    return this.mediaRecorder?.state === 'recording'
  }

  /** Disconnect destination and release all references */
  private cleanup(): void {
    if (this.destination) {
      try {
        getMasterGain().disconnect(this.destination)
      } catch {
        /* Already disconnected — safe to ignore */
      }
      if (this.strudelTap) {
        try {
          /* Disconnect only this edge, not every consumer of superdough's
             output — the visualizer analyser hangs off the same node. */
          this.strudelTap.disconnect(this.destination)
        } catch {
          /* Already disconnected — safe to ignore */
        }
      }
    }
    this.strudelTap = null
    this.mediaRecorder = null
    this.destination = null
    this.stream = null
    this.chunks = []
  }
}

/* Singleton recorder instance — one recorder per app */
let recorderInstance: AudioRecorder | null = null

export function getRecorder(): AudioRecorder {
  if (!recorderInstance) recorderInstance = new AudioRecorder()
  return recorderInstance
}
