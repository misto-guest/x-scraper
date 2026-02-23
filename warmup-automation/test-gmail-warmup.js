/**
 * Quick Gmail Warmup Test
 * 
 * Tests a single Gmail account with human-like behavior:
 * - Opens Gmail
 * - Navigates through inbox
 * - Opens a few emails
 * - Simulates reading time
 * - Checks Google Drive
 */

const AdsPowerV2Client = require('../gmail-warmup-v2/lib/adspower-v2-client');
const puppeteer = require('puppeteer');

const API_KEY = '746feb8ab409fbb27a0377a864279e6c000f879a7a0e5329';
const ADSPOWER_URL = 'http://77.42.21.134:50325';
const PROFILE_ID = 'k12am9a2';

function randomInt(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
}

function randomDelay(min, max) {
    return new Promise(resolve => setTimeout(resolve, randomInt(min, max)));
}

async function humanLikeScroll(page) {
    const scrollAmount = randomInt(100, 400);
    await page.evaluate((amount) => {
        window.scrollBy({
            top: amount,
            behavior: 'smooth'
        });
    }, scrollAmount);
    await randomDelay(500, 1500);
}

async function testGmailWarmup() {
    console.log('🔥 Gmail Warmup Test\n');
    console.log('='.repeat(50));

    const client = new AdsPowerV2Client({
        apiKey: API_KEY,
        baseUrl: ADSPOWER_URL
    });

    try {
        // Launch profile
        console.log('\n1️⃣ Launching AdsPower Profile...');
        const launchResult = await client.startProfile(PROFILE_ID);

        if (!launchResult.success || !launchResult.ws_url) {
            throw new Error('Failed to launch profile');
        }

        console.log('✅ Profile launched');
        console.log(`   CDP Port: ${launchResult.puppeteer_port}`);
        await randomDelay(3000, 5000);

        // Connect Puppeteer
        console.log('\n2️⃣ Connecting to browser...');
        const browser = await puppeteer.connect({
            browserWSEndpoint: launchResult.ws_url,
            defaultViewport: null
        });

        const pages = await browser.pages();
        const page = pages[0] || await browser.newPage();

        console.log('✅ Connected');

        // Activity 1: Open Gmail
        console.log('\n3️⃣ Opening Gmail...');
        await page.goto('https://mail.google.com', { waitUntil: 'networkidle2', timeout: 30000 });
        await randomDelay(3000, 5000);
        
        const currentUrl = page.url();
        console.log(`✅ Gmail loaded: ${currentUrl}`);

        // Check if logged in
        if (currentUrl.includes('mail.google.com')) {
            console.log('✅ Logged in to Gmail');
        } else {
            throw new Error('Not logged in to Gmail');
        }

        // Activity 2: Browse inbox
        console.log('\n4️⃣ Browsing inbox...');
        await humanLikeScroll(page);
        await humanLikeScroll(page);
        await randomDelay(2000, 4000);
        console.log('✅ Scrolled through inbox');

        // Activity 3: Click first email (if available)
        try {
            console.log('\n5️⃣ Opening an email...');
            const emailSelector = 'div[data-thread-perm-id]';
            await page.waitForSelector(emailSelector, { timeout: 5000 });
            await randomDelay(1000, 2000);
            
            const emails = await page.$$(emailSelector);
            if (emails.length > 0) {
                await emails[0].click();
                await randomDelay(3000, 6000);
                console.log('✅ Email opened');
                
                // Simulate reading
                await humanLikeScroll(page);
                await randomDelay(2000, 5000);
            }
        } catch (e) {
            console.log('⚠️  No emails to open (inbox may be empty)');
        }

        // Activity 4: Go back to inbox
        console.log('\n6️⃣ Returning to inbox...');
        await page.goto('https://mail.google.com/mail/u/0/#inbox', { waitUntil: 'networkidle2' });
        await randomDelay(2000, 3000);
        console.log('✅ Back to inbox');

        // Activity 5: Check Google Drive
        console.log('\n7️⃣ Checking Google Drive...');
        await page.goto('https://drive.google.com', { waitUntil: 'networkidle2', timeout: 30000 });
        await randomDelay(3000, 5000);
        console.log('✅ Drive loaded');
        
        await humanLikeScroll(page);
        await randomDelay(2000, 4000);

        // Summary
        console.log('\n' + '='.repeat(50));
        console.log('🎉 Gmail Warmup Test Complete!');
        console.log('\n✅ Completed Activities:');
        console.log('   1. Opened Gmail');
        console.log('   2. Browsed inbox');
        console.log('   3. Opened and read an email');
        console.log('   4. Navigated back to inbox');
        console.log('   5. Checked Google Drive');
        console.log('\n💡 Browser will stay open for manual inspection.');
        console.log('   Press Ctrl+C to close.\n');

        // Keep browser open
        await new Promise(() => {});

    } catch (error) {
        console.log('\n❌ Error:', error.message);
        console.log(error.stack);
    }
}

testGmailWarmup();
