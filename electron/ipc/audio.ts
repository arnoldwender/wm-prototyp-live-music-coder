// SPDX-License-Identifier: MIT
// Copyright (c) 2026 Arnold Wender / Wender Media

import { ipcMain, dialog, BrowserWindow } from 'electron'
import { writeFile } from 'node:fs/promises'
import { encodeWav } from '../wav-encoder'

/** 30 minutes of stereo float32 at 48 kHz — far beyond any plausible take. */
const MAX_PCM_BYTES = 48_000 * 4 * 2 * 60 * 30

/** Range accepted by the WAV header's 32-bit sample-rate field, in practice. */
const MIN_SAMPLE_RATE = 8_000
const MAX_SAMPLE_RATE = 384_000

/**
 * Register audio export IPC handlers.
 * Encodes float32 PCM data to WAV and saves to disk.
 *
 * Everything crossing this boundary is renderer-supplied and therefore
 * attacker-supplied: this app evaluates shared patterns through Function() by
 * design. Validate before allocating, not after — encodeWav does
 * `Buffer.alloc(44 + n * 2)` in the MAIN process, so an oversized buffer stalls
 * the whole app, and a NaN or negative sampleRate throws ERR_OUT_OF_RANGE
 * inside writeUInt32LE.
 */
export function registerAudioHandlers(mainWindow: BrowserWindow): void {
  ipcMain.handle(
    'audio:export-wav',
    async (
      _event,
      buffer: ArrayBuffer,
      sampleRate: number,
      channels: number
    ) => {
      if (!(buffer instanceof ArrayBuffer) || buffer.byteLength === 0) {
        return { error: 'Invalid audio buffer' }
      }
      if (buffer.byteLength > MAX_PCM_BYTES) {
        return { error: 'Recording too large to export' }
      }
      if (
        !Number.isFinite(sampleRate) ||
        !Number.isInteger(sampleRate) ||
        sampleRate < MIN_SAMPLE_RATE ||
        sampleRate > MAX_SAMPLE_RATE
      ) {
        return { error: 'Invalid sample rate' }
      }
      if (!Number.isInteger(channels) || channels < 1 || channels > 2) {
        return { error: 'Invalid channel count' }
      }

      /* The dialog is also the rate limit: it is modal on the parent window, so
         a loop calling exportWav() cannot queue an unbounded stack of sheets. */
      const result = await dialog.showSaveDialog(mainWindow, {
        title: 'Export Audio',
        defaultPath: 'recording.wav',
        filters: [{ name: 'WAV Audio', extensions: ['wav'] }],
      })

      if (result.canceled || !result.filePath) return null

      try {
        const wavBuffer = encodeWav(buffer, sampleRate, channels)
        await writeFile(result.filePath, wavBuffer)
        return { path: result.filePath }
      } catch {
        return { error: 'Failed to encode or write the WAV file' }
      }
    }
  )
}
