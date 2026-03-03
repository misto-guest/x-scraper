#!/bin/bash

###############################################################################
# Install GPS Tracking Cron Jobs
# Run this script to install all automation cron jobs
###############################################################################

echo "🔧 Installing GPS Tracking System cron jobs..."

# Get current crontab (if exists)
CURRENT_CRON=$(crontab -l 2>/dev/null || true)

# Append new cron jobs
NEW_CRON="$CURRENT_CRON

# GPS Tracking System Automation
# Daily Scan - 9:00 AM every day
0 9 * * * /Users/northsea/clawd-dmitry/gps-tracking-system/scripts/daily-scan.sh

# Visit Tracker - 2x per day (9:30 AM and 5:30 PM)
30 9 * * * /Users/northsea/clawd-dmitry/gps-tracking-system/scripts/visit-tracker.sh
30 17 * * * /Users/northsea/clawd-dmitry/gps-tracking-system/scripts/visit-tracker.sh

# Ranking Monitor - 2x per day (10:00 AM and 6:00 PM)
0 10 * * * /Users/northsea/clawd-dmitry/gps-tracking-system/scripts/ranking-monitor.sh
0 18 * * * /Users/northsea/clawd-dmitry/gps-tracking-system/scripts/ranking-monitor.sh

# Weekly Report - Monday 8:00 AM
0 8 * * 1 /Users/northsea/clawd-dmitry/gps-tracking-system/scripts/weekly-report.sh"

# Install new crontab
echo "$NEW_CRON" | crontab -

echo "✅ Cron jobs installed!"
echo ""
echo "📋 Scheduled tasks:"
echo "  • Daily scan: 9:00 AM"
echo "  • Visit tracker: 9:30 AM & 5:30 PM (2x per day)"
echo "  • Ranking monitor: 10:00 AM & 6:00 PM (2x per day)"
echo "  • Weekly report: Monday 8:00 AM"
echo ""
echo "To view cron jobs: crontab -l"
echo "To remove: crontab -e (and delete lines)"
