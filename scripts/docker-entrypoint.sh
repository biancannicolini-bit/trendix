#!/bin/sh
set -e

if [ -n "$DB_PASSWORD" ]; then
  export DATABASE_URL="$(node -e "
    const user = 'trendcontent';
    const pass = encodeURIComponent(process.env.DB_PASSWORD || '');
    process.stdout.write(\`postgresql://\${user}:\${pass}@postgres:5432/trendcontent\`);
  ")"
fi

if [ -n "$DATABASE_URL" ] && command -v npx >/dev/null 2>&1; then
  echo "Applying database schema..."
  success=0
  for i in 1 2 3 4 5 6 7 8 9 10; do
    if npx prisma db push --skip-generate; then
      success=1
      break
    fi
    echo "DB push attempt $i failed, retrying in 5s..."
    sleep 5
  done
  if [ "$success" -eq 0 ]; then
    echo "DB push skipped/failed, continuing..."
  fi
fi

exec "$@"
