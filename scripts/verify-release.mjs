// SPDX-License-Identifier: MIT
// Copyright (c) 2026 Arnold Wender / Wender Media
//
// Verify that a published GitHub release can actually serve an auto-update.
//
// Releases here are hand-built and hand-published — there is no CI — and the
// update path breaks in ways that are invisible from the release page:
//
//   * latest-mac.yml missing        -> ERR_UPDATER_CHANNEL_FILE_NOT_FOUND
//   * a url in the yml that 404s    -> download never starts
//   * sha512 written before the DMG -> "checksum mismatch", update discarded
//     was stapled                      (stapling rewrites the file)
//   * only one arch's zip uploaded  -> ERR_UPDATER_ZIP_FILE_NOT_FOUND for the other
//   * yml naming that does not match GitHub's stored asset names
//
// Every macOS client, on every version, reads the LATEST release's yml — so a
// mistake here strands the whole installed base at once, not just new users.
//
// Usage: node scripts/verify-release.mjs [tag]     (default: the API's latest)

import { execFileSync } from 'node:child_process'
import { createHash } from 'node:crypto'
import { readFileSync, existsSync, statSync } from 'node:fs'
import { resolve, dirname } from 'node:path'
import { fileURLToPath } from 'node:url'

import { parseUpdateYml } from './update-yml.mjs'

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..')
const pkg = JSON.parse(readFileSync(resolve(root, 'package.json'), 'utf-8'))
const { owner, repo } = pkg.build.publish

const failures = []
const notes = []
let verifiedHashes = 0

function fail(message) {
  failures.push(message)
  console.error(`  FAIL  ${message}`)
}

function pass(message) {
  console.log(`  ok    ${message}`)
}

function gh(args) {
  return execFileSync('gh', args, { encoding: 'utf-8' }).trim()
}

/* electron-builder writes the base64 of the RAW sha512 digest, not the hex
   string. Comparing hex against it always "mismatches" and sends you hunting
   for a corrupt upload that does not exist. */
function sha512Base64(path) {
  return createHash('sha512').update(readFileSync(path)).digest('base64')
}

const tag = process.argv[2] ?? gh(['api', `repos/${owner}/${repo}/releases/latest`, '--jq', '.tag_name'])
console.log(`\nVerifying ${owner}/${repo} @ ${tag}\n`)

/* 1. The tag must BE the latest release. Every client resolves the feed through
      /releases/latest, so verifying any other tag proves nothing about them. */
const latest = gh(['api', `repos/${owner}/${repo}/releases/latest`, '--jq', '.tag_name'])
if (latest === tag) pass(`${tag} is what /releases/latest resolves to`)
else fail(`/releases/latest resolves to ${latest}, not ${tag} — clients will never see ${tag}`)

const release = JSON.parse(
  gh(['release', 'view', tag, '--json', 'assets,isDraft,isPrerelease']),
)

if (release.isDraft) fail('release is a draft — invisible to the updater')
if (release.isPrerelease) notes.push('release is marked prerelease; only clients with allowPrerelease will see it')

const assets = new Map(release.assets.map((a) => [a.name, a.size]))

/* 2. The channel file has to exist, under exactly this name. */
if (!assets.has('latest-mac.yml')) {
  fail('latest-mac.yml is not among the release assets')
  process.exit(1)
}
pass('latest-mac.yml is published')

const ymlPath = resolve(root, 'release/latest-mac.yml')
if (!existsSync(ymlPath)) {
  fail('release/latest-mac.yml not found locally — run the build before verifying')
  process.exit(1)
}

const yml = readFileSync(ymlPath, 'utf-8')
const published = execFileSync(
  'curl',
  ['-sL', '--max-time', '30', `https://github.com/${owner}/${repo}/releases/download/${tag}/latest-mac.yml`],
  { encoding: 'utf-8' },
)

if (published.trim() === yml.trim()) pass('published yml matches the local build output')
else fail('published latest-mac.yml differs from release/latest-mac.yml')

/* 3. Every file the yml points at must exist under exactly that name, at that
      size, with that hash. */
const entries = parseUpdateYml(yml)

if (entries.length === 0) fail('yml lists no files')

for (const entry of entries) {
  const label = entry.url

  if (!assets.has(entry.url)) {
    fail(`${label}: named in the yml but not published under that name`)
    continue
  }

  if (assets.get(entry.url) !== entry.size) {
    fail(`${label}: yml says ${entry.size} bytes, asset is ${assets.get(entry.url)}`)
    continue
  }

  /* Hash the local artifact rather than re-downloading ~140 MB per file. The
     size check above ties the local copy to the published one, so a hash that
     disagrees means the bytes changed after the yml was written — which is
     exactly what stapling a DMG does. GitHub stores the asset under the dotted
     name; electron-builder writes it to disk with spaces. */
  const candidates = [
    resolve(root, 'release', entry.url),
    resolve(root, 'release', entry.url.replace(/^Live\.Music\.Coder/, 'Live Music Coder')),
  ]
  const found = candidates.find((p) => existsSync(p))

  /* An unverified hash is a FAILURE, not a note. The whole point of this script
     is that a stale hash silently strands the installed base, and a run that
     checked nothing used to print "can serve an auto-update" and exit 0 — the
     exact false green it exists to prevent. */
  if (!found) {
    fail(`${label}: no local copy in release/, so the published hash was never checked`)
    continue
  }

  if (statSync(found).size !== entry.size) {
    fail(
      `${label}: local copy is a different build (${statSync(found).size} bytes vs ${entry.size}), ` +
        'so the published hash was never checked',
    )
    continue
  }

  const digest = sha512Base64(found)
  if (digest === entry.sha512) {
    verifiedHashes += 1
    pass(`${label}: size and sha512 match`)
  }
  else fail(`${label}: sha512 mismatch — the asset changed after the yml was written (stapling does this)`)
}

/* 4. macOS updates consume the ZIP, never the DMG. A release with only DMGs
      installs fine by hand and cannot auto-update at all. */
const zips = entries.filter((e) => e.url.endsWith('.zip'))
const hasArm = zips.some((e) => /arm64/.test(e.url))
const hasIntel = zips.some((e) => !/arm64/.test(e.url))

if (hasArm) pass('arm64 zip present')
else fail('no arm64 zip in the yml — Apple Silicon cannot auto-update')

if (hasIntel) pass('x64 zip present')
else fail('no x64 zip in the yml — Intel cannot auto-update')

for (const note of notes) console.log(`  note  ${note}`)

/* Guard the guard: reaching the end having verified nothing is the failure mode
   this script was written after, so it cannot be allowed to pass silently. */
if (verifiedHashes === 0) {
  fail('no hash was verified — this run proves nothing about the published assets')
}

console.log(
  failures.length === 0
    ? `\n${tag} can serve an auto-update.\n`
    : `\n${failures.length} problem(s) — this release cannot reliably update installed clients.\n`,
)

process.exit(failures.length === 0 ? 0 : 1)
