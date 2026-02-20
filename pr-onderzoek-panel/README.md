# PR Onderzoek Panel

A comprehensive dashboard for analyzing press release effectiveness from ANP Persportaal (Dutch Press Portal), built with Next.js and Tailwind CSS.

## Features

- 🔍 **Search & Extract**: Search ANP Persportaal for research press releases
- 🔗 **Backlink Analysis**: Track which sites republish and analyze domain authority
- ⭐ **Top Performers**: Identify best-performing press releases with scoring
- 📊 **AI Insights**: Analyze patterns in headlines, timing, and content
- 💡 **Strategy Generator**: Get personalized PR campaign recommendations

## Tech Stack

- **Frontend**: Next.js 15 (App Router), React 19, Tailwind CSS 3
- **Backend**: Next.js API Routes, Node.js
- **Database**: SQLite (better-sqlite3)
- **Scraping**: Puppeteer for ANP Persportaal
- **Analysis**: Cheerio for HTML parsing

## Installation

```bash
# Install dependencies
npm install

# Run development server
npm run dev

# Build for production
npm run build

# Start production server
npm start
```

## Configuration

### ANP Persportaal Credentials

The panel requires login credentials for ANP Persportaal. Create a `.env.local` file:

```env
ANP_USERNAME=your_username
ANP_PASSWORD=your_password
```

**Note**: ANP Persportaal requires registration. Visit https://persportaal.anp.nl to sign up.

### Without Credentials

The panel will run in demo mode with mock data if no credentials are provided.

## Architecture

### Modular Structure

```
├── app/
│   ├── page.js                    # Main dashboard with tabs
│   ├── search-results.js          # Search & extraction tab
│   ├── backlink-analysis.js       # Backlink analysis tab
│   ├── top-performers.js          # Top performers tab
│   ├── insights.js                # Insights & patterns tab
│   ├── strategy-generator.js      # Strategy generator tab
│   ├── api/
│   │   ├── scrape/route.js        # Scraping endpoint
│   │   ├── analyze/               # Analysis endpoints
│   │   │   ├── backlinks/route.js
│   │   │   ├── performers/route.js
│   │   │   └── insights/route.js
│   │   └── generate-strategy/route.js
│   └── globals.css
├── lib/
│   ├── database.js                # SQLite database setup
│   ├── scraper.js                 # ANP Persportaal scraper
│   ├── backlink-analyzer.js       # Backlink analysis
│   ├── performers.js              # Top performers logic
│   ├── insights.js                # Insights generator
│   └── strategy-generator.js      # Strategy AI
├── data/                          # SQLite database (auto-created)
└── package.json
```

### Data Flow

1. **Scraping**: Puppeteer → ANP Persportaal → SQLite
2. **Analysis**: SQLite → Backlink Analyzer → Metrics
3. **Scoring**: Composite visibility score calculation
4. **Insights**: Pattern analysis → AI recommendations
5. **Strategy**: User input → Strategy generator → Recommendations

## API Endpoints

### POST /api/scrape
Search and extract press releases from ANP Persportaal.

**Request:**
```json
{
  "keyword": "onderzoek"
}
```

**Response:**
```json
{
  "success": true,
  "results": [...],
  "count": 47
}
```

### POST /api/analyze/backlinks
Analyze backlinks and third-party coverage.

**Response:**
```json
{
  "success": true,
  "backlinks": [...],
  "count": 156
}
```

### POST /api/analyze/performers
Get top-performing press releases.

**Response:**
```json
{
  "success": true,
  "performers": [...]
}
```

### POST /api/analyze/insights
Generate AI-powered insights.

**Response:**
```json
{
  "success": true,
  "insights": {
    "whyPerformBetter": [...],
    "topicPatterns": [...],
    "headlinePatterns": [...],
    "timingPatterns": [...]
  }
}
```

### POST /api/generate-strategy
Generate PR strategy based on project description.

**Request:**
```json
{
  "description": "We're conducting a survey of 1,000 Dutch consumers..."
}
```

**Response:**
```json
{
  "success": true,
  "strategy": {
    "angles": [...],
    "headlines": [...],
    "dataAngle": "...",
    "journalistHook": "...",
    "outreach": [...],
    "timing": {...},
    "seoStrategy": [...]
  }
}
```

## Scoring Model

### Visibility Score Formula

```
Visibility Score = (Unique Domains × 0.4) +
                   (SEO Impact × 0.3) +
                   (Social Shares × 0.2) +
                   (Avg Domain Authority × 0.1)
```

All metrics normalized to 0-100 scale.

### SEO Impact Calculation

```
SEO Impact = Σ(Domain Authority × Link Value) × Content Score
```

- **Domain Authority**: 0-100 (from Moz/SEMrush)
- **Link Value**: Editorial (1.0), Citation (0.5), Sponsored (0.2)
- **Content Score**: Based on verbatim vs rewritten republication

## Rate Limiting

The scraper respects robots.txt and implements rate limiting:
- 1 request per second to ANP Persportaal
- 5 second delay between pagination pages
- Maximum 100 results per search

## Production Considerations

### For Production Use:

1. **Add AI Integration**:
   - OpenAI API for insights generation
   - Claude API for strategy recommendations
   - Add `OPENAI_API_KEY` to `.env.local`

2. **Add Backlink APIs**:
   - Ahrefs API for accurate backlink data
   - Moz API for Domain Authority
   - Add `AHREFS_API_KEY` to `.env.local`

3. **Database**:
   - Consider PostgreSQL for production
   - Add connection pooling
   - Implement backup strategy

4. **Monitoring**:
   - Add logging (Winston/Pino)
   - Implement error tracking (Sentry)
   - Set up uptime monitoring

5. **Performance**:
   - Add Redis caching
   - Implement job queue for scraping
   - Add CDN for static assets

## Demo Mode

Without ANP credentials, the panel runs in demo mode with:
- Mock press releases
- Sample backlink data
- Pre-generated insights
- Working strategy generator

## Troubleshooting

### Puppeteer Issues

```bash
# On Linux, you may need:
sudo apt-get install -y \
  libnss3 \
  libatk1.0-0 \
  libatk-bridge2.0-0 \
  libcups2 \
  libdrm2 \
  libxkbcommon0 \
  libxcomposite1 \
  libxdamage1 \
  libxfixes3 \
  libxrandr2 \
  libgbm1
```

### SQLite Database Location

Database is created at: `./data/pr-onderzoek.db`

### Reset Database

```bash
rm -rf data/
npm run dev  # Will recreate database
```

## License

MIT

## Author

Built for PR research and analysis of ANP Persportaal content.
