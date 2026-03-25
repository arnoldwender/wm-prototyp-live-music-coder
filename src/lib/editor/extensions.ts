/* ──────────────────────────────────────────────────────────
   Per-engine CodeMirror extensions — language modes and
   engine-specific autocomplete/highlighting. V1 uses
   JavaScript for all engines; Strudel-specific extensions
   from @strudel/codemirror can be added in a later phase.
   ────────────────────────────────────────────────────────── */

import { javascript } from '@codemirror/lang-javascript';
import type { Extension } from '@codemirror/state';
import type { EngineType } from '../../types/engine';
import { getEngineCompletions } from './completions';

/** Get language extensions based on engine type.
 * Includes JavaScript syntax + engine-specific autocomplete. */
export function getEngineExtensions(engine: EngineType): Extension[] {
  return [
    javascript(),
    getEngineCompletions(engine),
  ];
}
