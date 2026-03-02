const initSqlJs = require('sql.js');
const fs = require('fs');
const path = require('path');

const dbPath = path.join(__dirname, '..', 'data', 'gps-tracking.db');
const dbDir = path.join(__dirname, '..', 'data');

// Ensure data directory exists
if (!fs.existsSync(dbDir)) {
  fs.mkdirSync(dbDir, { recursive: true });
}

// Remove existing database if it exists
if (fs.existsSync(dbPath)) {
  fs.unlinkSync(dbPath);
  console.log('🗑️  Removed existing database');
}

async function initDB() {
  const SQL = await initSqlJs();
  const db = new SQL.Database();

  // Create tables with GMB-specific fields
  db.run(`
    CREATE TABLE businesses (
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
    CREATE TABLE visits (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      business_id INTEGER,
      visit_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      notes TEXT,
      status TEXT DEFAULT 'completed',
      FOREIGN KEY (business_id) REFERENCES businesses(id)
    );
  `);

  console.log('✅ Database schema created with GMB fields\n');

  // Insert sample businesses (2 GMB placeholders + 2 test businesses)
  const businesses = [
    {
      name: 'Private Detective Agency',
      address: 'Keizersgracht 123, 1015 CJ Amsterdam, Netherlands',
      lat: 52.3731,
      lng: 4.8832,
      phone: '+31 20 123 4567',
      website: 'https://privatedetective.nl',
      rating: 4.8,
      reviews_count: 127,
      gmb_url: 'https://share.google/OXTqPbi0tHOWnHCJ4',
      notes: 'Private investigation services - requires quarterly visits\nSource: GMB Listing',
      next_visit: '2026-03-15'
    },
    {
      name: 'Royal Sleepdienst',
      address: 'Weena 450, 3013 AL Rotterdam, Netherlands',
      lat: 51.9244,
      lng: 4.4777,
      phone: '+31 10 987 6543',
      website: 'https://royalsleepdienst.nl',
      rating: 4.5,
      reviews_count: 89,
      gmb_url: 'https://share.google/PZ32aiKBFHkbEdiFa',
      notes: 'Sleep services and consultation - monthly visits required\nSource: GMB Listing',
      next_visit: '2026-03-10'
    },
    {
      name: 'Test Business 1 - Amsterdam HQ',
      address: 'Damrak 50, 1012 LL Amsterdam, Netherlands',
      lat: 52.3702,
      lng: 4.8952,
      phone: '+31 20 111 2222',
      website: 'https://testbusiness.nl/amsterdam',
      rating: 4.2,
      reviews_count: 45,
      gmb_url: null,
      notes: 'Regional headquarters - bi-weekly visits',
      next_visit: '2026-03-08'
    },
    {
      name: 'Test Business 2 - Rotterdam Branch',
      address: 'Coolsingel 120, 3012 AG Rotterdam, Netherlands',
      lat: 51.9220,
      lng: 4.4734,
      phone: '+31 10 333 4444',
      website: 'https://testbusiness.nl/rotterdam',
      rating: 4.6,
      reviews_count: 73,
      gmb_url: null,
      notes: 'Branch office - monthly visits',
      next_visit: '2026-03-12'
    }
  ];

  console.log('📍 Adding businesses to database:\n');

  businesses.forEach(business => {
    db.run(`
      INSERT INTO businesses (name, address, lat, lng, phone, website, rating, reviews_count, gmb_url, notes, next_visit)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `, [
      business.name,
      business.address,
      business.lat,
      business.lng,
      business.phone,
      business.website,
      business.rating,
      business.reviews_count,
      business.gmb_url,
      business.notes,
      business.next_visit
    ]);

    console.log(`✓ Added: ${business.name}`);
    console.log(`  📍 ${business.address}`);
    if (business.rating) {
      console.log(`  ⭐ Rating: ${business.rating} (${business.reviews_count} reviews)`);
    }
    console.log('');
  });

  // Add some sample visit history
  const visits = [
    { business_id: 1, notes: 'Quarterly compliance check completed', status: 'completed' },
    { business_id: 2, notes: 'Monthly consultation meeting - discussed new services', status: 'completed' },
    { business_id: 3, notes: 'Bi-weekly operational review - all systems go', status: 'completed' },
    { business_id: 4, notes: 'Monthly branch inspection passed', status: 'completed' },
  ];

  console.log('📝 Adding visit history:\n');
  visits.forEach((visit, index) => {
    const daysAgo = (index + 1) * 3;
    db.run(`
      INSERT INTO visits (business_id, notes, status, visit_date)
      VALUES (?, ?, ?, datetime('now', '-' || ${daysAgo} || ' days'))
    `, [visit.business_id, visit.notes, visit.status]);

    console.log(`✓ Visit logged for business #${visit.business_id}: ${visit.notes}`);
  });

  // Save database to file
  const data = db.export();
  const buffer = Buffer.from(data);
  fs.writeFileSync(dbPath, buffer);

  console.log('\n' + '='.repeat(60));
  console.log('✅ Database initialized successfully!');
  console.log(`📍 Database location: ${dbPath}`);
  console.log(`📊 Total businesses: ${businesses.length}`);
  console.log(`📝 Total visits: ${visits.length}`);
  console.log('='.repeat(60));
}

initDB().catch(err => {
  console.error('Failed to initialize database:', err);
  process.exit(1);
});
