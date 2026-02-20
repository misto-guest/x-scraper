#!/bin/bash
# Install Veritas Kanban cron job (10-minute interval)

# Create temp crontab file
cat > /tmp/veritas-crontab.txt << 'EOF'
# Veritas Kanban Automated Polling
# Polls every 10 minutes for tasks assigned to agents and sends heartbeat

*/10 * * * * source /Users/northsea/clawd-dmitry/.clawdbot/veritas-config.sh && /Users/northsea/clawd-dmitry/.clawdbot/scripts/veritas-automated-poll.sh >> /Users/northsea/clawd-dmitry/logs/veritas-poll.log 2>&1
EOF

# Install crontab
crontab /tmp/veritas-crontab.txt 2>&1
echo "Crontab installed:"
crontab -l 2>&1
