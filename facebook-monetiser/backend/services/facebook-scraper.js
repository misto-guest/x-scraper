/**
 * Facebook Scraping Service using AdsPower
 * Real browser automation for scraping FB pages and groups
 */

const puppeteer = require('puppeteer-core');

class FacebookScraper {
  constructor(config = {}) {
    this.server = config.server || process.env.ADSPOWER_SERVER || '77.42.21.134';
    this.port = config.port || process.env.ADSPOWER_PORT || '50325';
    this.baseUrl = `http://${this.server}:${this.port}/api/v2/`;
    this.profileId = config.profileId || process.env.ADSPOWER_PROFILE_ID;
    this.apiKey = config.apiKey || process.env.ADSPOWER_API_KEY;
  }

  /**
   * Start browser via AdsPower API
   */
  async startBrowser() {
    const response = await fetch(`${this.baseUrl}browser-profile/start`, {
      method: 'POST',
      headers: { 
        'Content-Type': 'application/json',
        ...(this.apiKey && { 'X-Api-Key': this.apiKey })
      },
      body: JSON.stringify({
        profile_id: this.profileId,
        launch_args: [
          '--remote-allow-origins=*',
          '--disable-web-security',
          '--disable-site-isolation-trials'
        ]
      })
    });

    const data = await response.json();
    
    if (data.code !== 0) {
      throw new Error(`AdsPower error: ${data.msg}`);
    }

    const wsUrl = data.data.ws.puppeteer;
    
    // Connect to the browser
    const browser = await puppeteer.connect({
      browserWSEndpoint: wsUrl,
      defaultViewport: null
    });

    return browser;
  }

  /**
   * Stop browser profile
   */
  async stopBrowser() {
    if (!this.profileId) return;
    
    try {
      await fetch(`${this.baseUrl}browser-profile/stop`, {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          ...(this.apiKey && { 'X-Api-Key': this.apiKey })
        },
        body: JSON.stringify({ profile_id: this.profileId })
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
    const posts = [];
    
    try {
      browser = await this.startBrowser();
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
                           post.querySelector('span[class*="x1lliihq"]');
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
        await this.stopBrowser();
      }
    }
    
    return posts;
  }

  /**
   * Scrape Facebook Group posts
   */
  async scrapeGroupPosts(groupUrl, limit = 10) {
    // Group scraping is similar to page scraping
    // Just use a different URL pattern
    return this.scrapePagePosts(groupUrl, limit);
  }
}

module.exports = { FacebookScraper };
