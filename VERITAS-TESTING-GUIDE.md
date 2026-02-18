# Veritas Automation - Quick Testing Guide

## Quick Verification

### 1. Test the Polling Script (Mock Mode)

This uses mock data - no API access required:

```bash
# Clean state and test
rm -f logs/veritas-poll-state.json
TEST_MODE=1 ~/.clawdbot/scripts/veritas-automated-poll.sh
```

**Expected output:**
- Should detect 2 new tasks assigned to Dmitry
- Should display task notifications with task details
- Should update state file

### 2. Verify State Tracking

Run the script again - it should NOT notify about the same tasks:

```bash
TEST_MODE=1 ~/.clawdbot/scripts/veritas-automated-poll.sh
```

**Expected output:**
- "✅ Poll completed successfully"
- NO new task notifications (tasks already notified)

### 3. Check State File

```bash
cat logs/veritas-poll-state.json | jq .
```

**Expected output:**
```json
{
  "lastPoll": "2026-02-17T...",
  "lastPollTimestamp": 1234567890,
  "notifiedTasks": ["test-task-1", "test-task-2"],
  "lastError": null,
  "pollCount": 1
}
```

### 4. Review Logs

```bash
tail -50 logs/veritas-poll.log
```

**Expected:**
- Detailed log of all polling activity
- Task detection notifications
- State updates

### 5. Test with Real API (when available)

When you have valid API credentials:

```bash
# Update the API key if needed
export AGENT_KEY="your-actual-api-key"

# Run in normal mode
~/.clawdbot/scripts/veritas-automated-poll.sh
```

## Integration Testing

### Heartbeat Integration

The polling is now integrated into `HEARTBEAT.md`. During each heartbeat:
1. Script runs automatically
2. New tasks trigger notifications
3. Dmitry can then spawn sub-agents to handle tasks

### Test Heartbeat Flow

1. Create a test task in Veritas Kanban (when API is accessible)
2. Wait for next heartbeat (or trigger manually)
3. Verify task notification appears
4. Dmitry receives notification and can:
   - Work on task directly
   - Spawn sub-agent: `spawn_subagent(task_id)`
   - Update task status in Veritas

## Status Check

### Files Created
✅ `.clawdbot/scripts/veritas-automated-poll.sh` - Main polling script
✅ `HEARTBEAT.md` - Updated with polling task
✅ `VERITAS-AUTOMATION.md` - Complete documentation
✅ `logs/veritas-poll.log` - Activity log (created on first run)
✅ `logs/veritas-poll-state.json` - State tracking (created on first run)

### Features Implemented
✅ Automatic polling every 30 minutes
✅ Task filtering by agent (assignee, tags, title)
✅ Duplicate prevention (state tracking)
✅ Comprehensive error handling
✅ Test mode for development
✅ Detailed logging
✅ Rate limiting
✅ Heartbeat integration

### Current Limitations
⚠️ API authentication requires valid credentials (current key may not be active)
⚠️ Real API testing pending credential verification

## Next Steps

1. **Get Valid API Credentials**: Contact Veritas Kanban admin for working API key
2. **Create Real Test Task**: Use the API to create a real test task
3. **Verify End-to-End**: Confirm polling picks up real tasks
4. **Monitor**: Check logs regularly for any issues
5. **Iterate**: Adjust polling interval, filters, etc. as needed

## Troubleshooting Quick Reference

| Issue | Solution |
|-------|----------|
| No tasks found | Use `TEST_MODE=1` to test logic, verify API access |
| Duplicate notifications | Check state file permissions |
| Script fails | Check logs: `tail -100 logs/veritas-poll.log` |
| API errors | Verify `AGENT_KEY` is correct |
| State file issues | Delete and let script recreate it |

## Success Criteria

- ✅ Script runs without errors in test mode
- ✅ Detects and notifies about new tasks
- ✅ Prevents duplicate notifications
- ✅ Logs all activity
- ⏳ Real API access (pending credentials)
- ⏳ End-to-end test with real tasks (pending API access)
