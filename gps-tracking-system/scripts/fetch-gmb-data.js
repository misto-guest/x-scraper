/**
 * Fetch Google My Business listing data
 * Extracts business details from GMB sharing links
 */

const Database = require('better-sqlite3');
const path = require('path');
const https = require('https');

// GMB URLs to scrape
const GMB_URLS = [
  'https://share.google/OXTqPbi0tHOWnHCJ4',  // Private detective
  'https://share.google/PZ32aiKBFHkbEdiFa'   // Royal sleepdienst
];

/**
 * Simple HTML fetcher using HTTPS module
 */
function fetchPage(url) {
  return new Promise((resolve, reject) => {
    https.get(url, (res) => {
      let data = '';

      res.on('data', (chunk) => {
        data += chunk;
      });

      res.on('end', () => {
        resolve(data);
      });
    }).on('error', (err) => {
      reject(err);
    });
  });
}

/**
 * Extract business data from GMB page HTML
 * This is a simplified scraper - GMB pages may vary
 */
function extractGMBData(html, url) {
  const data = {
    gmb_url: url,
    name: '',
    address: '',
    phone: '',
    website: '',
    rating: null,
    reviews_count: 0
  };

  // Try to extract business name (common patterns)
  const namePatterns = [
    /<meta itemprop="name" content="([^"]+)"/i,
    /<title>([^<]+) - Google Business Profile/i,
    /"name"\s*:\s*"([^"]+)"/i
  ];

  for (const pattern of namePatterns) {
    const match = html.match(pattern);
    if (match && match[1]) {
      data.name = match[1].trim();
      break;
    }
  }

  // Extract address
  const addressPatterns = [
    /<meta itemprop="address" content="([^"]+)"/i,
    /"address"\s*:\s*"([^"]+)"/i,
    /<span class="LrzXr"[^>]*>([^<]+)<\/span>/i
  ];

  for (const pattern of addressPatterns) {
    const match = html.match(pattern);
    if (match && match[1]) {
      data.address = match[1].replace(/\\u0026/g, '&').trim();
      break;
    }
  }

  // Extract phone
  const phonePatterns = [
    /<meta itemprop="telephone" content="([^"]+)"/i,
    /"telephone"\s*:\s*"([^"]+)"/i,
    /aria-label="Phone: ([^"]+)"/i
  ];

  for (const pattern of phonePatterns) {
    const match = html.match(pattern);
    if (match && match[1]) {
      data.phone = match[1].trim();
      break;
    }
  }

  // Extract rating
  const ratingMatch = html.match(/"ratingValue"\s*:\s*([0-9.]+)/i);
  if (ratingMatch) {
    data.rating = parseFloat(ratingMatch[1]);
  }

  // Extract review count
  const reviewMatch = html.match(/"reviewCount"\s*:\s*(\d+)/i);
  if (reviewMatch) {
    data.reviews_count = parseInt(reviewMatch[1]);
  }

  // Extract website
  const websiteMatch = html.match(/<meta itemprop="url" content="([^"]+)"/i);
  if (websiteMatch) {
    data.website = websiteMatch[1];
  }

  return data;
}

/**
 * Geocode address using Nominatim (OpenStreetMap)
 * Returns lat/lng coordinates
 */
async function geocodeAddress(address) {
  const encoded = encodeURIComponent(address);
  const url = `https://nominatim.openstreetmap.org/search?format=json&q=${encoded}`;

  return new Promise((resolve, reject) => {
    https.get(url, {
      headers: {
        'User-Agent': 'GPS-Tracking-System/1.0'
      }
    }, (res) => {
      let data = '';

      res.on('data', (chunk) => {
        data += chunk;
      });

      res.on('end', () => {
        try {
          const results = JSON.parse(data);
          if (results && results.length > 0) {
            resolve({
              lat: parseFloat(results[0].lat),
              lng: parseFloat(results[0].lon)
            });
          } else {
            resolve({ lat: null, lng: null });
          }
        } catch (err) {
          reject(err);
        }
      });
    }).on('error', (err) => {
      reject(err);
    });
  });
}

/**
 * Main function to fetch all GMB data
 */
async function fetchAllGMBData() {
  console.log('🔍 Fetching Google My Business data...\n');

  const results = [];

  for (const url of GMB_URLS) {
    try {
      console.log(`Fetching: ${url}`);

      // Fetch GMB page
      const html = await fetchPage(url);

      // Extract business data
      const businessData = extractGMBData(html, url);

      // Geocode address
      if (businessData.address) {
        console.log(`  Geocoding: ${businessData.address}`);
        const coords = await geocodeAddress(businessData.address);
        businessData.lat = coords.lat;
        businessData.lng = coords.lng;
      }

      results.push(businessData);

      console.log(`  ✓ Found: ${businessData.name || 'Unknown'}`);
      console.log(`  📍 ${businessData.address || 'No address'}`);
      console.log(`  ⭐ Rating: ${businessData.rating || 'N/A'} (${businessData.reviews_count} reviews)\n`);

    } catch (error) {
      console.error(`  ✗ Error fetching ${url}:`, error.message);
    }
  }

  return results;
}

/**
 * Save to database
 */
function saveToDatabase(businesses) {
  const dbPath = path.join(__dirname, '..', 'data', 'gps-tracking.db');
  const db = new Database(dbPath);

  const stmt = db.prepare(`
    INSERT INTO businesses (name, address, lat, lng, contact_info, notes)
    VALUES (?, ?, ?, ?, ?, ?)
  `);

  businesses.forEach(business => {
    try {
      const contactInfo = [business.phone, business.website]
        .filter(Boolean)
        .join(' | ');

      const notes = [
        `GMB Rating: ${business.rating || 'N/A'}`,
        `Reviews: ${business.reviews_count}`,
        `Source: ${business.gmb_url}`
      ].join('\n');

      stmt.run(
        business.name || 'Unknown Business',
        business.address || 'Address not available',
        business.lat,
        business.lng,
        contactInfo,
        notes
      );

      console.log(`✅ Saved to database: ${business.name}`);
    } catch (error) {
      console.error(`✗ Error saving ${business.name}:`, error.message);
    }
  });

  db.close();
}

// Run if called directly
if (require.main === module) {
  fetchAllGMBData()
    .then(businesses => {
      console.log('\n📊 Fetch complete!');
      console.log(`Successfully processed ${businesses.length} businesses\n`);

      // Save to database
      saveToDatabase(businesses);
    })
    .catch(error => {
      console.error('Fatal error:', error);
      process.exit(1);
    });
}

module.exports = { fetchAllGMBData, extractGMBData, geocodeAddress };
