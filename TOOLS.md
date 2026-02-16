# TOOLS.md - Local Notes

Skills define *how* tools work. This file is for *your* specifics — the stuff that's unique to your setup.

## What Goes Here

Things like:
- Camera names and locations
- SSH hosts and aliases
- Preferred voices for TTS
- Speaker/room names
- Device nicknames
- Anything environment-specific

## Examples

```markdown
### Cameras
- living-room → Main area, 180° wide angle
- front-door → Entrance, motion-triggered

### SSH
- home-server → 192.168.1.100, user: admin

### TTS
- Preferred voice: "Nova" (warm, slightly British)
- Default speaker: Kitchen HomePod
```

## Why Separate?

Skills are shared. Your setup is yours. Keeping them apart means you can update skills without losing your notes, and share skills without leaking your infrastructure.

---

Add whatever helps you do your job. This is your cheat sheet.

---

## Installed Tools

### Chrome DevTools MCP
**Install command:** `npx -y chrome-devtools-mcp@latest`

**Production mode (privacy-focused):**
```bash
npx -y chrome-devtools-mcp@latest \
  --headless \
  --isolated \
  --no-usage-statistics \
  --no-performance-crux
```

**Development mode (visible browser):**
```bash
npx -y chrome-devtools-mcp@latest \
  --viewport 1920x1080
```

**Connect to existing Chrome:**
```bash
# Start Chrome with remote debugging
/Applications/Google\ Chrome.app/Contents/MacOS/Google\ Chrome \
  --remote-debugging-port=9222 \
  --user-data-dir=/tmp/chrome-profile

# Connect MCP to it
npx -y chrome-devtools-mcp@latest \
  --browserUrl=http://127.0.0.1:9222
```

**Use cases:**
- Technical SEO audits (Core Web Vitals)
- Backlink verification
- Competitor intelligence
- Local SEO monitoring (GMB screenshots)
- Marketplace ranking services

**Documentation:** `/memory/CHROME-DEVTOOLS-MCP-INTTEGRATION.md`

