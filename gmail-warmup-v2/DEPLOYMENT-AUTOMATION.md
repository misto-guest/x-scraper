# 🚀 Universal Deployment Automation for Railway

Automated deployment system for ANY web app to Railway. Zero configuration required.

---

## 🎯 What This Does

- ✅ **Auto-detects** project type (Node.js, Python, Docker, Static)
- ✅ **Auto-configures** Railway settings
- ✅ **Auto-loads** environment variables from `.env`
- ✅ **Auto-deploys** to Railway
- ✅ **Auto-sets up** GitHub auto-deploy
- ✅ **Saves deployment info** for reference

**One command deployment:**
```bash
./deploy-to-railway.sh
```

---

## ⚡ Quick Start

### 1. Make Script Executable
```bash
chmod +x deploy-to-railway.sh
```

### 2. Deploy Any App
```bash
cd /path/to/your/app
~/path/to/deploy-to-railway.sh
```

That's it! The script will:
1. Detect your project type
2. Configure Railway settings
3. Load environment variables
4. Deploy to Railway
5. Give you the URL

---

## 📋 Usage Examples

### Interactive Mode (Recommended)
```bash
./deploy-to-railway.sh
```
Asks for confirmation at each step.

### Silent Mode (Auto-confirm all)
```bash
./deploy-to-railway.sh --yes
```
Deploys without prompts.

### Specify App Name
```bash
./deploy-to-railway.sh --app my-awesome-app
```

### Different Environments
```bash
./deploy-to-railway.sh --env production
./deploy-to-railway.sh --env staging
```

---

## 🎨 Supported Project Types

### Node.js Apps
Auto-detected if `package.json` exists:

**Frameworks:**
- Next.js
- Express
- React
- Vue
- Any Node.js app

**Example:**
```bash
cd my-nextjs-app
~/deploy-to-railway.sh
```

### Python Apps
Auto-detected if `requirements.txt` or `setup.py` exists:

**Frameworks:**
- Django
- Flask
- FastAPI
- Any Python app

### Docker Apps
Auto-detected if `Dockerfile` exists.

### Static Sites
Auto-detected if `index.html` exists.

**Examples:**
- Pure HTML/CSS/JS
- Vue CLI build
- React build
- Any static frontend

---

## 🔧 Configuration Files Created

The script creates these files automatically:

### `.railway-app.yml`
```yaml
app: "your-app-name"
type: "nodejs"
framework: "nextjs"

build:
  command: "npm install && npm run build"

start:
  command: "npm start"

environment:
  - key: NODE_ENV
    value: production
  - key: PORT
    value: 18789
```

### `DEPLOYMENT_INFO.md`
Contains:
- Deployment URL
- Railway dashboard link
- Environment variables
- Commands for logs/redeploy

---

## 🌍 Environment Variables

### Automatic Loading

If you have a `.env` file:
```bash
# .env
DATABASE_URL=postgresql://...
API_KEY=secret_key_here
```

The script will:
1. Detect `.env` file
2. Ask if you want to load variables
3. Upload all to Railway automatically

### Manual Variables

```bash
# After deployment
railway variables set NEW_VAR=value
```

---

## 🔄 GitHub Auto-Deploy

### Option 1: GitHub Actions (Automatic)

1. Push your code to GitHub
2. Go to https://railway.app/new
3. Click "Deploy from GitHub repo"
4. Select your repository
5. **Done!** Every `git push` triggers deployment

### Option 2: Git Hook (Local)

The script offers to install a git hook:
```bash
#!/bin/bash
# .git/hooks/post-commit
railway up &
```

Now every commit auto-deploys!

---

## 📁 Project Templates

Copy these templates for new projects:

### Node.js API Template
```bash
# Create new project
mkdir my-api && cd my-api
npm init -y
npm install express

# Create server.js
cat > server.js << 'EOF'
const express = require('express');
const app = express();

app.get('/', (req, res) => {
  res.json({ status: 'ok', message: 'Deployed to Railway!' });
});

app.listen(process.env.PORT || 3000);
EOF

# Deploy
~/deploy-to-railway.sh
```

### Next.js App Template
```bash
# Create new project
npx create-next-app my-app
cd my-app

# Deploy
~/deploy-to-railway.sh
```

### Static Site Template
```bash
# Create simple site
mkdir my-site && cd my-site

cat > index.html << 'EOF'
<!DOCTYPE html>
<html>
<head><title>Deployed to Railway</title></head>
<body><h1>🚀 Hello Railway!</h1></body>
</html>
EOF

# Deploy
~/deploy-to-railway.sh
```

---

## 🎯 Advanced Usage

### Custom Build Commands

Create `.railway-app.yml`:
```yaml
build:
  command: "npm run build && npm run custom-script"

start:
  command: "npm run custom-start"
```

### Multiple Environments

```bash
# Production
./deploy-to-railway.sh --app myapp-prod --env production

# Staging
./deploy-to-railway.sh --app myapp-staging --env staging
```

### Health Checks

Add to your app:
```javascript
// Express
app.get('/health', (req, res) => {
  res.json({ status: 'healthy' });
});
```

Configure in Railway:
```yaml
healthcheck:
  path: /health
  interval: 30s
  timeout: 10s
```

---

## 📊 Deployment Workflow

```
1. Detect Project Type
   ↓
2. Get App Name
   ↓
3. Create Railway Config
   ↓
4. Load Environment Variables
   ↓
5. Deploy to Railway
   ↓
6. Get Deployment URL
   ↓
7. Setup Auto-Deploy
   ↓
8. Save Deployment Info
```

---

## 🔍 Troubleshooting

### Railway CLI Not Found
```bash
npm install -g @railway/cli
```

### Not Logged In
```bash
railway login
```

### Wrong Project Type
Create `.railway-app.yml` manually:
```yaml
type: "nodejs"  # or python, docker, static
```

### Environment Variables Not Loading
Check `.env` file format:
```bash
KEY=value  # No spaces around =
# Comments start with #
```

### Deployment Failed
```bash
# Check logs
railway logs

# Redeploy
railway up
```

---

## 🚀 Best Practices

### 1. Use `.env` for Variables
```bash
# .env
DATABASE_URL=...
API_KEY=...
```

### 2. Add Health Check Endpoint
```javascript
app.get('/health', (req, res) => {
  res.json({ status: 'ok' });
});
```

### 3. Use GitHub Auto-Deploy
- Push to main branch
- Railway auto-deploys
- Zero friction

### 4. Separate Environments
```bash
myapp-prod    # Production
myapp-staging # Staging
myapp-dev     # Development
```

### 5. Monitor Logs
```bash
railway logs -f
```

---

## 📱 Deployment Commands

### After Deployment

```bash
# View logs
railway logs

# Open in browser
railway open

# Get domains
railway domain

# Add custom domain
railway domain add myapp.com

# Redeploy
railway up

# Run one-off command
railway run npm run migrate

# SSH into container
railway shell
```

---

## 🎉 Examples

### Deploy Express API
```bash
cd my-express-api
~/deploy-to-railway.sh --yes
# URL: https://my-express-api.up.railway.app
```

### Deploy Next.js App
```bash
cd my-nextjs-app
~/deploy-to-railway.sh
# URL: https://my-nextjs-app.up.railway.app
```

### Deploy Static Site
```bash
cd my-website
~/deploy-to-railway.sh --yes
# URL: https://my-website.up.railway.app
```

### Deploy Python Flask
```bash
cd my-flask-app
~/deploy-to-railway.sh
# URL: https://my-flask-app.up.railway.app
```

---

## 🌟 Features Summary

| Feature | Description |
|---------|-------------|
| Auto-detect | Recognizes Node.js, Python, Docker, Static |
| Auto-config | Creates Railway config automatically |
| Auto-deploy | One-command deployment |
| Auto-variables | Loads .env files |
| Auto-url | Retrieves deployment URL |
| GitHub sync | Auto-deploy on git push |
| Zero config | Works out of the box |
| Templates | Ready-to-use project templates |

---

## 💡 Tips

1. **First time?** Run without `--yes` to see what's happening
2. **Automated CI/CD?** Use GitHub integration
3. **Multiple apps?** Use `--app` flag to name them
4. **Need logs?** `railway logs -f`
5. **Custom domain?** `railway domain add yourdomain.com`

---

## 🎯 Ready to Deploy?

```bash
cd /path/to/your/app
~/deploy-to-railway.sh
```

**That's it! Your app will be live in seconds.** 🚀
