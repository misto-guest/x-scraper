/**
 * Database Reset API - For development only
 */

const express = require('express');
const router = express.Router();
const fs = require('fs');
const path = require('path');

/**
 * Full database reset - WARNING: Deletes entire database
 */
router.post('/reset-sources', (req, res) => {
  const db = req.app.locals.rawDb;
  
  // Close the database connection
  db.close((err) => {
    if (err) {
      console.error('Error closing db:', err);
    }
    
    const dbPath = process.env.DATABASE_PATH || path.join(__dirname, '../../data/facebook-monetiser.db');
    
    // Delete the database file
    fs.unlink(dbPath, (err) => {
      if (err) {
        return res.status(500).json({ error: 'Delete db file: ' + err.message });
      }
      
      res.json({ 
        success: true, 
        message: 'Database deleted. Please restart the app to recreate it with proper schema.',
        db_path: dbPath
      });
    });
  });
});

module.exports = router;
