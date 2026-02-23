import Database from 'better-sqlite3'
import path from 'path'

const dbPath = path.join(process.cwd(), 'data', 'pr-onderzoek.db')

// Initialize database
export function initDatabase() {
  const db = new Database(dbPath)

  // Create tables
  db.exec(`
    CREATE TABLE IF NOT EXISTS press_releases (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      title TEXT NOT NULL,
      company TEXT,
      date TEXT,
      url TEXT UNIQUE,
      content TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS backlinks (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      press_release_id INTEGER,
      site_name TEXT,
      site_url TEXT,
      domain_authority INTEGER,
      context TEXT,
      anchor_text TEXT,
      social_shares INTEGER DEFAULT 0,
      is_verbatim INTEGER DEFAULT 0,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (press_release_id) REFERENCES press_releases(id)
    );

    CREATE TABLE IF NOT EXISTS analysis_results (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      press_release_id INTEGER,
      unique_domains INTEGER DEFAULT 0,
      seo_impact REAL DEFAULT 0,
      visibility_score REAL DEFAULT 0,
      factors TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (press_release_id) REFERENCES press_releases(id)
    );

    CREATE INDEX IF NOT EXISTS idx_press_releases_date ON press_releases(date);
    CREATE INDEX IF NOT EXISTS idx_backlinks_press_release ON backlinks(press_release_id);
  `)

  return db
}

// Export the function for manual initialization
export default initDatabase
