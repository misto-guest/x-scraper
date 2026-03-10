# VPS Infrastructure - 45.76.167.14

**Date:** 2026-03-03  
**Purpose:** Production VPS for automated bots and scrapers

## Connection Details

**IP Address:** 45.76.167.14  
**SSH Username:** bram_ai  
**SSH Password:** bram_ai_2026_!zx  
**SSH Key:** Saved in secure storage (attached to message on 2026-03-03)

## Current Deployments

### 1. X Scraper (@publisherinabox monitor)
- **Location:** /opt/x-scraper
- **URL:** http://45.76.167.14:5003
- **Service:** x-scraper (systemd)
- **Purpose:** Automated Twitter/X scraping for @publisherinabox
- **Stack:** Python Flask, Selenium, Chrome
- **Deploy Date:** 2026-03-03

### 2. YouTube Tracker Bot
- **Status:** Running (existing)
- **Maintained by:** bram_ai

### 3. Music Availability Tester Bot
- **Status:** Running (existing)
- **Maintained by:** bram_ai

## System Configuration

**OS:** Linux (small VPS)  
**User:** bram_ai  
**App Directory:** /opt/  
**Service Manager:** systemd  

## Deployment Pattern

```bash
# 1. SSH in
ssh bram_ai@45.76.167.14

# 2. Create app directory
sudo mkdir -p /opt/app-name
sudo chown bram_ai:bram_ai /opt/app-name
cd /opt/app-name

# 3. Setup Python env (if needed)
python3 -m venv venv
source venv/bin/activate
pip install -r requirements.txt

# 4. Create systemd service
sudo nano /etc/systemd/system/app-name.service
sudo systemctl daemon-reload
sudo systemctl enable app-name
sudo systemctl start app-name

# 5. Check status
sudo systemctl status app-name
sudo journalctl -u app-name -f
```

## Systemd Service Template

```ini
[Unit]
Description=App Name
After=network.target

[Service]
Type=simple
User=bram_ai
WorkingDirectory=/opt/app-name
Environment="ENV_VAR=value"
ExecStart=/opt/app-name/start.sh
Restart=always
RestartSec=10

[Install]
WantedBy=multi-user.target
```

## Installed Dependencies

- Python 3 + pip + venv
- Google Chrome Stable
- ChromeDriver
- Xvfb (virtual display for headless Chrome)
- wget, curl, unzip, xvfb

## Deployment Checklist for New Apps

- [ ] SSH into VPS
- [ ] Create /opt/app-name directory
- [ ] Upload application files
- [ ] Install dependencies
- [ ] Create startup script
- [ ] Create systemd service
- [ ] Enable and start service
- [ ] Configure firewall if needed
- [ ] Test deployment
- [ ] Document deployment

## Notes

- VPS is small - monitor resources
- Multiple bots running - don't overload
- Always use systemd for services
- Log location: journalctl -u service-name -f
- Apps run on ports 5000-5100 range typically

## Maintenance

**Check all services:**
```bash
sudo systemctl list-units --type=service --state=running | grep bram_ai
```

**View logs:**
```bash
sudo journalctl -u x-scraper -f
```

**Restart service:**
```bash
sudo systemctl restart x-scraper
```

**Update deployment:** 2026-03-03
