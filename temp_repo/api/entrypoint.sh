#!/bin/sh
set -e

echo "Waiting for database..."
sleep 5

echo "Fixing potentially stuck migrations..."
# If it failed to apply, we can mark it as rolled back so it tries again
npx prisma migrate resolve --rolled-back "20260520121235_add_closing_message_and_typebot_to_quepasa_mappings" 2>/dev/null || true

echo "Running database migrations..."
if ! npx prisma migrate deploy; then
  echo "Migration failed, falling back to db push to ensure schema is aligned..."
  npx prisma migrate resolve --applied "20260520121235_add_closing_message_and_typebot_to_quepasa_mappings" 2>/dev/null || true
  npx prisma db push --skip-generate
fi

echo "Starting application..."
exec node dist/index.js
