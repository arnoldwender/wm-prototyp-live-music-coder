#!/usr/bin/env bash
# SPDX-License-Identifier: MIT
# Copyright (c) 2026 Arnold Wender / Wender Media
#
# mutate-verify-llms-txt.sh — proves that scripts/verify-llms-txt.mjs BITES.
#
# Copies public/llms.txt and public/sitemap.xml to a temporary directory and runs the gate once
# untouched (must pass) and once per mutation (each must fail):
#   1. every markdown link turned into plain text              → check 4 (no markdown link)
#   2. a link to a page of this site the sitemap does not list  → check 6 (not in sitemap)
#   3. the blockquote removed                                   → check 3 (no summary)
#   4. an http:// link added                                    → check 5 (not HTTPS)
#   5. the sitemap without a single <loc>                       → check 6 (blind gate)
#   6. only links to other sites left                           → check 6 (no link to this site)
#   7. a line that is only a closing tag (`</content>`)         → check 7 (stray markup)
#   8. /sessions removed from the sitemap again                 → check 6 (the 2026-10-04 defect)
# A gate that does not fail on its mutation is dead even when it is green.
#
# Usage: bash scripts/mutate-verify-llms-txt.sh      (from anywhere; the repo is located from this file)
# Exit:  0 = clean passes and every mutation fails · 1 = a control failed · 2 = missing input
set -u

ROOT="$(cd "$(dirname "$0")/.." && pwd)"
GATE="$ROOT/scripts/verify-llms-txt.mjs"
[ -f "$GATE" ] && [ -f "$ROOT/public/llms.txt" ] && [ -f "$ROOT/public/sitemap.xml" ] || {
  echo "input: needs scripts/verify-llms-txt.mjs, public/llms.txt and public/sitemap.xml under $ROOT" >&2; exit 2; }

TMP=$(mktemp -d "${TMPDIR:-/tmp}/mutate-llms-txt.XXXXXX")
trap 'rm -rf "$TMP"' EXIT
failures=0

# Origin of the site, read from the sitemap like the gate does (never hard-coded).
ORIGIN=$(grep -oE '<loc>[^<]+</loc>' "$ROOT/public/sitemap.xml" | sed -n '1p' | sed -E 's#</?loc>##g; s#(https?://[^/]+).*#\1#')
[ -n "$ORIGIN" ] || { echo "input: no <loc> in public/sitemap.xml" >&2; exit 2; }
echo "site $ORIGIN"

run() {  # $1 = label · $2 = expected (pass|fail)
  if node "$GATE" --public "$TMP/public" >"$TMP/out.txt" 2>&1; then r=pass; else r=fail; fi
  if [ "$r" = "$2" ]; then echo "ok   $1 → $r"; else echo "BAD  $1 → $r (expected: $2)"; sed 's/^/     /' "$TMP/out.txt"; failures=$((failures + 1)); fi
}
fresh() { rm -rf "$TMP/public"; mkdir -p "$TMP/public"; cp "$ROOT/public/llms.txt" "$ROOT/public/sitemap.xml" "$TMP/public/"; }
# A mutation that changes nothing proves nothing: compare against the original before running.
changed() { cmp -s "$TMP/public/$1" "$ROOT/public/$1" && { echo "BAD  mutation did not apply: $2"; failures=$((failures + 1)); return 1; }; return 0; }

fresh; run "untouched" pass

fresh; perl -0pi -e 's#\[([^\]]+)\]\(([^)]+)\)#$1 $2#g' "$TMP/public/llms.txt"
changed llms.txt "links to plain text" && run "no markdown link" fail

fresh; printf '\n- [Invented](%s/does-not-exist-%s)\n' "$ORIGIN" "$$" >> "$TMP/public/llms.txt"
changed llms.txt "invented page" && run "link to a page the sitemap does not list" fail

fresh; perl -0pi -e 's#^> .*\n##mg' "$TMP/public/llms.txt"
changed llms.txt "blockquote removed" && run "no blockquote" fail

fresh; printf '\n- [Insecure](http://example.org/)\n' >> "$TMP/public/llms.txt"
changed llms.txt "http link" && run "http:// link" fail

fresh; perl -0pi -e 's#<loc>[^<]*</loc>##g' "$TMP/public/sitemap.xml"
changed sitemap.xml "empty sitemap" && run "sitemap without <loc>" fail

fresh; O="$ORIGIN" perl -0pi -e 's#\[([^\]]+)\]\(\Q$ENV{O}\E[^)]*\)#$1#g' "$TMP/public/llms.txt"
changed llms.txt "own links removed" && run "only links to other sites" fail

fresh; printf '</content>\n' >> "$TMP/public/llms.txt"
changed llms.txt "stray closing tag" && run "stray markup line" fail

fresh; O="$ORIGIN" perl -0pi -e 's#\s*<url>\s*<loc>\Q$ENV{O}\E/sessions</loc>.*?</url>##s' "$TMP/public/sitemap.xml"
changed sitemap.xml "/sessions removed from the sitemap" && run "llms.txt links /sessions, the sitemap does not" fail

echo "failed controls: $failures"
[ "$failures" -eq 0 ]
