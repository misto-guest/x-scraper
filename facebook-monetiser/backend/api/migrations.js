/**
 * Database Reset API - For development only
 */

const express = require('express');
const router = express.Router();
const fs = require('fs');
const path = require('path');

/**
 * Reset and recreate sources table with proper schema
 */
router.post('/reset-sources', (req, res) => {
  const db = req.db;
  
  // Drop sources table if exists
  db.run('DROP TABLE IF EXISTS sources', (err) => {
    if (err) {
      return res.status(500).json({ error: 'Drop: ' + err.message });
    }
    
    // Drop insights table (has foreign key to sources)
    db.run('DROP TABLE IF EXISTS insights', (err) => {
      if (err) {
        return res.status(500).json({ error: 'Drop insights: ' + err.message });
      }
      
      // Create sources with correct schema
      const sql = `
        CREATE TABLE sources (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          source_type TEXT NOT NULL CHECK(source_type IN ('tweet', 'article', 'case_study', 'video', 'competitor_post', 'facebook_group_post')),
          title TEXT,
          url TEXT UNIQUE,
          author TEXT,
          platform TEXT,
          published_date TIMESTAMP,
          content_text TEXT,
          raw_data TEXT,
          is_verified BOOLEAN DEFAULT 0,
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )
      `;
      
      db.run(sql, (err) => {
        if (err) {
          return res.status(500).json({ error: 'Create sources: ' + err.message });
        }
        
        // Create insights table
        const insightsSQL = `
          CREATE TABLE insights (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            source_id INTEGER,
            insight_text TEXT NOT NULL,
            category TEXT,
            effectiveness_score REAL DEFAULT 0.5,
            tags TEXT,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY (source_id) REFERENCES sources(id) ON DELETE CASCADE
          )
        `;
        
        db.run(insightsSQL, (err) => {
          if (err) {
            return res.status(500).json({ error: 'Create insights: ' + err.message });
          }
          
          // Create indexes
          db.run('CREATE INDEX IF NOT EXISTS idx_sources_type ON sources(source_type)', (err) => {
            if (err) {
              return res.status(500).json({ error: 'Index1: ' + err.message });
            }
            
            db.run('CREATE INDEX IF NOT EXISTS idx_sources_url ON sources(url)', (err) => {
              if (err) {
                return res.status(500).json({ error: 'Index2: ' + err.message });
              }
              
              db.run('CREATE INDEX IF NOT EXISTS idx_insights_source ON insights(source_id)', (err) => {
                if (err) {
                  return res.status(500).json({ error: 'Index3: ' + err.message });
                }
                
                res.json({ success: true, message: 'Sources and insights tables recreated with facebook_group_post support' });
              });
            });
          });
        });
      });
    });
  });
});

module.exports = router;
