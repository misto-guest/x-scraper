# Memory Structure Migration Notes

**Date:** 2026-02-20
**Migrated From:** Single MEMORY.md file
**Migrated To:** 5-file memory structure

---

## Overview

The memory system has been restructured from a single `MEMORY.md` file into five focused files for better organization, faster crash recovery, and improved maintainability.

---

## New File Structure

### 1. **active-tasks.md** — Crash Recovery & Current Work
**Purpose:** What the agent is working on RIGHT NOW. Tasks that should resume on restart.

**Contents:**
- Active crash recovery tasks
- Current work in progress
- Critical context for crash recovery

**When to update:**
- When starting new multi-step work
- When tasks complete
- During crash recovery to understand state

**Template:**
```markdown
### [Task Name]
- **Started:** YYYY-MM-DD
- **Status:** In Progress | Blocked | Pending
- **Context:** [Brief description]
- **Next Steps:**
  - [ ] Step 1
  - [ ] Step 2
- **Dependencies:** [What's blocking this]
```

---

### 2. **lessons.md** — Mistakes & Learnings
**Purpose:** Every mistake documented once, never repeated. Best practices discovered.

**Contents:**
- Errors encountered and fixes applied
- "Never do X again" type items
- Best practices discovered
- Sub-agent protocol rules
- Communication guidelines

**When to update:**
- After making mistakes (document the fix)
- When discovering new best practices
- After learning new patterns

**Key sections:**
- Sub-Agent Protocol (always use for tasks > 3s)
- Web Development Stack decisions
- Tool integration patterns
- Security practices

---

### 3. **self-review.md** — Agent Self-Critiques
**Purpose:** Periodic self-reflection (every 4 hours recommended).

**Contents:**
- Date-stamped review sections
- What went well / what didn't
- Self-improvement notes
- Action items for next review

**When to update:**
- Every 4 hours (recommended)
- After completing major tasks
- During heartbeats

**Template:**
```markdown
### [YYYY-MM-DD HH:00] - Review Period

**Context:** [What was I working on?]

**What Went Well:**
- [Specific successes]

**What Didn't Go Well:**
- [Mistakes or errors]

**Lessons Learned:**
- [What would I do differently?]

**Action Items:**
- [ ] [Specific improvement to implement]
```

---

### 4. **projects.md** — Project States
**Purpose:** Current state of every project. Key information and links.

**Contents:**
- Project names and statuses
- Key information about each project
- Links to relevant docs/code
- Configuration details

**When to update:**
- When projects change status
- When new projects start
- When key project information updates

**Sections include:**
- Railway deployment (complete)
- Chrome DevTools MCP (production-ready)
- Astro Blog Starter (production-ready)
- Google Drive OAuth Uploader (setup required)
- Bol.com Outreach Bot (setup required)
- And more...

---

### 5. **memory/YYYY-MM-DD.md** — Daily Logs
**Purpose:** Raw logs of what happened. Source material for atomic fact extraction.

**Rotation:** Keep last 7 days only (weekly cleanup)

**Contents:**
- Daily activity logs
- Raw notes from the day
- Source material for lessons.md updates

**When to update:**
- Daily (at end of day or during heartbeats)
- When significant events occur
- For context that might be needed later

---

## Key Differences from Old MEMORY.md

### Before (Single File)
- **MEMORY.md** contained everything:
  - Project statuses
  - Lessons learned
  - Current tasks
  - Historical data
  - All mixed together

### After (5 Files)
- **active-tasks.md** → Crash recovery focus
- **lessons.md** → Learnings and best practices
- **self-review.md** → Periodic reflection
- **projects.md** → Project tracking
- **memory/YYYY-MM-DD.md** → Daily logs (rotating)

---

## Benefits of New Structure

### 1. Faster Crash Recovery
- `active-tasks.md` shows exactly what was in progress
- No need to scan through long MEMORY.md file
- Clear next steps and dependencies

### 2. Better Searchability
- Each file has a single purpose
- Easier to find specific information
- Reduced cognitive load

### 3. Improved Maintainability
- Smaller files are easier to update
- Clear separation of concerns
- Easier to keep current

### 4. Enhanced Reusability
- `lessons.md` prevents repeating mistakes
- `projects.md` provides project context
- `self-review.md` tracks improvement over time

---

## Migration Actions Taken

1. ✅ Created `active-tasks.md` with template (no active tasks currently)
2. ✅ Created `lessons.md` with all learnings from MEMORY.md
3. ✅ Created `self-review.md` with template and initial review
4. ✅ Created `projects.md` with all project information from MEMORY.md
5. ✅ Kept `memory/YYYY-MM-DD.md` structure unchanged (already exists)
6. ✅ Original MEMORY.md kept for reference (can be archived)

---

## Usage Guidelines

### For the Agent

**On startup/restart:**
1. Read `active-tasks.md` first (crash recovery)
2. Read `lessons.md` (avoid repeating mistakes)
3. Read `projects.md` (project context)
4. Read today's + yesterday's `memory/YYYY-MM-DD.md`

**During operation:**
- Update `active-tasks.md` when starting/stopping tasks
- Update `lessons.md` when learning from mistakes
- Update `self-review.md` every 4 hours
- Update `projects.md` when projects change
- Write to `memory/YYYY-MM-DD.md` for daily logs

**During heartbeats:**
- Review and update `active-tasks.md`
- Scan recent `memory/YYYY-MM-DD.md` files
- Update `lessons.md` with new discoveries
- Run `self-review.md` checklist

### For Humans

**When reviewing agent activity:**
- Check `self-review.md` for agent self-critiques
- Check `active-tasks.md` for current work
- Check `projects.md` for project status

**When debugging:**
- Check `active-tasks.md` to see what agent was doing
- Check `lessons.md` for known issues
- Check recent `memory/YYYY-MM-DD.md` for context

---

## Backward Compatibility

- Original `MEMORY.md` file preserved for reference
- All content migrated to new files
- New structure is additive (no data loss)
- Old MEMORY.md can be archived after validation period

---

## Skill Usage Guidelines

**All 57 skills now include "Use When / Don't Use When" sections:**

### Format Added to Each SKILL.md:
```markdown
## Use When
[Specific scenarios when this skill should be used]

## Don't Use When
[Scenarios when this skill should NOT be used - use alternative instead]

## Examples
**Good use case:** [example]
**Bad use case:** [example with what to use instead]
```

### Benefits:
- Clearer tool selection
- Fewer errors from using wrong tools
- Better user experience
- Easier onboarding for new skills

### Skills Updated:
- 54 skills in `/opt/homebrew/lib/node_modules/openclaw/skills/`
- 3 skills in `~/.agents/skills/`

---

## Next Steps

1. Monitor new structure for 1-2 weeks
2. Gather feedback on usability
3. Adjust file formats if needed
4. Archive original MEMORY.md after validation
5. Consider adding automated weekly cleanup for `memory/YYYY-MM-DD.md`

---

## Questions?

Refer to `AGENTS.md` for updated memory system documentation.

**Migration completed:** 2026-02-20
**Migrated by:** memory-restructure subagent
