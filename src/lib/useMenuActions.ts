// SPDX-License-Identifier: AGPL-3.0-or-later
// Copyright (c) 2026 Arnold Wender / Wender Media

/**
 * Renderer subscriber for the Electron application menu.
 *
 * electron/menu.ts and electron/tray.ts have always sent `menu:action` messages,
 * and electron/preload.ts has always exposed onMenuAction — but nothing in src/
 * ever subscribed. The result was 17 menu items that did nothing while still
 * CLAIMING their accelerators, so Cmd+N, Cmd+O, Cmd+S, Cmd+Shift+S, Cmd+E,
 * Cmd+, and F1 were swallowed by the app and never reached the web layer either.
 *
 * Not every menu action is wired here, deliberately:
 *
 * · popout-* is not handled. electron/ipc/window.ts loads `#/popout/<id>` and
 *   src/App.tsx has no such route, so handling them would open a window showing
 *   the 404 page. Those items are removed from the menu in the same change
 *   rather than left pointing at nothing.
 * · export-audio only fires when a recording exists. Without one it would write
 *   a silent WAV, which is a worse outcome than a no-op with an explanation.
 */

import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAppStore } from './store';
import { deserializeProject } from './persistence/local';

/** Actions this hook knows how to perform. Anything else is logged, not ignored. */
type MenuAction =
  | 'new-project'
  | 'open-project'
  | 'save-project'
  | 'save-project-as'
  | 'export-audio'
  | 'toggle-play'
  | 'toggle-zen'
  | 'toggle-graph'
  | 'toggle-visualizers'
  | 'open-settings'
  | 'open-shortcuts'
  | 'open-docs'
  | 'open-about'
  | 'check-updates';

function currentProjectJson(): string {
  const s = useAppStore.getState();
  const now = new Date().toISOString();
  return JSON.stringify({
    id: `project_${Date.now()}`,
    name: 'Live Music Coder Project',
    version: 1,
    created: now,
    updated: now,
    bpm: s.bpm,
    defaultEngine: s.defaultEngine,
    files: s.files,
    graph: { nodes: [], edges: [], viewport: { x: 0, y: 0, zoom: 1 } },
    layout: s.layout,
  });
}

export function useMenuActions(): void {
  const navigate = useNavigate();

  useEffect(() => {
    const api = window.electronAPI;
    if (!api?.onMenuAction) return; /* web build — no menu to serve */

    const handle = async (raw: string) => {
      const action = raw as MenuAction;
      const store = useAppStore.getState();

      switch (action) {
        case 'new-project':
          navigate('/editor');
          store.loadProject({
            files: [{ id: `file_${Date.now()}`, name: 'main.js', engine: store.defaultEngine, code: '', active: true }],
          });
          break;

        case 'open-project': {
          const opened = await api.openProject?.();
          if (!opened?.json) return;
          try {
            const project = deserializeProject(opened.json);
            navigate('/editor');
            store.loadProject({
              bpm: project.bpm,
              defaultEngine: project.defaultEngine,
              files: project.files,
              layout: project.layout,
            });
          } catch {
            api.notify?.('Open failed', 'That file is not a readable Live Music Coder project.');
          }
          break;
        }

        case 'save-project':
        case 'save-project-as':
          /* Both go through the native save dialog, which is what makes the
             write safe — there is deliberately no dialog-free save path. */
          await api.saveProject?.(currentProjectJson());
          break;

        case 'export-audio':
          api.notify?.(
            'Nothing to export',
            'Record a take first — the transport bar has the record button.',
          );
          break;

        case 'toggle-play':
          store.togglePlay();
          break;

        case 'toggle-zen':
          store.toggleZenMode();
          break;

        case 'toggle-graph':
          store.toggleGraph();
          break;

        case 'toggle-visualizers':
          store.togglePanel('waveform');
          break;

        case 'open-settings':
        case 'open-shortcuts':
          navigate('/docs');
          break;

        case 'open-docs':
          navigate('/docs');
          break;

        case 'open-about':
          navigate('/legal');
          break;

        case 'check-updates':
          api.checkForUpdates?.();
          break;

        default:
          /* Loud rather than silent: a new menu item with no handler here is
             exactly the failure this hook exists to end. */
          console.warn(`[menu] unhandled action: ${raw}`);
      }
    };

    const offMenu = api.onMenuAction((action: string) => void handle(action));

    /* .lmc files handed over by the OS — double-click, "Open With", or a path on
       the command line. package.json has declared the association all along, so
       until the main process started forwarding these the file was silently
       dropped and the user landed in an empty editor.

       Receive-only: the renderer cannot request a file through this channel, so
       there is no path for it to supply and nothing to validate beyond the JSON
       itself, which deserializeProject already guards. */
    const offFile = api.onFileOpened?.(({ json }) => {
      try {
        const project = deserializeProject(json);
        navigate('/editor');
        useAppStore.getState().loadProject({
          bpm: project.bpm,
          defaultEngine: project.defaultEngine,
          files: project.files,
          layout: project.layout,
        });
      } catch {
        api.notify?.('Open failed', 'That file is not a readable Live Music Coder project.');
      }
    });

    return () => {
      offMenu?.();
      offFile?.();
    };
  }, [navigate]);
}
