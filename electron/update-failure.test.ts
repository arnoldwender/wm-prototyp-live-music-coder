// SPDX-License-Identifier: MIT
// Copyright (c) 2026 Arnold Wender / Wender Media
import { describe, it, expect } from 'vitest'
import { classifyUpdateError, isTerminal, shouldNotify, failureMessage } from './update-failure'

describe('classifyUpdateError', () => {
  it('recognises the Squirrel.Mac signature rejection verbatim', () => {
    /* This is the string electron-updater forwards from Squirrel.Mac. Getting
       it wrong is the whole failure this module exists for: the user sees
       "Restart now?", clicks it, and nothing happens. */
    const message =
      'Code signature at URL file:///private/var/folders/ShipIt/update.zip ' +
      'did not pass validation: code failed to satisfy specified code requirement(s)'

    expect(classifyUpdateError(message)).toBe('signature')
  })

  it('recognises a missing channel file as a feed problem', () => {
    expect(
      classifyUpdateError('Error: ERR_UPDATER_CHANNEL_FILE_NOT_FOUND: latest-mac.yml'),
    ).toBe('feed')
  })

  it('recognises a missing zip as a feed problem', () => {
    expect(classifyUpdateError('ERR_UPDATER_ZIP_FILE_NOT_FOUND')).toBe('feed')
  })

  it('recognises a checksum mismatch as an integrity problem', () => {
    expect(
      classifyUpdateError('sha512 checksum mismatch, expected abc, got def'),
    ).toBe('integrity')
  })

  it('recognises the staging failure that a real run produced', () => {
    /* Verbatim from a 1.2.0 -> 1.3.0 run: the update downloaded and verified,
       then Squirrel could not stage it because the app was running from a
       directory it could not replace. This message used to fall through to
       'other' and the user was told nothing at all. */
    expect(
      classifyUpdateError('Error: Could not create temporary directory: Permission denied'),
    ).toBe('staging')
  })

  it('recognises the same staging failure in a non-English system language', () => {
    /* The suffix is localised by the OS — the machine that produced this said
       "Zugriff verweigert". Matching the English tail would miss every
       non-English user, so only the half Squirrel writes itself is matched. */
    expect(
      classifyUpdateError('Error: Could not create temporary directory: Zugriff verweigert'),
    ).toBe('staging')
  })

  it('does not classify an ordinary network error as terminal', () => {
    const kind = classifyUpdateError('net::ERR_INTERNET_DISCONNECTED')
    expect(kind).toBe('other')
    expect(isTerminal(kind)).toBe(false)
  })
})

describe('isTerminal', () => {
  it('treats only a signature rejection as unrecoverable', () => {
    /* Retrying a feed or integrity failure can succeed once the release is
       fixed; retrying a signature rejection never can. */
    expect(isTerminal('signature')).toBe(true)
    expect(isTerminal('feed')).toBe(false)
    expect(isTerminal('integrity')).toBe(false)
    expect(isTerminal('other')).toBe(false)
  })
})

describe('shouldNotify', () => {
  it('stays silent on an unrecognised error during a background check', () => {
    /* Otherwise a four-hourly check produces a four-hourly dialog. */
    expect(shouldNotify('other', false)).toBe(false)
  })

  it('speaks up on an unrecognised error once an update was promised', () => {
    /* The app has shown "Version X downloaded - restart now?". Any later error
       breaks that promise, including one nobody thought to categorise. */
    expect(shouldNotify('other', true)).toBe(true)
  })

  it('always speaks up on a recognised failure', () => {
    for (const kind of ['signature', 'feed', 'integrity', 'staging'] as const) {
      expect(shouldNotify(kind, false)).toBe(true)
    }
  })
})

describe('failureMessage', () => {
  it('tells a stranded user where the app has to live', () => {
    expect(failureMessage('staging', '1.3.0')).toMatch(/Applications folder/)
  })

  it('never returns null, so a notified failure always has something to say', () => {
    for (const kind of ['signature', 'feed', 'integrity', 'staging', 'other'] as const) {
      expect(failureMessage(kind, '1.3.0')).not.toBeNull()
    }
  })

  it('names the version the user was already promised', () => {
    const message = failureMessage('signature', '1.2.0')
    expect(message).toContain('Version 1.2.0')
    expect(message).toContain('manually')
  })

  it('reads sensibly when no version was offered yet', () => {
    const message = failureMessage('feed', null)
    expect(message).not.toBeNull()
    expect(message).not.toContain('null')
    expect(message).not.toContain('Version ')
  })

  it('tells the user a signature failure cannot be solved in the app', () => {
    /* The old behaviour was a silent no-op. The message has to say the update
       is impossible here, not merely that something went wrong. */
    expect(failureMessage('signature', '1.2.0')).toMatch(/cannot be resolved from inside the app/)
  })
})
