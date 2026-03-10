/**
 * PredictionEngine - Core stub prediction service
 * Returns mock CTR/CVR/CPA values with learning-adjusted coefficients
 */

import { random } from './utils.js';

export class PredictionEngine {
  constructor() {
    this.modelVersion = '1.0.0-initial';
    this.baseCoefficients = {
      ctr: {
        base: 0.012,  // 1.2% baseline CTR
        placementMultiplier: { feed: 1.0, story: 0.7, reel: 1.3, audience_network: 0.5 },
        objectiveMultiplier: { conversions: 0.8, traffic: 1.2, awareness: 1.5, engagement: 1.1 },
        creativeMultiplier: { image: 1.0, video: 1.4, carousel: 1.2, collection: 1.3 }
      },
      cvr: {
        base: 0.045,  // 4.5% baseline CVR
        audienceMultiplier: { lookalike_1: 1.3, lookalike_2: 1.1, custom: 1.4, interest: 1.0, broad: 0.8 },
        objectiveMultiplier: { conversions: 1.5, traffic: 0.8, awareness: 0.5, engagement: 0.6 },
        biddingMultiplier: { lowest_cost: 0.9, target_cost: 1.2, bid_cap: 1.1 }
      },
      cpa: {
        base: 15.00,  // $15 baseline CPA
        objectiveMultiplier: { conversions: 1.0, traffic: 0.6, awareness: 0.3, engagement: 0.4 },
        biddingMultiplier: { lowest_cost: 0.85, target_cost: 1.0, bid_cap: 1.15 }
      }
    };
    
    // Learned adjustments (populated by learning loop)
    this.learnedAdjustments = {};
  }

  getModelVersion() {
    return this.modelVersion;
  }

  /**
   * Predict ad performance metrics (CTR, CVR, CPA)
   */
  async predictAdPerformance(params) {
    const {
      adId,
      adSetId,
      campaignId,
      targeting = {},
      creative = {},
      biddingStrategy = 'lowest_cost',
      budget = 50
    } = params;

    // Determine multipliers from targeting
    const placement = targeting.placement || 'feed';
    const objective = targeting.objective || 'conversions';
    const audienceType = targeting.audienceType || 'interest';
    const creativeType = creative.type || 'image';

    // Get base coefficients
    const ctrBase = this.baseCoefficients.ctr.base;
    const cvrBase = this.baseCoefficients.cvr.base;
    const cpaBase = this.baseCoefficients.cpa.base;

    // Apply CTR multipliers
    let ctr = ctrBase;
    ctr *= this.baseCoefficients.ctr.placementMultiplier[placement] || 1.0;
    ctr *= this.baseCoefficients.ctr.objectiveMultiplier[objective] || 1.0;
    ctr *= this.baseCoefficients.ctr.creativeMultiplier[creativeType] || 1.0;

    // Apply CVR multipliers
    let cvr = cvrBase;
    cvr *= this.baseCoefficients.cvr.audienceMultiplier[audienceType] || 1.0;
    cvr *= this.baseCoefficients.cvr.objectiveMultiplier[objective] || 1.0;
    cvr *= this.baseCoefficients.cvr.biddingMultiplier[biddingStrategy] || 1.0;

    // Apply CPA multipliers
    let cpa = cpaBase;
    cpa *= this.baseCoefficients.cpa.objectiveMultiplier[objective] || 1.0;
    cpa *= this.baseCoefficients.cpa.biddingMultiplier[biddingStrategy] || 1.0;

    // Apply learned adjustments if available
    const adjustment = this.learnedAdjustments[adId] || this.learnedAdjustments['global'];
    if (adjustment) {
      ctr *= adjustment.ctrMultiplier || 1.0;
      cvr *= adjustment.cvrMultiplier || 1.0;
      cpa *= adjustment.cpaMultiplier || 1.0;
    }

    // Add some randomness (simulating real-world variance)
    const variance = 0.15; // ±15% variance
    ctr *= (1 + random(-variance, variance));
    cvr *= (1 + random(-variance, variance));
    cpa *= (1 + random(-variance, variance));

    // Calculate derived metrics
    const estimatedImpressions = Math.round(budget * 100 / cpa / cvr);
    const estimatedClicks = Math.round(estimatedImpressions * ctr);
    const estimatedConversions = Math.round(estimatedClicks * cvr);

    return {
      adId,
      adSetId,
      campaignId,
      predictions: {
        ctr: Math.max(0.001, Math.min(0.999, ctr)),
        cvr: Math.max(0.001, Math.min(0.999, cvr)),
        cpa: Math.max(0.01, cpa),
        impressions: estimatedImpressions,
        clicks: estimatedClicks,
        conversions: estimatedConversions,
        spend: budget
      },
      confidence: {
        ctr: 0.75,
        cvr: 0.65,
        cpa: 0.70
      },
      factors: {
        placement,
        objective,
        audienceType,
        creativeType,
        biddingStrategy,
        budget
      }
    };
  }

  /**
   * Predict funnel conversion rates
   */
  async predictFunnelConversion(params) {
    const {
      adId,
      funnelStages = ['impression', 'click', 'add_to_cart', 'initiate_checkout', 'purchase'],
      audienceSize = 100000,
      creativeType = 'image',
      objective = 'conversions'
    } = params;

    // Base funnel conversion rates
    const baseFunnelRates = {
      impression_to_click: 0.025,      // 2.5% CTR
      click_to_add_to_cart: 0.15,       // 15% add to cart rate
      add_to_cart_to_checkout: 0.35,    // 35% checkout initiation
      checkout_to_purchase: 0.55        // 55% purchase completion
    };

    // Apply adjustments based on creative type and objective
    const creativeMultiplier = this.baseCoefficients.ctr.creativeMultiplier[creativeType] || 1.0;
    const objectiveMultiplier = this.baseCoefficients.cvr.objectiveMultiplier[objective] || 1.0;

    const funnel = {};
    let previousStage = 'impression';
    let currentAudience = audienceSize;

    const stageMapping = {
      'impression': 'impression_to_click',
      'click': 'click_to_add_to_cart',
      'add_to_cart': 'add_to_cart_to_checkout',
      'initiate_checkout': 'checkout_to_purchase',
      'purchase': null
    };

    for (const stage of funnelStages) {
      const rateKey = stageMapping[stage];
      
      if (rateKey) {
        let rate = baseFunnelRates[rateKey];
        
        // Apply multipliers
        if (stage === 'click') {
          rate *= creativeMultiplier;
        }
        rate *= objectiveMultiplier;

        // Apply learned adjustments
        const adjustment = this.learnedAdjustments[adId] || this.learnedAdjustments['global'];
        if (adjustment?.funnelRates?.[rateKey]) {
          rate *= adjustment.funnelRates[rateKey];
        }

        // Add variance
        rate *= (1 + random(-0.1, 0.1));
        
        const nextAudience = Math.round(currentAudience * rate);
        
        funnel[stage] = {
          predictedCount: nextAudience,
          conversionRate: Math.max(0.001, Math.min(0.999, rate)),
          dropOff: currentAudience - nextAudience
        };

        currentAudience = nextAudience;
      }
    }

    // Calculate overall conversion rate
    const purchaseStage = funnel['purchase'];
    const overallConversionRate = purchaseStage 
      ? purchaseStage.predictedCount / audienceSize 
      : 0;

    return {
      adId,
      funnel,
      audienceSize,
      predictedConversions: purchaseStage?.predictedCount || 0,
      overallConversionRate: Math.max(0.001, Math.min(0.999, overallConversionRate)),
      confidence: {
        overall: 0.60,
        earlyStages: 0.75,
        lateStages: 0.50
      }
    };
  }

  /**
   * Apply learned adjustments to the model
   */
  applyLearnedAdjustments(adjustments) {
    this.learnedAdjustments = adjustments;
    this.modelVersion = this.incrementVersion(this.modelVersion);
  }

  incrementVersion(version) {
    const [major, minor, patch] = version.split('-')[0].split('.');
    return `${major}.${parseInt(minor) + 1}.${patch}-learned`;
  }
}

export default PredictionEngine;
