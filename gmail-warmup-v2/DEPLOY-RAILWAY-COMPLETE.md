# 🚀 DEPLOY GMAIL WARMUP V2 TO RAILWAY - COMPLETE GUIDE

## Current Status
✅ GitHub repo: https://github.com/misto-guest/gmail-warmup-v2
✅ Railway project: https://railway.com/project/e28de789-eac6-40cf-9965-fb0561578955
⚠️  Service needs to be created

---

## Method 1: Railway Web UI (EASIEST - 2 Minutes)

### Step 1: Open Railway Project
Go to: https://railway.com/project/e28de789-eac6-40cf-9965-fb0561578955

### Step 2: Create New Service
1. Click the **"New Service"** button (top right)
2. Select **"Deploy from GitHub repo"**
3. You'll see a list of your GitHub repositories
4. Find and select **"gmail-warmup-v2"**
5. Click **"Deploy"**

### Step 3: Configure Environment Variables
Wait for the service to be created (30 seconds), then:

1. Click on the new service (it will have a name like "gmail-warmup-v2")
2. Go to the **"Variables"** tab
3. Click **"New Variable"** and add these ONE AT A TIME:

```
Name: PORT
Value: 3000

Name: ADSPOWER_API_KEY
Value: 746feb8ab409fbb27a0377a864279e6c000f879a7a0e5329

Name: ADSPOWER_BASE_URL
Value: http://77.42.21.134:50325

Name: NODE_ENV
Value: production
```

4. Click **"Save Changes"** or **"Deploy"** after adding variables

### Step 4: Add Volume (For Persistent Data)
1. Go to the **"Storage"** tab in your service
2. Click **"New Volume"**
3. Enter:
   - Name: `gmail-data`
   - Mount path: `/app/data`
4. Click **"Create Volume"**

### Step 5: Redeploy
1. Go to the **"Deployments"** tab
2. Click the **"Redeploy"** button (top right)
3. Wait 2-3 minutes for deployment to complete

### Step 6: Access Your App
1. Click on the **"Networking"** tab or look for the generated URL
2. Your app will be at: `https://your-project-name.up.railway.app`
3. Test it: Open in browser or use `curl https://your-url.up.railway.app/api/health`

---

## Method 2: Railway CLI (If You Prefer Terminal)

```bash
# Navigate to project
cd /Users/northsea/clawd-dmitry/gmail-warmup-v2

# Link project (already done)
railway link --project e28de789-eac6-40cf-9965-fb0561578955

# Add environment variables
railway variables set PORT=3000
railway variables set ADSPOWER_API_KEY=746feb8ab409fbb27a0377a864279e6c000f879a7a0e5329
railway variables set ADSPOWER_BASE_URL=http://77.42.21.134:50325
railway variables set NODE_ENV=production

# Trigger deployment
railway up

# Wait for deployment...
railway status

# Get deployment URL
railway domain
```

---

## Post-Deployment Steps

### 1. Test Health Endpoint
```bash
curl https://your-project.up.railway.app/api/health
```

Expected response:
```json
{
  "status": "ok",
  "timestamp": "2026-02-20T...",
  "service": "Gmail Warmup V2"
}
```

### 2. Import Profiles from AdsPower
```bash
curl -X POST https://your-project.up.railway.app/api/import
```

### 3. View Profiles
```bash
curl https://your-project.up.railway.app/api/profiles | jq '.'
```

### 4. Test Warmup on One Profile
```bash
curl -X POST https://your-project.up.railway.app/api/profiles/YOUR_PROFILE_ID/run
```

---

## ⚠️ CRITICAL: AdsPower Firewall Configuration

Your AdsPower server at `77.42.21.134:50325` **MUST** allow connections from Railway.

### Get Railway IPs:
https://docs.railway.app/faq/ip-ranges

### Allowlist on Your AdsPower Server:
1. SSH into your AdsPower server
2. Add Railway IPs to firewall whitelist
3. Restart firewall if needed

Without this, Railway containers cannot reach your AdsPower API!

---

## Troubleshooting

### Issue: "Cannot connect to AdsPower"
**Solution:** Whitelist Railway IPs in AdsPower server firewall

### Issue: "Port already in use"
**Solution:** Railway auto-assigns ports, use PORT=3000 variable

### Issue: "Data resets on redeploy"
**Solution:** Add persistent volume (Step 4 above)

### Issue: "Build failed"
**Solution:** Check deployment logs in Railway Dashboard → Deployments tab

---

## What You Get After Deployment

✅ **Persistent Cloud Deployment**
- Always online, auto-restart
- Railway health monitoring
- SSL certificates included

✅ **Full Warmup Execution**
- AdsPower connectivity from Railway
- All features enabled
- Scale to 100+ profiles

✅ **Web Dashboard**
- Beautiful UI at your Railway URL
- Profile management
- Schedule configuration
- Real-time statistics

✅ **Production Ready**
- Logs and monitoring
- Error tracking
- Easy scaling

---

## Cost Estimates

| Plan | Price | Profiles |
|------|-------|----------|
| Starter | $5/month | 1-10 profiles |
| Pro | $20/month | 50-100 profiles |
| Scale | $50+/month | Unlimited |

---

## Success Checklist

After deployment, verify:
- [ ] Health endpoint returns 200 OK
- [ ] Dashboard loads in browser
- [ ] Can view profiles (even if empty)
- [ ] Can import from AdsPower
- [ ] Can run warmup on test profile
- [ ] Screenshots save correctly
- [ ] Scheduler works

---

## Support Links

- Railway Docs: https://docs.railway.app
- Railway Dashboard: https://railway.com/project/e28de789-eac6-40cf-9965-fb0561578955
- GitHub Repo: https://github.com/misto-guest/gmail-warmup-v2

---

**Ready? Go to Railway and click "New Service"!** 🚀

https://railway.com/project/e28de789-eac6-40cf-9965-fb0561578955
