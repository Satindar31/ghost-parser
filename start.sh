#!/bin/sh

echo "📦 Running Prisma migrations..."
npx prisma migrate deploy

echo "🚀 Starting Next.js app..."
yarn start
