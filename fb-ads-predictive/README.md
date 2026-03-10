# FB Ads Predictive Analytics System

A predictive analytics service for Facebook Ads with continuous learning loops.

## Features

- **PredictAdPerformance**: Predict CTR, CVR, CPA for Facebook Ads
- **PredictFunnelConversion**: Predict conversion rates across funnel stages
- **IngestAdsFeedback**: Ingest actual performance data
- **Continuous Learning**: Automatically adjusts predictions based on feedback

## Quick Start

```bash
cd fb-ads-predictive
npm install
npm start
```

Server runs on `http://localhost:3000`

## API Endpoints

### 1. Predict Ad Performance

```bash
POST /api/predict/ad-performance
```

**Request Body:**
```json
{
  "adId": "ad_12345",
  "adSetId": "adset_123",
  "campaignId": "camp_123",
  "targeting": {
    "placement": "feed",
    "objective": "conversions",
    "audienceType": "interest"
  },
  "creative": {
    "type": "image"
  },
  "biddingStrategy": "lowest_cost",
  "budget": 50
}
```

**Response:**
```json
{
  "success": true,
  "prediction": {
    "adId": "ad_12345",
    "predictions": {
      "ctr": 0.0145,
      "cvr": 0.052,
      "cpa": 12.50,
      "impressions": 2400,
      "clicks": 35,
      "conversions": 2,
      "spend": 50
    },
    "confidence": {
      "ctr": 0.75,
      "cvr": 0.65,
      "cpa": 0.70
    }
  },
  "modelVersion": "1.0.0-initial",
  "timestamp": "2026-03-09T..."
}
```

### 2. Predict Funnel Conversion

```bash
POST /api/predict/funnel-conversion
```

**Request Body:**
```json
{
  "adId": "ad_12345",
  "funnelStages": ["impression", "click", "add_to_cart", "initiate_checkout", "purchase"],
  "audienceSize": 100000,
  "creativeType": "image",
  "objective": "conversions"
}
```

### 3. Ingest Ads Feedback

```bash
POST /api/feedback/ingest
```

**Request Body:**
```json
{
  "adId": "ad_12345",
  "impressions": 2500,
  "clicks": 40,
  "conversions": 3,
  "spend": 52.00,
  "reach": 2200,
  "frequency": 1.14,
  "ctr": 0.016,
  "cvr": 0.075,
  "cpa": 17.33
}
```

### 4. Get Prediction Deltas

```bash
GET /api/analytics/deltas?limit=50
```

### 5. Trigger Learning

```bash
POST /api/analytics/learn
```

### 6. Health Check

```bash
GET /api/health
```

## Continuous Learning

The system automatically:

1. **Stores predictions** when `PredictAdPerformance` is called
2. **Receives actuals** when `IngestAdsFeedback` is called
3. **Calculates deltas** between predicted and actual metrics
4. **Learns** when `POST /api/analytics/learn` is triggered (requires 5+ samples)
5. **Adjusts** model coefficients based on observed patterns

### Learning Criteria

- Minimum 5 feedback samples required
- Adjustments bounded to ±20% per cycle to prevent overfitting
- Tracks accuracy metrics: excellent (85%+), good (70-84%), fair (50-69%), needs improvement (<50%)

## Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                     Express Server                          │
├─────────────────────────────────────────────────────────────┤
│  /api/predict/*     →     PredictionEngine (stub)          │
│  /api/feedback/*    →     FeedbackStore                    │
│  /api/analytics/*   →     LearningLoop                     │
└─────────────────────────────────────────────────────────────┘
```

### Components

- **PredictionEngine**: Returns mock CTR/CVR/CPA values with configurable variance
- **FeedbackStore**: Persists predictions, actuals, and delta calculations
- **LearningLoop**: Analyzes patterns and adjusts prediction coefficients
