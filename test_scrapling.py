#!/usr/bin/env python3
"""
Test script for Scrapling library - Scraping X.com (Twitter) tweets
Uses StealthyFetcher to bypass anti-bot protection
"""

from scrapling import StealthyFetcher
import json

def scrape_tweet(url):
    """
    Scrape a tweet using StealthyFetcher

    Args:
        url: The tweet URL

    Returns:
        dict with scraped data
    """
    print(f"Scraping tweet: {url}")
    print("-" * 60)

    try:
        # Fetch the page using StealthyFetcher class method
        print("Fetching page...")
        page = StealthyFetcher.fetch(
            url,
            headless=True,
            network_idle=True,
            solve_cloudflare=True,
            google_search=True  # Try to appear as coming from Google search
        )

        # Debug: Save HTML to file for inspection
        html_content = page.get()
        with open('/Users/northsea/clawd-dmitry/scraped_page.html', 'w', encoding='utf-8') as f:
            f.write(html_content)
        print("✓ Saved HTML to 'scraped_page.html' for debugging")

        # Check if fetch was successful
        if not page:
            return {"error": "Failed to fetch page"}

        # Try to extract tweet data
        # X.com's DOM structure changes frequently, so we'll try multiple selectors

        result = {
            "url": url,
            "status": "success",
            "data": {}
        }

        # Method 1: Try to find tweet text using common selectors
        tweet_text_selectors = [
            '[data-testid="tweetText"]',
            '.tweet-text',
            '[data-text="true"]',
            'article[role="article"] div[lang]'
        ]

        for selector in tweet_text_selectors:
            elements = page.css(selector)
            if elements:
                text = elements[0].css('::text').getall()
                if text:
                    result["data"]["text"] = ''.join(text).strip()
                    print(f"✓ Found tweet text using selector: {selector}")
                    break

        # Method 2: Try to find author name
        author_selectors = [
            '[data-testid="User-Name"] span',
            '.css-901oao.r-18jsbt2',
            'a[role="link"] span',
            '[data-testid="UserName"] span'
        ]

        for selector in author_selectors:
            elements = page.css(selector)
            if elements and len(elements) > 0:
                # Get the most relevant author name
                for elem in elements[:3]:  # Check first 3 elements
                    text = elem.css('::text').get()
                    if text and '@' not in text and len(text) > 0:
                        result["data"]["author"] = text.strip()
                        print(f"✓ Found author using selector: {selector}")
                        break
                if "author" in result["data"]:
                    break

        # Method 3: Try to find likes count
        likes_selectors = [
            '[data-testid="like"] span',
            '[data-testid="unlike"] span',
            'div[role="group"] div[data-testid="like"]'
        ]

        for selector in likes_selectors:
            elements = page.css(selector)
            if elements:
                for elem in elements:
                    text = elem.css('::text').get()
                    # Look for numeric values
                    if text and any(c.isdigit() for c in text):
                        result["data"]["likes"] = text.strip()
                        print(f"✓ Found likes using selector: {selector}")
                        break
                if "likes" in result["data"]:
                    break

        # Method 4: Try to find retweets count
        retweet_selectors = [
            '[data-testid="retweet"] span',
            '[data-testid="unretweet"] span',
            'div[role="group"] div[data-testid="retweet"]'
        ]

        for selector in retweet_selectors:
            elements = page.css(selector)
            if elements:
                for elem in elements:
                    text = elem.css('::text').get()
                    if text and any(c.isdigit() for c in text):
                        result["data"]["retweets"] = text.strip()
                        print(f"✓ Found retweets using selector: {selector}")
                        break
                if "retweets" in result["data"]:
                    break

        # If we couldn't find specific elements, dump page HTML for debugging
        if not result["data"]:
            print("⚠ Could not extract tweet data using standard selectors")
            print("Attempting to dump page structure for debugging...")

            # Try to find article elements
            articles = page.css('article[role="article"]')
            if articles:
                print(f"✓ Found {len(articles)} article elements")
                # Get text content from first article
                article_text = articles[0].css('::text').getall()
                if article_text:
                    result["data"]["raw_text"] = ''.join(article_text)[:500]  # First 500 chars

        return result

    except Exception as e:
        return {
            "error": f"Exception occurred: {str(e)}",
            "type": type(e).__name__
        }

def main():
    """Main test function"""
    # Test with a popular/public tweet URL
    # Using Elon Musk's account as an example
    tweet_url = "https://x.com/elonmusk/status/1894037364210528558"

    print("=" * 60)
    print("SCRAPLING LIBRARY TEST - X.com Tweet Scraping")
    print("=" * 60)
    print(f"Target: {tweet_url}")
    print(f"Method: StealthyFetcher (headless=True, network_idle=True)")
    print("=" * 60)
    print()

    result = scrape_tweet(tweet_url)

    print()
    print("=" * 60)
    print("RESULTS")
    print("=" * 60)
    print(json.dumps(result, indent=2))
    print("=" * 60)

    # Print observations
    print()
    print("OBSERVATIONS:")
    print("-" * 60)

    if "error" in result:
        print(f"❌ FAILED: {result['error']}")
        if result.get("type"):
            print(f"   Error type: {result['type']}")
        print("\nPossible issues:")
        print("  - Cloudflare protection")
        print("  - Rate limiting")
        print("  - X.com DOM structure changed")
        print("  - Network connectivity")
    elif result.get("data"):
        print("✅ SUCCESS: Data extracted!")
        print(f"   Author: {result['data'].get('author', 'N/A')}")
        print(f"   Text: {result['data'].get('text', 'N/A')[:100]}...")
        print(f"   Likes: {result['data'].get('likes', 'N/A')}")
        print(f"   Retweets: {result['data'].get('retweets', 'N/A')}")

        if "raw_text" in result["data"]:
            print(f"\n   Raw text preview: {result['data']['raw_text'][:200]}...")
    else:
        print("⚠️  PARTIAL: Page fetched but data extraction failed")
        print("   This may indicate:")
        print("   - X.com DOM structure changed")
        print("   - Selectors need updating")
        print("   - Tweet might be deleted or private")

if __name__ == "__main__":
    main()
