# Clawdbot + Clawd Control Improvement Plan

**Based on:** OpenAI Blog: "Shell + Skills + Compaction: Tips for long-running agents"
**Created:** 2026-02-13
**Status:** 🚧 In Progress (8 skills improved, context-manager built)

---

## Executive Summary

Implementing OpenAI's best practices for long-running agents in our Clawdbot + Clawd Control setup. Focus areas: skill optimization, template separation, context management, and shell execution patterns.

---

## Priority Matrix

| Priority | Item | Effort | Impact | Status |
|-----------|------|--------|--------|--------|
| 🔴 HIGH | Skill Description Optimization | Medium | High | ✅ Done (8 skills fixed 2026-02-13) |
| 🔴 HIGH | Context Compaction System | High | Very High | ✅ Built (context-manager skill 2026-02-13) |
| 🔴 HIGH | Skill Routing Improvements | Medium | High | ✅ Done (as part of optimization) |
| 🟡 MEDIUM | Template Separation | Low | Medium | 📋 Planned |
| 🟡 MEDIUM | Shell/Execution Documentation | Low | Medium | 📋 Planned |
| 🟢 LOW | Performance Monitoring | Medium | Medium | 📋 Planned |

---

## 1. Skill Description Optimization (HIGH)

### Problem
Many skills lack clear "Use when vs Don't use when" blocks, leading to:
- Poor routing decisions
- Skills triggering for wrong tasks
- Context bloat from unnecessary skill loads

### Solution Pattern (from OpenAI blog)
```markdown
## When to Use This Skill

**Use for:**
- [Specific concrete use cases]
- [Clear task types]
- [Explicit scenarios]

**Don't use for:**
- [Negative examples - what NOT to use it for]
- [Alternative approaches]
- [Edge cases where this skill is wrong]

**Expected Outputs:**
- [What the skill produces]
- [Success criteria]

**Tools Involved:**
- [Specific tools used]
```

### Skills Requiring Updates

#### Critical (vague descriptions):
- `qa-analyst` - Currently in `/Users/northsea/clawd-dmitry/skills/`
- `ghostfetch` - Recently added, needs refinement
- `planning-with-files` - Good but can be improved

#### Medium Priority (review needed):
All skills in `/opt/homebrew/lib/node_modules/clawdbot/skills/`

### Implementation Steps
1. ✅ Read all existing skills (done via sub-agent)
2. ✅ Identify skills with weak descriptions (analysis complete)
3. ✅ Fix 3 critical skills missing frontmatter (canvas, coding-agent, tmux - DONE 2026-02-13)
4. ✅ Fix 5 high-priority skills with improved descriptions (bluebubbles, github, qmd, local-places, frontend-design - DONE 2026-02-13)
5. ✅ Create context-manager skill for automatic compaction (DONE 2026-02-13)
6. ⏳ Add negative examples to remaining skills
7. ⏳ Separate templates from embedded skills

---

## 2. Context Compaction System (HIGH)

### Problem
Long-running agents hit context limits, losing important history and requiring manual context management.

### Current State
- `planning-with-files` skill exists for persistent storage
- ✅ **context-manager** skill created (2026-02-13) - Full automatic compaction system

### Solution Components

#### A. Automatic Compaction Triggers
✅ **IMPLEMENTED in context-manager skill:**
- Token monitoring at 70%/80%/90% thresholds
- Automatic alerts when approaching limits
- Command-line interface for on-demand compaction

#### B. Compaction Strategy
✅ **IMPLEMENTED in context-manager skill:**
1. **Keep:** Recent 20 messages
2. **Summarize:** Middle section into key points
3. **Preserve:** System prompts + critical decisions
4. **Store:** Long-term in files (MEMORY.md, daily notes)

#### C. New Skill: `context-manager`
✅ **COMPLETE (2026-02-13):**
- ✅ Automatic context monitoring (`monitor.sh`)
- ✅ Smart summarization with 3 templates (standard/technical/decision)
- ✅ Persistent knowledge extraction to memory files
- ✅ Session recovery with checkpoints
- ✅ Railway deployment compatible (POSIX-compliant)
- Location: `/Users/northsea/.clawdbot/skills/context-manager/`

### Implementation
- ✅ Create `context-manager` skill (DONE)
- ⏳ Add automatic compaction to AGENTS.md workflow
- ⏳ Integrate with heartbeat system for proactive monitoring

---

## 3. Template Separation (MEDIUM)

### Problem
Templates embedded in SKILL.md files:
- Inflate tokens when skill loads
- Hard to reuse across skills
- Difficult to version separately

### Solution Pattern
```
clawd-dmitry/skills/my-skill/
├── SKILL.md              # Instructions only
├── templates/
│   ├── report.md        # Output template
│   ├── prompt.md        # Prompt template
│   └── checklist.md     # Reusable checklist
└── examples/
    ├── good-output.md   # Example of correct output
    └── bad-output.md    # Example of incorrect output (negative)
```

### Skills Needing Template Separation
- `qa-analyst` - Has embedded report template
- Any skill with large examples in SKILL.md

### Implementation
1. Extract templates to `/templates/` subfolders
2. Update SKILL.md to reference templates
3. Add template loading instructions

---

## 4. Shell/Execution Documentation (MEDIUM)

### Current State
- ✅ Railway deployment with full shell access
- ✅ Auto-discovers local agents
- ✅ Public URL: https://clawd-control-production.up.railway.app

### Improvements Needed

#### A. Long-Running Process Patterns
Document best practices for:
- Background jobs with `cron` tool
- Sub-agent spawning (per SUB-AGENT-PROTOCOL.md)
- Session continuation after context reset

#### B. Container Reuse
- How to reuse Railway containers
- Environment variable management
- Persistent storage strategies

#### C. Error Recovery
- Retry patterns for shell commands
- Graceful degradation
- State persistence

### Implementation
Create `SHELL-PATTERNS.md` documentation in workspace

---

## 5. Skill Routing Improvements (HIGH)

### Problem
Skills may trigger incorrectly when multiple skills seem relevant.

### Solution: Enhanced Descriptions
Add to skill frontmatter:
```yaml
---
name: skill-name
description: |
  Use when: [Exact conditions]
  Don't use when: [Negative conditions]
  Triggers: [Keywords that should invoke this skill]
  Conflicts with: [Similar skills and when to choose this instead]
---
```

### Implementation
Update all skill descriptions with:
- Trigger keywords
- Conflict resolution
- Clear routing boundaries

---

## 6. Performance Monitoring (LOW)

### Metrics to Track
- Skill trigger accuracy (correct/incorrect)
- Average context usage before compaction
- Shell command success rate
- Sub-agent completion rate

### Implementation
Add to Clawd Control dashboard if metrics not already present

---

## Implementation Order

### Phase 1: Critical Routing Fixes (Week 1)
1. Update skill descriptions with "Use when vs Don't use when"
2. Add negative examples to commonly misfiring skills
3. Document trigger keywords

### Phase 2: Context Management (Week 2)
1. Create `context-manager` skill
2. Implement automatic compaction triggers
3. Test with long-running sessions

### Phase 3: Template Separation (Week 3)
1. Extract templates from embedded skills
2. Create `/templates/` structure
3. Update references

### Phase 4: Documentation & Monitoring (Week 4)
1. Write `SHELL-PATTERNS.md`
2. Add performance metrics
3. Document best practices

---

## Success Criteria

✅ **Skills trigger accurately 95%+ of the time**
✅ **Long-running sessions (>100 messages) work without manual intervention**
✅ **Token usage reduced by 30% through template separation**
✅ **Clear documentation for shell execution patterns**
✅ **Context compaction happens automatically**

---

## Next Steps

1. **Immediate:** Start with skill description updates (quick wins)
2. **This Week:** Build `context-manager` skill prototype
3. **Next Week:** Implement automatic compaction
4. **Ongoing:** Monitor and iterate based on actual usage

---

## References

- OpenAI Blog: https://developers.openai.com/blog/skills-shell-tips
- Current Skills: `/opt/homebrew/lib/node_modules/clawdbot/skills/`
- Local Skills: `/Users/northsea/clawd-dmitry/skills/`
- Planning Skill: `/Users/northsea/.clawdbot/skills/planning-with-files/SKILL.md`

---

**Last Updated:** 2026-02-13 11:45 GMT+1
