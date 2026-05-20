#!/bin/sh
set -e

echo "Waiting for database..."
sleep 5

echo "Fixing potentially stuck migrations and ensuring schema is synced..."
npx prisma db push --skip-generate --accept-data-loss

echo "Starting application..."
exec node dist/index.js
