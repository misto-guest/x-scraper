# @notgrahamp Daily Digests - Deployment Guide

## ✅ Deployment Status: COMPLETE

**Public URL:** https://notgrahamp-digests-production.up.railway.app

---

## How to Use

1. **View the Digests:**
   - Visit https://notgrahamp-digests-production.up.railway.app
   - The page displays daily tweet digests in reverse chronological order (newest first)
   - Each digest shows: date, tweet content, key insights, and action items

2. **Mobile Friendly:**
   - The app is fully responsive and works great on mobile devices
   - Clean, easy-to-read interface

---

## How It Updates

### Current Method: Manual Deployment
When new digest files are added to `/Users/northsea/clawd-dmitry/data/notgrahamp-daily-digest/`:

1. **Copy new files to project:**
   ```bash
   cp -r /Users/northsea/clawd-dmitry/data /Users/northsea/clawd-dmitry/notgrahamp-digests/
   ```

2. **Rebuild the app:**
   ```bash
   cd /Users/northsea/clawd-dmitry/notgrahamp-digests
   npm install
   npm run build
   ```

3. **Deploy to Railway:**
   ```bash
   rm -rf node_modules
   railway up --service notgrahamp-digests
   ```

4. **Wait 1-2 minutes** for deployment to complete

5. **Refresh the URL** to see new digests

---

## Future Improvements (Optional)

### Automatic Updates
To make updates fully automatic, you could:

1. **Set up GitHub Integration:**
   - Push the `notgrahamp-digests` folder to a GitHub repository
   - Connect Railway to the GitHub repo
   - Enable automatic deployments on push

2. **Add a Watch Script:**
   - Create a script that watches the digest directory
   - Automatically commits and pushes changes to GitHub
   - Railway will auto-deploy on every push

3. **Use Railway Cron Jobs:**
   - Set up a cron job to rebuild periodically
   - Pulls latest digest files automatically

### Adding a "Refresh" Button
The current implementation is a static site, so a refresh button would require:
- Converting to a dynamic app with a server
- Adding an API endpoint to reload the data
- More complex architecture

**Recommendation:** Stick with the current simple approach (manual deployments) for now. It's reliable and easy to understand.

---

## Technical Details

- **Framework:** Astro.js 6.x
- **Styling:** Tailwind CSS 4.x
- **Hosting:** Railway (Docker-based deployment)
- **Type:** Static site build
- **Data Source:** Markdown files in `data/notgrahamp-daily-digest/`

---

## Project Structure

```
notgrahamp-digests/
├── src/
│   ├── layouts/
│   │   └── Layout.astro          # Main layout with header/footer
│   ├── pages/
│   │   └── index.astro            # Homepage (displays digests)
│   └── styles/
│       └── global.css             # Tailwind CSS styles
├── data/
│   └── notgrahamp-daily-digest/   # Digest markdown files
├── Dockerfile                     # Railway deployment config
├── package.json                   # Node.js dependencies
└── astro.config.mjs               # Astro configuration
```

---

## Support

If you encounter any issues:
1. Check Railway deployment logs: `railway logs`
2. Verify digest files exist in `data/notgrahamp-daily-digest/`
3. Ensure the build succeeds: `npm run build`
4. Check deployment status: `railway deployment list`

---

**Last Updated:** 2026-02-17
**Status:** ✅ Live and Working
