// SPDX-License-Identifier: MIT
// Copyright (c) 2026 Arnold Wender / Wender Media

import { BrowserWindow, dialog, ipcMain, safeStorage } from 'electron'
import { appStore } from '../store'
import { describeGistUpload, validateGistPayload } from '../gist-payload'

const MAX_TOKEN_LENGTH = 256

function readDecryptedToken(): string | null {
  const encoded = appStore.get('encryptedGistToken')
  if (!encoded || !safeStorage.isEncryptionAvailable()) return null
  try {
    return safeStorage.decryptString(Buffer.from(encoded, 'base64'))
  } catch {
    appStore.set('encryptedGistToken', null)
    return null
  }
}

/* One confirmation at a time: evaluated code could otherwise stack dialogs
   until one of them catches a stray click. */
let confirmationOpen = false

/**
 * Ask the user in a native dialog. "Cancel" is the default button on purpose:
 * this is a live-coding editor, the user is typing, and a dialog that appears
 * under their hands must not turn the next Return into a confirmation.
 */
async function confirmNatively(
  mainWindow: BrowserWindow,
  options: { title: string; message: string; detail: string; confirmLabel: string },
): Promise<boolean> {
  if (confirmationOpen) return false
  confirmationOpen = true
  try {
    const { response } = await dialog.showMessageBox(mainWindow, {
      type: 'question',
      buttons: ['Cancel', options.confirmLabel],
      defaultId: 0,
      cancelId: 0,
      title: options.title,
      message: options.message,
      detail: options.detail,
    })
    return response === 1
  } finally {
    confirmationOpen = false
  }
}

/**
 * Register GitHub Gist IPC handlers for Electron.
 *
 * SECURITY: The renderer evaluates shared musical patterns as code, so every
 * handler here can be called by a stranger's pattern. The GitHub PAT never
 * crosses `contextBridge` back into the renderer, it is encrypted at rest with
 * a key from the OS keychain (`safeStorage`), and nothing that sends data or
 * replaces the stored token happens without a native confirmation.
 */
export function registerGistHandlers(mainWindow: BrowserWindow): void {
  ipcMain.handle('gist:has-token', () => {
    return readDecryptedToken() !== null
  })

  ipcMain.handle('gist:set-token', async (_event, token: unknown) => {
    if (typeof token !== 'string') return false
    const trimmed = token.trim()
    if (trimmed.length === 0 || trimmed.length > MAX_TOKEN_LENGTH) return false
    if (!safeStorage.isEncryptionAvailable()) return false

    /* Without this, evaluated code could swap in its author's token in silence
       and every later upload — confirmed by the user — would land in a
       stranger's account. */
    const confirmed = await confirmNatively(mainWindow, {
      title: 'Store GitHub Token',
      message: 'Store this GitHub token for Gist uploads?',
      detail:
        'It is encrypted with a key from your system keychain and replaces any token stored before. ' +
        'Confirm only if you just entered it yourself in the Gist dialog.',
      confirmLabel: 'Store Token',
    })
    if (!confirmed) return false

    const encrypted = safeStorage.encryptString(trimmed).toString('base64')
    appStore.set('encryptedGistToken', encrypted)
    return true
  })

  ipcMain.handle('gist:clear-token', () => {
    appStore.set('encryptedGistToken', null)
  })

  ipcMain.handle('gist:save', async (_event, payload: unknown) => {
    const token = readDecryptedToken()
    if (!token) throw new Error('No GitHub token configured')

    const upload = validateGistPayload(payload)
    const { message, detail } = describeGistUpload(upload)

    const confirmed = await confirmNatively(mainWindow, {
      title: 'Confirm GitHub Gist Upload',
      message,
      detail,
      confirmLabel: upload.gistId ? 'Overwrite Gist' : 'Upload to GitHub',
    })
    if (!confirmed) {
      throw new Error('Gist upload cancelled')
    }

    const endpoint = upload.gistId
      ? `https://api.github.com/gists/${encodeURIComponent(upload.gistId)}`
      : 'https://api.github.com/gists'

    const body = upload.gistId
      ? { description: upload.description, files: upload.files }
      : { description: upload.description, public: upload.isPublic, files: upload.files }

    const response = await fetch(endpoint, {
      method: upload.gistId ? 'PATCH' : 'POST',
      headers: {
        Accept: 'application/vnd.github+json',
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
        'User-Agent': 'Live-Music-Coder-Desktop',
        'X-GitHub-Api-Version': '2022-11-28',
      },
      body: JSON.stringify(body),
    })

    if (!response.ok) {
      throw new Error(`GitHub API error (${response.status})`)
    }

    const data = (await response.json()) as { id?: string; html_url?: string }
    if (!data.id || !data.html_url) {
      throw new Error('GitHub Gist response missing id or html_url')
    }
    return { id: data.id, url: data.html_url }
  })
}
