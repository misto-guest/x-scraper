/**
 * Scraping API
 * Scrape content from Facebook pages and groups
 */

const express = require('express');
const router = express.Router();

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

  const pageId = pageIdMatch[1];

  // For now, return a mock response with instructions
  // In production, this would use Firecrawl or similar
  res.json({
    success: true,
    message: 'Scraping queued',
    page_url,
    page_id: pageId,
    limit,
    note: 'Scraping requires AdsPower browser automation. Use the AdsPower integration for real scraping.',
    scraped_count: 0,
    posts: []
  });
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

  const groupId = groupIdMatch[1];

  res.json({
    success: true,
    message: 'Scraping queued',
    group_url,
    group_id: groupId,
    limit,
    note: 'Scraping requires AdsPower browser automation. Use the AdsPower integration for real scraping.',
    scraped_count: 0,
    posts: []
  });
});

/**
 * Get scraping status and history
 */
router.get('/status', (req, res) => {
  const db = req.app.locals.rawDb;
  
  // Get recent scraping activity
  db.all(`
    SELECT * FROM scraped_content 
    ORDER BY scraped_at DESC 
    LIMIT 20
  `, [], (err, rows) => {
    if (err) {
      return res.status(500).json({ error: err.message });
    }
    
    res.json({
      scrapers: [
        {
          name: 'facebook_page',
          status: 'ready',
          last_run: null,
          next_run: null,
          total_scraped: 0
        },
        {
          name: 'facebook_group', 
          status: 'ready',
          last_run: null,
          next_run: null,
          total_scraped: 0
        },
        {
          name: 'competitor',
          status: 'ready',
          last_run: null,
          next_run: null,
          total_scraped: 0
        }
      ],
      recent_activity: rows || []
    });
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

  // Add as source first
  const sourceData = {
    source_type: type === 'page' ? 'competitor_post' : 'facebook_group_post',
    title: name || `Scraped ${type}`,
    url: url,
    author: type === 'page' ? 'Page' : 'Group',
    platform: 'facebook'
  };

  // Return the scraping config
  res.json({
    success: true,
    message: `Ready to scrape ${type}`,
    source: sourceData,
    scraping_config: {
      url,
      type,
      schedule: 'daily',
      status: 'pending'
    }
  });
});

module.exports = router;
