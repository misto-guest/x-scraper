# 🚀 Quick Deploy - Gmail Warmup V2

## TL;DR - Two Ways to Deploy

### 1. ☁️ Railway (5 minutes, easiest)
```bash
cd /Users/northsea/clawd-dmitry/gmail-warmup-v2
./deploy-railway.sh
```
**Result:** `https://your-app.up.railway.app`

### 2. 🖥️ VPS (30 minutes, production-ready)
**Best for:** Direct AdsPower access, better performance
**Providers:** DigitalOcean ($6/mo), Hetzner (~€4/mo)

See `DEPLOYMENT-GUIDE.md` for full VPS instructions.

---

## ⚡ Railway Deployment (Recommended for Quick Start)

### What You Get
- ✅ Web dashboard in 5 minutes
- ✅ HTTPS automatically
- ✅ Auto-scaling
- ✅ Built-in monitoring
- ✅ Free tier available ($5 credit)

### Requirements
- Railway account (free): https://railway.app
- Railway CLI: `npm install -g @railway/cli`
- AdsPower server accessible from internet

### Quick Deploy

```bash
# Install Railway CLI
npm install -g @railway/cli

# Login
railway login

# Navigate to project
cd /Users/northsea/clawd-dmitry/gmail-warmup-v2

# Deploy
./deploy-railway.sh
```

### Get Your URL
```bash
railway domain
```

### Test It
```bash
# Health check
curl https://your-app.up.railway.app/api/health

# Open in browser
open https://your-app.up.railway.app
```

---

## ⚠️ Important: AdsPower Connectivity

### The Issue
Railway runs in the cloud. Your app needs to reach AdsPower at `95.217.224.154`.

### Three Options:

**Option A: AdsPower has public WebSocket port (Easiest)**
- Port 8080 already open on AdsPower server
- Just deploy - it will work ✅

**Option B: Open WebSocket port**
```bash
# On AdsPower server (95.217.224.154)
sudo ufw allow from 0.0.0.0/0 to any port 8080
```

**Option C: Use VPS instead** (see below)

---

## 🖥️ VPS Deployment (Recommended for Production)

### Why VPS?
- ✅ Same network/close to AdsPower server
- ✅ Better WebSocket performance
- ✅ Full control
- ✅ Cheaper at scale
- ✅ Can run batch jobs reliably

### Recommended Setup

**VPS Provider:** Hetzner (€4-6/mo) or DigitalOcean ($6/mo)

**Location:** Choose datacenter close to AdsPower server (Finland/Germany)

**Specs:** 2GB RAM, 1 CPU, 40GB SSD

### Quick Commands

```bash
# SSH into your VPS
ssh root@your-vps-ip

# Install dependencies
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt install -y nodejs nginx

# Install PM2
sudo npm install -g pm2

# Clone your repo
cd /opt
git clone <your-github-repo> gmail-warmup
cd gmail-warmup

# Install
npm install

# Start
pm2 start index.js --name gmail-warmup
pm2 startup
pm2 save
```

See `DEPLOYMENT-GUIDE.md` for complete VPS setup with Nginx + SSL.

---

## 🎯 Decision Guide

### Choose Railway if:
- ✅ Want to test quickly
- ✅ Don't have VPS yet
- ✅ Ok with cloud latency
- ✅ AdsPower WebSocket accessible

### Choose VPS if:
- ✅ Running 50+ profiles
- ✅ Need reliability
- ✅ Want better performance
- ✅ Cost matters at scale

---

## 📊 Current Status

**Local Server:** ✅ Running on `http://localhost:3457`

**Ready to Deploy:** ✅
- Dockerfile created
- Railway config ready
- Environment variables prepared
- Deployment scripts ready

**Files Ready:**
- ✅ `Dockerfile` - Container image
- ✅ `railway.yaml` - Railway config
- ✅ `deploy-railway.sh` - One-click deploy
- ✅ `.env.example` - Environment template
- ✅ `DEPLOYMENT-GUIDE.md` - Full guide

---

## 🔧 Pre-Deployment Checklist

### For Railway:
- [ ] Railway account created
- [ ] Railway CLI installed
- [ ] AdsPower server allows connections from Railway IPs
- [ ] `.env` file configured (or use Railway variables)
- [ ] `profiles.txt` updated with profile IDs

### For VPS:
- [ ] VPS provisioned
- [ ] Can SSH into VPS
- [ ] VPS can reach AdsPower server (test: `curl http://95.217.224.154:50325`)
- [ ] Domain name (optional) pointed to VPS
- [ ] PM2 installed
- [ ] Nginx installed (for SSL)

---

## 🚀 Deploy Now!

### Option 1: Railway (5 min)
```bash
cd /Users/northsea/clawd-dmitry/gmail-warmup-v2
./deploy-railway.sh
```

### Option 2: VPS (30 min)
See `DEPLOYMENT-GUIDE.md` for step-by-step VPS setup.

---

## 📱 After Deployment

1. **Access Web Dashboard**
   - Railway: `https://your-app.up.railway.app`
   - VPS: `http://your-vps-ip` or `https://your-domain.com`

2. **Test Connection**
   ```bash
   curl https://your-domain.com/api/test-connection
   ```

3. **Add Profiles**
   - Via web UI
   - Or import from AdsPower

4. **Run First Warmup**
   - Via web UI (click "Run" button)
   - Or API: `POST /api/warmup/:profileId`

5. **Set Up Batch Schedule**
   ```bash
   # Crontab on VPS
   0 9 * * * cd /opt/gmail-warmup && node warmup-batch.js --file profiles.txt --parallel 5
   ```

---

## 📞 Need Help?

**Documentation:**
- `DEPLOYMENT-GUIDE.md` - Full deployment guide
- `WEB-APP-GUIDE.md` - Web app documentation
- `SETUP-COMPLETE.md` - Feature overview

**Common Issues:**
- WebSocket connection failed → Check AdsPower firewall
- Port already in use → Change PORT env variable
- AdsPower unreachable → Test connectivity first

---

## ✨ What You're Deploying

**Features:**
- 🌐 Beautiful web dashboard
- 📊 Real-time statistics
- ⚙️ Profile management (CRUD)
- 🚀 Single and batch warmup
- 📅 Automated scheduling
- 📋 Activity logs
- 📸 Screenshot capture
- 🔄 Import from AdsPower

**Tech Stack:**
- Backend: Node.js + Express
- Frontend: Vanilla JavaScript
- Database: JSON files (simple, portable)
- Automation: Puppeteer + AdsPower
- Deployment: Docker + Railway/VPS

---

**Ready? Deploy now!** 🚀

```bash
cd /Users/northsea/clawd-dmitry/gmail-warmup-v2
./deploy-railway.sh
```
