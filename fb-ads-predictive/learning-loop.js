/**
 * LearningLoop - Continuous learning system for prediction improvement
 * 
 * Analyzes prediction vs actual deltas and adjusts model coefficients
 */

export class LearningLoop {
  constructor(predictionEngine, feedbackStore) {
    this.predictionEngine = predictionEngine;
    this.feedbackStore = feedbackStore;
    this.learningHistory = [];
    this.minSamplesForLearning = 5;
  }

  /**
   * Trigger a learning update
   */
  async triggerLearning() {
    const feedbackData = await this.feedbackStore.getFeedbackForLearning();
    
    if (feedbackData.deltas.length < this.minSamplesForLearning) {
      return {
        status: 'skipped',
        reason: `Insufficient data (${feedbackData.deltas.length}/${this.minSamplesForLearning} samples)`,
        currentAccuracy: await this.calculateCurrentAccuracy()
      };
    }

    // Analyze deltas and compute adjustments
    const adjustments = this.analyzeDeltas(feedbackData.deltas);
    
    // Apply adjustments to prediction engine
    this.predictionEngine.applyLearnedAdjustments(adjustments);
    
    // Record learning event
    const learningEvent = {
      timestamp: new Date().toISOString(),
      sampleSize: feedbackData.deltas.length,
      adjustments,
      previousAccuracy: await this.calculateCurrentAccuracy(),
      newModelVersion: this.predictionEngine.getModelVersion()
    };
    
    this.learningHistory.push(learningEvent);
    
    return {
      status: 'success',
      ...learningEvent
    };
  }

  /**
   * Analyze deltas and compute adjustment multipliers
   */
  analyzeDeltas(deltas) {
    // Group by similar ad characteristics
    const ctrDeltas = deltas.filter(d => d.delta.ctr !== null).map(d => d.delta.ctr);
    const cvrDeltas = deltas.filter(d => d.delta.cvr !== null).map(d => d.delta.cvr);
    const cpaDeltas = deltas.filter(d => d.delta.cpa !== null).map(d => d.delta.cpa);

    // Calculate average directional bias
    const avgCtrDelta = ctrDeltas.length > 0 
      ? ctrDeltas.reduce((a, b) => a + b, 0) / ctrDeltas.length 
      : 0;
    
    const avgCvrDelta = cvrDeltas.length > 0 
      ? cvrDeltas.reduce((a, b) => a + b, 0) / cvrDeltas.length 
      : 0;
    
    const avgCpaDelta = cpaDeltas.length > 0 
      ? cpaDeltas.reduce((a, b) => a + b, 0) / cpaDeltas.length 
      : 0;

    // Compute correction multipliers (bounded to prevent extreme adjustments)
    const maxAdjustment = 0.2; // Max 20% adjustment per learning cycle
    
    const ctrMultiplier = this.boundMultiplier(1 + avgCtrDelta, maxAdjustment);
    const cvrMultiplier = this.boundMultiplier(1 + avgCvrDelta, maxAdjustment);
    const cpaMultiplier = this.boundMultiplier(1 + avgCpaDelta, maxAdjustment);

    // Analyze funnel-specific patterns
    const funnelAdjustments = this.analyzeFunnelPatterns(deltas);

    return {
      global: {
        ctrMultiplier,
        cvrMultiplier,
        cpaMultiplier,
        funnelRates: funnelAdjustments
      },
      byAccuracy: this.categorizeByAccuracy(deltas)
    };
  }

  /**
   * Analyze funnel-specific patterns
   */
  analyzeFunnelPatterns(deltas) {
    // Extract funnel-specific predictions if available
    // This is a simplified version - in production would analyze actual funnel data
    return {
      impression_to_click: 1.0,
      click_to_add_to_cart: 1.0,
      add_to_cart_to_checkout: 1.0,
      checkout_to_purchase: 1.0
    };
  }

  /**
   * Categorize adjustments by accuracy bands
   */
  categorizeByAccuracy(deltas) {
    const highAccuracy = deltas.filter(d => d.accuracy >= 0.8);
    const mediumAccuracy = deltas.filter(d => d.accuracy >= 0.5 && d.accuracy < 0.8);
    const lowAccuracy = deltas.filter(d => d.accuracy < 0.5);

    return {
      highAccuracy: highAccuracy.length,
      mediumAccuracy: mediumAccuracy.length,
      lowAccuracy: lowAccuracy.length
    };
  }

  /**
   * Bound a multiplier to prevent extreme adjustments
   */
  boundMultiplier(value, maxAdjustment) {
    const lower = 1 - maxAdjustment;
    const upper = 1 + maxAdjustment;
    return Math.max(lower, Math.min(upper, value));
  }

  /**
   * Calculate current model accuracy
   */
  async calculateCurrentAccuracy() {
    const stats = await this.feedbackStore.getDeltaStats();
    return stats.avgAccuracy || 0;
  }

  /**
   * Get learning history
   */
  getHistory() {
    return this.learningHistory;
  }

  /**
   * Get recommendations for model improvement
   */
  async getRecommendations() {
    const stats = await this.feedbackStore.getDeltaStats();
    const recommendations = [];

    if (stats.sampleSize < this.minSamplesForLearning) {
      recommendations.push({
        type: 'data_collection',
        priority: 'high',
        message: `Need ${this.minSamplesForLearning - stats.sampleSize} more samples for effective learning`
      });
    }

    if (stats.avgCtrDelta > 0.1) {
      recommendations.push({
        type: 'ctr_bias',
        priority: 'medium',
        message: 'Model tends to underpredict CTR - consider increasing base CTR coefficient'
      });
    } else if (stats.avgCtrDelta < -0.1) {
      recommendations.push({
        type: 'ctr_bias',
        priority: 'medium',
        message: 'Model tends to overpredict CTR - consider decreasing base CTR coefficient'
      });
    }

    if (stats.avgCvrDelta > 0.15) {
      recommendations.push({
        type: 'cvr_bias',
        priority: 'medium',
        message: 'Model tends to underpredict CVR - investigate audience targeting factors'
      });
    }

    if (stats.avgCpaDelta > 0.2) {
      recommendations.push({
        type: 'cpa_bias',
        priority: 'high',
        message: 'Model significantly underpredicts CPA - bidding strategy may need adjustment'
      });
    }

    if (stats.performance === 'needs_improvement') {
      recommendations.push({
        type: 'model_retraining',
        priority: 'high',
        message: 'Model performance is poor - recommend collecting more diverse training data'
      });
    }

    return recommendations;
  }
}

export default LearningLoop;
