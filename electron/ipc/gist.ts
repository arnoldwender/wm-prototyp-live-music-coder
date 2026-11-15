// SPDX-License-Identifier: MIT
// Copyright (c) 2026 Arnold Wender / Wender Media

import { BrowserWindow, dialog, ipcMain, safeStorage } from 'electron'
import { appStore } from '../store'

export interface MainGistSavePayload {
  files: Record<string, { content: string }>
  description: string
  gistId?: string
  isPublic: boolean
}

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

/**
 * Register GitHub Gist IPC handlers for Electron.
 *
 * SECURITY: The renderer runs shared musical patterns via `new Function()`, so
 * the GitHub PAT NEVER crosses `contextBridge` back into the renderer. It is
 * encrypted at rest with OS keychain `safeStorage` and used exclusively inside
 * the main process after explicit native dialog confirmation.
 */
export function registerGistHandlers(mainWindow: BrowserWindow): void {
  ipcMain.handle('gist:has-token', () => {
    return readDecryptedToken() !== null
  })

  ipcMain.handle('gist:set-token', (_event, token: unknown) => {
    if (typeof token !== 'string') return false
    const trimmed = token.trim()
    if (trimmed.length === 0 || trimmed.length > 256) return false
    if (!safeStorage.isEncryptionAvailable()) return false
    const encrypted = safeStorage.encryptString(trimmed).toString('base64')
    appStore.set('encryptedGistToken', encrypted)
    return true
  })

  ipcMain.handle('gist:clear-token', () => {
    appStore.set('encryptedGistToken', null)
  })

  ipcMain.handle('gist:save', async (_event, payload: MainGistSavePayload) => {
    const token = readDecryptedToken()
    if (!token) throw new Error('No GitHub token configured')

    if (!payload || typeof payload !== 'object' || !payload.files || typeof payload.files !== 'object') {
      throw new Error('Invalid Gist payload')
    }

    const visibilityLabel = payload.gistId
      ? 'update existing Gist'
      : payload.isPublic
        ? 'create a PUBLIC Gist'
        : 'create a secret Gist'

    const confirm = await dialog.showMessageBox(mainWindow, {
      type: 'question',
      buttons: ['Publish to GitHub Gist', 'Cancel'],
      defaultId: 0,
      cancelId: 1,
      title: 'Confirm GitHub Gist Upload',
      message: `Do you want to ${visibilityLabel} on GitHub?`,
      detail: 'Your current project code will be uploaded to gist.github.com using your saved token.',
    })

    if (confirm.response !== 0) {
      throw new Error('Gist upload cancelled')
    }

    const endpoint = payload.gistId
      ? `https://api.github.com/gists/${encodeURIComponent(payload.gistId)}`
      : 'https://api.github.com/gists'

    const body = payload.gistId
      ? { description: String(payload.description ?? '').slice(0, 256), files: payload.files }
      : {
          description: String(payload.description ?? '').slice(0, 256),
          public: Boolean(payload.isPublic),
          files: payload.files,
        }

    const response = await fetch(endpoint, {
      method: payload.gistId ? 'PATCH' : 'POST',
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
