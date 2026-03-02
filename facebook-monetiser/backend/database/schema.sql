-- Facebook Monetiser Database Schema
-- SQLite MVP (upgradable to Postgres)

PRAGMA foreign_keys = ON;

-- 1. Pages: Facebook pages metadata (US-only enforcement)
CREATE TABLE IF NOT EXISTS pages (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    page_id TEXT UNIQUE NOT NULL,
    category TEXT,
    about TEXT,
    followers_count INTEGER DEFAULT 0,
    country TEXT DEFAULT 'US' NOT NULL CHECK(country = 'US'),
    is_active BOOLEAN DEFAULT 1,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_pages_country ON pages(country);
CREATE INDEX idx_pages_active ON pages(is_active);

-- 2. Page Assets: Websites, groups, ad accounts
CREATE TABLE IF NOT EXISTS page_assets (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    page_id INTEGER NOT NULL,
    asset_type TEXT NOT NULL CHECK(asset_type IN ('website', 'group', 'ad_account', 'instagram')),
    asset_url TEXT,
    asset_id TEXT,
    name TEXT,
    is_verified BOOLEAN DEFAULT 0,
    metadata TEXT, -- JSON for additional data
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (page_id) REFERENCES pages(id) ON DELETE CASCADE
);

CREATE INDEX idx_assets_page ON page_assets(page_id);
CREATE INDEX idx_assets_type ON page_assets(asset_type);

-- 3. Sources: Tweets, articles, case studies (full traceability)
CREATE TABLE IF NOT EXISTS sources (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    source_type TEXT NOT NULL CHECK(source_type IN ('tweet', 'article', 'case_study', 'video', 'competitor_post')),
    title TEXT,
    url TEXT UNIQUE,
    author TEXT,
    platform TEXT,
    published_date TIMESTAMP,
    content_text TEXT,
    raw_data TEXT, -- JSON for original source data
    is_verified BOOLEAN DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_sources_type ON sources(source_type);
CREATE INDEX idx_sources_url ON sources(url);
CREATE INDEX idx_sources_date ON sources(published_date);

-- 4. Insights: Learnings linked to sources
CREATE TABLE IF NOT EXISTS insights (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    source_id INTEGER NOT NULL,
    insight_text TEXT NOT NULL,
    category TEXT,
    effectiveness_score REAL DEFAULT 0.5 CHECK(effectiveness_score BETWEEN 0 AND 1),
    tags TEXT, -- JSON array
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (source_id) REFERENCES sources(id) ON DELETE CASCADE
);

CREATE INDEX idx_insights_source ON insights(source_id);
CREATE INDEX idx_insights_category ON insights(category);
CREATE INDEX idx_insights_effectiveness ON insights(effectiveness_score);

-- 5. Competitors: Tracked competitor pages
CREATE TABLE IF NOT EXISTS competitors (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    page_id TEXT UNIQUE NOT NULL,
    category TEXT,
    followers_count INTEGER DEFAULT 0,
    country TEXT DEFAULT 'US',
    last_scraped TIMESTAMP,
    is_active BOOLEAN DEFAULT 1,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_competitors_active ON competitors(is_active);

-- 6. Scraped Content: Mock Apify/Firecrawl data
CREATE TABLE IF NOT EXISTS scraped_content (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    source_type TEXT NOT NULL CHECK(source_type IN ('twitter', 'facebook', 'instagram', 'news', 'blog')),
    source_url TEXT,
    content_type TEXT CHECK(content_type IN ('text', 'image', 'video', 'carousel', 'story')),
    title TEXT,
    body TEXT,
    media_urls TEXT, -- JSON array
    engagement_likes INTEGER DEFAULT 0,
    engagement_shares INTEGER DEFAULT 0,
    engagement_comments INTEGER DEFAULT 0,
    scraped_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    raw_data TEXT -- JSON for original scrape
);

CREATE INDEX idx_scraped_type ON scraped_content(source_type);
CREATE INDEX idx_scraped_date ON scraped_content(scraped_at);

-- 7. Generated Posts: AI drafts with approval workflow
CREATE TABLE IF NOT EXISTS generated_posts (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    page_id INTEGER NOT NULL,
    content_type TEXT NOT NULL CHECK(content_type IN ('image', 'reel', 'text', 'carousel', 'story')),
    caption TEXT,
    first_comment TEXT,
    image_prompt TEXT,
    source_id INTEGER, -- Linked to source for traceability
    competitor_id INTEGER, -- Based on competitor research
    originality_score REAL DEFAULT 0.5 CHECK(originality_score BETWEEN 0 AND 1),
    risk_score REAL DEFAULT 0 CHECK(risk_score BETWEEN 0 AND 1),
    approval_status TEXT DEFAULT 'pending' CHECK(approval_status IN ('pending', 'auto_approved', 'approved', 'rejected', 'scheduled', 'posted')),
    scheduled_for TIMESTAMP,
    posted_at TIMESTAMP,
    generated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (page_id) REFERENCES pages(id) ON DELETE CASCADE,
    FOREIGN KEY (source_id) REFERENCES sources(id) ON DELETE SET NULL,
    FOREIGN KEY (competitor_id) REFERENCES competitors(id) ON DELETE SET NULL
);

CREATE INDEX idx_posts_page ON generated_posts(page_id);
CREATE INDEX idx_posts_status ON generated_posts(approval_status);
CREATE INDEX idx_posts_scheduled ON generated_posts(scheduled_for);
CREATE INDEX idx_posts_source ON generated_posts(source_id);

-- 8. Schedules: Posting times (EST timezone)
CREATE TABLE IF NOT EXISTS schedules (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    page_id INTEGER NOT NULL,
    day_of_week INTEGER CHECK(day_of_week BETWEEN 0 AND 6), -- 0=Sunday, 6=Saturday
    post_time TEXT NOT NULL, -- HH:MM format in EST
    content_type TEXT CHECK(content_type IN ('image', 'reel', 'text', 'any')),
    is_active BOOLEAN DEFAULT 1,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (page_id) REFERENCES pages(id) ON DELETE CASCADE
);

CREATE INDEX idx_schedules_page ON schedules(page_id);
CREATE INDEX idx_schedules_active ON schedules(is_active);

-- 9. Post Performance: Feedback loop
CREATE TABLE IF NOT EXISTS post_performance (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    post_id INTEGER NOT NULL UNIQUE,
    platform_post_id TEXT,
    reach INTEGER DEFAULT 0,
    impressions INTEGER DEFAULT 0,
    engagement_rate REAL DEFAULT 0,
    clicks INTEGER DEFAULT 0,
    shares INTEGER DEFAULT 0,
    comments INTEGER DEFAULT 0,
    likes INTEGER DEFAULT 0,
    saves INTEGER DEFAULT 0,
    cpc REAL,
    ctr REAL,
    recorded_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (post_id) REFERENCES generated_posts(id) ON DELETE CASCADE
);

CREATE INDEX idx_performance_post ON post_performance(post_id);

-- 10. Automation Limits: Human-override rules
CREATE TABLE IF NOT EXISTS automation_limits (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    rule_name TEXT NOT NULL UNIQUE,
    rule_type TEXT NOT NULL CHECK(rule_type IN ('risk_threshold', 'rate_limit', 'content_filter', 'time_restrictions', 'manual_approval')),
    threshold_value REAL,
    conditions TEXT, -- JSON for complex conditions
    action TEXT CHECK(action IN ('block', 'flag', 'require_approval', 'allow')),
    is_active BOOLEAN DEFAULT 1,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_limits_active ON automation_limits(is_active);

-- Insert default automation limits
INSERT INTO automation_limits (rule_name, rule_type, threshold_value, action, is_active) VALUES
('max_risk_score', 'risk_threshold', 0.7, 'require_approval', 1),
('political_content', 'content_filter', 0.5, 'flag', 1),
('min_originality', 'content_filter', 0.3, 'block', 1),
('non_us_context', 'content_filter', 0.8, 'flag', 1),
('sensitive_topics', 'content_filter', 0.6, 'require_approval', 1);
