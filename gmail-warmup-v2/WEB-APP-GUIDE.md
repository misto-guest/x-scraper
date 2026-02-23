# Gmail Warmup Web App

Simple web interface for managing Gmail warmup profiles at scale.

## Features

✅ **Dashboard** - Real-time stats and overview
✅ **Profile Management** - Add, edit, delete profiles
✅ **Warmup Control** - Run single or batch warmups
✅ **Activity Logs** - View recent activity and errors
✅ **Schedule Management** - Configure automated warmup schedules
✅ **Import/Export** - Import profiles from AdsPower API
✅ **Batch Operations** - Run warmups for multiple profiles

## Quick Start

1. **Start the server:**
   ```bash
   cd /Users/northsea/clawd-dmitry/gmail-warmup-v2
   PORT=3456 npm start
   ```

2. **Open the web app:**
   ```
   http://localhost:3456
   ```

3. **Add your first profile:**
   - Profile ID: Your AdsPower profile ID (e.g., `k12am9a2`)
   - Name: Display name
   - Email: Gmail address
   - Schedule: When to run warmup
   - Activities: Gmail, Search, News

## Screens

### 1. Dashboard
- Total profiles
- Successful/failed warmups
- Active schedules
- Latest activity log

### 2. Add Profile
- Enter profile details
- Configure schedule
- Select activities
- Enable/disable automation

### 3. Profiles Table
- View all profiles
- Check status
- Run manual warmup
- Edit/delete profiles
- Filter by status

### 4. Quick Actions
- Run batch warmup (all profiles)
- Import from AdsPower
- Refresh data
- Clear logs

## API Endpoints

The web app uses these API endpoints:

```
GET  /api/profiles           # List all profiles
GET  /api/profiles/:id       # Get single profile
POST /api/profiles           # Add new profile
PUT  /api/profiles/:id       # Update profile
DELETE /api/profiles/:id     # Delete profile

POST /api/warmup/:id         # Run warmup for profile
POST /api/import             # Import from AdsPower

GET  /api/logs               # Get activity logs
POST /api/logs/clear         # Clear logs
GET  /api/batch/results      # Get batch results

GET  /api/schedules          # Get all schedules
GET  /api/stats/:id          # Get profile stats
GET  /api/test-connection    # Test AdsPower connection
```

## Profile Fields

- **profile_id** - AdsPower profile ID (required)
- **name** - Display name (required)
- **email** - Gmail address (required)
- **frequency** - Schedule frequency (daily/hourly/weekly)
- **hour** - Hour to run (0-23)
- **minute** - Minute to run (0-59)
- **timezone** - Timezone (e.g., Europe/Amsterdam)
- **activities** - Array: ['gmail', 'search', 'news']
- **enabled** - Enable/disable schedule (true/false)

## Schedule Examples

```javascript
// Daily at 9 AM Amsterdam time
{
  frequency: 'daily',
  hour: 9,
  minute: 0,
  timezone: 'Europe/Amsterdam',
  enabled: true
}

// Every hour
{
  frequency: 'hourly',
  hour: 0,
  minute: 0,
  timezone: 'Europe/Amsterdam',
  enabled: true
}

// Weekly (Mondays at 10 AM)
{
  frequency: 'weekly',
  hour: 10,
  minute: 0,
  timezone: 'Europe/Amsterdam',
  enabled: true
}
```

## Batch Warmup

For processing 50 profiles daily, use the CLI tool:

```bash
# Run all profiles from config file
node warmup-batch.js --file profiles.txt

# Run 5 profiles at once
node warmup-batch.js --parallel 5 --file profiles.txt

# Specific profiles
node warmup-batch.js --profiles k12am9a2,k12am9a3,k12am9a4
```

Or set up a cron job:

```bash
# Run batch warmup every day at 9 AM
0 9 * * * cd /Users/northsea/clawd-dmitry/gmail-warmup-v2 && node warmup-batch.js --file profiles.txt >> logs/cron.log 2>&1
```

## Data Files

- `data/profiles.json` - Profile configurations
- `data/schedules.json` - Schedule settings
- `data/stats.json` - Warmup statistics
- `data/batch-results.json` - Batch warmup results
- `logs/warmup.log` - Activity logs
- `screenshots/` - Warmup screenshots

## Troubleshooting

### Port already in use
```bash
# Kill process on port 3456
npx kill-port 3456

# Or use different port
PORT=3457 npm start
```

### AdsPower connection failed
1. Check AdsPower is running
2. Verify IP/port in config/secure.yaml
3. Test API key: curl http://95.217.224.154:50325/api/v2/user/list?api_key=YOUR_KEY

### Warmup not starting
1. Check profile ID is correct
2. Verify profile exists in AdsPower
3. Check logs: tail -f logs/warmup.log
4. Test connection: curl http://localhost:3456/api/test-connection

## Technical Stack

- **Backend:** Node.js + Express
- **Frontend:** Vanilla JavaScript (no framework)
- **Styling:** Custom CSS (no framework)
- **Database:** JSON files (simple and portable)
- **Browser Automation:** Puppeteer + AdsPower

## Production Deployment

For production use:

1. **Use process manager:**
   ```bash
   npm install -g pm2
   pm2 start index.js --name gmail-warmup
   pm2 startup
   pm2 save
   ```

2. **Set up reverse proxy:**
   ```nginx
   location / {
       proxy_pass http://localhost:3456;
       proxy_http_version 1.1;
       proxy_set_header Upgrade $http_upgrade;
       proxy_set_header Connection 'upgrade';
       proxy_set_header Host $host;
       proxy_cache_bypass $http_upgrade;
   }
   ```

3. **Configure cron jobs:**
   - Add batch warmup to crontab
   - Set up log rotation
   - Monitor disk space for screenshots

4. **Monitoring:**
   - Check logs regularly
   - Monitor success rates
   - Alert on high failure rates
   - Review disk usage

## Security

- API runs on localhost only (default)
- Add authentication for production
- Use HTTPS in production
- Restrict API access with firewall
- Rotate API keys regularly
- Keep screenshots private (contain email data)

## License

MIT

## Support

For issues or questions:
1. Check logs: `logs/warmup.log`
2. Test AdsPower connection
3. Verify profile configurations
4. Check browser screenshots
