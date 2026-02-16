# Skills Analysis Report

**Analysis Date:** 2025-02-11  
**Skills Analyzed:** 56 total (1 user workspace + 55 core)  
**Scope:** `/Users/northsea/clawd-dmitry/skills/` and `/opt/homebrew/lib/node_modules/clawdbot/skills/`

---

## Executive Summary

### Findings Overview
- ✅ **All skills have SKILL.md files** (100% compliance)
- ⚠️ **3 skills missing frontmatter metadata** (critical)
- ⚠️ **12 skills with vague descriptions needing improvement**
- ℹ️ **Multiple skills with embedded examples that could be separated**
- ℹ️ **Opportunities for negative examples across several skills**

### Skills by Category

**Critical Issues:**
1. **canvas** - No frontmatter metadata (name/description)
2. **coding-agent** - No frontmatter metadata (critical given complexity)
3. **tmux** - No frontmatter metadata

**High Priority Improvements:**
1. **bluebubbles** - Procedural description, not trigger-based
2. **github** - Too brief, doesn't explain when to use
3. **frontend-design** - No examples of what NOT to do
4. **oracle** - Good but could add negative examples
5. **local-places** - Missing clear use cases

---

## Detailed Findings by Skill

### 1. qa-analyst (User Workspace)
**Status:** ✅ Excellent  
**Description Quality:** Comprehensive with clear sections  
**Recommendations:** None - this is well-structured and serves as a good example for others

### 2. 1password
**Status:** ✅ Good  
**Frontmatter:** Clear "Use when" clause in description  
**Recommendations:** None - good balance of specificity and guidance

### 3. ai-sdk
**Status:** ✅ Excellent  
**Frontmatter:** Very detailed with specific triggers numbered (1-4)  
**Recommendations:** None - excellent frontmatter sets a gold standard  
**Note:** Could separate the many "Common Errors" examples into `references/common-errors.md` to keep SKILL.md leaner, but current approach works

### 4. apple-notes
**Status:** ✅ Good  
**Frontmatter:** Clear purpose statement  
**Recommendations:** None

### 5. apple-reminders
**Status:** ✅ Good  
**Frontmatter:** Clear functional description  
**Recommendations:** None

### 6. bear-notes
**Status:** ✅ Good  
**Frontmatter:** Clear functional description  
**Recommendations:** None

### 7. bird
**Status:** ✅ Good  
**Frontmatter:** Clear functional description with tool reference  
**Recommendations:** Could add "Use when vs Don't use when" for posting vs browser automation

### 8. blogwatcher
**Status:** ⚠️ Adequate  
**Frontmatter:** Minimal but functional  
**Recommendations:** Add "Use when: tracking RSS feeds over time. Don't use for: one-time article checks"

### 9. blucli
**Status:** ⚠️ Minimal  
**Frontmatter:** Very brief  
**Recommendations:** Expand description to clarify "BluOS/NAD speaker control" vs generic audio

### 10. bluebubbles ⚠️
**Status:** ⚠️ Needs Improvement  
**Issue:** Description is procedural ("Build or update...") not trigger-based  
**Recommendation:** Rewrite description as: "Build, test, or maintain the BlueBubbles channel plugin for Clawdbot. Use when: working on BlueBubbles integration, debugging webhook delivery, updating REST helpers, or extending channel functionality."  
**Priority:** High - current description doesn't help agents know when to use this skill

### 11. canvas ❌
**Status:** ❌ CRITICAL - No frontmatter  
**Issue:** Missing `name` and `description` in YAML frontmatter entirely  
**Impact:** Agents cannot discover or load this skill properly  
**Recommendation:** Add frontmatter:
```yaml
---
name: canvas
description: Display HTML content on connected Clawdbot nodes (Mac app, iOS, Android). Use when: presenting web-based dashboards, games, visualizations, or interactive demos on node devices, or navigating/capturing canvas content.
---
```
**Priority:** Critical - skill is broken without this

### 12. clawdhub
**Status:** ✅ Good  
**Frontmatter:** Clear purpose with "Use when" clause  
**Recommendations:** None

### 13. coding-agent ❌
**Status:** ❌ CRITICAL - No frontmatter  
**Issue:** Missing `name` and `description` in YAML frontmatter entirely  
**Impact:** Agents cannot discover this complex skill, yet it's crucial for development workflows  
**Recommendation:** Add frontmatter:
```yaml
---
name: coding-agent
description: Run Codex CLI, Claude Code, OpenCode, or Pi Coding Agent via background process for programmatic control. Use when: user asks Codex/Claude Code to build/edit/review code, when orchestrating parallel agents, or when PTY-based terminal automation is required for coding tasks.
---
```
**Priority:** Critical - this is a high-value skill that's currently undiscoverable

### 14. discord
**Status:** ✅ Good  
**Frontmatter:** Clear "Use when you need to control Discord"  
**Recommendations:** None - good balance

### 15. eightctl
**Status:** ⚠️ Minimal  
**Frontmatter:** Very brief functional description  
**Recommendations:** Add "Use when: controlling Eight Sleep pod temperature, alarms, or schedules"

### 16. food-order
**Status:** ✅ Excellent  
**Frontmatter:** Clear with safety triggers and "Never confirm" guardrail  
**Recommendations:** None - excellent example of safety guidance  
**Note:** Could benefit from negative example showing incorrect order flow

### 17. frontend-design
**Status:** ⚠️ Needs Improvement  
**Issue:** Lots of "NEVER use" guidance but no positive/negative code examples  
**Recommendations:** Add "Negative Examples" section showing:
```markdown
## What to Avoid (Negative Examples)

❌ Generic AI aesthetic:
```html
<!-- DON'T: Cliched purple gradient -->
<div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%)">
  <h1 style="font-family: Inter, sans-serif">Welcome</h1>
</div>
```

✅ Distinctive design:
```html
<!-- DO: Brutalist with unexpected layout -->
<div style="background: #000; border: 4px solid #ff0; transform: skewY(-2deg)">
  <h1 style="font-family: 'Space Grotesk'">WELCOME</h1>
</div>
```
```
**Priority:** Medium - visual examples would be very helpful

### 18. gemini
**Status:** ⚠️ Minimal  
**Frontmatter:** Very brief  
**Recommendations:** Add "Use when: one-shot Q&A, summarization, or quick generation. Don't use for: interactive sessions"

### 19. gifgrep
**Status:** ⚠️ Adequate  
**Frontmatter:** Clear function but no "when to use"  
**Recommendations:** Add "Use when: searching for GIFs (Tenor/Giphy), browsing interactively, or extracting stills/sheets. Don't use for: video editing or GIF creation"

### 20. github ⚠️
**Status:** ⚠️ Too Brief  
**Issue:** Description says "Interact with GitHub using the `gh` CLI" but doesn't explain WHEN to use this skill  
**Recommendation:** Expand description: "Use when: checking PR/CI status, viewing workflow runs, querying GitHub API for advanced data, or managing issues/PRs. Don't use for: git operations (use git CLI directly)."  
**Priority:** Medium - functional but unclear scope

### 21. gog
**Status:** ✅ Good  
**Frontmatter:** Clear functional description  
**Recommendations:** None

### 22. goplaces
**Status:** ✅ Good  
**Frontmatter:** Clear with "Use for" clause  
**Recommendations:** None

### 23. himalaya
**Status:** ✅ Good  
**Frontmatter:** Detailed with quoted description  
**Recommendations:** None

### 24. imsg
**Status:** ✅ Good  
**Frontmatter:** Clear functional description  
**Recommendations:** None

### 25. local-places ⚠️
**Status:** ⚠️ Needs Improvement  
**Issue:** Description says "Search for places" but doesn't clarify it's a local proxy  
**Recommendation:** Expand description: "Search for nearby places (restaurants, cafes, etc.) via local Google Places API proxy on localhost. Use when: user needs place recommendations, location-based search, or business lookup with filters (rating, open now, price). Requires GOOGLE_PLACES_API_KEY."  
**Priority:** Medium - could be confused with goplaces

### 26. mcporter
**Status:** ⚠️ Adequate  
**Frontmatter:** Clear but dense  
**Recommendations:** Consider separating example calls into `references/examples.md` - would reduce SKILL.md length significantly

### 27. model-usage
**Status:** ⚠️ Adequate  
**Frontmatter:** Clear trigger description  
**Recommendations:** None - functional for niche use case

### 28. nano-banana-pro
**Status:** ✅ Good  
**Frontmatter:** Clear functional description  
**Recommendations:** None

### 29. nano-pdf
**Status:** ⚠️ Adequate  
**Frontmatter:** Very brief  
**Recommendations:** Add "Use when: editing PDF pages with natural language instructions. Don't use for: PDF creation from scratch"

### 30. notion
**Status:** ✅ Good  
**Frontmatter:** Clear functional description  
**Recommendations:** None - comprehensive body makes up for brief frontmatter

### 31. obsidian
**Status:** ✅ Good  
**Frontmatter:** Clear functional description  
**Recommendations:** None

### 32. openai-image-gen
**Status:** ⚠️ Could Be Better  
**Issue:** Explains what it does but not when NOT to use (cost/rate limits)  
**Recommendation:** Add "Don't use when: budget constraints, rate limit concerns, or when openai-whisper-api would be sufficient"

### 33. openai-whisper
**Status:** ✅ Good  
**Frontmatter:** Clear functional description  
**Recommendations:** None

### 34. openai-whisper-api
**Status:** ✅ Good  
**Frontmatter:** Clear functional description  
**Recommendations:** None

### 35. openhue
**Status:** ✅ Good  
**Frontmatter:** Clear functional description  
**Recommendations:** None

### 36. oracle
**Status:** ✅ Excellent  
**Frontmatter:** Comprehensive "best practices" description  
**Recommendations:** Consider adding "Common Pitfalls" section with negative examples of what NOT to do (e.g., including secrets, choosing wrong file set, re-running instead of reattaching)

### 37. ordercli
**Status:** ✅ Good  
**Frontmatter:** Clear functional description  
**Recommendations:** None

### 38. peekaboo
**Status:** ✅ Good  
**Frontmatter:** Clear with safety warning  
**Recommendations:** None - good "requires permissions" clarity

### 39. qmd ⚠️
**Status:** ⚠️ Vague Description  
**Issue:** "Local hybrid search" doesn't explain when to use vs other search tools  
**Recommendation:** Rewrite description as: "Fast local search for Markdown notes and docs. Use when: searching personal knowledge base, finding related notes, or retrieving documents. Prefer `qmd search` (BM25 keyword) by default. Use `qmd vsearch` (semantic) only when keyword search fails. Don't use for: code search or web search."  
**Priority:** High - default behavior preference is important

### 40. sag
**Status:** ⚠️ Could Be Better  
**Issue:** No clarification of when NOT to use  
**Recommendation:** Add "Don't use for: long-form content without breaks, when ElevenLabs API is down, or for TTS where sherpa-onnx-tts (offline) is preferred"

### 41. session-logs
**Status:** ✅ Good  
**Frontmatter:** Clear trigger description  
**Recommendations:** None

### 42. sherpa-onnx-tts
**Status:** ⚠️ Minimal Description  
**Issue:** Doesn't clarify it's OFFLINE vs sag (cloud)  
**Recommendation:** Expand description: "Local offline text-to-speech via sherpa-onnx (no cloud, no API key). Use when: privacy needed, no internet, or offline TTS is required. Don't use when: cloud TTS (sag) is available and acceptable."  
**Priority:** Medium - important distinction from sag

### 43. skill-creator
**Status:** ✅ Excellent  
**Frontmatter:** Clear functional description  
**Recommendations:** None - comprehensive guide serves skill well

### 44. slack
**Status:** ✅ Good  
**Frontmatter:** Clear "Use when you need to control Slack"  
**Recommendations:** None

### 45. songsee
**Status:** ⚠️ Minimal  
**Frontmatter:** Very brief  
**Recommendations:** Add "Use when: generating spectrograms or feature-panel visualizations from audio files"

### 46. sonoscli
**Status:** ⚠️ Minimal  
**Frontmatter:** Very brief  
**Recommendations:** Add "Use when: controlling Sonos speakers on local network (play/pause, volume, grouping, favorites)"

### 47. spotify-player
**Status:** ✅ Good  
**Frontmatter:** Clear with preferences noted  
**Recommendations:** None

### 48. summarize
**Status:** ✅ Excellent  
**Frontmatter:** Excellent "When to use" with specific trigger phrases  
**Recommendations:** None - great example of clear triggers

### 49. things-mac
**Status:** ✅ Good  
**Frontmatter:** Clear "Use when" clause  
**Recommendations:** None

### 50. tmux ❌
**Status:** ❌ CRITICAL - No frontmatter  
**Issue:** Missing `name` and `description` in YAML frontmatter entirely  
**Impact:** Agents cannot discover this important skill for managing interactive sessions  
**Recommendation:** Add frontmatter:
```yaml
---
name: tmux
description: Remote-control tmux sessions for interactive CLIs by sending keystrokes and scraping pane output. Use when: you need a persistent TTY for interactive applications (e.g., coding agents, REPLs) or when orchestrating multiple long-running CLI sessions. Don't use when: exec background mode would suffice for non-interactive tasks.
---
```
**Priority:** Critical - important infrastructure skill is undiscoverable

### 51. trello
**Status:** ⚠️ Adequate  
**Frontmatter:** Clear functional description  
**Recommendations:** None - functional for its purpose

### 52. video-frames
**Status:** ⚠️ Adequate  
**Frontmatter:** Clear functional description  
**Recommendations:** None

### 53. voice-call
**Status:** ✅ Good  
**Frontmatter:** Clear functional description  
**Recommendations:** None

### 54. wacli
**Status:** ✅ Excellent  
**Frontmatter:** Excellent with "Do NOT use when" safety guidance  
**Recommendations:** None - perfect example of safety guardrails

---

## Cross-Cutting Recommendations

### 1. Negative Examples

Several skills would benefit from explicit "What NOT to do" sections:

**High Priority:**
- **frontend-design** - Show generic vs distinctive code side-by-side
- **oracle** - Common pitfalls (secrets, wrong file sets, re-running)
- **food-order** - Show incorrect reorder flow without confirmation
- **tmux** - Show when NOT to use (simple exec would be better)
- **coding-agent** - Show what happens without PTY mode (hangs)

**Medium Priority:**
- **1password** - Show insecure secret handling
- **github** - Show when to use git CLI vs gh CLI
- **qmd** - Show when each search mode is appropriate

### 2. Separation of Embedded Examples

Skills with extensive embedded examples that should be split into `references/`:

**High Priority:**
- **coding-agent** - All the Codex/Claude Code examples should move to `references/`
- **discord** - Action examples should move to `references/actions.md`
- **ai-sdk** - Common errors already separated (good!), but more examples could be
- **bluebubbles** - Code snippets could be `references/internals.md`

**Medium Priority:**
- **mcporter** - Example calls → `references/examples.md`
- **himalaya** - Configuration examples → `references/config-examples.md`
- **oracle** - Golden path examples → `references/workflows.md`

### 3. Description Quality

**Skills needing clearer "Use when vs Don't use when":**
1. **canvas** - Add frontmatter first, then clarify use cases
2. **coding-agent** - Add frontmatter first, then clarify PTY requirement
3. **tmux** - Add frontmatter first, then clarify interactive vs background
4. **bluebubbles** - Rewrite from procedural to trigger-based
5. **github** - Clarify when to use vs git CLI
6. **qmd** - Clarify search mode preferences
7. **local-places** - Clarify it's a proxy, not direct API
8. **frontend-design** - Emphasize "production-grade" aspect

### 4. Frontmatter Completeness

**Missing frontmatter entirely (CRITICAL):**
1. **canvas** - Add name + description
2. **coding-agent** - Add name + description  
3. **tmux** - Add name + description

---

## Action Items by Priority

### 🔴 Critical (Fix Immediately)
1. Add frontmatter to **canvas** skill
2. Add frontmatter to **coding-agent** skill
3. Add frontmatter to **tmux** skill

### 🟠 High Priority (This Week)
1. Rewrite **bluebubbles** description to be trigger-based
2. Expand **github** description with "Use when" guidance
3. Improve **qmd** description to clarify search mode preferences
4. Expand **local-places** description to clarify it's a proxy
5. Add negative examples to **frontend-design**

### 🟡 Medium Priority (This Sprint)
1. Add "Use when" guidance to skills marked "minimal"
2. Separate embedded examples into `references/` for bloated skills
3. Add negative examples to oracle, food-order, coding-agent
4. Clarify sherpa-onnx-tts offline vs sag cloud distinction

### 🟢 Low Priority (Backlog)
1. Review all skills for consistency in "Use when" phrasing
2. Create standard frontmatter template for reference
3. Add negative examples where they would provide value

---

## Best Practices Observed

### Examples to Emulate

**Excellent Frontmatter:**
- **ai-sdk** - Detailed with numbered triggers
- **summarize** - Clear "When to use" with trigger phrases
- **wacli** - Explicit "Do NOT use when" guidance
- **food-order** - Safety guardrails integrated into description

**Excellent Structure:**
- **qa-analyst** - Clear sections, comprehensive framework
- **skill-creator** - Progressive disclosure, well-organized
- **coding-agent** (body) - Comprehensive despite missing frontmatter

**Excellent Safety:**
- **wacli** - Explicit safety boundaries
- **food-order** - "Never confirm without explicit approval"
- **1password** - Guardrails for secret handling

---

## Conclusion

Overall skill quality is high with 100% SKILL.md compliance. The main issues are:

1. **3 critical skills missing frontmatter** - These are effectively broken for agent discovery
2. **~20% of skills have vague descriptions** - Would benefit from clearer "Use when" guidance
3. **Several skills with embedded examples** - Could be more efficient with `references/` separation
4. **Opportunity for more negative examples** - Would prevent common mistakes

**Recommended immediate action:** Fix the 3 skills missing frontmatter (canvas, coding-agent, tmux) as these are critical infrastructure that agents cannot currently discover.

---

**Report generated by:** skill-analysis subagent  
**Session:** agent:dmitry:subagent:3ac8cf6e-65ef-4638-8742-10dfe3e8fdb3
