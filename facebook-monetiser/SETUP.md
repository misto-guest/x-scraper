# Facebook Monetiser - Setup Guide

This guide will help you set up and run the Facebook Monetiser MVP on your local machine.

## Prerequisites

Before you begin, ensure you have:

- **Node.js** version 16.0 or higher installed
  - Check: `node --version`
  - Download: https://nodejs.org/
- **npm** or **yarn** package manager
  - Usually installed with Node.js
- **Git** (optional, for cloning)

## Installation Steps

### 1. Navigate to Project Directory

```bash
cd /Users/northsea/clawd-dmitry/facebook-monetiser
```

### 2. Install Dependencies

```bash
npm install
```

This will install:
- `express` - Web server framework
- `sqlite3` - SQLite database driver
- `cors` - Cross-origin resource sharing

**Expected output:**
```
added 156 packages, and audited 157 packages in 5s
...
```

### 3. Start the Server

**Option A: Regular start**
```bash
npm start
```

**Option B: Development mode with auto-reload**
```bash
npm run dev
```

**Expected output:**
```
🚀 Facebook Monetiser Backend Server
📡 Server running: http://localhost:3000
📊 Dashboard: http://localhost:3000/dashboard
🗄️  Database: /Users/northsea/clawd-dmitry/facebook-monetiser/data/facebook-monetiser.db

Connected to SQLite database: /path/to/database
Database schema initialized successfully
```

### 4. Access the Application

Open your browser:

- **Landing Page:** http://localhost:3000
- **Dashboard:** http://localhost:3000/dashboard

## First Run Checklist

After the server starts, the following happens automatically:

1. ✅ **Data directory created** at `facebook-monetiser/data/`
2. ✅ **Database initialized** with all 10 tables
3. ✅ **Default automation limits** inserted
4. ✅ **API server** listening on port 3000

## Database Schema

On first run, these tables are created:

- `pages` - Facebook pages metadata
- `page_assets` - Linked websites, groups, ad accounts
- `sources` - Content sources (tweets, articles)
- `insights` - Learnings from sources
- `competitors` - Tracked competitor pages
- `scraped_content` - Scraped content storage
- `generated_posts` - AI-generated drafts
- `schedules` - Posting schedules
- `post_performance` - Performance metrics
- `automation_limits` - Risk rules and limits

## Testing the Setup

### 1. Health Check

```bash
curl http://localhost:3000/api/health
```

**Expected response:**
```json
{"status":"ok","timestamp":"2026-03-02T14:30:00.000Z"}
```

### 2. Create a Test Page

```bash
curl -X POST http://localhost:3000/api/pages \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Test Business Page",
    "page_id": "test_page_123",
    "category": "Business",
    "about": "A test page for Facebook Monetiser",
    "followers_count": 5000
  }'
```

**Expected response:**
```json
{
  "message": "Page created successfully",
  "page_id": 1,
  "id": 1
}
```

### 3. Create a Test Source

```bash
curl -X POST http://localhost:3000/api/sources \
  -H "Content-Type: application/json" \
  -d '{
    "source_type": "article",
    "title": "10 Tips for Facebook Marketing",
    "url": "https://example.com/article",
    "author": "Marketing Expert",
    "content_text": "Here are 10 tips for better Facebook marketing..."
  }'
```

### 4. Generate Content

```bash
curl -X POST http://localhost:3000/api/content/caption \
  -H "Content-Type: application/json" \
  -d '{}'
```

**Expected response:**
```json
{
  "caption": "The secret to success? Consistency...",
  "risk_score": 0.15,
  "approval_status": "auto_approved"
}
```

## Dashboard Usage

### Adding Your First Page

1. Go to http://localhost:3000/dashboard
2. Click the **Pages** tab
3. Click **+ Add Page**
4. Fill in the form:
   - Page Name: "My Business Page"
   - Page ID: (from Facebook Page settings)
   - Category: "Business"
   - Followers Count: (your current count)
5. Click **Add Page**

### Creating Your First Post

1. Go to the **Create Post** tab
2. Select the page you just created
3. Choose content type (Image, Reel, Text)
4. Click **Generate Caption** to create AI-powered content
5. Review the risk score
6. Click **Create Post**

### Using the Approval Queue

1. Go to the **Posts** tab
2. Filter by "Pending" status
3. Review each post
4. Click **Approve** or **Reject**

## Troubleshooting

### Port Already in Use

If you see `Error: listen EADDRINUSE: address already in use :::3000`:

**Option 1:** Use a different port
```bash
PORT=3001 npm start
```

**Option 2:** Kill the existing process
```bash
# Find the process
lsof -ti:3000

# Kill it
kill -9 $(lsof -ti:3000)
```

### Database Errors

If you see database-related errors:

1. **Delete the database and restart:**
   ```bash
   rm data/facebook-monetiser.db
   npm start
   ```

2. **Check database permissions:**
   ```bash
   ls -la data/
   ```

### Module Not Found Errors

If you see `Cannot find module 'express'`:

```bash
# Reinstall dependencies
rm -rf node_modules package-lock.json
npm install
```

### API Not Responding

If the dashboard loads but API calls fail:

1. **Check if server is running:**
   ```bash
   curl http://localhost:3000/api/health
   ```

2. **Check browser console for CORS errors**

3. **Verify the server started without errors**

## File Permissions

Ensure the `data/` directory is writable:

```bash
chmod -R 755 data/
```

## Development Tips

### Auto-Reload During Development

Use `nodemon` for automatic server restart:

```bash
npm run dev
```

### Viewing Database Contents

Use SQLite CLI:

```bash
sqlite3 data/facebook-monetiser.db

# List tables
.tables

# View pages
SELECT * FROM pages;

# Exit
.quit
```

### GUI Database Browser

Download **DB Browser for SQLite**:
- https://sqlitebrowser.org/

Open `data/facebook-monetiser.db` to view/edit data visually.

## Environment Variables (Optional)

Create a `.env` file in the project root:

```env
PORT=3000
NODE_ENV=development
```

## Production Deployment

For production use:

1. **Use process manager** (PM2):
   ```bash
   npm install -g pm2
   pm2 start backend/server.js --name facebook-monetiser
   ```

2. **Set up reverse proxy** (nginx):
   ```nginx
   server {
       listen 80;
       server_name your-domain.com;

       location / {
           proxy_pass http://localhost:3000;
           proxy_set_header Host $host;
           proxy_set_header X-Real-IP $remote_addr;
       }
   }
   ```

3. **Migrate to Postgres** (when scaling):
   - Export SQLite data
   - Update database configuration
   - Import to Postgres

## Next Steps

Once setup is complete:

1. ✅ Add your Facebook pages
2. ✅ Import content sources
3. ✅ Generate and approve posts
4. ✅ Review predictions
5. ✅ Track performance

## Support

For issues or questions:

1. Check the main README.md
2. Review error logs in the terminal
3. Check browser console for frontend errors
4. Verify database state with SQLite browser

---

**Ready to automate your Facebook page growth! 🚀**
