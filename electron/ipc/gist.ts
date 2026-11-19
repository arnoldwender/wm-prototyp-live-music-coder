// SPDX-License-Identifier: MIT
// Copyright (c) 2026 Arnold Wender / Wender Media

import { BrowserWindow, clipboard, dialog, ipcMain, safeStorage } from 'electron'
import { appStore } from '../store'
import { describeGistUpload, validateClipboardToken, validateGistPayload } from '../gist-payload'

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

  ipcMain.handle('gist:import-clipboard-token', async () => {
    if (!safeStorage.isEncryptionAvailable()) {
      return { ok: false as const, reason: 'unavailable' as const }
    }

    const check = validateClipboardToken(clipboard.readText())
    if (!check.ok) {
      return { ok: false as const, reason: check.reason }
    }

    /* Ask natively before storing and wipe the clipboard so the PAT never
       enters the renderer HTML realm, even while being entered. */
    const confirmed = await confirmNatively(mainWindow, {
      title: 'Store GitHub Token from Clipboard',
      message: `Store clipboard token (${check.masked}, ${check.token.length} chars) in Keychain?`,
      detail:
        'The token will be encrypted with your system keychain, cleared from the clipboard, and never exposed to editor patterns.',
      confirmLabel: 'Store Token',
    })
    if (!confirmed) {
      return { ok: false as const, reason: 'cancelled' as const }
    }

    const encrypted = safeStorage.encryptString(check.token).toString('base64')
    appStore.set('encryptedGistToken', encrypted)
    clipboard.clear()
    return { ok: true as const }
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
