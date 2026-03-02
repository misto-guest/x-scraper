const express = require('express');
const cors = require('cors');
const initSqlJs = require('sql.js');
const fs = require('fs');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.static('public'));

// Database file path
const dbPath = path.join(__dirname, 'data', 'gps-tracking.db');
const dbDir = path.join(__dirname, 'data');

// Ensure data directory exists
if (!fs.existsSync(dbDir)) {
  fs.mkdirSync(dbDir, { recursive: true });
}

// Global database instance
let db;

// Initialize database
async function initDB() {
  const SQL = await initSqlJs();

  // Load or create database
  if (fs.existsSync(dbPath)) {
    const fileBuffer = fs.readFileSync(dbPath);
    db = new SQL.Database(fileBuffer);
  } else {
    db = new SQL.Database();
    createTables();
  }

  console.log('✅ Database initialized');
}

// Create database tables
function createTables() {
  db.run(`
    CREATE TABLE IF NOT EXISTS businesses (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      address TEXT NOT NULL,
      lat REAL,
      lng REAL,
      phone TEXT,
      website TEXT,
      rating REAL,
      reviews_count INTEGER DEFAULT 0,
      gmb_url TEXT,
      last_visit DATE,
      next_visit DATE,
      status TEXT DEFAULT 'active',
      notes TEXT,
      contact_info TEXT,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );
  `);

  db.run(`
    CREATE TABLE IF NOT EXISTS visits (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      business_id INTEGER,
      visit_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      notes TEXT,
      status TEXT DEFAULT 'completed',
      FOREIGN KEY (business_id) REFERENCES businesses(id)
    );
  `);

  saveDatabase();
}

// Save database to disk
function saveDatabase() {
  const data = db.export();
  const buffer = Buffer.from(data);
  fs.writeFileSync(dbPath, buffer);
}

// Run SQL query and return results
function query(sql, params = []) {
  const stmt = db.prepare(sql);
  stmt.bind(params);

  const results = [];
  while (stmt.step()) {
    const row = stmt.getAsObject();
    results.push(row);
  }

  stmt.free();
  return results;
}

// Run SQL update/insert/delete
function run(sql, params = []) {
  db.run(sql, params);
  saveDatabase();
}

// Get last insert ID
function lastInsertId() {
  const result = query("SELECT last_insert_rowid() as id");
  return result[0].id;
}

// Initialize and start server
initDB().then(() => {
  // API Routes

  // GET /api/businesses - List all businesses
  app.get('/api/businesses', (req, res) => {
    const businesses = query('SELECT * FROM businesses ORDER BY name');
    res.json(businesses);
  });

  // GET /api/businesses/:id - Get single business
  app.get('/api/businesses/:id', (req, res) => {
    const businesses = query('SELECT * FROM businesses WHERE id = ?', [req.params.id]);
    if (businesses.length === 0) {
      return res.status(404).json({ error: 'Business not found' });
    }
    res.json(businesses[0]);
  });

  // POST /api/businesses - Add new business
  app.post('/api/businesses', (req, res) => {
    const { name, address, lat, lng, phone, website, rating, reviews_count, gmb_url, contact_info, notes } = req.body;

    if (!name || !address) {
      return res.status(400).json({ error: 'Name and address are required' });
    }

    run(`
      INSERT INTO businesses (name, address, lat, lng, phone, website, rating, reviews_count, gmb_url, contact_info, notes)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `, [name, address, lat, lng, phone, website, rating, reviews_count, gmb_url, contact_info, notes]);

    const id = lastInsertId();
    const business = query('SELECT * FROM businesses WHERE id = ?', [id])[0];

    res.status(201).json(business);
  });

  // PUT /api/businesses/:id - Update business
  app.put('/api/businesses/:id', (req, res) => {
    const { name, address, lat, lng, last_visit, next_visit, status, notes, contact_info, phone, website, rating, reviews_count } = req.body;

    run(`
      UPDATE businesses
      SET name = ?, address = ?, lat = ?, lng = ?, last_visit = ?, next_visit = ?, status = ?, notes = ?, contact_info = ?, phone = ?, website = ?, rating = ?, reviews_count = ?
      WHERE id = ?
    `, [name, address, lat, lng, last_visit, next_visit, status, notes, contact_info, phone, website, rating, reviews_count, req.params.id]);

    const businesses = query('SELECT * FROM businesses WHERE id = ?', [req.params.id]);
    if (businesses.length === 0) {
      return res.status(404).json({ error: 'Business not found' });
    }

    res.json(businesses[0]);
  });

  // DELETE /api/businesses/:id - Delete business
  app.delete('/api/businesses/:id', (req, res) => {
    const result = query('SELECT * FROM businesses WHERE id = ?', [req.params.id]);

    if (result.length === 0) {
      return res.status(404).json({ error: 'Business not found' });
    }

    run('DELETE FROM businesses WHERE id = ?', [req.params.id]);
    res.json({ message: 'Business deleted successfully' });
  });

  // GET /api/routes - Generate optimized route using OSRM
  app.get('/api/routes', async (req, res) => {
    try {
      const businesses = query('SELECT * FROM businesses WHERE lat IS NOT NULL AND lng IS NOT NULL');

      if (businesses.length < 2) {
        return res.status(400).json({ error: 'Need at least 2 businesses with coordinates' });
      }

      // For OSRM, we need coordinates in format: longitude,latitude
      const coordinates = businesses.map(b => `${b.lng},${b.lat}`).join(';');

      // Call OSRM API for route optimization
      const osrmUrl = `https://router.project-osrm.org/trip/v1/driving/${coordinates}?source=first&destination=last&roundtrip=false`;

      const response = await fetch(osrmUrl);
      const data = await response.json();

      if (data.code !== 'Ok') {
        return res.status(500).json({ error: 'Route optimization failed' });
      }

      // Map the optimized order back to businesses
      const optimizedRoute = data.waypoints.map((wp, index) => {
        const businessIndex = wp.waypoint_index;
        return {
          ...businesses[businessIndex],
          order: index + 1
        };
      });

      // Calculate total distance and duration
      const totalDistance = (data.trips[0].distance / 1000).toFixed(2); // km
      const totalDuration = Math.round(data.trips[0].duration / 60); // minutes

      res.json({
        route: optimizedRoute,
        totalDistance: `${totalDistance} km`,
        totalDuration: `${totalDuration} min`,
        geometry: data.trips[0].geometry
      });

    } catch (error) {
      console.error('Route generation error:', error);
      res.status(500).json({ error: 'Failed to generate route' });
    }
  });

  // GET /api/dashboard - Dashboard summary data
  app.get('/api/dashboard', (req, res) => {
    const totalBusinesses = query('SELECT COUNT(*) as count FROM businesses')[0].count;
    const activeBusinesses = query("SELECT COUNT(*) as count FROM businesses WHERE status = 'active'")[0].count;

    const visitsThisMonth = query(`
      SELECT COUNT(*) as count FROM visits
      WHERE visit_date >= date('now', 'start of month')
    `)[0].count;

    const recentVisits = query(`
      SELECT v.*, b.name as business_name
      FROM visits v
      JOIN businesses b ON v.business_id = b.id
      ORDER BY v.visit_date DESC
      LIMIT 5
    `);

    const upcomingVisits = query(`
      SELECT * FROM businesses
      WHERE next_visit >= date('now')
      ORDER BY next_visit ASC
      LIMIT 5
    `);

    res.json({
      stats: {
        totalBusinesses,
        activeBusinesses,
        visitsThisMonth
      },
      recentVisits,
      upcomingVisits
    });
  });

  // POST /api/visits - Log a visit
  app.post('/api/visits', (req, res) => {
    const { business_id, notes, status } = req.body;

    run(`
      INSERT INTO visits (business_id, notes, status)
      VALUES (?, ?, ?)
    `, [business_id, notes, status || 'completed']);

    // Update last_visit date for the business
    run('UPDATE businesses SET last_visit = CURRENT_TIMESTAMP WHERE id = ?', [business_id]);

    const id = lastInsertId();
    const visit = query('SELECT * FROM visits WHERE id = ?', [id])[0];

    res.status(201).json(visit);
  });

  // GET /api/visits - Get visit history
  app.get('/api/visits', (req, res) => {
    const visits = query(`
      SELECT v.*, b.name as business_name, b.address
      FROM visits v
      JOIN businesses b ON v.business_id = b.id
      ORDER BY v.visit_date DESC
      LIMIT 50
    `);

    res.json(visits);
  });

  // Start server
  app.listen(PORT, () => {
    console.log(`\n🚀 GPS Tracking System running on http://localhost:${PORT}`);
    console.log(`📊 Dashboard: http://localhost:${PORT}/index.html`);
    console.log(`🗺️  Routes: http://localhost:${PORT}/routes.html`);
    console.log(`📍 Map: http://localhost:${PORT}/map.html\n`);
  });
}).catch(err => {
  console.error('Failed to initialize database:', err);
  process.exit(1);
});
