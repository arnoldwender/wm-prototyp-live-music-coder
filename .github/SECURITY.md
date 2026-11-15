# Security Policy

## Reporting a vulnerability

**Please do not open a public issue for a security problem.**

Use GitHub's private vulnerability reporting instead: go to the **Security** tab of this
repository and choose *Report a vulnerability*. That opens a private channel visible only
to the maintainer, and it lets the report be tracked and credited properly once it is
fixed.

Useful things to include, if you have them:

- what an attacker can do, and what they need in order to do it
- the steps to reproduce, or a minimal proof of concept
- the version, commit, or environment where you observed it

## What to expect

This is a maintainer-hours project, not a funded programme — there is no response-time
guarantee, and it would be dishonest to print one. Reports are read, and confirmed issues
are fixed and disclosed once a fix exists.

## Supported versions

| Version | Supported |
| ------- | --------- |
| `1.3.x` (`>= 1.3.2`) | Yes |
| `< 1.3.2` | No — upgrade to `v1.3.2` or newer |

## Security model notes

Live Music Coder is a live-coding music IDE: evaluating user-written JavaScript / Strudel / Tone.js / Web Audio patterns locally in the renderer (`Function()` / Strudel transpiler) is how the instrument works. Because evaluated code shares the renderer JavaScript realm:

- **Credentials are isolated from Web Storage:** On the web, GitHub Gist personal access tokens stay ephemeral in memory for the current tab session only (never written to `localStorage` or `IndexedDB`). In the macOS Electron app, tokens live in the main process encrypted with OS Keychain (`safeStorage`) and require native user confirmation before outbound Gist requests.
- **Untrusted links are gated:** Opening shared `?code=` or `?gist=` links shows an explicit confirmation dialog before loading or evaluating external code.
- **Desktop hardening:** Packaged Electron builds ship with `contextIsolation: true`, `nodeIntegration: false`, strict navigation/protocol guards, hardened macOS runtime, notarization, and burned Electron V1 fuses (`RunAsNode` and `NODE_OPTIONS` / CLI inspect flags disabled, ASAR integrity validation enforced).

## Scope

Anything in this repository (web app, build/prerender pipeline, or Electron desktop shell). Findings in a third-party dependency should go to that project; if the dependency is reachable through this one in a way that makes the problem worse, it is worth reporting here too.
