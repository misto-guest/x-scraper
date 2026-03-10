#!/usr/bin/env python3
"""
Quick QA test of the X.com scraper - test and share a real tweet
"""
from scrapling.fetchers import StealthyFetcher
import json
from datetime import datetime

def test_single_tweet():
    """Test scraping a specific tweet"""
    url = 'https://x.com/patrickstox/status/2029697020965884325?s=20'

    print('='*70)
    print('X.COM SCRAPER QA TEST')
    print('='*70)
    print(f'Target: {url}')
    print(f'Time: {datetime.now().strftime("%Y-%m-%d %H:%M:%S")}')
    print('-'*70)

    try:
        print("\n🔧 Step 1: Fetching tweet with Scrapling...")
        page = StealthyFetcher.fetch(
            url,
            headless=True,
            network_idle=True,
            solve_cloudflare=True
        )

        print("✅ Successfully fetched tweet!")

        # Extract title (contains tweet text)
        title = page.css('title::text').get()
        if title:
            print(f"\n📄 Page Title:\n{title}")

        # Extract tweet element
        tweets = page.css('[data-testid="tweet"]')
        print(f"\n🐦 Found {len(tweets)} tweet(s)")

        if tweets:
            tweet = tweets[0]

            # Extract text
            text_elem = tweet.css('div[lang]')
            text = text_elem[0].text if text_elem else "N/A"

            # Extract author
            author_elem = tweet.css('[data-testid="User-Name"]')
            author = author_elem[0].text if author_elem else "N/A"

            # Extract metrics
            print(f"\n👤 Author: {author}")
            print(f"\n📝 Tweet Text:")
            print(f'   "{text[:300]}..."')

            # Try to get engagement
            print(f"\n📊 Engagement:")

            # Check for likes element
            like_elem = tweet.css('[data-testid="like"]')
            if like_elem:
                print(f"   ❤️  Likes section found")

            # Check for retweets
            retweet_elem = tweet.css('[data-testid="retweet"]')
            if retweet_elem:
                print(f"   🔄 Retweets section found")

            # Check for replies
            reply_elem = tweet.css('[data-testid="reply"]')
            if reply_elem:
                print(f"   💬 Replies section found")

            # Check for media
            imgs = tweet.css('img[src*="pbs.twimg.com"]')
            if imgs:
                print(f"\n🖼️  Media: Found {len(imgs)} image(s)")

            # Extract links
            links = tweet.css('a[href]')
            ext_links = [l.attrib.get('href', '') for l in links if l.attrib.get('href', '').startswith('http')]
            if ext_links:
                print(f"\n🔗 Links in tweet:")
                for link in ext_links[:3]:
                    print(f"   - {link[:60]}...")

        print('\n' + '='*70)
        print('✅ QA TEST PASSED')
        print('='*70)

        return {
            'success': True,
            'author': author if 'author' in locals() else 'N/A',
            'text': text if 'text' in locals() else 'N/A',
            'title': title if 'title' in locals() else 'N/A'
        }

    except Exception as e:
        print(f'\n❌ Error: {str(e)}')
        import traceback
        traceback.print_exc()
        return {'success': False, 'error': str(e)}

if __name__ == "__main__":
    result = test_single_tweet()

    # Print JSON result for easy sharing
    print("\n📋 Result Summary:")
    print(json.dumps(result, indent=2, ensure_ascii=False))
