# 🚀 Multiple Ways to Deploy Gmail Warmup

## Option 1: Railway CLI (Step-by-Step)

```bash
cd /Users/northsea/clawd-dmitry/gmail-warmup-v2

# Initialize Railway project
railway init

# Create new service
railway add

# Set environment variables
railway variables set ADSPOWER_API_KEY=746feb8ab409fbb27a0377a864279e6c000f879a7a0e5329
railway variables set ADSPOWER_BASE_URL=http://95.217.224.154:50325
railway variables set ADSPOWER_SERVER_IP=95.217.224.154
railway variables set PORT=18789
railway variables set NODE_ENV=production

# Deploy
railway up

# Get your URL
railway domain
```

---

## Option 2: Railway + GitHub Integration (Recommended!)

### Step 1: Push to GitHub

```bash
cd /Users/northsea/clawd-dmitry

# Create GitHub repo (if not exists)
gh repo create gmail-warmup-v2 --public --source=./clawd-dmitry/gmail-warmup-v2 --push

# Or push to existing repo
cd clawd-dmitry/gmail-warmup-v2
git init
git add .
git commit -m "Initial deploy: Gmail warmup system"
git branch -M main
git remote add origin https://github.com/YOUR_USERNAME/YOUR_REPO.git
git push -u origin main
```

### Step 2: Connect in Railway Dashboard

1. Go to https://railway.app
2. Click "New Project"
3. Click "Deploy from GitHub repo"
4. Select your `gmail-warmup-v2` repository
5. Railway will auto-detect Node.js and deploy

### Step 3: Add Environment Variables

In Railway Dashboard:
- Go to your project → Variables
- Add these variables:
  ```
  ADSPOWER_API_KEY = 746feb8ab409fbb27a0377a864279e6c000f879a7a0e5329
  ADSPOWER_BASE_URL = http://95.217.224.154:50325
  ADSPOWER_SERVER_IP = 95.217.224.154
  PORT = 18789
  NODE_ENV = production
  ```

### Step 4: Get Your URL

Railway will provide: `https://your-app-name.up.railway.app`

---

## Option 3: Railway Dashboard (Manual, No CLI)

### 1. Create Project
- Go to https://railway.app
- Click "New Project" → "New Project"

### 2. Create Service
- Click "New Service" → "Deploy from GitHub"
- Or "Empty Service" if you want to upload files manually

### 3. Upload Files (if not using GitHub)
- Use Railway's built-in editor
- Or connect your GitHub repo

### 4. Configure Build Settings
In your service settings:
```
Build Command: npm install
Start Command: npm start
Root Directory: ./
```

### 5. Set Environment Variables
Go to Settings → Variables → Add New:
```
ADSPOWER_API_KEY = 746feb8ab409fbb27a0377a864279e6c000f879a7a0e5329
ADSPOWER_BASE_URL = http://95.217.224.154:50325
ADSPOWER_SERVER_IP = 95.217.224.154
PORT = 18789
NODE_ENV = production
```

### 6. Deploy
Click "Deploy" → Railway builds and deploys

### 7. Access Your App
Your URL: `https://your-project.up.railway.app`

---

## Option 4: Vercel (Alternative to Railway)

### Install Vercel CLI
```bash
npm install -g vercel
```

### Deploy
```bash
cd /Users/northsea/clawd-dmitry/gmail-warmup-v2

# Login
vercel login

# Deploy
vercel

# Add environment variables when prompted
```

---

## Option 5: Heroku (Free Tier Available)

### Install Heroku CLI
```bash
npm install -g heroku
```

### Deploy
```bash
cd /Users/northsea/clawd-dmitry/gmail-warmup-v2

# Login
heroku login

# Create app
heroku create gmail-warmup-v2

# Add buildpack
heroku buildpacks:set heroku/nodejs

# Set environment variables
heroku config:set ADSPOWER_API_KEY=746feb8ab409fbb27a0377a864279e6c000f879a7a0e5329
heroku config:set ADSPOWER_BASE_URL=http://95.217.224.154:50325
heroku config:set ADSPOWER_SERVER_IP=95.217.224.154
heroku config:set PORT=18789
heroku config:set NODE_ENV=production

# Push to deploy
git push heroku main

# Open in browser
heroku open
```

---

## Option 6: VPS with Docker (Production-Grade)

### Build Docker Image
```bash
cd /Users/northsea/clawd-dmitry/gmail-warmup-v2

# Build image
docker build -t gmail-warmup .

# Run container
docker run -d \
  -p 18789:18789 \
  -e ADSPOWER_API_KEY=746feb8ab409fbb27a0377a864279e6c000f879a7a0e5329 \
  -e ADSPOWER_BASE_URL=http://95.217.224.154:50325 \
  -e ADSPOWER_SERVER_IP=95.217.224.154 \
  -e PORT=18789 \
  -e NODE_ENV=production \
  -v $(pwd)/data:/app/data \
  -v $(pwd)/logs:/app/logs \
  -v $(pwd)/screenshots:/app/screenshots \
  --name gmail-warmup \
  gmail-warmup
```

---

## Option 7: Render.com (Simple Alternative)

### Deploy via Dashboard

1. Go to https://render.com
2. Sign up/login
3. Click "New" → "Web Service"
4. Connect GitHub or paste code
5. Configure:
   - **Name:** gmail-warmup
   - **Environment:** Node
   - **Build Command:** `npm install`
   - **Start Command:** `npm start`
6. Add Environment Variables (in Advanced section)
7. Click "Deploy"

---

## 🎯 Recommended: GitHub + Railway

**Why?**
- ✅ Automatic deploys on git push
- ✅ Version control
- ✅ Rollback capability
- ✅ Preview deployments
- ✅ Easy collaboration

### Steps:

1. **Push to GitHub**
```bash
cd /Users/northsea/clawd-dmitry/gmail-warmup-v2

# Initialize git if not already
git init
git add .
git commit -m "Deploy: Gmail warmup system"

# Create repo and push (using GitHub CLI)
gh repo create gmail-warmup-v2 --public --source=. --push
```

2. **Connect in Railway**
- Go to https://railway.app/new
- Click "Deploy from GitHub repo"
- Select `gmail-warmup-v2`
- Click "Deploy Now"

3. **Add Variables**
In Railway dashboard, go to Variables and add:
```
ADSPOWER_API_KEY=746feb8ab409fbb27a0377a864279e6c000f879a7a0e5329
ADSPOWER_BASE_URL=http://95.217.224.154:50325
ADSPOWER_SERVER_IP=95.217.224.154
PORT=18789
NODE_ENV=production
```

4. **Done!**
Your app is live at: `https://gmail-warmup-v2.up.railway.app`

---

## 📊 Comparison

| Platform | Ease | Speed | Free Tier | Auto-Deploy | Best For |
|----------|------|-------|-----------|-------------|----------|
| Railway | ⭐⭐⭐⭐⭐ | ⭐⭐⭐⭐⭐ | ✅ $5 credit | ✅ GitHub | Quick setup |
| Vercel | ⭐⭐⭐⭐⭐ | ⭐⭐⭐⭐⭐ | ✅ | ✅ GitHub | Frontend + API |
| Heroku | ⭐⭐⭐⭐ | ⭐⭐⭐⭐ | ❌ (paid) | ✅ GitHub | Production |
| Render | ⭐⭐⭐⭐ | ⭐⭐⭐ | ✅ | ✅ GitHub | Simple apps |
| VPS | ⭐⭐ | ⭐⭐⭐ | ❌ | ❌ Manual | Full control |

---

## 🚀 Which One Should You Choose?

### Choose Railway + GitHub if:
- ✅ Want fastest deployment
- ✅ Already using GitHub
- ✅ Want auto-deploys
- ✅ Like CLI tools

### Choose Vercel if:
- ✅ Deploying other frontend apps too
- ✅ Want zero-config deployment
- ✅ Need preview deployments

### Choose Heroku if:
- ✅ Need add-ons (databases, etc.)
- ✅ Want mature platform
- ✅ Ok with paying after free tier

### Choose VPS if:
- ✅ Need full control
- ✅ Running at scale (50+ profiles)
- ✅ Want best performance

---

## ✅ Ready to Deploy?

**Quickest (5 minutes):**
1. Push to GitHub: `gh repo create gmail-warmup-v2 --public --source=. --push`
2. Connect in Railway dashboard
3. Add environment variables
4. Done!

**Or just use CLI:**
```bash
railway init
railway variables set ADSPOWER_API_KEY=746feb8ab409fbb27a0377a864279e6c000f879a7a0e5329
railway variables set ADSPOWER_BASE_URL=http://95.217.224.154:50325
railway variables set PORT=18789
railway up
```

---

**Which option would you like to use? I can provide step-by-step guidance for any of these!** 🚀
