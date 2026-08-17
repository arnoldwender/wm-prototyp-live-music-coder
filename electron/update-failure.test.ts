// SPDX-License-Identifier: MIT
// Copyright (c) 2026 Arnold Wender / Wender Media
import { describe, it, expect } from 'vitest'
import { classifyUpdateError, isTerminal, failureMessage } from './update-failure'

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

describe('failureMessage', () => {
  it('stays silent on a transient failure so a background check cannot nag', () => {
    expect(failureMessage('other', null)).toBeNull()
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
