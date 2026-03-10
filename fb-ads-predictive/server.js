/**
 * FB Ads Predictive Analytics Service
 * 
 * Provides predictive analytics for Facebook Ads with continuous learning loops.
 * 
 * Endpoints:
 * - POST /api/predict/ad-performance - Predict CTR, CVR, CPA for an ad
 * - POST /api/predict/funnel-conversion - Predict funnel stage conversions
 * - POST /api/feedback/ingest - Ingest actual performance data
 * - GET /api/analytics/deltas - Get prediction vs actual deltas
 * - GET /api/analytics/learn - Trigger model learning update
 */

import express from 'express';
import { PredictionEngine } from './prediction-engine.js';
import { FeedbackStore } from './feedback-store.js';
import { LearningLoop } from './learning-loop.js';

const app = express();
app.use(express.json());

// Initialize services
const predictionEngine = new PredictionEngine();
const feedbackStore = new FeedbackStore();
const learningLoop = new LearningLoop(predictionEngine, feedbackStore);

// ==================== ENDPOINTS ====================

/**
 * POST /api/predict/ad-performance
 * Predict CTR, CVR, CPA for a Facebook Ad
 */
app.post('/api/predict/ad-performance', async (req, res) => {
  try {
    const { adId, adSetId, campaignId, targeting, creative, biddingStrategy, budget } = req.body;
    
    if (!adId || !adSetId || !campaignId) {
      return res.status(400).json({ 
        error: 'Missing required fields: adId, adSetId, campaignId' 
      });
    }

    const prediction = await predictionEngine.predictAdPerformance({
      adId,
      adSetId,
      campaignId,
      targeting: targeting || {},
      creative: creative || {},
      biddingStrategy: biddingStrategy || 'lowest_cost',
      budget: budget || 50
    });

    // Store prediction for later comparison
    await feedbackStore.storePrediction(adId, prediction);

    res.json({
      success: true,
      prediction,
      modelVersion: predictionEngine.getModelVersion(),
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('PredictAdPerformance error:', error);
    res.status(500).json({ error: error.message });
  }
});

/**
 * POST /api/predict/funnel-conversion
 * Predict conversion rates across funnel stages
 */
app.post('/api/predict/funnel-conversion', async (req, res) => {
  try {
    const { adId, funnelStages, audienceSize, creativeType, objective } = req.body;
    
    if (!adId || !funnelStages) {
      return res.status(400).json({ 
        error: 'Missing required fields: adId, funnelStages' 
      });
    }

    const prediction = await predictionEngine.predictFunnelConversion({
      adId,
      funnelStages,
      audienceSize: audienceSize || 100000,
      creativeType: creativeType || 'image',
      objective: objective || 'conversions'
    });

    // Store funnel prediction
    await feedbackStore.storeFunnelPrediction(adId, prediction);

    res.json({
      success: true,
      prediction,
      modelVersion: predictionEngine.getModelVersion(),
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('PredictFunnelConversion error:', error);
    res.status(500).json({ error: error.message });
  }
});

/**
 * POST /api/feedback/ingest
 * Ingest actual Facebook Ads performance data
 */
app.post('/api/feedback/ingest', async (req, res) => {
  try {
    const { 
      adId, 
      impressions, 
      clicks, 
      conversions, 
      spend, 
      reach, 
      frequency,
      ctr,
      cvr,
      cpa,
      date 
    } = req.body;

    if (!adId) {
      return res.status(400).json({ error: 'Missing required field: adId' });
    }

    const feedbackData = {
      adId,
      impressions: impressions || 0,
      clicks: clicks || 0,
      conversions: conversions || 0,
      spend: spend || 0,
      reach: reach || 0,
      frequency: frequency || 1,
      ctr: ctr || (clicks && impressions ? clicks / impressions : 0),
      cvr: cvr || (conversions && clicks ? conversions / clicks : 0),
      cpa: cpa || (spend && conversions ? spend / conversions : null),
      date: date || new Date().toISOString().split('T')[0]
    };

    // Store the feedback
    const storedFeedback = await feedbackStore.storeFeedback(adId, feedbackData);

    // Calculate delta with stored prediction if exists
    const delta = await feedbackStore.calculateDelta(adId, feedbackData);

    res.json({
      success: true,
      feedback: storedFeedback,
      delta,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('IngestAdsFeedback error:', error);
    res.status(500).json({ error: error.message });
  }
});

/**
 * GET /api/analytics/deltas
 * Get prediction vs actual deltas
 */
app.get('/api/analytics/deltas', async (req, res) => {
  try {
    const { adId, limit = 50 } = req.query;
    const deltas = await feedbackStore.getDeltas(adId, parseInt(limit));
    
    // Calculate aggregate statistics
    const stats = await feedbackStore.getDeltaStats();

    res.json({
      success: true,
      deltas,
      statistics: stats,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('GetDeltas error:', error);
    res.status(500).json({ error: error.message });
  }
});

/**
 * POST /api/analytics/learn
 * Trigger model learning update
 */
app.post('/api/analytics/learn', async (req, res) => {
  try {
    const result = await learningLoop.triggerLearning();
    
    res.json({
      success: true,
      ...result,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('LearningLoop error:', error);
    res.status(500).json({ error: error.message });
  }
});

/**
 * GET /api/health
 * Health check endpoint
 */
app.get('/api/health', (req, res) => {
  res.json({
    status: 'healthy',
    service: 'fb-ads-predictive-analytics',
    version: '1.0.0',
    modelVersion: predictionEngine.getModelVersion(),
    uptime: process.uptime()
  });
});

// ==================== SERVER ====================

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log(`🚀 FB Ads Predictive Analytics Service running on port ${PORT}`);
  console.log(`📊 Model Version: ${predictionEngine.getModelVersion()}`);
});

export default app;
