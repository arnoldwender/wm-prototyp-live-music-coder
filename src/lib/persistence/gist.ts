/* SPDX-License-Identifier: AGPL-3.0-or-later
   Copyright (c) 2026 Arnold Wender / Wender Media
   ──────────────────────────────────────────────────────────
   GitHub Gist integration — save/load projects via PAT.

   SECURITY ARCHITECTURE:
   · Web build: Evaluated musical patterns execute via `new Function()` in the
     same browser origin, where `localStorage` and `sessionStorage` are directly
     readable. Therefore the web build NEVER writes GitHub PATs to Web Storage
     and actively scrubs legacy storage keys on startup. Instead, the token lives
     only in a module-private lexical variable while the Gist dialog is open and
     is wiped immediately on `clearStoredToken()` / dialog close / untrusted load.
   · Desktop (Electron) build: PAT is encrypted with a key from the OS keychain
     (`safeStorage`) inside the main process, never crosses `contextBridge` back
     to the renderer, and both storing it and uploading with it require a native
     confirmation dialog.
   · What this does NOT cover: the token is typed into a field of this page, so
     code already running in the page at that moment can read the keystrokes.
     Keeping it out of storage shortens that window; it does not close it.
   ────────────────────────────────────────────────────────── */

import { Octokit } from '@octokit/rest'
import type { Project } from '../../types/project'
import { serializeProject, deserializeProject } from './local'

/* Legacy storage keys scrubbed on load to protect returning users */
const LEGACY_STORAGE_KEYS = [
  'lmc-gist-token',
  'lmc-gist-key',
  'lmc-gist-token-enc',
  'lmc-gist-token-persist',
] as const

/** Ephemeral in-memory token for the active Gist dialog session on the web. */
let ephemeralWebToken: string | null = null

/** Scrub any historical PAT artifacts from Web Storage. */
export function purgeLegacyGistStorage(): void {
  try {
    for (const key of LEGACY_STORAGE_KEYS) {
      sessionStorage.removeItem(key)
      localStorage.removeItem(key)
    }
  } catch {
    /* Storage unavailable (SSR or restricted context) */
  }
}

purgeLegacyGistStorage()

function getElectronApi() {
  return typeof window !== 'undefined' ? window.electronAPI : undefined
}

/** Whether a GitHub PAT is currently configured (ephemeral web or Electron Keychain). */
export async function hasStoredToken(): Promise<boolean> {
  purgeLegacyGistStorage()
  const api = getElectronApi()
  if (api?.hasGistToken) {
    return api.hasGistToken()
  }
  return Boolean(ephemeralWebToken)
}

/**
 * Retrieve the active in-memory GitHub PAT on the web (null in Electron where
 * the secret remains isolated inside the main process).
 */
export async function getStoredToken(): Promise<string | null> {
  purgeLegacyGistStorage()
  return ephemeralWebToken
}

/**
 * Configure the GitHub PAT.
 * - Electron: encrypted via OS `safeStorage` in the main process.
 * - Web: held strictly in module-private ephemeral memory (never Web Storage).
 */
export async function setStoredToken(token: string, _remember = false): Promise<void> {
  purgeLegacyGistStorage()
  const trimmed = token.trim()
  const api = getElectronApi()
  if (api?.setGistToken) {
    ephemeralWebToken = null
    if (!trimmed) {
      await api.clearGistToken()
      return
    }
    /* false: the user declined the native confirmation, or the OS has no keychain */
    const ok = await api.setGistToken(trimmed)
    if (!ok) throw new Error('The token was not stored')
    return
  }
  ephemeralWebToken = trimmed || null
}

/** Wipe only ephemeral web memory + legacy Web Storage (leaves Electron Keychain intact). */
export function clearEphemeralWebToken(): void {
  ephemeralWebToken = null
  purgeLegacyGistStorage()
}

/** Wipe any ephemeral token in memory, Electron Keychain, and legacy Web Storage. */
export function clearStoredToken(): void {
  clearEphemeralWebToken()
  const api = getElectronApi()
  if (api?.clearGistToken) {
    void api.clearGistToken()
  }
}

/**
 * Save project as a GitHub Gist (create or update).
 * `isPublic` defaults to false (secret Gist).
 */
export async function saveToGist(
  project: Project,
  gistId?: string,
  isPublic = false,
): Promise<{ id: string; url: string }> {
  const files: Record<string, { content: string }> = {
    'project.json': { content: serializeProject(project) },
  }
  for (const file of project.files) {
    files[file.name] = { content: file.code }
  }
  const description = `Live Music Coder: ${project.name}`

  const api = getElectronApi()
  if (api?.saveGist) {
    return api.saveGist({ files, description, gistId, isPublic })
  }

  const token = await getStoredToken()
  if (!token) throw new Error('No GitHub token configured')
  const octokit = new Octokit({ auth: token })

  if (gistId) {
    const response = await octokit.gists.update({
      gist_id: gistId,
      description,
      files,
    })
    if (!response.data.id || !response.data.html_url) {
      throw new Error('Gist update response missing id or html_url')
    }
    return { id: response.data.id, url: response.data.html_url }
  }

  const response = await octokit.gists.create({
    description,
    public: isPublic,
    files,
  })
  if (!response.data.id || !response.data.html_url) {
    throw new Error('Gist create response missing id or html_url')
  }
  return { id: response.data.id, url: response.data.html_url }
}

/**
 * Load project from a GitHub Gist by ID.
 * Public and secret Gists are readable by ID without authentication, so the
 * request never carries the token — reading someone's Gist is not a reason to
 * send a credential. Any ephemeral web token is wiped before the untrusted
 * project code enters the editor.
 */
export async function loadFromGist(gistId: string): Promise<Project> {
  const octokit = new Octokit()

  const response = await octokit.gists.get({ gist_id: gistId })
  const files = response.data.files
  if (!files) throw new Error('Gist has no files')

  const projectFile = files['project.json']
  if (!projectFile?.content) throw new Error('Gist missing project.json')

  const project = deserializeProject(projectFile.content)
  /* Wipe ephemeral web token before untrusted external Gist code can be evaluated */
  ephemeralWebToken = null
  return project
}

/** Extract Gist ID from a URL or raw ID string */
export function parseGistId(input: string): string | null {
  const urlMatch = input.match(/gist\.github\.com\/[\w-]+\/([a-f0-9]+)/)
  if (urlMatch) return urlMatch[1]
  if (/^[a-f0-9]+$/.test(input.trim())) return input.trim()
  return null
}
