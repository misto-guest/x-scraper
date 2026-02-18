# Veritas Kanban Automation Guide

## Overview

This automation integrates Veritas Kanban with OpenClaw agents, enabling automatic task polling and assignment handling.

**Components:**
- **Polling Script**: `.clawdbot/scripts/veritas-automated-poll.sh`
- **Heartbeat Integration**: Checks for new tasks every 30 minutes
- **State Tracking**: Remembers notified tasks to avoid duplicates
- **Comprehensive Logging**: All activity logged to `logs/veritas-poll.log`

## How It Works

### 1. Polling Process

**Every heartbeat (configurable, default 30min):**
1. Script queries Veritas Kanban API for all tasks
2. Filters tasks assigned to the agent (by tag #dmitry, assignee field, or title match)
3. Checks if task has already been notified (via state file)
4. For new todo tasks:
   - Logs task details
   - Outputs notification to heartbeat
   - Marks task as notified in state file

### 2. Task Assignment Logic

Tasks are considered "assigned to agent" if:
- Task's `assignee` field equals agent name (e.g., "dmitry")
- Task has tag matching agent name (e.g., #dmitry)
- Task title contains agent name

**Supported statuses:**
- `todo` → Triggers notification
- `in-progress` → Already working on it
- `done` → Completed

### 3. Agent Workflow

**When a new task is detected:**
1. Heartbeat receives notification with task details
2. Dmitry (main session) sees the task in heartbeat output
3. Dmitry can:
   - Work on the task directly
   - Spawn a sub-agent specialized for the task
   - Manually update task status in Veritas

### 4. State Management

**State file**: `logs/veritas-poll-state.json`

```json
{
  "lastPoll": "2026-02-17T12:00:00+01:00",
  "lastPollTimestamp": 1708165200,
  "notifiedTasks": ["task-id-1", "task-id-2"],
  "lastError": null,
  "pollCount": 42
}
```

**Purpose:**
- Prevent duplicate notifications for same task
- Rate limiting (respect poll interval)
- Track errors and success rate
- Maintain polling history

## File Structure

```
clawd-dmitry/
├── .clawdbot/
│   └── scripts/
│       └── veritas-automated-poll.sh  # Main polling script
├── logs/
│   ├── veritas-poll.log               # Activity log
│   └── veritas-poll-state.json        # State tracking
├── HEARTBEAT.md                        # Heartbeat integration
└── VERITAS-AUTOMATION.md              # This file
```

## Configuration

### Environment Variables

**Optional**: Override defaults by setting environment variables

```bash
# Agent name (default: dmitry)
export AGENT_NAME="dmitry"

# Enable debug logging
export DEBUG=1
```

### Script Configuration

Edit `.clawdbot/scripts/veritas-automated-poll.sh` to customize:

```bash
VERITAS_API="https://veritas-kanban-production.up.railway.app/api"
AGENT_KEY="vk_agent123"
POLL_INTERVAL_MINUTES=30
```

## Usage

### Manual Testing

**Normal mode (requires API access):**
```bash
~/.clawdbot/scripts/veritas-automated-poll.sh
```

**Test mode (uses mock data, no API required):**
```bash
TEST_MODE=1 ~/.clawdbot/scripts/veritas-automated-poll.sh
```

**With debug output:**
```bash
DEBUG=1 ~/.clawdbot/scripts/veritas-automated-poll.sh
TEST_MODE=1 DEBUG=1 ~/.clawdbot/scripts/veritas-automated-poll.sh
```

### Heartbeat Integration

The polling is automatically integrated into heartbeat checks via `HEARTBEAT.md`. Each heartbeat will:

1. Run the polling script
2. Display new task notifications
3. Log results to `logs/veritas-poll.log`

### Viewing Logs

**Recent activity:**
```bash
tail -50 logs/veritas-poll.log
```

**Follow logs in real-time:**
```bash
tail -f logs/veritas-poll.log
```

**Check state:**
```bash
cat logs/veritas-poll-state.json | jq .
```

## Testing

### 1. Create Test Task

Use the Veritas Kanban API to create a test task:

```bash
curl -X POST https://veritas-kanban-production.up.railway.app/api/tasks \
  -H "X-API-Key: vk_agent123" \
  -H "Content-Type: application/json" \
  -d '{
    "title": "Test task for Dmitry",
    "description": "This is a test task to verify automation",
    "status": "todo",
    "tags": ["#dmitry", "#test"]
  }'
```

### 2. Run Polling Script

```bash
~/.clawdbot/scripts/veritas-automated-poll.sh
```

### 3. Verify Notification

You should see output like:
```
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
🎯 NEW VERITAS TASK ASSIGNED TO YOU
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Title: Test task for Dmitry
ID: task-id-123
Status: todo
Description: This is a test task to verify automation
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
```

### 4. Check State

```bash
cat logs/veritas-poll-state.json | jq .
```

The task ID should be in `notifiedTasks` array.

### 5. Run Again (Should Skip Task)

Running the script again should NOT notify about the same task (it's already in the notified list).

## Manual Task Status Updates

To update task status manually (e.g., when starting work):

```bash
# Mark task as in-progress
TASK_ID="task-id-123"
curl -X PUT "https://veritas-kanban-production.up.railway.app/api/tasks/${TASK_ID}" \
  -H "X-API-Key: vk_agent123" \
  -H "Content-Type: application/json" \
  -d '{"status": "in-progress"}'

# Mark task as done
curl -X PUT "https://veritas-kanban-production.up.railway.app/api/tasks/${TASK_ID}" \
  -H "X-API-Key: vk_agent123" \
  -H "Content-Type: application/json" \
  -d '{"status": "done"}'
```

## Troubleshooting

### API Authentication Issues

**Problem**: Script returns "AUTH_REQUIRED" errors

**Current Status**: The Veritas Kanban API at `https://veritas-kanban-production.up.railway.app/api` requires valid authentication. The default API key `vk_agent123` may not be active or the API may require a different authentication method.

**Solutions**:
1. **Use Test Mode**: Test the automation without API access:
   ```bash
   TEST_MODE=1 ~/.clawdbot/scripts/veritas-automated-poll.sh
   ```
   This uses mock data to verify the polling logic works correctly.

2. **Update API Key**: If you have a valid API key, update the script:
   ```bash
   export AGENT_KEY="your-actual-api-key"
   ~/.clawdbot/scripts/veritas-automated-poll.sh
   ```

3. **Check API Documentation**: Verify the correct authentication method with the Veritas Kanban API documentation.

### No Tasks Found

**Problem**: Polling runs but finds no tasks

**Solutions:**
1. Verify API is accessible:
   ```bash
   curl https://veritas-kanban-production.up.railway.app/api/tasks \
     -H "X-API-Key: vk_agent123"
   ```

2. Check tasks have proper assignment:
   - Assignee field matches agent name
   - Or tag includes #dmitry
   - Or title contains agent name

3. Check logs for errors:
   ```bash
   tail -100 logs/veritas-poll.log
   ```

### API Errors

**Problem**: Script fails with API errors

**Solutions:**
1. Verify API key is correct: `vk_agent123`
2. Check API status: Try accessing API URL in browser
3. Check state file for last error:
   ```bash
   cat logs/veritas-poll-state.json | jq .lastError
   ```

### Duplicate Notifications

**Problem**: Same task notified multiple times

**Solutions:**
1. Check state file exists and is writable:
   ```bash
   ls -l logs/veritas-poll-state.json
   ```

2. Verify task ID in `notifiedTasks` array:
   ```bash
   cat logs/veritas-poll-state.json | jq .notifiedTasks
   ```

3. Reset state if needed (backup first!):
   ```bash
   cp logs/veritas-poll-state.json logs/veritas-poll-state.json.bak
   rm logs/veritas-poll-state.json
   # Will be recreated on next run
   ```

### Polling Not Running

**Problem**: Heartbeat doesn't trigger polling

**Solutions:**
1. Verify HEARTBEAT.md includes Veritas task
2. Check script is executable:
   ```bash
   ls -l ~/.clawdbot/scripts/veritas-automated-poll.sh
   ```
3. Test manual run to verify script works

## Disabling Automation

To temporarily disable Veritas polling:

### Option 1: Remove from Heartbeat

Edit `HEARTBEAT.md` and remove the Veritas section.

### Option 2: Make Script Non-Executable

```bash
chmod -x ~/.clawdbot/scripts/veritas-automated-poll.sh
```

### Option 3: Set Very Long Poll Interval

Edit the script and set:
```bash
POLL_INTERVAL_MINUTES=99999
```

## Advanced Features

### Custom Agent Names

For multi-agent setups, override agent name:

```bash
AGENT_NAME="alfred" ~/.clawdbot/scripts/veritas-automated-poll.sh
```

### Auto-Update Task Status

To automatically mark tasks as "in-progress" when notified, uncomment in script:

```bash
# In process_tasks() function
update_task_status "${task_id}" "in-progress"
```

### Custom Poll Interval

Edit the script to change default poll interval:

```bash
POLL_INTERVAL_MINUTES=15  # Poll every 15 minutes
```

Or override via heartbeat command.

## API Reference

### Veritas Kanban API

**Base URL**: `https://veritas-kanban-production.up.railway.app/api`

**Authentication**: Header `X-API-Key: vk_agent123`

**Endpoints**:
- `GET /tasks` - List all tasks
- `GET /tasks/{id}` - Get specific task
- `POST /tasks` - Create new task
- `PUT /tasks/{id}` - Update task
- `DELETE /tasks/{id}` - Delete task

**Task Object**:
```json
{
  "id": "unique-id",
  "title": "Task title",
  "description": "Task description",
  "status": "todo|in-progress|done",
  "assignee": "agent-name",
  "tags": ["#dmitry", "#urgent"],
  "createdAt": "2026-02-17T12:00:00Z",
  "updatedAt": "2026-02-17T12:00:00Z"
}
```

## Maintenance

### Regular Checks

**Weekly:**
- Review `logs/veritas-poll.log` for errors
- Check state file size (should stay small)
- Verify API key hasn't expired

**Monthly:**
- Clean old logs (rotate if needed):
  ```bash
  mv logs/veritas-poll.log logs/veritas-poll.log.old
  ```

- Reset notified tasks if needed (clears notification memory):
  ```bash
  # Backup first!
  cp logs/veritas-poll-state.json logs/veritas-poll-state.json.bak
  # Reset notified array
  jq '.notifiedTasks = []' logs/veritas-poll-state.json > tmp.json && mv tmp.json logs/veritas-poll-state.json
  ```

## Support

For issues or questions:
1. Check logs: `logs/veritas-poll.log`
2. Review this documentation
3. Test API manually with curl
4. Check state file: `logs/veritas-poll-state.json`

## Changelog

### 2026-02-17
- Initial production-ready implementation
- State tracking for duplicate prevention
- Rate limiting with configurable interval
- Comprehensive error handling and logging
- Heartbeat integration
- Full documentation
