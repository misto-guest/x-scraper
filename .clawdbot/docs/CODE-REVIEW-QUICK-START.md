# Code Review Expert - Quick Start Guide

**Skill:** code-review-expert
**Installed:** 2026-03-03
**Location:** `/Users/northsea/clawd-dmitry/.agents/skills/code-review-expert`

---

## What It Does

Performs senior engineer-level code reviews on git changes:
- ✅ SOLID principle violations
- ✅ Security vulnerabilities (XSS, injection, race conditions)
- ✅ Performance issues (N+1, missing cache)
- ✅ Error handling & boundary conditions

---

## How to Use

### Option 1: Review Current Changes (Default)

```bash
# Dmitry will automatically use the skill when you say:
"Review my code changes"
"Check for security issues"
"What SOLID violations are in this code?"
```

### Option 2: Review Specific Files

```bash
# Dmitry will review specific files:
"Review src/auth/login.ts for security issues"
"Check api/payment.ts for SOLID violations"
```

### Option 3: Review Project

```bash
# Review entire project:
"Do a full code review of the transcription-app project"
```

---

## Severity Levels

| Level | Name | Description | Action |
|-------|------|-------------|--------|
| **P0** | Critical | Security, data loss, correctness bugs | Block merge |
| **P1** | High | Logic errors, SOLID, performance | Fix before merge |
| **P2** | Medium | Code smells, maintainability | Fix in PR or follow-up |
| **P3** | Low | Style, naming, suggestions | Optional |

---

## Review Workflow

1. **Analyze** - Git diff, identify entry points, critical paths
2. **Check SOLID** - Single responsibility, open/closed, Liskov, etc.
3. **Security Scan** - XSS, injection, auth, race conditions
4. **Quality Check** - Error handling, performance, boundaries
5. **Report** - Structured findings with severity levels
6. **Confirm** - Ask how to proceed (fix all, P0/P1 only, etc.)

---

## Output Format

```
## Code Review Summary

**Files reviewed**: X files, Y lines changed
**Overall assessment**: [APPROVE / REQUEST_CHANGES / COMMENT]

---

## Findings

### P0 - Critical
1. [file:line] Issue description
   - Impact and exploitability
   - Suggested fix

### P1 - High
...

### P2 - Medium
...

### P3 - Low
...

## Next Steps
Choose: Fix all / Fix P0/P1 / Fix specific / No changes
```

---

## Integration with Development Workflow

### Pre-Commit
```bash
# Before committing:
"Review my changes before I commit"
```

### Pre-Push
```bash
# Before pushing to remote:
"Do a final code review before I push"
```

### Pull Request Review
```bash
# Review PR changes:
"Review the changes in this pull request"
```

### Security Audit
```bash
# Full security scan:
"Do a security audit of this project"
```

---

## Best Practices

1. **Run Early** - Review before committing, not after
2. **Fix P0/P1 Immediately** - Don't merge with critical issues
3. **Document Decisions** - If you ignore a warning, note why
4. **Iterate** - Run review after fixes to verify
5. **Learn** - Use suggestions to improve code quality

---

## Example Usage

```bash
# Dmitry, review my changes:
User: "I just finished the authentication module. Review it for security issues."

Dmitry: [Uses code-review-expert skill]
## Code Review Summary

**Files reviewed**: 3 files, 245 lines changed
**Overall assessment**: REQUEST_CHANGES

---

## Findings

### P0 - Critical
1. src/auth/login.ts:45 - SQL Injection Vulnerability
   - User input directly concatenated into query
   - Attacker can bypass authentication
   - Fix: Use parameterized queries

### P1 - High
2. src/auth/middleware.ts:12 - Missing Authorization Check
   - No verification that user owns the requested resource
   - Leads to unauthorized data access
   - Fix: Add tenant ID validation

...

---

## Next Steps

I found 2 issues (P0: 1, P1: 1, P2: 0, P3: 0).

**How would you like to proceed?**

1. Fix all - I'll implement all suggested fixes
2. Fix P0/P1 only - Address critical and high priority issues
3. Fix specific items - Tell me which issues to fix
4. No changes - Review complete, no implementation needed
```

---

## Continuous Integration

To automatically review all code changes:

1. **Pre-commit hook** (optional)
2. **CI pipeline step** - Run on all PRs
3. **Scheduled audits** - Weekly full-project reviews

---

## Learn More

**Skill Documentation:** `/Users/northsea/clawd-dmitry/.agents/skills/code-review-expert/SKILL.md`

**Reference Checklists:**
- `references/solid-checklist.md`
- `references/security-checklist.md`
- `references/code-quality-checklist.md`
- `references/removal-plan.md`
