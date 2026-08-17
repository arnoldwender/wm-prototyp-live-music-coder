// SPDX-License-Identifier: MIT
// Copyright (c) 2026 Arnold Wender / Wender Media
//
// Classification of auto-updater failures.
//
// Kept free of any electron import so it can be unit-tested: the rest of
// electron/ cannot run under vitest, and this is the part with actual logic.

/** What went wrong, in terms of what the user can do about it. */
export type UpdateFailureKind =
  /** The new build's code signature does not satisfy the installed app's
   *  designated requirement. Squirrel.Mac will never accept it — this install
   *  is stranded and only a manual download can move it forward. */
  | 'signature'
  /** The update feed could not be read: no channel file, no matching asset. */
  | 'feed'
  /** The download arrived but did not match the checksum in the feed. */
  | 'integrity'
  /** Network, permissions, anything else — usually transient. */
  | 'other'

/* Matched against the error message electron-updater surfaces. The signature
   strings come from Squirrel.Mac's validation failure, which electron-updater
   forwards verbatim. */
const SIGNATURE_PATTERNS = [
  /did not pass validation/i,
  /failed to satisfy specified code requirement/i,
  /code signature/i,
]

const FEED_PATTERNS = [
  /ERR_UPDATER_CHANNEL_FILE_NOT_FOUND/,
  /ERR_UPDATER_ZIP_FILE_NOT_FOUND/,
  /ERR_UPDATER_INVALID_UPDATE_INFO/,
  /ERR_UPDATER_LATEST_VERSION_NOT_FOUND/,
]

const INTEGRITY_PATTERNS = [/checksum mismatch/i, /sha512/i]

export function classifyUpdateError(message: string): UpdateFailureKind {
  if (SIGNATURE_PATTERNS.some((p) => p.test(message))) return 'signature'
  if (FEED_PATTERNS.some((p) => p.test(message))) return 'feed'
  if (INTEGRITY_PATTERNS.some((p) => p.test(message))) return 'integrity'
  return 'other'
}

/**
 * Whether retrying can ever help.
 *
 * A stranded signature is permanent for this install: every subsequent check
 * downloads the same rejected bundle. Leaving autoInstallOnAppQuit armed after
 * one of these means the app retries the impossible install on every quit,
 * forever, in silence.
 */
export function isTerminal(kind: UpdateFailureKind): boolean {
  return kind === 'signature'
}

/**
 * The message shown to the user.
 *
 * Only written for failures worth interrupting someone over. A transient
 * network error during a background check is not one — it returns null and
 * stays in the log.
 */
export function failureMessage(
  kind: UpdateFailureKind,
  version: string | null,
): string | null {
  const target = version ? `Version ${version}` : 'The update'

  switch (kind) {
    case 'signature':
      return (
        `${target} was downloaded, but macOS will not let it replace this copy: ` +
        'its code signature does not match the one this app was installed with. ' +
        'This cannot be resolved from inside the app — download the latest release ' +
        'and replace this copy manually.'
      )
    case 'integrity':
      return (
        `${target} was downloaded but did not match its published checksum, so it ` +
        'was discarded. This usually means the release is being republished — try ' +
        'again later, or download it manually.'
      )
    case 'feed':
      return (
        'No installable update could be found for this platform. ' +
        'You can download the latest release manually.'
      )
    case 'other':
      return null
  }
}
