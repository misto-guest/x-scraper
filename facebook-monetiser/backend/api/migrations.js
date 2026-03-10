/**
 * Database Reset API - For development only
 */

const express = require('express');
const router = express.Router();

/**
 * Reset and recreate sources table with proper schema
 */
router.post('/reset-sources', (req, res) => {
  const db = req.db;
  
  // Drop sources table
  db.run('DROP TABLE IF EXISTS sources', (err) => {
    if (err) {
      return res.status(500).json({ error: 'Drop: ' + err.message });
    }
    
    // Create with correct schema
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
        return res.status(500).json({ error: 'Create: ' + err.message });
      }
      
      // Create index
      db.run('CREATE INDEX idx_sources_type ON sources(source_type)', (err) => {
        if (err) {
          return res.status(500).json({ error: 'Index: ' + err.message });
        }
        
        db.run('CREATE INDEX idx_sources_url ON sources(url)', (err) => {
          if (err) {
            return res.status(500).json({ error: 'Index2: ' + err.message });
          }
          
          res.json({ success: true, message: 'Sources table recreated with facebook_group_post support' });
        });
      });
    });
  });
});

module.exports = router;
