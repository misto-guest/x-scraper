# X.com Scraper using Scrapling

A complete REST API for scraping public X.com (Twitter) profiles using Scrapling's StealthyFetcher to bypass Cloudflare protection.

## Features

- 🚀 **Scrapling StealthyFetcher** - Bypass Cloudflare with browser automation
- 🔄 **DynamicFetcher with Infinite Scroll** - Extract entire account timelines
- 📊 **REST API** - Full CRUD operations for accounts and tweets
- 🗄️ **SQLite Database** - Persistent storage with SQLAlchemy ORM
- ⏰ **Scheduled Scraping** - APScheduler for automated daily scraping
- 🔍 **Powerful Filtering** - Filter tweets by account, date range, and more
- 📝 **Scrape History** - Complete logging of all scraping operations
- 🎯 **Dual Mode Scraping** - Single tweet or full timeline extraction

## Tech Stack

- **Scrapling** - Python web scraping with anti-bot bypass
- **FastAPI** - Modern, fast REST API framework
- **SQLAlchemy** - SQL toolkit and ORM
- **APScheduler** - Advanced Python scheduler
- **SQLite** - Lightweight database
- **Uvicorn** - ASGI server

## Installation

### Prerequisites

- Python 3.9+
- pip

### Steps

1. **Clone or navigate to the project directory:**
```bash
cd /Users/northsea/clawd-dmitry/x-scraper-scrapling
```

2. **Install dependencies:**
```bash
pip install -r requirements.txt
```

3. **Configure environment variables:**
```bash
cp .env.example .env
```

Edit `.env` to customize settings:
```env
DATABASE_URL=sqlite:///./x_scraper.db
SCHEDULE_HOUR=9
SCHEDULE_MINUTE=0
LOG_LEVEL=INFO
```

4. **Run the application:**
```bash
python main.py
```

Or using uvicorn directly:
```bash
uvicorn main:app --host 0.0.0.0 --port 8000 --reload
```

The API will be available at `http://localhost:8000`

## API Documentation

Once running, visit:
- **Swagger UI**: http://localhost:8000/docs
- **ReDoc**: http://localhost:8000/redoc

## API Endpoints

### Health Check

#### `GET /`
Check API status

```bash
curl http://localhost:8000/
```

#### `GET /health`
Health check endpoint

```bash
curl http://localhost:8000/health
```

---

### Accounts

#### `POST /api/accounts`
Add a new account to scrape

**Request:**
```json
{
  "username": "elonmusk",
  "display_name": "Elon Musk"
}
```

```bash
curl -X POST http://localhost:8000/api/accounts \
  -H "Content-Type: application/json" \
  -d '{"username": "elonmusk", "display_name": "Elon Musk"}'
```

#### `GET /api/accounts`
List all accounts

**Query Parameters:**
- `skip` (int, default: 0) - Number of records to skip
- `limit` (int, default: 100, max: 1000) - Number of records to return
- `active_only` (bool, default: false) - Only return active accounts

```bash
curl http://localhost:8000/api/accounts
curl http://localhost:8000/api/accounts?active_only=true&limit=50
```

#### `GET /api/accounts/{account_id}`
Get account details

```bash
curl http://localhost:8000/api/accounts/1
```

#### `PUT /api/accounts/{account_id}`
Update account details

**Request:**
```json
{
  "display_name": "New Display Name",
  "is_active": true
}
```

```bash
curl -X PUT http://localhost:8000/api/accounts/1 \
  -H "Content-Type: application/json" \
  -d '{"display_name": "New Name", "is_active": true}'
```

#### `DELETE /api/accounts/{account_id}`
Delete an account

```bash
curl -X DELETE http://localhost:8000/api/accounts/1
```

---

### Tweets

#### `GET /api/tweets`
Get all scraped tweets with optional filters

**Query Parameters:**
- `account_id` (int, optional) - Filter by account ID
- `date_from` (date, optional) - Filter tweets after this date (YYYY-MM-DD)
- `date_to` (date, optional) - Filter tweets before this date (YYYY-MM-DD)
- `limit` (int, default: 100, max: 1000) - Number of records to return
- `skip` (int, default: 0) - Number of records to skip

```bash
# Get all tweets
curl http://localhost:8000/api/tweets

# Filter by account
curl http://localhost:8000/api/tweets?account_id=1

# Filter by date range
curl http://localhost:8000/api/tweets?date_from=2024-01-01&date_to=2024-12-31

# Combined filters
curl http://localhost:8000/api/tweets?account_id=1&limit=50
```

#### `GET /api/tweets/{tweet_id}`
Get a single tweet by database ID

```bash
curl http://localhost:8000/api/tweets/1
```

#### `GET /api/accounts/{account_id}/tweets`
Get all tweets for a specific account

**Query Parameters:**
- `limit` (int, default: 100, max: 1000) - Number of records to return
- `skip` (int, default: 0) - Number of records to skip

```bash
curl http://localhost:8000/api/accounts/1/tweets?limit=50
```

---

### Scraping Control

#### `POST /api/scrape/tweet`
Scrape a single tweet by URL using StealthyFetcher (fast, no JavaScript needed).

**Request:**
```json
{
  "url": "https://x.com/patrickstox/status/2029697020965884325"
}
```

```bash
curl -X POST http://localhost:8000/api/scrape/tweet \
  -H "Content-Type: application/json" \
  -d '{"url": "https://x.com/patrickstox/status/2029697020965884325"}'
```

**Response:**
```json
{
  "success": true,
  "scraped_at": "2026-03-06T18:20:00Z",
  "tweets_count": 1,
  "tweets": [
    {
      "tweet_id": "2029697020965884325",
      "text": "Tweet content here...",
      "author_username": "patrickstox",
      "author_display_name": "Patrick Stox",
      "likes": 42,
      "retweets": 10,
      "replies": 5,
      "posted_date": "2026-03-06T10:30:00Z",
      "tweet_url": "https://x.com/patrickstox/status/2029697020965884325",
      "media_urls": ["https://pbs.twimg.com/..."],
      "scraped_at": "2026-03-06T18:20:00Z"
    }
  ],
  "message": "Successfully scraped tweet"
}
```

#### `POST /api/scrape/account`
Scrape recent tweets from an account's timeline using DynamicFetcher with infinite scroll.

**Request:**
```json
{
  "username": "patrickstox",
  "max_tweets": 50
}
```

```bash
curl -X POST http://localhost:8000/api/scrape/account \
  -H "Content-Type: application/json" \
  -d '{"username": "patrickstox", "max_tweets": 50}'
```

**Response:**
```json
{
  "success": true,
  "scraped_at": "2026-03-06T18:20:00Z",
  "tweets_count": 50,
  "tweets": [
    {
      "tweet_id": "2029697020965884325",
      "text": "Tweet content here...",
      "author_username": "patrickstox",
      "author_display_name": "Patrick Stox",
      "likes": 42,
      "retweets": 10,
      "replies": 5,
      "posted_date": "2026-03-06T10:30:00Z",
      "tweet_url": "https://x.com/patrickstox/status/2029697020965884325",
      "media_urls": ["https://pbs.twimg.com/..."],
      "scraped_at": "2026-03-06T18:20:00Z"
    }
  ],
  "message": "Successfully scraped 50 tweets from @patrickstox"
}
```

#### `POST /api/scrape/now`
Trigger immediate scrape for all active accounts

```bash
curl -X POST http://localhost:8000/api/scrape/now
```

#### `POST /api/scrape/account/{account_id}`
Scrape a specific account now

```bash
curl -X POST http://localhost:8000/api/scrape/account/1
```

#### `GET /api/scrape/status`
Get the current status of the scheduler

```bash
curl http://localhost:8000/api/scrape/status
```

**Response:**
```json
{
  "running": true,
  "jobs": [
    {
      "id": "daily_scrape",
      "name": "Daily scrape all accounts",
      "next_run_time": "2024-01-15T09:00:00"
    }
  ]
}
```

#### `GET /api/scrape/history`
Get scrape history log

**Query Parameters:**
- `account_id` (int, optional) - Filter by account ID
- `limit` (int, default: 100, max: 1000) - Number of records to return
- `skip` (int, default: 0) - Number of records to skip

```bash
# Get all history
curl http://localhost:8000/api/scrape/history

# Filter by account
curl http://localhost:8000/api/scrape/history?account_id=1
```

## Configuration Options

### Environment Variables

| Variable | Description | Default |
|----------|-------------|---------|
| `DATABASE_URL` | SQLite database path | `sqlite:///./x_scraper.db` |
| `SCHEDULE_HOUR` | Hour for daily scrape (0-23) | `9` |
| `SCHEDULE_MINUTE` | Minute for daily scrape (0-59) | `0` |
| `LOG_LEVEL` | Logging level | `INFO` |

## Database Schema

### accounts
| Column | Type | Description |
|--------|------|-------------|
| id | Integer | Primary key |
| username | String (100) | Unique Twitter username |
| display_name | String (255) | Display name |
| created_at | DateTime | Account creation timestamp |
| updated_at | DateTime | Last update timestamp |
| last_scraped_at | DateTime | Last successful scrape |
| is_active | Boolean | Account status |

### tweets
| Column | Type | Description |
|--------|------|-------------|
| id | Integer | Primary key |
| tweet_id | String (50) | Unique Twitter tweet ID |
| account_id | Integer | Foreign key to accounts |
| text | Text | Tweet content |
| likes_count | Integer | Number of likes |
| retweets_count | Integer | Number of retweets |
| replies_count | Integer | Number of replies |
| posted_date | DateTime | Tweet posting date |
| tweet_url | String (512) | Full tweet URL |
| media_urls | JSON | Array of media URLs |
| scraped_at | DateTime | Scrape timestamp |

### scrape_log
| Column | Type | Description |
|--------|------|-------------|
| id | Integer | Primary key |
| account_id | Integer | Foreign key to accounts |
| scraped_at | DateTime | Scrape timestamp |
| tweets_found | Integer | Number of tweets found |
| status | String (20) | success/failed |
| error_message | Text | Error details if failed |

## Project Structure

```
x-scraper-scrapling/
├── main.py              # FastAPI app & API endpoints
├── scraper.py           # Scrapling-based X.com scraper
├── models.py            # SQLAlchemy models
├── database.py          # Database setup
├── scheduler.py         # APScheduler setup
├── requirements.txt     # Dependencies
├── .env.example         # Environment variables template
├── README.md            # Documentation
└── x_scraper.db         # SQLite database (created at runtime)
```

## Usage Examples

### Example 1: Scrape a Single Tweet

```bash
# Scrape a single tweet by URL
curl -X POST http://localhost:8000/api/scrape/tweet \
  -H "Content-Type: application/json" \
  -d '{
    "url": "https://x.com/patrickstox/status/2029697020965884325"
  }'
```

### Example 2: Scrape Account Timeline

```bash
# Scrape last 20 tweets from an account
curl -X POST http://localhost:8000/api/scrape/account \
  -H "Content-Type: application/json" \
  -d '{
    "username": "patrickstox",
    "max_tweets": 20
  }'
```

### Example 3: Complete Workflow (Database Storage)

```bash
# 1. Start the server
python main.py

# 2. Add an account to scrape (stored in database)
curl -X POST http://localhost:8000/api/accounts \
  -H "Content-Type: application/json" \
  -d '{"username": "nasa", "display_name": "NASA"}'

# 3. Trigger immediate scrape (stored in database)
curl -X POST http://localhost:8000/api/scrape/account/1

# 4. Get scraped tweets from database
curl http://localhost:8000/api/accounts/1/tweets

# 5. Check scrape history
curl http://localhost:8000/api/scrape/history?account_id=1
```

### Example 4: Filter Tweets by Date

```bash
# Get tweets from January 2024
curl "http://localhost:8000/api/tweets?date_from=2024-01-01&date_to=2024-01-31"
```

### Example 5: Monitor Scheduler Status

```bash
# Check if scheduler is running
curl http://localhost:8000/api/scrape/status

# View recent scrape attempts
curl http://localhost:8000/api/scrape/history?limit=10
```

## Important Notes

### Dual Mode Scraping

This scraper supports two modes of operation:

1. **Single Tweet Scraping** (`/api/scrape/tweet`)
   - Uses `StealthyFetcher` for fast, efficient extraction
   - No JavaScript rendering needed
   - Best for scraping individual tweets
   - Lower rate limit impact

2. **Account Timeline Scraping** (`/api/scrape/account`)
   - Uses `DynamicFetcher` with browser automation
   - Handles infinite scroll to load more tweets
   - Extracts entire account timelines
   - Includes 2-3 second delays between scrolls to respect rate limits
   - May take 30-60 seconds for 50 tweets

### Rate Limiting Guidelines

- **Timeline Scraping**: Includes built-in delays (2-3 seconds + random jitter between scrolls)
- **Respect X.com's limits**: Don't scrape the same account multiple times in quick succession
- **Batch operations**: Space out large scraping jobs over time
- **Monitoring**: Check `/api/scrape/history` for successful vs failed scrapes

### Best Practices

1. **For Single Tweets**: Use `/api/scrape/tweet` - faster and more efficient
2. **For Account Timelines**: Use `/api/scrape/account` with reasonable `max_tweets` (10-50 recommended)
3. **Error Handling**: The API returns detailed error messages for:
   - Invalid URLs
   - Private/suspended accounts
   - Empty timelines
   - Network errors
4. **Media Extraction**: Both modes extract image/video URLs from tweets
5. **Timestamps**: All dates are returned in ISO 8601 format

### Account Status

The scraper automatically detects and handles:
- **Private accounts**: Returns error message
- **Suspended accounts**: Returns error message
- **Empty timelines**: Returns empty results
- **Rate limiting**: Built-in delays prevent most issues

### Other Notes

- **Public Profiles Only**: This scraper works with public X.com profiles. No authentication is required.
- **Cloudflare Bypass**: Uses Scrapling's StealthyFetcher which handles browser automation and anti-bot measures.
- **Scheduled Scraping**: By default, scraping runs once daily at 9:00 AM. Configure via `.env` file.
- **Data Storage**: Only stores publicly available data from X.com profiles.

## Troubleshooting

### Scraping fails with "Failed to fetch page"
- Check your internet connection
- The profile might be private or suspended
- Cloudflare protection might have been updated (Scrapling will need an update)

### Scheduler not running
- Check the logs for any errors during startup
- Verify environment variables are set correctly
- Use `/api/scrape/status` to check scheduler state

### Database errors
- Ensure the application has write permissions in the directory
- Delete `x_scraper.db` and restart to recreate the database
- Check SQLAlchemy logs for detailed error messages

## License

MIT License - Feel free to use this project for any purpose.

## Contributing

Contributions are welcome! Please feel free to submit issues or pull requests.
