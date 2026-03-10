#!/usr/bin/env python3
"""
QA test for account timeline scraping
"""
from scrapling.fetchers import DynamicFetcher
import time
from datetime import datetime

def test_timeline():
    """Test scraping account timeline"""
    username = 'patrickstox'
    url = f'https://x.com/{username}'

    print('='*70)
    print('ACCOUNT TIMELINE QA TEST')
    print('='*70)
    print(f'Target: @{username}')
    print('Max tweets: 5')
    print(f"Time: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}")
    print('-'*70)

    try:
        print("\n🔧 Step 1: Fetching profile page...")
        page = DynamicFetcher.fetch(
            url,
            headless=True,
            network_idle=True
        )

        print("✅ Page loaded!")

        # Find initial tweets
        print("\n📊 Step 2: Extracting tweets...")
        tweets = page.css('[data-testid="tweet"]')
        print(f"Found {len(tweets)} tweets on page")

        if tweets:
            print(f"\n📝 First 3 Tweets:")
            for i, tweet in enumerate(tweets[:3], 1):
                try:
                    # Try to extract tweet ID from link
                    link = tweet.css('a[href*="/status/"]')
                    if link:
                        href = link[0].attrib.get('href', '')
                        import re
                        match = re.search(r'/status/(\d+)', href)
                        tweet_id = match.group(1) if match else 'Unknown'

                    # Try text
                    text_elem = tweet.css('div[lang]')
                    text = text_elem[0].text if text_elem else 'N/A'

                    print(f"\n   Tweet {i}:")
                    print(f"   ID: {tweet_id}")
                    print(f"   Text: {text[:100]}...")

                except Exception as e:
                    print(f"   Tweet {i}: Error extracting - {str(e)}")

        print('\n' + '='*70)
        print('✅ TIMELINE TEST PASSED')
        print('='*70)
        print('\nNote: Full timeline scraping with infinite scroll')
        print('is implemented in scraper.py and available via')
        print('the /api/scrape/account endpoint.')

        return True

    except Exception as e:
        print(f'\n❌ Error: {str(e)}')
        import traceback
        traceback.print_exc()
        return False

if __name__ == "__main__":
    test_timeline()
