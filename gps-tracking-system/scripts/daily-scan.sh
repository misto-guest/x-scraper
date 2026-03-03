#!/bin/bash

###############################################################################
# Daily Business Data Scan with Telegram Reporting
# Runs at 9:00 AM to check for new leads/businesses
# Reports to Telegram group when complete
###############################################################################

# Configuration
PROJECT_DIR="/Users/northsea/clawd-dmitry/gps-tracking-system"
LOG_FILE="$PROJECT_DIR/logs/daily-scan.log"
DATE=$(date '+%Y-%m-%d %H:%M:%S')
TELEGRAM_CHAT_ID="-1003847888515"

# Create logs directory if it doesn't exist
mkdir -p "$PROJECT_DIR/logs"

# Log function
log() {
    echo "[$DATE] $1" | tee -a "$LOG_FILE"
}

# Telegram notification function
send_telegram() {
    local message="$1"
    /Users/northsea/.openclaw/node/node /Users/northsea/clawd-dmitry/.clawdbot/scripts/send-telegram-notification.js \
        --chat-id "$TELEGRAM_CHAT_ID" \
        --message "$message" 2>/dev/null || log "⚠️  Telegram notification failed"
}

log "🔍 Starting daily business data scan..."

# Change to project directory
cd "$PROJECT_DIR" || exit 1

# Check for new businesses from GMB URLs
log "Fetching GMB business data..."
node scripts/fetch-gmb-data.js >> "$LOG_FILE" 2>&1
FETCH_STATUS=$?

if [ $FETCH_STATUS -eq 0 ]; then
    log "✅ GMB data fetch completed"
    SCAN_RESULT="✅ GMB data fetch successful"
else
    log "⚠️  GMB data fetch had issues (check logs)"
    SCAN_RESULT="⚠️ GMB data fetch had issues"
fi

# Check database
if [ -f "data/gps-tracking.db" ]; then
    # Count businesses
    BUSINESS_COUNT=$(sqlite3 data/gps-tracking.db "SELECT COUNT(*) FROM businesses;" 2>/dev/null || echo "0")
    log "✅ Database OK - $BUSINESS_COUNT businesses tracked"
    DB_RESULT="📊 Tracking $BUSINESS_COUNT businesses"
else
    log "⚠️  Database not found"
    DB_RESULT="⚠️ Database not found"
fi

# Build report message
REPORT="🗺️ **GPS Tracking System - Daily Scan Report**

📅 $(date '+%Y-%m-%d %H:%M')

$SCAN_RESULT
$DB_RESULT

✅ Daily scan completed successfully"

# Send Telegram notification
send_telegram "$REPORT"

log "✅ Daily scan completed and reported\n"
