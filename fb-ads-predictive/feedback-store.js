/**
 * FeedbackStore - Stores predictions, actuals, and calculates deltas
 */

import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export class FeedbackStore {
  constructor(options = {}) {
    this.storagePath = options.storagePath || './data';
    this.predictions = new Map();
    this.funnelPredictions = new Map();
    this.feedback = new Map();
    this.deltas = [];
    
    this.ensureStorage();
  }

  async ensureStorage() {
    try {
      await fs.mkdir(this.storagePath, { recursive: true });
      await this.loadFromDisk();
    } catch (error) {
      console.log('Starting with fresh storage');
    }
  }

  /**
   * Store a prediction for later comparison
   */
  async storePrediction(adId, prediction) {
    const predictionRecord = {
      adId,
      prediction,
      timestamp: new Date().toISOString()
    };
    
    this.predictions.set(adId, predictionRecord);
    await this.saveToDisk();
    
    return predictionRecord;
  }

  /**
   * Store a funnel prediction
   */
  async storeFunnelPrediction(adId, prediction) {
    const predictionRecord = {
      adId,
      prediction,
      timestamp: new Date().toISOString()
    };
    
    this.funnelPredictions.set(adId, predictionRecord);
    await this.saveToDisk();
    
    return predictionRecord;
  }

  /**
   * Store actual performance feedback
   */
  async storeFeedback(adId, feedbackData) {
    const feedbackRecord = {
      adId,
      ...feedbackData,
      timestamp: new Date().toISOString()
    };
    
    this.feedback.set(adId, feedbackRecord);
    await this.saveToDisk();
    
    return feedbackRecord;
  }

  /**
   * Calculate delta between prediction and actual
   */
  async calculateDelta(adId, actualData) {
    const predictionRecord = this.predictions.get(adId);
    
    if (!predictionRecord) {
      return null;
    }

    const predicted = predictionRecord.prediction.predictions;
    
    // Calculate deltas
    const delta = {
      adId,
      predicted: {
        ctr: predicted.ctr,
        cvr: predicted.cvr,
        cpa: predicted.cpa,
        conversions: predicted.conversions
      },
      actual: {
        ctr: actualData.ctr,
        cvr: actualData.cvr,
        cpa: actualData.cpa,
        conversions: actualData.conversions
      },
      delta: {
        ctr: actualData.ctr - predicted.ctr,
        cvr: actualData.cvr - predicted.cvr,
        cpa: actualData.cpa ? actualData.cpa - predicted.cpa : null,
        conversions: actualData.conversions - predicted.conversions
      },
      deltaPercent: {
        ctr: predicted.ctr ? ((actualData.ctr - predicted.ctr) / predicted.ctr) * 100 : null,
        cvr: predicted.cvr ? ((actualData.cvr - predicted.cvr) / predicted.cvr) * 100 : null,
        cpa: predicted.cpa && actualData.cpa ? ((actualData.cpa - predicted.cpa) / predicted.cpa) * 100 : null,
        conversions: predicted.conversions ? ((actualData.conversions - predicted.conversions) / predicted.conversions) * 100 : null
      },
      accuracy: this.calculateAccuracy(predicted, actualData),
      timestamp: new Date().toISOString()
    };

    this.deltas.push(delta);
    await this.saveToDisk();

    return delta;
  }

  /**
   * Calculate prediction accuracy (0-1)
   */
  calculateAccuracy(predicted, actual) {
    const weights = { ctr: 0.3, cvr: 0.4, cpa: 0.3 };
    
    const ctrError = predicted.ctr ? 1 - Math.min(1, Math.abs(actual.ctr - predicted.ctr) / predicted.ctr) : 1;
    const cvrError = predicted.cvr ? 1 - Math.min(1, Math.abs(actual.cvr - predicted.cvr) / predicted.cvr) : 1;
    const cpaError = predicted.cpa && actual.cpa ? 1 - Math.min(1, Math.abs(actual.cpa - predicted.cpa) / predicted.cpa) : 1;
    
    return (ctrError * weights.ctr + cvrError * weights.cvr + cpaError * weights.cpa);
  }

  /**
   * Get deltas with optional filtering
   */
  async getDeltas(adId = null, limit = 50) {
    let filtered = this.deltas;
    
    if (adId) {
      filtered = filtered.filter(d => d.adId === adId);
    }
    
    return filtered.slice(-limit);
  }

  /**
   * Get aggregate delta statistics
   */
  async getDeltaStats() {
    if (this.deltas.length === 0) {
      return {
        sampleSize: 0,
        avgAccuracy: 0,
        avgCtrDelta: 0,
        avgCvrDelta: 0,
        avgCpaDelta: 0
      };
    }

    const validDeltas = this.deltas.filter(d => 
      d.deltaPercent.ctr !== null && 
      d.deltaPercent.cvr !== null
    );

    if (validDeltas.length === 0) {
      return { sampleSize: 0, message: 'No valid deltas to analyze' };
    }

    const sum = validDeltas.reduce((acc, d) => ({
      accuracy: acc.accuracy + d.accuracy,
      ctrDelta: acc.ctrDelta + (d.deltaPercent.ctr || 0),
      cvrDelta: acc.cvrDelta + (d.deltaPercent.cvr || 0),
      cpaDelta: acc.cpaDelta + (d.deltaPercent.cpa || 0)
    }), { accuracy: 0, ctrDelta: 0, cvrDelta: 0, cpaDelta: 0 });

    const count = validDeltas.length;

    return {
      sampleSize: count,
      avgAccuracy: sum.accuracy / count,
      avgCtrDelta: sum.ctrDelta / count,
      avgCvrDelta: sum.cvrDelta / count,
      avgCpaDelta: sum.cpaDelta / count,
      performance: this.assessPerformance(sum.accuracy / count)
    };
  }

  /**
   * Assess overall model performance
   */
  assessPerformance(accuracy) {
    if (accuracy >= 0.85) return 'excellent';
    if (accuracy >= 0.70) return 'good';
    if (accuracy >= 0.50) return 'fair';
    return 'needs_improvement';
  }

  /**
   * Get all feedback data for learning
   */
  async getFeedbackForLearning() {
    return {
      deltas: this.deltas,
      predictions: Array.from(this.predictions.values()),
      feedback: Array.from(this.feedback.values())
    };
  }

  /**
   * Persist to disk
   */
  async saveToDisk() {
    try {
      const data = {
        predictions: Array.from(this.predictions.entries()),
        funnelPredictions: Array.from(this.funnelPredictions.entries()),
        feedback: Array.from(this.feedback.entries()),
        deltas: this.deltas
      };
      
      await fs.writeFile(
        path.join(this.storagePath, 'feedback-store.json'),
        JSON.stringify(data, null, 2)
      );
    } catch (error) {
      console.error('Failed to save to disk:', error);
    }
  }

  /**
   * Load from disk
   */
  async loadFromDisk() {
    try {
      const data = await fs.readFile(
        path.join(this.storagePath, 'feedback-store.json'),
        'utf-8'
      );
      
      const parsed = JSON.parse(data);
      
      this.predictions = new Map(parsed.predictions || []);
      this.funnelPredictions = new Map(parsed.funnelPredictions || []);
      this.feedback = new Map(parsed.feedback || []);
      this.deltas = parsed.deltas || [];
      
      console.log(`Loaded ${this.deltas.length} delta records from disk`);
    } catch (error) {
      console.log('No existing data to load');
    }
  }
}

export default FeedbackStore;
