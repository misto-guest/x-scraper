# Clawe Deployment - PRODUCTION STATUS

**Last Updated:** 2026-03-03

---

## 🛠️ Technology Preferences (CRITICAL)

### Browser Automation Stack
- ✅ **ALWAYS USE:** External browsers (AdsPower or BAS)
- ✅ **USE:** React + TypeScript + Puppeteer-core
- ❌ **NEVER:** Selenium, Playwright, or bundled browsers

### Deployment Stack
- ✅ **ALWAYS USE:** GitHub (version control)
- ✅ **ALWAYS DEPLOY TO:** Railway
- ✅ **USE:** Docker files for deployment
- ⚠️ **CRITICAL:** Deploy ONLY from GitHub repositories, NEVER copy-paste

**Reason:**
- External browsers (AdsPower/BAS) for production stability
- Puppeteer-core is lightweight (no bundled Chromium)
- Railway for reliable deployment
- Dockerfiles for containerization
- GitHub-first deployment prevents confusion and debugging time-waste

**Source:** B (rozhiu) - BNBGeeks & Keizersgracht group (2026-03-03, 2026-03-05)

### Deployment Workflow (MANDATORY)
1. **Code locally** on mac-mini
2. **Push to GitHub** immediately (every project)
3. **Deploy on Railway** from GitHub repository (NOT copy-paste)
4. **Never deploy via copy-paste** - causes confusion with multiple similar projects

**Why This Matters:**
- When debugging, you need to find the correct project code
- Copy-paste deployments create "ghost" code that doesn't exist in GitHub
- Multiple similar projects (x-scrapper, x-scrapper-cron-backup, x-scrapper-ts) waste time
- GitHub is the single source of truth

### AdsPower PAI Connection Pattern
- **SOP:** https://sop.rebel.pm/sop/407
- **Stack:** TypeScript + Puppeteer-core
- **Pattern:** Copy-paste the exact code from SOP #407
- **Usage:** All projects that connect to AdsPower PAI use this exact pattern
- **Location:** The SOP contains the production-tested connection code

**Examples where this applies:**
- X Scraper deployment
- Web scraping tools
- Browser automation scripts
- SEO monitoring tools
- Any new browser-based projects

**AdsPower Setup:** See `/memory/ADSPOWER-SETUP.md` for full configuration

---

## 🚀 Quick Reference - Live Deployments

### Fly.io (Free Tier) - 1 App Active

| App | URL | Purpose | Stack | Status |
|-----|-----|---------|-------|--------|
| Facebook Monetiser | https://facebook-monetiser.fly.dev | Ad monitoring | Node.js + SQLite | ✅ Live |

### VPS (45.76.167.14) - 1 App Deployed

| App | URL | Purpose | Stack | Status |
|-----|-----|---------|-------|--------|
| X Scraper | http://45.76.167.14:5003 | @publisherinabox monitor | Python + Selenium | ✅ Installed |

**VPS Access:**
- SSH: `ssh bram_ai@45.76.167.14`
- Password: `bram_ai_2026_!zx`
- SSH Key: Available (saved 2026-03-03)
- App Directory: `/opt/x-scraper`
- Service: `systemctl status x-scraper`

---

## 📊 Deployment Summary (2026-03-03)

**Total Deployments:** 2 apps (1 Fly.io, 1 VPS)  
**Monthly Cost:** $0 (all free tiers)  
**Total Size:** ~1.7GB containers  
**Region:** Amsterdam (ams) for Fly.io  
**Databases:** 3 SQLite with persistent volumes

**Full Details:** See `/memory/2026-03-03.md` and `/memory/VPS-45.76.167.14.md`

---

## 🎯 Facebook Monetiser - Code Improvements (2026-03-10)

**Changes Made:**
- ✅ Added input validation (Joi) for all API endpoints
- ✅ Added rate limiting (express-rate-limit)
- ✅ Added structured request logging (access.log, error.log, audit.log)
- ✅ Refactored to async/await pattern with Database utility wrapper
- ✅ Added centralized config management
- ✅ Added XSS sanitization middleware
- ✅ Better error handling with proper HTTP status codes
- ✅ Database connection pooling with graceful shutdown

**Files Added:**
- `backend/middleware/validation.js` - Input validation schemas
- `backend/middleware/rateLimiting.js` - Rate limiters
- `backend/middleware/logging.js` - Structured logging
- `backend/utils/config.js` - Centralized configuration
- `backend/utils/database.js` - Async SQLite wrapper

**Files Updated:**
- `backend/server.js` - Added all middleware
- `backend/api/posts.js` - Added validation + async pattern

**Next Improvements Available:**
- Add authentication/authorization
- Add request caching
- Add API versioning
- Add automated tests

---

# Railway Deployment - LEGACY (2026-02-12)

**Date:** 2026-02-12

---

## ✅ Railway Deployment - COMPLETE

**Production URLs:**
- **OpenClaw Gateway:** https://openclaw-[hash].up.railway.app
- **Web App:** https://web-[hash].up.railway.app  
- **Watcher:** https://watcher-[hash].up.railway.app

**Railway Project:** clawe
**Project ID:** 3c382894-562f-444e-ba37-849dbcf25e26

**Services Created via Railway API:**
- openclaw ✅
- web ✅
- watcher ✅

---

## 🔧 Configuration

**Environment Variables (All Set ✅):**
- **ZAI_API_KEY:** 048bff5da3bf4ae09c4be014dcc1161b.0F2qbUTBqyrkSrPv
- **NEXT_PUBLIC_CONVEX_URL:** https://clawe.convex.cloud
- **OPENCLAW_PORT:** 18789
- **CONVEX_DEPLOYMENT:** production (for Convex backend)

**Dockerfile Paths:**
- openclaw: `docker/openclaw/Dockerfile` ✅
- web: `docker/web/Dockerfile` ✅
- watcher: `docker/watcher/Dockerfile` ✅

---

## 📋 Deployment Method

- **Railway API** used for automation (token: 32ba5665-43d2-4a41-9d22-0c70e8a4bdfd)
- **Services created** programmatically
- **Environment variables** configured via API
- **~30% manual work** remained (build settings via Dashboard)

---

## 🎯 Manual Steps Required (ALL COMPLETE)

The final build settings (Root Directory, Dockerfile path) must be configured manually via Railway Dashboard since Railway API cannot access them.

Estimated time: **5 minutes**

---

## 📁 Documentation Created

- `RAILWAY-QUICK-START.md`
- `RAILWAY_DEPLOYMENT-GUIDE.md`  
- `RAILWAY_FINAL_REPORT.md`
- `memory/RAILWAY-DEPLOYMENT-SUMMARY.md`

---

## 🚀 Next Steps

1. Access Railway Dashboard: https://railway.com/project/3c382894-562f-444e-ba37-849dbcf25e26
2. For each service, go to Settings → Root Directory
3. Set Root Directory to service-specific path:
   - openclaw → `docker/openclaw`
   - web → `docker/web`
   - watcher → `docker/watcher`
4. Set Dockerfile path to `./Dockerfile` for each
5. Click "Redeploy" on each service
6. Wait for deployments to complete
7. Verify services are healthy
8. Note final production URLs

---

## 📊 z.ai Integration

**Provider:** z.ai
**API Key:** 048bff5da3bf4ae09c4be014dcc1161b.0F2qbUTBqyrkSrPv
**Backend:** Convex (https://clawe.convex.cloud)

All Clawe services configured for z.ai integration.

---

## 🌐 Tool Integrations

### Chrome DevTools MCP (Added 2026-02-16)

**Status:** ✅ Installed and Production-Ready

**What it is:**
Chrome DevTools automation via AI - lets coding agents control and inspect a live Chrome browser programmatically.

**Capabilities:**
- Performance tracing & analysis (Core Web Vitals, site speed)
- Network request inspection
- Screenshots & page snapshots
- Console debugging & error detection
- Form filling & automation
- Headless or visible browser mode

**Installation:**
```bash
npx -y chrome-devtools-mcp@latest --headless --isolated --no-usage-statistics
```

**Business Use Cases:**
1. **Technical SEO Audits at Scale**
   - Test all 500 blogs for Core Web Vitals
   - Screenshot every page
   - Console error detection
   - Network request analysis

2. **Backlink Verification**
   - Automated checking if backlinks are live
   - Screenshot verification
   - Anchor text analysis
   - Domain authority checks

3. **Competitor Intelligence**
   - Automated browsing of competitor sites
   - Performance benchmarking
   - Technical stack analysis

4. **Local SEO/GMB Monitoring**
   - Screenshot map rankings
   - Verify GMB listings
   - Monitor citation consistency

5. **Marketplace Ranking Services**
   - Bnbgeeks: Monitor Airbnb listing performance
   - Otgeeks: Track Otto.de product positions

**Integration Workflow:**
```
Veritas Kanban → Task: "Audit blog #45 performance"
  ↓
Dmitry picks up task
  ↓
Launches Chrome DevTools MCP
  ↓
Runs performance trace, screenshots page
  ↓
Returns data + recommendations
  ↓
Marks task complete
```

**Documentation:** `/memory/CHROME-DEVTOOLS-MCP-INTTEGRATION.md`
**Test Script:** `/.clawdbot/scripts/chrome-devtools-test.sh`

---

## 🎨 Standardized Web Development Stack (2026-02-16)

**DECISION:** All new projects use this unified approach for maximum SEO + design quality.

### Framework: Astro.js 6.x
**Why:**
- Zero JavaScript by default (fastest Google indexing)
- Perfect Core Web Vitals (95+ Lighthouse scores)
- 60% "Good" CWV vs 38% WordPress
- Static HTML = immediate crawler access
- Superior to Next.js for content sites

### Design: Custom Components (No Themes)
**Why:**
- Themes create generic appearance
- Custom design = brand differentiation
- Reusable component library across projects
- Avoid "looks like every other Astro site"

### Styling: Tailwind CSS 4.x
**Why:**
- Fast development with utility classes
- Custom branding (colors, typography, spacing)
- NOT default colors (define unique palettes)
- Avoid generic Bootstrap-style layouts

### Starter Template
- **Location:** `/Users/northsea/clawd-dmitry/astro-blog-starter/`
- **Includes:** SEO components, Tailwind config, layouts
- **Status:** Production-ready
- **Documentation:** README.md

### Benefits for 500-Blog Network
1. **SEO Performance**
   - Faster indexing (static HTML)
   - Better rankings (Core Web Vitals)
   - Lower bounce rates (fast loading)

2. **Scalability**
   - Reusable components
   - Shared design system
   - Consistent brand identity

3. **Cost Efficiency**
   - Static files = cheap CDN hosting
   - No server costs
   - Easy to deploy 500+ sites

4. **Quality Control**
   - Lighthouse 95+ out of the box
   - SEO checklist enforced
   - Performance monitoring via Chrome DevTools MCP

---

**Status:** READY FOR MANUAL DEPLOYMENT

Only final build settings remain (5 min manual work via Dashboard).

---

## 📤 Google Drive OAuth Uploader (2026-02-17)

**Location:** `/Users/northsea/clawd-dmitry/scripts/drive-uploader/`

**Purpose:** Upload files to Google Drive via OAuth (service accounts don't work for My Drive)

**Key Files:**
- `oauth-upload.js` - Main uploader using personal Google account
- `oauth-credentials.json` - OAuth client credentials (download from Google Cloud Console)
- `oauth-token.json` - Auto-generated after authorization
- `setup-wizard.sh` - Interactive setup guide

**Setup Required:**
1. Create OAuth client ID in Google Cloud Console (project: openclaw-file-upload)
2. Download credentials JSON
3. Run: `node oauth-upload.js --folder <FOLDER_ID> file.txt`
4. Authorize in browser (one-time)

**Target Folder:**
- **Name:** OpenClaw Drive Uploads
- **ID:** `1Q_wBbz1a-m0ZFlElQv9JJ4lGgZinuZBh`
- **URL:** https://drive.google.com/drive/u/0/folders/1Q_wBbz1a-m0ZFlElQv9JJ4lGgZinuZBh

**Usage:**
```bash
export DRIVE_UPLOADER_FOLDER_ID="1Q_wBbz1a-m0ZFlElQv9JJ4lGgZinuZBh"
node oauth-upload.js /path/to/file.zip
node oauth-upload.js list
```

**Max file size:** 100 MB

**Documentation:** `SETUP-OAUTH.md`, `OAUTH-QUICKSTART.md`

---

## 📚 SEO Backlinks Search (Existing)

**Location:** `/Users/northsea/clawd-dmitry/seo-backlinks-search/`

**Queries Used:**
1. "seo link building services"
2. "backlink indexer tools"
3. "guest posting services SEO"
4. "blogger outreach link building"
5. "white hat backlinks service"

**Data:**
- **Master DB:** `data/master-urls.json` (169 URLs)
- **Total unique results:** 80 URLs
- **Filtering:** Excluded Dutch sites, crypto/gambling, price comparisons

**Integration with Drive Uploader:**
Use OAuth uploader to share monthly exports:
```bash
node oauth-upload.js ~/clawd-dmitry/seo-backlinks-search/results/monthly-export.zip
```

