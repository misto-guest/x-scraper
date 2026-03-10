#!/usr/bin/env python3
"""
Quick test of Scrapling on a specific X.com tweet
"""
import sys

def main():
    # Install scrapling if not present
    try:
        from scrapling.fetchers import StealthyFetcher
    except ImportError:
        print("Installing Scrapling...")
        import subprocess
        subprocess.check_call([sys.executable, "-m", "pip", "install", "--break-system-packages", "--user", "scrapling[fetchers]==0.4.1"])
        from scrapling.fetchers import StealthyFetcher

    url = 'https://x.com/patrickstox/status/2029697020965884325?s=20'

    print('Testing Scrapling on specific tweet...')
    print(f'URL: {url}')
    print('-' * 60)

    try:
        # Use StealthyFetcher to bypass Cloudflare
        print("🔧 Fetching page with StealthyFetcher...")
        page = StealthyFetcher.fetch(
            url,
            headless=True,
            network_idle=True,
            solve_cloudflare=True
        )

        print('✅ Successfully fetched page!')
        print(f'Page URL: {page.url}')
        print(f'Status: Loaded')

        # Try to extract tweet data
        print('\n📊 Attempting to extract tweet data...')

        # Look for tweet text
        tweet_texts = page.css('div[lang]')
        if tweet_texts:
            print(f'\nFound {len(tweet_texts)} elements with [lang] attribute')
            for i, text_elem in enumerate(tweet_texts[:3]):
                text = text_elem.text  # Use property instead of method
                if text and len(text) > 10:
                    print(f'\n--- Tweet Text {i+1} ---')
                    print(text[:500])
                    
                    # Try to extract more metadata
                    parent = text_elem.parent
                    if parent:
                        # Try to find engagement numbers
                        likes = parent.css('[data-testid="like"]')
                        if likes:
                            print(f'   Likes found: {len(likes)}')

        # Look for tweet metadata
        print('\n🔍 Looking for tweet metadata...')

        # Try different selectors
        selectors = [
            '[data-testid="tweet"]',
            '[role="article"]',
            'article',
        ]

        for selector in selectors:
            elements = page.css(selector)
            if elements:
                print(f'✅ Found {len(elements)} elements with "{selector}"')
                break

        # Extract page title
        title = page.css('title::text').get()
        if title:
            print(f'\n📄 Page Title: {title}')

        # Save raw HTML for inspection (if available)
        try:
            html_content = str(page.content) if hasattr(page, 'content') else "HTML not directly accessible"
            with open('test_tweet_page.html', 'w', encoding='utf-8') as f:
                f.write(html_content)
            print('\n✅ Raw HTML saved to: test_tweet_page.html')
            print(f'File size: {len(html_content):,} characters')
        except Exception as e:
            print(f'\n⚠️  Could not save HTML: {e}')

        print('\n✅ Scraping test completed successfully!')
        return True

    except Exception as e:
        print(f'❌ Error: {type(e).__name__}')
        print(f'Message: {str(e)}')
        import traceback
        print('\nFull traceback:')
        traceback.print_exc()
        return False

if __name__ == "__main__":
    success = main()
    sys.exit(0 if success else 1)
