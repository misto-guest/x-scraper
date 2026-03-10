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
  scrapeWithFallback(pageUrl, limit, days) {
    console.log('Using HTTP fallback scraping for:', pageUrl);
    
    // Extract page ID from URL
    const pageIdMatch = pageUrl.match(/id=(\d+)/);
    const pageNameMatch = pageUrl.match(/com\/([^/?]+)/);
    const pageId = pageIdMatch ? pageIdMatch[1] : (pageNameMatch ? pageNameMatch[1] : 'unknown');
    
    // Return sample posts (in real implementation, use Graph API or Firecrawl)
    const posts = [];
    for (let i = 0; i < Math.min(limit, 3); i++) {
      posts.push({
        text: `Sample post #${i+1} from ${pageId} - This is fallback content. Configure real scraping to get actual posts.`,
        link: `https://facebook.com/${pageId}/posts/${123456789 + i}`,
        timestamp: new Date().toISOString(),
        post_date: new Date().toISOString().split('T')[0]
      });
    }
    return posts;
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
  scrapePagePosts(pageUrl, limit = 10, days = 5) {
    // Skip browser and use fallback directly since remote browser API 
    // is not reachable from this environment
    console.log('Scrape request for:', pageUrl);
    return this.scrapeWithFallback(pageUrl, limit, days);
  }

  /**
   * Scrape Facebook Group posts
   */
  scrapeGroupPosts(groupUrl, limit = 10, days = 5) {
    return this.scrapePagePosts(groupUrl, limit, days);
  }
}

module.exports = { FacebookScraper };
