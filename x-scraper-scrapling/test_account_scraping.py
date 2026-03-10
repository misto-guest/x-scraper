#!/usr/bin/env python3
"""
Test script for account timeline scraping functionality.

Tests both single tweet scraping and account timeline scraping.
"""

import requests
import json
from datetime import datetime

# API base URL
BASE_URL = "http://localhost:8000"


def print_separator(title=""):
    """Print a visual separator"""
    print("\n" + "="*80)
    if title:
        print(f"  {title}")
        print("="*80)
    print()


def test_scrape_single_tweet():
    """Test scraping a single tweet by URL"""
    print_separator("TEST 1: Scrape Single Tweet")

    tweet_url = "https://x.com/patrickstox/status/2029697020965884325"

    print(f"Tweet URL: {tweet_url}")
    print("Sending request to /api/scrape/tweet ...")

    try:
        response = requests.post(
            f"{BASE_URL}/api/scrape/tweet",
            json={"url": tweet_url},
            headers={"Content-Type": "application/json"}
        )

        print(f"Status Code: {response.status_code}")

        if response.status_code == 200:
            data = response.json()
            print(f"Success: {data.get('success')}")
            print(f"Tweets Count: {data.get('tweets_count')}")
            print(f"Scraped At: {data.get('scraped_at')}")

            if data.get('tweets'):
                tweet = data['tweets'][0]
                print(f"\nTweet Details:")
                print(f"  ID: {tweet.get('tweet_id')}")
                print(f"  Text: {tweet.get('text')[:100]}...")
                print(f"  Author: {tweet.get('author_username')}")
                print(f"  Likes: {tweet.get('likes')}")
                print(f"  Retweets: {tweet.get('retweets')}")
                print(f"  Replies: {tweet.get('replies')}")
                print(f"  Posted: {tweet.get('posted_date')}")
                print(f"  Media URLs: {len(tweet.get('media_urls', []))} files")
        else:
            print(f"Error: {response.text}")
    except Exception as e:
        print(f"Exception: {str(e)}")


def test_scrape_account_timeline_small():
    """Test scraping an account timeline with a small number of tweets"""
    print_separator("TEST 2: Scrape Account Timeline (5 tweets)")

    username = "patrickstox"
    max_tweets = 5

    print(f"Username: @{username}")
    print(f"Max Tweets: {max_tweets}")
    print("Sending request to /api/scrape/account ...")

    try:
        response = requests.post(
            f"{BASE_URL}/api/scrape/account",
            json={"username": username, "max_tweets": max_tweets},
            headers={"Content-Type": "application/json"}
        )

        print(f"Status Code: {response.status_code}")

        if response.status_code == 200:
            data = response.json()
            print(f"Success: {data.get('success')}")
            print(f"Tweets Count: {data.get('tweets_count')}")
            print(f"Scraped At: {data.get('scraped_at')}")
            print(f"Message: {data.get('message')}")

            if data.get('tweets'):
                print(f"\nFirst 3 Tweets:")
                for i, tweet in enumerate(data['tweets'][:3], 1):
                    print(f"\n  Tweet {i}:")
                    print(f"    ID: {tweet.get('tweet_id')}")
                    print(f"    Text: {tweet.get('text')[:80]}...")
                    print(f"    Likes: {tweet.get('likes')}, Retweets: {tweet.get('retweets')}, Replies: {tweet.get('replies')}")
                    print(f"    Posted: {tweet.get('posted_date')}")
                    print(f"    Media: {len(tweet.get('media_urls', []))} files")
        else:
            print(f"Error: {response.text}")
    except Exception as e:
        print(f"Exception: {str(e)}")


def test_scrape_account_timeline_large():
    """Test scraping an account timeline with more tweets"""
    print_separator("TEST 3: Scrape Account Timeline (20 tweets)")

    username = "patrickstox"
    max_tweets = 20

    print(f"Username: @{username}")
    print(f"Max Tweets: {max_tweets}")
    print("Sending request to /api/scrape/account ...")
    print("(This may take 30-60 seconds due to scrolling delays)")

    try:
        response = requests.post(
            f"{BASE_URL}/api/scrape/account",
            json={"username": username, "max_tweets": max_tweets},
            headers={"Content-Type": "application/json"}
        )

        print(f"Status Code: {response.status_code}")

        if response.status_code == 200:
            data = response.json()
            print(f"Success: {data.get('success')}")
            print(f"Tweets Count: {data.get('tweets_count')}")
            print(f"Scraped At: {data.get('scraped_at')}")
            print(f"Message: {data.get('message')}")

            if data.get('tweets'):
                # Calculate some stats
                total_likes = sum(t.get('likes', 0) for t in data['tweets'])
                total_retweets = sum(t.get('retweets', 0) for t in data['tweets'])
                tweets_with_media = sum(1 for t in data['tweets'] if t.get('media_urls'))

                print(f"\nTimeline Stats:")
                print(f"  Total Likes: {total_likes:,}")
                print(f"  Total Retweets: {total_retweets:,}")
                print(f"  Tweets with Media: {tweets_with_media}")
                print(f"  Avg Likes per Tweet: {total_likes // len(data['tweets']):,}")
        else:
            print(f"Error: {response.text}")
    except Exception as e:
        print(f"Exception: {str(e)}")


def test_scrape_high_profile_account():
    """Test scraping a high-profile account (public, many tweets)"""
    print_separator("TEST 4: Scrape High-Profile Account (10 tweets)")

    username = "NASA"
    max_tweets = 10

    print(f"Username: @{username}")
    print(f"Max Tweets: {max_tweets}")
    print("Sending request to /api/scrape/account ...")

    try:
        response = requests.post(
            f"{BASE_URL}/api/scrape/account",
            json={"username": username, "max_tweets": max_tweets},
            headers={"Content-Type": "application/json"}
        )

        print(f"Status Code: {response.status_code}")

        if response.status_code == 200:
            data = response.json()
            print(f"Success: {data.get('success')}")
            print(f"Tweets Count: {data.get('tweets_count')}")
            print(f"Message: {data.get('message')}")
        else:
            print(f"Error: {response.text}")
    except Exception as e:
        print(f"Exception: {str(e)}")


def test_error_handling():
    """Test error handling for invalid inputs"""
    print_separator("TEST 5: Error Handling")

    # Test 1: Invalid URL
    print("\nTest 5a: Invalid Tweet URL")
    try:
        response = requests.post(
            f"{BASE_URL}/api/scrape/tweet",
            json={"url": "https://example.com/not-a-tweet"},
            headers={"Content-Type": "application/json"}
        )
        print(f"Status Code: {response.status_code}")
        print(f"Response: {response.text[:200]}")
    except Exception as e:
        print(f"Exception: {str(e)}")

    # Test 2: Invalid username (empty)
    print("\nTest 5b: Invalid Username (empty)")
    try:
        response = requests.post(
            f"{BASE_URL}/api/scrape/account",
            json={"username": "", "max_tweets": 10},
            headers={"Content-Type": "application/json"}
        )
        print(f"Status Code: {response.status_code}")
        print(f"Response: {response.text[:200]}")
    except Exception as e:
        print(f"Exception: {str(e)}")

    # Test 3: Invalid max_tweets (too high)
    print("\nTest 5c: Invalid max_tweets (500 > 200)")
    try:
        response = requests.post(
            f"{BASE_URL}/api/scrape/account",
            json={"username": "patrickstox", "max_tweets": 500},
            headers={"Content-Type": "application/json"}
        )
        print(f"Status Code: {response.status_code}")
        print(f"Response: {response.text[:200]}")
    except Exception as e:
        print(f"Exception: {str(e)}")


def main():
    """Run all tests"""
    print("\n")
    print("╔" + "="*78 + "╗")
    print("║" + " "*20 + "X.com Scraper - Account Timeline Test" + " "*20 + "║")
    print("╚" + "="*78 + "╝")

    print(f"\nStarting tests at: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}")
    print(f"API Endpoint: {BASE_URL}")
    print("\nNOTE: These tests may take several minutes due to:")
    print("  - Rate limiting delays (2-3 seconds between scrolls)")
    print("  - Page load times")
    print("  - Dynamic content rendering")

    # Check if server is running
    print("\nChecking if server is running...")
    try:
        response = requests.get(f"{BASE_URL}/health", timeout=5)
        if response.status_code == 200:
            print("✓ Server is running and healthy")
        else:
            print("✗ Server returned unexpected status")
            return
    except Exception as e:
        print(f"✗ Cannot connect to server: {str(e)}")
        print("\nPlease start the server first:")
        print("  python main.py")
        return

    # Run tests
    try:
        test_scrape_single_tweet()
        test_scrape_account_timeline_small()
        test_scrape_account_timeline_large()
        test_scrape_high_profile_account()
        test_error_handling()

        print_separator("ALL TESTS COMPLETE")
        print("Check the results above for any errors.")
        print("\nNext steps:")
        print("  1. Review the scraped data quality")
        print("  2. Check rate limiting compliance")
        print("  3. Verify database storage if using persistent storage")

    except KeyboardInterrupt:
        print("\n\nTests interrupted by user.")
    except Exception as e:
        print(f"\n\nUnexpected error: {str(e)}")


if __name__ == "__main__":
    main()
