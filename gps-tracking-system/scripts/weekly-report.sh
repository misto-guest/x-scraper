#!/bin/bash

###############################################################################
# Weekly Route Report
# Runs Monday 8:00 AM to generate route summaries
###############################################################################

# Configuration
PROJECT_DIR="/Users/northsea/clawd-dmitry/gps-tracking-system"
LOG_FILE="$PROJECT_DIR/logs/weekly-report.log"
REPORT_FILE="$PROJECT_DIR/reports/weekly-$(date '+%Y-%m-%d').txt"
DATE=$(date '+%Y-%m-%d %H:%M:%S')

# Create directories
mkdir -p "$PROJECT_DIR/logs"
mkdir -p "$PROJECT_DIR/reports"

# Log function
log() {
    echo "[$DATE] $1" | tee -a "$LOG_FILE"
}

log "📈 Generating weekly route report..."

# Change to project directory
cd "$PROJECT_DIR" || exit 1

# Initialize report
{
    echo "=============================================="
    echo "    GPS TRACKING SYSTEM - WEEKLY REPORT"
    echo "=============================================="
    echo "Generated: $(date '+%Y-%m-%d %H:%M:%S')"
    echo ""

    # Query database for business list
    node -e "
const initSqlJs = require('sql.js');
const fs = require('fs');

initSqlJs().then(SQL => {
  if (!fs.existsSync('data/gps-tracking.db')) {
    console.log('⚠️  Database not found');
    return;
  }

  const buffer = fs.readFileSync('data/gps-tracking.db');
  const db = new SQL.Database(buffer);

  console.log('');
  console.log('----------------------------------------------');
  console.log('BUSINESS SUMMARY');
  console.log('----------------------------------------------');

  const businesses = db.exec('SELECT name, address, status FROM businesses ORDER BY name');
  if (businesses.length > 0) {
    const cols = businesses[0].columns;
    const values = businesses[0].values;
    console.log(cols.join(' | '));
    values.forEach(row => console.log(row.join(' | ')));
  }

  console.log('');
  console.log('Total Businesses:', db.exec('SELECT COUNT(*) FROM businesses')[0]?.values[0]?.[0] || 0);
  console.log('Active Businesses:', db.exec(\"SELECT COUNT(*) FROM businesses WHERE status = 'active'\")[0]?.values[0]?.[0] || 0);
});
" 2>/dev/null

    echo ""
    echo "----------------------------------------------"
    echo "ROUTE OPTIMIZATION"
    echo "----------------------------------------------"
    echo "View optimized routes at: http://localhost:3000/routes.html"
    echo ""
    echo "View all locations: http://localhost:3000/map.html"
    echo ""
    echo "----------------------------------------------"
    echo "ACCESS LINKS"
    echo "----------------------------------------------"
    echo "Dashboard: http://localhost:3000"
    echo "Routes:    http://localhost:3000/routes.html"
    echo "Map:       http://localhost:3000/map.html"
    echo ""
    echo "=============================================="
    echo "    END OF REPORT"
    echo "=============================================="
    echo ""

} > "$REPORT_FILE"

log "✅ Weekly report generated: $REPORT_FILE"

# Display quick summary
echo ""
echo "=============================================="
echo "📊 WEEKLY REPORT SUMMARY"
echo "=============================================="
echo "Full report: $REPORT_FILE"
echo ""
echo "Access the dashboard at:"
echo "  http://localhost:3000"
echo ""

log "✅ Weekly report completed\n"
