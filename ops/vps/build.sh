#!/bin/bash
set -euo pipefail
export NEXT_TELEMETRY_DISABLED=1
export NEXT_PUBLIC_SITE_URL=https://woyatablo.com
export NODE_OPTIONS=--max-old-space-size=1100
pnpm install --frozen-lockfile
pnpm typecheck
pnpm test:admin
pnpm test:pricing
pnpm test:artwork
pnpm test:crop
pnpm build
# This suite uses a disposable PGlite database and temporary upload directory.
pnpm test:admin:http
touch .verified
