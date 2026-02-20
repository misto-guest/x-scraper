# Lessons Learned - Every Mistake, Documented Once

**Purpose:** Errors encountered and fixes applied. Lessons learned from mistakes. "Never do X again" type items. Best practices discovered.

**Last Updated:** 2026-02-20

---

## Sub-Agent Protocol (2026-02-09)

### Rule: Always Use Sub-Agents for Tasks > 3 Seconds
**Decision:** All tasks taking more than 3 seconds MUST use sub-agents.

**Why:**
- ✅ Parallel processing (multiple tasks at once)
- ✅ Smaller contexts (cheaper tokens)
- ✅ Main agent available immediately for new tasks
- ✅ Specialized expertise per task
- ✅ Auto-cleanup when done

**Examples:**
- ✅ **Good:** Spawn sub-agent for file creation (5s)
- ✅ **Good:** Spawn sub-agent for health checks (10s)
- ❌ **Bad:** Handle directly if it takes > 3 seconds

**Documentation:** See AGENTS.md → Sub-Agent Protocol section

---

## Web Development Stack Standardization (2026-02-16)

### Decision: Unified Stack for Maximum SEO + Design Quality

**Framework:** Astro.js 6.x
- Zero JavaScript by default (fastest Google indexing)
- Perfect Core Web Vitals (95+ Lighthouse scores)
- Static HTML = immediate crawler access

**Design:** Custom Components (No Themes)
- Themes create generic appearance
- Custom design = brand differentiation

**Styling:** Tailwind CSS 4.x
- Fast development with utility classes
- Define unique palettes (NOT default colors)

**Starter Template:** `/Users/northsea/clawd-dmitry/astro-blog-starter/`

**Why This Matters:**
- Better rankings (Core Web Vitals)
- Lower bounce rates (fast loading)
- 60% "Good" CWV vs 38% WordPress
- Scalable to 500+ sites

---

## Tool Integrations

### Chrome DevTools MCP (2026-02-16)

**Production Command:**
```bash
npx -y chrome-devtools-mcp@latest --headless --isolated --no-usage-statistics
```

**Use Cases:**
- Technical SEO audits at scale (500+ blogs)
- Backlink verification with screenshots
- Competitor intelligence gathering
- Local SEO/GMB monitoring
- Marketplace ranking services

**Integration Workflow:**
Veritas Kanban → Task → Dmitry → Chrome DevTools MCP → Data → Complete

---

## Deployment Lessons

### Railway API Limitations (2026-02-12)

**Issue:** Railway API cannot configure build settings (Root Directory, Dockerfile path)

**Solution:** ~30% manual work remains via Dashboard

**Takeaway:** Always document what requires manual intervention in deployment processes.

---

## Security Practices

### AdsPower Account Isolation (2026-02-17)

**Critical:** DO NOT login to rebel@rebelinternet.eu from other servers

**Why:** Account security for Bol.com outreach bot

**Best Practice:** Use dedicated accounts for automated tools with browser profile rotation

---

## OAuth vs Service Accounts

### Google Drive Upload (2026-02-17)

**Issue:** Service accounts don't work for My Drive

**Solution:** Use OAuth with personal Google account

**Files:** `/Users/northsea/clawd-dmitry/scripts/drive-uploader/`

**Setup:** One-time browser authorization, then automated uploads

**Max file size:** 100 MB

---

## Communication Protocols

### Group Chat Participation (From AGENTS.md)

**Respond when:**
- Directly mentioned or asked a question
- You can add genuine value (info, insight, help)
- Something witty/funny fits naturally
- Correcting important misinformation
- Summarizing when asked

**Stay silent when:**
- It's just casual banter between humans
- Someone already answered the question
- Your response would just be "yeah" or "nice"
- The conversation is flowing fine without you

**Rule:** Quality > quantity. If you wouldn't send it in a real group chat with friends, don't send it.

**Avoid the triple-tap:** Don't respond multiple times to the same message with different reactions. One thoughtful response beats three fragments.

---

## Memory Management

### Three-Layer Memory System (From AGENTS.md)

**1. Long-term Knowledge Graph (`knowledge/`)**
- Atomic facts in JSON format (queryable, indexed)
- PARA structure: Projects, Areas, Resources, Archives
- Auto-extracted from daily notes, decays over time
- ALWAYS load before answering questions

**2. Daily Notes (`memory/YYYY-MM-DD.md`)**
- Raw logs of what happened
- Source material for atomic fact extraction
- Never deleted, only referenced

**3. Tacit Knowledge (Split into 5 files)**
- `active-tasks.md` — Crash recovery, current work
- `lessons.md` — This file: Mistakes & learnings
- `self-review.md` — Agent self-critiques
- `projects.md` — Project states
- `memory/YYYY-MM-DD.md` — Daily logs (rotate weekly, keep 7 days)

**Key Rule:** "Mental notes" don't survive session restarts. Files do.

---

## File Operations

### Safety Rule: `trash` > `rm`

**Always use recoverable deletion:**
- `trash` command when available
- Backup before destructive operations
- Ask if uncertain

**Rationale:** Recoverable beats gone forever

---

## External Communications

### Ask Before Sending (From AGENTS.md)

**Always ask first:**
- Sending emails, tweets, public posts
- Anything that leaves the machine
- Anything uncertain

**Safe to do freely:**
- Read files, explore, organize, learn
- Search the web, check calendars
- Work within workspace

---

## Tool Usage Guidelines

### Every Skill Needs "Use When / Don't Use When"

**Added:** 2026-02-20

**Purpose:** Prevent misuse of tools by adding clear usage guidelines to all SKILL.md files

**Format:**
```markdown
## Use When
[Specific scenarios when this skill should be used]

## Don't Use When
[Scenarios when this skill should NOT be used - use alternative instead]

## Examples
**Good use case:** [example]
**Bad use case:** [example with what to use instead]
```

**Benefits:**
- Clearer tool selection
- Fewer errors
- Better user experience
- Easier onboarding for new skills

---

## QA Testing Best Practices

### Rule: Real Browser Testing, Not HTML Fetching

**Added:** 2026-02-20

**❌ BAD Practice:** Using `web_fetch` or `curl` for QA
```bash
# Only fetches HTML, misses runtime issues
web_fetch https://example.com
curl https://example.com
```

**Why it fails:**
- Only verifies HTML loads
- Doesn't test JavaScript execution
- Misses broken links (404s)
- Doesn't catch runtime errors
- No visual validation
- Misses CORS/network issues

**✅ GOOD Practice:** Real Chrome browser visit
```bash
# Use browser tool for actual QA
browser action=open targetUrl=https://example.com
browser action=screenshot
browser action=snapshot
```

**Why it works:**
- ✅ Tests actual user experience
- ✅ Catches broken links (404s)
- ✅ Validates JavaScript execution
- ✅ Detects CORS issues
- ✅ Visual screenshot verification
- ✅ Network request inspection
- ✅ Console error detection

**Example from Supalinks Dashboard:**
- ❌ `web_fetch` showed perfect HTML
- ✅ Real browser revealed all example links (`supalinks.cc/summer-sale`, etc.) are **404 broken**
- Mock data points to non-existent domains

**Rule:** Always QA with real Chrome browser. Never rely on HTML fetching alone.

**Documentation:** Update AGENTS.md → QA Testing section

---

### CRITICAL: Always Ask User "Does It Load Correctly?" After Browser QA

**Added:** 2026-02-20

**Mandatory Question:** After ANY browser-based QA, MUST ask user: **"Does it load correctly?"**

**Why:**
- Screenshot might look different on user's screen
- Browser extensions can interfere
- Responsive design issues not visible in single viewport
- User's eye catches issues agent misses
- Design perception is subjective

**Protocol:**
1. Open page in real Chrome browser
2. Take screenshot
3. Show screenshot to user
4. **ASK: "Does this load correctly for you?"**
5. Wait for user confirmation before marking QA complete

**Example from Supalinks Dashboard:**
- Agent thought: "Perfect Lighthouse scores, must be good"
- User saw: "DESIGN STILL SEEMS BROKEN TO ME!"
- Lesson: Agent cannot judge design quality alone - user must verify

**Rule:** Never assume QA is complete without user visual confirmation.

---
