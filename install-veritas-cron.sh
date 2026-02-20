#!/bin/bash
# Install Veritas Kanban cron job

# Create temp crontab file
cat > /tmp/veritas-crontab << 'EOF'
# Veritas Kanban Automated Polling
# Polls every 30 minutes for tasks assigned to agents
*/30 * * * * source /Users/northsea/clawd-dmitry/.clawdbot/veritas-config.sh && /Users/northsea/clawd-dmitry/.clawdbot/scripts/veritas-automated-poll.sh >> /Users/northsea/clawd-dmitry/logs/veritas-poll.log 2>&1
EOF

# Install crontab
crontab /tmp/veritas-crontab

# Show current crontab
echo "✅ Crontab installed:"
crontab -l
