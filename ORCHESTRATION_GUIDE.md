# Orchestration Guide - Option 1 System

## Overview
This guide explains how to use the Veritas Kanban system to coordinate multiple specialized sub-agents for efficient task completion.

## System Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                    Veritas Kanban                           │
│                   (Task Management Hub)                      │
└─────────────────────────────────────────────────────────────┘
                             │
                             ▼
        ┌──────────────────────────────────────┐
        │         Orchestrator Agent            │
        │         (Coordination Layer)          │
        └──────────────────────────────────────┘
                             │
            ┌────────────────┼────────────────┐
            ▼                ▼                ▼
    ┌──────────┐      ┌──────────┐      ┌──────────┐
    │  Coder   │      │  Writer  │      │    QA    │
    │          │      │          │      │          │
    └──────────┘      └──────────┘      └──────────┘
            │                │                │
    ┌──────────┐      ┌──────────┐
    │Architect │      │Researcher│
    │          │      │          │
    └──────────┘      └──────────┘
```

## Creating Tasks

### Method 1: Via API
```bash
curl -X POST "http://localhost:3002/api/tasks" \
  -H "X-API-Key: vk_agent123" \
  -H "Content-Type: application/json" \
  -d '{
    "title": "Build user dashboard",
    "description": "Create responsive dashboard with charts and tables",
    "tag": "coder",
    "priority": "high",
    "deadline": "2024-01-20T18:00:00Z"
  }'
```

### Method 2: Via Web UI
1. Navigate to `http://localhost:3002`
2. Click "New Task"
3. Fill in task details
4. Add appropriate tag (e.g., `#coder`, `#writer`)
5. Set priority and deadline
6. Click "Create"

## Tagging Tasks for Specific Agents

### Tag Reference
| Agent | Primary Tag | When to Use |
|-------|-------------|-------------|
| Coder | `#coder` | Development tasks, coding, bug fixes |
| Writer | `#writer` | Content creation, copywriting, documentation |
| QA | `#qa` | Testing, review, validation |
| Architect | `#architect` | Design, architecture, planning |
| Researcher | `#researcher` | Investigation, analysis, research |
| Orchestrator | `#orchestrator` | Coordination, project management |

### Multi-Agent Workflows
For complex tasks requiring multiple agents:

```bash
# Create parent task for Orchestrator
curl -X POST "http://localhost:3002/api/tasks" \
  -H "X-API-Key: vk_agent123" \
  -d '{
    "title": "Launch new marketing website",
    "tag": "orchestrator",
    "description": "Coordinate full website launch"
  }'

# Orchestrator creates subtasks:
# 1. Architect: Design site structure (#architect)
# 2. Coder: Build frontend (#coder)
# 3. Writer: Create content (#writer)
# 4. QA: Test all features (#qa)
```

## Agent Self-Assignment Process

### How Agents Work
1. **Poll:** Each agent polls Veritas Kanban periodically for tasks with their tag
2. **Filter:** Agents look for `status: pending` tasks
3. **Assign:** Agent claims task by updating `agent` field and `status: in-progress`
4. **Work:** Agent performs the work according to their SOUL.md guidelines
5. **Complete:** Agent marks task as `status: complete`

### Priority Handling
Agents will prioritize tasks in this order:
1. **Critical** - Immediate attention required
2. **High** - Priority over normal tasks
3. **Medium** - Standard queue order
4. **Low** - Backlog, work when nothing else pending

## Monitoring Progress

### Check Overall Status
```bash
# Get all active tasks
curl -X GET "http://localhost:3002/api/tasks?status=in-progress" \
  -H "X-API-Key: vk_agent123"
```

### Check by Agent
```bash
# Get Coder's tasks
curl -X GET "http://localhost:3002/api/tasks?agent=coder" \
  -H "X-API-Key: vk_agent123"

# Get Writer's completed tasks today
curl -X GET "http://localhost:3002/api/tasks?agent=writer&status=complete&today=true" \
  -H "X-API-Key: vk_agent123"
```

### Web Dashboard
Visit `http://localhost:3002/dashboard` to see:
- Kanban board (columns: Pending, In Progress, Complete)
- Agent workload
- Upcoming deadlines
- Task burndown

## Example Workflows

### Workflow 1: Feature Development
**Goal:** Add user notifications feature

```
1. Architect (#architect)
   Task: "Design notification system architecture"
   → Creates technical spec

2. Coder (#coder)
   Task: "Implement notification API endpoints"
   → Builds backend

3. Coder (#coder)
   Task: "Build notification UI components"
   → Builds frontend

4. Writer (#writer)
   Task: "Write notification settings documentation"
   → Creates user docs

5. QA (#qa)
   Task: "Test notification delivery across platforms"
   → Validates functionality
```

### Workflow 2: Content Campaign
**Goal:** Launch blog series

```
1. Researcher (#researcher)
   Task: "Research trending topics in industry"
   → Provides topic list with sources

2. Writer (#writer)
   Task: "Write blog post on [topic]"
   → Creates article draft

3. QA (#qa)
   Task: "Review article for accuracy and SEO"
   → Proofreads and validates

4. Orchestrator (#orchestrator)
   Task: "Schedule publication and social media"
   → Coordinates launch
```

### Workflow 3: Bug Fix
**Goal:** Fix critical bug

```
1. QA (#qa)
   Task: "Reproduce and document bug"
   → Creates reproduction steps

2. Coder (#coder)
   Task: "Fix bug in authentication flow"
   → Implements fix

3. QA (#qa)
   Task: "Verify bug fix and regression test"
   → Confirms resolution

4. Orchestrator (#orchestrator)
   Task: "Deploy hotfix to production"
   → Coordinates release
```

## Agent Handoffs

### Formal Handoff Process
When an agent completes work that needs review or handoff:

1. **Agent A** marks task complete with notes:
   ```json
   {
     "status": "complete",
     "notes": "Ready for QA review. Build artifacts: /builds/v1.2.3/"
   }
   ```

2. **Orchestrator** creates follow-up task for Agent B:
   ```json
   {
     "title": "Review and test v1.2.3 build",
     "tag": "qa",
     "related_task": "task_123"
   }
   ```

3. **Agent B** sees task in their queue and picks it up

### Comments for Coordination
Agents can add comments for other agents:
```bash
curl -X POST "http://localhost:3002/api/tasks/task_123/comments" \
  -H "X-API-Key: vk_agent123" \
  -d '{
    "agent": "coder",
    "comment": "@qa -特别注意 edge case where user has no email address"
  }'
```

## Deadlines & SLAs

### Standard Response Times
| Priority | Target Response | Max Duration |
|----------|----------------|--------------|
| Critical | 5 minutes | 1 hour |
| High | 15 minutes | 4 hours |
| Medium | 1 hour | 1 day |
| Low | 4 hours | 3 days |

### Deadline Handling
- Agents check deadlines before accepting tasks
- If deadline is unrealistic, agent adds comment explaining
- Orchestrator monitors deadlines and escalates if needed

## Best Practices

### Task Creation
✅ **DO:**
- Be specific in descriptions
- Set appropriate priorities
- Include acceptance criteria
- Add relevant context/links

❌ **DON'T:**
- Create vague tasks ("fix stuff")
- Over-prioritize (not everything is critical)
- Skip deadlines for time-sensitive work
- Forget to tag for the right agent

### Agent Coordination
✅ **DO:**
- Let each agent specialize in their domain
- Use Orchestrator for multi-agent workflows
- Document handoffs clearly
- Trust agents' expertise

❌ **DON'T:**
- Micromanage individual agents
- Skip QA in the name of speed
- Ignore agent comments/blockers
- Create tasks faster than agents can complete

## Troubleshooting

### Task Stuck in "In Progress"
1. Check task comments for blockers
2. Contact agent's session to check status
3. If no response, Orchestrator can reassign

### Agent Not Picking Up Tasks
1. Verify agent is running (check sessions)
2. Check API connectivity
3. Verify tags match agent's assigned tags

### Need to Reassign Task
```bash
curl -X PATCH "http://localhost:3002/api/tasks/task_123" \
  -H "X-API-Key: vk_agent123" \
  -d '{
    "agent": "qa",
    "status": "pending",
    "notes": "Reassigned from coder for further testing"
  }'
```

## Getting Started

1. **Start Veritas Kanban server:**
   ```bash
   cd /path/to/veritas-kanban
   npm start
   ```

2. **Verify agents are configured:**
   Check that all 6 SOUL.md files exist in `/subagents/`

3. **Create a test task:**
   ```bash
   curl -X POST "http://localhost:3002/api/tasks" \
     -H "X-API-Key: vk_agent123" \
     -d '{"title": "Test task", "tag": "coder", "priority": "low"}'
   ```

4. **Monitor dashboard:**
   Open `http://localhost:3002` to see the Kanban board

## Next Steps
- See `VERITAS_KANBAN_INTEGRATION.md` for API details
- Review individual agent SOUL.md files for capabilities
- Create example workflows for your use cases
