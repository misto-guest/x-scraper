# Tweet Monitoring System for @notgrahamp

A daily automated system to fetch, monitor, and analyze tweets from @notgrahamp.

## 📁 File Structure

```
/Users/northsea/clawd-dmitry/
├── scripts/
│   ├── fetch-notgrahamp-tweets.py    # Main Python fetcher
│   └── fetch-notgrahamp-tweets.sh    # Bash wrapper
├── data/
│   ├── notgrahamp-tweets/             # Individual tweet storage
│   ├── notgrahamp-daily-digest/       # Daily digest reports
│   ├── tweet-review-template.md       # Review template
│   ├── notgrahamp-crontab.txt         # Crontab entry
│   ├── notgrahamp-state.json          # State tracking (auto-created)
│   └── com.clawd.notgrahamp-tweet-monitor.plist  # launchd config
└── logs/
    ├── notgrahamp-fetch.log           # Script logs
    ├── notgrahamp-cron.log            # Cron logs
    └── notgrahamp-launchd.log         # launchd logs
```

## 🚀 Quick Start

### Option 1: Using launchd (Recommended for macOS)

```bash
# Copy the plist file to LaunchAgents
cp /Users/northsea/clawd-dmitry/data/com.clawd.notgrahamp-tweet-monitor.plist \
   ~/Library/LaunchAgents/

# Load the agent
launchctl load ~/Library/LaunchAgents/com.clawd.notgrahamp-tweet-monitor.plist

# Check if it's loaded
launchctl list | grep notgrahamp
```

To uninstall:
```bash
launchctl unload ~/Library/LaunchAgents/com.clawd.notgrahamp-tweet-monitor.plist
```

### Option 2: Using crontab

```bash
# Install the crontab entry
crontab < /Users/northsea/clawd-dmitry/data/notgrahamp-crontab.txt

# Verify
crontab -l
```

To uninstall:
```bash
crontab -e  # Delete the line
```

### Option 3: Manual Testing

```bash
# Run the script manually
/Users/northsea/clawd-dmitry/scripts/fetch-notgrahamp-tweets.sh

# Or run the Python script directly
python3 /Users/northsea/clawd-dmitry/scripts/fetch-notgrahamp-tweets.py
```

## 📊 How It Works

1. **Fetch**: Runs daily at 9:00 AM Europe/Amsterdam time
2. **Parse**: Downloads @notgrahamp's Twitter profile and extracts tweets
3. **Store**: Saves new tweets as individual markdown files
4. **Digest**: Generates a daily summary report
5. **Track**: Maintains state to avoid duplicates

## 📝 Output Files

### Individual Tweets
Located in: `/Users/northsea/clawd-dmitry/data/notgrahamp-tweets/`

Each tweet is saved as `tweet-{ID}.md` with:
- Tweet text
- Date/time
- URL
- Engagement metrics (if available)
- Images (if available)

### Daily Digest
Located in: `/Users/northsea/clawd-dmitry/data/notgrahamp-daily-digest/`

Named `daily-digest-YYYY-MM-DD.md` with:
- Summary of new tweets
- Tweet previews
- Key insights section (to be filled manually)
- Action items section (to be filled manually)
- Engagement analysis section (to be filled manually)

## 🔧 Configuration

Edit `/Users/northsea/clawd-dmitry/scripts/fetch-notgrahamp-tweets.py`:

```python
USERNAME = "notgrahamp"  # Change to monitor different user
BASE_DIR = Path("/Users/northsea/clawd-dmitry")  # Base directory
```

## 📖 Using the Review Template

1. Copy the template:
   ```bash
   cp /Users/northsea/clawd-dmitry/data/tweet-review-template.md \
      /Users/northsea/clawd-dmitry/data/reviews/review-YYYY-MM-DD.md
   ```

2. Fill in the sections:
   - **New Tweets Summary**: List tweets you reviewed
   - **Key Insights**: What did you learn?
   - **Action Items**: What needs to be done?
   - **Engagement Analysis**: Which tweets performed best?

## ⚠️ Known Limitations

- **Twitter API**: This system uses web scraping, which may break if Twitter changes their HTML structure
- **Rate Limits**: No authentication = potential rate limiting
- **Engagement Metrics**: Basic scraping may not capture all metrics
- **Images**: Requires additional processing to download images

## 🔄 Maintenance

### Check Logs
```bash
# Script logs
tail -f /Users/northsea/clawd-dmitry/logs/notgrahamp-fetch.log

# Cron logs
tail -f /Users/northsea/clawd-dmitry/logs/notgrahamp-cron.log

# launchd logs
tail -f /Users/northsea/clawd-dmitry/logs/notgrahamp-launchd.log
```

### Update Dependencies
```bash
pip3 install --upgrade --break-system-packages --user requests beautifulsoup4
```

### Reset State
```bash
rm /Users/northsea/clawd-dmitry/data/notgrahamp-state.json
```

## 🎯 Next Steps

1. **Test the script**: Run manually first to verify it works
2. **Set up automation**: Install launchd or crontab entry
3. **Review first digest**: Check the daily digest after first run
4. **Customize template**: Adjust review template for your needs
5. **Monitor logs**: Check logs regularly to ensure it's running

## 🆘 Troubleshooting

**No tweets being fetched:**
- Check if Twitter changed their HTML structure
- Try accessing @notgrahamp's profile in a browser
- Check the logs for errors

**Cron job not running:**
- Verify crontab with `crontab -l`
- Check cron logs
- Ensure script has execute permissions: `chmod +x scripts/fetch-notgrahamp-tweets.sh`

**Python dependencies missing:**
```bash
pip3 install --break-system-packages --user requests beautifulsoup4
```

## 📞 Support

For issues or questions, check the logs first:
- `/Users/northsea/clawd-dmitry/logs/notgrahamp-fetch.log`

---

**Created:** 2026-02-17
**Version:** 1.0
**Status:** ✅ Active
