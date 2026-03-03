// Health check endpoint for Vercel
module.exports = function handler(req, res) {
  res.status(200).json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    service: 'Gmail Warmup V2',
    platform: 'Vercel',
    note: 'Full backend features (Puppeteer, scheduler) not available on serverless. Use Railway or local deployment for complete functionality.'
  });
}
