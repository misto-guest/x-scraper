const initSqlJs = require('sql.js');
const fs = require('fs');
const path = require('path');

const dbPath = path.join(__dirname, '../data/gps-tracking.db');

async function removeTestBusinesses() {
  const SQL = await initSqlJs();

  // Load database
  const fileBuffer = fs.readFileSync(dbPath);
  const db = new SQL.Database(fileBuffer);

  console.log('🗂️  Current businesses:');
  const businesses = db.exec('SELECT id, name, address FROM businesses');
  businesses[0].values.forEach(row => {
    console.log(`  [${row[0]}] ${row[1]} - ${row[2]}`);
  });

  console.log('\n🗑️  Removing test businesses...');
  const result = db.exec('DELETE FROM businesses WHERE name LIKE "%Test Business%"');
  const deletedCount = result[0] ? result[0].values.length : 0;
  console.log(`✅ Deleted ${deletedCount} test business(es)`);

  console.log('\n📋 Remaining businesses:');
  const remaining = db.exec('SELECT id, name, address FROM businesses');
  remaining[0].values.forEach(row => {
    console.log(`  [${row[0]}] ${row[1]} - ${row[2]}`);
  });

  // Save changes
  const data = db.export();
  const buffer = Buffer.from(data);
  fs.writeFileSync(dbPath, buffer);

  console.log('\n✅ Database updated successfully');
}

removeTestBusinesses().catch(console.error);
