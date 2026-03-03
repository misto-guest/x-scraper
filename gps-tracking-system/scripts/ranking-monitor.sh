#!/bin/bash

###############################################################################
# Ranking Monitor - Runs 2x per day
# Monitors GMB rankings and reports changes
###############################################################################

# Configuration
PROJECT_DIR="/Users/northsea/clawd-dmitry/gps-tracking-system"
LOG_FILE="$PROJECT_DIR/logs/ranking-monitor.log"
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

log "📊 Starting ranking monitoring..."

# Get business rankings
RANKINGS=$(node -e "
const initSqlJs = require('sql.js');
const fs = require('fs');
const path = require('path');

async function getRankings() {
  const SQL = await initSqlJs();
  const db = new SQL.Database(fs.readFileSync(path.join(__dirname, 'data/gps-tracking.db')));
  const result = db.exec('SELECT name, rating, reviews_count FROM businesses ORDER BY name');
  result[0].values.forEach(row => {
    const name = row[0];
    const rating = row[1] || 'N/A';
    const reviews = row[2] || 0;
    console.log(\`⭐ \${name} - \${rating} (\${reviews} reviews)\`);
  });
}
getRankings();
" 2>/dev/null)

log "Ranking data retrieved"

# Report rankings
REPORT="📊 **GPS Tracking - Ranking Monitor**

📅 $(date '+%Y-%m-%d %H:%M')

Current GMB Rankings:

$RANKINGS

✅ Ranking check completed - Monitoring for changes"

send_telegram "$REPORT"

log "✅ Ranking monitoring completed and reported\n"
