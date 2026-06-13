#!/bin/sh
set -e

if [ -n "$DATABASE_URL" ] && [ -f "./node_modules/.bin/prisma" ]; then
  echo "Applying database schema..."
  ./node_modules/.bin/prisma db push --skip-generate || echo "DB push skipped/failed, continuing..."
fi

exec "$@"
