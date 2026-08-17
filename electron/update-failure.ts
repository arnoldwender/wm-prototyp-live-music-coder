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
  /** Squirrel could not stage the update. Measured twice on 2026-08-17, and the
   *  first diagnosis was WRONG: moving the app from a temp directory into
   *  ~/Applications changed nothing. The actual blocker was
   *  ~/Library/Caches/<bundleid>.ShipIt left owned by root — without the execute
   *  bit for the user, Squirrel cannot create its temp dir inside it and EVERY
   *  future update of that app dies, however correct the feed is. Removing that
   *  directory (which needs sudo) fixed it and the update then completed. The
   *  app's own location is a second, independent cause. */
  | 'staging'
  /** Network, or anything not otherwise recognised. */
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

/* Squirrel reports these in the SYSTEM language, so matching English text alone
   would miss every non-English machine — the failure that produced this list
   arrived as "Zugriff verweigert" on a German system. The stable half of the
   message is the part Squirrel writes itself, so match on that and treat the
   localised suffix as unmatchable. */
const STAGING_PATTERNS = [
  /Could not create temporary directory/i,
  /Could not (?:copy|move|replace)/i,
  /read-?only file system/i,
  /* Bare errno codes are NOT matched on their own: Node reports a blocked
     outbound connection as "connect EACCES <ip>:443", which is a network problem
     wearing a filesystem code, and telling that user their app cannot be replaced
     sends them to the wrong fix. Require the errno to sit next to a filesystem
     verb. */
  /(?:director|copy|move|replace|write|bundle)[^]{0,40}(?:ENOENT|EACCES|EPERM|EROFS)/i,
]

export function classifyUpdateError(message: string): UpdateFailureKind {
  if (SIGNATURE_PATTERNS.some((p) => p.test(message))) return 'signature'
  if (FEED_PATTERNS.some((p) => p.test(message))) return 'feed'
  if (INTEGRITY_PATTERNS.some((p) => p.test(message))) return 'integrity'
  if (STAGING_PATTERNS.some((p) => p.test(message))) return 'staging'
  return 'other'
}

/**
 * Whether the user has to be told, given how far the update had already got.
 *
 * The category alone is not enough. Once "Version X downloaded — restart now?"
 * has been shown, the app has made a promise, and ANY later error breaks it —
 * including an unrecognised one. Staying quiet then reproduces exactly the
 * failure this module exists to end: a Restart button that does nothing and
 * explains nothing.
 *
 * Before that promise, an unrecognised error is a background check that failed,
 * and interrupting someone every four hours over it would be its own bug.
 */
export function shouldNotify(kind: UpdateFailureKind, updateWasOffered: boolean): boolean {
  return kind !== 'other' || updateWasOffered
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
 * Returns null only when there is nothing worth interrupting for — see
 * shouldNotify for when that is, which depends on whether the app already
 * promised the user an update.
 */
export function failureMessage(
  kind: UpdateFailureKind,
  version: string | null,
): string | null {
  const target = version ? `Version ${version}` : 'The update'

  switch (kind) {
    case 'staging':
      return (
        `${target} was downloaded and verified, but the installer could not ` +
        'replace this copy of the app.\n\n' +
        'The usual cause is a leftover updater folder owned by another user. In ' +
        'Terminal:\n\n' +
        '    sudo rm -rf ~/Library/Caches/com.wendermedia.live-music-coder.ShipIt\n\n' +
        'then reopen the app. If that does not help, the app is somewhere it ' +
        'cannot be replaced — running from a disk image or a read-only volume — ' +
        'so move it to your Applications folder first. Downloading the latest ' +
        'release and replacing this copy by hand always works.'
      )
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
      return (
        `${target} could not be installed. The details are in the app log; ` +
        'downloading the latest release and replacing this copy always works.'
      )
  }
}
