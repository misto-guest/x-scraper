#!/bin/bash
# Check Veritas Kanban Agent Registry Status

source ~/.clawdbot/veritas-config.sh

echo "🔍 Checking Veritas Agent Registry..."
echo ""

# List all agents
echo "📋 Registered Agents:"
curl -s "${VERITAS_API}/agents/register" -H "X-API-Key: ${AGENT_KEY}" | jq -r '.data[] | "  • \(.name) (\(.id)) - \(.status)"'

echo ""
echo "🤖 Dmitry Status:"
curl -s "${VERITAS_API}/agents/register/remote-openclaw" -H "X-API-Key: ${AGENT_KEY}" | jq '.data | {
  id,
  name,
  model,
  status,
  capabilities: [.capabilities[] | .name],
  registeredAt,
  lastHeartbeat
}'

echo ""
echo "✅ Agent registry check complete"
