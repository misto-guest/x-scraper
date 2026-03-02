#!/bin/bash

###############################################################################
# Update Dashboard Data
# Runs every 6 hours to refresh dashboard data
###############################################################################

# Configuration
PROJECT_DIR="/Users/northsea/clawd-dmitry/gps-tracking-system"
LOG_FILE="$PROJECT_DIR/logs/update-data.log"
DATE=$(date '+%Y-%m-%d %H:%M:%S')

# Create logs directory if it doesn't exist
mkdir -p "$PROJECT_DIR/logs"

# Log function
log() {
    echo "[$DATE] $1" | tee -a "$LOG_FILE"
}

log "🔄 Starting dashboard data update..."

# Change to project directory
cd "$PROJECT_DIR" || exit 1

# Check if server is running
if ! pgrep -f "node server.js" > /dev/null; then
    log "⚠️  Server is not running, starting it..."
    nohup node server.js > logs/server.log 2>&1 &
    sleep 3
    log "✅ Server started on port 3000"
else
    log "✅ Server is running"
fi

# Fetch fresh data from APIs
log "Refreshing business data..."
node scripts/fetch-gmb-data.js >> "$LOG_FILE" 2>&1

# Clean up old logs (keep last 7 days)
find "$PROJECT_DIR/logs" -name "*.log" -mtime +7 -delete 2>/dev/null
log "🧹 Cleaned up old logs"

log "✅ Data update completed\n"
