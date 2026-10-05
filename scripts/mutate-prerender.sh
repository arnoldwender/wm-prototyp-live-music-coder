#!/usr/bin/env bash
# SPDX-License-Identifier: MIT
# Copyright (c) 2026 Arnold Wender / Wender Media
#
# Mutation check of the prerender and its gates.
#
# Each mutation breaks one mechanism of the 2026-10-05 prerender and runs the check that is meant
# to catch it; the check must FAIL. A neutral mutation (a comment) must PASS: it proves the checks
# do not fail on any change at all. Every file is restored from a copy and its sha256 compared
# with the original before the next mutation.
#
# Usage: bash scripts/mutate-prerender.sh        (from the repo root; needs node_modules + Playwright)
# Exit:  0 every mutation caught and the control survived · 1 otherwise
# Run it on a clean tree: it edits files in place and restores them.

set -u
cd "$(dirname "$0")/.." || exit 1

if [ -n "$(git status --porcelain)" ]; then
  echo "[mutate] the tree is not clean — commit first, this script edits files in place" >&2
  exit 1
fi

BUILD_AND_VERIFY='npm run build >/dev/null 2>&1 && node scripts/verify-hydration.mjs >/dev/null 2>&1'
BUILD_ONLY='npm run build >/dev/null 2>&1'
GATE_TESTS='npx vitest run scripts/prerender.test.mjs >/dev/null 2>&1'
SERVER_TESTS='npx vitest run src/entry-server.test.tsx >/dev/null 2>&1'

caught=0
missed=0
broken=0

# mutate <name> <file> <old> <new> <check> <expect: fail|pass>
mutate() {
  local name="$1" file="$2" old="$3" new="$4" check="$5" expect="$6"
  local backup sum_before sum_after result
  backup="$(mktemp)"
  cp "$file" "$backup"
  sum_before="$(shasum -a 256 "$file" | cut -d' ' -f1)"

  if ! python3 - "$file" "$old" "$new" <<'PY'
import sys
path, old, new = sys.argv[1], sys.argv[2], sys.argv[3]
text = open(path, encoding='utf-8').read()
if text.count(old) != 1:
    sys.exit(f'target found {text.count(old)} times, expected exactly 1')
open(path, 'w', encoding='utf-8').write(text.replace(old, new))
PY
  then
    echo "BROKEN  $name — the mutation did not apply"
    broken=$((broken + 1))
    rm -f "$backup"
    return
  fi

  if eval "$check"; then result=pass; else result=fail; fi

  cp "$backup" "$file"
  rm -f "$backup"
  sum_after="$(shasum -a 256 "$file" | cut -d' ' -f1)"
  if [ "$sum_before" != "$sum_after" ]; then
    echo "BROKEN  $name — $file was not restored byte for byte" >&2
    exit 1
  fi

  if [ "$result" = "$expect" ]; then
    echo "OK      $name ($result, as expected)"
    caught=$((caught + 1))
  else
    echo "MISSED  $name ($result, expected $expect)"
    missed=$((missed + 1))
  fi
}

mutate "M1 useIsClient never flips: the IDE never replaces the /editor placeholder" \
  src/lib/useIsClient.ts "const getSnapshot = () => true" "const getSnapshot = () => false" \
  "$BUILD_AND_VERIFY" fail

mutate "M2 the IDE rendered on the server: React writes a Suspense fallback" \
  src/pages/EditorPage.tsx "  if (!isClient) return <EditorPlaceholder />" "  if (false) return <EditorPlaceholder />" \
  "$BUILD_ONLY" fail

mutate "M3 no fixed server language: a German build machine prerenders German" \
  src/i18n/index.ts "  if (typeof window === 'undefined') return 'en'" "" \
  "$SERVER_TESTS" fail

mutate "M4 the route's page is not preloaded before renderToString" \
  src/entry-server.tsx "  await preloadRoute(url)" "" \
  "$SERVER_TESTS" fail

mutate "M5 hydration whatever the language: a German visit mismatches the English HTML" \
  src/main.tsx " && i18n.language === 'en'" "" \
  "$BUILD_AND_VERIFY" fail

mutate "M6 the Legal tab read from the hash during hydration" \
  src/pages/Legal.tsx "isClient && location.hash === '#datenschutz'" "location.hash === '#datenschutz'" \
  "$BUILD_AND_VERIFY" fail

mutate "M7 the hero fade-in rendered on the server: the <h1> ships at opacity 0" \
  src/components/organisms/HeroSection.tsx "  initial: animateIn ? { opacity: 0, y: 24 } : (false as const)," "  initial: { opacity: 0, y: 24 }," \
  "$SERVER_TESTS" fail

mutate "M8 lazy() no longer settles a preloaded page synchronously" \
  src/lib/lazyRoute.ts "lazy(() => (loaded ? settled(loaded) : preload().then(() => loaded!)))" "lazy(() => preload().then(() => loaded!))" \
  "$SERVER_TESTS" fail

mutate "M9 gate: the <h1> may come from outside #root" \
  scripts/prerender.mjs "  } else if (rootH1s !== 1) {" "  } else if (false) {" \
  "$GATE_TESTS" fail

mutate "M10 gate: the home page's word count no longer checked" \
  scripts/prerender.mjs "  if (routePath === '/' && words < MIN_WORDS) {" "  if (false) {" \
  "$GATE_TESTS" fail

mutate "M11 gate: a Suspense fallback no longer fails the build" \
  scripts/prerender.mjs "  if (FALLBACK_RX.test(appHtml)) {" "  if (false) {" \
  "$GATE_TESTS" fail

mutate "M12 the examples description back to a hardcoded count" \
  src/pages/Examples.tsx 'description: `${TOTAL_EXAMPLE_COUNT} curated' 'description: `165+ curated' \
  "$SERVER_TESTS" fail

mutate "M13 the SPA fallback back to index.html (the prerendered home page)" \
  netlify.toml '  to = "/spa.html"' '  to = "/index.html"' \
  "$GATE_TESTS" fail

mutate "C0 control: a comment changes, every check still passes" \
  src/lib/useIsClient.ts "/* The value never changes after mount, so there is nothing to subscribe to */" \
  "/* The value never changes after mount — nothing to subscribe to */" \
  "$BUILD_AND_VERIFY && $GATE_TESTS && $SERVER_TESTS" pass

# Leave dist/ built from the committed tree
npm run build >/dev/null 2>&1 || { echo "[mutate] the clean rebuild failed" >&2; exit 1; }

echo "---"
echo "caught $caught · missed $missed · broken $broken"
[ "$missed" -eq 0 ] && [ "$broken" -eq 0 ]
