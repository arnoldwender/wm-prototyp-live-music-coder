/* ──────────────────────────────────────────────────────────
   Per-engine CodeMirror extensions — language modes and
   engine-specific autocomplete/highlighting. V1 uses
   JavaScript for all engines; Strudel-specific extensions
   from @strudel/codemirror can be added in a later phase.
   ────────────────────────────────────────────────────────── */

import { javascript } from '@codemirror/lang-javascript';
import type { Extension } from '@codemirror/state';
import type { EngineType } from '../../types/engine';

/** Get language extensions based on engine type */
export function getEngineExtensions(engine: EngineType): Extension[] {
  switch (engine) {
    case 'strudel':
      /* Strudel uses JavaScript with Strudel-specific patterns.
       * For now, use JS mode. @strudel/codemirror extensions
       * can be added later for pattern visualization. */
      return [javascript()];

    case 'tonejs':
      return [javascript()];

    case 'webaudio':
      return [javascript()];

    case 'midi':
      return [javascript()];
  }
}
