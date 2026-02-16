#!/bin/bash
# Veritas Kanban Polling Script for Dmitry
# Polls for tasks assigned to Dmitry and provides summaries

VERITAS_API="https://veritas-kanban-production.up.railway.app/api"
AGENT_KEY="vk_agent123"

echo "🔍 Polling Veritas Kanban for Dmitry tasks..."
echo ""

# Get all tasks
TASKS=$(curl -s "$VERITAS_API/tasks" -H "X-API-Key: $AGENT_KEY")

# Count tasks by status
TODO=$(echo "$TASKS" | grep -o '"status":"todo"' | wc -l)
IN_PROGRESS=$(echo "$TASKS" | grep -o '"status":"in-progress"' | wc -l)
DONE=$(echo "$TASKS" | grep -o '"status":"done"' | wc -l)

echo "📊 Task Summary:"
echo "  Todo: $TODO"
echo "  In Progress: $IN_PROGRESS"
echo "  Done: $DONE"
echo ""

# Get Dmitry's tasks (tagged with #dmitry or #default)
echo "🎯 Dmitry's Tasks:"
echo "$TASKS" | grep -E "(#dmitry|#default)" -A 5 | head -20 || echo "  No tasks assigned to Dmitry"
echo ""

# Get recent tasks
echo "📝 Recent Todo Tasks:"
echo "$TASKS" | grep '"status":"todo"' -A 3 -B 1 | head -30 || echo "  No todo tasks"
