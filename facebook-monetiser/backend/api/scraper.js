/**
 * Scraping API
 * Scrape content from Facebook pages and groups
 */

const express = require('express');
const router = express.Router();
const FacebookScraper = require('../services/facebook-scraper');

// Get scraper config from environment or use defaults
const getScraperConfig = () => ({
  server: process.env.ADSPOWER_SERVER || '77.42.21.134',
  port: process.env.ADSPOWER_PORT || '50325',
  profileId: process.env.ADSPOWER_PROFILE_ID,
  apiKey: process.env.ADSPOWER_API_KEY
});

/**
 * Scrape Facebook page posts
 */
router.post('/facebook-page', async (req, res) => {
  const { page_url, limit = 10 } = req.body;
  
  if (!page_url) {
    return res.status(400).json({ error: 'page_url is required' });
  }

  // Extract page ID from URL
  const pageIdMatch = page_url.match(/facebook\.com\/(?:profile\.php\?id=)?([^/?]+)/);
  if (!pageIdMatch) {
    return res.status(400).json({ error: 'Invalid Facebook URL' });
  }

  const config = getScraperConfig();
  
  // Check if AdsPower is configured
  if (!config.profileId) {
    return res.json({
      success: false,
      error: 'AdsPower not configured',
      message: 'Please configure ADSPOWER_PROFILE_ID to enable scraping',
      page_url,
      note: 'Add ADSPOWER_PROFILE_ID to Fly.io secrets to enable real scraping'
    });
  }

  const scraper = new FacebookScraper(config);

  try {
    console.log(`Starting scrape of ${page_url}`);
    const posts = await scraper.scrapePagePosts(page_url, limit);
    
    res.json({
      success: true,
      message: 'Scraping completed',
      page_url,
      scraped_count: posts.length,
      posts: posts
    });
  } catch (error) {
    console.error('Scraping error:', error);
    res.status(500).json({
      success: false,
      error: error.message,
      page_url
    });
  }
});

/**
 * Scrape Facebook group posts
 */
router.post('/facebook-group', async (req, res) => {
  const { group_url, limit = 10 } = req.body;
  
  if (!group_url) {
    return res.status(400).json({ error: 'group_url is required' });
  }

  // Extract group ID from URL
  const groupIdMatch = group_url.match(/facebook\.com\/groups\/(\d+)/);
  if (!groupIdMatch) {
    return res.status(400).json({ error: 'Invalid Facebook group URL' });
  }

  const config = getScraperConfig();
  
  if (!config.profileId) {
    return res.json({
      success: false,
      error: 'AdsPower not configured',
      message: 'Please configure ADSPOWER_PROFILE_ID to enable scraping',
      group_url,
      note: 'Add ADSPOWER_PROFILE_ID to Fly.io secrets to enable real scraping'
    });
  }

  const scraper = new FacebookScraper(config);

  try {
    console.log(`Starting scrape of ${group_url}`);
    const posts = await scraper.scrapeGroupPosts(group_url, limit);
    
    res.json({
      success: true,
      message: 'Scraping completed',
      group_url,
      scraped_count: posts.length,
      posts: posts
    });
  } catch (error) {
    console.error('Scraping error:', error);
    res.status(500).json({
      success: false,
      error: error.message,
      group_url
    });
  }
});

/**
 * Get scraping status and history
 */
router.get('/status', (req, res) => {
  const config = getScraperConfig();
  
  res.json({
    configured: !!config.profileId,
    adsPower: {
      server: config.server,
      port: config.port,
      profileId: config.profileId ? 'configured' : 'not set',
      apiKey: config.apiKey ? 'configured' : 'not set'
    },
    scrapers: [
      {
        name: 'facebook_page',
        status: config.profileId ? 'ready' : 'not_configured',
        last_run: null,
        next_run: null,
        total_scraped: 0
      },
      {
        name: 'facebook_group',
        status: config.profileId ? 'ready' : 'not_configured',
        last_run: null,
        next_run: null,
        total_scraped: 0
      }
    ]
  });
});

/**
 * Add source and scrape in one step
 */
router.post('/add-and-scrape', async (req, res) => {
  const { type, url, name } = req.body;
  
  if (!url || !type) {
    return res.status(400).json({ error: 'url and type are required' });
  }

  const isPage = type === 'facebook_page';
  const sourceType = isPage ? 'competitor_post' : 'facebook_group_post';
  const authorLabel = isPage ? 'Page' : 'Group';

  // If AdsPower is configured, start scraping immediately
  const config = getScraperConfig();
  let scrapedPosts = [];
  
  if (config.profileId) {
    try {
      const scraper = new FacebookScraper(config);
      if (isPage) {
        scrapedPosts = await scraper.scrapePagePosts(url, 10);
      } else {
        scrapedPosts = await scraper.scrapeGroupPosts(url, 10);
      }
    } catch (e) {
      console.error('Scraping error:', e);
    }
  }

  res.json({
    success: true,
    message: scrapedPosts.length > 0 
      ? `Scraped ${scrapedPosts.length} posts` 
      : 'Source added (scraping not configured)',
    source: {
      source_type: sourceType,
      title: name || `Scraped ${type}`,
      url: url,
      author: authorLabel,
      platform: 'facebook'
    },
    scraping_result: {
      scraped_count: scrapedPosts.length,
      posts: scrapedPosts
    }
  });
});

/**
 * Test AdsPower connection
 */
router.get('/test-connection', async (req, res) => {
  const config = getScraperConfig();
  
  if (!config.profileId) {
    return res.json({
      success: false,
      message: 'AdsPower not configured',
      required: ['ADSPOWER_PROFILE_ID']
    });
  }

  try {
    const response = await fetch(`${config.baseUrl || `http://${config.server}:${config.port}/api/v2/`}user/info`, {
      method: 'POST',
      headers: { 
        'Content-Type': 'application/json',
        ...(config.apiKey && { 'X-Api-Key': config.apiKey })
      },
      body: JSON.stringify({})
    });
    
    const data = await response.json();
    
    res.json({
      success: data.code === 0,
      message: data.code === 0 ? 'AdsPower connected' : 'AdsPower error',
      details: data
    });
  } catch (error) {
    res.json({
      success: false,
      message: 'Cannot connect to AdsPower',
      error: error.message
    });
  }
});

module.exports = router;
