/**
 * Ad Prediction Service
 * Predicts performance metrics for Facebook ads/posts
 * MVP: Stub implementation with heuristic-based predictions
 * TODO: Integrate ML model in Phase 3
 */

class PredictionService {
  constructor() {
    this.baselineMetrics = {
      avg_ctr: 0.025, // 2.5%
      avg_cvr: 0.012, // 1.2%
      avg_cpa: 8.50, // $8.50
      avg_engagement_rate: 0.035 // 3.5%
    };

    this.factors = {
      content_type: {
        image: 1.0,
        reel: 1.4,
        text: 0.8,
        carousel: 1.2,
        story: 1.1
      },
      time_of_day: {
        morning: 0.9,
        afternoon: 1.0,
        evening: 1.2,
        night: 0.7
      },
      risk_penalty: {
        low: 1.0,
        medium: 0.85,
        high: 0.6
      }
    };
  }

  /**
   * Predict performance for a post
   */
  async predictPerformance(post, page) {
    const factors = this._analyzeFactors(post, page);
    const predicted_ctr = this._predictCTR(factors);
    const predicted_cvr = this._predictCVR(factors);
    const predicted_cpa = this._predictCPA(factors);
    const confidence = this._calculateConfidence(factors);

    const predicted_metrics = {
      estimated_reach: Math.round(this._estimateReach(page, factors)),
      estimated_impressions: Math.round(this._estimateReach(page, factors) * 1.5),
      estimated_engagement: Math.round(this._estimateReach(page, factors) * 0.035 * factors.engagement_multiplier),
      estimated_clicks: Math.round(this._estimateReach(page, factors) * predicted_ctr),
      estimated_shares: Math.round(this._estimateReach(page, factors) * 0.005 * factors.engagement_multiplier),
      estimated_comments: Math.round(this._estimateReach(page, factors) * 0.002 * factors.engagement_multiplier),
      estimated_likes: Math.round(this._estimateReach(page, factors) * 0.025 * factors.engagement_multiplier)
    };

    const failure_reasons = this._assessFailureRisk(factors);

    return {
      predicted_ctr,
      predicted_cvr,
      predicted_cpa,
      confidence_score: confidence,
      predicted_metrics,
      failure_reasons
    };
  }

  /**
   * Analyze factors affecting performance
   */
  _analyzeFactors(post, page) {
    const factors = {
      content_type_multiplier: this.factors.content_type[post.content_type] || 1.0,
      time_multiplier: 1.0,
      risk_multiplier: 1.0,
      engagement_multiplier: 1.0,
      originality_multiplier: post.originality_score || 0.5,
      follower_count: page.followers_count || 0
    };

    // Risk penalty
    if (post.risk_score < 0.3) {
      factors.risk_multiplier = this.factors.risk_penalty.low;
    } else if (post.risk_score < 0.6) {
      factors.risk_multiplier = this.factors.risk_penalty.medium;
    } else {
      factors.risk_multiplier = this.factors.risk_penalty.high;
    }

    // Originality boost
    factors.engagement_multiplier = 0.7 + (factors.originality_multiplier * 0.6); // 0.7 to 1.3

    // Caption length factor (optimal: 100-300 chars)
    if (post.caption) {
      const len = post.caption.length;
      if (len >= 100 && len <= 300) {
        factors.engagement_multiplier *= 1.1;
      } else if (len > 500) {
        factors.engagement_multiplier *= 0.9;
      }
    }

    // Hashtag factor (optimal: 3-5 hashtags)
    if (post.caption) {
      const hashtagCount = (post.caption.match(/#/g) || []).length;
      if (hashtagCount >= 3 && hashtagCount <= 5) {
        factors.engagement_multiplier *= 1.05;
      } else if (hashtagCount > 10) {
        factors.engagement_multiplier *= 0.95;
      }
    }

    return factors;
  }

  /**
   * Predict Click-Through Rate
   */
  _predictCTR(factors) {
    let ctr = this.baselineMetrics.avg_ctr;

    // Apply multipliers
    ctr *= factors.content_type_multiplier;
    ctr *= factors.risk_multiplier;
    ctr *= factors.engagement_multiplier;

    // Add some randomness for realism (±10%)
    const variance = 0.9 + (Math.random() * 0.2);
    ctr *= variance;

    // Clamp to reasonable range
    return Math.max(0.005, Math.min(0.08, ctr));
  }

  /**
   * Predict Conversion Rate
   */
  _predictCVR(factors) {
    let cvr = this.baselineMetrics.avg_cvr;

    // Risk has bigger impact on conversions
    cvr *= factors.risk_multiplier;
    cvr *= factors.originality_multiplier;

    // Content type impact
    if (factors.content_type_multiplier > 1) {
      cvr *= 1.1;
    }

    // Clamp
    return Math.max(0.002, Math.min(0.05, cvr));
  }

  /**
   * Predict Cost Per Action
   */
  _predictCPA(factors) {
    let cpa = this.baselineMetrics.avg_cpa;

    // Higher risk = higher CPA
    if (factors.risk_multiplier < 1) {
      cpa /= factors.risk_multiplier;
    }

    // Better engagement = lower CPA
    if (factors.engagement_multiplier > 1) {
      cpa /= factors.engagement_multiplier;
    }

    // Content type impact
    cpa /= factors.content_type_multiplier;

    // Clamp
    return Math.max(2.0, Math.min(30.0, cpa));
  }

  /**
   * Calculate confidence score
   */
  _calculateConfidence(factors) {
    let confidence = 0.5; // Base confidence

    // Higher originality = higher confidence
    confidence += (factors.originality_multiplier - 0.5) * 0.3;

    // Lower risk = higher confidence
    confidence += (1 - factors.risk_multiplier) * 0.2;

    // Clamp
    return Math.max(0.1, Math.min(0.95, confidence));
  }

  /**
   * Estimate reach
   */
  _estimateReach(page, factors) {
    const baseReach = Math.min(page.followers_count * 0.15, 10000); // Max 15% of followers
    return Math.round(baseReach * factors.engagement_multiplier);
  }

  /**
   * Assess potential failure reasons
   */
  _assessFailureRisk(factors) {
    const reasons = [];

    if (factors.risk_multiplier < 0.8) {
      reasons.push({
        type: 'content_risk',
        severity: 'high',
        message: 'High risk content may reduce engagement'
      });
    }

    if (factors.originality_multiplier < 0.4) {
      reasons.push({
        type: 'low_originality',
        severity: 'medium',
        message: 'Content lacks uniqueness'
      });
    }

    if (factors.engagement_multiplier < 0.8) {
      reasons.push({
        type: 'low_engagement_potential',
        severity: 'medium',
        message: 'Content may not resonate with audience'
      });
    }

    if (factors.follower_count < 1000) {
      reasons.push({
        type: 'limited_reach',
        severity: 'low',
        message: 'Small follower base limits reach'
      });
    }

    return reasons;
  }

  /**
   * Compare prediction with actual performance
   */
  compareWithActual(prediction, actual) {
    const ctr_delta = actual.ctr - prediction.predicted_ctr;
    const cvr_delta = actual.cvr - prediction.predicted_cvr;
    const cpa_delta = actual.cpa - prediction.predicted_cpa;

    const isAccurate =
      Math.abs(ctr_delta) < 0.01 &&
      Math.abs(cvr_delta) < 0.005 &&
      Math.abs(cpa_delta) < 2.0;

    return {
      is_accurate: isAccurate,
      ctr_delta,
      cvr_delta,
      cpa_delta,
      accuracy_score: this._calculateAccuracyScore(ctr_delta, cvr_delta, cpa_delta)
    };
  }

  /**
   * Calculate overall accuracy score
   */
  _calculateAccuracyScore(ctr_delta, cvr_delta, cpa_delta) {
    const ctr_accuracy = Math.max(0, 1 - Math.abs(ctr_delta) / 0.05);
    const cvr_accuracy = Math.max(0, 1 - Math.abs(cvr_delta) / 0.02);
    const cpa_accuracy = Math.max(0, 1 - Math.abs(cpa_delta) / 10);

    return (ctr_accuracy + cvr_accuracy + cpa_accuracy) / 3;
  }
}

module.exports = new PredictionService();
