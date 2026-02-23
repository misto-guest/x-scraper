# Deployment Guide - Gmail Warmup V2

## 🌐 Deployment Options

### Option 1: Railway (Recommended - Easiest)
**Best for:** Quick deployment, auto-scaling, built-in monitoring

**Limitations:**
- AdsPower WebSocket must be publicly accessible
- Additional latency from cloud to AdsPower server
- Need proper WebSocket authentication

### Option 2: VPS/Dedicated Server (Recommended for Production)
**Best for:** Full control, direct AdsPower access, better performance

**Providers:** DigitalOcean, Hetzner, AWS, Google Cloud

### Option 3: Local/Home Server
**Best for:** Testing, development, small scale

---

## 🚀 Option 1: Deploy to Railway

### Prerequisites
1. AdsPower server WebSocket must be accessible from internet
2. Railway CLI installed: `npm install -g @railway/cli`
3. Railway account: https://railway.app

### Step 1: Prepare for Deployment

```bash
cd /Users/northsea/clawd-dmitry/gmail-warmup-v2

# Make deploy script executable
chmod +x deploy-railway.sh
```

### Step 2: Deploy

```bash
./deploy-railway.sh
```

Or manually:

```bash
# Login to Railway
railway login

# Initialize project
railway init

# Set environment variables
railway variables set ADSPOWER_API_KEY=746feb8ab409fbb27a0377a864279e6c000f879a7a0e5329
railway variables set ADSPOWER_BASE_URL=http://95.217.224.154:50325
railway variables set ADSPOWER_SERVER_IP=95.217.224.154
railway variables set PORT=18789
railway variables set NODE_ENV=production

# Deploy
railway up

# Get your domain
railway domain
```

### Step 3: Configure Custom Domain (Optional)

```bash
# Add custom domain
railway domain add warmup.yourdomain.com

# Configure DNS (Railway will provide instructions)
```

### Step 4: Test Deployment

```bash
# Test health endpoint
curl https://your-app.railway.app/api/health

# Test AdsPower connection
curl https://your-app.railway.app/api/test-connection
```

---

## 🚀 Option 2: Deploy to VPS

### Recommended VPS Setup

**Requirements:**
- 2GB RAM minimum
- Ubuntu 20.04+ or Debian 11+
- Node.js 18+
- Can reach AdsPower server at 95.217.224.154:50325

### Step 1: Prepare VPS

```bash
# Update system
sudo apt update && sudo apt upgrade -y

# Install Node.js 18
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt install -y nodejs

# Install PM2 (process manager)
sudo npm install -g pm2

# Install Nginx (reverse proxy)
sudo apt install -y nginx

# Clone repository
cd /opt
git clone <your-repo-url> gmail-warmup
cd gmail-warmup

# Install dependencies
npm install

# Create directories
mkdir -p data logs screenshots
```

### Step 2: Configure Environment

```bash
# Create .env file
cat > .env <<EOF
ADSPOWER_API_KEY=746feb8ab409fbb27a0377a864279e6c000f879a7a0e5329
ADSPOWER_BASE_URL=http://95.217.224.154:50325
ADSPOWER_SERVER_IP=95.217.224.154
PORT=18789
NODE_ENV=production
EOF
```

### Step 3: Start with PM2

```bash
# Start application
pm2 start index.js --name gmail-warmup

# Configure PM2 startup script
pm2 startup
pm2 save

# Check status
pm2 status
pm2 logs gmail-warmup
```

### Step 4: Configure Nginx Reverse Proxy

```bash
# Create Nginx config
sudo nano /etc/nginx/sites-available/gmail-warmup
```

Add this configuration:

```nginx
server {
    listen 80;
    server_name your-domain.com;

    location / {
        proxy_pass http://localhost:18789;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
    }
}
```

Enable and restart:

```bash
# Enable site
sudo ln -s /etc/nginx/sites-available/gmail-warmup /etc/nginx/sites-enabled/

# Test configuration
sudo nginx -t

# Restart Nginx
sudo systemctl restart nginx
```

### Step 5: SSL Certificate (Let's Encrypt)

```bash
# Install Certbot
sudo apt install -y certbot python3-certbot-nginx

# Get certificate
sudo certbot --nginx -d your-domain.com

# Auto-renewal is configured automatically
```

---

## 🔧 Important: AdsPower Connectivity

### The Challenge

AdsPower returns WebSocket URLs like:
```
ws://127.0.0.1:60727/devtools/browser/xxx
```

This only works on the AdsPower server itself. For remote connections, we need to reconstruct the URL.

### Solution

For cloud/VPS deployments, the code reconstructs the WebSocket URL:
```
ws://95.217.224.154:8080/port/60727/devtools/browser/xxx
```

### Requirements

1. **AdsPower Server Firewall:**
   ```bash
   # On AdsPower server (95.217.224.154)
   # Allow WebSocket connections from your VPS IP
   sudo ufw allow from YOUR_VPS_IP to any port 8080
   ```

2. **Nginx Configuration on AdsPower Server:**
   ```nginx
   # /etc/nginx/sites-available/adspower-proxy
   
   server {
       listen 8080;
       server_name 95.217.224.154;
       
       location /port/ {
           proxy_pass http://localhost:$arg_port;
           proxy_http_version 1.1;
           proxy_set_header Upgrade $http_upgrade;
           proxy_set_header Connection "upgrade";
           proxy_set_header Host $host;
           proxy_read_timeout 86400;
       }
   }
   ```

3. **Authentication Headers:**
   The WebSocket connection includes:
   ```javascript
   headers: {
       'X-Api-Key': 'YOUR_API_KEY',
       'Host': 'localhost'
   }
   ```

---

## 📊 Monitoring & Maintenance

### Railway (Cloud)
- Built-in metrics dashboard
- Logs in Railway CLI: `railway logs`
- Auto-scaling included
- Deploy on git push

### VPS
- **PM2 Monitoring:**
  ```bash
  pm2 monit
  pm2 logs
  ```

- **Disk Space:**
  ```bash
  df -h
  du -sh /opt/gmail-warmup/screenshots
  ```

- **Log Rotation:**
  ```bash
  # Add to crontab
  0 0 * * 0 pm2 flush && pm2 reload logs
  ```

- **Auto-restart on failure:**
  ```bash
  pm2 startup
  pm2 save
  ```

---

## 🔐 Security Checklist

### For Railway:
- ✅ Railway handles SSL automatically
- ✅ Environment variables encrypted
- ⚠️  Add authentication for production
- ⚠️  Set up custom domain

### For VPS:
- ✅ Firewall configured
- ✅ SSL certificate installed
- ✅ Nginx reverse proxy configured
- ⚠️  Add API authentication
- ⚠️  Rate limiting
- ⚠️  IP whitelist for admin panel

---

## 🚦 Quick Decision Guide

**Choose Railway if:**
- ✅ Quick deployment needed
- ✅ Don't want to manage servers
- ✅ Auto-scaling desired
- ⚠️  AdsPower WebSocket publicly accessible

**Choose VPS if:**
- ✅ Full control needed
- ✅ Direct AdsPower access required
- ✅ Better performance needed
- ✅ Cost-effective at scale

---

## 📞 Troubleshooting

### Railway: Connection Refused
```bash
# Check AdsPower server firewall
curl http://95.217.224.154:50325/api/v2/user/list?api_key=YOUR_KEY

# Check WebSocket port
telnet 95.217.224.154 8080
```

### VPS: PM2 Not Starting
```bash
# Check logs
pm2 logs --lines 100

# Restart
pm2 restart gmail-warmup

# Rebuild
pm2 delete gmail-warmup
pm2 start index.js --name gmail-warmup
```

### WebSocket Connection Failed
```bash
# Test AdsPower API
curl "http://95.217.224.154:50325/api/v2/browser-profile/start?api_key=YOUR_KEY" \
  -X POST \
  -H "Content-Type: application/json" \
  -d '{"profile_id":"k12am9a2"}'

# Check if port 8080 is accessible
nc -zv 95.217.224.154 8080
```

---

## 🎯 Recommended Production Setup

**Best Practice:** Hybrid Approach

1. **Web UI on Railway** - Public dashboard, easy access
2. **Warmup Worker on VPS** - Direct AdsPower connection
3. **Shared Database** - Both use same data storage
4. **Cron Jobs on VPS** - Batch processing

This gives you:
- ✅ Easy web access (Railway)
- ✅ Reliable warmup execution (VPS)
- ✅ Scalable architecture
- ✅ Cost-effective

---

**Ready to deploy? Start with Railway for quick setup, then migrate to VPS for production!** 🚀
