#!/bin/bash

# Security Audit Script for Gmail Warmup V2
# Runs automated security checks every 24 hours

PROJECT_DIR="/Users/northsea/clawd-dmitry/gmail-warmup-v2"
REPORT_DIR="$PROJECT_DIR/security-audits"
LOG_FILE="$REPORT_DIR/audit.log"

# Ensure directories exist
mkdir -p "$REPORT_DIR"

echo "🔒 Running Security Audit..." | tee -a "$LOG_FILE"
echo "Started: $(date -u +"%Y-%m-%d %H:%M:%S UTC")" | tee -a "$LOG_FILE"
echo ""

# Run the security audit
cd "$PROJECT_DIR"
node lib/security-auditor.js "$PROJECT_DIR" "$REPORT_DIR" 2>&1 | tee -a "$LOG_FILE"

EXIT_CODE=$?

echo ""
if [ $EXIT_CODE -eq 0 ]; then
    echo "✅ Security audit completed successfully" | tee -a "$LOG_FILE"
else
    echo "❌ Security audit failed with exit code $EXIT_CODE" | tee -a "$LOG_FILE"
fi

echo "Finished: $(date -u +"%Y-%m-%d %H:%M:%S UTC")" | tee -a "$LOG_FILE"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" | tee -a "$LOG_FILE"
echo ""

exit $EXIT_CODE
