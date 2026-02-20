# Agents Directory

This directory contains the main orchestrator agent and supporting agents for the OpenClaw system.

## Structure

```
agents/
├── README.md (this file)
└── dennis/
    ├── SOUL.md - Agent identity and personality
    ├── CAPABILITIES.md - What Dennis can do
    └── PROTOCOL.md - Communication and workflow
```

## Dennis - The Orchestrator 🎯

Dennis is the main orchestrator agent who receives tasks from the user and coordinates specialized sub-agents to complete them.

### How to Use Dennis

Simply address tasks to Dennis, and he will:
1. Analyze the task requirements
2. Route to the appropriate sub-agent(s)
3. Monitor progress
4. Synthesize results
5. Report back with findings

### Example Interactions

**Research Task:**
```
You: Dennis, research the AI tools market for small businesses
Dennis: I'll route this to Scout for market research and Researcher for deep analysis.
[Scout and Researcher work in parallel]
Dennis: Here's the comprehensive market research on AI tools for small businesses...
```

**Development Task:**
```
You: Dennis, design a user authentication system
Dennis: I'll assign this to Architect for system design and implementation.
[Architect designs and builds]
Dennis: Architect has designed the authentication system. Here are the specifications...
```

**Creative Task:**
```
You: Dennis, create ad copy for our new product
Dennis: I'll route this to Creative for copywriting.
[Creative generates copy]
Dennis: Here are several ad copy options for your product...
```

## Sub-Agents

Dennis coordinates 8 specialized sub-agents located in `/subagents/`:

| Agent | Purpose | Emoji |
|-------|---------|-------|
| Scout | Intelligence & research | 🕵️ |
| Architect | System design & code | 🏗️ |
| Auditor | Security & monitoring | 🔒 |
| Navigator | Browser automation | 🧭 |
| Researcher | Deep research | 📚 |
| Creative | Content & images | 🎨 |
| QA | Quality assurance | 🔧 |
| Outreach | Business development | 🤝 |

## Agent Communication

All communication flows through Dennis:

```
User → Dennis → Sub-Agent(s) → Dennis → User
```

Direct interaction with sub-agents is not recommended. Always route through Dennis for optimal task distribution and result synthesis.

## Integration

Dennis integrates with:
- **OpenClaw Tools:** exec, browser, web_search, etc.
- **Veritas Kanban:** Task tracking and management
- **Memory System:** Context retention and learning
- **All Sub-Agents:** Coordination and communication

## Getting Started

1. Read `DENNIS-AGENT-SYSTEM.md` for complete architecture
2. Review `agents/dennis/SOUL.md` for Dennis's identity
3. Check `subagents/` to understand each specialist
4. Start using Dennis by addressing him in conversation

## Architecture

See `DENNIS-AGENT-SYSTEM.md` for:
- Complete system architecture
- Agent specifications
- Task routing logic
- Communication protocols
- Implementation details

---

**Created:** 2026-02-20
**Version:** 1.0
**Status:** Production Ready
