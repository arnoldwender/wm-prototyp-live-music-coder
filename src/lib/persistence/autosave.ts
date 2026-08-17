// SPDX-License-Identifier: AGPL-3.0-or-later
// Copyright (c) 2026 Arnold Wender / Wender Media

/**
 * Session autosave.
 *
 * The IndexedDB layer in ./local.ts shipped fully written and with zero
 * consumers, so nothing in the app ever persisted a session. That matters more
 * than the missing feature suggests: the service worker calls skipWaiting() on
 * install and navigates every open client on activate, so a deploy reloads a
 * live-coding session mid-set — and until now there was nothing to come back to.
 *
 * Design notes:
 *
 * · Change-driven, not interval-driven. setupAutosave() in ./local.ts uses
 *   setInterval and writes whether or not anything changed. Here the store
 *   subscription drives a debounce, so an idle tab performs no writes at all.
 *
 * · One fixed record. Autosave is a crash-recovery slot, not a project list, so
 *   it always writes the same id. Named saves are a separate feature and can use
 *   saveProject() directly without colliding.
 *
 * · Versioned from the start. schemaVersion is written now, while there are zero
 *   records in the wild, precisely so a future shape change has somewhere to
 *   branch. loadAutosave() refuses a record from a newer schema rather than
 *   guessing at it.
 */

import type { Project } from '../../types/project';
import { saveProject, loadProject, deleteProject } from './local';

/** Fixed key for the crash-recovery slot. */
export const AUTOSAVE_ID = 'autosave';

/** Bump when the persisted Project shape changes incompatibly. */
export const AUTOSAVE_SCHEMA_VERSION = 1;

/** Idle time before a change is written. */
const DEBOUNCE_MS = 2000;

type Stored = Project & { schemaVersion?: number };

/**
 * Persist the current session under the autosave slot.
 * Exported for tests and for an explicit "save now" path.
 */
export async function writeAutosave(project: Project): Promise<void> {
  const record: Stored = {
    ...project,
    id: AUTOSAVE_ID,
    schemaVersion: AUTOSAVE_SCHEMA_VERSION,
  };
  await saveProject(record);
}

/**
 * Read the autosave slot.
 *
 * Returns null when there is nothing to restore, and also when the record comes
 * from a NEWER schema than this build understands — that happens whenever an
 * older tab or an older desktop build opens after a newer one, and silently
 * loading a shape we cannot read is worse than offering nothing.
 */
export async function readAutosave(): Promise<Project | null> {
  try {
    const stored = (await loadProject(AUTOSAVE_ID)) as Stored | undefined;
    if (!stored) return null;
    const version = stored.schemaVersion ?? 1;
    if (version > AUTOSAVE_SCHEMA_VERSION) return null;
    return stored;
  } catch {
    /* IndexedDB unavailable (private mode, blocked storage) — not an error the
       user needs to see; the app simply has no recovery slot. */
    return null;
  }
}

/** Drop the autosave slot, e.g. after the user declines to restore. */
export async function clearAutosave(): Promise<void> {
  try {
    await deleteProject(AUTOSAVE_ID);
  } catch {
    /* nothing to clear */
  }
}

/**
 * Start change-driven autosave.
 *
 * `subscribe` is the Zustand store's subscribe; `getProject` builds the Project
 * snapshot. Returns a cleanup that unsubscribes and cancels a pending write.
 */
export function startAutosave(
  subscribe: (listener: () => void) => () => void,
  getProject: () => Project,
  debounceMs = DEBOUNCE_MS,
): () => void {
  let timer: ReturnType<typeof setTimeout> | null = null;

  const unsubscribe = subscribe(() => {
    if (timer) clearTimeout(timer);
    timer = setTimeout(() => {
      timer = null;
      void writeAutosave(getProject()).catch(() => {
        /* A failed autosave must never surface as a crash in a live set. */
      });
    }, debounceMs);
  });

  return () => {
    if (timer) clearTimeout(timer);
    unsubscribe();
  };
}
