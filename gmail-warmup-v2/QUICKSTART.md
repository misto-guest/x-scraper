# Quick Start Guide - Gmail Warmup V2

## 🚀 Get Started in 5 Minutes

### Step 1: Navigate to Project
```bash
cd /Users/northsea/clawd-dmitry/gmail-warmup-v2
```

### Step 2: Install Dependencies (Already Done ✅)
```bash
npm install
```

### Step 3: Import Profiles from AdsPower
```bash
node index.js --import
```

This will import all profiles from your AdsPower instance.

### Step 4: Start the Dashboard
```bash
npm start
```

### Step 5: Open Your Browser
Visit: **http://localhost:3000**

---

## 🎯 Testing Single Profile

Before running on 100+ profiles, test with one:

### Find a Profile ID
Check your dashboard for profile IDs (e.g., `k12am9a2`)

### Test It
```bash
npm test -- k12am9a2
```

Or click the **▶️ Play** button in the dashboard.

### Review Results
- Check console output
- View screenshots in `screenshots/`
- See stats in dashboard

---

## 📊 Scheduling Profiles

### Via Dashboard (Recommended)

1. Click **"Edit"** on a profile
2. Set **Frequency**: Daily, Hourly, or Weekly
3. Set **Time**: Hour (0-23) and Minute (0-59)
4. Select **Timezone**: Europe/Amsterdam, UTC, etc.
5. Choose **Activities**: Gmail, Drive, Search, News
6. **Enable** the profile
7. Click **"Save Profile"**

### Example Configurations

**Daily at 9 AM Amsterdam time:**
- Frequency: Daily
- Hour: 9
- Minute: 0
- Timezone: Europe/Amsterdam

**Every hour at :30 minutes:**
- Frequency: Hourly
- Minute: 30
- Timezone: UTC

**Weekly on Monday at 10 AM:**
- Frequency: Weekly
- Hour: 10
- Minute: 0
- Timezone: Europe/Amsterdam

---

## ⚙️ Configuration

### AdsPower Settings

Edit `index.js` if your AdsPower setup is different:

```javascript
adspower: {
    apiKey: 'your-api-key',
    baseUrl: 'http://77.42.21.134:50325'  // or http://127.0.0.1:50325
}
```

### Server Port

Default is 3000. Change with environment variable:

```bash
PORT=8080 npm start
```

---

## 🧪 Testing Checklist

- [ ] Help command works: `node index.js --help`
- [ ] Import succeeds: `node index.js --import`
- [ ] Dashboard loads: http://localhost:3000
- [ ] Can add/edit/delete profiles
- [ ] Single profile test works: `npm test -- <profileId>`
- [ ] Screenshots are created in `screenshots/`
- [ ] Stats appear in dashboard after run

---

## 📈 Scaling to 100+ Profiles

### 1. Import All Profiles
```bash
node index.js --import
```

### 2. Configure Schedules
- Don't run all profiles at the same time
- Example: 20 profiles at 9:00, 20 at 10:00, etc.
- Use different hours for different groups

### 3. Monitor Resources
```bash
# In another terminal, watch CPU/memory
top -o cpu
```

### 4. Use PM2 for Production
```bash
npm install -g pm2
pm2 start index.js --name gmail-warmup
pm2 save
pm2 startup
```

---

## 🛑 Stop the Server

**From terminal:** Press `Ctrl+C`

**If using PM2:**
```bash
pm2 stop gmail-warmup
pm2 delete gmail-warmup
```

---

## 🔍 Troubleshooting

### "Cannot connect to AdsPower"
- Make sure AdsPower is running
- Check the API is enabled in AdsPower settings
- Verify the URL and API key in `index.js`

### "Profile not found"
- Import profiles first: `node index.js --import`
- Check the profile ID in dashboard

### "Warmup failed"
- Profile might not be logged into Gmail
- Check screenshots in `screenshots/` for errors
- Try running the profile manually in AdsPower

### "Port already in use"
```bash
# Change port
PORT=3001 npm start

# Or kill existing process
lsof -ti:3000 | xargs kill -9
```

---

## 📁 File Locations

```
gmail-warmup-v2/
├── data/              # Profile data (JSON)
├── screenshots/       # Warmup screenshots
├── logs/             # Application logs
└── ui/               # Dashboard files
```

---

## 🎓 Pro Tips

1. **Start Small** - Test 1-3 profiles first
2. **Stagger Schedules** - Don't run 100+ at once
3. **Monitor Logs** - Keep an eye on `logs/` directory
4. **Backup Data** - Copy `data/` folder regularly
5. **Adjust Delays** - Edit `lib/warmup-engine.js` to change timing
6. **Use PM2** - For production, use process manager

---

## 📞 Need Help?

1. Check `README.md` - Full documentation
2. Check `IMPLEMENTATION-SUMMARY.md` - Technical details
3. Review logs in `logs/` directory
4. Test AdsPower connection in dashboard

---

## ✅ Success Indicators

You'll know it's working when:
- Dashboard loads at http://localhost:3000
- Profiles are listed with IDs
- You can edit profiles
- "Run Now" button starts warmup
- Screenshots appear in `screenshots/`
- Stats update after warmup completes
- Scheduled warmups run automatically

---

**Estimated Time to Full Setup:** 10-15 minutes  
**Time to First Test:** 5 minutes  
**Time to Scale to 100+:** 30-60 minutes (configuration)

Good luck! 🚀
