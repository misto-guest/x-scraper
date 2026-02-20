# Gmail Warmup V2 - Railway Deployment Guide

## 🚀 Deployment to Railway

This guide will help you deploy the Gmail Warmup V2 system to Railway using your paid account.

---

## 📋 Prerequisites

### Required:
- ✅ Railway paid account (you have this)
- ✅ GitHub repository (for Railway to deploy from)
- ✅ AdsPower server accessible from Railway containers
- ⚠️ **Important:** Railway containers must be able to reach `http://77.42.21.134:50325`

### Before You Start:
1. Push the Gmail Warmup V2 code to a GitHub repository
2. Ensure your AdsPower server allows connections from Railway IPs
3. Have your AdsPower API key ready

---

## 🔧 Deployment Strategy

### Option 1: Simple Container Deployment (Recommended)

**Best for:** Quick deployment, basic usage

**Pros:**
- Easy setup
- Automatic deployments from Git
- Built-in monitoring
- Good for 10-20 profiles

**Cons:**
- No persistent disk (ephemeral filesystem)
- Data resets on redeploy
- Need external storage for profiles

---

## 📁 Step-by-Step Deployment

### Step 1: Create GitHub Repository

```bash
cd /Users/northsea/clawd-dmitry/gmail-warmup-v2

# Initialize git if not already done
git init

# Create .gitignore
cat > .gitignore << 'EOF'
node_modules/
data/*.json
screenshots/
logs/
*.log
.env
.DS_Store
EOF

# Commit code
git add .
git commit -m "Initial commit: Gmail Warmup V2"

# Create repo on GitHub and push
# (Use GitHub web UI or GitHub CLI)
gh repo create gmail-warmup-v2 --public --source=. --push
```

### Step 2: Configure for Railway

Create the following files in your project:

#### `railway.json`
```json
{
  "$schema": "https://railway.app/railway.schema.json",
  "build": {
    "builder": "NIXPACKS",
    "buildCommand": "npm install",
    "watchPatterns": ["lib/**", "index.js"]
  },
  "deploy": {
    "startCommand": "npm start",
    "healthcheckPath": "/api/health",
    "healthcheckTimeout": 100,
    "restartPolicyType": "ON_FAILURE",
    "restartPolicyMaxRetries": 10
  }
}
```

#### `Dockerfile` (Alternative - if Nixpacks fails)
```dockerfile
FROM node:18-alpine

# Install Chrome dependencies for Puppeteer
RUN apk add --no-cache \
    chromium \
    nss \
    freetype \
    freetype-dev \
    harfbuzz \
    ca-certificates \
    ttf-freefont

# Tell Puppeteer to skip installing Chromium
ENV PUPPETEER_SKIP_CHROMIUM_DOWNLOAD=true \
    PUPPETEER_EXECUTABLE_PATH=/usr/bin/chromium-browser

WORKDIR /app

COPY package*.json ./
RUN npm ci --only=production

COPY . .

# Create directories
RUN mkdir -p data screenshots logs

# Expose port
EXPOSE 3000

# Start the application
CMD ["npm", "start"]
```

### Step 3: Deploy to Railway

**Option A: Via Railway CLI**

```bash
# Install Railway CLI
npm install -g @railway/cli

# Login to Railway
railway login

# Initialize project
railway init

# Set variables
railway variables set PORT=3000
railway variables set ADSPOWER_API_KEY=746feb8ab409fbb27a0377a864279e6c000f879a7a0e5329
railway variables set ADSPOWER_BASE_URL=http://77.42.21.134:50325

# Deploy
railway up
```

**Option B: Via Railway Dashboard**

1. Go to [railway.com](https://railway.com)
2. Click **New Project** → **Deploy from GitHub repo**
3. Select your `gmail-warmup-v2` repository
4. Railway will auto-detect Node.js project
5. Add environment variables:
   - `PORT=3000`
   - `ADSPOWER_API_KEY=746feb8ab409fbb27a0377a864279e6c000f879a7a0e5329`
   - `ADSPOWER_BASE_URL=http://77.42.21.134:50325`
6. Click **Deploy**

### Step 4: Configure Persistent Storage (Paid Feature)

Since Railway containers are ephemeral, you need persistent storage:

**Option A: Railway Volume (Recommended for paid accounts)**

```bash
# Add volume to your service
railway volume add --name gmail-data --mount-path /app/data
```

Or via Dashboard:
1. Go to your service
2. Click **Volumes** tab
3. Add volume: `gmail-data` mounted to `/app/data`

**Option B: External Storage**

Use Railway Postgres or Redis for profile data:

```javascript
// Modify lib/profile-manager.js to use Railway Postgres
// This requires additional setup but is more robust
```

---

## 🔐 Environment Variables

Set these in Railway Dashboard:

```bash
PORT=3000
ADSPOWER_API_KEY=746feb8ab409fbb27a0377a864279e6c000f879a7a0e5329
ADSPOWER_BASE_URL=http://77.42.21.134:50325
NODE_ENV=production
```

---

## 🌐 Accessing Your Deployment

After deployment:

1. **Get your Railway URL:**
   ```bash
   railway domain
   ```

2. **Access dashboard:**
   - URL: `https://your-project.railway.app`
   - API: `https://your-project.railway.app/api`

3. **Test connection:**
   ```bash
   curl https://your-project.railway.app/api/health
   ```

---

## ⚠️ Critical Considerations

### 1. AdsPower Server Accessibility

**Issue:** Railway containers may not be able to reach `77.42.21.134:50325`

**Solutions:**

**Option A: Allow Railway IPs (Recommended)**
- Contact your AdsPower server admin
- Add Railway IP ranges to firewall whitelist
- Get Railway IPs: `railway ip` (CLI) or check docs

**Option B: VPN Tunnel**
- Set up WireGuard or OpenVPN between Railway and AdsPower server
- More complex but secure

**Option C: Deploy to Same Network**
- Deploy to a VPS on the same network as AdsPower
- Use Railway for web UI only
- VPS handles actual warmup execution

### 2. Puppeteer on Railway

Puppeteer requires special setup on Railway:

**Update `lib/warmup-engine.js` initialization:**

```javascript
// For Railway, use Chromium from Alpine
const puppeteer = require('puppeteer');

const browser = await puppeteer.launch({
    headless: true,
    args: [
        '--no-sandbox',
        '--disable-setuid-sandbox',
        '--disable-dev-shm-usage',
        '--disable-accelerated-2d-canvas',
        '--no-first-run',
        '--no-zygote',
        '--disable-gpu'
    ]
});
```

### 3. Data Persistence

**Challenge:** Railway containers reset on redeploy

**Solutions:**

**Option A: Railway Volume** (Paid feature)
- Persists data across deployments
- Limited to 1GB per volume

**Option B: External Database**
- Use Railway Postgres
- More scalable
- Requires code changes

**Option C: GitHub Storage**
- Commit profiles.json to Git
- Simple but not recommended for sensitive data

---

## 📊 Scaling Strategy

### For 100+ Profiles:

1. **Use Railway Postgres** instead of JSON files
2. **Implement job queue** (BullMQ with Railway Redis)
3. **Add worker service** separate from API
4. **Use Railway cron** for scheduled tasks
5. **Monitor metrics** via Railway built-in monitoring

**Example Multi-Service Setup:**

```
railway-project/
├── api-service        # Express dashboard
├── worker-service     # Warmup execution
├── postgres           # Profile storage
└── redis             # Job queue
```

---

## 🧪 Testing Deployment

After deployment:

```bash
# 1. Check health
curl https://your-project.railway.app/api/health

# 2. List profiles
curl https://your-project.railway.app/api/profiles

# 3. Import profiles
curl -X POST https://your-project.railway.app/api/import

# 4. Test warmup on one profile
curl -X POST https://your-project.railway.app/api/profiles/k12am9a2/run
```

---

## 💰 Cost Estimation (Railway Paid)

**Starter Plan ($5/month):**
- 512MB RAM
- Shared CPU
- Good for testing

**Pro Plan ($20/month):**
- 2GB RAM
- Better CPU
- Suitable for 20-50 profiles

**Scale as needed:**
- Add volumes: $0.50/GB/month
- Add Postgres: $5/month
- Add Redis: $5/month

---

## 🎯 Recommended Architecture

### For Production (100+ profiles):

```
┌─────────────────────────────────────────┐
│         Railway Load Balancer            │
└──────────────┬──────────────────────────┘
               │
       ┌───────┴────────┐
       │                │
┌──────▼──────┐  ┌──────▼──────┐
│   API       │  │   Worker    │
│  Service    │  │   Service   │
│  (Express)  │  │  (Warmup)   │
└──────┬──────┘  └──────┬──────┘
       │                │
       └────────┬───────┘
                │
         ┌──────┴──────┐
         │             │
    ┌────▼───┐   ┌────▼───┐
    │ Postgres│  │  Redis │
    │ (Profiles)│ │ (Queue)│
    └────────┘   └────────┘
         │
    ┌────▼──────────────────────┐
    │  AdsPower Server           │
    │  (77.42.21.134:50325)      │
    └───────────────────────────┘
```

---

## 🚀 Quick Start Commands

```bash
# 1. Deploy to Railway
railway init
railway up

# 2. Set environment variables
railway variables set PORT=3000
railway variables set ADSPOWER_API_KEY=your_key
railway variables set ADSPOWER_BASE_URL=http://77.42.21.134:50325

# 3. Add volume for persistence
railway volume add gmail-data --mount-path /app/data

# 4. Get deployment URL
railway domain

# 5. View logs
railway logs

# 6. Open dashboard
railway open
```

---

## 📝 Post-Deployment Checklist

- [ ] Verify AdsPower server accessible from Railway
- [ ] Test profile import
- [ ] Run warmup on 1 test profile
- [ ] Check screenshots saving correctly
- [ ] Verify scheduler working
- [ ] Set up monitoring alerts
- [ ] Configure backup strategy
- [ ] Document API endpoints
- [ ] Set up cron jobs for health checks

---

## 🆘 Troubleshooting

### Issue: "Cannot connect to AdsPower"

**Solution:** Check firewall rules on AdsPower server, whitelist Railway IPs

### Issue: "Puppeteer fails to launch"

**Solution:** Use Dockerfile with Chromium dependencies

### Issue: "Data resets on deploy"

**Solution:** Add Railway Volume or switch to Postgres

### Issue: "Out of memory"

**Solution:** Upgrade Railway plan or reduce concurrent warmup sessions

---

## 📚 Additional Resources

- Railway Docs: https://docs.railway.app
- Puppeteer on Railway: https://docs.railway.app/guides/puppeteer
- Railway Volumes: https://docs.railway.app/volumes

---

**Ready to deploy? Start with Step 1 and work through each step! 🚀**
