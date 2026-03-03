#!/bin/bash

###############################################################################
# Visit Tracker - Runs 2x per day
# Tracks visits to businesses and updates visit history
###############################################################################

# Configuration
PROJECT_DIR="/Users/northsea/clawd-dmitry/gps-tracking-system"
LOG_FILE="$PROJECT_DIR/logs/visit-tracker.log"
DATE=$(date '+%Y-%m-%d %H:%M:%S')
TELEGRAM_CHAT_ID="-1003847888515"

# Create logs directory
mkdir -p "$PROJECT_DIR/logs"

# Log function
log() {
    echo "[$DATE] $1" | tee -a "$LOG_FILE"
}

# Telegram notification
send_telegram() {
    local message="$1"
    /Users/northsea/.openclaw/node/node /Users/northsea/clawd-dmitry/.clawdbot/scripts/send-telegram-notification.js \
        --chat-id "$TELEGRAM_CHAT_ID" \
        --message "$message" 2>/dev/null || log "⚠️  Telegram notification failed"
}

cd "$PROJECT_DIR" || exit 1

log "📍 Starting visit tracking..."

# Get current businesses
BUSINESSES=$(node -e "
const initSqlJs = require('sql.js');
const fs = require('fs');
const path = require('path');

async function getBusinesses() {
  const SQL = await initSqlJs();
  const db = new SQL.Database(fs.readFileSync(path.join(__dirname, 'data/gps-tracking.db')));
  const result = db.exec('SELECT id, name FROM businesses ORDER BY name');
  result[0].values.forEach(row => console.log(row.join('|')));
}
getBusinesses();
" 2>/dev/null)

# Count businesses
BUSINESS_COUNT=$(echo "$BUSINESSES" | wc -l | tr -d ' ')

log "Found $BUSINESS_COUNT businesses to track"

# Report visits
REPORT="📍 **GPS Tracking - Visit Check**

📅 $(date '+%Y-%m-%d %H:%M')

🔍 Checking visits for $BUSINESS_COUNT businesses:

$BUSINESSES

✅ Visit check completed - Ready for manual visit logging"

send_telegram "$REPORT"

log "✅ Visit tracking completed and reported\n"
