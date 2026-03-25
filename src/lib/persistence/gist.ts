/* ──────────────────────────────────────────────────────────
   GitHub Gist integration — save/load projects via PAT.
   Token stored in sessionStorage by default, localStorage
   opt-in for persistent remember-me.
   ────────────────────────────────────────────────────────── */

import { Octokit } from '@octokit/rest';
import type { Project } from '../../types/project';
import { serializeProject, deserializeProject } from './local';

const TOKEN_KEY_SESSION = 'lmc-gist-token';
const TOKEN_KEY_LOCAL = 'lmc-gist-token-persist';

/** Get stored GitHub PAT — checks sessionStorage first, then localStorage */
export function getStoredToken(): string | null {
  return sessionStorage.getItem(TOKEN_KEY_SESSION)
    ?? localStorage.getItem(TOKEN_KEY_LOCAL)
    ?? null;
}

/** Store GitHub PAT. remember=true persists in localStorage. */
export function setStoredToken(token: string, remember: boolean): void {
  clearStoredToken();
  if (remember) {
    localStorage.setItem(TOKEN_KEY_LOCAL, token);
  } else {
    sessionStorage.setItem(TOKEN_KEY_SESSION, token);
  }
}

/** Clear token from both storages */
export function clearStoredToken(): void {
  sessionStorage.removeItem(TOKEN_KEY_SESSION);
  localStorage.removeItem(TOKEN_KEY_LOCAL);
}

/** Create an authenticated Octokit instance from stored token */
function getOctokit(): Octokit | null {
  const token = getStoredToken();
  if (!token) return null;
  return new Octokit({ auth: token });
}

/** Save project as a GitHub Gist (create or update) */
export async function saveToGist(
  project: Project,
  gistId?: string,
): Promise<{ id: string; url: string }> {
  const octokit = getOctokit();
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
    return { id: response.data.id!, url: response.data.html_url! };
  } else {
    /* Create new gist */
    const response = await octokit.gists.create({
      description: `Live Music Coder: ${project.name}`,
      public: false,
      files,
    });
    return { id: response.data.id!, url: response.data.html_url! };
  }
}

/** Load project from a GitHub Gist by ID */
export async function loadFromGist(gistId: string): Promise<Project> {
  const octokit = getOctokit();
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
