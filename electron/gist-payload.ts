// SPDX-License-Identifier: MIT
// Copyright (c) 2026 Arnold Wender / Wender Media

/**
 * Validation of what the renderer asks the main process to upload as a Gist.
 *
 * The renderer evaluates shared patterns through `Function()`, so every field
 * here may have been written by a stranger's code rather than by the Gist
 * dialog. The payload is rebuilt from scratch instead of passed through: the
 * GitHub API treats a file set to `null` as "delete this file", and an update
 * of an existing Gist would otherwise let evaluated code empty one.
 */

export const MAX_GIST_FILES = 50
export const MAX_GIST_BYTES = 5 * 1024 * 1024
const MAX_FILE_NAME_LENGTH = 255
const MAX_DESCRIPTION_LENGTH = 256
/* GitHub Gist ids are hexadecimal (20 or 32 characters today) */
const GIST_ID_RX = /^[a-f0-9]{8,64}$/i

export interface ValidGistUpload {
  files: Record<string, { content: string }>
  description: string
  gistId?: string
  isPublic: boolean
  fileNames: string[]
  totalBytes: number
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value)
}

/** Rebuild a renderer-supplied Gist payload, or throw if any part of it is not plain upload data. */
export function validateGistPayload(payload: unknown): ValidGistUpload {
  if (!isRecord(payload) || !isRecord(payload.files)) {
    throw new Error('Invalid Gist payload')
  }

  const entries = Object.entries(payload.files)
  if (entries.length === 0 || entries.length > MAX_GIST_FILES) {
    throw new Error('Invalid Gist payload: file count out of range')
  }

  const files: Record<string, { content: string }> = {}
  let totalBytes = 0
  for (const [name, file] of entries) {
    if (name.length === 0 || name.length > MAX_FILE_NAME_LENGTH || name.includes('/')) {
      throw new Error('Invalid Gist payload: file name')
    }
    if (!isRecord(file) || typeof file.content !== 'string' || file.content.length === 0) {
      throw new Error('Invalid Gist payload: every file needs non-empty text content')
    }
    totalBytes += Buffer.byteLength(file.content, 'utf-8')
    if (totalBytes > MAX_GIST_BYTES) {
      throw new Error('Invalid Gist payload: too large')
    }
    files[name] = { content: file.content }
  }

  let gistId: string | undefined
  if (payload.gistId !== undefined && payload.gistId !== null) {
    if (typeof payload.gistId !== 'string' || !GIST_ID_RX.test(payload.gistId)) {
      throw new Error('Invalid Gist payload: gist id')
    }
    gistId = payload.gistId
  }

  return {
    files,
    description: typeof payload.description === 'string' ? payload.description.slice(0, MAX_DESCRIPTION_LENGTH) : '',
    gistId,
    isPublic: payload.isPublic === true,
    fileNames: Object.keys(files),
    totalBytes,
  }
}

/** The question and the facts the native confirmation shows — what is really sent, not what the caller says. */
export function describeGistUpload(upload: ValidGistUpload): { message: string; detail: string } {
  const message = upload.gistId
    ? `Overwrite Gist ${upload.gistId.slice(0, 12)} on GitHub?`
    : upload.isPublic
      ? 'Create a PUBLIC Gist on GitHub?'
      : 'Create a secret Gist on GitHub?'

  const shown = upload.fileNames.slice(0, 5).join(', ')
  const more = upload.fileNames.length > 5 ? ` and ${upload.fileNames.length - 5} more` : ''
  const size = `${Math.max(1, Math.round(upload.totalBytes / 1024))} kB`
  const detail =
    `${upload.fileNames.length} file(s), ${size}: ${shown}${more}\n\n` +
    'The upload uses your saved GitHub token. Confirm only if you started it yourself from the Gist dialog.'

  return { message, detail }
}
