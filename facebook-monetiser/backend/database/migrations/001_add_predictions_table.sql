-- Migration: Add ad_predictions table
-- This table stores prediction data for posts

CREATE TABLE IF NOT EXISTS ad_predictions (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    post_id INTEGER NOT NULL UNIQUE,
    predicted_ctr REAL DEFAULT 0.025,
    predicted_cvr REAL DEFAULT 0.012,
    predicted_cpa REAL DEFAULT 8.50,
    confidence_score REAL DEFAULT 0.5,
    predicted_metrics TEXT, -- JSON for detailed predictions
    failure_reasons TEXT, -- JSON array for risk factors
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (post_id) REFERENCES generated_posts(id) ON DELETE CASCADE
);

CREATE INDEX idx_predictions_post ON ad_predictions(post_id);
CREATE INDEX idx_predictions_confidence ON ad_predictions(confidence_score);
