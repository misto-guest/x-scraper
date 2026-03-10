from sqlalchemy import Column, Integer, String, Boolean, DateTime, ForeignKey, Text, JSON
from sqlalchemy.orm import relationship
from datetime import datetime
from pydantic import BaseModel, Field
from typing import List, Optional
from database import Base


class Account(Base):
    __tablename__ = "accounts"

    id = Column(Integer, primary_key=True, index=True)
    username = Column(String(100), unique=True, index=True, nullable=False)
    display_name = Column(String(255))
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    last_scraped_at = Column(DateTime, nullable=True)
    is_active = Column(Boolean, default=True)

    tweets = relationship("Tweet", back_populates="account", cascade="all, delete-orphan")
    scrape_logs = relationship("ScrapeLog", back_populates="account", cascade="all, delete-orphan")


class Tweet(Base):
    __tablename__ = "tweets"

    id = Column(Integer, primary_key=True, index=True)
    tweet_id = Column(String(50), unique=True, index=True, nullable=False)
    account_id = Column(Integer, ForeignKey("accounts.id"), nullable=False)
    text = Column(Text, nullable=False)
    likes_count = Column(Integer, default=0)
    retweets_count = Column(Integer, default=0)
    replies_count = Column(Integer, default=0)
    posted_date = Column(DateTime, nullable=True)
    tweet_url = Column(String(512))
    media_urls = Column(JSON, nullable=True)
    scraped_at = Column(DateTime, default=datetime.utcnow)

    account = relationship("Account", back_populates="tweets")


class ScrapeLog(Base):
    __tablename__ = "scrape_log"

    id = Column(Integer, primary_key=True, index=True)
    account_id = Column(Integer, ForeignKey("accounts.id"), nullable=True)
    scraped_at = Column(DateTime, default=datetime.utcnow)
    tweets_found = Column(Integer, default=0)
    status = Column(String(20), default="success")
    error_message = Column(Text, nullable=True)

    account = relationship("Account", back_populates="scrape_logs")


# ============ PYDANTIC MODELS FOR API ============

class TweetScrapeRequest(BaseModel):
    """Request model for scraping a single tweet by URL"""
    url: str


class AccountScrapeRequest(BaseModel):
    """Request model for scraping an account timeline"""
    username: str
    max_tweets: int = Field(default=50, ge=1, le=200)


class TweetData(BaseModel):
    """Response model for a single tweet"""
    tweet_id: str
    text: str
    author_username: str
    author_display_name: str
    likes: int
    retweets: int
    replies: int
    posted_date: Optional[str] = None  # ISO format datetime
    tweet_url: str
    media_urls: List[str] = []
    scraped_at: str

    class Config:
        json_encoders = {
            datetime: lambda v: v.isoformat()
        }


class ScrapeResponse(BaseModel):
    """Standard response for scrape operations"""
    success: bool
    scraped_at: str
    tweets_count: int
    tweets: List[TweetData]
    message: Optional[str] = None
    error: Optional[str] = None
