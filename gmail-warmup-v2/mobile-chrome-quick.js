#!/usr/bin/env node

/**
 * Quick Mobile Chrome Traffic Generator
 * 10 visits with Android Chrome user agent
 */

const https = require('https');

// Configuration
const TARGET_URL = 'https://hypeddit.com/link/ucek7o';
const TOTAL_VISITS = 10;
const MIN_DELAY = 1000;  // 1 second
const MAX_DELAY = 10000; // 10 seconds

// Android Chrome User Agent
const ANDROID_CHROME = 'Mozilla/5.0 (Linux; Android 14; Pixel 8) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Mobile Safari/537.36';
const REFERRER = 'https://www.facebook.com/';

/**
 * Random delay
 */
function randomDelay(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
}

/**
 * Send visit
 */
function sendVisit(visitNumber) {
    return new Promise((resolve, reject) => {
        const url = new URL(TARGET_URL);

        const options = {
            hostname: url.hostname,
            port: 443,
            path: url.pathname + url.search,
            method: 'GET',
            headers: {
                'User-Agent': ANDROID_CHROME,
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
            res.on('data', (chunk) => { data += chunk; });
            res.on('end', () => {
                console.log(`✅ Visit ${visitNumber}/${TOTAL_VISITS} | Mobile Chrome | Status: ${res.statusCode}`);
                resolve();
            });
        });

        req.on('error', reject);
        req.setTimeout(30000, () => {
            req.destroy();
            reject(new Error('Timeout'));
        });
        req.end();
    });
}

/**
 * Sleep
 */
function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

/**
 * Main
 */
async function main() {
    console.log('📱 Mobile Chrome Traffic Generator');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log(`Visits: ${TOTAL_VISITS}`);
    console.log(`User Agent: Android Chrome`);
    console.log(`Referrer: Facebook\n`);

    for (let i = 1; i <= TOTAL_VISITS; i++) {
        await sendVisit(i);
        if (i < TOTAL_VISITS) {
            const delay = randomDelay(MIN_DELAY, MAX_DELAY);
            console.log(`⏳ Waiting ${delay/1000}s...\n`);
            await sleep(delay);
        }
    }

    console.log('\n✅ All 10 mobile Chrome visits completed!');
}

main().catch(console.error);
