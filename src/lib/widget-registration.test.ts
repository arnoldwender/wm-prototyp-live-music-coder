// SPDX-License-Identifier: AGPL-3.0-or-later
// Copyright (c) 2026 Arnold Wender / Wender Media

/**
 * Regression guard for the inline-widget registration block.
 *
 * Until 2026-08-17 StrudelEditor called `registerWidget()` with the
 * NON-underscore names (pianoroll, punchcard, pitchwheel, scope, spiral,
 * spectrum). The code's own comment stated that registerWidget "adds
 * Pattern.prototype._type = fn (with underscore!)". It does not — it assigns
 * `Pattern.prototype[type]`, i.e. the plain name. So instead of adding the
 * inline widgets it OVERWROTE the genuine background painters that
 * @strudel/draw installs, whose signature is a single options object rather
 * than (id, options).
 *
 * The damage was concrete: @strudel/codemirror's own `_pianoroll` calls
 * `pat.tag(id).pianoroll({...})`, which then hit the overwritten wrapper with
 * the options object landing in the `id` slot, leaving `haps` undefined and
 * throwing inside pianoroll.mjs. Five shipped examples use `._pianoroll()`.
 *
 * The block was also redundant: @strudel/codemirror registers all six
 * underscore variants at import time, which the second test below asserts —
 * that is what makes deleting the block safe rather than merely less broken.
 */

import { describe, it, expect } from 'vitest';
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';

const EDITOR = 'src/components/organisms/StrudelEditor.tsx';

/** Widget types whose plain names are real Pattern.prototype painters. */
const PAINTER_NAMES = ['pianoroll', 'punchcard', 'pitchwheel', 'spiral', 'scope', 'spectrum'];

function sourceWithoutComments(file: string): string {
  return readFileSync(resolve(process.cwd(), file), 'utf-8')
    .split('\n')
    .filter((line) => {
      const t = line.trim();
      return !t.startsWith('*') && !t.startsWith('//') && !t.startsWith('/*');
    })
    .join('\n');
}

describe('inline widget registration', () => {
  it('never registers a widget under a painter name', () => {
    const code = sourceWithoutComments(EDITOR);

    for (const name of PAINTER_NAMES) {
      // Both call shapes: registerWidget('pianoroll', fn) and the bare
      // transpiler-only registerWidget('pianoroll').
      const quoted = new RegExp(`registerWidget\\(\\s*['"\`]${name}['"\`]`);
      expect(code, `${EDITOR} must not overwrite Pattern.prototype.${name}`).not.toMatch(quoted);
    }

    // The loop form is just as destructive as a literal call.
    expect(code, `${EDITOR} must not feed painter names to registerWidget in bulk`).not.toMatch(
      /registerWidget\(\s*type\s*[,)]/,
    );
  });

  it('relies on @strudel/codemirror, which already registers the underscore variants', () => {
    // This is why the deletion is safe: the library does the real work at
    // import time. If a future upgrade stops doing it, this test fails and
    // explains what has to be replaced rather than leaving a silent gap.
    const widget = readFileSync(
      resolve(process.cwd(), 'node_modules/@strudel/codemirror/widget.mjs'),
      'utf-8',
    );

    for (const name of PAINTER_NAMES) {
      expect(widget, `@strudel/codemirror must register _${name}`).toMatch(
        new RegExp(`registerWidget\\(\\s*['"\`]_${name}['"\`]`),
      );
    }
  });
});
