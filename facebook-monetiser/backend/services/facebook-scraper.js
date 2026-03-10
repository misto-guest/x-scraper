/**
 * Facebook Scraping Service using Remote Browser API
 * Supports AdsPower, BAS, and Puppeteer providers
 */

const puppeteer = require('puppeteer-core');

class FacebookScraper {
  constructor(config = {}) {
    this.apiUrl = config.apiUrl || process.env.BROWSER_API_URL || 'http://95.217.224.154:3000';
    this.apiKey = config.apiKey || process.env.BROWSER_API_KEY;
    this.provider = config.provider || process.env.BROWSER_PROVIDER || 'adspower';
    this.profileId = config.profileId || process.env.BROWSER_PROFILE_ID;
    this.headless = config.headless !== undefined ? config.headless : true;
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
   */
  async scrapePagePosts(pageUrl, limit = 10) {
    let browser;
    let browserId;
    const posts = [];
    
    try {
      const result = await this.startBrowser();
      browser = result.browser;
      browserId = result.browserId;
      
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
      const scrapedPosts = await page.evaluate((limit) => {
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
            
            // Get timestamp
            const time = post.querySelector('span[class*="x1nh"] time') ||
                        post.querySelector('a[href*="?__cft__"]');
            const timestamp = time ? time.dateTime || time.innerText : '';
            
            if (text || postLink) {
              results.push({
                text: text.substring(0, 5000),
                link: postLink,
                timestamp: timestamp
              });
            }
          } catch (e) {}
        }
        
        return results;
      }, limit);
      
      posts.push(...scrapedPosts);
      
    } catch (error) {
      console.error('Scraping error:', error);
      throw error;
    } finally {
      if (browser) {
        await browser.close();
        await this.stopBrowser(browserId);
      }
    }
    
    return posts;
  }

  /**
   * Scrape Facebook Group posts
   */
  async scrapeGroupPosts(groupUrl, limit = 10) {
    return this.scrapePagePosts(groupUrl, limit);
  }
}

module.exports = { FacebookScraper };
