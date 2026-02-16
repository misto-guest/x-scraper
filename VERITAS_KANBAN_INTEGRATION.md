# Veritas Kanban Integration Guide

## Overview
This document describes how sub-agents integrate with Veritas Kanban for task management and coordination.

## API Configuration

### Base Endpoint
```
http://localhost:3002/api/tasks
```

### Authentication
All agents use the same API key for authentication:
```
API Key: vk_agent123
```

Include this key in the request headers:
```
X-API-Key: vk_agent123
```

## Agent Tags

Each agent type has specific tags for task assignment:
- **Coder:** `#coder`, `#development`, `#bugfix`, `#refactor`
- **Writer:** `#writer`, `#content`, `#copywriting`, `#documentation`
- **QA:** `#qa`, `#testing`, `#review`, `#validation`
- **Architect:** `#architect`, `#design`, `#architecture`, `#strategy`
- **Researcher:** `#researcher`, `#research`, `#analysis`, `#investigation`
- **Orchestrator:** `#orchestrator`, `#coordination`, `#management`, `#planning`

## API Endpoints & Usage

### 1. Poll for Tasks
Retrieve pending tasks tagged for the agent:

```bash
# Example: Coder polls for pending tasks
curl -X GET "http://localhost:3002/api/tasks?tag=coder&status=pending" \
  -H "X-API-Key: vk_agent123"
```

**Response:**
```json
{
  "tasks": [
    {
      "id": "task_123",
      "title": "Implement user authentication",
      "description": "Add OAuth2 login with Google and GitHub",
      "tag": "coder",
      "status": "pending",
      "priority": "high",
      "created_at": "2024-01-15T10:00:00Z"
    }
  ]
}
```

### 2. Self-Assign a Task
Claim a task and set to in-progress:

```bash
curl -X PATCH "http://localhost:3002/api/tasks/task_123" \
  -H "X-API-Key: vk_agent123" \
  -H "Content-Type: application/json" \
  -d '{
    "agent": "coder",
    "status": "in-progress",
    "assigned_at": "2024-01-15T10:05:00Z"
  }'
```

### 3. Update Task Status
Add progress updates:

```bash
curl -X PATCH "http://localhost:3002/api/tasks/task_123" \
  -H "X-API-Key: vk_agent123" \
  -H "Content-Type: application/json" \
  -d '{
    "status": "in-progress",
    "progress": 50,
    "notes": "OAuth flow implemented, testing integration"
  }'
```

### 4. Add Comments
Add updates or questions:

```bash
curl -X POST "http://localhost:3002/api/tasks/task_123/comments" \
  -H "X-API-Key: vk_agent123" \
  -H "Content-Type: application/json" \
  -d '{
    "agent": "coder",
    "comment": "Need clarification on redirect URL requirements",
    "timestamp": "2024-01-15T11:00:00Z"
  }'
```

### 5. Mark Complete
Finalize a task:

```bash
curl -X PATCH "http://localhost:3002/api/tasks/task_123" \
  -H "X-API-Key: vk_agent123" \
  -H "Content-Type: application/json" \
  -d '{
    "status": "complete",
    "completed_at": "2024-01-15T14:00:00Z",
    "notes": "OAuth2 authentication fully implemented and tested"
  }'
```

### 6. Create Subtasks (Orchestrator only)
Break down tasks for other agents:

```bash
curl -X POST "http://localhost:3002/api/tasks" \
  -H "X-API-Key: vk_agent123" \
  -H "Content-Type: application/json" \
  -d '{
    "title": "Write user guide for OAuth login",
    "description": "Create documentation for new authentication feature",
    "tag": "writer",
    "priority": "medium",
    "parent_task": "task_123",
    "assigned_by": "orchestrator"
  }'
```

## Agent Workflow

### Standard Task Lifecycle
1. **Poll:** Agent checks for pending tasks with their tag
2. **Assign:** Agent claims task and sets status to "in-progress"
3. **Work:** Agent performs the work
4. **Update:** Agent periodically updates progress and notes
5. **Complete:** Agent marks task as complete with final notes

### Error Handling
If a task cannot be completed:
```bash
curl -X PATCH "http://localhost:3002/api/tasks/task_123" \
  -H "X-API-Key: vk_agent123" \
  -H "Content-Type: application/json" \
  -d '{
    "status": "blocked",
    "error": "Missing API credentials from provider",
    "blocked_at": "2024-01-15T12:00:00Z"
  }'
```

## Status Values
- `pending` - Task is ready to be picked up
- `in-progress` - Agent is actively working on it
- `complete` - Task is finished
- `blocked` - Task has a blocker preventing completion
- `cancelled` - Task was cancelled

## Priority Levels
- `critical` - Urgent, drop everything
- `high` - Important, do soon
- `medium` - Normal priority
- `low` - Backlog, do when time permits

## Polling Intervals
Recommended polling frequency:
- **High-frequency agents (Coder, QA):** Every 2-5 minutes
- **Medium-frequency agents (Writer, Orchestrator):** Every 5-10 minutes
- **Low-frequency agents (Architect, Researcher):** Every 10-15 minutes

## Example Full Workflow

### Coder Agent Example
```bash
# 1. Poll for tasks
curl -X GET "http://localhost:3002/api/tasks?tag=coder&status=pending" \
  -H "X-API-Key: vk_agent123"

# 2. Assign task
curl -X PATCH "http://localhost:3002/api/tasks/task_456" \
  -H "X-API-Key: vk_agent123" \
  -H "Content-Type: application/json" \
  -d '{"agent": "coder", "status": "in-progress"}'

# 3. Update progress
curl -X PATCH "http://localhost:3002/api/tasks/task_456" \
  -H "X-API-Key: vk_agent123" \
  -H "Content-Type: application/json" \
  -d '{"progress": 25, "notes": "Database schema updated"}'

# 4. Add comment
curl -X POST "http://localhost:3002/api/tasks/task_456/comments" \
  -H "X-API-Key: vk_agent123" \
  -H "Content-Type: application/json" \
  -d '{"comment": "Ready for QA review", "agent": "coder"}'

# 5. Complete
curl -X PATCH "http://localhost:3002/api/tasks/task_456" \
  -H "X-API-Key: vk_agent123" \
  -H "Content-Type: application/json" \
  -d '{"status": "complete", "notes": "Feature implemented, tested, and documented"}'
```

## Testing the Integration

Use this test script to verify connectivity:

```bash
#!/bin/bash
# test-veritas-connection.sh

echo "Testing Veritas Kanban connection..."

# Test 1: Poll for tasks
echo "1. Polling for tasks..."
curl -X GET "http://localhost:3002/api/tasks?limit=1" \
  -H "X-API-Key: vk_agent123" \
  -s | jq '.'

echo "Connection test complete!"
```
