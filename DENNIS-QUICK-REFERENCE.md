# Dennis Agent System - Quick Reference Guide

## 🎯 Quick Start

**Talk to Dennis like a colleague:**
- "Dennis, research the competition for [product]"
- "Dennis, design a database for [project]"
- "Dennis, test the checkout flow"
- "Dennis, create ad copy for [campaign]"

**Dennis handles the rest:**
1. Analyzes your request
2. Routes to best agent(s)
3. Monitors progress
4. Synthesizes results
5. Reports back with actionable insights

## 📋 Agent Cheat Sheet

| Need | Use Agent | For... |
|------|-----------|--------|
| Market research | Scout 🕵️ | Quick intelligence, competitors, pricing |
| System design | Architect 🏗️ | Architecture, APIs, databases, code |
| Security checks | Auditor 🔒 | Security audits, cron jobs, monitoring |
| Web automation | Navigator 🧭 | Scraping, forms, screenshots, testing |
| Deep research | Researcher 📚 | Academic sources, documentation, analysis |
| Creative work | Creative 🎨 | Images, copy, design concepts |
| Quality testing | QA 🔧 | Testing, code review, proofreading |
| Outreach campaigns | Outreach 🤝 | Lead gen, email sequences, sales |

## 🔄 Task Examples

### Research & Intelligence
```
"Dennis, Scout needs to find pricing for competitors in [market]"
"Dennis, Researcher should dive deep into [topic] for academic sources"
"Dennis, have Scout gather quick intel on [company]"
```

### Development & Architecture
```
"Dennis, Architect should design API endpoints for [feature]"
"Dennis, Architect needs to implement user authentication"
"Dennis, have Architect review this code for best practices"
```

### Security & Monitoring
```
"Dennis, Auditor should run security scan on our application"
"Dennis, Auditor needs to set up daily backup cron job"
"Dennis, Auditor, check system health and report issues"
```

### Web Operations
```
"Dennis, Navigator should scrape data from [website]"
"Dennis, Navigator needs to test checkout flow on our site"
"Dennis, have Navigator take screenshots of all landing pages"
```

### Content & Creative
```
"Dennis, Creative should generate product images"
"Dennis, Creative needs to write ad copy for [campaign]"
"Dennis, have Creative design concept for [brand]"
```

### Quality Assurance
```
"Dennis, QA should test the new feature across browsers"
"Dennis, QA needs to review this PR for issues"
"Dennis, have QA proofread this email campaign"
```

### Outreach & Sales
```
"Dennis, Outreach should create campaign for [product]"
"Dennis, Outreach needs to research 100 qualified leads"
"Dennis, have Outreach write cold email sequence"
```

## 💬 Conversation Patterns

### Simple Tasks (One Agent)
```
You: Dennis, [task description]
Dennis: I'll route this to [Agent]. [Agent] is working on it.
Dennis: [Agent] completed the task. Here are the results...
```

### Complex Tasks (Multiple Agents)
```
You: Dennis, [complex task]
Dennis: I'll coordinate multiple agents for this:
- [Agent 1] for [subtask 1]
- [Agent 2] for [subtask 2]
Dennis: Progress update: [Agent 1] is done, [Agent 2] is in progress...
Dennis: All tasks complete. Here's the synthesized report...
```

### Sequential Tasks
```
You: Dennis, first [task 1], then [task 2] based on results
Dennis: I'll have [Agent 1] do [task 1] first.
[Agent 1 completes]
Dennis: [Agent 1] finished. Now routing to [Agent 2] for [task 2].
[Agent 2 completes]
Dennis: Complete. Here are the final results...
```

## 🎨 Dennis's Personality

- **Decisive:** Routes tasks quickly and confidently
- **Organized:** Tracks all active tasks and progress
- **Communicative:** Keeps you updated on long tasks
- **Strategic:** Optimizes for efficiency and quality
- **Accountable:** Ensures tasks are completed well

## 📊 Progress Updates

Dennis provides automatic updates:

- **Quick tasks (<1 min):** Just the final result
- **Medium tasks (1-5 min):** One status update
- **Complex tasks (5-15 min):** Updates at 25%, 50%, 75%
- **Extended tasks (15+ min):** Updates every 5 minutes

## 🔍 What Dennis Can Do

### Task Routing
- Analyze task type and complexity
- Select best agent(s) for the job
- Handle multi-agent coordination
- Re-route if an agent fails

### Progress Monitoring
- Track agent status in real-time
- Detect and handle timeouts
- Escalate stuck tasks
- Ensure quality standards

### Result Synthesis
- Combine results from multiple agents
- Format for readability
- Highlight key findings
- Provide recommendations

## 🚫 What Dennis Cannot Do

- Direct code execution (uses Architect)
- Direct browser control (uses Navigator)
- Direct creative work (uses Creative)
- Physical actions
- Make decisions without user input for critical tasks

## 💡 Pro Tips

1. **Be Specific:** More details = better routing
2. **Set Context:** Share background information
3. **Define Success:** What does "done" look like?
4. **Ask for Options:** Request multiple approaches
5. **Provide Feedback:** Help Dennis learn your preferences

## 🎯 Best Practices

### DO:
- Address Dennis directly
- Provide clear requirements
- Share relevant context
- Ask questions if unsure
- Give feedback on results

### DON'T:
- Try to direct sub-agents yourself
- Micro-manage the process
- Expect instant results for complex tasks
- Skip Dennis for agent coordination
- Assume routing without confirming

## 📞 Getting Help

**Stuck? Just ask Dennis:**
- "Dennis, which agent should handle [task]?"
- "Dennis, what's the status of [task]?"
- "Dennis, can you explain why you routed to [agent]?"
- "Dennis, I'm not sure what I need, can you help?"

## 🔗 Related Files

- `DENNIS-AGENT-SYSTEM.md` - Complete architecture
- `agents/dennis/SOUL.md` - Dennis's identity
- `subagents/[agent]/SOUL.md` - Each sub-agent's details
- `agents/README.md` - Agents directory overview

---

**Version:** 1.0
**Created:** 2026-02-20
**Status:** Production Ready
