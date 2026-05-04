/* SPDX-License-Identifier: AGPL-3.0-or-later
   Copyright (c) 2026 Arnold Wender / Wender Media
   ──────────────────────────────────────────────────────────
   GitHub Gist integration — save/load projects via PAT.
   Token stored in sessionStorage by default; localStorage
   opt-in uses AES-GCM encryption (B-1 security fix).
   SECURITY: PAT encrypted with AES-GCM — key in sessionStorage,
   ciphertext in localStorage.
   ────────────────────────────────────────────────────────── */

import { Octokit } from '@octokit/rest';
import type { Project } from '../../types/project';
import { serializeProject, deserializeProject } from './local';

/* --- Storage key constants --- */

const TOKEN_KEY_SESSION = 'lmc-gist-token';           // sessionStorage: plaintext (non-remember path)
const PAT_KEY_KEY       = 'lmc-gist-key';             // sessionStorage: base64-encoded AES-GCM key
const PAT_CT_KEY        = 'lmc-gist-token-enc';       // localStorage: base64-encoded iv+ciphertext
const PAT_PLAIN_KEY     = 'lmc-gist-token-persist';   // legacy key — migration path (read-only)

/* ─────────────────────────────────────────────────────────────
   AES-GCM helpers — SubtleCrypto encryption for remember-me PAT
   ───────────────────────────────────────────────────────────── */

/** Load existing session key from sessionStorage or generate and persist a new one */
async function deriveOrLoadKey(): Promise<CryptoKey> {
  const stored = sessionStorage.getItem(PAT_KEY_KEY);
  if (stored) {
    const raw = Uint8Array.from(atob(stored), c => c.charCodeAt(0));
    return crypto.subtle.importKey('raw', raw, 'AES-GCM', false, ['encrypt', 'decrypt']);
  }
  /* Generate a fresh 256-bit key for this browser session */
  const key = await crypto.subtle.generateKey({ name: 'AES-GCM', length: 256 }, true, ['encrypt', 'decrypt']);
  const exported = await crypto.subtle.exportKey('raw', key);
  sessionStorage.setItem(PAT_KEY_KEY, btoa(String.fromCharCode(...new Uint8Array(exported))));
  return key;
}

/** Encrypt a PAT string; returns base64-encoded iv+ciphertext */
async function encryptPAT(token: string): Promise<string> {
  const key = await deriveOrLoadKey();
  const iv = crypto.getRandomValues(new Uint8Array(12));
  const enc = await crypto.subtle.encrypt({ name: 'AES-GCM', iv }, key, new TextEncoder().encode(token));
  /* Prepend iv (12 bytes) to ciphertext so we can recover it on decrypt */
  const combined = new Uint8Array(iv.byteLength + enc.byteLength);
  combined.set(iv);
  combined.set(new Uint8Array(enc), iv.byteLength);
  return btoa(String.fromCharCode(...combined));
}

/** Decrypt a base64-encoded iv+ciphertext; returns null when key is gone (new session) */
async function decryptPAT(encoded: string): Promise<string | null> {
  try {
    const key = await deriveOrLoadKey();
    const combined = Uint8Array.from(atob(encoded), c => c.charCodeAt(0));
    const iv = combined.slice(0, 12);
    const ct = combined.slice(12);
    const dec = await crypto.subtle.decrypt({ name: 'AES-GCM', iv }, key, ct);
    return new TextDecoder().decode(dec);
  } catch {
    /* Decryption fails when the sessionStorage key has been cleared (new tab/session) */
    return null;
  }
}

/* ─────────────────────────────────────────────────────────────
   Public API
   ───────────────────────────────────────────────────────────── */

/**
 * Get stored GitHub PAT.
 * Priority: sessionStorage (plain) → localStorage (AES-GCM encrypted) → legacy plain → null.
 * Clears ciphertext if the session key is gone (new session/tab).
 */
export async function getStoredToken(): Promise<string | null> {
  /* Fast path — non-remember session token (plaintext, tab-scoped) */
  const session = sessionStorage.getItem(TOKEN_KEY_SESSION);
  if (session) return session;

  /* Encrypted remember-me path */
  const ciphertext = localStorage.getItem(PAT_CT_KEY);
  if (ciphertext) {
    /* If sessionStorage key exists we can decrypt; otherwise key is gone */
    if (sessionStorage.getItem(PAT_KEY_KEY)) {
      const plain = await decryptPAT(ciphertext);
      if (plain !== null) return plain;
    }
    /* Key gone — new session/tab; clear stale ciphertext so we don't loop */
    localStorage.removeItem(PAT_CT_KEY);
    return null;
  }

  /* Legacy migration path — plaintext token written before B-1 */
  const legacy = localStorage.getItem(PAT_PLAIN_KEY);
  if (legacy) return legacy;

  return null;
}

/**
 * Store GitHub PAT.
 * remember=true → AES-GCM encrypted in localStorage (key pinned to this session).
 * remember=false → plaintext in sessionStorage only (cleared on tab close).
 */
export async function setStoredToken(token: string, remember: boolean): Promise<void> {
  /* Clear all previous storage locations before writing */
  clearStoredToken();
  if (remember) {
    const ciphertext = await encryptPAT(token);
    localStorage.setItem(PAT_CT_KEY, ciphertext);
    /* Remove legacy plaintext entry if it exists */
    localStorage.removeItem(PAT_PLAIN_KEY);
  } else {
    sessionStorage.setItem(TOKEN_KEY_SESSION, token);
  }
}

/** Clear token from all storage locations */
export function clearStoredToken(): void {
  sessionStorage.removeItem(TOKEN_KEY_SESSION);
  sessionStorage.removeItem(PAT_KEY_KEY);
  localStorage.removeItem(PAT_CT_KEY);
  localStorage.removeItem(PAT_PLAIN_KEY);
}

/** Create an authenticated Octokit instance from stored token */
async function getOctokit(): Promise<Octokit | null> {
  const token = await getStoredToken();
  if (!token) return null;
  return new Octokit({ auth: token });
}

/** Save project as a GitHub Gist (create or update) */
export async function saveToGist(
  project: Project,
  gistId?: string,
): Promise<{ id: string; url: string }> {
  const octokit = await getOctokit();
  if (!octokit) throw new Error('No GitHub token configured');

  const files: Record<string, { content: string }> = {
    'project.json': { content: serializeProject(project) },
  };

  /* Add individual code files for readability on GitHub */
  for (const file of project.files) {
    files[file.name] = { content: file.code };
  }

  if (gistId) {
    /* Update existing gist */
    const response = await octokit.gists.update({
      gist_id: gistId,
      description: `Live Music Coder: ${project.name}`,
      files,
    });
    if (!response.data.id || !response.data.html_url) {
      throw new Error('Gist update response missing id or html_url');
    }
    return { id: response.data.id, url: response.data.html_url };
  } else {
    /* Create new gist */
    const response = await octokit.gists.create({
      description: `Live Music Coder: ${project.name}`,
      public: false,
      files,
    });
    if (!response.data.id || !response.data.html_url) {
      throw new Error('Gist create response missing id or html_url');
    }
    return { id: response.data.id, url: response.data.html_url };
  }
}

/** Load project from a GitHub Gist by ID */
export async function loadFromGist(gistId: string): Promise<Project> {
  const octokit = await getOctokit();
  if (!octokit) throw new Error('No GitHub token configured');

  const response = await octokit.gists.get({ gist_id: gistId });
  const files = response.data.files;
  if (!files) throw new Error('Gist has no files');

  const projectFile = files['project.json'];
  if (!projectFile?.content) throw new Error('Gist missing project.json');

  return deserializeProject(projectFile.content);
}

/** Extract Gist ID from a URL or raw ID string */
export function parseGistId(input: string): string | null {
  /* Full URL: https://gist.github.com/user/abc123 */
  const urlMatch = input.match(/gist\.github\.com\/[\w-]+\/([a-f0-9]+)/);
  if (urlMatch) return urlMatch[1];

  /* Just the hex ID */
  if (/^[a-f0-9]+$/.test(input.trim())) return input.trim();

  return null;
}
