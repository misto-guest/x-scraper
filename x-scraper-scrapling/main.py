from fastapi import FastAPI, Depends, HTTPException, Query
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.orm import Session
from typing import List, Optional
from datetime import datetime, date
from pydantic import BaseModel
import logging

from database import get_db, init_db
from models import Account, Tweet, ScrapeLog
from models import TweetScrapeRequest, AccountScrapeRequest, TweetData, ScrapeResponse
from scraper import XComScraper
from scheduler import init_scheduler, start_scheduler, scrape_account_task, get_scheduler_status

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

# Initialize FastAPI app
app = FastAPI(
    title="X.com Scraper API",
    description="REST API for scraping and managing X.com (Twitter) profiles",
    version="1.0.0"
)

# Add CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Global scraper instance
scraper = None


# Pydantic models for request/response
class AccountCreate(BaseModel):
    username: str
    display_name: Optional[str] = None


class AccountUpdate(BaseModel):
    username: Optional[str] = None
    display_name: Optional[str] = None
    is_active: Optional[bool] = None


class AccountResponse(BaseModel):
    id: int
    username: str
    display_name: Optional[str]
    created_at: datetime
    updated_at: datetime
    last_scraped_at: Optional[datetime]
    is_active: bool
    tweet_count: int = 0

    class Config:
        from_attributes = True


class TweetResponse(BaseModel):
    id: int
    tweet_id: str
    account_id: int
    text: str
    likes_count: int
    retweets_count: int
    replies_count: int
    posted_date: Optional[datetime]
    tweet_url: Optional[str]
    media_urls: Optional[List[str]]
    scraped_at: datetime

    class Config:
        from_attributes = True


class ScrapeLogResponse(BaseModel):
    id: int
    account_id: Optional[int]
    scraped_at: datetime
    tweets_found: int
    status: str
    error_message: Optional[str]

    class Config:
        from_attributes = True


class ScrapeStatusResponse(BaseModel):
    running: bool
    jobs: List[dict]


# Startup event
@app.on_event("startup")
async def startup_event():
    global scraper
    init_db()
    init_scheduler()
    start_scheduler()
    scraper = XComScraper()
    logger.info("X.com Scraper API started")


# Shutdown event
@app.on_event("shutdown")
async def shutdown_event():
    global scraper
    if scraper:
        scraper.close()
    logger.info("X.com Scraper API stopped")


# Health check
@app.get("/")
async def root():
    return {
        "message": "X.com Scraper API",
        "version": "1.0.0",
        "status": "running"
    }


# Health check endpoint
@app.get("/health")
async def health_check():
    return {"status": "healthy"}


# ============ ACCOUNT ENDPOINTS ============

@app.post("/api/accounts", response_model=AccountResponse)
async def create_account(account: AccountCreate, db: Session = Depends(get_db)):
    """Add a new account to scrape."""
    # Check if username already exists
    existing = db.query(Account).filter(Account.username == account.username).first()
    if existing:
        raise HTTPException(status_code=400, detail="Username already exists")
    
    db_account = Account(
        username=account.username,
        display_name=account.display_name
    )
    db.add(db_account)
    db.commit()
    db.refresh(db_account)
    
    logger.info(f"Created account: @{account.username}")
    return db_account


@app.get("/api/accounts", response_model=List[AccountResponse])
async def list_accounts(
    skip: int = Query(0, ge=0),
    limit: int = Query(100, ge=1, le=1000),
    active_only: bool = False,
    db: Session = Depends(get_db)
):
    """List all accounts."""
    query = db.query(Account)
    
    if active_only:
        query = query.filter(Account.is_active == True)
    
    accounts = query.offset(skip).limit(limit).all()
    
    # Add tweet count
    result = []
    for account in accounts:
        account_dict = AccountResponse.model_validate(account).model_dump()
        account_dict["tweet_count"] = db.query(Tweet).filter(Tweet.account_id == account.id).count()
        result.append(AccountResponse(**account_dict))
    
    return result


@app.get("/api/accounts/{account_id}", response_model=AccountResponse)
async def get_account(account_id: int, db: Session = Depends(get_db)):
    """Get account details."""
    account = db.query(Account).filter(Account.id == account_id).first()
    if not account:
        raise HTTPException(status_code=404, detail="Account not found")
    
    account_dict = AccountResponse.model_validate(account).model_dump()
    account_dict["tweet_count"] = db.query(Tweet).filter(Tweet.account_id == account.id).count()
    
    return AccountResponse(**account_dict)


@app.put("/api/accounts/{account_id}", response_model=AccountResponse)
async def update_account(account_id: int, account_update: AccountUpdate, db: Session = Depends(get_db)):
    """Update account details."""
    account = db.query(Account).filter(Account.id == account_id).first()
    if not account:
        raise HTTPException(status_code=404, detail="Account not found")
    
    if account_update.username is not None:
        # Check if new username already exists
        existing = db.query(Account).filter(
            Account.username == account_update.username,
            Account.id != account_id
        ).first()
        if existing:
            raise HTTPException(status_code=400, detail="Username already exists")
        account.username = account_update.username
    
    if account_update.display_name is not None:
        account.display_name = account_update.display_name
    
    if account_update.is_active is not None:
        account.is_active = account_update.is_active
    
    account.updated_at = datetime.utcnow()
    
    db.commit()
    db.refresh(account)
    
    logger.info(f"Updated account: @{account.username}")
    return account


@app.delete("/api/accounts/{account_id}")
async def delete_account(account_id: int, db: Session = Depends(get_db)):
    """Delete an account."""
    account = db.query(Account).filter(Account.id == account_id).first()
    if not account:
        raise HTTPException(status_code=404, detail="Account not found")
    
    username = account.username
    db.delete(account)
    db.commit()
    
    logger.info(f"Deleted account: @{username}")
    return {"message": f"Account @{username} deleted"}


# ============ TWEET ENDPOINTS ============

@app.get("/api/tweets", response_model=List[TweetResponse])
async def list_tweets(
    account_id: Optional[int] = None,
    date_from: Optional[date] = None,
    date_to: Optional[date] = None,
    limit: int = Query(100, ge=1, le=1000),
    skip: int = Query(0, ge=0),
    db: Session = Depends(get_db)
):
    """Get all scraped tweets with optional filters."""
    query = db.query(Tweet)
    
    if account_id is not None:
        query = query.filter(Tweet.account_id == account_id)
    
    if date_from:
        query = query.filter(Tweet.posted_date >= date_from)
    
    if date_to:
        end_date = datetime.combine(date_to, datetime.max.time())
        query = query.filter(Tweet.posted_date <= end_date)
    
    tweets = query.order_by(Tweet.posted_date.desc()).offset(skip).limit(limit).all()
    return tweets


@app.get("/api/tweets/{tweet_id}", response_model=TweetResponse)
async def get_tweet(tweet_id: int, db: Session = Depends(get_db)):
    """Get a single tweet by database ID."""
    tweet = db.query(Tweet).filter(Tweet.id == tweet_id).first()
    if not tweet:
        raise HTTPException(status_code=404, detail="Tweet not found")
    return tweet


@app.get("/api/accounts/{account_id}/tweets", response_model=List[TweetResponse])
async def get_account_tweets(
    account_id: int,
    limit: int = Query(100, ge=1, le=1000),
    skip: int = Query(0, ge=0),
    db: Session = Depends(get_db)
):
    """Get all tweets for a specific account."""
    # Verify account exists
    account = db.query(Account).filter(Account.id == account_id).first()
    if not account:
        raise HTTPException(status_code=404, detail="Account not found")
    
    tweets = db.query(Tweet).filter(
        Tweet.account_id == account_id
    ).order_by(Tweet.posted_date.desc()).offset(skip).limit(limit).all()
    
    return tweets


# ============ SCRAPING CONTROL ENDPOINTS ============

@app.post("/api/scrape/tweet", response_model=ScrapeResponse)
async def scrape_tweet(request: TweetScrapeRequest):
    """
    Scrape a single tweet by URL.

    Uses StealthyFetcher for fast, efficient single tweet extraction.
    """
    global scraper

    try:
        # Validate URL format
        if "x.com/" not in request.url and "twitter.com/" not in request.url:
            raise HTTPException(
                status_code=400,
                detail="Invalid URL. Must be an x.com or twitter.com URL"
            )

        logger.info(f"Scraping single tweet: {request.url}")

        # Scrape the tweet
        tweet_data = scraper.scrape_single_tweet(request.url)

        if not tweet_data:
            return ScrapeResponse(
                success=False,
                scraped_at=datetime.utcnow().isoformat(),
                tweets_count=0,
                tweets=[],
                error="Failed to scrape tweet. The URL may be invalid or the tweet may be private."
            )

        # Convert to TweetData format
        tweet_response = TweetData(
            tweet_id=tweet_data.get('tweet_id', ''),
            text=tweet_data.get('text', ''),
            author_username=tweet_data.get('username', ''),
            author_display_name=tweet_data.get('username', ''),  # Fallback to username
            likes=tweet_data.get('likes_count', 0),
            retweets=tweet_data.get('retweets_count', 0),
            replies=tweet_data.get('replies_count', 0),
            posted_date=tweet_data.get('posted_date').isoformat() if tweet_data.get('posted_date') else None,
            tweet_url=tweet_data.get('tweet_url', request.url),
            media_urls=tweet_data.get('media_urls') or [],
            scraped_at=tweet_data.get('scraped_at', datetime.utcnow()).isoformat()
        )

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
        logger.error(f"Error scraping tweet: {str(e)}")
        return ScrapeResponse(
            success=False,
            scraped_at=datetime.utcnow().isoformat(),
            tweets_count=0,
            tweets=[],
            error=f"Error: {str(e)}"
        )


@app.post("/api/scrape/account", response_model=ScrapeResponse)
async def scrape_account_timeline(request: AccountScrapeRequest):
    """
    Scrape recent tweets from an account's timeline.

    Uses DynamicFetcher with infinite scroll to extract multiple tweets.
    """
    global scraper

    try:
        # Validate username
        if not request.username or len(request.username) < 1:
            raise HTTPException(
                status_code=400,
                detail="Invalid username"
            )

        # Remove @ if present
        username = request.username.lstrip('@')

        logger.info(f"Scraping account timeline: @{username} (max {request.max_tweets} tweets)")

        # Scrape the timeline
        tweets_data = scraper.scrape_account_timeline(username, request.max_tweets)

        if not tweets_data:
            return ScrapeResponse(
                success=False,
                scraped_at=datetime.utcnow().isoformat(),
                tweets_count=0,
                tweets=[],
                error=f"No tweets found for @{username}. The account may be private, suspended, or have no tweets."
            )

        # Convert to TweetData format
        tweet_responses = []
        for tweet in tweets_data:
            tweet_response = TweetData(
                tweet_id=tweet.get('tweet_id', ''),
                text=tweet.get('text', ''),
                author_username=tweet.get('author_username', username),
                author_display_name=tweet.get('author_display_name', username),
                likes=tweet.get('likes', 0),
                retweets=tweet.get('retweets', 0),
                replies=tweet.get('replies', 0),
                posted_date=tweet.get('posted_date').isoformat() if tweet.get('posted_date') else None,
                tweet_url=tweet.get('tweet_url', ''),
                media_urls=tweet.get('media_urls') or [],
                scraped_at=tweet.get('scraped_at', datetime.utcnow()).isoformat()
            )
            tweet_responses.append(tweet_response)

        return ScrapeResponse(
            success=True,
            scraped_at=datetime.utcnow().isoformat(),
            tweets_count=len(tweet_responses),
            tweets=tweet_responses,
            message=f"Successfully scraped {len(tweet_responses)} tweets from @{username}"
        )

    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error scraping account timeline: {str(e)}")
        return ScrapeResponse(
            success=False,
            scraped_at=datetime.utcnow().isoformat(),
            tweets_count=0,
            tweets=[],
            error=f"Error: {str(e)}"
        )

@app.post("/api/scrape/now")
async def scrape_all_now(db: Session = Depends(get_db)):
    """Trigger immediate scrape for all active accounts."""
    accounts = db.query(Account).filter(Account.is_active == True).all()
    
    if not accounts:
        raise HTTPException(status_code=404, detail="No active accounts found")
    
    results = []
    for account in accounts:
        try:
            scrape_account_task(account.id)
            results.append({
                "account_id": account.id,
                "username": account.username,
                "status": "triggered"
            })
        except Exception as e:
            results.append({
                "account_id": account.id,
                "username": account.username,
                "status": "failed",
                "error": str(e)
            })
    
    return {
        "message": f"Scrape triggered for {len(accounts)} accounts",
        "results": results
    }


@app.post("/api/scrape/account/{account_id}")
async def scrape_account_now(account_id: int, db: Session = Depends(get_db)):
    """Scrape a specific account now."""
    account = db.query(Account).filter(Account.id == account_id).first()
    if not account:
        raise HTTPException(status_code=404, detail="Account not found")
    
    if not account.is_active:
        raise HTTPException(status_code=400, detail="Account is not active")
    
    try:
        scrape_account_task(account_id)
        return {
            "message": f"Scrape triggered for @{account.username}",
            "account_id": account_id,
            "username": account.username
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Scrape failed: {str(e)}")


@app.get("/api/scrape/status", response_model=ScrapeStatusResponse)
async def get_scrape_status():
    """Get the current status of the scheduler."""
    return get_scheduler_status()


@app.get("/api/scrape/history", response_model=List[ScrapeLogResponse])
async def get_scrape_history(
    account_id: Optional[int] = None,
    limit: int = Query(100, ge=1, le=1000),
    skip: int = Query(0, ge=0),
    db: Session = Depends(get_db)
):
    """Get scrape history log."""
    query = db.query(ScrapeLog)
    
    if account_id is not None:
        query = query.filter(ScrapeLog.account_id == account_id)
    
    logs = query.order_by(ScrapeLog.scraped_at.desc()).offset(skip).limit(limit).all()
    return logs


# Run the app
if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
