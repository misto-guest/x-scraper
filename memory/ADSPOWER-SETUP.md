# AdsPower Browser Setup - Production Configuration

**Last Updated:** 2026-03-03
**Source:** B (rozhiu) - BNBGeeks & Keizersgracht group

---

## Critical Rules

### Browser Stack
- ✅ **ALWAYS USE:** External browsers (AdsPower or BAS)
- ✅ **USE:** React + TypeScript + Puppeteer-core
- ❌ **NEVER:** Selenium, Playwright, or bundled browsers

### Deployment Stack
- ✅ **ALWAYS USE:** GitHub (version control)
- ✅ **ALWAYS DEPLOY TO:** Railway
- ✅ **USE:** Docker files for deployment

---

## AdsPower Configuration

### Account Security
- **Email:** `rebel@rebelinternet.eu`
- **⚠️ CRITICAL:** Do NOT login/use this account on other servers!
- If you login elsewhere, it breaks the remote server login and requires re-login

### Debug Access
- **VNC Connection:** Available for debugging (headful mode)
- **Process:** Ask Dmitry.p to add your SSH key to access the server
- **VNC Client:** Use any VNC client to connect and see what's happening
- **You can:** See running browser, manually use AdsPower for debugging

---

## API Configuration

### AdsPower API Endpoints
```
Base URL: http://95.217.224.154:50325/api/v2/
Start Profile: ${BASE_URL}browser-profile/start
Stop Profile: ${BASE_URL}browser-profile/stop
```

### Code Example (Complete)
```typescript
import fetch from 'node-fetch';
import puppeteer from 'puppeteer-core';

const ADSPOWER_BASE_SERVER = '95.217.224.154';
const ADSPOWER_BASE_PORT = 50325;
const ADSPOWER_BASE_URL = `http://${ADSPOWER_BASE_SERVER}:${ADSPOWER_BASE_PORT}/api/v2/`;
const PROFILE_ID = 'your-profile-id'; // Replace with your profile ID
const BROWSER_API_KEY = 'YOUR_API_KEY'; // Get from 1Password
const API_KEY_MODE: 'GET' | 'HEADER' = 'GET';

async function startAndConnectAdsPower() {
  try {
    // Start the browser profile
    const startResponse = await fetch(`${ADSPOWER_BASE_URL}browser-profile/start`, {
      method: 'POST',
      headers: {'Content-Type': 'application/json'},
      body: JSON.stringify({
        profile_id: PROFILE_ID,
        launch_args: [
          "--remote-allow-origins=*",
          "--disable-web-security",
          "--disable-site-isolation-trials"
        ]
      })
    });

    const data = await startResponse.json();

    if (data.code === 0) {
      const wsUrl = data.data.ws.puppeteer;
      console.log('Original CDP URL:', wsUrl);

      // Extract port and GUID for remote connection
      // Original URL format: ws://127.0.0.1:port/devtools/browser/guid
      const port = wsUrl.match(/:(\d+)\//)[1];
      const guid = wsUrl.match(/\/browser\/([0-9a-f\-]+)/)[1];

      // Reconstruct URL for remote AdsPower server
      // New format: ws://server:8080/port/port/devtools/browser/guid
      let wsUrlModified = `ws://${ADSPOWER_BASE_SERVER}:8080/port/${port}/devtools/browser/${guid}`;
      console.log('Modified URL for remote connection:', wsUrlModified);

      // Connect Puppeteer to AdsPower browser
      // You can pass api key in header or as get argument in url
      const headers: any = { Host: "localhost" };

      if (API_KEY_MODE.toString() === 'HEADER') {
        headers["X-Api-Key"] = BROWSER_API_KEY;
      } else {
        wsUrlModified += `?api_key=${BROWSER_API_KEY}`;
      }

      const browser = await puppeteer.connect({
        browserWSEndpoint: wsUrlModified,
        defaultViewport: null,
        headers
      });

      console.log('Successfully connected to AdsPower!');

      // Close existing pages to prevent memory issues
      const pages = await browser.pages();
      for (const page of pages) {
        await page.close();
      }

      // Create new page
      const page = await browser.newPage();

      // Further instructions to control browser
      await page.goto('https://www.example.org');

      // Disconnect when done (without closing profile)
      await browser.close();

      return browser;
    } else {
      console.error('Failed to start browser:', data.msg);
      throw new Error(data.msg);
    }
  } catch (error) {
    console.error('Error:', error.message);
    throw error;
  }
}

// Run the function
startAndConnectAdsPower();
```

---

## Key Configuration Details

### Server Configuration
- **Replace `ADSPOWER_BASE_SERVER`** with your AdsPower server IP
- **Replace `PROFILE_ID`** with your actual AdsPower profile ID
- **Replace `BROWSER_API_KEY`** with actual key from 1Password (set in nginx config)

### API Key Authentication
You can pass API key in two ways:
1. **Header mode:** `X-Api-Key` header
2. **GET mode:** `?api_key=` parameter in URL

### Remote Connection Pattern
The WebSocket URL must be modified to work with remote AdsPower servers:

**Original format:**
```
ws://127.0.0.1:52345/devtools/browser/abc-123-def
```

**Modified format for remote:**
```
ws://95.217.224.154:8080/port/52345/devtools/browser/abc-123-def
```

### Browser Control
- Use standard Puppeteer commands after connection
- **Important:** Use `browser.close()` to disconnect without closing the profile
- The browser will start with the specified profile

### Actual Server Details
- **API URL:** `95.217.224.154:50325`
- **WebSocket Port:** `8080` (for CDP connections)

---

## ⚠️ Known Configuration Issues

### JWT Verification Issue

**Problem:**
If `adspower-api` isn't in `config.toml`, it defaults to `verify_jwt = true` (the old deprecated approach).

**New System:**
The new signing-keys system requires:
- `verify_jwt = false`
- Use `getClaims()` in code instead

**Solution:**
Ensure your config.toml includes:
```toml
[adspower-api]
verify_jwt = false
```

**Impact:**
Without this, API calls may fail with authentication errors.

---

## Critical Operational Rules

### Browser Management
- ✅ **ALWAYS close browser after use** - Don't leave browsers running
- ✅ **Handle error cases properly** - Cleanup on failures
- ✅ **Avoid many browsers running** - Check and close orphaned browsers

### Page Management
- ⚠️ **Close all existing pages after connecting**
- Browser saves state, pages accumulate
- Too many pages → Memory issues
- **Pattern:**
  ```typescript
  const pages = await browser.pages();
  for (const page of pages) {
    await page.close();
  }
  ```

### CDP URL Processing
- API returns Chrome DevTools Protocol (CDP) WebSocket URL
- URL needs modification for remote connections
- Extract port and GUID, reconstruct for remote AdsPower server
- **Why:** Local CDP URLs don't work remotely

---

## Common Patterns

### Full Lifecycle Example
```typescript
async function scrapeWithAdsPower() {
  let browser;

  try {
    // 1. Start browser
    browser = await startAndConnectAdsPower();

    // 2. Close existing pages
    const pages = await browser.pages();
    for (const page of pages) {
      await page.close();
    }

    // 3. Create new page
    const page = await browser.newPage();

    // 4. Do work
    await page.goto('https://example.com');
    const data = await page.evaluate(() => {
      return document.title;
    });

    return data;
  } finally {
    // 5. Always close browser
    if (browser) {
      await browser.close();
    }
  }
}
```

---

## Deployment Pattern (Railway + Docker)

### Project Structure
```
project/
├── src/
│   └── index.ts
├── Dockerfile
├── package.json
└── tsconfig.json
```

### Dockerfile
```dockerfile
FROM node:20-alpine

WORKDIR /app

COPY package*.json ./
RUN npm ci --only=production

COPY . .
RUN npm run build

CMD ["npm", "start"]
```

### Railway Deployment
```bash
# 1. Push to GitHub
git push origin main

# 2. Connect Railway to GitHub repo
# 3. Deploy automatically on push
```

---

## Resources

- **AdsPower API Docs:** Available in project
- **VNC Access:** Ask Dmitry.p for SSH key
- **Server IP:** 95.217.224.154
- **Port:** 50325

---

## Checklist Before Running

- [ ] Confirm PROFILE_ID is set
- [ ] Confirm BROWSER_API_KEY is set
- [ ] Test AdsPower connection
- [ ] Verify cleanup code (finally block)
- [ ] Check page cleanup logic
- [ ] Push to GitHub
- [ ] Deploy to Railway via Dockerfile
