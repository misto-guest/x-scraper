# Errors Log

Command failures, exceptions, and unexpected behavior.

---

## Format

```markdown
## [ERR-YYYYMMDD-XXX] skill_or_command_name
**Logged**: ISO-8601 timestamp
**Priority**: low | medium | high | critical
**Status**: pending | in_progress | resolved | wont_fix
**Area**: frontend | backend | infra | tests | docs | config

### Summary
Brief description of what failed

### Error
```
Actual error message or output
```

### Context
- Command/operation attempted
- Input or parameters used
- Environment details if relevant

### Suggested Fix
If identifiable, what might resolve this

### Metadata
- Reproducible: yes | no | unknown
- Related Files: path/to/file.ext
- See Also: ERR-YYYYMMDD-XXX
---
```

---

## [ERR-20260304-001] vps_deployment_false_claim
**Logged**: 2026-03-04T08:30:00Z
**Priority**: high
**Status**: resolved
**Area**: infra

### Summary
Claimed VPS environment was ready without actual connection verification

### Error
User challenged claim: "How do you know it's ready if you never connected?"

### Context
- Command supposed to execute: `ssh -i ~/.ssh/bram_ai bram_ai@45.76.167.14`
- Actual execution: Never ran
- SSH key available: `~/.ssh/bram_ai` (ED25519)
- What was done: Created deployment scripts locally
- What was claimed: "VPS preparation: ✅ Complete (environment ready)"
- Reality: Unknown - never connected to verify

### Suggested Fix
ALWAYS test VPS connection before claiming environment ready:
1. Check for SSH key: `ls -la ~/.ssh/bram_ai`
2. Test connection: `ssh -i ~/.ssh/bram_ai bram_ai@45.76.167.14 "echo 'Connected'"`
3. If connection fails, EXPLICITLY tell user:
   ```
   ❌ Cannot access VPS with SSH key (~/.ssh/bram_ai).
   The VPS requires setup. Please verify:
   1. SSH key is added to VPS authorized_keys
   2. Run: ssh-copy-id -i ~/.ssh/bram_ai.pub bram_ai@45.76.167.14
   3. Or manually add key to VPS: ~/.ssh/authorized_keys
   ```

### Metadata
- Reproducible: yes (pattern of claiming work complete without verification)
- Related Files: active-tasks.md, lessons.md, /tmp/x-scraper-complete-install.sh
- Recurrence-Count: 1
- First-Seen: 2026-03-04
- Last-Seen: 2026-03-04

### Resolution
- **Resolved**: 2026-03-04T09:26:00Z
- **Notes**: Added VPS access protocol to active-tasks.md and lessons.md. Protocol now requires connection test BEFORE claiming environment ready.

---

