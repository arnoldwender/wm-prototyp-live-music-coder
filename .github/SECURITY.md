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
| `1.3.x` (`>= 1.3.3`) | Yes |
| `< 1.3.3` | No — upgrade to `v1.3.3` or newer |

## Security model notes

Live Music Coder is a live-coding music IDE: evaluating user-written JavaScript / Strudel / Tone.js / Web Audio patterns locally in the renderer (`Function()` / Strudel transpiler) is how the instrument works. Because evaluated code shares the renderer JavaScript realm:

- **Credentials are kept out of Web Storage:** On the web, a GitHub Gist personal access token is held in memory only while the Gist dialog is open (never written to `localStorage`, `sessionStorage` or `IndexedDB`). In the macOS Electron app, the token lives in the main process, encrypted with a key from the OS keychain (`safeStorage`); storing a token and every upload made with it require a native confirmation, and the token is never handed back to the renderer.
- **What that does not cover:** the token is typed into a field of the page. Code that is already running in the page at that moment can read it. Run patterns you do not trust in a session where you do not enter a token.
- **Untrusted code is gated:** A shared `#code=` link, a project loaded from a Gist and an opened `.lmc` file put their code in the editor behind a blocking dialog. Nothing is evaluated until the dialog is answered, and accepting it only unlocks the editor — the code runs when you press play.
- **Desktop hardening:** Packaged Electron builds ship with `contextIsolation: true`, `nodeIntegration: false`, strict navigation/protocol guards, hardened macOS runtime, notarization, and burned Electron V1 fuses (`RunAsNode` and `NODE_OPTIONS` / CLI inspect flags disabled, ASAR integrity validation enforced).

## Scope

Anything in this repository (web app, build/prerender pipeline, or Electron desktop shell). Findings in a third-party dependency should go to that project; if the dependency is reachable through this one in a way that makes the problem worse, it is worth reporting here too.
