# 🔒 Security Audit System - Documentation

## Overview

The Gmail Warmup V2 system includes an **automated security audit module** that runs every 24 hours to scan for vulnerabilities, exposed tokens, and misconfigurations.

---

## 🚀 What It Checks

### 1. **Exposed Tokens** 🔴 Critical
- Stripe API keys
- GitHub tokens (PAT, OAuth, User, Server, Refresh)
- AWS Access Keys
- Google API keys
- Slack tokens
- AdsPower API keys

### 2. **API Keys in Logs** 🟠 High
- Scans all log files for credentials
- Detects api_key, token, secret patterns
- Recommends key rotation

### 3. **File Permissions** 🟡 Medium
- Checks .env, config files, certificates
- Validates file access permissions
- Flags overly permissive files

### 4. **Dependency Vulnerabilities** 🟡 Medium
- Scans package.json dependencies
- Checks against known vulnerable versions
- Flags packages needing updates

### 5. **Environment Files** 🔴 Critical
- Ensures .env is in .gitignore
- Detects sensitive patterns in .env
- Prevents accidental commits

### 6. **Git History** 🔴 Critical
- Scans git history for secrets
- Detects committed sensitive files
- Recommends cleanup if needed

### 7. **Port Configurations** 🔵 Info
- Identifies default port usage
- Recommends environment variables
- Flags hardcoded ports

### 8. **Hardcoded Secrets** 🟠 High
- Scans code for passwords/API keys
- Detects hardcoded credentials
- Enforces environment variables

---

## 📅 Scheduling

### Automatic Daily Audits
**Runs:** Every day at 3:00 AM (server time)
**Triggered by:** Node-cron scheduler
**Reports:** Saved to `security-audits/` directory

### Manual Audit
```bash
# Run immediately
cd /Users/northsea/clawd-dmitry/gmail-warmup-v2
bash security-audit.sh

# Or using Node
node lib/security-auditor.js
```

---

## 📊 Audit Reports

### Report Locations

**JSON Report:**
```
security-audits/report-audit-<timestamp>.json
```
Contains:
- Full findings with severity
- File locations
- Recommendations
- Scan metadata

**Markdown Report:**
```
security-audits/report-audit-<timestamp>.md
```
Human-readable format with:
- Executive summary
- Severity breakdown
- Detailed findings
- Action items

**Audit Log:**
```
security-audits/audit.log
```
Historical record of all audits

---

## 🎯 Severity Levels

| Severity | Description | Action Required |
|----------|-------------|------------------|
| 🔴 Critical | Immediate danger | Fix immediately |
| 🟠 High | Serious issue | Fix within 24h |
| 🟡 Medium | Moderate risk | Fix within 7 days |
| 🟢 Low | Minor issue | Fix when convenient |
| 🔵 Info | Informational | No action required |

---

## 🚨 Alerting

### Automatic Alerts
When **critical** or **high** severity issues are found:
- Console alert displayed
- Critical findings logged separately
- Full report generated immediately

### Silent Mode
For **medium**, **low**, and **info** findings:
- Logged to audit report
- No console alerts
- Reviewed in daily logs

---

## 🔧 Integration Points

### 1. System Startup
- Security auditor initializes automatically
- Daily audit scheduled via cron
- Runs independently of warmup tasks

### 2. Railway Deployment
- Runs on Railway servers
- Scans production code
- Reports stored persistently (via volume mounts)

### 3. Local Development
- Runs on local machine
- Catches security issues before deployment
- Provides fast feedback loop

---

## 📋 Example Findings

### Critical Finding Example:
```json
{
  "category": "Exposed Token",
  "severity": "critical",
  "issue": "GitHub Personal Access Token",
  "file": "config/github.js",
  "matches": 2,
  "description": "Found 2 instance(s) of GitHub Personal Access Token",
  "recommendation": "Remove from code and use environment variables"
}
```

### High Finding Example:
```json
{
  "category": "API Key in Logs",
  "severity": "high",
  "issue": "Credentials in log file",
  "file": "logs/warmup.log",
  "matches": 15,
  "description": "Found 15 potential credential(s) in logs",
  "recommendation": "Rotate exposed keys and remove from logs"
}
```

---

## 🛠️ Configuration

### Default Settings
```javascript
{
  projectDir: '/Users/northsea/clawd-dmitry/gmail-warmup-v2',
  reportDir: './security-audits',
  logFile: './security-audits/audit.log',
  alertThreshold: 'medium'  // Alert on medium+ severity
}
```

### Customization
Edit `lib/security-auditor.js`:
```javascript
const auditor = new SecurityAuditor({
    projectDir: '/custom/path',
    reportDir: '/custom/audits',
    alertThreshold: 'high'  // Only alert on high+
});
```

---

## 🔄 Audit Workflow

```
1. Daily Trigger (3 AM)
   ↓
2. Initialize Auditor
   ↓
3. Run All Checks (8 categories)
   ↓
4. Generate Findings
   ↓
5. Calculate Severity Breakdown
   ↓
6. Generate Reports (JSON + Markdown)
   ↓
7. Log to audit.log
   ↓
8. Alert if Critical/High found
   ↓
9. Sleep until next run
```

---

## 📈 Monitoring

### Check Recent Audits
```bash
# View latest audit log
tail -20 security-audits/audit.log

# View latest report
cat security-audits/report-*.md | tail -100

# Count critical issues
grep -c "severity.*critical" security-audits/report-*.json
```

### Security Metrics
- **Total Audits:** Increment daily
- **Trends:** Track issue counts over time
- **Fix Rate:** Compare audits to see improvement
- **Response Time:** How fast issues are addressed

---

## 🎯 Best Practices

### 1. **Review Reports Daily**
- Check security-audits directory
- Prioritize critical/high findings
- Document fixes applied

### 2. **Update Dependencies**
- Run `npm audit` regularly
- Update vulnerable packages
- Check for security advisories

### 3. **Rotate Exposed Keys**
- Immediately rotate any exposed tokens
- Update all references
- Remove from git history if needed

### 4. **Environment Variables**
- Never commit .env files
- Use .env.example for templates
- Validate .gitignore includes .env

### 5. **File Permissions**
- Set sensitive files to 600 (owner only)
- Regular permission audits
- Document required permissions

---

## 🚀 Deployment

### Cron Job (Local)
```bash
# Daily at 3 AM
0 3 * * * /Users/northsea/clawd-dmitry/gmail-warmup-v2/security-audit.sh >> /Users/northsea/clawd-dmitry/logs/security-audit-cron.log 2>&1
```

### Railway (Production)
Security audits run automatically via the built-in scheduler. No additional setup needed.

---

## 📝 Maintenance

### Weekly
- Review audit reports
- Address high-priority findings
- Update dependencies

### Monthly
- Check for new vulnerability patterns
- Update token patterns
- Review false positives

### Quarterly
- Full security review
- Penetration testing
- Compliance audit

---

## ✅ Status

**Current State:**
- ✅ Security auditor: Implemented
- ✅ Daily scheduling: Enabled (3 AM)
- ✅ Automatic scanning: Active
- ✅ Report generation: Working
- ✅ Alert system: Operational

**First Run:** On next deployment or system restart
**Frequency:** Every 24 hours at 3:00 AM

---

## 🎉 Summary

The Gmail Warmup V2 system now includes **automated security self-auditing** that:

1. ✅ Runs every 24 hours automatically
2. ✅ Scans for 8 categories of security issues
3. ✅ Generates detailed reports (JSON + Markdown)
4. ✅ Alerts on critical/high findings
5. ✅ Tracks trends over time
6. ✅ Provides actionable recommendations

**Security is now automated and proactive!** 🔒
