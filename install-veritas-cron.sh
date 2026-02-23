#!/bin/bash

# Install Veritas Kanban Cron Job
# Run this script to set up automated polling every 30 minutes

echo "🔧 Installing Veritas Kanban Automated Polling Cron Job..."
echo ""

# Kill any existing crontab processes
pkill -9 -f "crontab" 2>/dev/null
sleep 1

# Create temporary cron file
cat > /tmp/veritas-install-cron.txt << 'EOF'
# Veritas Kanban Automated Polling
# Polls every 30 minutes for new tasks assigned to Dmitry
# Installed: $(date)
*/30 * * * * $HOME/.clawdbot/scripts/veritas-automated-poll.sh >> $HOME/clawd-dmitry/logs/veritas-poll-cron.log 2>&1
EOF

# Install crontab
crontab /tmp/veritas-install-cron.txt 2>/dev/null

if [ $? -eq 0 ]; then
    echo "✅ Cron job installed successfully!"
    echo ""
    echo "📋 Current crontab:"
    crontab -l
    echo ""
    echo "📊 Polling will run every 30 minutes"
    echo "📝 Logs: $HOME/clawd-dmitry/logs/veritas-poll-cron.log"
    echo ""
    echo "✨ You can also run manual polls:"
    echo "   ~/.clawdbot/scripts/veritas-automated-poll.sh"
else
    echo "❌ Failed to install cron job"
    echo "Please run: crontab -e"
    echo "And add this line:"
    echo "*/30 * * * * $HOME/.clawdbot/scripts/veritas-automated-poll.sh >> $HOME/clawd-dmitry/logs/veritas-poll-cron.log 2>&1"
fi
