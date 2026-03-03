/**
 * Configuration API
 * Check and display system configuration
 */

const router = require('express').Router();

/**
 * Get current configuration status
 */
router.get('/', (req, res) => {
  const config = {
    runware_configured: !!process.env.RUNWARE_API_KEY,
    firecrawl_configured: !!process.env.FIRECRAWL_API_KEY,
    openai_configured: !!process.env.OPENAI_API_KEY,
    facebook_configured: !!(process.env.FACEBOOK_APP_ID && process.env.FACEBOOK_APP_SECRET),
    environment: process.env.NODE_ENV || 'development',
    has_database: !!req.db
  };

  res.json(config);
});

/**
 * Save Runware API key
 * Note: In production, this should be saved to .env file or secrets manager
 * For now, just validate the format
 */
router.post('/runware', (req, res) => {
  const { api_key } = req.body;

  if (!api_key) {
    return res.status(400).json({ success: false, error: 'API key is required' });
  }

  // Basic validation (Runware keys are typically UUIDs)
  const isValidFormat = /^[a-f0-9]{8}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{12}$/i.test(api_key);

  if (!isValidFormat) {
    return res.status(400).json({ success: false, error: 'Invalid API key format' });
  }

  // In a real implementation, you would:
  // 1. Save to secure storage (env file, secrets manager, database)
  // 2. Test the API connection
  // 3. Return success

  res.json({
    success: true,
    message: 'API key format validated',
    note: 'To persist: Add RUNWARE_API_KEY=' + api_key + ' to your .env file and restart the server'
  });
});

/**
 * Save Firecrawl API key
 */
router.post('/firecrawl', (req, res) => {
  const { api_key } = req.body;

  if (!api_key) {
    return res.status(400).json({ success: false, error: 'API key is required' });
  }

  // Basic validation (Firecrawl keys start with 'fc-')
  const isValidFormat = /^fc-[a-zA-Z0-9]{32,}$/.test(api_key);

  if (!isValidFormat) {
    return res.status(400).json({ success: false, error: 'Invalid API key format. Should start with fc-' });
  }

  res.json({
    success: true,
    message: 'API key format validated',
    note: 'To persist: Add FIRECRAWL_API_KEY=' + api_key + ' to your .env file and restart the server'
  });
});

/**
 * Save OpenAI API key
 */
router.post('/openai', (req, res) => {
  const { api_key } = req.body;

  if (!api_key) {
    return res.status(400).json({ success: false, error: 'API key is required' });
  }

  // Basic validation (OpenAI keys start with 'sk-')
  const isValidFormat = /^sk-[a-zA-Z0-9]{48,}$/.test(api_key);

  if (!isValidFormat) {
    return res.status(400).json({ success: false, error: 'Invalid API key format. Should start with sk-' });
  }

  res.json({
    success: true,
    message: 'API key format validated',
    note: 'To persist: Add OPENAI_API_KEY=' + api_key + ' to your .env file and restart the server'
  });
});

module.exports = router;
