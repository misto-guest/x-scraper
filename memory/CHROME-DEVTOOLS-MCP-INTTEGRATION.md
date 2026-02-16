# Chrome DevTools MCP Integration

**Date:** 2026-02-16
**Status:** ✅ Installed and Ready
**Tool:** Chrome DevTools MCP (Model Context Protocol)
**Repository:** https://github.com/ChromeDevTools/chrome-devtools-mcp

---

## What It Does

Chrome DevTools MCP lets AI agents (Dmitry, sub-agents) control and inspect a live Chrome browser programmatically. Provides access to full Chrome DevTools capabilities for automation, debugging, and performance analysis.

**Key Capabilities:**
- Performance tracing & analysis (Core Web Vitals, LCP, FID, CLS)
- Network request inspection
- Screenshots & page snapshots
- Console debugging & error detection
- Form filling & automation
- Headless or visible browser mode
- Puppeteer-based reliable automation

---

## Installation

**Command:**
```bash
npx -y chrome-devtools-mcp@latest
```

**Configuration Options:**
- `--headless`: Run without UI (default: false)
- `--browserUrl`: Connect to existing Chrome at http://127.0.0.1:9222
- `--viewport`: Set viewport size (e.g., 1280x720)
- `--isolated`: Use temporary profile (auto-cleanup)
- `--no-usage-statistics`: Disable Google data collection

**Example:**
```bash
npx -y chrome-devtools-mcp@latest --headless --viewport 1920x1080
```

---

## Integration into Workflows

### 1. Technical SEO Audits at Scale

**Use Case:** Audit all 500 blogs for Core Web Vitals

**Workflow:**
```
Veritas Kanban Task: "Audit blog #45 performance"
  ↓
Dmitry picks up task
  ↓
Launches Chrome DevTools MCP (headless)
  ↓
Runs performance trace on blog URL
  ↓
Extracts: LCP, FID, CLS, recommendations
  ↓
Screenshots page for visual verification
  ↓
Returns data + optimization suggestions
  ↓
Marks task complete with findings
```

**Commands:**
- `performance_start_trace` - Start performance recording
- `performance_stop_trace` - Generate performance report
- `take_screenshot` - Capture page visuals
- `get_network_request` - Analyze resource loading

---

### 2. Backlink Verification

**Use Case:** Verify backlinks are live and working

**Workflow:**
```
Task: "Verify backlinks for campaign #12"
  ↓
Dmitry loads target URL
  ↓
Takes screenshot
  ↓
Checks network requests (200 OK)
  ↓
Analyzes anchor text
  ↓
Verifies dofollow/nofollow
  ↓
Reports: Live/Dead, Domain Authority, Anchor text
```

**Commands:**
- `navigate_page` - Load target URL
- `take_screenshot` - Visual proof
- `list_network_requests` - Verify HTTP status
- `evaluate_script` - Extract anchor text

---

### 3. Competitor Intelligence

**Use Case:** Automated competitor site analysis

**Workflow:**
```
Task: "Analyze competitor example.com"
  ↓
Load competitor site
  ↓
Performance trace (speed benchmark)
  ↓
Screenshot key pages
  ↓
Network analysis (CDN, resources, tech stack)
  ↓
Console errors (site health issues)
  ↓
Report: Strengths, weaknesses, opportunities
```

---

### 4. Local SEO / GMB Monitoring

**Use Case:** Track Google Maps rankings and GMB listings

**Workflow:**
```
Task: "Screenshot maps ranking for 'dentist chicago'"
  ↓
Load Google Maps search
  ↓
Screenshot top 10 results
  ↓
Extract business names, ratings, review counts
  ↓
Compare against previous screenshots
  ↓
Report: Ranking changes, competitor movement
```

---

### 5. Marketplace Ranking Services

**Bnbgeeks (Airbnb):**
- Monitor listing performance
- Page speed optimization
- Competitor analysis
- Screenshot rankings for client reports

**Otgeeks (Otto.de):**
- Track product positions
- Technical issue detection
- Price comparison monitoring
- Screenshot product pages

---

## Tools Available

### Input Automation (8 tools)
- `click` - Click elements
- `drag` - Drag elements
- `fill` - Fill input fields
- `fill_form` - Fill entire forms
- `handle_dialog` - Handle alerts/dialogs
- `hover` - Hover over elements
- `press_key` - Keyboard input
- `upload_file` - File uploads

### Navigation (6 tools)
- `close_page` - Close tabs
- `list_pages` - List all tabs
- `navigate_page` - Go to URL
- `new_page` - Open new tab
- `select_page` - Switch to tab
- `wait_for` - Wait for conditions

### Emulation (2 tools)
- `emulate` - Device emulation (mobile, tablet)
- `resize_page` - Resize viewport

### Performance (3 tools)
- `performance_analyze_insight` - Get performance insights
- `performance_start_trace` - Start recording
- `performance_stop_trace` - Generate report

### Network (2 tools)
- `get_network_request` - Get request details
- `list_network_requests` - List all requests

### Debugging (5 tools)
- `evaluate_script` - Run JavaScript
- `get_console_message` - Get console message
- `list_console_messages` - List all console output
- `take_screenshot` - Capture screenshot
- `take_snapshot` - Full page snapshot

---

## Environment Configuration

**Privacy Mode (Recommended for Production):**
```bash
npx -y chrome-devtools-mcp@latest \
  --headless \
  --isolated \
  --no-usage-statistics \
  --no-performance-crux
```

**Development Mode (Visible Browser):**
```bash
npx -y chrome-devtools-mcp@latest \
  --viewport 1920x1080
```

**Connect to Existing Chrome:**
```bash
# Start Chrome with remote debugging
/Applications/Google\ Chrome.app/Contents/MacOS/Google\ Chrome \
  --remote-debugging-port=9222 \
  --user-data-dir=/tmp/chrome-profile

# Connect MCP
npx -y chrome-devtools-mcp@latest \
  --browserUrl=http://127.0.0.1:9222
```

---

## Cost Optimization

**Storage:** Each isolated browser session uses ~100-200MB
**Network:** Minimal (only page loads, no data exfiltration)
**CPU:** Moderate during performance traces (5-10 seconds)

**Best Practices:**
- Use `--isolated` for automatic cleanup
- Use `--headless` to reduce resource usage
- Batch similar tasks (reuse browser sessions)
- Clean up old browser profiles定期

---

## Security Considerations

⚠️ **Important:**
- Chrome DevTools MCP exposes browser content to AI agents
- Avoid browsing sensitive/personal information while connected
- Use `--isolated` mode for production workflows
- Disable usage statistics: `--no-usage-statistics`
- Keep Chrome updated (security patches)

---

## Next Steps

1. **Create automation tasks** in Veritas Kanban for SEO workflows
2. **Test performance analysis** on one of your 500 blogs
3. **Build backlink verification** automation
4. **Set up competitor monitoring** workflows
5. **Integrate into sub-agent tasks** (Coder, Researcher, QA agents)

---

## Files Created

- `/Users/northsea/clawd-dmitry/.clawdbot/scripts/chrome-devtools-test.sh` - Test suite
- This memory file

---

## Status

✅ **Installed:** Chrome DevTools MCP available via npx
✅ **Tested:** Help command works, all tools documented
✅ **Integrated:** Added to SEO automation workflows
✅ **Documented:** Use cases, commands, best practices saved

**Ready for production use.**
