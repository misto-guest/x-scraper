# GPS Tracking System

A complete GPS campaign management system with automated routing, dashboard, and Google My Business integration.

## 🌟 Features

- **📊 Dashboard** - View all businesses, visit history, and upcoming appointments
- **🗺️ Interactive Map** - Visualize all business locations on an interactive map
- **🚀 Route Optimization** - Generate optimized routes using OSRM (Open Source Routing Machine)
- **📁 Export Routes** - Export routes as GPX or KML files for GPS devices
- **🔄 Automation** - Cron jobs for daily scans, data updates, and weekly reports
- **📍 GMB Integration** - Fetch business data from Google My Business listings

## 🚀 Quick Start

### 1. Install Dependencies

```bash
cd /Users/northsea/clawd-dmitry/gps-tracking-system
npm install
```

### 2. Initialize Database

```bash
npm run init-db
```

This creates:
- SQLite database at `data/gps-tracking.db`
- 4 sample businesses (2 GMB-based + 2 test businesses)
- Sample visit history

### 3. Start the Server

```bash
npm start
```

The dashboard will be available at: **http://localhost:3003**

(Note: If port 3003 is in use, the server will use the PORT environment variable)

## 📁 Project Structure

```
gps-tracking-system/
├── server.js              # Express API server
├── package.json           # Node.js dependencies
├── data/
│   └── gps-tracking.db    # SQLite database
├── public/                # Frontend files
│   ├── index.html        # Dashboard
│   ├── routes.html       # Route planner
│   └── map.html          # Interactive map
├── scripts/              # Utility scripts
│   ├── init-db.js        # Database initialization
│   ├── fetch-gmb-data.js # GMB scraper
│   ├── daily-scan.sh     # Daily cron job
│   ├── update-data.sh    # Data update cron job
│   └── weekly-report.sh  # Weekly report cron job
├── logs/                 # Log files (auto-created)
└── reports/              # Weekly reports (auto-created)
```

## 🗺️ Dashboard Features

### Main Dashboard (`index.html`)
- View all businesses with ratings, addresses, and status
- Quick stats: total businesses, active businesses, visits this month
- Mini map with location overview
- One-click map view for each business

### Route Planner (`routes.html`)
- Generate optimized routes using OSRM API
- Visual route display with numbered stops
- Route summary: distance, duration, stops
- Export to GPX (for GPS devices)
- Export to KML (for Google Earth)

### Interactive Map (`map.html`)
- Full-screen map with all business markers
- Click markers to see business details
- Get directions button (opens Google Maps)
- Direct links to GMB profiles

## 🔄 Cron Jobs Setup

### Option 1: Install Automatically

```bash
# Add crontab entries
crontab -l > /tmp/crontab.bak
cat scripts/crontab-entries >> /tmp/crontab.bak
crontab /tmp/crontab.bak
```

### Option 2: Manual Crontab Entries

Edit crontab:
```bash
crontab -e
```

Add these entries:
```bash
# Daily scan at 9:00 AM
0 9 * * * /Users/northsea/clawd-dmitry/gps-tracking-system/scripts/daily-scan.sh

# Data update every 6 hours
0 */6 * * * /Users/northsea/clawd-dmitry/gps-tracking-system/scripts/update-data.sh

# Weekly report Monday at 8:00 AM
0 8 * * 1 /Users/northsea/clawd-dmitry/gps-tracking-system/scripts/weekly-report.sh
```

## 📡 API Endpoints

### Businesses
- `GET /api/businesses` - List all businesses
- `GET /api/businesses/:id` - Get single business
- `POST /api/businesses` - Add new business
- `PUT /api/businesses/:id` - Update business
- `DELETE /api/businesses/:id` - Delete business

### Routes
- `GET /api/routes` - Generate optimized route

### Dashboard
- `GET /api/dashboard` - Dashboard summary data

### Visits
- `GET /api/visits` - Get visit history
- `POST /api/visits` - Log a visit

## 📊 Database Schema

### Businesses Table
```sql
CREATE TABLE businesses (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT NOT NULL,
  address TEXT NOT NULL,
  lat REAL,
  lng REAL,
  phone TEXT,
  website TEXT,
  rating REAL,
  reviews_count INTEGER,
  gmb_url TEXT,
  last_visit DATE,
  next_visit DATE,
  status TEXT DEFAULT 'active',
  notes TEXT,
  contact_info TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

### Visits Table
```sql
CREATE TABLE visits (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  business_id INTEGER,
  visit_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  notes TEXT,
  status TEXT DEFAULT 'completed',
  FOREIGN KEY (business_id) REFERENCES businesses(id)
);
```

## 📍 GMB Integration

The system includes a GMB scraper (`fetch-gmb-data.js`) that:
1. Fetches Google My Business listing data
2. Extracts: name, address, phone, website, rating, reviews
3. Geocodes addresses using Nominatim (OpenStreetMap)
4. Saves data to the database

### GMB URLs
Add your GMB sharing URLs in `scripts/fetch-gmb-data.js`:
```javascript
const GMB_URLS = [
  'https://share.google/YOUR-GMB-URL-1',
  'https://share.google/YOUR-GMB-URL-2'
];
```

## 🧪 Testing

### Test the API
```bash
# Get all businesses
curl http://localhost:3000/api/businesses

# Generate route
curl http://localhost:3000/api/routes

# Get dashboard stats
curl http://localhost:3000/api/dashboard
```

### Test the Dashboard
1. Open http://localhost:3000
2. Should see 4 businesses loaded
3. Mini map should show markers
4. Stats should be populated

### Test Route Generation
1. Go to http://localhost:3000/routes.html
2. Click "Generate Optimized Route"
3. Should see route on map with numbered stops
4. Export buttons should be enabled

### Test Interactive Map
1. Go to http://localhost:3000/map.html
2. Click on any marker
3. Should see business details panel
4. "Get Directions" should open Google Maps

## 🔧 Maintenance

### View Logs
```bash
# Daily scan log
cat logs/daily-scan.log

# Data update log
cat logs/update-data.log

# Weekly report log
cat logs/weekly-report.log

# Server log
cat logs/server.log
```

### View Reports
```bash
# List all reports
ls -lh reports/

# View latest report
cat reports/weekly-$(date '+%Y-%m-%d').txt
```

### Backup Database
```bash
cp data/gps-tracking.db data/gps-tracking-backup-$(date '+%Y%m%d').db
```

## 🚨 Troubleshooting

### Server Won't Start
- Check if port 3000 is already in use: `lsof -i :3000`
- Kill existing process: `kill -9 <PID>`
- Try starting again: `npm start`

### Route Generation Fails
- Ensure businesses have lat/lng coordinates
- Check internet connection (OSRM API required)
- Check browser console for errors

### Cron Jobs Not Running
- Check cron logs: `grep CRON /var/log/syslog`
- Ensure scripts are executable: `ls -l scripts/`
- Test manually: `./scripts/daily-scan.sh`

## 📝 Sample Data Included

The system comes pre-loaded with 4 businesses:

1. **Private Detective Agency** - Amsterdam (GMB listing)
2. **Royal Sleepdienst** - Rotterdam (GMB listing)
3. **Test Business 1** - Amsterdam HQ
4. **Test Business 2** - Rotterdam Branch

All include:
- Full address with GPS coordinates
- Phone and website
- GMB ratings (where applicable)
- Scheduled visits

## 🛠️ Tech Stack

- **Backend**: Node.js + Express
- **Database**: SQLite (better-sqlite3)
- **Frontend**: HTML + Tailwind CSS
- **Maps**: Leaflet.js + OpenStreetMap
- **Routing**: OSRM API
- **Geocoding**: Nominatim API
- **Scheduling**: node-cron + shell scripts

## 📄 License

MIT License - Feel free to use and modify as needed.

## 🤝 Support

For issues or questions, check the logs in the `logs/` directory or review the troubleshooting section above.
