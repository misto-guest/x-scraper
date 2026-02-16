# Twitter Monitor - Deployment Guide

## Quick Deploy (Vercel)

```bash
cd twitter-monitor
./deploy.sh
```

## Manual Deployment Options

### Option 1: Vercel (Recommended)

1. **Install Vercel CLI**
   ```bash
   npm install -g vercel
   ```

2. **Deploy**
   ```bash
   vercel login
   vercel --prod
   ```

3. **Set Environment Variables** (in Vercel Dashboard)
   ```
   DATABASE_URL=postgresql://...
   GHOSTFETCH_URL=http://your-ghostfetch-server.com:8000
   ```

4. **Run Database Migration**
   ```bash
   # Get production DATABASE_URL from Vercel
   DATABASE_URL="your-production-url" npx prisma db push
   ```

### Option 2: Railway

1. **Create Railway Account**
   - Visit https://railway.app
   - Click "New Project"

2. **Deploy from GitHub**
   - Connect your repository
   - Select `twitter-monitor` folder
   - Railway will auto-detect Next.js

3. **Add PostgreSQL Database**
   - In Railway project, click "New Service"
   - Select "Database" → "PostgreSQL"
   - Railway will provide `DATABASE_URL`

4. **Set Environment Variables**
   ```
   GHOSTFETCH_URL=http://your-ghostfetch-server.com:8000
   ```

5. **Run Migration**
   ```bash
   # In Railway console
   npx prisma db push
   ```

### Option 3: Self-Hosted (VPS/Docker)

#### Docker Deployment

Create `Dockerfile` (already in project):
```dockerfile
FROM node:20-alpine

WORKDIR /app

COPY package*.json ./
RUN npm ci --only=production

COPY . .
RUN npx prisma generate

EXPOSE 3000

CMD ["npm", "start"]
```

Build and run:
```bash
docker build -t twitter-monitor .
docker run -p 3000:3000 \
  -e DATABASE_URL="file:./production.db" \
  -e GHOSTFETCH_URL="http://ghostfetch:8000" \
  twitter-monitor
```

#### Traditional VPS

```bash
# On your VPS
git clone your-repo
cd twitter-monitor
npm install
npm run build
npm start

# Or use PM2 for production
npm install -g pm2
pm2 start npm --name "twitter-monitor" -- start
pm2 startup
pm2 save
```

## GhostFetch Server Setup

**IMPORTANT:** GhostFetch must run separately from your main app.

### Option A: Docker (Recommended)

```bash
docker run -d \
  --name ghostfetch \
  -p 8000:8000 \
  iarsalanshah/ghostfetch:latest
```

### Option B: Systemd Service (Linux)

Create `/etc/systemd/system/ghostfetch.service`:
```ini
[Unit]
Description=GhostFetch Server
After=network.target

[Service]
Type=simple
User=www-data
WorkingDirectory=/home/www-data
ExecStart=/usr/local/bin/ghostfetch serve --port 8000
Restart=always

[Install]
WantedBy=multi-user.target
```

Enable and start:
```bash
sudo systemctl daemon-reload
sudo systemctl enable ghostfetch
sudo systemctl start ghostfetch
```

### Option C: Background Process

```bash
# Simple nohup
nohup ghostfetch serve --port 8000 > /var/log/ghostfetch.log 2>&1 &

# Or with screen/tmux
screen -S ghostfetch
ghostfetch serve --port 8000
# Ctrl+A+D to detach
```

## Database Setup

### Development (SQLite)
```bash
cd twitter-monitor
npx prisma generate
npx prisma db push
```

### Production (PostgreSQL)

1. **Create database**
   - Vercel: Use Vercel Postgres
   - Railway: Add PostgreSQL service
   - Self-hosted: Install PostgreSQL

2. **Update Schema**
   ```prisma
   datasource db {
     provider = "postgresql"
     url      = env("DATABASE_URL")
   }
   ```

3. **Run Migration**
   ```bash
   DATABASE_URL="postgresql://..." npx prisma generate
   DATABASE_URL="postgresql://..." npx prisma db push
   ```

## Environment Variables

```env
# Database (required)
DATABASE_URL="postgresql://user:pass@host:5432/dbname"

# GhostFetch URL (required)
GHOSTFETCH_URL="http://localhost:8000"

# Node Environment
NODE_ENV="production"

# Optional: Port override
PORT=3000
```

## First Run Setup

After deployment:

1. **Access your app**
   - Open: `https://your-domain.com`

2. **Add a profile**
   ```bash
   curl -X POST https://your-domain.com/api/profiles \
     -H "Content-Type: application/json" \
     -d '{"username": "notgrahamp"}'
   ```

3. **Add keywords**
   ```bash
   curl -X POST https://your-domain.com/api/keywords \
     -H "Content-Type: application/json" \
     -d '{"word": "SEO", "category": "marketing"}'
   ```

4. **Test scraping**
   ```bash
   curl -X POST https://your-domain.com/api/profiles/{profileId}/scrape
   ```

5. **Review tweets**
   - Visit: `https://your-domain.com/admin/tweets?status=PENDING`

## Monitoring & Maintenance

### Check App Health
```bash
curl https://your-domain.com/api/profiles
```

### Check GhostFetch Health
```bash
curl http://your-ghostfetch-server:8000
```

### View Logs
- Vercel: Dashboard → Logs
- Railway: Dashboard → Logs
- PM2: `pm2 logs twitter-monitor`

### Backup Database
```bash
# SQLite
cp prisma/dev.db prisma/backup-$(date +%Y%m%d).db

# PostgreSQL
pg_dump dbname > backup-$(date +%Y%m%d).sql
```

## Security Checklist

- [ ] Change default API keys
- [ ] Enable HTTPS (automatic on Vercel/Railway)
- [ ] Set up authentication for admin panel
- [ ] Add rate limiting to API endpoints
- [ ] Regular database backups
- [ ] Monitor GhostFetch resource usage

## Troubleshooting

### Issue: "GhostFetch server not running"
**Solution:** Start GhostFetch server
```bash
ghostfetch serve --port 8000
```

### Issue: "Database connection error"
**Solution:** Check DATABASE_URL
```bash
echo $DATABASE_URL
# Should match your database format
```

### Issue: "Port already in use"
**Solution:** Change port
```bash
PORT=3001 npm run dev
```

### Issue: Tweets not saving
**Solution:** Check scrape logs
```bash
# Check database for errors
npx prisma studio
# Look at ScrapeLog table
```

## Scaling Considerations

### For 100+ Profiles:
- Use PostgreSQL (not SQLite)
- Add Redis for caching
- Implement rate limiting
- Use queue system (Bull/BullMQ) for scraping jobs

### For Heavy Usage:
- Separate scraping server
- Load balance multiple GhostFetch instances
- Use CDN for static assets
- Implement request queuing

## Support

- Documentation: `README.md`
- Issues: Check GitHub issues
- Prisma Docs: https://www.prisma.io/docs
- Next.js Docs: https://nextjs.org/docs

## Cost Estimates

### Vercel (Hobby Plan)
- Free: $0/month
- Includes: 100GB bandwidth, serverless functions

### Railway
- $5/month minimum
- Includes: Database + app hosting

### Self-Hosted VPS
- $5-20/month (DigitalOcean, Linode)
- Full control, manual setup

### GhostFetch Server
- Minimal CPU/memory required
- Can run on smallest VPS tier
