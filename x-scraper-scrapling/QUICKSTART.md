# Quick Start Guide

Get up and running with X.com Scraper in 5 minutes!

## 1. Install Dependencies

```bash
pip install -r requirements.txt
```

## 2. Configure Environment

```bash
cp .env.example .env
```

Edit `.env` if needed (defaults are fine for most users).

## 3. Test Setup

```bash
python test_setup.py
```

You should see all tests pass.

## 4. Start the Server

```bash
python main.py
```

Or use the start script:
```bash
./start.sh
```

The API will be available at http://localhost:8000

## 5. Add Your First Account

```bash
curl -X POST http://localhost:8000/api/accounts \
  -H "Content-Type: application/json" \
  -d '{"username": "nasa"}'
```

## 6. Scrape Tweets

```bash
# Scrape the account immediately
curl -X POST http://localhost:8000/api/scrape/account/1

# Get the scraped tweets
curl http://localhost:8000/api/accounts/1/tweets
```

## 7. View API Documentation

Open your browser:
- **Swagger UI**: http://localhost:8000/docs
- **ReDoc**: http://localhost:8000/redoc

## Common Issues

### Import Error: No module named 'scrapling'
```bash
pip install -U scrapling[fetchers]
```

### Database Permission Error
Make sure the application has write permissions in the current directory.

### Scraping Fails
- Verify the X.com profile is public
- Check your internet connection
- The scraper might need updates if Cloudflare changed

## Next Steps

- Read the full [README.md](README.md) for detailed documentation
- Configure scheduled scraping in `.env`
- Add multiple accounts to track
- Set up automated monitoring

## Support

For issues or questions, check the main README or create an issue in the repository.
