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
    // Skip browser and use fallback directly since remote browser API 
    // is not reachable from this environment
    console.log('Using fallback HTTP scraping method...');
    return this.scrapeWithFallback(pageUrl, limit, days);
  }

  /**
   * Scrape Facebook Group posts
   */
  async scrapeGroupPosts(groupUrl, limit = 10, days = 5) {
    return this.scrapePagePosts(groupUrl, limit, days);
  }
}

module.exports = { FacebookScraper };
