# Projects - Current State of Every Project

**Purpose:** Project names and statuses. Key information about each project. Links to relevant docs/code.

**Last Updated:** 2026-03-03

---

## 🚀 Fly.io Deployments - LIVE (2026-03-03)

**Status:** ✅ 3 Apps Production Live

**Production URLs:**
- **Facebook Monetiser:** https://facebook-monetiser.fly.dev ✅
- **Twitter Monitor:** https://twitter-monitor.fly.dev ✅
- **Supalinks Dashboard:** https://supalinks-dashboard.fly.dev ✅

**Configuration:**
- **Provider:** Fly.io (Free Tier)
- **Region:** Amsterdam (ams)
- **Monthly Cost:** $0
- **Total Size:** ~1.7GB containers
- **Databases:** 3 SQLite with 1GB persistent volumes

**Deployment Pattern:**
```bash
flyctl launch --no-deploy --name app-name --region ams
flyctl deploy --remote-only
flyctl status --app app-name
```

**Documentation:**
- `memory/2026-03-03.md` - Complete deployment log
- `MEMORY.md` - Quick reference guide

---

## 🖥️ VPS Deployments - LIVE (2026-03-03)

**Status:** ✅ 1 App Installed

**VPS Details:**
- **IP:** 45.76.167.14
- **SSH:** `ssh bram_ai@45.76.167.14` (password: `bram_ai_2026_!zx`)
- **User:** bram_ai
- **App Directory:** `/opt/x-scraper`

**Production URLs:**
- **X Scraper:** http://45.76.167.14:5003 ✅
  - Purpose: Monitor @publisherinabox
  - Stack: Python Flask + Selenium + Chrome
  - Service: `systemctl status x-scraper`

**Existing Bots on VPS:**
- YouTube Tracker Bot
- Music Availability Tester Bot

**Documentation:**
- `memory/VPS-45.76.167.14.md` - Complete VPS guide
- `memory/2026-03-03.md` - Deployment steps

---

## 🗂️ Memory System Restructure (2026-02-20)

**Status:** ✅ Production Ready (Manual steps required)

**Production URLs:**
- **OpenClaw Gateway:** https://openclaw-[hash].up.railway.app
- **Web App:** https://web-[hash].up.railway.app
- **Watcher:** https://watcher-[hash].up.railway.app

**Railway Project:** clawe (Project ID: 3c382894-562f-444e-ba37-849dbcf25e26)

**Services:** openclaw ✅ | web ✅ | watcher ✅

**Configuration:**
- **ZAI_API_KEY:** 048bff5da3bf4ae09c4be014dcc1161b.0F2qbUTBqyrkSrPv
- **NEXT_PUBLIC_CONVEX_URL:** https://clawe.convex.cloud
- **OPENCLAW_PORT:** 18789
- **CONVEX_DEPLOYMENT:** production

**Dockerfile Paths:**
- openclaw: `docker/openclaw/Dockerfile`
- web: `docker/web/Dockerfile`
- watcher: `docker/watcher/Dockerfile`

**Manual Steps Remaining:** Configure build settings via Railway Dashboard (~5 minutes)

**Documentation:**
- `RAILWAY-QUICK-START.md`
- `RAILWAY_DEPLOYMENT-GUIDE.md`
- `RAILWAY_FINAL_REPORT.md`
- `memory/RAILWAY-DEPLOYMENT-SUMMARY.md`

---

## 🌐 Chrome DevTools MCP Integration (2026-02-16)

**Status:** ✅ Installed and Production-Ready

**Location:** System package via npx

**Installation:**
```bash
npx -y chrome-devtools-mcp@latest --headless --isolated --no-usage-statistics
```

**Capabilities:**
- Performance tracing & analysis (Core Web Vitals)
- Network request inspection
- Screenshots & page snapshots
- Console debugging & error detection
- Form filling & automation

**Business Use Cases:**
1. Technical SEO Audits (500+ blogs)
2. Backlink Verification
3. Competitor Intelligence
4. Local SEO/GMB Monitoring
5. Marketplace Ranking Services

**Integration Workflow:**
```
Veritas Kanban → Task → Dmitry → Chrome DevTools MCP → Data → Complete
```

**Documentation:**
- `/memory/CHROME-DEVTOOLS-MCP-INTTEGRATION.md`
- `/.clawdbot/scripts/chrome-devtools-test.sh`

---

## 🎨 Astro Blog Starter (2026-02-16)

**Status:** ✅ Production-Ready

**Location:** `/Users/northsea/clawd-dmitry/astro-blog-starter/`

**Purpose:** Standardized web development stack for 500-blog network

**Stack:**
- **Framework:** Astro.js 6.x (zero JS, fastest indexing)
- **Design:** Custom components (no themes)
- **Styling:** Tailwind CSS 4.x (unique palettes)

**Benefits:**
- 95+ Lighthouse scores out of the box
- 60% "Good" CWV vs 38% WordPress
- Static HTML = immediate crawler access
- Scalable to 500+ sites

**Documentation:** README.md (in project folder)

---

## 🤖 Bol.com Outreach Bot (2026-02-17)

**Status:** ✅ Complete (Setup required)

**Location:** `/Users/northsea/clawd-dmitry/bol-outreach-bot/`

**Purpose:** Automated outreach to Bol.com sellers with rate limiting and profile rotation

**Core Components:**
- AdsPower Client (Server: 77.42.21.134:50325)
- Rate Limiting: 5 messages/hour per profile
- Profile Rotation: Automatic cycling
- Message Variations: AI-powered rewriting
- Business Hours: 9AM-8PM Mon-Sat (GMT+1)

**Capacity:**
- Per profile: 5 messages/hour
- 3 profiles: 15 messages/hour
- Daily: 165 messages (11 hours × 15)
- Weekly: 990 messages (6 days × 165)

**Key Files:**
- `lib/adspower-client.ts` - AdsPower API client
- `lib/bol-outreach-bot-enhanced.ts` - Main bot
- `lib/rate-limiter.ts` - Per-profile rate limiting
- `lib/profile-rotator.ts` - Profile cycling
- `lib/message-variator.ts` - AI message variations
- `lib/time-window-checker.ts` - Business hours

**Setup:**
```bash
npm run list-profiles  # Get profile IDs
npm run start:enhanced  # Run bot
```

**Cron Job:**
```bash
0 9-20 * * 1-6 cd /Users/northsea/clawd-dmitry/bol-outreach-bot && npm run start:enhanced
```

**Documentation:** `README.md`, `ENHANCED-FEATURES.md`, `QUICK-START-ENHANCED.md`, `VERIFICATION.md`

---

## 📚 SEO Backlinks Search (Existing)

**Status:** ✅ Active

**Location:** `/Users/northsea/clawd-dmitry/seo-backlinks-search/`

**Data:**
- **Master DB:** `data/master-urls.json` (169 URLs)
- **Total unique results:** 80 URLs
- **Filtering:** Excluded Dutch sites, crypto/gambling, price comparisons

**Queries Used:**
1. "seo link building services"
2. "backlink indexer tools"
3. "guest posting services SEO"
4. "blogger outreach link building"
5. "white hat backlinks service"

**Integration:** Use OAuth uploader for monthly exports

---

## 🗂️ Memory System Restructure (2026-02-20)

**Status:** 🔄 In Progress

**Purpose:** Split MEMORY.md into 5 focused files for better organization

**New Structure:**
1. **active-tasks.md** — Crash recovery, current work
2. **lessons.md** — Mistakes & learnings
3. **self-review.md** — Agent self-critiques
4. **projects.md** — This file: Project states
5. **memory/YYYY-MM-DD.md** — Daily logs (rotate weekly, keep 7 days)

**Benefits:**
- Faster crash recovery
- Easier to find specific information
- Clearer separation of concerns
- Better maintainability

**Status:** Files created, skill updates in progress

---

## 📝 Skill Usage Guidelines (2026-02-20)

**Status:** 🔄 In Progress

**Purpose:** Add "Use When / Don't Use When" to all 54 SKILL.md files

**Scope:**
- `/opt/homebrew/lib/node_modules/openclaw/skills/` (51 skills)
- `~/.agents/skills/` (3 skills)

**Format:**
```markdown
## Use When
[Specific scenarios]

## Don't Use When
[Scenarios + alternatives]

## Examples
**Good use case:** [example]
**Bad use case:** [example + alternative]
```

**Benefits:**
- Clearer tool selection
- Fewer errors
- Better user experience

---

## 🔗 Supalinks 2.0 Dashboard (2026-02-20)

**Status:** ✅ Complete (Production-Ready)

**Location:** `/Users/northsea/clawd-dmitry/supalinks-dashboard/`

**Purpose:** Modern link management dashboard (Firebase Dynamic Links alternative)

**Stack:**
- **Framework:** Astro.js 4.16.17
- **Styling:** Tailwind CSS 3.4.17
- **Components:** React 19 + @astrojs/react
- **Icons:** Lucide React
- **Language:** TypeScript (strict mode)

**Features:**
- Dashboard with overview stats
- Links management (create, edit, delete)
- Analytics dashboard with visualizations
- Custom domain management
- Campaign organization
- Responsive design (mobile/tablet/desktop)

**Pages:**
- `/` - Dashboard home
- `/links` - Link management table
- `/analytics` - Performance analytics
- `/domains` - Custom domain configuration
- `/campaigns` - Campaign management

**Build Results:**
- ✅ TypeScript Check: 0 errors
- ✅ Build Success: 5 pages in 828ms
- ✅ Client Bundle: 193.59 kB (60.53 kB gzipped)
- ✅ Dev Server: Starts in 187ms

**Documentation:**
- `SUPALINKS-2.0-COMPLETION-REPORT.md` (in workspace root)
- `README.md` (in project folder)

**Task:** `task_20260220_o6Q8r3` (in Veritas Kanban)

---

## 🎯 z.ai Integration

**Status:** ✅ Configured

**Provider:** z.ai
**API Key:** 048bff5da3bf4ae09c4be014dcc1161b.0F2qbUTBqyrkSrPv
**Backend:** Convex (https://clawe.convex.cloud)

**All Clawe services configured for z.ai integration.**

---

## Archive Policy

Projects marked "Complete" move to archive after 6 months of inactivity unless they:
- Have ongoing maintenance requirements
- Are referenced frequently
- Serve as templates for new projects

**Archive location:** `projects/archive/`
