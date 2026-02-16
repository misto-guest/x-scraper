# Gateway Connection Setup for Veritas Kanban

## Current Status

✅ **Gateway is accessible via Tailscale**
- URL: https://bram-mac-mini.tailb57758.ts.net
- Health check: PASS (HTTP 200)
- Auth token: ce9504fbe86b3c501d8a7219d6b5daad87fadc0840ba9a7d

## Agent Configuration

To connect Dmitry agent in Veritas Kanban to your Tailscale Gateway:

### Option 1: Via Web Interface

1. **Open Veritas Kanban:** https://veritas-kanban-production.up.railway.app
2. **Go to:** Settings → Agents
3. **Find:** Dmitry agent
4. **Edit agent settings:**
   - Gateway URL: `https://bram-mac-mini.tailb57758.ts.net`
   - Gateway Token: `ce9504fbe86b3c501d8a7219d6b5daad87fadc0840ba9a7d`
5. **Save changes**

### Option 2: Via API (Requires admin key in Railway env)

```bash
curl -X PATCH "https://veritas-kanban-production.up.railway.app/api/agents/dmitry" \
  -H "Content-Type: application/json" \
  -H "X-API-Key: YOUR_ADMIN_KEY" \
  -d '{
    "gatewayUrl": "https://bram-mac-mini.tailb57758.ts.net",
    "gatewayToken": "ce9504fbe86b3c501d8a7219d6b5daad87fadc0840ba9a7d"
  }'
```

### Option 3: Update Railway Environment Variables

1. **Go to:** https://railway.app/project/4c015e0a-3156-4310-84fd-8ec794965463
2. **Select:** veritas-kanban service
3. **Variables tab**
4. **Add variable:**
   - Name: `VERITAS_ADMIN_KEY`
   - Value: `631746c81bbdf78605a040478a1926a7a7b3c70deaedab3b601c16a5d37f5458`
5. **Redeploy**

## Testing the Connection

Once configured, test the agent connection:

```bash
curl -X POST "https://veritas-kanban-production.up.railway.app/api/agents/dmitry/test" \
  -H "Content-Type: application/json" \
  -H "X-API-Key: YOUR_ADMIN_KEY" \
  -d '{"test": "ping"}'
```

Expected response:
```json
{
  "success": true,
  "message": "Agent reachable",
  "response": "pong"
}
```

## Workflow Once Connected

1. **Create task** in Veritas Kanban with tag #dmitry
2. **Dmitry polls** API for tagged tasks
3. **Self-assigns** task (moves to In Progress)
4. **Processes task** and adds progress comments
5. **Marks complete** (moves to Done)

## Troubleshooting

**Issue:** "Agent not responding"
- Verify Gateway is accessible: `curl https://bram-mac-mini.tailb57758.ts.net/health`
- Check token matches in agent config
- Ensure Tailscale is running on host machine

**Issue:** "AUTH_REQUIRED"
- Add VERITAS_ADMIN_KEY to Railway environment variables
- Redeploy service
- Use web interface instead of API

**Issue:** "CORS errors"
- Gateway URL is accessible via Tailscale
- Veritas Kanban should have no CORS issues with Railway→Tailscale connections

## Next Steps

1. Configure agent via web interface (easiest)
2. Create test task in Veritas Kanban
3. Verify Dmitry picks up and processes task
4. Full orchestration workflow active
