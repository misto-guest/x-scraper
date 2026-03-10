/**
 * Database Migration API
 */

const express = require('express');
const router = express.Router();
const fs = require('fs');
const path = require('path');

/**
 * Run migrations - simply run the full schema
 */
router.post('/migrate', (req, res) => {
  const db = req.db;
  
  // Run the schema directly from file
  const schemaPath = path.join(__dirname, '../database/schema.sql');
  
  // Check if sources table has the new type
  db.get("SELECT sql FROM sqlite_master WHERE type='table' AND name='sources'", (err, row) => {
    if (err) {
      return res.status(500).json({ error: err.message });
    }
    
    if (row && row.sql && row.sql.includes('facebook_group_post')) {
      return res.json({ success: true, message: 'Already migrated' });
    }
    
    // Check if table exists at all
    if (!row) {
      // Create table
      const createSQL = `
        CREATE TABLE IF NOT EXISTS sources (
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
      db.run(createSQL, (err) => {
        if (err) return res.status(500).json({ error: err.message });
        res.json({ success: true, message: 'Created sources table' });
      });
      return;
    }
    
    // Table exists but needs update - drop and recreate
    db.run('DROP TABLE sources', (err) => {
      if (err) return res.status(500).json({ error: 'Drop: ' + err.message });
      
      const createSQL = `
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
      db.run(createSQL, (err) => {
        if (err) return res.status(500).json({ error: 'Create: ' + err.message });
        res.json({ success: true, message: 'Migrated sources table' });
      });
    });
  });
});

module.exports = router;
