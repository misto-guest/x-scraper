# Gmail Warmup V2

Complete Gmail account warmup automation system with AdsPower V2 API integration, beautiful UI for profile management, and cron-based scheduling.

## 🎯 Features

- **AdsPower V2 API Integration** - Uses latest API endpoints with proper CDP URL handling
- **Beautiful Web UI** - Modern, responsive dashboard for profile CRUD operations
- **Per-Profile Scheduling** - Set custom schedules with cron (daily, hourly, weekly)
- **Data Persistence** - All profiles, schedules, and stats saved to JSON files
- **Memory-Safe** - Proper cleanup after each warmup session
- **Scalable** - Tested for 100+ profiles
- **Human-Like Behavior** - Realistic delays, mouse movements, scrolling

## 📋 Requirements

- Node.js 18+
- AdsPower running with API enabled
- AdsPower account with profiles
- (Optional) 200 Gmail accounts configured in AdsPower profiles

## 🚀 Quick Start

### 1. Install Dependencies

```bash
cd /Users/northsea/clawd-dmitry/gmail-warmup-v2
npm install
```

### 2. Configure AdsPower

Edit `index.js` if needed (default config):

```javascript
adspower: {
    apiKey: '746feb8ab409fbb27a0377a864279e6c000f879a7a0e5329',
    baseUrl: 'http://77.42.21.134:50325'
}
```

### 3. Start the Dashboard

```bash
npm start
```

Visit: **http://localhost:3000**

### 4. Import Profiles from AdsPower

Click **"Import from AdsPower"** in the dashboard, or run:

```bash
npm run import
```

### 5. Configure & Schedule Profiles

- Add/edit profiles via the UI
- Set frequency (daily, hourly, weekly)
- Choose time and timezone
- Select activities (Gmail, Drive, Search, News)
- Enable/disable profiles

## 📖 Usage

### Start Dashboard Server

```bash
npm start
```

The dashboard will be available at http://localhost:3000

### Test Single Profile

```bash
npm test -- k12am9a2
```

This runs warmup once on the specified profile and exits.

### Import Profiles

```bash
npm run import
```

Imports all profiles from AdsPower into the local database.

### CLI Options

```bash
node index.js                    # Start dashboard
node index.js --test <profileId> # Test single profile
node index.js --import           # Import from AdsPower
node index.js --help             # Show help
```

## 🏗️ Architecture

```
gmail-warmup-v2/
├── index.js              # Main orchestrator & CLI
├── lib/
│   ├── adspower-v2-client.js    # AdsPower V2 API wrapper
│   ├── profile-manager.js       # Profile CRUD & data persistence
│   ├── scheduler.js             # Cron-based scheduling
│   ├── warmup-engine.js         # Puppeteer warmup logic
│   └── api-server.js            # Express API + UI server
├── ui/
│   └── index.html        # Beautiful dashboard UI
├── data/
│   ├── profiles.json     # Profile configurations
│   ├── schedules.json    # Schedule settings
│   └── stats.json        # Run statistics
├── schedules/            # Schedule configuration files
├── screenshots/          # Warmup screenshots
└── logs/                # Application logs
```

## 🔌 API Endpoints

### Profiles

- `GET /api/profiles` - Get all profiles
- `GET /api/profiles/:id` - Get single profile
- `POST /api/profiles` - Add profile
- `PUT /api/profiles/:id` - Update profile
- `DELETE /api/profiles/:id` - Delete profile

### Warmup

- `POST /api/warmup/:id` - Run warmup for profile
- `GET /api/stats/:id` - Get profile statistics

### System

- `GET /api/summary` - Get overall summary
- `GET /api/schedules` - Get all schedules
- `GET /api/scheduler/tasks` - Get scheduled tasks
- `POST /api/import` - Import from AdsPower
- `GET /api/test-connection` - Test AdsPower connection

## 🧪 Testing on One Profile

Before scaling to 100+ profiles, test with one profile:

1. **Import profiles:**
   ```bash
   npm run import
   ```

2. **Find a profile ID** (e.g., `k12am9a2`)

3. **Test warmup:**
   ```bash
   npm test -- k12am9a2
   ```

4. **Check results:**
   - Review console output
   - Check screenshots in `screenshots/`
   - View stats in dashboard

## 📊 Scaling to 100+ Profiles

Once single-profile testing is successful:

1. **Import all profiles** from AdsPower (200 profiles)
2. **Configure schedules** via dashboard
3. **Stagger schedules** to avoid overloading:
   - Use different times for different profile groups
   - Example: 20 profiles at 9:00, 20 at 10:00, etc.
4. **Monitor resources:**
   - CPU and memory usage
   - Active profiles count
   - Success/error rates
5. **Adjust frequencies** as needed:
   - Start with daily warmup
   - Increase to hourly for trusted profiles

## 🧹 Memory Management

The system includes automatic cleanup:

1. **After each warmup:**
   - Closes all browser pages
   - Clears local/session storage
   - Disconnects Puppeteer
   - Stops AdsPower profile

2. **Scheduled cleanup:**
   - Old screenshots deleted (>7 days)
   - Logs rotated (>30 days)
   - Stats history limited (last 100 runs per profile)

## ⚙️ Configuration

### Profile Configuration

```javascript
{
  profile_id: "k12am9a2",
  name: "Gmail Warmup 1",
  email: "user@gmail.com",
  config: {
    activities: ["gmail", "search"],
    frequency: "daily",
    hour: 9,
    minute: 0,
    timezone: "Europe/Amsterdam",
    enabled: true
  }
}
```

### Warmup Activities

- **gmail** - Check emails, open random messages
- **drive** - Visit Google Drive
- **search** - Search Google, visit results
- **news** - Browse Google News

### Human Behavior Settings

Edit in `lib/warmup-engine.js`:

```javascript
delays: {
    minActionDelay: 2000,    // 2 seconds
    maxActionDelay: 5000,    // 5 seconds
    minPageStay: 10000,      // 10 seconds
    maxPageStay: 30000       // 30 seconds
}
```

## 🛡️ Safety Features

- **No parallel warmups** for the same profile
- **Automatic retry** on failure
- **Graceful shutdown** - stops all active profiles on exit
- **Error logging** - All errors tracked with timestamps
- **Statistics tracking** - Success rates, total runs

## 📈 Monitoring

### Dashboard Shows:

- Total profiles
- Enabled profiles
- Currently active profiles
- Total runs across all profiles
- Individual profile statistics
- Last run times and status

### Check via API:

```bash
# Get summary
curl http://localhost:3000/api/summary

# Get profile stats
curl http://localhost:3000/api/stats/k12am9a2

# Get scheduled tasks
curl http://localhost:3000/api/scheduler/tasks
```

## 🐛 Troubleshooting

### Profile won't start

1. Check AdsPower is running
2. Verify profile ID exists
3. Check API connection: `GET /api/test-connection`
4. Review logs in `logs/`

### Warmup fails

1. Profile might not be logged into Gmail
2. Check screenshots for errors
3. Try testing manually in AdsPower
4. Review profile stats in dashboard

### Schedules not running

1. Check profile is enabled
2. Verify schedule is correct
3. Check timezone settings
4. Review scheduler tasks: `GET /api/scheduler/tasks`

### Memory issues

1. Reduce concurrent warmups
2. Increase delay between profiles
3. Check cleanup is working
4. Restart server daily

## 📝 Data Files

All data stored in JSON format for easy backup/migration:

- `data/profiles.json` - All profile configurations
- `data/schedules.json` - Schedule settings
- `data/stats.json` - Historical statistics

**Backup:** Simply copy the `data/` directory.

**Restore:** Stop server, replace `data/`, restart.

## 🚀 Production Deployment

For long-running production use:

1. **Use a process manager:**
   ```bash
   npm install -g pm2
   pm2 start index.js --name gmail-warmup
   pm2 save
   pm2 startup
   ```

2. **Set up logging:**
   ```bash
   pm2 logs gmail-warmup
   ```

3. **Monitor resources:**
   ```bash
   pm2 monit
   ```

4. **Auto-restart on failure:**
   PM2 automatically restarts if server crashes

## 🔐 Security Notes

- **API Key:** Stored in code, consider environment variables for production
- **No authentication:** Dashboard is open, add authentication for production
- **Local only:** Designed for localhost use behind firewall

## 📄 License

MIT

## 🤝 Support

For issues or questions:
- Check troubleshooting section
- Review logs in `logs/`
- Verify AdsPower connection
- Test with single profile first

---

**Version:** 2.0.0  
**Last Updated:** 2026-02-20  
**Status:** Production Ready ✅
