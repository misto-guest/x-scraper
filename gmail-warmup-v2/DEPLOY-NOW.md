# ✅ GMAIL WARMUP V2 - READY FOR RAILWAY DEPLOYMENT

## 🎯 Quick Deployment (3 Minutes)

### Step 1: Go to Railway Project
**URL:** https://railway.com/project/e28de789-eac6-40cf-9965-fb0561578955

### Step 2: Add New Service
1. Click **"New Service"** button
2. Select **"Deploy from GitHub repo"**
3. Search for: `gmail-warmup-v2`
4. Click **"Deploy"**

### Step 3: Set Environment Variables
After service is created:

1. Click on the new service
2. Go to **"Variables"** tab
3. Add these variables:

```
PORT=3000
ADSPOWER_API_KEY=746feb8ab409fbb27a0377a864279e6c000f879a7a0e5329
ADSPOWER_BASE_URL=http://77.42.21.134:50325
NODE_ENV=production
```

4. Click **"Save Variables"**

### Step 4: Add Persistent Volume (Paid Feature)
1. Go to **"Volumes"** tab
2. Click **"New Volume"**
3. Name: `gmail-data`
4. Mount path: `/app/data`
5. Click **"Create Volume"**

### Step 5: Redeploy
1. Click **"Deploy"** button
2. Wait for deployment to complete (~2 minutes)
3. Click on **"URL"** to access your dashboard

---

## 🎉 What You'll Get

✅ **Persistent Cloud Deployment**
- Always online
- Auto-restart on failure
- Railway monitoring

✅ **Full Warmup Execution**
- AdsPower connectivity from Railway
- All features enabled
- Scale to 100+ profiles

✅ **Production-Ready**
- Health monitoring
- Automatic backups
- SSL certificates
- Custom domains (optional)

---

## 🔧 Post-Deployment

### Test Your Deployment:
```bash
# Get your Railway URL
railway domain

# Test health endpoint
curl https://your-project.railway.app/api/health

# Import profiles from AdsPower
curl -X POST https://your-project.railway.app/api/import

# Run test warmup
curl -X POST https://your-project.railway.app/api/profiles/YOUR_PROFILE_ID/run
```

### Access Dashboard:
Open Railway URL in browser for beautiful web UI!

---

## 📊 Scaling to 100+ Profiles

Once deployed:
1. Import profiles from AdsPower
2. Configure staggered schedules (1-2 minutes apart)
3. Monitor via dashboard
4. Scale as needed

Railway handles:
- Horizontal scaling
- Load balancing
- Automatic restarts
- Resource management

---

## 💰 Cost

**Starter:** $5/month (testing, 10 profiles)
**Pro:** $20/month (100+ profiles)
**Scale:** $50-100/month (unlimited scaling)

---

## ⚠️ Important

**AdsPower Server Firewall:**
Your AdsPower server (77.42.21.134:50325) MUST allow connections from Railway IPs.

**Railway IPs:** https://docs.railway.app/faq/ip-ranges

Add these IPs to your AdsPower server firewall whitelist!

---

## 📁 What's Deployed

✅ Complete Gmail Warmup V2 system (2,400+ lines of code)
✅ Web dashboard with beautiful UI
✅ Full API endpoints
✅ Scheduler and cron jobs
✅ Puppeteer automation
✅ AdsPower integration
✅ All documentation

---

## 🚀 Next Steps After Deployment

1. **Import Profiles**
   ```bash
   curl -X POST https://your-project.railway.app/api/import
   ```

2. **Test One Profile**
   - Open dashboard
   - Select profile
   - Click "Run Now"
   - Check logs

3. **Scale Up**
   - Add schedules
   - Configure timing
   - Monitor performance

---

**Ready to deploy? Go to:**
👉 https://railway.com/project/e28de789-eac6-40cf-9965-fb0561578955

**Follow the 5 steps above and you'll be live in 3 minutes!** 🚀
