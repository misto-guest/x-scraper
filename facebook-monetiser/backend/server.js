const express = require('express');
const cors = require('cors');
const path = require('path');
const sqlite3 = require('sqlite3').verbose();
const fs = require('fs');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, '../frontend')));

// Database setup
// Support Railway persistent volume at /data or local development
const dbDir = process.env.DATABASE_PATH 
  ? path.dirname(process.env.DATABASE_PATH)
  : path.join(__dirname, '../data');
const dbPath = process.env.DATABASE_PATH 
  ? process.env.DATABASE_PATH
  : path.join(dbDir, 'facebook-monetiser.db');

// Ensure data directory exists
if (!fs.existsSync(dbDir)) {
  fs.mkdirSync(dbDir, { recursive: true });
  console.log(`Created data directory: ${dbDir}`);
}

// Initialize database
const db = new sqlite3.Database(dbPath, (err) => {
  if (err) {
    console.error('Database connection error:', err.message);
  } else {
    console.log('Connected to SQLite database:', dbPath);
    initDatabase();
  }
});

function initDatabase() {
  const schema = fs.readFileSync(path.join(__dirname, 'database/schema.sql'), 'utf8');
  db.exec(schema, (err) => {
    if (err) {
      // Ignore "already exists" errors - database is already initialized
      if (err.message.includes('already exists')) {
        console.log('Database schema already initialized');
      } else {
        console.error('Schema initialization error:', err.message);
      }
    } else {
      console.log('Database schema initialized successfully');
    }
  });
}

// Make db accessible to routes
app.use((req, res, next) => {
  req.db = db;
  next();
});

// Import routes
const pagesRouter = require('./api/pages');
const sourcesRouter = require('./api/sources');
const postsRouter = require('./api/posts');
const predictionsRouter = require('./api/predictions');
const contentGeneratorRouter = require('./api/content-generator');
const configRouter = require('./api/config');

// Enhanced SMV routes
const pagesEnhancedRouter = require('./api/pages-enhanced');
const sourcesEnhancedRouter = require('./api/sources-enhanced');
const scrapedRouter = require('./api/scraped');
const predictionsEnhancedRouter = require('./api/predictions-enhanced');

// Use routes
app.use('/api/pages', pagesRouter);
app.use('/api/pages', pagesEnhancedRouter);
app.use('/api/sources', sourcesRouter);
app.use('/api/sources', sourcesEnhancedRouter);
app.use('/api/posts', postsRouter);
app.use('/api/predictions', predictionsRouter);
app.use('/api/predictions', predictionsEnhancedRouter);
app.use('/api/scraped', scrapedRouter);
app.use('/api/content', contentGeneratorRouter);
app.use('/api/config', configRouter);

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Serve frontend
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, '../frontend/index.html'));
});

app.get('/dashboard', (req, res) => {
  res.sendFile(path.join(__dirname, '../frontend/dashboard.html'));
});

// Error handling
app.use((err, req, res, next) => {
  console.error('Error:', err);
  res.status(500).json({ error: err.message || 'Internal server error' });
});

// Start server
app.listen(PORT, () => {
  console.log(`\n🚀 Facebook Monetiser Backend Server`);
  console.log(`📡 Server running: http://localhost:${PORT}`);
  console.log(`📊 Dashboard: http://localhost:${PORT}/dashboard`);
  console.log(`🗄️  Database: ${dbPath}\n`);
});

// Graceful shutdown
process.on('SIGINT', () => {
  console.log('\n👋 Shutting down gracefully...');
  db.close((err) => {
    if (err) {
      console.error('Error closing database:', err.message);
    }
    process.exit(0);
  });
});
