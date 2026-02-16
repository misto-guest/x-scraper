# /save Command Handler

**Description:** Memory sweep + auto-commit for workspace

## Command: `/save`

Triggers the workspace save script which:
- Scans for git changes
- Updates daily memory entries
- Commits changes with intelligent messages
- Pushes to GitHub

## Handler Configuration

**Type:** Exec
**Script:** `.clawdbot/scripts/save.sh`
**Working Directory:** `/Users/northsea/clawd-dmitry`

## Execution

When user types `/save` in Telegram:
1. Change to workspace directory
2. Execute save.sh script
3. Return output to user

## Example Output

```
🔄 Memory Sweep: 2026-02-13

Step 1: Scanning for changes...
✅ Changes found

Step 2: What changed?
AGENTS.md
skills/new-skill/SKILL.md

... (commit and push process)

✅ Memory sweep complete!
```
