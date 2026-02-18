#!/bin/bash

# @notgrahamp Daily Digests - Update & Deploy Script
# This script copies new digest files and deploys to Railway

set -e  # Exit on error

echo "🚀 Starting update and deployment process..."

# Colors for output
GREEN='\033[0;32m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Step 1: Copy latest digest files
echo -e "\n${BLUE}📁 Step 1: Copying latest digest files...${NC}"
cp -r /Users/northsea/clawd-dmitry/data /Users/northsea/clawd-dmitry/notgrahamp-digests/
echo -e "${GREEN}✅ Digest files copied${NC}"

# Step 2: Install dependencies
echo -e "\n${BLUE}📦 Step 2: Installing dependencies...${NC}"
npm install --silent
echo -e "${GREEN}✅ Dependencies installed${NC}"

# Step 3: Build the app
echo -e "\n${BLUE}🔨 Step 3: Building the app...${NC}"
npm run build
echo -e "${GREEN}✅ Build complete${NC}"

# Step 4: Remove node_modules (to speed up deployment)
echo -e "\n${BLUE}🧹 Step 4: Cleaning up node_modules...${NC}"
rm -rf node_modules
echo -e "${GREEN}✅ Cleanup complete${NC}"

# Step 5: Deploy to Railway
echo -e "\n${BLUE}🚀 Step 5: Deploying to Railway...${NC}"
railway up --service notgrahamp-digests
echo -e "${GREEN}✅ Deployment started${NC}"

# Step 6: Wait and check status
echo -e "\n${BLUE}⏳ Step 6: Waiting for deployment to complete...${NC}"
sleep 60

echo -e "\n${GREEN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo -e "${GREEN}✅ Update and deployment complete!${NC}"
echo -e "${GREEN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo -e "\n🌐 Public URL: https://notgrahamp-digests-production.up.railway.app"
echo -e "📊 Check deployment status: railway deployment list"
echo -e "📋 View logs: railway logs"
echo -e ""
