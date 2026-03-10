import time
import logging
import random
from datetime import datetime
from typing import List, Dict, Optional
from scrapling.fetchers import StealthyFetcher, DynamicFetcher

logger = logging.getLogger(__name__)


class XComScraper:
    def __init__(self):
        self.stealthy_fetcher = StealthyFetcher(
            headless=True,
            timeout=30000,
            network_idle=True,
        )
        self.dynamic_fetcher = DynamicFetcher(
            headless=True,
            timeout=60000,
            network_idle=True,
        )
        self.base_url = "https://x.com"

    def scrape_account(self, username: str, max_tweets: int = 50) -> List[Dict]:
        """
        Scrape tweets from a public X.com profile.
        
        Args:
            username: The username to scrape (without @)
            max_tweets: Maximum number of tweets to extract
            
        Returns:
            List of tweet dictionaries
        """
        url = f"{self.base_url}/{username}"
        tweets = []
        
        try:
            logger.info(f"Starting scrape for @{username}")
            
            # Fetch the profile page
            response = self.fetcher.get(url)
            
            if not response or response.status_code != 200:
                logger.error(f"Failed to fetch page for @{username}: Status {response.status_code if response else 'No response'}")
                return tweets
            
            # Parse the HTML to extract tweet data
            # X.com uses dynamic loading, so we need to extract data from the HTML
            page_content = response.text
            
            # Try to find tweets in the HTML
            # X.com stores tweet data in JavaScript variables within the page
            import re
            
            # Look for tweet data in various formats
            # This is a simplified approach - X.com's structure changes frequently
            
            tweets = self._extract_tweets_from_html(page_content, username, max_tweets)
            
            logger.info(f"Extracted {len(tweets)} tweets from @{username}")
            
            # Add a small delay to be respectful
            time.sleep(2)
            
            return tweets
            
        except Exception as e:
            logger.error(f"Error scraping @{username}: {str(e)}")
            return tweets

    def _extract_tweets_from_html(self, html: str, username: str, max_tweets: int) -> List[Dict]:
        """
        Extract tweet data from the HTML content.
        
        This method parses the HTML to find tweet elements and extract their data.
        """
        tweets = []
        
        try:
            # Look for tweet elements in the HTML
            # X.com uses specific data attributes and CSS classes
            
            # Pattern to find tweet URLs
            tweet_url_pattern = rf'{self.base_url}/{username}/status/(\d+)'
            found_ids = set(re.findall(tweet_url_pattern, html))
            
            logger.info(f"Found {len(found_ids)} tweet IDs in page")
            
            # For each tweet ID, try to extract more information
            for tweet_id in list(found_ids)[:max_tweets]:
                tweet_data = self._extract_tweet_data(html, tweet_id, username)
                if tweet_data:
                    tweets.append(tweet_data)
            
            # Sort by date (most recent first)
            tweets.sort(key=lambda x: x.get('posted_date') or datetime.min, reverse=True)
            
        except Exception as e:
            logger.error(f"Error extracting tweets from HTML: {str(e)}")
        
        return tweets

    def _extract_tweet_data(self, html: str, tweet_id: str, username: str) -> Optional[Dict]:
        """
        Extract detailed data for a single tweet.
        """
        try:
            # Build tweet URL
            tweet_url = f"{self.base_url}/{username}/status/{tweet_id}"
            
            # Try to find the tweet text in the HTML
            # Look for the tweet ID in the page and extract surrounding data
            import re
            
            # Search for tweet content near the tweet ID
            # This is a simplified extraction - X.com's structure is complex
            tweet_pattern = rf'tweet_id.*?{tweet_id}.*?text.*?"(.*?)"'
            matches = re.findall(tweet_pattern, html, re.DOTALL | re.IGNORECASE)
            
            tweet_text = matches[0] if matches else ""
            # Unescape HTML entities
            import html
            tweet_text = html.unescape(tweet_text)
            
            # Try to extract engagement metrics
            likes_match = re.search(rf'favorite.*?{tweet_id}.*?(\d+)', html, re.IGNORECASE)
            retweets_match = re.search(rf'retweet.*?{tweet_id}.*?(\d+)', html, re.IGNORECASE)
            replies_match = re.search(rf'reply.*?{tweet_id}.*?(\d+)', html, re.IGNORECASE)
            
            # Try to extract media URLs
            media_pattern = rf'media_url.*?{tweet_id}.*?"(https?://[^"]+)"'
            media_matches = re.findall(media_pattern, html, re.DOTALL | re.IGNORECASE)
            
            # Try to extract date
            date_pattern = rf'created_at.*?{tweet_id}.*?"(\d{4}-\d{2}-\d{2}T[^"]+)"'
            date_match = re.search(date_pattern, html, re.IGNORECASE)
            
            posted_date = None
            if date_match:
                try:
                    posted_date = datetime.fromisoformat(date_match.group(1).replace('Z', '+00:00'))
                except:
                    pass
            
            tweet_data = {
                'tweet_id': tweet_id,
                'username': username,
                'text': tweet_text or "Tweet text could not be extracted",
                'likes_count': int(likes_match.group(1)) if likes_match else 0,
                'retweets_count': int(retweets_match.group(1)) if retweets_match else 0,
                'replies_count': int(replies_match.group(1)) if replies_match else 0,
                'posted_date': posted_date,
                'tweet_url': tweet_url,
                'media_urls': media_matches if media_matches else None,
                'scraped_at': datetime.utcnow()
            }
            
            return tweet_data
            
        except Exception as e:
            logger.error(f"Error extracting tweet data for {tweet_id}: {str(e)}")
            return None

    def scrape_single_tweet(self, tweet_url: str) -> Optional[Dict]:
        """
        Scrape a single tweet by URL using StealthyFetcher (faster, no JS needed).

        Args:
            tweet_url: Full URL to the tweet (e.g., https://x.com/user/status/123456)

        Returns:
            Tweet dictionary or None
        """
        try:
            response = self.stealthy_fetcher.get(tweet_url)

            if not response or response.status_code != 200:
                logger.error(f"Failed to fetch tweet: {tweet_url}")
                return None

            # Extract tweet ID from URL
            import re
            tweet_id_match = re.search(r'/status/(\d+)', tweet_url)
            if not tweet_id_match:
                return None

            tweet_id = tweet_id_match.group(1)
            username_match = re.search(r'x\.com/([^/]+)', tweet_url)
            username = username_match.group(1) if username_match else ""

            return self._extract_tweet_data(response.text, tweet_id, username)

        except Exception as e:
            logger.error(f"Error scraping single tweet: {str(e)}")
            return None

    def scrape_account_timeline(self, username: str, max_tweets: int = 50) -> List[Dict]:
        """
        Scrape recent tweets from a user's timeline using DynamicFetcher with infinite scroll.

        Args:
            username: Twitter username (without @)
            max_tweets: Maximum number of tweets to scrape (default: 50)

        Returns:
            List of tweet objects with all metadata
        """
        url = f"{self.base_url}/{username}"
        tweets = []
        seen_tweet_ids = set()

        try:
            logger.info(f"Starting timeline scrape for @{username} (max {max_tweets} tweets)")

            # Navigate to the profile page
            response = self.dynamic_fetcher.get(url)

            if not response or response.status_code != 200:
                logger.error(f"Failed to fetch page for @{username}: Status {response.status_code if response else 'No response'}")
                return tweets

            # Check for private/suspended account indicators
            if self._is_account_suspended_or_private(response.text):
                logger.warning(f"Account @{username} appears to be private or suspended")
                return tweets

            # Extract initial batch of tweets
            page = response.page
            if page:
                initial_tweets = self._extract_tweets_from_page(page, username)
                for tweet in initial_tweets:
                    if tweet['tweet_id'] not in seen_tweet_ids:
                        seen_tweet_ids.add(tweet['tweet_id'])
                        tweets.append(tweet)

                logger.info(f"Initial extraction: {len(tweets)} tweets from @{username}")

            # Scroll down to load more tweets if needed
            scroll_attempts = 0
            max_scroll_attempts = 10  # Prevent infinite loops
            last_tweet_count = 0

            while len(tweets) < max_tweets and scroll_attempts < max_scroll_attempts:
                # Add random delay between scrolls (2-3 seconds + jitter)
                delay = random.uniform(2.0, 3.0)
                time.sleep(delay)

                # Scroll down
                try:
                    page = self.dynamic_fetcher.scroll_down(behavior="smooth", amount=500)

                    if not page:
                        logger.warning("Scroll returned no page, stopping scroll")
                        break

                    # Extract new tweets from the updated page
                    new_tweets = self._extract_tweets_from_page(page, username)
                    new_count = 0

                    for tweet in new_tweets:
                        if tweet['tweet_id'] not in seen_tweet_ids:
                            seen_tweet_ids.add(tweet['tweet_id'])
                            tweets.append(tweet)
                            new_count += 1

                            if len(tweets) >= max_tweets:
                                break

                    logger.info(f"Scroll {scroll_attempts + 1}: Found {new_count} new tweets (total: {len(tweets)})")

                    # Check if we're making progress
                    if len(tweets) == last_tweet_count:
                        logger.info("No new tweets loaded, stopping scroll")
                        break

                    last_tweet_count = len(tweets)
                    scroll_attempts += 1

                except Exception as e:
                    logger.error(f"Error during scroll: {str(e)}")
                    break

            # Sort by date (most recent first) and limit
            tweets.sort(key=lambda x: x.get('posted_date') or datetime.min, reverse=True)
            tweets = tweets[:max_tweets]

            logger.info(f"Timeline scrape complete: {len(tweets)} tweets from @{username}")

            # Final delay before returning
            time.sleep(random.uniform(1.5, 2.5))

            return tweets

        except Exception as e:
            logger.error(f"Error scraping timeline for @{username}: {str(e)}")
            return tweets

    def _is_account_suspended_or_private(self, html: str) -> bool:
        """Check if an account is suspended or private."""
        suspended_indicators = [
            "Account suspended",
            "This account has been suspended",
            "@username is suspended"
        ]
        private_indicators = [
            "These tweets are protected",
            "Only approved followers can see",
            "You're unable to view these Tweets"
        ]

        html_lower = html.lower()
        for indicator in suspended_indicators + private_indicators:
            if indicator.lower() in html_lower:
                return True
        return False

    def _extract_tweets_from_page(self, page, username: str) -> List[Dict]:
        """
        Extract tweet data from a Playwright page object.

        Args:
            page: Playwright page object from DynamicFetcher
            username: Username for the account

        Returns:
            List of tweet dictionaries
        """
        tweets = []

        try:
            # Use Playwright to query tweet elements
            # X.com uses specific data attributes for tweets
            tweet_elements = page.query_selector_all('[data-testid="tweet"]')

            logger.info(f"Found {len(tweet_elements)} tweet elements on page")

            for tweet_element in tweet_elements:
                try:
                    tweet_data = self._extract_tweet_from_element(tweet_element, username)
                    if tweet_data:
                        tweets.append(tweet_data)
                except Exception as e:
                    logger.debug(f"Error extracting tweet from element: {str(e)}")
                    continue

        except Exception as e:
            logger.error(f"Error extracting tweets from page: {str(e)}")

        return tweets

    def _extract_tweet_from_element(self, element, username: str) -> Optional[Dict]:
        """
        Extract tweet data from a single tweet element.

        Args:
            element: Playwright element handle for a tweet
            username: Username for the account

        Returns:
            Tweet dictionary or None
        """
        try:
            # Extract tweet ID from the permalink
            tweet_id = None
            try:
                link_element = element.query_selector('a[href*="/status/"]')
                if link_element:
                    href = link_element.get_attribute('href') or ''
                    import re
                    match = re.search(r'/status/(\d+)', href)
                    if match:
                        tweet_id = match.group(1)
            except:
                pass

            if not tweet_id:
                return None

            # Extract tweet text
            text = ""
            try:
                text_element = element.query_selector('[data-testid="tweetText"]')
                if text_element:
                    text = text_element.inner_text() or ""
            except:
                pass

            # Extract author info
            author_username = username
            author_display_name = username
            try:
                author_element = element.query_selector('[data-testid="User-Name"]')
                if author_element:
                    author_text = author_element.inner_text() or ""
                    # Parse author text (usually "@username\ndisplay name")
                    lines = author_text.split('\n')
                    for line in lines:
                        if line.startswith('@'):
                            author_username = line.replace('@', '')
                        elif line and not line.startswith('@'):
                            author_display_name = line
            except:
                pass

            # Extract metrics (likes, retweets, replies)
            likes = 0
            retweets = 0
            replies = 0

            try:
                # Likes
                like_element = element.query_selector('[data-testid="like"]')
                if like_element:
                    like_text = (like_element.inner_text() or "").strip()
                    likes = self._parse_count(like_text)

                # Retweets
                retweet_element = element.query_selector('[data-testid="retweet"]')
                if retweet_element:
                    retweet_text = (retweet_element.inner_text() or "").strip()
                    retweets = self._parse_count(retweet_text)

                # Replies
                reply_element = element.query_selector('[data-testid="reply"]')
                if reply_element:
                    reply_text = (reply_element.inner_text() or "").strip()
                    replies = self._parse_count(reply_text)
            except:
                pass

            # Extract posted date
            posted_date = None
            try:
                time_element = element.query_selector('time')
                if time_element:
                    datetime_str = time_element.get_attribute('datetime')
                    if datetime_str:
                        posted_date = datetime.fromisoformat(datetime_str.replace('Z', '+00:00'))
            except:
                pass

            # Extract media URLs
            media_urls = []
            try:
                media_elements = element.query_selector_all('img[src*="pbs.twimg.com"]')
                for media_el in media_elements:
                    src = media_el.get_attribute('src')
                    if src and 'pbs.twimg.com' in src:
                        # Get the higher quality version
                        if '&name=' in src:
                            src = src.split('&name=')[0] + '&name=large'
                        media_urls.append(src)
            except:
                pass

            tweet_data = {
                'tweet_id': tweet_id,
                'text': text or "Tweet text could not be extracted",
                'author_username': author_username,
                'author_display_name': author_display_name,
                'likes': likes,
                'retweets': retweets,
                'replies': replies,
                'posted_date': posted_date,
                'tweet_url': f"{self.base_url}/{author_username}/status/{tweet_id}",
                'media_urls': media_urls if media_urls else [],
                'scraped_at': datetime.utcnow()
            }

            return tweet_data

        except Exception as e:
            logger.debug(f"Error extracting tweet from element: {str(e)}")
            return None

    def _parse_count(self, count_str: str) -> int:
        """
        Parse a count string (e.g., "1.2K", "500") into an integer.
        """
        if not count_str:
            return 0

        count_str = count_str.strip().upper()

        if 'K' in count_str:
            # Thousands
            num = float(count_str.replace('K', '').replace(',', '').strip())
            return int(num * 1000)
        elif 'M' in count_str:
            # Millions
            num = float(count_str.replace('M', '').replace(',', '').strip())
            return int(num * 1000000)
        else:
            # Regular number
            try:
                return int(count_str.replace(',', '').strip())
            except:
                return 0

    def close(self):
        """Close the fetchers and cleanup resources."""
        if hasattr(self, 'stealthy_fetcher'):
            del self.stealthy_fetcher
        if hasattr(self, 'dynamic_fetcher'):
            del self.dynamic_fetcher
