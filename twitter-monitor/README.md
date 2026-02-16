# Twitter Monitor - X.com Content Monitoring System

Automated Twitter/X monitoring system with keyword-based relevance filtering for SEO and affiliate marketing intelligence.

## Features

- **Daily Tweet Monitoring**: Automatically fetches tweets from specified profiles once per day
- **Keyword-Based Relevance Filtering**: Auto-approve relevant tweets based on your keywords
- **Smart Approval System**: High relevance → auto-approve, medium → pending review, low/negative → auto-reject
- **Admin Panel**: Manage profiles, keywords, and review pending tweets
- **Project Connections**: Connect relevant tweets to your projects via API
- **RESTful API**: Full CRUD operations for all resources

## Tech Stack

- **Frontend**: Next.js 15 + React 19
- **Backend**: Next.js API Routes
- **Database**: SQLite + Prisma ORM
- **Scraping**: GhostFetch (stealth X.com scraper)
- **Scheduling**: node-cron

## Quick Start

### 1. Install Dependencies

```bash
cd twitter-monitor
npm install
```

### 2. Start GhostFetch Server

GhostFetch is required for scraping X.com. Install and start it:

```bash
# Install GhostFetch (if not already installed)
pipx install ghostfetch

# Start the server
ghostfetch serve --port 8000
```

Keep this running in a separate terminal.

### 3. Setup Database

```bash
# Initialize Prisma and create database
npx prisma generate
npx prisma db push
```

### 4. Configure Environment

Create `.env` file:

```env
DATABASE_URL="file:./dev.db"
GHOSTFETCH_URL="http://localhost:8000"
```

### 5. Start Development Server

```bash
npm run dev
```

Visit `http://localhost:3000` to see the dashboard.

## Usage

### 1. Add a Profile to Monitor

```bash
curl -X POST http://localhost:3000/api/profiles \
  -H "Content-Type: application/json" \
  -d '{"username": "notgrahamp"}'
```

### 2. Add Keywords

```bash
# Add positive keywords
curl -X POST http://localhost:3000/api/keywords \
  -H "Content-Type: application/json" \
  -d '{"word": "SEO", "category": "marketing"}'

# Add negative keywords (tweets with these will be rejected)
curl -X POST http://localhost:3000/api/keywords \
  -H "Content-Type: application/json" \
  -d '{"word": "crypto", "category": "spam", "isNegative": true}'
```

### 3. Trigger Manual Scraping

```bash
curl -X POST http://localhost:3000/api/profiles/{profileId}/scrape
```

### 4. Review Pending Tweets

Visit `http://localhost:3000/admin/tweets?status=PENDING` to review tweets marked as pending.

### 5. Connect Tweets to Projects

```bash
# Create a project
curl -X POST http://localhost:3000/api/projects \
  -H "Content-Type: application/json" \
  -d '{"name": "My Blog", "domain": "example.com"}'

# Connect tweet to project
curl -X POST http://localhost:3000/api/tweet-connections \
  -H "Content-Type: application/json" \
  -d '{"tweetId": "123", "projectId": "abc"}'
```

## API Endpoints

### Profiles
- `GET /api/profiles` - List all profiles
- `POST /api/profiles` - Create profile
- `GET /api/profiles/[id]` - Get profile details
- `PATCH /api/profiles/[id]` - Update profile
- `DELETE /api/profiles/[id]` - Delete profile
- `POST /api/profiles/[id]/scrape` - Trigger scraping

### Keywords
- `GET /api/keywords` - List keywords
- `POST /api/keywords` - Create keyword
- `GET /api/keywords/[id]` - Get keyword
- `PATCH /api/keywords/[id]` - Update keyword
- `DELETE /api/keywords/[id]` - Delete keyword

### Tweets
- `GET /api/tweets` - List tweets (with filters)
- `PATCH /api/tweets` - Update tweet status
- `GET /api/tweets/[id]` - Get tweet details

### Projects
- `GET /api/projects` - List projects
- `POST /api/projects` - Create project
- `DELETE /api/projects/[id]` - Delete project

## Relevance Scoring

The system uses keyword-based relevance scoring:

- **Positive keywords**: +10 points each
- **Negative keywords**: -50 points each
- **Category diversity bonus**: +5 points per unique category

**Status thresholds:**
- Score ≥ 70: **APPROVED** (auto-approved)
- Score 20-69: **PENDING** (needs review)
- Score < 20: **REJECTED** (auto-rejected)
- Has negative keywords: **REJECTED** (immediate)

## Production Deployment

### Environment Variables

```env
DATABASE_URL="file:./production.db"
GHOSTFETCH_URL="http://localhost:8000"
NODE_ENV="production"
```

### Database

For production, consider using PostgreSQL instead of SQLite:

```prisma
datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}
```

### GhostFetch Server

Run GhostFetch as a systemd service or use Docker:

```bash
docker run -d -p 8000:8000 iarsalanshah/ghostfetch
```

## License

ISC

## Disclaimer

This tool is for educational and research purposes. Users are responsible for complying with Twitter's Terms of Service and applicable laws.
