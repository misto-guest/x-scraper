import logging
from apscheduler.schedulers.background import BackgroundScheduler
from apscheduler.triggers.cron import CronTrigger
from datetime import datetime
from sqlalchemy.orm import Session
from database import SessionLocal
from models import Account, ScrapeLog
from scraper import XComScraper
import os
from dotenv import load_dotenv

load_dotenv()

logger = logging.getLogger(__name__)

# Global scheduler instance
scheduler = None
scraper = None


def scrape_account_task(account_id: int):
    """
    Task to scrape a single account.
    """
    db = SessionLocal()
    try:
        account = db.query(Account).filter(Account.id == account_id).first()
        if not account or not account.is_active:
            logger.info(f"Account {account_id} not found or inactive, skipping")
            return
        
        logger.info(f"Starting scheduled scrape for @{account.username}")
        
        # Initialize scraper if needed
        global scraper
        if scraper is None:
            scraper = XComScraper()
        
        # Scrape tweets
        tweets = scraper.scrape_account(account.username)
        
        # Store tweets in database
        from models import Tweet
        
        tweets_added = 0
        for tweet_data in tweets:
            # Check if tweet already exists
            existing = db.query(Tweet).filter(Tweet.tweet_id == tweet_data['tweet_id']).first()
            if not existing:
                tweet = Tweet(
                    tweet_id=tweet_data['tweet_id'],
                    account_id=account.id,
                    text=tweet_data['text'],
                    likes_count=tweet_data.get('likes_count', 0),
                    retweets_count=tweet_data.get('retweets_count', 0),
                    replies_count=tweet_data.get('replies_count', 0),
                    posted_date=tweet_data.get('posted_date'),
                    tweet_url=tweet_data.get('tweet_url'),
                    media_urls=tweet_data.get('media_urls'),
                    scraped_at=datetime.utcnow()
                )
                db.add(tweet)
                tweets_added += 1
        
        # Update account's last_scraped_at
        account.last_scraped_at = datetime.utcnow()
        
        # Log the scrape
        scrape_log = ScrapeLog(
            account_id=account.id,
            scraped_at=datetime.utcnow(),
            tweets_found=len(tweets),
            status="success",
            error_message=None
        )
        db.add(scrape_log)
        
        db.commit()
        
        logger.info(f"Scrape completed for @{account.username}: {len(tweets)} tweets found, {tweets_added} new tweets added")
        
    except Exception as e:
        logger.error(f"Error scraping account {account_id}: {str(e)}")
        
        # Log the failure
        try:
            scrape_log = ScrapeLog(
                account_id=account_id,
                scraped_at=datetime.utcnow(),
                tweets_found=0,
                status="failed",
                error_message=str(e)[:500]
            )
            db.add(scrape_log)
            db.commit()
        except:
            pass
    finally:
        db.close()


def scrape_all_accounts_task():
    """
    Task to scrape all active accounts.
    """
    db = SessionLocal()
    try:
        accounts = db.query(Account).filter(Account.is_active == True).all()
        logger.info(f"Starting scheduled scrape for {len(accounts)} accounts")
        
        for account in accounts:
            try:
                scrape_account_task(account.id)
            except Exception as e:
                logger.error(f"Error in scrape_all_accounts for @{account.username}: {str(e)}")
        
    except Exception as e:
        logger.error(f"Error in scrape_all_accounts_task: {str(e)}")
    finally:
        db.close()


def init_scheduler():
    """
    Initialize the APScheduler with scheduled jobs.
    """
    global scheduler
    
    if scheduler is not None:
        logger.warning("Scheduler already initialized")
        return scheduler
    
    scheduler = BackgroundScheduler()
    
    # Get schedule time from environment
    schedule_hour = int(os.getenv("SCHEDULE_HOUR", "9"))
    schedule_minute = int(os.getenv("SCHEDULE_MINUTE", "0"))
    
    # Add daily job to scrape all accounts
    scheduler.add_job(
        scrape_all_accounts_task,
        trigger=CronTrigger(hour=schedule_hour, minute=schedule_minute),
        id='daily_scrape',
        name='Daily scrape all accounts',
        replace_existing=True
    )
    
    logger.info(f"Scheduler initialized: Daily scrape at {schedule_hour:02d}:{schedule_minute:02d}")
    
    return scheduler


def start_scheduler():
    """
    Start the scheduler.
    """
    global scheduler
    
    if scheduler is None:
        init_scheduler()
    
    if not scheduler.running:
        scheduler.start()
        logger.info("Scheduler started")
    else:
        logger.warning("Scheduler already running")


def stop_scheduler():
    """
    Stop the scheduler.
    """
    global scheduler
    
    if scheduler and scheduler.running:
        scheduler.shutdown(wait=False)
        logger.info("Scheduler stopped")


def get_scheduler_status():
    """
    Get the current status of the scheduler.
    """
    global scheduler
    
    if scheduler is None:
        return {
            "running": False,
            "jobs": []
        }
    
    jobs = []
    for job in scheduler.get_jobs():
        jobs.append({
            "id": job.id,
            "name": job.name,
            "next_run_time": job.next_run_time.isoformat() if job.next_run_time else None
        })
    
    return {
        "running": scheduler.running,
        "jobs": jobs
    }
