// Mock logs endpoint for Vercel (demo only)
module.exports = function handler(req, res) {
  if (req.method === 'GET') {
    res.status(200).json({
      logs: [],
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
  } else if (req.method === 'DELETE') {
    res.status(501).json({
      error: 'Not implemented on Vercel serverless',
      message: 'Log management requires a persistent backend. Use Railway or local deployment.'
    });
  } else {
    res.setHeader('Allow', 'GET, DELETE');
    res.status(405).json({ error: 'Method not allowed' });
  }
};
