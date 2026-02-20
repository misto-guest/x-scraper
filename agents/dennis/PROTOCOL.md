# Dennis - Communication Protocol

## Task Lifecycle

### Phase 1: Task Reception
```json
{
  "phase": "reception",
  "action": "receive_task",
  "input": {
    "user": "user_id",
    "task": "task description",
    "context": {},
    "priority": "low|medium|high|urgent"
  },
  "output": {
    "task_id": "generated_id",
    "status": "received",
    "estimated_duration": "time_estimate"
  }
}
```

### Phase 2: Task Analysis
```json
{
  "phase": "analysis",
  "action": "analyze_task",
  "process": [
    "Extract task type",
    "Identify required capabilities",
    "Estimate complexity",
    "Detect dependencies",
    "Determine agent requirements"
  ],
  "output": {
    "task_type": "research|code|creative|etc",
    "complexity": "simple|medium|complex",
    "required_agents": ["agent1", "agent2"],
    "estimated_duration": "time_estimate",
    "dependencies": []
  }
}
```

### Phase 3: Agent Assignment
```json
{
  "phase": "assignment",
  "action": "assign_to_agents",
  "output": {
    "primary_agent": "agent_name",
    "secondary_agents": [],
    "assignments": [
      {
        "agent": "agent_name",
        "subtask": "specific subtask",
        "context": {},
        "deadline": "timestamp"
      }
    ]
  }
}
```

### Phase 4: Execution Monitoring
```json
{
  "phase": "monitoring",
  "action": "monitor_progress",
  "checks": [
    "Agent status",
    "Task progress",
    "Error detection",
    "Timeout checks",
    "Quality verification"
  ],
  "output": {
    "status": "in_progress|stuck|failed|complete",
    "agent_status": {
      "agent_name": "status"
    },
    "progress_percentage": 0-100
  }
}
```

### Phase 5: Result Synthesis
```json
{
  "phase": "synthesis",
  "action": "synthesize_results",
  "input": {
    "agent_results": [
      {
        "agent": "agent_name",
        "result": {},
        "quality": "score",
        "duration": "time"
      }
    ]
  },
  "output": {
    "synthesized_report": {},
    "key_findings": [],
    "recommendations": [],
    "next_steps": []
  }
}
```

### Phase 6: User Reporting
```json
{
  "phase": "reporting",
  "action": "report_to_user",
  "output": {
    "summary": "Brief overview",
    "detailed_results": {},
    "metrics": {
      "duration": "total_time",
      "agents_used": ["agent_list"],
      "tasks_completed": count
    },
    "recommendations": []
  }
}
```

## Message Format

### Dennis → Sub-Agent
```json
{
  "from": "dennis",
  "to": "sub_agent_name",
  "message_id": "unique_id",
  "task_id": "parent_task_id",
  "type": "assignment|update|query",
  "data": {
    "task": "Specific subtask description",
    "context": {
      "parent_task": "Original user task",
      "dependencies": [],
      "resources": [],
      "deadline": "timestamp"
    },
    "requirements": {
      "format": "expected_output_format",
      "quality_threshold": "score",
      "deliverables": []
    }
  },
  "priority": "low|medium|high|urgent",
  "timestamp": "ISO_8601"
}
```

### Sub-Agent → Dennis
```json
{
  "from": "sub_agent_name",
  "to": "dennis",
  "message_id": "unique_id",
  "task_id": "parent_task_id",
  "type": "update|result|error|query",
  "data": {
    "status": "in_progress|complete|failed|blocked",
    "progress": 0-100,
    "result": {},
    "error": null,
    "query": "question_for_dennis"
  },
  "timestamp": "ISO_8601"
}
```

### Dennis → User
```json
{
  "from": "dennis",
  "to": "user",
  "task_id": "unique_id",
  "type": "status|result|error|query",
  "data": {
    "summary": "Brief summary",
    "status": "received|in_progress|complete|failed",
    "progress": 0-100,
    "results": {},
    "error": null,
    "estimated_completion": "timestamp"
  },
  "timestamp": "ISO_8601"
}
```

## Error Handling

### Agent Unavailable
```json
{
  "error": "agent_unavailable",
  "agent": "agent_name",
  "action": "fallback_routing",
  "fallback_agent": "alternative_agent",
  "retry": true,
  "notify_user": true
}
```

### Task Timeout
```json
{
  "error": "task_timeout",
  "agent": "agent_name",
  "task_id": "task_id",
  "timeout_duration": "time",
  "action": "escalate|retry|abort",
  "notify_user": true
}
```

### Agent Failure
```json
{
  "error": "agent_failure",
  "agent": "agent_name",
  "task_id": "task_id",
  "failure_reason": "reason",
  "action": "re_route|abort|partial_complete",
  "notify_user": true
}
```

## Status Codes

| Code | Meaning | Action |
|------|---------|--------|
| 001 | Task received | Acknowledge to user |
| 002 | Task analyzing | Routing to agents |
| 003 | Agent assigned | Task with agent |
| 004 | In progress | Monitoring |
| 005 | Partial result | Synthesizing |
| 006 | Complete | Return to user |
| 007 | Agent failed | Re-routing |
| 008 | Task failed | Notify user |
| 009 | Query user | Waiting for input |
| 010 | Escalated | User action needed |

## Timeout Configuration

```json
{
  "timeouts": {
    "quick_task": 60,
    "medium_task": 300,
    "complex_task": 900,
    "extended_task": 3600,
    "agent_response": 30,
    "result_wait": 120
  }
}
```

## Priority Levels

1. **Urgent** - Immediate attention, interrupt current tasks
2. **High** - Process before medium/low, notify user immediately
3. **Medium** - Normal processing queue
4. **Low** - Background processing, batch when possible

## Progress Updates

### For Quick Tasks (< 1 min)
- No intermediate updates
- Final result only

### For Medium Tasks (1-5 min)
- One status update at 50%
- Final result

### For Complex Tasks (5-15 min)
- Status update at 25%, 50%, 75%
- Final result

### For Extended Tasks (15+ min)
- Status update every 5 minutes
- Final result

## Quality Thresholds

```json
{
  "quality": {
    "min_acceptable": 0.6,
    "good": 0.8,
    "excellent": 0.95,
    "actions": {
      "below_0.6": "reject_and_retry",
      "0.6_to_0.8": "accept_with_notes",
      "0.8_to_0.95": "accept",
      "above_0.95": "accept_and_commend"
    }
  }
}
```

## Coordination Patterns

### Sequential Pattern
```
Task → Agent 1 → Result 1 → Agent 2 → Result 2 → Dennis → User
```

### Parallel Pattern
```
Task → Dennis splits
       ├── Agent 1 → Result 1 ──┐
       ├── Agent 2 → Result 2 ──┤
       └── Agent 3 → Result 3 ──┘
                              ↓
                           Dennis synthesizes
                              ↓
                             User
```

### Hierarchical Pattern
```
Task → Agent 1 (Primary)
           ├── Subtask → Agent 2
           ├── Subtask → Agent 3
           └── Subtask → Agent 4
                    ↓
              Agent 1 synthesizes
                    ↓
                 Dennis
                    ↓
                  User
```

## Best Practices

1. **Always acknowledge task receipt** within 5 seconds
2. **Provide estimated completion time** for tasks > 1 min
3. **Update status** at defined intervals for long tasks
4. **Handle errors gracefully** with clear explanation
5. **Synthesize results** into actionable insights
6. **Be transparent** about agent performance
7. **Learn and adapt** routing based on outcomes
8. **Keep communication clear** and concise
