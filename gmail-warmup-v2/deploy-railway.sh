#!/bin/bash

# Deploy Gmail Warmup V2 to Railway

echo "🚀 Deploying Gmail Warmup V2 to Railway..."
echo ""

# Check if Railway CLI is installed
if ! command -v railway &> /dev/null; then
    echo "📦 Installing Railway CLI..."
    npm install -g @railway/cli
fi

# Login to Railway (if not already logged in)
echo "🔐 Checking Railway authentication..."
railway status || railway login

# Initialize or link project
if [ ! -f ".railway/project.json" ]; then
    echo "📁 Creating new Railway project..."
    railway init
else
    echo "✅ Railway project already initialized"
fi

# Set environment variables
echo "⚙️  Setting environment variables..."
railway variables set ADSPOWER_API_KEY=746feb8ab409fbb27a0377a864279e6c000f879a7a0e5329
railway variables set ADSPOWER_BASE_URL=http://95.217.224.154:50325
railway variables set ADSPOWER_SERVER_IP=95.217.224.154
railway variables set PORT=18789
railway variables set NODE_ENV=production

# Deploy
echo "📤 Deploying to Railway..."
railway up

echo ""
echo "✅ Deployment complete!"
echo ""
echo "📊 Your app is now live at:"
railway domain
echo ""
echo "🔌 API endpoint: https://your-domain.railway.app/api"
