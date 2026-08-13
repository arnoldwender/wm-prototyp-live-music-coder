# Contributing

Contributions are welcome — bug reports, fixes, and improvements alike.

## The short version

1. **Fork** the repository and create a branch off `main`:
   `fix/short-description`, `feat/short-description`, `docs/…`, `refactor/…`.
2. Make your change. Keep it focused — one concern per pull request is easier to review
   and much easier to revert if it turns out to be wrong.
3. Open a **pull request against `main`**. Describe what changes and why; if it fixes an
   issue, link it.

`main` is protected: it takes no direct pushes, and every change arrives through a pull
request. That applies to the maintainer too.

## Before you open the PR

- Run whatever checks the repository ships. If there is a `scripts/` directory with a
  check in it, run that; if there is a CI workflow, it will run the same thing on your PR.
- Match the surrounding style rather than introducing a new one. A formatting-only rewrite
  of untouched code makes a change hard to read.
- Commit messages use `[Action] Brief description` — for example `[Fix] Handle empty pool`,
  `[Docs] Clarify install step`. Keep the subject line short and the body for the why.

## What makes a change easy to accept

- It does one thing, and the title says what that thing is.
- It explains the problem, not only the patch. A failing case beats a description of it.
- It does not widen scope silently. If a small fix grows into a refactor, say so in the PR
  or split it out.
- Nothing invented: no benchmark, citation, or capability claim that cannot be checked
  from the repository itself.

## Reporting a problem instead

If you have found a bug but not a fix, open an issue with what you did, what you expected,
and what happened. A reproduction is worth more than a description.

For anything with security implications, do **not** open a public issue — see
[SECURITY.md](SECURITY.md).
