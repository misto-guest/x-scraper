# Active Tasks - Crash Recovery & WIP

**Purpose:** What the agent is working on RIGHT NOW. Tasks that should resume on restart. Critical context for crash recovery.

**Last Updated:** 2026-02-20

---

## Current Tasks

### GitHub-First Deployment Workflow - MANDATORY
- **Started:** 2026-03-05
- **Status:** Active Protocol
- **Instruction:** ALWAYS deploy from GitHub, NEVER copy-paste

**Deployment Rules:**
1. **Every project MUST be in GitHub** before deployment
2. **Deploy ONLY from GitHub repository** on Railway
3. **NEVER deploy via copy-paste** (causes debugging confusion)
4. **Verify deployment source** - if it's not from GitHub, it's wrong

**Example Workflow:**
```bash
# 1. Code locally
cd /Users/northsea/clawd-dmitry/my-project

# 2. Initialize Git and push to GitHub
git init
git add .
git commit -m "Initial commit"
git remote add origin git@github.com:username/my-project.git
git push -u origin main

# 3. Deploy on Railway from GitHub repository
# (use Railway CLI or Dashboard to connect GitHub repo)
```

**When Helping with Deployment:**
- Ask: "Is this project in GitHub?"
- If NO: "Please push to GitHub first, then we'll deploy from there."
- If YES: "Great, let's deploy from the GitHub repository."

**Why This Matters:**
- Single source of truth
- Easier debugging
- Version control
- No "ghost code" confusion

### VPS Access Protocol - MANDATORY
- **Started:** 2026-03-04
- **Status:** Active Protocol
- **Instruction:** ALWAYS use provided SSH key for VPS access

**VPS Access Rules:**
1. **Check for SSH key first:** Look for `~/.ssh/<vps_username>` key file
2. **Use SSH key auth:** `ssh -i ~/.ssh/<key> <user>@<ip>`
3. **If SSH key fails:** EXPLICITLY tell user: "VPS requires setup - SSH key access not working. Please verify key permissions or VPS configuration."

**Example:**
```bash
# Correct approach
ssh -i ~/.ssh/bram_ai bram_ai@45.76.167.14

# If this fails, report to user:
# "❌ Cannot access VPS with SSH key (~/.ssh/bram_ai).
#  The VPS may require initial setup. Please:
#  1. Verify SSH key is added to VPS: ssh-copy-id -i ~/.ssh/bram_ai.pub bram_ai@45.76.167.14
#  2. Or manually add key to VPS: ~/.ssh/authorized_keys"
```

**Key Files to Check:**
- `~/.ssh/bram_ai` (for 45.76.167.14)
- Other VPS keys in `~/.ssh/`

**Never assume VPS is ready without testing connection first.**

---

## How to Use This File

When the agent crashes or restarts:
1. Check this file first to understand what was in progress
2. Resume interrupted tasks
3. Update this file when starting new multi-step work
4. Clear completed tasks to keep it current

**Format for new tasks:**
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
