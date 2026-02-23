#!/usr/bin/env node

/**
 * Security Audit Module
 * Runs automated security checks every 24 hours
 * Scans for: exposed tokens, misconfigurations, leaks, vulnerabilities
 */

const fs = require('fs').promises;
const path = require('path');
const { execSync } = require('child_process');

class SecurityAuditor {
    constructor(options = {}) {
        this.projectDir = options.projectDir || process.cwd();
        this.reportDir = options.reportDir || path.join(this.projectDir, 'security-audits');
        this.logFile = options.logFile || path.join(this.reportDir, 'audit.log');
        this.alertThreshold = options.alertThreshold || 'medium'; // low, medium, high
    }

    /**
     * Run full security audit
     */
    async runAudit() {
        const auditId = `audit-${Date.now()}`;
        const startTime = Date.now();

        console.log(`\n🔒 Security Audit Started: ${new Date().toISOString()}`);
        console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

        const results = {
            auditId,
            timestamp: new Date().toISOString(),
            duration: 0,
            findings: [],
            summary: {
                critical: 0,
                high: 0,
                medium: 0,
                low: 0,
                info: 0
            }
        };

        try {
            // Ensure report directory exists
            await fs.mkdir(this.reportDir, { recursive: true });

            // Run all security checks
            await this.checkExposedTokens(results);
            await this.checkAPIKeysInLogs(results);
            await this.checkFilePermissions(results);
            await this.checkDependencies(results);
            await this.checkEnvFiles(results);
            await this.checkGitExposure(results);
            await this.checkPortConfigurations(results);
            await this.checkHardcodedSecrets(results);

            // Calculate duration
            results.duration = Math.round((Date.now() - startTime) / 1000);

            // Generate report
            await this.generateReport(results);

            // Log results
            await this.logAudit(results);

            // Alert if issues found
            if (results.summary.critical > 0 || results.summary.high > 0) {
                await this.sendAlert(results);
            }

            console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
            console.log('✅ Security Audit Complete');
            console.log(`   Critical: ${results.summary.critical}`);
            console.log(`   High: ${results.summary.high}`);
            console.log(`   Medium: ${results.summary.medium}`);
            console.log(`   Low: ${results.summary.low}`);
            console.log(`   Info: ${results.summary.info}`);
            console.log(`   Duration: ${results.duration}s`);
            console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

            return results;

        } catch (error) {
            console.error('❌ Audit failed:', error.message);
            throw error;
        }
    }

    /**
     * Check for exposed tokens in code
     */
    async checkExposedTokens(results) {
        console.log('🔍 Scanning for exposed tokens...');

        const tokenPatterns = [
            { pattern: /sk-[a-zA-Z0-9]{48,}/g, name: 'Stripe API Key', severity: 'critical' },
            { pattern: /ghp_[a-zA-Z0-9]{36,}/g, name: 'GitHub Personal Access Token', severity: 'critical' },
            { pattern: /gho_[a-zA-Z0-9]{36,}/g, name: 'GitHub OAuth Token', severity: 'critical' },
            { pattern: /ghu_[a-zA-Z0-9]{36,}/g, name: 'GitHub User Token', severity: 'critical' },
            { pattern: /ghs_[a-zA-Z0-9]{36,}/g, name: 'GitHub Server Token', severity: 'critical' },
            { pattern: /ghr_[a-zA-Z0-9]{36,}/g, name: 'GitHub Refresh Token', severity: 'critical' },
            { pattern: /AKIA[0-9A-Z]{16,}/g, name: 'AWS Access Key', severity: 'critical' },
            { pattern: /AIza[0-9A-Za-z\-_]{35,}/g, name: 'Google API Key', severity: 'high' },
            { pattern: /xox[bap]-[0-9]{12,}-[0-9]{12,}-[0-9]{24,}/g, name: 'Slack Token', severity: 'high' },
            { pattern: /[0-9]{9,}-[A-Za-z0-9_]{32,}\.apps\.googleusercontent\.com/g, name: 'Google OAuth Client ID', severity: 'medium' },
            { pattern: /746feb8ab409fbb27a0377a864279e6c000f879a7a0e5329/g, name: 'AdsPower API Key', severity: 'high' }
        ];

        const filesToScan = [
            '**/*.js',
            '**/*.json',
            '**/*.ts',
            '**/*.jsx',
            '**/*.tsx',
            '**/*.env',
            '**/*.md',
            '**/*.sh',
            '**/*.yml',
            '**/*.yaml'
        ];

        for (const fileGlob of filesToScan) {
            try {
                const { glob } = require('glob');
                const files = glob.sync(fileGlob, { cwd: this.projectDir, ignore: '**/node_modules/**' });

                for (const file of files) {
                    const filePath = path.join(this.projectDir, file);
                    const content = await fs.readFile(filePath, 'utf8');

                    for (const { pattern, name, severity } of tokenPatterns) {
                        const matches = content.match(pattern);
                        if (matches) {
                            results.findings.push({
                                category: 'Exposed Token',
                                severity,
                                issue: name,
                                file: file,
                                matches: matches.length,
                                description: `Found ${matches.length} instance(s) of ${name}`,
                                recommendation: 'Remove from code and use environment variables'
                            });
                            results.summary[severity]++;
                        }
                    }
                }
            } catch (error) {
                // Glob might not be available, skip
            }
        }

        console.log(`   Found ${results.findings.filter(f => f.category === 'Exposed Token').length} token exposures`);
    }

    /**
     * Check for API keys in log files
     */
    async checkAPIKeysInLogs(results) {
        console.log('🔍 Scanning log files for API keys...');

        const logDir = path.join(this.projectDir, 'logs');
        const keyPatterns = [
            /api[_-]?key["']?\s*[:=]\s*["']?[^"'\s]+/gi,
            /token["']?\s*[:=]\s*["']?[^"'\s]+/gi,
            /secret["']?\s*[:=]\s*["']?[^"'\s]+/gi
        ];

        try {
            const files = await fs.readdir(logDir);
            const logFiles = files.filter(f => f.endsWith('.log'));

            for (const logFile of logFiles) {
                const filePath = path.join(logDir, logFile);
                const content = await fs.readFile(filePath, 'utf8');

                for (const pattern of keyPatterns) {
                    const matches = content.match(pattern);
                    if (matches) {
                        results.findings.push({
                            category: 'API Key in Logs',
                            severity: 'high',
                            issue: 'Credentials in log file',
                            file: `logs/${logFile}`,
                            matches: matches.length,
                            description: `Found ${matches.length} potential credential(s) in logs`,
                            recommendation: 'Rotate exposed keys and remove from logs'
                        });
                        results.summary.high++;
                    }
                }
            }
        } catch (error) {
            // Log directory might not exist
        }

        console.log(`   Checked log files`);
    }

    /**
     * Check file permissions
     */
    async checkFilePermissions(results) {
        console.log('🔍 Checking file permissions...');

        const sensitiveFiles = [
            '.env',
            'config/secure.yaml',
            '**/*.key',
            '**/*.pem',
            '**/credentials.json',
            '**/secrets/**'
        ];

        for (const filePattern of sensitiveFiles) {
            try {
                const { glob } = require('glob');
                const files = glob.sync(filePattern, { cwd: this.projectDir });

                for (const file of files) {
                    const filePath = path.join(this.projectDir, file);
                    try {
                        const stats = await fs.stat(filePath);
                        const mode = (stats.mode & parseInt('777', 8)).toString(8);

                        // Check if file is readable by others
                        if (mode.includes('4') || mode.includes('6') || mode.includes('7')) {
                            results.findings.push({
                                category: 'File Permissions',
                                severity: 'medium',
                                issue: 'Overly permissive file',
                                file: file,
                                permission: mode,
                                description: `File has permissions ${mode}`,
                                recommendation: 'Restrict to owner only (chmod 600)'
                            });
                            results.summary.medium++;
                        }
                    } catch (error) {
                        // File might not exist
                    }
                }
            } catch (error) {
                // Glob might not be available
            }
        }

        console.log(`   Checked file permissions`);
    }

    /**
     * Check for outdated dependencies
     */
    async checkDependencies(results) {
        console.log('🔍 Checking dependencies...');

        try {
            const packageJson = path.join(this.projectDir, 'package.json');
            const content = JSON.parse(await fs.readFile(packageJson, 'utf8'));
            const deps = { ...content.dependencies, ...content.devDependencies };

            // Check for known vulnerable packages
            const vulnerablePackages = [
                { name: 'lodash', version: '<4.17.21', severity: 'high' },
                { name: 'axios', version: '<0.21.1', severity: 'medium' },
                { name: 'express', version: '<4.17.1', severity: 'medium' },
                { name: 'minimist', version: '<1.2.6', severity: 'low' }
            ];

            for (const dep in deps) {
                const depVersion = deps[dep].replace(/^\^|~/, '');
                const vulnerable = vulnerablePackages.find(v => v.name === dep);

                if (vulnerable) {
                    results.findings.push({
                        category: 'Dependency',
                        severity: vulnerable.severity,
                        issue: 'Potentially vulnerable package',
                        package: dep,
                        currentVersion: depVersion,
                        description: `${dep} may have known vulnerabilities`,
                        recommendation: `Update to latest version: npm update ${dep}`
                    });
                    results.summary[vulnerable.severity]++;
                }
            }
        } catch (error) {
            // package.json might not exist
        }

        console.log(`   Checked dependencies`);
    }

    /**
     * Check .env files
     */
    async checkEnvFiles(results) {
        console.log('🔍 Checking .env files...');

        const envFiles = [
            '.env',
            '.env.local',
            '.env.production',
            '.env.development'
        ];

        for (const envFile of envFiles) {
            const filePath = path.join(this.projectDir, envFile);
            try {
                await fs.access(filePath);
                const content = await fs.readFile(filePath, 'utf8');

                // Check if .env is in .gitignore
                const gitignorePath = path.join(this.projectDir, '.gitignore');
                let inGitignore = false;

                try {
                    const gitignore = await fs.readFile(gitignorePath, 'utf8');
                    inGitignore = gitignore.split('\n').some(line => line.trim() === '.env' || line.trim() === '.env*');
                } catch {}

                if (!inGitignore) {
                    results.findings.push({
                        category: 'Git Security',
                        severity: 'critical',
                        issue: '.env file not in .gitignore',
                        file: envFile,
                        description: 'Environment file may be committed to git',
                        recommendation: 'Add .env to .gitignore immediately'
                    });
                    results.summary.critical++;
                }

                // Check for sensitive patterns
                const sensitivePatterns = [
                    /password\s*=\s*.+/i,
                    /secret\s*=\s*.+/i,
                    /api[_-]?key\s*=\s*.+/i
                ];

                for (const pattern of sensitivePatterns) {
                    if (pattern.test(content)) {
                        results.findings.push({
                            category: 'Environment Security',
                            severity: 'medium',
                            issue: 'Sensitive data in .env',
                            file: envFile,
                            description: 'Contains sensitive information',
                            recommendation: 'Ensure .env is never committed to version control'
                        });
                        results.summary.medium++;
                        break;
                    }
                }
            } catch {
                // File doesn't exist, that's ok
            }
        }

        console.log(`   Checked .env files`);
    }

    /**
     * Check git history for secrets
     */
    async checkGitExposure(results) {
        console.log('🔍 Checking git history...');

        try {
            // Check if .git directory exists
            const gitDir = path.join(this.projectDir, '.git');
            await fs.access(gitDir);

            // Check for secrets in git history
            const output = execSync('git log --all --full-history --source -- "*secret*" "*key*" "*password*" "*.env" 2>/dev/null || return', {
                cwd: this.projectDir,
                encoding: 'utf8'
            });

            if (output && output.length > 0) {
                results.findings.push({
                    category: 'Git Security',
                    severity: 'critical',
                    issue: 'Potentially committed secrets',
                    description: 'Git history may contain sensitive files',
                    recommendation: 'Consider git-filter-repo to remove sensitive data from history'
                });
                results.summary.critical++;
            }
        } catch {
            // Not a git repo or git not available
        }

        console.log(`   Checked git history`);
    }

    /**
     * Check port configurations
     */
    async checkPortConfigurations(results) {
        console.log('🔍 Checking port configurations...');

        // Check for default ports
        const defaultPorts = [3000, 8080, 5000, 8000, 18789];

        try {
            const { glob } = require('glob');
            const jsFiles = glob.sync('**/*.js', { cwd: this.projectDir, ignore: '**/node_modules/**' });

            for (const file of jsFiles) {
                const filePath = path.join(this.projectDir, file);
                const content = await fs.readFile(filePath, 'utf8');

                for (const port of defaultPorts) {
                    if (content.includes(`PORT.*${port}`) || content.includes(`port.*:.*${port}`)) {
                        results.findings.push({
                            category: 'Configuration',
                            severity: 'info',
                            issue: 'Using default port',
                            file: file,
                            port: port,
                            description: `Application uses default port ${port}`,
                            recommendation: 'Use environment variable for port configuration'
                        });
                        results.summary.info++;
                    }
                }
            }
        } catch (error) {
            // Glob not available
        }

        console.log(`   Checked port configurations`);
    }

    /**
     * Check for hardcoded secrets
     */
    async checkHardcodedSecrets(results) {
        console.log('🔍 Scanning for hardcoded secrets...');

        const secretPatterns = [
            /password\s*[:=]\s*["'][^"']+["']/gi,
            /api[_-]?key\s*[:=]\s*["'][^"']+["']/gi,
            /secret\s*[:=]\s*["'][^"']+["']/gi,
            /token\s*[:=]\s*["'][^"']+["']/gi,
            /authorization\s*[:=]\s*["'][Bb]earer\s+[^"']+["']/gi
        ];

        try {
            const { glob } = require('glob');
            const jsFiles = glob.sync('**/*.{js,ts,jsx,tsx}', { cwd: this.projectDir, ignore: '**/node_modules/**' });

            for (const file of jsFiles) {
                const filePath = path.join(this.projectDir, file);
                const content = await fs.readFile(filePath, 'utf8');

                for (const pattern of secretPatterns) {
                    const matches = content.match(pattern);
                    if (matches) {
                        // Filter out obvious template strings
                        const hardcoded = matches.filter(m => !m.includes('${') && !m.includes('<'));

                        if (hardcoded.length > 0) {
                            results.findings.push({
                                category: 'Hardcoded Secret',
                                severity: 'high',
                                issue: 'Hardcoded credential detected',
                                file: file,
                                count: hardcoded.length,
                                description: `Found ${hardcoded.length} hardcoded secret(s)`,
                                recommendation: 'Use environment variables for credentials'
                            });
                            results.summary.high++;
                            break;
                        }
                    }
                }
            }
        } catch (error) {
            // Glob not available
        }

        console.log(`   Scanned for hardcoded secrets`);
    }

    /**
     * Generate audit report
     */
    async generateReport(results) {
        const reportPath = path.join(this.reportDir, `report-${results.auditId}.json`);
        await fs.writeFile(reportPath, JSON.stringify(results, null, 2));

        // Generate human-readable report
        const humanReport = path.join(this.reportDir, `report-${results.auditId}.md`);
        const reportContent = this.generateMarkdownReport(results);
        await fs.writeFile(humanReport, reportContent);

        console.log(`   📄 Report saved: ${humanReport}`);
    }

    /**
     * Generate markdown report
     */
    generateMarkdownReport(results) {
        let markdown = `# Security Audit Report\n\n`;
        markdown += `**Audit ID:** ${results.auditId}\n`;
        markdown += `**Timestamp:** ${results.timestamp}\n`;
        markdown += `**Duration:** ${results.duration}s\n\n`;
        markdown += `## Summary\n\n`;
        markdown += `| Severity | Count |\n`;
        markdown += `|----------|-------|\n`;
        markdown += `| 🔴 Critical | ${results.summary.critical} |\n`;
        markdown += `| 🟠 High | ${results.summary.high} |\n`;
        markdown += `| 🟡 Medium | ${results.summary.medium} |\n`;
        markdown += `| 🟢 Low | ${results.summary.low} |\n`;
        markdown += `| 🔵 Info | ${results.summary.info} |\n\n`;

        if (results.findings.length > 0) {
            markdown += `## Findings\n\n`;

            // Group by severity
            const bySeverity = results.findings.reduce((acc, finding) => {
                if (!acc[finding.severity]) acc[finding.severity] = [];
                acc[finding.severity].push(finding);
                return acc;
            }, {});

            for (const severity of ['critical', 'high', 'medium', 'low', 'info']) {
                if (bySeverity[severity]) {
                    const emoji = { critical: '🔴', high: '🟠', medium: '🟡', low: '🟢', info: '🔵' }[severity];
                    markdown += `### ${emoji.toUpperCase()} ${severity.toUpperCase()} (${bySeverity[severity].length})\n\n`;

                    for (const finding of bySeverity[severity]) {
                        markdown += `**${finding.issue}**\n`;
                        markdown += `- **Category:** ${finding.category}\n`;
                        if (finding.file) markdown += `- **File:** ${finding.file}\n`;
                        if (finding.description) markdown += `- **Details:** ${finding.description}\n`;
                        if (finding.recommendation) markdown += `- **Recommendation:** ${finding.recommendation}\n`;
                        markdown += `\n`;
                    }
                }
            }
        } else {
            markdown += `## ✅ No Security Issues Found\n\n`;
            markdown += `Great job! No security vulnerabilities were detected.\n`;
        }

        return markdown;
    }

    /**
     * Log audit results
     */
    async logAudit(results) {
        const logEntry = {
            timestamp: results.timestamp,
            auditId: results.auditId,
            summary: results.summary,
            criticalFindings: results.findings.filter(f => f.severity === 'critical' || f.severity === 'high')
        };

        const logLine = JSON.stringify(logEntry);
        await fs.appendFile(this.logFile, logLine + '\n');
    }

    /**
     * Send alert for critical issues
     */
    async sendAlert(results) {
        const criticalIssues = results.findings.filter(f => f.severity === 'critical' || f.severity === 'high');

        if (criticalIssues.length === 0) return;

        console.log('\n🚨 SECURITY ALERT');
        console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
        console.log(`Found ${criticalIssues.length} critical/high severity issues:\n`);

        criticalIssues.forEach((issue, i) => {
            console.log(`${i + 1}. ${issue.issue} (${issue.severity.toUpperCase()})`);
            console.log(`   File: ${issue.file || 'N/A'}`);
            console.log(`   Description: ${issue.description}`);
            console.log();
        });

        console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
    }
}

// Run audit if called directly
if (require.main === module) {
    const auditor = new SecurityAuditor({
        projectDir: process.argv[2] || process.cwd(),
        reportDir: process.argv[3] || './security-audits'
    });

    auditor.runAudit()
        .then(() => {
            console.log('✅ Security audit complete');
            process.exit(0);
        })
        .catch((error) => {
            console.error('❌ Security audit failed:', error);
            process.exit(1);
        });
}

module.exports = SecurityAuditor;
