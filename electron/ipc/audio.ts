// SPDX-License-Identifier: MIT
// Copyright (c) 2026 Arnold Wender / Wender Media

import { ipcMain, dialog, BrowserWindow } from 'electron'
import { writeFile } from 'node:fs/promises'
import { encodeWav } from '../wav-encoder'

/**
 * Register audio export IPC handlers.
 * Encodes float32 PCM data to WAV and saves to disk.
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
      const result = await dialog.showSaveDialog(mainWindow, {
        title: 'Export Audio',
        defaultPath: 'recording.wav',
        filters: [{ name: 'WAV Audio', extensions: ['wav'] }],
      })

      if (result.canceled || !result.filePath) return null

      const wavBuffer = encodeWav(buffer, sampleRate, channels)
      await writeFile(result.filePath, wavBuffer)

      return { path: result.filePath }
    }
  )
}
