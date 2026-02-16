#!/bin/bash

# Twitter Monitor - Deployment Script
# Deploys to Vercel (or adjust for your platform)

set -e

echo "🚀 Deploying Twitter Monitor..."

# Check if Vercel CLI is installed
if ! command -v vercel &> /dev/null; then
    echo "❌ Vercel CLI not found. Installing..."
    npm install -g vercel
fi

# Build the app
echo "📦 Building app..."
cd "$(dirname "$0")"
npm install
npm run build

# Deploy to Vercel
echo "🌐 Deploying to Vercel..."
vercel --prod

echo "✅ Deployment complete!"
echo ""
echo "⚠️  IMPORTANT: After deployment, you need to:"
echo "   1. Set up a PostgreSQL database (Vercel Postgres or external)"
echo "   2. Update DATABASE_URL in production environment"
echo "   3. Set up GhostFetch server separately (Docker recommended)"
echo "   4. Run: npx prisma db push (on production database)"
echo ""
echo "📖 See README.md for detailed deployment instructions"
