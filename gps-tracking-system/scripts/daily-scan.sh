#!/bin/bash

###############################################################################
# Daily Business Data Scan
# Runs at 9:00 AM to check for new leads/businesses
###############################################################################

# Configuration
PROJECT_DIR="/Users/northsea/clawd-dmitry/gps-tracking-system"
LOG_FILE="$PROJECT_DIR/logs/daily-scan.log"
DATE=$(date '+%Y-%m-%d %H:%M:%S')

# Create logs directory if it doesn't exist
mkdir -p "$PROJECT_DIR/logs"

# Log function
log() {
    echo "[$DATE] $1" | tee -a "$LOG_FILE"
}

log "🔍 Starting daily business data scan..."

# Change to project directory
cd "$PROJECT_DIR" || exit 1

# Check for new businesses from GMB URLs
log "Fetching GMB business data..."
node scripts/fetch-gmb-data.js >> "$LOG_FILE" 2>&1

if [ $? -eq 0 ]; then
    log "✅ GMB data fetch completed"
else
    log "⚠️  GMB data fetch had issues (check logs)"
fi

# Check if database exists
if [ -f "data/gps-tracking.db" ]; then
    log "✅ Database exists and is accessible"
else
    log "⚠️  Database not found - run 'npm run init-db' first"
fi

log "✅ Daily scan completed\n"
