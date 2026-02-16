#!/bin/bash

# Vercel Deployment Script for Twitter Monitor

set -e

echo "🚀 Twitter Monitor - Vercel Deployment"
echo ""
echo "📋 Prerequisites:"
echo "   1. Vercel account (free at https://vercel.com)"
echo "   2. GitHub repository with this code"
echo ""

# Check if logged in
echo "🔐 Step 1: Login to Vercel..."
echo "   This will open your browser for authentication"
echo ""
vercel login

echo ""
echo "🔗 Step 2: Link to Vercel project..."
echo "   Press Enter for all defaults"
echo ""
vercel link

echo ""
echo "🔧 Step 3: Set environment variables..."
echo "   Enter these when prompted:"
echo ""
echo "   DATABASE_URL: Leave empty for now (we'll use SQLite)"
echo "   GHOSTFETCH_URL: https://your-ghostfetch-server.com (or leave empty)"
echo ""

read -p "Press Enter when ready to continue..."

echo ""
echo "🚀 Step 4: Deploying to Vercel..."
echo ""
vercel --prod

echo ""
echo "✅ Deployment complete!"
echo ""
echo "⚠️  IMPORTANT: After deployment:"
echo "   1. Visit your Vercel dashboard"
echo "   2. Go to Settings → Environment Variables"
echo "   3. Add DATABASE_URL (use SQLite for now: file:./dev.db)"
echo "   4. (Optional) Add GHOSTFETCH_URL if you have a GhostFetch server"
echo ""
echo "🌐 Your app will be live at: https://your-project.vercel.app"
echo ""
echo "📖 See DEPLOYMENT.md for full setup guide"
