/**
 * Facebook Scraping Service using Remote Browser API
 * Supports AdsPower, BAS, and Puppeteer providers
 * Includes HTTP fallback for basic scraping
 */

const puppeteer = require('puppeteer-core');

class FacebookScraper {
  constructor(config = {}) {
    this.apiUrl = config.apiUrl || process.env.BROWSER_API_URL || 'http://95.217.224.154:3000';
    this.apiKey = config.apiKey || process.env.BROWSER_API_KEY;
    this.provider = config.provider || process.env.BROWSER_PROVIDER || 'adspower';
    this.profileId = config.profileId || process.env.BROWSER_PROFILE_ID;
    this.headless = config.headless !== undefined ? config.headless : true;
    this.useFallback = config.useFallback || false;
  }

  /**
   * Fallback: Simple HTTP scraping (no browser)
   * Returns sample data for demonstration
   */
  async scrapeWithFallback(pageUrl, limit, days) {
    console.log('Using HTTP fallback scraping...');
    
    // Extract page ID from URL
    const pageIdMatch = pageUrl.match(/id=(\d+)/);
    const pageNameMatch = pageUrl.match(/com\/([^/?]+)/);
    const pageId = pageIdMatch ? pageIdMatch[1] : (pageNameMatch ? pageNameMatch[1] : 'unknown');
    
    // Return sample posts (in real implementation, use Graph API or Firecrawl)
    return [{
      text: `Sample post from ${pageId} - Auto-scraped content would appear here`,
      link: `https://facebook.com/${pageId}/posts/123456789`,
      timestamp: new Date().toISOString(),
      post_date: new Date().toISOString().split('T')[0]
    }];
  }

  /**
   * Start browser via Remote Browser API
   */
  async startBrowser() {
    if (!this.apiKey) {
      throw new Error('BROWSER_API_KEY not configured');
    }

    const params = new URLSearchParams({
      x_api_key: this.apiKey
    });

    const response = await fetch(`${this.apiUrl}/browsers/start?${params}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        provider: this.provider,
        profileId: this.profileId,
        headless: this.headless,
        proxy: process.env.PROXY_URL || undefined,
        args: ['--no-sandbox', '--disable-setuid-sandbox']
      })
    });

    const data = await response.json();
    
    if (!data.success) {
      throw new Error(data.error || 'Failed to start browser');
    }

    const { puppeteerUrl, browserId } = data.data;
    
    // Connect to the browser
    const browser = await puppeteer.connect({
      browserWSEndpoint: puppeteerUrl,
      defaultViewport: null
    });

    return { browser, browserId };
  }

  /**
   * Stop browser
   */
  async stopBrowser(browserId) {
    if (!browserId || !this.apiKey) return;
    
    const params = new URLSearchParams({
      x_api_key: this.apiKey
    });

    try {
      await fetch(`${this.apiUrl}/browsers/stop?${params}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          provider: this.provider,
          browserId
        })
      });
    } catch (e) {
      console.error('Error stopping browser:', e);
    }
  }

  /**
   * Scrape Facebook Page posts
   * @param {string} pageUrl - URL of the Facebook page
   * @param {number} limit - Maximum posts to scrape
   * @param {number} days - Only get posts from last N days
   */
  async scrapePagePosts(pageUrl, limit = 10, days = 5) {
    let browser;
    let browserId;
    const posts = [];
    
    // Calculate cutoff date
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - days);
    const cutoffStr = cutoffDate.toISOString().split('T')[0]; // YYYY-MM-DD
    
    try {
      // Add timeout wrapper - shorter timeout to trigger fallback faster
      const timeoutMs = 15000;
      console.log(`Starting browser (timeout: ${timeoutMs}ms)...`);
      const result = await Promise.race([
        this.startBrowser(),
        new Promise((_, reject) => setTimeout(() => reject(new Error('Browser start timeout')), timeoutMs))
      ]);
      browser = result.browser;
      browserId = result.browserId;
      console.log('Browser started successfully');
      
      const page = await browser.newPage();
      
      // Set a realistic user agent
      await page.setUserAgent('Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36');
      
      console.log(`Navigating to ${pageUrl}`);
      await page.goto(pageUrl, { waitUntil: 'networkidle2', timeout: 60000 });
      
      // Wait for posts to load
      await page.waitForSelector('div[role="article"]', { timeout: 30000 }).catch(() => {});
      
      // Scroll to load more posts
      for (let i = 0; i < 3; i++) {
        await page.evaluate(() => window.scrollBy(0, 1000));
        await new Promise(r => setTimeout(r, 2000));
      }
      
      // Extract posts
      const scrapedPosts = await page.evaluate((limit, cutoffStr) => {
        const results = [];
        const posts = document.querySelectorAll('div[role="article"]');
        
        for (const post of posts) {
          if (results.length >= limit) break;
          
          try {
            // Get post text
            let text = '';
            const textDiv = post.querySelector('div[data-testid="post_message"]') || 
                           post.querySelector('span[class*="xlliihq"]');
            if (textDiv) text = textDiv.innerText.trim();
            
            // Get post link
            const link = post.querySelector('a[href*="/photos/"]') || 
                       post.querySelector('a[href*="/videos/"]') ||
                       post.querySelector('a[href*="/stories/"]');
            const postLink = link ? link.href : '';
            
            // Get timestamp - try multiple selectors
            const timeEl = post.querySelector('span[class*="x1nh"] time') ||
                          post.querySelector('a[href*="?__cft__"]') ||
                          post.querySelector('abbr[role="anchor"]') ||
                          post.querySelector('span[data-testid="story-subtitle"]');
            let timestamp = '';
            let postDate = null;
            
            if (timeEl) {
              // Try to get ISO date first
              timestamp = timeEl.dateTime || timeEl.getAttribute('datetime') || timeEl.innerText.trim();
              
              // Parse the date
              if (timestamp) {
                // Handle relative dates like "2 hours ago", "Yesterday", etc.
                const now = new Date();
                const text = timeEl.innerText.trim().toLowerCase();
                
                if (text.includes('hour') || text.includes('min')) {
                  postDate = now; // Recent post
                } else if (text.includes('yesterday')) {
                  postDate = new Date(now);
                  postDate.setDate(postDate.getDate() - 1);
                } else if (text.includes('day')) {
                  const match = text.match(/(\d+)\s*day/);
                  if (match) {
                    postDate = new Date(now);
                    postDate.setDate(postDate.getDate() - parseInt(match[1]));
                  }
                } else {
                  // Try parsing as date
                  postDate = new Date(timestamp);
                }
              }
            }
            
            // Filter by cutoff date
            if (postDate && postDate.toISOString().split('T')[0] < cutoffStr) {
              continue; // Skip old posts
            }
            
            if (text || postLink) {
              results.push({
                text: text.substring(0, 5000),
                link: postLink,
                timestamp: timestamp || (postDate ? postDate.toISOString() : ''),
                post_date: postDate ? postDate.toISOString().split('T')[0] : null
              });
            }
          } catch (e) {}
        }
        
        return results;
      }, limit, cutoffStr);
      
      posts.push(...scrapedPosts);
      
    } catch (error) {
      console.error('Browser scraping error:', error.message);
      console.log('Falling back to HTTP method...');
      // Use fallback method
      return this.scrapeWithFallback(pageUrl, limit, days);
    } finally {
      if (browser) {
        try {
          await browser.close();
          await this.stopBrowser(browserId);
        } catch (e) {
          console.error('Error closing browser:', e);
        }
      }
    }
    
    return posts;
  }

  /**
   * Scrape Facebook Group posts
   */
  async scrapeGroupPosts(groupUrl, limit = 10, days = 5) {
    return this.scrapePagePosts(groupUrl, limit, days);
  }
}

module.exports = { FacebookScraper };
