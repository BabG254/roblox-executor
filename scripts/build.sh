#!/bin/bash
set -e

echo "🔄 Switching to PostgreSQL..."
node scripts/switch-db.js postgresql

echo "📦 Generating Prisma Client..."
prisma generate

echo "🗄️ Pushing database schema..."
prisma db push --skip-generate --accept-data-loss

echo "🌱 Seeding database..."
node scripts/seed.js

echo "🏗️ Building Next.js..."
next build

echo "✅ Build complete!"
