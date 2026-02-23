#!/usr/bin/env node

/**
 * Traffic Generator
 * Sends visits with specified referrer and user agents
 */

const https = require('https');

// Configuration
const TARGET_URL = 'https://hypeddit.com/link/ucek7o';
const TOTAL_VISITS = 39;
const MIN_DELAY = 1000;  // 1 second in ms
const MAX_DELAY = 19000; // 19 seconds in ms

// User agents (latest versions as of 2024)
const FIREFOX_UA = 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10.15; rv:122.0) Gecko/20100101 Firefox/122.0';
const SAFARI_UA = 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.2 Safari/605.1.15';

const REFERRER = 'https://www.facebook.com/';

/**
 * Random delay between min and max
 */
function randomDelay(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
}

/**
 * Send a visit to the target URL
 */
function sendVisit(userAgent, visitNumber, delayBefore = 0) {
    return new Promise((resolve, reject) => {
        const url = new URL(TARGET_URL);

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
                const browserType = userAgent.includes('Firefox') ? 'Firefox' : 'Safari';
                const delayInfo = delayBefore > 0 ? ` | After: ${delayBefore/1000}s` : '';
                console.log(`✅ Visit ${visitNumber}/${TOTAL_VISITS} | ${browserType} | Status: ${res.statusCode}${delayInfo}`);
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
    console.log('🚀 Traffic Generator Started');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log(`Target URL: ${TARGET_URL}`);
    console.log(`Total visits: ${TOTAL_VISITS}`);
    console.log(`Referrer: ${REFERRER}`);
    console.log(`User Agents: Firefox & Safari (latest)`);
    console.log(`Delay range: ${MIN_DELAY/1000}-${MAX_DELAY/1000} seconds`);
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

    let lastDelay = 0;
    const startTime = Date.now();

    for (let i = 1; i <= TOTAL_VISITS; i++) {
        // Alternate between Firefox and Safari
        const userAgent = i % 2 === 0 ? SAFARI_UA : FIREFOX_UA;

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

    console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('✅ All visits completed!');
    console.log(`Total time: ${duration} minutes`);
    console.log(`Average per visit: ${(duration * 60 / TOTAL_VISITS).toFixed(1)}s`);
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
}

// Run if called directly
if (require.main === module) {
    main().catch(console.error);
}

module.exports = { sendVisit };
