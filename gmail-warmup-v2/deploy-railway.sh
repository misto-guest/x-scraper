#!/bin/bash

# Gmail Warmup V2 - Railway Deployment Script
# This script automates deployment to Railway

set -e

echo "🚀 Gmail Warmup V2 - Railway Deployment"
echo "=========================================="
echo ""

# Check if Railway CLI is installed
if ! command -v railway &> /dev/null; then
    echo "❌ Railway CLI not found. Installing..."
    npm install -g @railway/cli
fi

# Check if logged in to Railway
echo "📋 Checking Railway authentication..."
if ! railway whoami &> /dev/null; then
    echo "❌ Not logged in to Railway. Please run: railway login"
    exit 1
fi

echo "✅ Authenticated to Railway"
echo ""

# Initialize or link to Railway project
if [ ! -f ".railway/project.json" ]; then
    echo "📦 Creating new Railway project..."
    railway init
else
    echo "📦 Using existing Railway project"
fi

echo ""

# Set environment variables
echo "⚙️  Setting environment variables..."
railway variables set PORT=3000
railway variables set ADSPOWER_API_KEY=746feb8ab409fbb27a0377a864279e6c000f879a7a0e5329
railway variables set ADSPOWER_BASE_URL=http://77.42.21.134:50325
railway variables set NODE_ENV=production

echo "✅ Environment variables set"
echo ""

# Add volume for persistent storage (paid feature)
echo "💾 Setting up persistent volume..."
railway volume add --name gmail-data --mount-path /app/data 2>/dev/null || echo "⚠️  Volume may already exist or requires manual setup"

echo ""

# Deploy to Railway
echo "🚀 Deploying to Railway..."
railway up

echo ""
echo "⏳ Waiting for deployment to complete..."
sleep 10

# Get deployment URL
echo ""
echo "🌐 Deployment Information:"
echo "==========================="
DOMAIN=$(railway domain --quiet 2>/dev/null || echo "")
if [ ! -z "$DOMAIN" ]; then
    echo "✅ Dashboard URL: https://$DOMAIN"
    echo "✅ API URL: https://$DOMAIN/api"
    echo ""
    echo "🧪 Testing deployment..."
    sleep 5
    curl -s "https://$DOMAIN/api/health" | jq '.' || echo "⚠️  Health check failed - service may still be starting"
fi

echo ""
echo "📊 Useful Commands:"
echo "==================="
echo "  railway logs           - View deployment logs"
echo "  railway open           - Open in browser"
echo "  railway status         - Check deployment status"
echo "  railway variables      - Manage environment variables"
echo "  railway volume ls      - List volumes"

echo ""
echo "✅ Deployment complete!"
echo ""
echo "⚠️  Important Notes:"
echo "==================="
echo "1. Ensure AdsPower server (77.42.21.134:50325) is accessible from Railway"
echo "2. Check Railway firewall rules if connection fails"
echo "3. Verify volume is attached for data persistence"
echo "4. Test with one profile before scaling to 100+"
echo ""
echo "📖 Full documentation: RAILWAY-DEPLOYMENT.md"
