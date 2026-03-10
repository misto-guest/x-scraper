#!/usr/bin/env node

import fetch from 'node-fetch';

const SCRAPER_URL = process.env.SCRAPER_URL || 'https://x-scraper-ts-production.up.railway.app';
const USERNAME = process.env.SCRAPER_USERNAME || 'publisherinabox';
const COUNT = parseInt(process.env.SCRAPE_COUNT || '50', 10);
const WEBHOOK_URL = process.env.WEBHOOK_URL || '';

async function sendNotification(message, isSuccess = true) {
  if (!WEBHOOK_URL) return;

  try {
    const emoji = isSuccess ? '✅' : '⚠️';
    await fetch(WEBHOOK_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        text: `${emoji} X Scraper Cron\n\n${message}`,
      }),
    });
  } catch (error) {
    console.error(`Failed to send notification: ${error.message}`);
  }
}

async function runScraper() {
  const timestamp = new Date().toISOString();
  console.log(`[${timestamp}] Starting X Scraper cron job...`);
  console.log(`[${timestamp}] Target: ${SCRAPER_URL}/api/scrape/profile/${USERNAME}`);
  console.log(`[${timestamp}] Count: ${COUNT} tweets`);

  try {
    const response = await fetch(`${SCRAPER_URL}/api/scrape/profile/${USERNAME}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ count: COUNT }),
    });

    const data = await response.json();
    const status = response.status;

    console.log(`[${timestamp}] Response status: ${status}`);
    console.log(`[${timestamp}] Response data:`, JSON.stringify(data, null, 2));

    if (response.ok && data.success) {
      const message = `✅ Scraping completed successfully!\n` +
        `Time: ${timestamp}\n` +
        `Username: @${USERNAME}\n` +
        `Status: Success`;
      console.log(`[${timestamp}] ${message}`);
      await sendNotification(message, true);
    } else {
      // API returned an error, but this is not a system failure
      // Log it as a warning and exit successfully
      const message = `⚠️ Scraping returned non-success response\n` +
        `Time: ${timestamp}\n` +
        `Username: @${USERNAME}\n` +
        `Status: ${status}\n` +
        `Error: ${data.error || 'Unknown error'}`;
      console.log(`[${timestamp}] ${message}`);
      await sendNotification(message, false);
    }

    // Always exit successfully - cron job completed
    // Only actual system failures (network, etc) should exit with 1
    process.exit(0);

  } catch (error) {
    // This is a system failure (network, DNS, etc)
    const message = `❌ System failure during scraping\n` +
      `Time: ${timestamp}\n` +
      `Username: @${USERNAME}\n` +
      `Error: ${error.message}`;
    console.error(`[${timestamp}] ${message}`);
    console.error(`[${timestamp}] Stack: ${error.stack}`);
    await sendNotification(message, false);

    // Exit with error for actual system failures only
    // This will trigger Railway to retry
    process.exit(1);
  }
}

runScraper();
