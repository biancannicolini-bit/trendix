#!/bin/sh
set -e

if [ -n "$DATABASE_URL" ] && command -v npx >/dev/null 2>&1; then
  echo "Applying database schema..."
  npx prisma db push --skip-generate || echo "DB push skipped/failed, continuing..."
fi

exec "$@"
