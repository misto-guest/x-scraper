-- Facebook Monetiser SMV Enhancements Migration
-- This migration adds SMV specification features to the MVP database
-- Run after: 001_add_predictions_table.sql

BEGIN TRANSACTION;

-- ==========================================
-- 1. ENHANCE PAGES TABLE
-- ==========================================

ALTER TABLE pages ADD COLUMN owner_name TEXT;
ALTER TABLE pages ADD COLUMN owner_entity TEXT;
ALTER TABLE pages ADD COLUMN creation_date DATE;
ALTER TABLE pages ADD COLUMN primary_niche TEXT;
ALTER TABLE pages ADD COLUMN language TEXT DEFAULT 'en';
ALTER TABLE pages ADD COLUMN monetization_status TEXT CHECK (monetization_status IN ('approved','pending','restricted'));
ALTER TABLE pages ADD COLUMN notes TEXT;

-- Add indexes for new columns
CREATE INDEX IF NOT EXISTS idx_pages_niche ON pages(primary_niche);
CREATE INDEX IF NOT EXISTS idx_pages_monetization ON pages(monetization_status);
CREATE INDEX IF NOT EXISTS idx_pages_language ON pages(language);

-- ==========================================
-- 2. ENHANCE SOURCES TABLE
-- ==========================================

ALTER TABLE sources ADD COLUMN summary TEXT;
ALTER TABLE sources ADD COLUMN confidence_level TEXT CHECK (confidence_level IN ('low','medium','high'));
ALTER TABLE sources ADD COLUMN last_verified DATE;

-- Add index for confidence level
CREATE INDEX IF NOT EXISTS idx_sources_confidence ON sources(confidence_level);
CREATE INDEX IF NOT EXISTS idx_sources_verified ON sources(last_verified);

-- ==========================================
-- 3. ENHANCE INSIGHTS TABLE
-- ==========================================

ALTER TABLE insights ADD COLUMN applicable_niches TEXT; -- JSON array
ALTER TABLE insights ADD COLUMN automation_safe BOOLEAN DEFAULT 1;

-- Add index for automation safety
CREATE INDEX IF NOT EXISTS idx_insights_automation_safe ON insights(automation_safe);

-- ==========================================
-- 4. ENHANCE SCRAPED_CONTENT TABLE
-- ==========================================

ALTER TABLE scraped_content ADD COLUMN competitor_id INTEGER REFERENCES competitors(id);
ALTER TABLE scraped_content ADD COLUMN age_hours FLOAT;
ALTER TABLE scraped_content ADD COLUMN velocity_score FLOAT;

-- Add indexes
CREATE INDEX IF NOT EXISTS idx_scraped_competitor ON scraped_content(competitor_id);
CREATE INDEX IF NOT EXISTS idx_scraped_velocity ON scraped_content(velocity_score);

-- ==========================================
-- 5. ENHANCE SCHEDULES TABLE
-- ==========================================

ALTER TABLE schedules ADD COLUMN generated_post_id INTEGER REFERENCES generated_posts(id);
ALTER TABLE schedules ADD COLUMN scheduled_time TIMESTAMP;
ALTER TABLE schedules ADD COLUMN timezone TEXT DEFAULT 'EST';
ALTER TABLE schedules ADD COLUMN auto_post BOOLEAN DEFAULT 1;

-- Add index for scheduled time
CREATE INDEX IF NOT EXISTS idx_schedules_time ON schedules(scheduled_time);
CREATE INDEX IF NOT EXISTS idx_schedules_post ON schedules(generated_post_id);

-- ==========================================
-- 6. DATA MIGRATION (DEFAULT VALUES)
-- ==========================================

-- Set default monetization status for existing pages
UPDATE pages SET monetization_status = 'pending' WHERE monetization_status IS NULL;

-- Set default confidence level for existing sources
UPDATE sources SET confidence_level = 'medium' WHERE confidence_level IS NULL;

-- Set default language for existing pages
UPDATE pages SET language = 'en' WHERE language IS NULL;

-- Set default automation_safe for existing insights
UPDATE insights SET automation_safe = 1 WHERE automation_safe IS NULL;

-- Set default timezone for existing schedules
UPDATE schedules SET timezone = 'EST' WHERE timezone IS NULL;

-- Set default auto_post for existing schedules
UPDATE schedules SET auto_post = 1 WHERE auto_post IS NULL;

-- ==========================================
-- 7. CREATE VIEWS FOR COMMON QUERIES
-- ==========================================

-- View for pages with monetization status
CREATE VIEW IF NOT EXISTS v_pages_monetization AS
SELECT
    p.*,
    COUNT(DISTINCT pa.id) as assets_count,
    COUNT(DISTINCT gp.id) as posts_count,
    COUNT(DISTINCT CASE WHEN gp.approval_status = 'posted' THEN gp.id END) as posted_count
FROM pages p
LEFT JOIN page_assets pa ON p.id = pa.page_id
LEFT JOIN generated_posts gp ON p.id = gp.page_id
WHERE p.is_active = 1
GROUP BY p.id;

-- View for sources with verification status
CREATE VIEW IF NOT EXISTS v_sources_verification AS
SELECT
    s.*,
    COUNT(DISTINCT i.id) as insights_count,
    CASE
        WHEN s.last_verified >= date('now', '-7 days') THEN 'verified'
        WHEN s.last_verified >= date('now', '-30 days') THEN 'stale'
        ELSE 'unverified'
    END as verification_status
FROM sources s
LEFT JOIN insights i ON s.id = i.source_id
GROUP BY s.id;

-- View for high-velocity content
CREATE VIEW IF NOT EXISTS v_high_velocity_content AS
SELECT
    sc.*,
    c.name as competitor_name,
    CASE
        WHEN sc.velocity_score > 0.7 THEN 'trending'
        WHEN sc.velocity_score > 0.4 THEN 'moderate'
        ELSE 'low'
    END as velocity_category
FROM scraped_content sc
LEFT JOIN competitors c ON sc.competitor_id = c.id
WHERE sc.velocity_score IS NOT NULL
ORDER BY sc.velocity_score DESC;

COMMIT;

-- ==========================================
-- VERIFICATION QUERIES
-- ==========================================

-- Verify pages enhancements
SELECT 'Pages enhanced:' as step,
       COUNT(*) as count,
       'columns added: owner_name, owner_entity, creation_date, primary_niche, language, monetization_status, notes' as details
FROM pages;

-- Verify sources enhancements
SELECT 'Sources enhanced:' as step,
       COUNT(*) as count,
       'columns added: summary, confidence_level, last_verified' as details
FROM sources;

-- Verify insights enhancements
SELECT 'Insights enhanced:' as step,
       COUNT(*) as count,
       'columns added: applicable_niches, automation_safe' as details
FROM insights;

-- Verify scraped_content enhancements
SELECT 'Scraped content enhanced:' as step,
       COUNT(*) as count,
       'columns added: competitor_id, age_hours, velocity_score' as details
FROM scraped_content;

-- Verify schedules enhancements
SELECT 'Schedules enhanced:' as step,
       COUNT(*) as count,
       'columns added: generated_post_id, scheduled_time, timezone, auto_post' as details
FROM schedules;

-- Views created
SELECT 'Migration complete!' as status;
