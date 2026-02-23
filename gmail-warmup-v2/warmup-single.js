/**
 * Standalone Gmail Warmup Script for Single Profile
 * 
 * Usage:
 *   node warmup-single.js k12am9a2
 *   node warmup-single.js k12am9a2 --activities gmail,search,news
 * 
 * Features:
 * - Direct AdsPower connection (no server needed)
 * - Configurable activities
 * - Memory-safe with proper cleanup
 * - Screenshot capture for debugging
 */

const puppeteer = require('puppeteer-core');
const fs = require('fs').promises;
const path = require('path');
const http = require('http');

// Configuration
const CONFIG = {
    adspower: {
        apiKey: '746feb8ab409fbb27a0377a864279e6c000f879a7a0e5329',
        baseUrl: 'http://95.217.224.154:50325',
        serverIP: '95.217.224.154'
    },
    warmup: {
        activities: ['gmail', 'search', 'news'],
        delays: {
            minAction: 2000,
            maxAction: 5000,
            minPageStay: 10000,
            maxPageStay: 30000
        },
        headless: false,
        screenshots: true
    }
};

/**
 * Make HTTP request to AdsPower API
 */
async function adspowerRequest(endpoint, method = 'GET', data = null) {
    return new Promise((resolve, reject) => {
        const url = `${CONFIG.adspower.baseUrl}/api/v2${endpoint}`;
        const urlObj = new URL(url);
        urlObj.searchParams.append('api_key', CONFIG.adspower.apiKey);

        const options = {
            method: method,
            headers: { 'Content-Type': 'application/json' },
            timeout: 30000
        };

        const req = http.request(urlObj, options, (res) => {
            let body = '';
            res.on('data', chunk => body += chunk);
            res.on('end', () => {
                try {
                    const response = JSON.parse(body);
                    if (response.code === 0) {
                        resolve(response.data || response);
                    } else {
                        reject(new Error(`API Error: ${response.msg || response.message}`));
                    }
                } catch (e) {
                    reject(new Error(`Invalid JSON: ${body}`));
                }
            });
        });

        req.on('error', reject);
        req.on('timeout', () => {
            req.destroy();
            reject(new Error('Request timeout'));
        });

        if (data && (method === 'POST' || method === 'PUT')) {
            req.write(JSON.stringify(data));
        }

        req.end();
    });
}

/**
 * Start AdsPower browser profile
 */
async function startProfile(profileId) {
    console.log(`🚀 Starting profile ${profileId}...`);

    const data = {
        profile_id: profileId,
        headless: false,
        open_tabs: true,
        ip_tab: false,
        clear_cache_after_closing: false
    };

    const result = await adspowerRequest('/browser-profile/start', 'POST', data);

    if (result && result.ws && result.ws.puppeteer) {
        // Extract CDP port and reconstruct WebSocket URL for remote connection
        const wsUrl = result.ws.puppeteer;
        const portMatch = wsUrl.match(/:(\d+)\//);
        const guidMatch = wsUrl.match(/\/browser\/([0-9a-f\-]+)/);

        if (portMatch && guidMatch) {
            const port = portMatch[1];
            const guid = guidMatch[1];

            // Reconstruct URL for remote AdsPower server
            const cdpUrl = `ws://${CONFIG.adspower.serverIP}:8080/port/${port}/devtools/browser/${guid}`;

            console.log(`✅ Profile started`);
            console.log(`📡 CDP URL: ${cdpUrl}`);

            return {
                success: true,
                profile_id: profileId,
                cdp_url: cdpUrl,
                puppeteer_port: port,
                browser_pid: result.browser_pid
            };
        }
    }

    throw new Error('Failed to extract CDP connection details');
}

/**
 * Stop AdsPower browser profile
 */
async function stopProfile(profileId) {
    console.log(`\n🛑 Stopping profile ${profileId}...`);

    try {
        const data = { profile_id: profileId };
        await adspowerRequest('/browser-profile/close', 'POST', data);
        console.log(`✅ Profile stopped`);
    } catch (error) {
        console.warn(`⚠️  Warning: ${error.message}`);
    }
}

/**
 * Random delay helper
 */
function randomDelay(min, max) {
    const delay = Math.floor(Math.random() * (max - min + 1)) + min;
    return new Promise(resolve => setTimeout(resolve, delay));
}

/**
 * Human-like typing
 */
async function humanType(page, selector, text, options = {}) {
    await page.waitForSelector(selector, { timeout: 10000 });
    await page.click(selector);
    await randomDelay(100, 300);

    for (const char of text) {
        await page.keyboard.type(char);
        await randomDelay(50, 150);
    }
}

/**
 * Take screenshot if enabled
 */
async function takeScreenshot(page, name, profileId) {
    if (!CONFIG.warmup.screenshots) return;

    try {
        const screenshotDir = path.join(__dirname, 'screenshots');
        await fs.mkdir(screenshotDir, { recursive: true });

        const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
        const filename = path.join(screenshotDir, `${profileId}_${name}_${timestamp}.png`);

        await page.screenshot({ path: filename, fullPage: false });
        console.log(`📸 Screenshot saved: ${filename}`);
    } catch (error) {
        console.warn(`⚠️  Screenshot failed: ${error.message}`);
    }
}

/**
 * Gmail warmup activity
 */
async function warmupGmail(page) {
    console.log('\n📧 Gmail warmup...');

    try {
        await page.goto('https://mail.google.com/mail/u/0/#inbox', { waitUntil: 'networkidle2', timeout: 30000 });
        await randomDelay(3000, 5000);
        await takeScreenshot(page, 'gmail_inbox', 'k12am9a2');

        // Scroll through inbox
        for (let i = 0; i < 3; i++) {
            await page.evaluate(() => window.scrollBy(0, 300));
            await randomDelay(1000, 2000);
        }

        await randomDelay(5000, 10000);
        console.log('✅ Gmail warmup complete');
        return true;
    } catch (error) {
        console.error(`❌ Gmail warmup failed: ${error.message}`);
        return false;
    }
}

/**
 * Search warmup activity
 */
async function warmupSearch(page) {
    console.log('\n🔍 Search warmup...');

    try {
        await page.goto('https://www.google.com', { waitUntil: 'networkidle2', timeout: 30000 });
        await randomDelay(2000, 3000);

        // Perform a search
        const searchQueries = [
            'email marketing best practices',
            'Gmail deliverability tips',
            'email warmup strategies'
        ];
        const query = searchQueries[Math.floor(Math.random() * searchQueries.length)];

        await humanType(page, 'textarea[name="q"]', query);
        await randomDelay(500, 1000);
        await page.keyboard.press('Enter');

        await page.waitForNavigation({ waitUntil: 'networkidle2', timeout: 30000 });
        await randomDelay(3000, 5000);
        await takeScreenshot(page, 'search_results', 'k12am9a2');

        // Click a result
        const results = await page.$$('a h3');
        if (results.length > 0) {
            await results[0].click();
            await randomDelay(5000, 10000);
        }

        console.log('✅ Search warmup complete');
        return true;
    } catch (error) {
        console.error(`❌ Search warmup failed: ${error.message}`);
        return false;
    }
}

/**
 * News warmup activity
 */
async function warmupNews(page) {
    console.log('\n📰 News warmup...');

    try {
        await page.goto('https://news.google.com', { waitUntil: 'networkidle2', timeout: 30000 });
        await randomDelay(3000, 5000);
        await takeScreenshot(page, 'news', 'k12am9a2');

        // Scroll through articles
        for (let i = 0; i < 5; i++) {
            await page.evaluate(() => window.scrollBy(0, 400));
            await randomDelay(1000, 2000);
        }

        await randomDelay(5000, 10000);
        console.log('✅ News warmup complete');
        return true;
    } catch (error) {
        console.error(`❌ News warmup failed: ${error.message}`);
        return false;
    }
}

/**
 * Execute warmup for a single profile
 */
async function executeWarmup(profileId, activities = CONFIG.warmup.activities) {
    const startTime = Date.now();
    let browser = null;
    let successCount = 0;
    const results = [];

    try {
        console.log(`\n${'='.repeat(60)}`);
        console.log(`🔥 Gmail Warmup for Profile: ${profileId}`);
        console.log(`📅 Started: ${new Date().toISOString()}`);
        console.log(`🎯 Activities: ${activities.join(', ')}`);
        console.log(`${'='.repeat(60)}\n`);

        // Start AdsPower profile
        const startResult = await startProfile(profileId);

        // Connect to browser via Puppeteer
        console.log('\n🔌 Connecting to browser...');
        browser = await puppeteer.connect({
            browserWSEndpoint: startResult.cdp_url,
            defaultViewport: null,
            headers: {
                'X-Api-Key': CONFIG.adspower.apiKey,
                'Host': 'localhost'
            }
        });

        // Get or create page and close existing tabs
        const pages = await browser.pages();
        for (const page of pages) {
            try {
                await page.close();
            } catch (e) {
                // Page might already be closed
            }
        }

        const page = await browser.newPage();

        // Set user agent
        await page.setUserAgent('Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36');

        // Anti-detection
        await page.evaluateOnNewDocument(() => {
            Object.defineProperty(navigator, 'webdriver', { get: () => false });
            Object.defineProperty(navigator, 'plugins', { get: () => [1, 2, 3, 4, 5] });
            Object.defineProperty(navigator, 'languages', { get: () => ['en-US', 'en'] });
            window.chrome = { runtime: {} };
        });

        console.log('✅ Browser connected\n');

        // Execute activities
        for (const activity of activities) {
            try {
                let result = false;

                switch (activity) {
                    case 'gmail':
                        result = await warmupGmail(page);
                        break;
                    case 'search':
                        result = await warmupSearch(page);
                        break;
                    case 'news':
                        result = await warmupNews(page);
                        break;
                    default:
                        console.warn(`⚠️  Unknown activity: ${activity}`);
                }

                results.push({ activity, success: result });
                if (result) successCount++;

                // Random delay between activities
                await randomDelay(5000, 10000);
            } catch (error) {
                console.error(`❌ Activity ${activity} error: ${error.message}`);
                results.push({ activity, success: false, error: error.message });
            }
        }

        const duration = Math.round((Date.now() - startTime) / 1000);

        console.log(`\n${'='.repeat(60)}`);
        console.log(`✅ Warmup Complete for Profile: ${profileId}`);
        console.log(`⏱️  Duration: ${duration}s`);
        console.log(`📊 Success: ${successCount}/${activities.length} activities`);
        console.log(`${'='.repeat(60)}\n`);

    } catch (error) {
        console.error(`\n❌ Fatal error: ${error.message}`);
        console.error(error.stack);
    } finally {
        // Cleanup
        if (browser) {
            try {
                await browser.close();
                console.log('✅ Browser disconnected');
            } catch (e) {
                console.warn('⚠️  Browser disconnect warning:', e.message);
            }
        }

        // Stop AdsPower profile
        await stopProfile(profileId);
    }

    return { profileId, successCount, totalActivities: activities.length, results };
}

/**
 * Main execution
 */
async function main() {
    const args = process.argv.slice(2);
    const profileId = args[0];

    if (!profileId) {
        console.error('Usage: node warmup-single.js <profile-id> [--activities gmail,search,news]');
        process.exit(1);
    }

    // Parse activities if provided
    const activitiesIndex = args.indexOf('--activities');
    let activities = CONFIG.warmup.activities;

    if (activitiesIndex !== -1 && args[activitiesIndex + 1]) {
        activities = args[activitiesIndex + 1].split(',');
    }

    try {
        const result = await executeWarmup(profileId, activities);
        process.exit(result.successCount > 0 ? 0 : 1);
    } catch (error) {
        console.error('Fatal error:', error);
        process.exit(1);
    }
}

// Run if called directly
if (require.main === module) {
    main();
}

module.exports = { executeWarmup, startProfile, stopProfile };
