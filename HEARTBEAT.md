# HEARTBEAT.md

## Heartbeat Checklist

Run these checks periodically (rotate through 2-4 times per day).

### Priority 1: Veritas Kanban Polling
- **Every 30 minutes**: Run automated Veritas poll for agent tasks
- **Command**: `~/.clawdbot/scripts/veritas-automated-poll.sh`
- **What it does**: 
  - Polls Veritas Kanban API for tasks assigned to you
  - Notifies you of new todo tasks
  - Tracks notified tasks to avoid duplicates
  - Logs all activity to `logs/veritas-poll.log`
- **Action required**: If new tasks found, review and spawn sub-agents or work on them directly

### Priority 2: Daily Review (rotate 2-4x/day)
- **Email**: Any urgent unread messages?
- **Calendar**: Upcoming events in next 24-48h?
- **Mentions**: Twitter/social notifications?
- **Weather**: Relevant if you might go out?

### Priority 3: Memory Maintenance
- **Every few days**: Review `memory/YYYY-MM-DD.md` files
- Extract significant events/lessons to `MEMORY.md`
- Remove outdated info from MEMORY.md

## When to Reach Out
- **Reach out**: Important email, calendar event <2h, new Veritas tasks, interesting findings, >8h silence
- **Stay quiet (HEARTBEAT_OK)**: Late night (23:00-08:00) unless urgent, human is busy, nothing new, checked <30min ago

## State Tracking
Heartbeat state tracked in `memory/heartbeat-state.json`
