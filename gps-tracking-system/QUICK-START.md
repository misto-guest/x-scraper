# 🚀 Quick Start Guide

## GPS Tracking System

### Start the System

```bash
# 1. Go to project directory
cd /Users/northsea/clawd-dmitry/gps-tracking-system

# 2. Start the server
npm start
```

### Access the Dashboard

Open your browser to:
- **Dashboard:** http://localhost:3003/index.html
- **Routes:** http://localhost:3003/routes.html
- **Map:** http://localhost:3003/map.html

---

## What You Get

### 📊 Dashboard
- View all 4 businesses
- See ratings and contact info
- Track upcoming visits
- Mini map overview

### 🗺️ Route Planner
- Generate optimized routes
- Export to GPX (GPS devices)
- Export to KML (Google Earth)
- Turn-by-turn directions

### 📍 Interactive Map
- Full-screen map
- Click for business details
- Get directions
- View GMB profiles

---

## Current Businesses

1. **Private Detective Agency** - Amsterdam
   - ⭐ 4.8 (127 reviews)
   - GMB: https://share.google/OXTqPbi0tHOWnHCJ4

2. **Royal Sleepdienst** - Rotterdam
   - ⭐ 4.5 (89 reviews)
   - GMB: https://share.google/PZ32aiKBFHkbEdiFa

3. **Test Business 1** - Amsterdam HQ
   - ⭐ 4.2 (45 reviews)

4. **Test Business 2** - Rotterdam Branch
   - ⭐ 4.6 (73 reviews)

---

## Automation Setup

Install cron jobs for automatic updates:

```bash
# Edit crontab
crontab -e

# Add these lines:
0 9 * * * /Users/northsea/clawd-dmitry/gps-tracking-system/scripts/daily-scan.sh
0 */6 * * * /Users/northsea/clawd-dmitry/gps-tracking-system/scripts/update-data.sh
0 8 * * 1 /Users/northsea/clawd-dmitry/gps-tracking-system/scripts/weekly-report.sh
```

---

## API Testing

```bash
# Get all businesses
curl http://localhost:3003/api/businesses

# Generate optimized route
curl http://localhost:3003/api/routes

# Get dashboard stats
curl http://localhost:3003/api/dashboard

# Add new business
curl -X POST http://localhost:3003/api/businesses \
  -H "Content-Type: application/json" \
  -d '{
    "name": "New Business",
    "address": "New Address 1, Amsterdam",
    "lat": 52.37,
    "lng": 4.89
  }'
```

---

## Project Structure

```
gps-tracking-system/
├── server.js              # Express server (port 3003)
├── package.json           # Dependencies
├── data/
│   └── gps-tracking.db    # SQLite database
├── public/
│   ├── index.html        # Dashboard
│   ├── routes.html       # Route planner
│   └── map.html          # Interactive map
├── scripts/
│   ├── init-db.js        # Database initialization
│   ├── fetch-gmb-data.js # GMB scraper
│   ├── daily-scan.sh     # Daily cron
│   ├── update-data.sh    # Update cron
│   └── weekly-report.sh  # Weekly report
└── logs/                 # Log files (auto-created)
```

---

## Need Help?

- Full documentation: `README.md`
- Testing report: `TESTING-REPORT.md`
- Logs: `logs/` directory
- Reports: `reports/` directory

---

**Status:** ✅ Fully Operational
**Port:** 3003
**Database:** 4 businesses loaded
**Routes:** OSRM integration working
