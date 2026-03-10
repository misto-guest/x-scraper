# X Scraper Cron Job - Automation Setup

## Overview

This cron service automatically triggers the X Scraper to fetch tweets from the `@publisherinabox` account daily at 09:00 UTC (10:00 AM Amsterdam).

## Architecture

```
┌─────────────────┐         ┌──────────────────┐
│ Railway Cron    │────────▶│ X Scraper API    │
│ Service         │  POST   │ (x-scraper-ts)   │
│                 │────────▶│                  │
│ Schedule:       │         │ Saves tweets to  │
│ 0 9 * * *       │         │ database         │
└─────────────────┘         └──────────────────┘
```

## Configuration

### Cron Schedule
- **Schedule:** `0 9 * * *` (09:00 UTC daily)
- **Time Zone:** UTC
- **Local Time:** 10:00 AM Amsterdam (GMT+1) / 09:00 AM London (GMT+0)

### Environment Variables

| Variable | Default | Description |
|----------|---------|-------------|
| `SCRAPER_URL` | `https://x-scraper-ts-production.up.railway.app` | X Scraper API base URL |
| `SCRAPER_USERNAME` | `publisherinabox` | Twitter username to scrape |
| `SCRAPE_COUNT` | `50` | Number of tweets to fetch |
| `WEBHOOK_URL` | (empty) | Optional webhook for notifications |

### Service Details
- **Service Name:** `x-scraper-cron`
- **Project:** `x-scraper-ts`
- **Environment:** `production`
- **Railway Project URL:** https://railway.com/project/12c21379-077e-4301-bd21-f05d828c8f8c

## Monitoring

### View Logs

```bash
# Link to the cron service
cd /tmp/x-scraper-cron
railway link --project 12c21379-077e-4301-bd21-f05d828c8f8c
railway service link x-scraper-cron

# View live logs
railway logs --lines 100

# View logs from last run
railway logs --since 24h
```

### Check Service Status

```bash
# Check all services in the project
railway service status --all

# Check cron service specifically
railway status
```

### Log Format

Each cron run produces logs like:
```
[2026-03-04T09:00:00.000Z] Starting X Scraper cron job...
[2026-03-04T09:00:00.000Z] Target: https://x-scraper-ts-production.up.railway.app/api/scrape/profile/publisherinabox
[2026-03-04T09:00:00.000Z] Count: 50 tweets
[2026-03-04T09:00:01.500Z] Response status: 200
[2026-03-04T09:00:01.500Z] Response data: { "success": true, ... }
[2026-03-04T09:00:01.500Z] ✅ SUCCESS: Scraping completed successfully
```

## Testing

### Manual Trigger

To test the cron job manually without waiting for the schedule:

```bash
# Using Railway CLI
cd /tmp/x-scraper-cron
railway up

# Or trigger a redeployment
railway service redeploy
```

### Direct API Test

Test the X Scraper endpoint directly:

```bash
curl -X POST https://x-scraper-ts-production.up.railway.app/api/scrape/profile/publisherinabox \
  -H "Content-Type: application/json" \
  -d '{"count": 5}'
```

### Verify Data Saved

Check if tweets were saved to the database:

```bash
curl https://x-scraper-ts-production.up.railway.app/api/tweets
curl https://x-scraper-ts-production.up.railway.app/api/stats
```

## Modifying the Schedule

### Change Cron Schedule

1. Edit `railway.json` in the service directory:
   ```json
   {
     "deploy": {
       "cron": "0 9 * * *"  // Change this
     }
   }
   ```

2. Common schedules:
   - Every 6 hours: `0 */6 * * *`
   - Twice daily (9 AM & 9 PM UTC): `0 9,21 * * *`
   - Weekdays only: `0 9 * * 1-5`
   - Every hour: `0 * * * *`

3. Redeploy:
   ```bash
   railway up
   ```

### Add Multiple Targets

Option 1: Separate cron jobs for each account
- Create new cron service for each username
- Each with own schedule

Option 2: Modify script to scrape multiple accounts
- Update `index.js` to loop through multiple usernames
- Add array of usernames to environment variables

## Troubleshooting

### No Tweets Scraped

If logs show "No tweets scraped":

1. **Check X Scraper status:**
   ```bash
   curl https://x-scraper-ts-production.up.railway.app/health
   ```

2. **Verify account exists:**
   - Check if @publisherinabox Twitter account is active
   - Verify account hasn't been suspended/locked

3. **Check X Scraper logs:**
   ```bash
   railway service link x-scraper-ts
   railway logs
   ```

4. **Rate limiting:**
   - X/Twitter may be rate limiting requests
   - Consider reducing frequency or count

### Cron Not Running

1. **Check service is deployed:**
   ```bash
   railway service status --all
   ```

2. **Verify cron schedule in railway.json:**
   ```bash
   cat railway.json | grep cron
   ```

3. **Check Railway status page:**
   - https://railway.com/project/12c21379-077e-4301-bd21-f05d828c8f8c

### Service Crashes

1. **View error logs:**
   ```bash
   railway logs --lines 200
   ```

2. **Check environment variables:**
   ```bash
   railway variables
   ```

3. **Redeploy:**
   ```bash
   railway service redeploy
   ```

## Setup Webhook Notifications (Optional)

To receive notifications on each cron run:

1. Create a webhook URL (e.g., Slack, Discord, custom endpoint)
2. Set the `WEBHOOK_URL` environment variable:
   ```bash
   railway variables set WEBHOOK_URL=https://your-webhook-url
   ```
3. Redeploy the service

Example webhook payloads:
- Success: `✅ X Scraper Cron\n\n...details...`
- Failure: `❌ X Scraper Cron\n\n...error details...`

## Railway Dashboard

- **Project:** https://railway.com/project/12c21379-077e-4301-bd21-f05d828c8f8c
- **Service:** x-scraper-cron
- **Logs:** Available in Railway dashboard under "Logs" tab
- **Metrics:** CPU, Memory, and Restart counts visible in dashboard

## Next Steps

1. **Verify X Scraper is working:** Check why "No tweets scraped" is returned
2. **Set up monitoring:** Add webhook notifications for alerts
3. **Adjust schedule:** Modify cron based on needs
4. **Add more accounts:** Set up additional cron jobs for other Twitter accounts

## Technical Details

- **Runtime:** Node.js (via Nixpacks)
- **Dependencies:** node-fetch
- **Execution:** Script runs once per cron invocation and exits
- **Retries:** Railway automatically retries on failure (exit code 1)
- **Logs:** Stored in Railway for 7 days (retention period)

## Support

- Railway Documentation: https://docs.railway.app
- Railway Cron Guide: https://docs.railway.app/guides/cron-jobs
- X Scraper Repo: (add link if available)

---

**Created:** 2026-03-04
**Status:** ✅ Active and running
**Next Run:** 09:00 UTC tomorrow
