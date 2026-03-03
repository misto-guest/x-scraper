// Mock profiles endpoint for Vercel (demo only)
module.exports = function handler(req, res) {
  if (req.method === 'GET') {
    // Return empty profiles list with explanation
    res.status(200).json({
      profiles: [],
      stats: {
        total: 0,
        successful: 0,
        failed: 0,
        active: 0
      },
      _meta: {
        platform: 'vercel-serverless',
        note: 'This is a frontend-only deployment. Backend features (Puppeteer, scheduler, AdsPower API) are not available on Vercel serverless.',
        alternatives: [
          'Use Railway for full functionality',
          'Run locally: node index.js',
          'Use LOCAL-DASHBOARD.html for a static interface'
        ]
      }
    });
  } else if (req.method === 'POST') {
    // Reject profile creation on serverless
    res.status(501).json({
      error: 'Not implemented on Vercel serverless',
      message: 'Profile management requires a persistent backend. Use Railway or local deployment.',
      _meta: {
        platform: 'vercel-serverless',
        note: 'This is a frontend-only deployment. Backend features (Puppeteer, scheduler, AdsPower API) are not available on Vercel serverless.'
      }
    });
  } else {
    res.setHeader('Allow', 'GET, POST');
    res.status(405).json({ error: 'Method not allowed' });
  }
};
