/**
 * Gmail Warmup Engine V2
 * 
 * Features:
 * - Human-like behavior emulation
 * - Memory-safe browser management
 * - Proper cleanup after each session
 * - Google services warmup (Gmail, Drive, Calendar)
 * - Configurable activity patterns
 */

const puppeteer = require('puppeteer');
const fs = require('fs').promises;
const path = require('path');

class WarmupEngine {
    constructor(config = {}) {
        this.config = {
            headless: config.headless ?? false,
            viewport: {
                width: config.viewport?.width || 1920,
                height: config.viewport?.height || 1080
            },
            userAgent: config.userAgent || 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36',
            screenshotDir: config.screenshotDir || './screenshots',
            enableScreenshots: config.enableScreenshots ?? true,
            // Human behavior settings
            delays: {
                minActionDelay: config.delays?.minActionDelay || 2000,
                maxActionDelay: config.delays?.maxActionDelay || 5000,
                minPageStay: config.delays?.minPageStay || 10000,
                maxPageStay: config.delays?.maxPageStay || 30000
            },
            activities: config.activities || ['gmail', 'drive', 'search', 'news']
        };
        
        this.browser = null;
        this.page = null;
        this.profileId = null;
        this.sessionStats = {
            activities: [],
            startTime: null,
            endTime: null
        };
    }

    /**
     * Initialize browser with CDP connection
     */
    async initialize(cdpUrl, profileId) {
        this.profileId = profileId;
        this.sessionStats.startTime = new Date().toISOString();

        // Connect to AdsPower browser via CDP
        this.browser = await puppeteer.connect({
            browserWSEndpoint: cdpUrl,
            defaultViewport: this.config.viewport
        });

        // Get or create page
        const pages = await this.browser.pages();
        this.page = pages.length > 0 ? pages[0] : await this.browser.newPage();

        // Set user agent
        await this.page.setUserAgent(this.config.userAgent);

        // Anti-detection measures
        await this.page.evaluateOnNewDocument(() => {
            // Hide webdriver flag
            Object.defineProperty(navigator, 'webdriver', {
                get: () => false
            });
            
            // Fake plugins
            Object.defineProperty(navigator, 'plugins', {
                get: () => [1, 2, 3, 4, 5]
            });
            
            // Fake languages
            Object.defineProperty(navigator, 'languages', {
                get: () => ['en-US', 'en']
            });

            // Mock Chrome object
            window.chrome = {
                runtime: {}
            };

            // Mock permissions
            const originalQuery = window.navigator.permissions.query;
            window.navigator.permissions.query = (parameters) => (
                parameters.name === 'notifications' ?
                    Promise.resolve({ state: Notification.permission }) :
                    originalQuery(parameters)
            );
        });

        return { success: true, message: 'Browser initialized' };
    }

    /**
     * Random delay helper
     */
    async delay(min, max) {
        const ms = Math.floor(Math.random() * (max - min + 1)) + min;
        await new Promise(resolve => setTimeout(resolve, ms));
        return ms;
    }

    /**
     * Human-like mouse movements
     */
    async humanMouseMovements() {
        const moveCount = Math.floor(Math.random() * 5) + 2;
        
        for (let i = 0; i < moveCount; i++) {
            const x = Math.floor(Math.random() * 800) + 100;
            const y = Math.floor(Math.random() * 600) + 100;
            
            await this.page.mouse.move(x, y, {
                steps: Math.floor(Math.random() * 10) + 5
            });
            
            await this.delay(100, 500);
        }
    }

    /**
     * Human-like scrolling
     */
    async humanScroll() {
        const scrollCount = Math.floor(Math.random() * 4) + 1;
        
        for (let i = 0; i < scrollCount; i++) {
            const scrollAmount = Math.floor(Math.random() * 300) + 100;
            
            await this.page.evaluate((amount) => {
                window.scrollBy({
                    top: amount,
                    left: 0,
                    behavior: 'smooth'
                });
            }, scrollAmount);
            
            await this.delay(500, 2000);
        }
    }

    /**
     * Take screenshot with metadata
     */
    async takeScreenshot(name) {
        if (!this.config.enableScreenshots) return null;

        try {
            await fs.mkdir(this.config.screenshotDir, { recursive: true });
            const filename = `${this.profileId}_${name}_${Date.now()}.png`;
            const filepath = path.join(this.config.screenshotDir, filename);
            
            await this.page.screenshot({ path: filepath, fullPage: false });
            return filepath;
        } catch (error) {
            console.error(`Screenshot failed: ${error.message}`);
            return null;
        }
    }

    /**
     * Gmail warmup - check and interact with emails
     */
    async warmupGmail() {
        const activity = { type: 'gmail', startTime: Date.now() };
        
        try {
            console.log(`📧 Starting Gmail warmup for profile ${this.profileId}`);
            
            await this.page.goto('https://mail.google.com', { 
                waitUntil: 'networkidle2',
                timeout: 30000 
            });

            await this.delay(5000, 8000);
            await this.humanMouseMovements();
            await this.humanScroll();

            // Check if logged in
            const isLoggedIn = await this.page.evaluate(() => {
                return !document.querySelector('[data-action="sign in"]') &&
                       !document.querySelector('a[href*="ServiceLogin"]');
            });

            if (!isLoggedIn) {
                activity.success = false;
                activity.error = 'Not logged in to Gmail';
                console.log('⚠️  Not logged in to Gmail');
                return activity;
            }

            // Wait for inbox to load
            await this.delay(5000, 10000);
            await this.humanScroll();
            await this.takeScreenshot('gmail_inbox');

            // Click on a few emails (human-like)
            const emailClicked = await this.page.evaluate(async () => {
                const emails = document.querySelectorAll('tr.zA, td.yX, div[data-thread-perm-id]');
                
                if (emails.length > 2) {
                    // Click on a random email
                    const randomIndex = Math.floor(Math.random() * Math.min(5, emails.length));
                    const email = emails[randomIndex];
                    
                    if (email) {
                        email.click();
                        return true;
                    }
                }
                return false;
            });

            if (emailClicked) {
                await this.delay(3000, 8000);
                await this.humanScroll();
                await this.takeScreenshot('gmail_email_open');
                
                // Go back to inbox
                await this.page.goBack();
                await this.delay(2000, 4000);
            }

            activity.success = true;
            activity.emailsViewed = emailClicked ? 1 : 0;
            console.log('✅ Gmail warmup completed');

        } catch (error) {
            activity.success = false;
            activity.error = error.message;
            console.error(`❌ Gmail warmup failed: ${error.message}`);
        }

        activity.endTime = Date.now();
        activity.duration = activity.endTime - activity.startTime;
        this.sessionStats.activities.push(activity);
        
        return activity;
    }

    /**
     * Google Drive warmup
     */
    async warmupDrive() {
        const activity = { type: 'drive', startTime: Date.now() };
        
        try {
            console.log('📁 Starting Google Drive warmup');
            
            await this.page.goto('https://drive.google.com', { 
                waitUntil: 'networkidle2',
                timeout: 30000 
            });

            await this.delay(5000, 8000);
            await this.humanMouseMovements();
            await this.humanScroll();
            await this.takeScreenshot('drive_main');

            // Try to interact with files/folders
            await this.delay(3000, 6000);
            await this.humanScroll();

            activity.success = true;
            console.log('✅ Google Drive warmup completed');

        } catch (error) {
            activity.success = false;
            activity.error = error.message;
            console.error(`❌ Google Drive warmup failed: ${error.message}`);
        }

        activity.endTime = Date.now();
        activity.duration = activity.endTime - activity.startTime;
        this.sessionStats.activities.push(activity);
        
        return activity;
    }

    /**
     * Google Search warmup
     */
    async warmupSearch() {
        const activity = { type: 'search', startTime: Date.now() };
        
        try {
            const queries = ['weather today', 'news', 'technology trends', 'recipe'];
            const query = queries[Math.floor(Math.random() * queries.length)];
            
            console.log(`🔍 Starting Google Search warmup: "${query}"`);
            
            await this.page.goto('https://www.google.com', { 
                waitUntil: 'networkidle2',
                timeout: 30000 
            });

            await this.delay(2000, 4000);

            // Type search query
            const searchInput = await this.page.$('textarea[name="q"], input[name="q"]');
            if (searchInput) {
                await searchInput.click();
                await this.delay(500, 1000);
                
                // Human-like typing
                for (const char of query) {
                    await searchInput.type(char, { delay: Math.random() * 100 + 50 });
                }
                
                await this.delay(500, 1500);
                await this.page.keyboard.press('Enter');
            }

            await this.delay(5000, 8000);
            await this.humanScroll();
            await this.humanMouseMovements();
            await this.takeScreenshot('search_results');

            // Click first result
            const clickedResult = await this.page.evaluate(() => {
                const results = document.querySelectorAll('h3');
                if (results.length > 0) {
                    const link = results[0].closest('a');
                    if (link) {
                        link.click();
                        return true;
                    }
                }
                return false;
            });

            if (clickedResult) {
                await this.delay(8000, 15000);
                await this.humanScroll();
                await this.takeScreenshot('search_page');
            }

            activity.success = true;
            activity.query = query;
            console.log('✅ Google Search warmup completed');

        } catch (error) {
            activity.success = false;
            activity.error = error.message;
            console.error(`❌ Google Search warmup failed: ${error.message}`);
        }

        activity.endTime = Date.now();
        activity.duration = activity.endTime - activity.startTime;
        this.sessionStats.activities.push(activity);
        
        return activity;
    }

    /**
     * Google News warmup
     */
    async warmupNews() {
        const activity = { type: 'news', startTime: Date.now() };
        
        try {
            console.log('📰 Starting Google News warmup');
            
            await this.page.goto('https://news.google.com', { 
                waitUntil: 'networkidle2',
                timeout: 30000 
            });

            await this.delay(5000, 8000);
            await this.humanScroll();
            await this.humanMouseMovements();
            await this.takeScreenshot('news_main');

            // Try to click an article
            const clickedArticle = await this.page.evaluate(() => {
                const articles = document.querySelectorAll('article');
                if (articles.length > 0) {
                    const randomIndex = Math.floor(Math.random() * Math.min(3, articles.length));
                    const article = articles[randomIndex];
                    const link = article.querySelector('a');
                    if (link) {
                        link.click();
                        return true;
                    }
                }
                return false;
            });

            if (clickedArticle) {
                await this.delay(10000, 20000);
                await this.humanScroll();
                await this.takeScreenshot('news_article');
            }

            activity.success = true;
            console.log('✅ Google News warmup completed');

        } catch (error) {
            activity.success = false;
            activity.error = error.message;
            console.error(`❌ Google News warmup failed: ${error.message}`);
        }

        activity.endTime = Date.now();
        activity.duration = activity.endTime - activity.startTime;
        this.sessionStats.activities.push(activity);
        
        return activity;
    }

    /**
     * Run all configured warmup activities
     */
    async runWarmup() {
        console.log(`\n🚀 Starting warmup for profile ${this.profileId}`);
        console.log(`📋 Activities: ${this.config.activities.join(', ')}\n`);

        try {
            for (const activityType of this.config.activities) {
                // Random delay between activities
                if (this.sessionStats.activities.length > 0) {
                    const delayMs = await this.delay(
                        this.config.delays.minActionDelay,
                        this.config.delays.maxActionDelay
                    );
                    console.log(`⏳ Waiting ${Math.round(delayMs/1000)}s before next activity...\n`);
                }

                switch (activityType) {
                    case 'gmail':
                        await this.warmupGmail();
                        break;
                    case 'drive':
                        await this.warmupDrive();
                        break;
                    case 'search':
                        await this.warmupSearch();
                        break;
                    case 'news':
                        await this.warmupNews();
                        break;
                    default:
                        console.log(`⚠️  Unknown activity type: ${activityType}`);
                }

                // Brief pause after each activity
                await this.delay(2000, 5000);
            }

            this.sessionStats.endTime = new Date().toISOString();
            
            // Generate summary
            const successful = this.sessionStats.activities.filter(a => a.success).length;
            const total = this.sessionStats.activities.length;
            
            console.log(`\n✅ Warmup completed for profile ${this.profileId}`);
            console.log(`📊 Results: ${successful}/${total} activities successful`);
            console.log(`⏱️  Duration: ${Math.round((Date.now() - new Date(this.sessionStats.startTime).getTime()) / 1000)}s\n`);

            return {
                success: true,
                profile_id: this.profileId,
                stats: this.sessionStats,
                summary: {
                    total: total,
                    successful: successful,
                    failed: total - successful,
                    successRate: total > 0 ? (successful / total * 100).toFixed(1) : 0
                }
            };

        } catch (error) {
            console.error(`❌ Fatal error during warmup: ${error.message}`);
            return {
                success: false,
                profile_id: this.profileId,
                error: error.message,
                stats: this.sessionStats
            };
        }
    }

    /**
     * Cleanup - Close all pages and disconnect
     * CRITICAL for memory management
     */
    async cleanup() {
        console.log(`🧹 Cleaning up profile ${this.profileId}...`);
        
        try {
            // Close all pages except the first one
            const pages = await this.browser.pages();
            
            for (let i = 1; i < pages.length; i++) {
                try {
                    await pages[i].close();
                } catch (e) {
                    // Page might already be closed
                }
            }

            // Clear cache, cookies, storage
            if (this.page) {
                try {
                    await this.page.evaluate(() => {
                        // Clear localStorage
                        if (window.localStorage) {
                            window.localStorage.clear();
                        }
                        // Clear sessionStorage
                        if (window.sessionStorage) {
                            window.sessionStorage.clear();
                        }
                    });
                } catch (e) {
                    // Page might be navigating
                }
            }

            // Disconnect from browser (don't close, let AdsPower handle it)
            if (this.browser) {
                await this.browser.disconnect();
            }

            console.log('✅ Cleanup completed');
            return { success: true };

        } catch (error) {
            console.error(`❌ Cleanup error: ${error.message}`);
            return { success: false, error: error.message };
        }
    }
}

module.exports = WarmupEngine;
