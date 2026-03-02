/**
 * Risk Scoring Service
 * Calculates risk scores for content based on various factors
 */

const RISK_KEYWORDS = {
  political: [
    'election', 'politician', 'president', 'congress', 'senate',
    'democrat', 'republican', 'vote', 'ballot', 'campaign',
    'political', 'government', 'policy', 'legislation'
  ],
  sensitive: [
    'abortion', 'religion', 'race', 'war', 'terrorism',
    'protest', 'controversy', 'scandal', 'discrimination',
    'gun control', 'immigration', 'healthcare debate'
  ],
  non_us: [
    'Brexit', 'EU', 'Euro', 'parliament', 'prime minister',
    'NHS', 'Rupee', 'Yuan', 'Rubel', 'AUD', 'CAD only',
    'UK only', 'Australia only', 'Canada only'
  ],
  spam: [
    'buy now', 'click here', 'limited time', 'act now',
    'free money', 'get rich', 'make money fast', 'clickbait'
  ]
};

class RiskScorer {
  constructor() {
    this.automationLimits = null;
  }

  /**
   * Calculate overall risk score (0-1, where 1 is highest risk)
   */
  calculateRiskScore(text) {
    if (!text || typeof text !== 'string') {
      return 0;
    }

    const lowerText = text.toLowerCase();

    let totalRisk = 0;

    // Political content risk
    const politicalRisk = this._checkKeywordRisk(lowerText, RISK_KEYWORDS.political);
    totalRisk += politicalRisk * 0.3; // 30% weight

    // Sensitive topic risk
    const sensitiveRisk = this._checkKeywordRisk(lowerText, RISK_KEYWORDS.sensitive);
    totalRisk += sensitiveRisk * 0.4; // 40% weight

    // Non-US context risk
    const nonUsRisk = this._checkKeywordRisk(lowerText, RISK_KEYWORDS.non_us);
    totalRisk += nonUsRisk * 0.5; // 50% weight (very high risk)

    // Spam indicators
    const spamRisk = this._checkKeywordRisk(lowerText, RISK_KEYWORDS.spam);
    totalRisk += spamRisk * 0.2; // 20% weight

    // Check for excessive caps (shouting)
    const capsRatio = (text.match(/[A-Z]/g) || []).length / text.length;
    if (capsRatio > 0.5) {
      totalRisk += 0.1;
    }

    // Check for excessive emojis
    const emojiCount = (text.match(/[\u{1F300}-\u{1F9FF}]/gu) || []).length;
    if (emojiCount > 5) {
      totalRisk += 0.1;
    }

    // Normalize to 0-1 range
    return Math.min(totalRisk, 1);
  }

  /**
   * Check for specific keyword categories
   */
  _checkKeywordRisk(text, keywords) {
    let foundCount = 0;
    keywords.forEach(keyword => {
      if (text.includes(keyword.toLowerCase())) {
        foundCount++;
      }
    });
    return Math.min(foundCount * 0.3, 1);
  }

  /**
   * Get detailed risk flags for content
   */
  getRiskFlags(text) {
    if (!text || typeof text !== 'string') {
      return [];
    }

    const lowerText = text.toLowerCase();
    const flags = [];

    // Check each category
    Object.keys(RISK_KEYWORDS).forEach(category => {
      const found = RISK_KEYWORDS[category].filter(keyword =>
        lowerText.includes(keyword.toLowerCase())
      );

      if (found.length > 0) {
        flags.push({
          category,
          keywords_found: found,
          risk_level: found.length * 0.3
        });
      }
    });

    // Check caps
    const capsRatio = (text.match(/[A-Z]/g) || []).length / text.length;
    if (capsRatio > 0.5) {
      flags.push({
        category: 'formatting',
        issue: 'excessive_caps',
        risk_level: 0.1
      });
    }

    // Check emojis
    const emojiCount = (text.match(/[\u{1F300}-\u{1F9FF}]/gu) || []).length;
    if (emojiCount > 5) {
      flags.push({
        category: 'formatting',
        issue: 'excessive_emojis',
        risk_level: 0.1
      });
    }

    return flags;
  }

  /**
   * Check if content requires manual approval
   */
  requiresManualApproval(text, threshold = 0.5) {
    const riskScore = this.calculateRiskScore(text);
    return riskScore >= threshold;
  }

  /**
   * Get approval recommendation
   */
  getApprovalRecommendation(text) {
    const riskScore = this.calculateRiskScore(text);
    const flags = this.getRiskFlags(text);

    if (riskScore < 0.3) {
      return {
        status: 'auto_approve',
        confidence: 'high',
        reason: 'Low risk content'
      };
    } else if (riskScore < 0.5) {
      return {
        status: 'manual_review',
        confidence: 'medium',
        reason: 'Moderate risk - manual review recommended',
        flags
      };
    } else {
      return {
        status: 'manual_approval_required',
        confidence: 'high',
        reason: 'High risk content - manual approval required',
        flags
      };
    }
  }
}

module.exports = new RiskScorer();
