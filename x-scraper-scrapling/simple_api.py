#!/usr/bin/env python3
"""
Simple standalone API server for X.com scraper
"""
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field
from typing import List, Optional
from datetime import datetime
import uvicorn

from scrapling.fetchers import StealthyFetcher, DynamicFetcher
import re
import time
import random

# FastAPI app
app = FastAPI(
    title="X.com Scraper API",
    description="Scrape tweets and timelines from X.com using Scrapling",
    version="1.0.0"
)

# CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Request models
class TweetScrapeRequest(BaseModel):
    url: str

class AccountScrapeRequest(BaseModel):
    username: str
    max_tweets: int = Field(default=10, ge=1, le=50)

class TweetData(BaseModel):
    tweet_id: str
    text: str
    author_username: str
    likes: int = 0
    retweets: int = 0
    replies: int = 0
    posted_date: Optional[str] = None
    tweet_url: str
    media_urls: List[str] = []
    scraped_at: str

class ScrapeResponse(BaseModel):
    success: bool
    scraped_at: str
    tweets_count: int
    tweets: List[TweetData]
    message: Optional[str] = None
    error: Optional[str] = None

# Helper functions
def parse_count(count_str: str) -> int:
    """Parse count string (1.2K, 500) to int"""
    if not count_str:
        return 0
    count_str = count_str.strip().upper()
    if 'K' in count_str:
        return int(float(count_str.replace('K', '').replace(',', '').strip()) * 1000)
    elif 'M' in count_str:
        return int(float(count_str.replace('M', '').replace(',', '').strip()) * 1000000)
    else:
        try:
            return int(count_str.replace(',', '').strip())
        except:
            return 0

# Scraping functions
def scrape_single_tweet_fn(url: str) -> dict:
    """Scrape a single tweet by URL"""
    try:
        page = StealthyFetcher.fetch(
            url,
            headless=True,
            network_idle=True,
            solve_cloudflare=True
        )

        # Extract from page title
        title = page.css('title::text').get() or ''

        # Extract tweet ID from URL
        tweet_id_match = re.search(r'/status/(\d+)', url)
        tweet_id = tweet_id_match.group(1) if tweet_id_match else 'unknown'

        # Extract username
        username_match = re.search(r'x\.com/([^/]+)', url)
        username = username_match.group(1) if username_match else 'unknown'

        # Get tweet text from title
        text_match = re.search(r'"([^"]+)"', title)
        text = text_match.group(1) if text_match else title

        return {
            'tweet_id': tweet_id,
            'text': text,
            'author_username': username,
            'author_display_name': username,
            'likes': 0,
            'retweets': 0,
            'replies': 0,
            'posted_date': None,
            'tweet_url': url,
            'media_urls': [],
            'scraped_at': datetime.utcnow().isoformat()
        }
    except Exception as e:
        return None

def scrape_account_timeline_fn(username: str, max_tweets: int = 10) -> List[dict]:
    """Scrape account timeline"""
    url = f'https://x.com/{username}'
    tweets = []

    try:
        page = DynamicFetcher.fetch(
            url,
            headless=True,
            network_idle=True
        )

        # Extract tweets
        tweet_elements = page.css('[data-testid="tweet"]')

        for i, tweet_elem in enumerate(tweet_elements[:max_tweets]):
            try:
                # Extract ID
                link = tweet_elem.css('a[href*="/status/"]')
                if link:
                    href = link[0].attrib.get('href', '')
                    match = re.search(r'/status/(\d+)', href)
                    tweet_id = match.group(1) if match else f'unknown_{i}'

                    # Extract text
                    text_elem = tweet_elem.css('div[lang]')
                    text = text_elem[0].text if text_elem else ''

                    tweets.append({
                        'tweet_id': tweet_id,
                        'text': text,
                        'author_username': username,
                        'author_display_name': username,
                        'likes': 0,
                        'retweets': 0,
                        'replies': 0,
                        'posted_date': None,
                        'tweet_url': f'https://x.com/{username}/status/{tweet_id}',
                        'media_urls': [],
                        'scraped_at': datetime.utcnow().isoformat()
                    })
            except:
                continue

        return tweets
    except Exception as e:
        return []

# API endpoints
@app.get("/")
async def root():
    return {
        "message": "X.com Scraper API",
        "version": "1.0.0",
        "endpoints": {
            "POST /api/scrape/tweet": "Scrape a single tweet by URL",
            "POST /api/scrape/account": "Scrape account timeline",
            "GET /docs": "Interactive API documentation"
        }
    }

@app.get("/health")
async def health():
    return {"status": "healthy", "timestamp": datetime.utcnow().isoformat()}

@app.post("/api/scrape/tweet", response_model=ScrapeResponse)
async def scrape_tweet(request: TweetScrapeRequest):
    """Scrape a single tweet by URL"""
    try:
        if "x.com/" not in request.url and "twitter.com/" not in request.url:
            raise HTTPException(status_code=400, detail="Invalid URL")

        tweet_data = scrape_single_tweet_fn(request.url)

        if not tweet_data:
            return ScrapeResponse(
                success=False,
                scraped_at=datetime.utcnow().isoformat(),
                tweets_count=0,
                tweets=[],
                error="Failed to scrape tweet"
            )

        tweet_response = TweetData(**tweet_data)

        return ScrapeResponse(
            success=True,
            scraped_at=datetime.utcnow().isoformat(),
            tweets_count=1,
            tweets=[tweet_response],
            message="Successfully scraped tweet"
        )
    except HTTPException:
        raise
    except Exception as e:
        return ScrapeResponse(
            success=False,
            scraped_at=datetime.utcnow().isoformat(),
            tweets_count=0,
            tweets=[],
            error=str(e)
        )

@app.post("/api/scrape/account", response_model=ScrapeResponse)
async def scrape_account(request: AccountScrapeRequest):
    """Scrape account timeline"""
    try:
        username = request.username.lstrip('@')

        tweets_data = scrape_account_timeline_fn(username, request.max_tweets)

        if not tweets_data:
            return ScrapeResponse(
                success=False,
                scraped_at=datetime.utcnow().isoformat(),
                tweets_count=0,
                tweets=[],
                error=f"No tweets found for @{username}"
            )

        tweet_responses = [TweetData(**t) for t in tweets_data]

        return ScrapeResponse(
            success=True,
            scraped_at=datetime.utcnow().isoformat(),
            tweets_count=len(tweet_responses),
            tweets=tweet_responses,
            message=f"Successfully scraped {len(tweet_responses)} tweets from @{username}"
        )
    except Exception as e:
        return ScrapeResponse(
            success=False,
            scraped_at=datetime.utcnow().isoformat(),
            tweets_count=0,
            tweets=[],
            error=str(e)
        )

if __name__ == "__main__":
    print("🚀 Starting X.com Scraper API...")
    print("📍 API: http://localhost:8000")
    print("📖 Docs: http://localhost:8000/docs")
    uvicorn.run(app, host="0.0.0.0", port=8000)
