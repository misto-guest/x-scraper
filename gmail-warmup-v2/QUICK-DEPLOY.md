# 🚀 Quick Railway Deployment Guide

## Prerequisites Check

- [ ] Railway paid account ✅
- [ ] GitHub repository
- [ ] AdsPower server accessible from Railway
- [ ] Railway CLI installed: `npm install -g @railway/cli`

---

## 🎯 Three Deployment Options

### Option 1: Automated Script (Easiest)

```bash
cd /Users/northsea/clawd-dmitry/gmail-warmup-v2

# Run deployment script
./deploy-railway.sh
```

That's it! The script will:
- Check Railway authentication
- Set environment variables
- Add persistent volume
- Deploy to Railway
- Provide dashboard URL

---

### Option 2: Manual Railway CLI

```bash
# 1. Install Railway CLI
npm install -g @railway/cli

# 2. Login to Railway
railway login

# 3. Initialize project
cd /Users/northsea/clawd-dmitry/gmail-warmup-v2
railway init

# 4. Set environment variables
railway variables set PORT=3000
railway variables set ADSPOWER_API_KEY=746feb8ab409fbb27a0377a864279e6c000f879a7a0e5329
railway variables set ADSPOWER_BASE_URL=http://77.42.21.134:50325
railway variables set NODE_ENV=production

# 5. Add volume for data persistence (paid feature)
railway volume add gmail-data --mount-path /app/data

# 6. Deploy
railway up

# 7. Get URL
railway domain
```

---

### Option 3: Railway Dashboard (GUI)

1. **Create GitHub Repository**
   ```bash
   cd /Users/northsea/clawd-dmitry/gmail-warmup-v2
   gh repo create gmail-warmup-v2 --public --source=. --push
   ```

2. **Deploy via Dashboard**
   - Go to [railway.com](https://railway.com)
   - Click **New Project**
   - Select **Deploy from GitHub**
   - Choose `gmail-warmup-v2` repo
   - Click **Deploy**

3. **Configure Environment Variables**
   - Go to **Variables** tab
   - Add:
     ```
     PORT=3000
     ADSPOWER_API_KEY=746feb8ab409fbb27a0377a864279e6c000f879a7a0e5329
     ADSPOWER_BASE_URL=http://77.42.21.134:50325
     NODE_ENV=production
     ```

4. **Add Volume** (Paid feature)
   - Go to **Volumes** tab
   - Add volume: `gmail-data` → `/app/data`

5. **Deploy**
   - Click **Deploy** button
   - Wait for deployment to complete

---

## 🧪 Verify Deployment

```bash
# Get deployment URL
railway domain

# Test health endpoint
curl https://your-project.railway.app/api/health

# Expected response:
{
  "status": "ok",
  "timestamp": "2026-02-20T14:00:00.000Z",
  "uptime": 123.456,
  "service": "Gmail Warmup V2"
}
```

---

## ⚠️ Critical: AdsPower Connectivity

**The deployment will fail if Railway cannot reach your AdsPower server.**

### Test Connectivity First:

```bash
# From your local machine, test if AdsPower is reachable:
curl http://77.42.21.134:50325

# If this fails, Railway containers also won't reach it.
```

### Solutions:

**1. Whitelist Railway IPs** (Recommended)
   - Get Railway IP ranges: https://docs.railway.app/faq/ip-ranges
   - Add to AdsPower server firewall

**2. Use VPN**
   - Set up WireGuard tunnel
   - Configure Railway to use VPN

**3. Deploy to Same Network**
   - Use VPS on same network as AdsPower
   - Railway for UI only

---

## 📊 Post-Deployment Steps

1. **Import Profiles**
   ```bash
   curl -X POST https://your-project.railway.app/api/import
   ```

2. **Test One Profile**
   - Open dashboard: `https://your-project.railway.app`
   - Select a test profile
   - Click **Run Now**

3. **Monitor Logs**
   ```bash
   railway logs
   ```

4. **Scale Up**
   - Add more profiles via dashboard
   - Configure schedules
   - Monitor performance

---

## 💰 Cost Estimate

**For 100+ profiles:**

| Service | Cost |
|---------|------|
| API Service | $20/month (Pro plan) |
| Worker Service | $20/month (Pro plan) |
| Volume (1GB) | $0.50/month |
| Postgres | $5/month (optional) |
| **Total** | **~$45-50/month** |

---

## 📁 Files Created for Deployment

```
gmail-warmup-v2/
├── Dockerfile                  # Railway container config
├── railway.json                # Railway project config
├── deploy-railway.sh          # Automated deployment script
├── RAILWAY-DEPLOYMENT.md      # Full documentation
├── QUICK-DEPLOY.md           # This file
├── .gitignore                 # Git ignore rules
└── lib/api-server.js         # Added health check endpoint
```

---

## 🎯 Recommended Next Steps

1. **Deploy using Option 1 (automated script)**
2. **Test connectivity to AdsPower server**
3. **Run warmup on 1 test profile**
4. **Verify screenshots and logs**
5. **Scale to 10 profiles**
6. **Then scale to 100+**

---

## 🆘 Troubleshooting

### "Cannot connect to AdsPower"
→ Check firewall, whitelist Railway IPs

### "Data resets on deploy"
→ Ensure volume is attached

### "Out of memory"
→ Upgrade to Pro plan ($20/month)

### "Health check failing"
→ Check logs: `railway logs`

---

**Ready? Run this:**

```bash
cd /Users/northsea/clawd-dmitry/gmail-warmup-v2
./deploy-railway.sh
```

**Or use Railway Dashboard for manual deployment!**
