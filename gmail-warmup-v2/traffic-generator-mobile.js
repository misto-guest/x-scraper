#!/usr/bin/env node

/**
 * Traffic Generator - Mobile + Desktop
 * Sends visits with specified referrer and user agents
 * Focus on mobile devices (70% mobile, 30% desktop)
 */

const https = require('https');

// Configuration
const TARGET_URL = 'https://hypeddit.com/link/ucek7o';
const TOTAL_VISITS = 50;
const MIN_DELAY = 1000;  // 1 second in ms
const MAX_DELAY = 19000; // 19 seconds in ms
const MOBILE_RATIO = 0.7; // 70% mobile, 30% desktop

// User agents (latest versions as of 2024)

// Desktop
const FIREFOX_DESKTOP = 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10.15; rv:122.0) Gecko/20100101 Firefox/122.0';
const SAFARI_DESKTOP = 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.2 Safari/605.1.15';
const CHROME_DESKTOP = 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36';

// Mobile
const IPHONE_SAFARI = 'Mozilla/5.0 (iPhone; CPU iPhone OS 17_2 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.2 Mobile/15E148 Safari/604.1';
const ANDROID_CHROME = 'Mozilla/5.0 (Linux; Android 14; Pixel 8) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Mobile Safari/537.36';
const IPAD_SAFARI = 'Mozilla/5.0 (iPad; CPU OS 17_2 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.2 Mobile/15E148 Safari/604.1';
const SAMSUNG_BROWSER = 'Mozilla/5.0 (Linux; Android 14; SAMSUNG-SM-S918B) AppleWebKit/537.36 (KHTML, like Gecko) SamsungBrowser/24.0 Chrome/120.0.0.0 Mobile Safari/537.36';

const REFERRER = 'https://www.facebook.com/';

// User agent pools
const DESKTOP_UAS = [FIREFOX_DESKTOP, SAFARI_DESKTOP, CHROME_DESKTOP];
const MOBILE_UAS = [IPHONE_SAFARI, ANDROID_CHROME, IPAD_SAFARI, SAMSUNG_BROWSER];

/**
 * Get device info from user agent
 */
function getDeviceInfo(userAgent) {
    if (userAgent.includes('iPhone')) return { type: 'Mobile', device: 'iPhone' };
    if (userAgent.includes('iPad')) return { type: 'Tablet', device: 'iPad' };
    if (userAgent.includes('Android')) {
        if (userAgent.includes('Samsung')) return { type: 'Mobile', device: 'Samsung' };
        return { type: 'Mobile', device: 'Android' };
    }
    if (userAgent.includes('Firefox')) return { type: 'Desktop', device: 'Firefox' };
    if (userAgent.includes('Safari')) return { type: 'Desktop', device: 'Safari' };
    if (userAgent.includes('Chrome')) return { type: 'Desktop', device: 'Chrome' };
    return { type: 'Desktop', device: 'Unknown' };
}

/**
 * Random delay between min and max
 */
function randomDelay(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
}

/**
 * Select user agent based on mobile ratio
 */
function selectUserAgent(visitNumber) {
    const isMobile = Math.random() < MOBILE_RATIO;

    if (isMobile) {
        const ua = MOBILE_UAS[Math.floor(Math.random() * MOBILE_UAS.length)];
        return ua;
    } else {
        const ua = DESKTOP_UAS[Math.floor(Math.random() * DESKTOP_UAS.length)];
        return ua;
    }
}

/**
 * Send a visit to the target URL
 */
function sendVisit(userAgent, visitNumber, delayBefore = 0) {
    return new Promise((resolve, reject) => {
        const url = new URL(TARGET_URL);
        const deviceInfo = getDeviceInfo(userAgent);

        const options = {
            hostname: url.hostname,
            port: 443,
            path: url.pathname + url.search,
            method: 'GET',
            headers: {
                'User-Agent': userAgent,
                'Referer': REFERRER,
                'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,*/*;q=0.8',
                'Accept-Language': 'en-US,en;q=0.5',
                'Accept-Encoding': 'gzip, deflate, br',
                'Connection': 'keep-alive',
                'Upgrade-Insecure-Requests': '1',
                'Sec-Fetch-Dest': 'document',
                'Sec-Fetch-Mode': 'navigate',
                'Sec-Fetch-Site': 'cross-site',
                'Cache-Control': 'max-age=0'
            }
        };

        const req = https.request(options, (res) => {
            let data = '';

            res.on('data', (chunk) => {
                data += chunk;
            });

            res.on('end', () => {
                const delayInfo = delayBefore > 0 ? ` | After: ${delayBefore/1000}s` : '';
                console.log(`✅ Visit ${visitNumber}/${TOTAL_VISITS} | ${deviceInfo.type.padEnd(7)} | ${deviceInfo.device.padEnd(9)} | Status: ${res.statusCode}${delayInfo}`);
                resolve();
            });
        });

        req.on('error', (error) => {
            console.error(`❌ Visit ${visitNumber} failed: ${error.message}`);
            reject(error);
        });

        req.setTimeout(30000, () => {
            req.destroy();
            reject(new Error('Request timeout'));
        });

        req.end();
    });
}

/**
 * Sleep for specified milliseconds
 */
function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

/**
 * Main execution
 */
async function main() {
    console.log('🚀 Traffic Generator Started (Mobile + Desktop)');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log(`Target URL: ${TARGET_URL}`);
    console.log(`Total visits: ${TOTAL_VISITS}`);
    console.log(`Referrer: ${REFERRER}`);
    console.log(`Device mix: ${Math.round(MOBILE_RATIO * 100)}% Mobile, ${Math.round((1 - MOBILE_RATIO) * 100)}% Desktop`);
    console.log(`Mobile devices: iPhone, Android (Samsung), iPad`);
    console.log(`Desktop browsers: Firefox, Safari, Chrome`);
    console.log(`Delay range: ${MIN_DELAY/1000}-${MAX_DELAY/1000} seconds`);
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

    let lastDelay = 0;
    let mobileCount = 0;
    let desktopCount = 0;
    const startTime = Date.now();

    for (let i = 1; i <= TOTAL_VISITS; i++) {
        const userAgent = selectUserAgent(i);
        const isMobile = getDeviceInfo(userAgent).type !== 'Desktop';

        if (isMobile) mobileCount++;
        else desktopCount++;

        try {
            await sendVisit(userAgent, i, lastDelay);

            // Add random delay before next visit (except after last visit)
            if (i < TOTAL_VISITS) {
                lastDelay = randomDelay(MIN_DELAY, MAX_DELAY);
                const delaySeconds = (lastDelay / 1000).toFixed(1);
                console.log(`⏳ Waiting ${delaySeconds}s before next visit...\n`);
                await sleep(lastDelay);
            }

        } catch (error) {
            console.error(`Error on visit ${i}: ${error.message}`);
            // Continue with next visit even if this one failed
        }
    }

    const duration = ((Date.now() - startTime) / 1000 / 60).toFixed(2);
    const mobilePercent = ((mobileCount / TOTAL_VISITS) * 100).toFixed(1);
    const desktopPercent = ((desktopCount / TOTAL_VISITS) * 100).toFixed(1);

    console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('✅ All visits completed!');
    console.log('📊 Statistics:');
    console.log(`   Mobile visits: ${mobileCount} (${mobilePercent}%)`);
    console.log(`   Desktop visits: ${desktopCount} (${desktopPercent}%)`);
    console.log(`   Total time: ${duration} minutes`);
    console.log(`   Average per visit: ${(duration * 60 / TOTAL_VISITS).toFixed(1)}s`);
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
}

// Run if called directly
if (require.main === module) {
    main().catch(console.error);
}

module.exports = { sendVisit };
