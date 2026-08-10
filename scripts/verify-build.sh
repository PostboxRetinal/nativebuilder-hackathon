#!/usr/bin/env bash
# Asserts the production bundle is self-contained.
#
# Guards the regression fixed in v0.5.0: marking @supabase/supabase-js as a
# rollup `external` left a bare import in the bundle, resolved at runtime
# through an index.html importmap pointing at esm.sh. The CSP does not allow
# esm.sh, so the fetch was blocked and React never mounted. Every unit test
# still passed while the deployed app served a blank page.
#
# Run after `bun run build`. Pass DIST=/some/dir to check another output dir.
set -euo pipefail

cd "$(dirname "$0")/.."
DIST="${DIST:-dist}"

if [ ! -f "$DIST/index.html" ]; then
  echo "FAIL: $DIST/index.html missing, run bun run build first"
  exit 1
fi

if grep -q 'importmap' "$DIST/index.html"; then
  echo "FAIL: $DIST/index.html contains an importmap; the bundle depends on a CDN"
  exit 1
fi

if grep -rqE 'from ?"@supabase/supabase-js"' "$DIST"/assets/*.js; then
  echo "FAIL: bundle has an unresolved bare import of @supabase/supabase-js"
  exit 1
fi

if grep -rqE 'https://esm\.sh|https://cdn\.jsdelivr\.net|https://unpkg\.com' "$DIST/index.html"; then
  echo "FAIL: $DIST/index.html references an external CDN"
  exit 1
fi

echo "PASS: bundle is self-contained"
