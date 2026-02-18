#!/usr/bin/env python3
"""
Fetch and monitor tweets from @notgrahamp
Uses stealthy fetching with incremental storage
"""

import os
import re
import json
import logging
from datetime import datetime
from pathlib import Path
from urllib.parse import unquote

try:
    import requests
    from bs4 import BeautifulSoup
except ImportError:
    print("Installing required dependencies...")
    os.system("pip3 install requests beautifulsoup4 -q")
    import requests
    from bs4 import BeautifulSoup

# Configuration
USERNAME = "notgrahamp"
BASE_DIR = Path("/Users/northsea/clawd-dmitry")
DATA_DIR = BASE_DIR / "data" / "notgrahamp-tweets"
DIGEST_DIR = BASE_DIR / "data" / "notgrahamp-daily-digest"
STATE_FILE = BASE_DIR / "data" / "notgrahamp-state.json"
LOG_FILE = BASE_DIR / "logs" / "notgrahamp-fetch.log"

# Setup directories
DATA_DIR.mkdir(parents=True, exist_ok=True)
DIGEST_DIR.mkdir(parents=True, exist_ok=True)
(BASE_DIR / "logs").mkdir(parents=True, exist_ok=True)

# Setup logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(levelname)s - %(message)s',
    handlers=[
        logging.FileHandler(LOG_FILE),
        logging.StreamHandler()
    ]
)
logger = logging.getLogger(__name__)


class TweetMonitor:
    def __init__(self):
        self.state = self.load_state()
        self.session = requests.Session()
        self.session.headers.update({
            'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
            'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
            'Accept-Language': 'en-US,en;q=0.9',
        })

    def load_state(self):
        """Load the last known tweet IDs"""
        if STATE_FILE.exists():
            try:
                return json.loads(STATE_FILE.read_text())
            except Exception as e:
                logger.warning(f"Could not load state file: {e}")
        return {
            "last_fetch": None,
            "seen_tweet_ids": [],
            "total_tweets_fetched": 0
        }

    def save_state(self):
        """Save current state"""
        self.state["last_fetch"] = datetime.now().isoformat()
        STATE_FILE.write_text(json.dumps(self.state, indent=2))

    def fetch_tweets_ghostfetch(self, url):
        """Try using GhostFetch if available"""
        try:
            import subprocess
            result = subprocess.run(
                ['ghostfetch', 'serve', '--port', '19531'],
                capture_output=True,
                text=True,
                timeout=5
            )
            # GhostFetch runs as server, try HTTP request
            response = self.session.get('http://localhost:19531/fetch', 
                                      params={'url': url},
                                      timeout=10)
            if response.status_code == 200:
                return response.text
        except Exception as e:
            logger.debug(f"GhostFetch not available: {e}")
        return None

    def fetch_tweets_direct(self):
        """Fetch tweets using direct HTTP request"""
        url = f"https://x.com/{USERNAME}"
        logger.info(f"Fetching tweets from {url}")
        
        try:
            response = self.session.get(url, timeout=15, allow_redirects=True)
            response.raise_for_status()
            return response.text
        except requests.RequestException as e:
            logger.error(f"Failed to fetch page: {e}")
            return None

    def parse_tweets(self, html_content):
        """Parse tweets from HTML"""
        if not html_content:
            return []
        
        soup = BeautifulSoup(html_content, 'html.parser')
        tweets = []
        
        # Twitter/X stores tweet data in JavaScript variables
        # Try to extract from script tags
        for script in soup.find_all('script'):
            script_content = script.string
            if script_content and 'tweet' in script_content.lower():
                # Look for tweet patterns in the JS
                # This is a simplified parser - production would use more robust extraction
                tweet_matches = re.findall(r'"tweet_id":"(\d+)"', script_content)
                text_matches = re.findall(r'"text":"([^"]+)"', script_content)
                
                for i, tweet_id in enumerate(tweet_matches):
                    if tweet_id not in self.state["seen_tweet_ids"]:
                        tweet_text = text_matches[i] if i < len(text_matches) else "N/A"
                        tweets.append({
                            "id": tweet_id,
                            "text": unquote(tweet_text).replace('\\u', '\\u'),
                            "url": f"https://x.com/{USERNAME}/status/{tweet_id}",
                            "fetched_at": datetime.now().isoformat()
                        })
        
        # Also try to find tweets in the HTML structure
        for article in soup.find_all('article'):
            tweet_link = article.find('a', href=re.compile(r'/status/\d+'))
            if tweet_link:
                tweet_url = tweet_link['href']
                tweet_id = tweet_url.split('/status/')[-1].split('?')[0]
                
                if tweet_id not in self.state["seen_tweet_ids"]:
                    # Extract tweet text
                    tweet_text_elem = article.find(['div', 'span'], 
                                                   class_=re.compile(r'text|tweet|message'))
                    tweet_text = tweet_text_elem.get_text(strip=True) if tweet_text_elem else "N/A"
                    
                    tweets.append({
                        "id": tweet_id,
                        "text": tweet_text[:500],  # Limit length
                        "url": f"https://x.com{tweet_url}",
                        "fetched_at": datetime.now().isoformat()
                    })
        
        return tweets

    def save_tweets(self, tweets):
        """Save tweets to individual markdown files"""
        if not tweets:
            logger.info("No new tweets to save")
            return 0
        
        saved_count = 0
        for tweet in tweets:
            try:
                filename = f"tweet-{tweet['id']}.md"
                filepath = DATA_DIR / filename
                
                if not filepath.exists():
                    content = f"""---
tweet_id: {tweet['id']}
username: @{USERNAME}
url: {tweet['url']}
fetched_at: {tweet['fetched_at']}
---

# Tweet from @{USERNAME}

**Date:** {tweet['fetched_at']}
**Tweet ID:** {tweet['id']}
**URL:** {tweet['url']}

## Content

{tweet['text']}

## Engagement

*Metrics not available in basic scraping*

## Images

*No images found in basic scraping*

---
*Fetched by tweet monitor*
"""
                    filepath.write_text(content)
                    self.state["seen_tweet_ids"].insert(0, tweet['id'])
                    saved_count += 1
                    logger.info(f"Saved tweet {tweet['id']}")
            except Exception as e:
                logger.error(f"Failed to save tweet {tweet.get('id', 'unknown')}: {e}")
        
        # Keep only last 1000 tweet IDs in state
        if len(self.state["seen_tweet_ids"]) > 1000:
            self.state["seen_tweet_ids"] = self.state["seen_tweet_ids"][:1000]
        
        self.state["total_tweets_fetched"] += saved_count
        return saved_count

    def generate_digest(self):
        """Generate daily digest"""
        today = datetime.now().strftime("%Y-%m-%d")
        digest_file = DIGEST_DIR / f"daily-digest-{today}.md"
        
        # Find today's tweets
        today_tweets = []
        for tweet_file in DATA_DIR.glob(f"tweet-*.md"):
            content = tweet_file.read_text()
            if today in content:
                today_tweets.append(tweet_file)
        
        digest_content = f"""# Daily Tweet Digest - @{USERNAME}
**Date:** {today}
**Generated:** {datetime.now().strftime("%Y-%m-%d %H:%M:%S")}

## Summary

- Total tweets monitored: {self.state['total_tweets_fetched']}
- New tweets today: {len(today_tweets)}
- Last fetch: {self.state.get('last_fetch', 'Never')}

## New Tweets Today

"""
        
        if today_tweets:
            for i, tweet_file in enumerate(sorted(today_tweets, reverse=True)[:10], 1):
                content = tweet_file.read_text()
                # Extract key info
                url_match = re.search(r'\*URL:\*\s+(https://[^\s]+)', content)
                text_match = re.search(r'## Content\s+(.+?)(?=##|\n---|\n$)', content, re.DOTALL)
                
                digest_content += f"\n### Tweet {i}\n"
                if url_match:
                    digest_content += f"**URL:** {url_match.group(1)}\n\n"
                if text_match:
                    digest_content += f"{text_match.group(1).strip()}\n\n"
        else:
            digest_content += "\n*No new tweets today*\n"
        
        digest_content += f"""
## Key Insights

*Template section - to be filled manually*

## Action Items

*Template section - to be filled manually*

## Engagement Analysis

*Template section - to be filled manually*

---
*Auto-generated by tweet monitoring system*
"""
        
        digest_file.write_text(digest_content)
        logger.info(f"Generated daily digest: {digest_file}")
        return digest_file

    def run(self):
        """Main execution"""
        logger.info("Starting tweet fetch run")
        
        # Fetch tweets
        html_content = self.fetch_tweets_direct()
        
        # Parse tweets
        tweets = self.parse_tweets(html_content)
        
        # Save new tweets
        new_count = self.save_tweets(tweets)
        
        # Generate digest
        self.generate_digest()
        
        # Save state
        self.save_state()
        
        logger.info(f"Run complete. Fetched {new_count} new tweets")
        return new_count


def main():
    monitor = TweetMonitor()
    try:
        count = monitor.run()
        return 0 if count >= 0 else 1
    except Exception as e:
        logger.error(f"Fatal error: {e}", exc_info=True)
        return 1


if __name__ == "__main__":
    exit(main())
