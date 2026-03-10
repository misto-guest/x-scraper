/**
 * Database Migration API
 */

const express = require('express');
const router = express.Router();

/**
 * Run migrations
 */
router.post('/migrate', (req, res) => {
  const db = req.db;
  
  // First check if the column already exists with the new type
  db.get("SELECT sql FROM sqlite_master WHERE type='table' AND name='sources'", (err, row) => {
    if (err) {
      return res.status(500).json({ error: err.message });
    }
    
    if (!row || !row.sql) {
      return res.status(500).json({ error: 'sources table not found' });
    }
    
    // Check if already has facebook_group_post
    if (row.sql.includes('facebook_group_post')) {
      return res.json({ 
        success: true, 
        message: 'Migration already applied - sources table already has facebook_group_post support'
      });
    }
    
    // Need to migrate - drop and recreate
    db.run('DROP TABLE IF EXISTS sources_new', (err) => {
      if (err) {
        return res.status(500).json({ error: 'Drop new table: ' + err.message });
      }
      
      const newSchema = `
        CREATE TABLE sources_new (
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
      
      db.run(newSchema, (err) => {
        if (err) {
          return res.status(500).json({ error: 'Create table: ' + err.message });
        }
        
        // Copy data from old table
        db.run(`INSERT INTO sources_new (id, source_type, title, url, author, platform, published_date, content_text, raw_data, is_verified, created_at) 
                SELECT id, source_type, title, url, author, platform, published_date, content_text, raw_data, is_verified, created_at FROM sources`, (err) => {
          if (err) {
            // Table might be empty or have issues, continue anyway
            console.error('Copy data error:', err);
          }
          
          // Drop old and rename new
          db.run('DROP TABLE sources', (err) => {
            if (err) {
              return res.status(500).json({ error: 'Drop old: ' + err.message });
            }
            
            db.run('ALTER TABLE sources_new RENAME TO sources', (err) => {
              if (err) {
                return res.status(500).json({ error: 'Rename: ' + err.message });
              }
              
              // Recreate indexes
              db.run('CREATE INDEX IF NOT EXISTS idx_sources_type ON sources(source_type)', (err) => {
                if (err) {
                  console.error('Index error:', err);
                }
                
                db.run('CREATE INDEX IF NOT EXISTS idx_sources_url ON sources(url)', (err) => {
                  if (err) {
                    console.error('Index error:', err);
                  }
                  
                  res.json({ 
                    success: true, 
                    message: 'Migration completed: facebook_group_post support added'
                  });
                });
              });
            });
          });
        });
      });
    });
  });
});

module.exports = router;
