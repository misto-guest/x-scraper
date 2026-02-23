# 🚀 Universal Railway Deployment Automation

**Complete system for deploying ANY web app to Railway with zero configuration.**

---

## ✅ What's Been Set Up

You now have a **complete deployment automation system** that can deploy any future web app to Railway with a single command.

### 📦 Files Created

1. **`deploy-to-railway.sh`** - Universal deployment script
2. **`railway-deploy.cjs`** - Interactive CLI tool
3. **`install-deployment-tools.sh`** - System installer
4. **`.github/workflows/railway-deploy.yml`** - GitHub Actions workflow
5. **`DEPLOYMENT-AUTOMATION.md`** - Complete guide

---

## ⚡ Quick Start (3 Methods)

### Method 1: Universal Script (Recommended for Any Project)

```bash
cd /path/to/your/app
/Users/northsea/clawd-dmitry/gmail-warmup-v2/deploy-to-railway.sh
```

That's it! The script will:
- ✅ Auto-detect project type
- ✅ Configure Railway settings
- ✅ Deploy immediately
- ✅ Give you the live URL

### Method 2: CLI Tool (Interactive)

```bash
cd /path/to/your/app
node /Users/northsea/clawd-dmitry/gmail-warmup-v2/railway-deploy.cjs init
node /Users/northsea/clawd-dmitry/gmail-warmup-v2/railway-deploy.cjs deploy
```

### Method 3: Install Globally (Use from Anywhere)

```bash
# Install to system
bash /Users/northsea/clawd-dmitry/gmail-warmup-v2/install-deployment-tools.sh

# Reload shell
source ~/.zshrc  # or ~/.bashrc

# Now use from anywhere!
cd /path/to/any/app
deploy-to-railway
```

---

## 🎯 What It Supports

### Auto-Detection

The system **automatically detects** and configures:

| Project Type | Detected By | Auto-Configured |
|-------------|-------------|----------------|
| **Next.js** | `package.json` | Build + Start commands |
| **Express** | `package.json` | Start command |
| **React** | `package.json` | Build + Serve |
| **Vue** | `package.json` | Build + Serve |
| **Node.js** | `package.json` | Start script |
| **Python** | `requirements.txt` | Pip install + Python run |
| **Docker** | `Dockerfile` | Docker build |
| **Static** | `index.html` | Serve static |

### Auto-Configuration

For each detected project type, it automatically:
- Sets correct build commands
- Sets correct start commands
- Configures health checks
- Loads environment variables
- Sets up deployment URL

---

## 📋 Step-by-Step Examples

### Deploy a Next.js App

```bash
# Create app
npx create-next-app my-blog
cd my-blog

# Deploy (one command!)
~/deploy-to-railway.sh

# Output:
# ✅ Detected: nodejs (nextjs)
# ✅ Configured Railway settings
# ✅ Deployed to Railway
# 🌐 https://my-blog.up.railway.app
```

### Deploy an Express API

```bash
# Create API
mkdir my-api && cd my-api
npm init -y
npm install express

# Create server.js
cat > server.js << 'EOF'
const express = require('express');
const app = express();
app.get('/', (req, res) => res.json({ status: 'ok' }));
app.listen(3000);
EOF

# Deploy
~/deploy-to-railway.sh
# URL: https://my-api.up.railway.app
```

### Deploy a Static Site

```bash
# Create site
mkdir my-site && cd my-site

cat > index.html << 'EOF'
<h1>Hello Railway!</h1>
EOF

# Deploy
~/deploy-to-railway.sh
# URL: https://my-site.up.railway.app
```

### Deploy a Python Flask App

```bash
mkdir my-app && cd my-app

cat > requirements.txt << 'EOF'
flask
gunicorn
EOF

cat > app.py << 'EOF'
from flask import Flask
app = Flask(__name__)

@app.route('/')
def home():
    return {'status': 'deployed'}

if __name__ == '__main__':
    app.run()
EOF

# Deploy
~/deploy-to-railway.sh
# URL: https://my-app.up.railway.app
```

---

## 🌍 Environment Variables

### Automatic Loading

Create a `.env` file in your project:

```bash
# .env
DATABASE_URL=postgresql://...
API_KEY=secret_key
STRIPE_SECRET_KEY=sk_live_...
```

The deployment script will:
1. Detect `.env` file
2. Ask if you want to load variables
3. Upload all to Railway automatically

### Manual Variables

```bash
# After deployment
railway variables set NEW_VAR=value
```

---

## 🔄 GitHub Auto-Deploy (Zero Touch)

### Setup (One Time)

1. **Push code to GitHub**
```bash
cd your-app
git init
git add .
git commit -m "Initial"
gh repo create your-app --public --source=. --push
```

2. **Connect in Railway**
- Go to https://railway.app/new
- Click "Deploy from GitHub repo"
- Select your repository
- Click "Deploy Now"

### Result

Every time you push to main:
```bash
git add .
git commit -m "New feature"
git push
```

Railway **auto-deploys** your changes! 🎉

---

## 🎨 Advanced Usage

### Silent Mode (No Prompts)

```bash
deploy-to-railway.sh --yes
```

### Specify App Name

```bash
deploy-to-railway.sh --app my-custom-name
```

### Custom Environment

```bash
deploy-to-railway.sh --env production
deploy-to-railway.sh --env staging
```

### Using the CLI Tool

```bash
# Interactive setup
railway-deploy init

# Deploy
railway-deploy deploy

# Deploy without prompts
railway-deploy deploy --yes

# View logs
railway-deploy logs

# Get URL
railway-deploy url

# Check status
railway-deploy status
```

---

## 📁 Project Templates

### Template 1: Node.js API

```bash
mkdir my-api && cd my-api
npm init -y
npm install express cors dotenv

cat > server.js << 'EOF'
const express = require('express');
const app = express();
app.use(express.json());
app.use(cors());

app.get('/', (req, res) => res.json({ status: 'ok' }));
app.get('/api/health', (req, res) => res.json({ healthy: true }));

const port = process.env.PORT || 3000;
app.listen(port, () => console.log(`Server on ${port}`));
EOF

cat > package.json << 'EOF'
{
  "scripts": { "start": "node server.js" }
}
EOF

deploy-to-railway.sh
```

### Template 2: Next.js App

```bash
npx create-next-app@latest my-app --typescript --tailwind --app
cd my-app
deploy-to-railway.sh
```

### Template 3: Static Site

```bash
mkdir my-site && cd my-site

cat > index.html << 'EOF'
<!DOCTYPE html>
<html>
<head>
    <title>My Site</title>
    <link rel="stylesheet" href="style.css">
</head>
<body>
    <h1>Deployed to Railway!</h1>
    <script src="app.js"></script>
</body>
</html>
EOF

deploy-to-railway.sh
```

---

## 🎯 Complete Workflow

### For Any Future Project

1. **Create your app** (any framework/language)
2. **cd into project directory**
3. **Run one command:**
   ```bash
   deploy-to-railway.sh
   ```
4. **Get live URL** (automatically provided)
5. **Done!** 🚀

### If Using GitHub (Recommended)

1. Create app
2. Push to GitHub
3. Connect in Railway dashboard (one time)
4. **All future pushes auto-deploy**

---

## 📊 Railway Dashboard Management

### After Deployment

```bash
# View logs
railway logs -f

# Open in browser
railway open

# Get all domains
railway domain

# Add custom domain
railway domain add myapp.com

# Run one-off command
railway run npm run migrate

# SSH into container
railway shell
```

### Environment Variables in Dashboard

1. Go to your Railway project
2. Click "Variables"
3. Add/edit variables
4. Railway auto-restarts app

---

## 🌟 Features Summary

| Feature | Description |
|---------|-------------|
| **Zero Config** | Works out of the box |
| **Auto-Detect** | Recognizes all major frameworks |
| **Auto-Deploy** | One-command deployment |
| **Auto-Variables** | Loads .env automatically |
| **Auto-URL** | Retrieves deployment URL |
| **GitHub Sync** | Auto-deploy on git push |
| **Health Checks** | Configured automatically |
| **Logs** | Built-in log viewing |
| **Custom Domains** | Easy domain setup |
| **Multi-Env** | Prod/staging/dev support |

---

## 🔧 Troubleshooting

### Railway CLI Not Found
```bash
npm install -g @railway/cli
```

### Wrong Project Type
Create `.railway-app.yml`:
```yaml
type: "nodejs"  # or python, docker, static
```

### Variables Not Loading
Check `.env` format:
```bash
KEY=value  # No spaces
```

### Deployment Failed
```bash
# Check logs
railway logs

# Redeploy
railway up
```

---

## 💡 Best Practices

### 1. Always Use `.env`
```bash
# .env
DATABASE_URL=...
API_KEY=...
```

### 2. Add Health Check
```javascript
app.get('/health', (req, res) => {
  res.json({ status: 'ok' });
});
```

### 3. Use GitHub Auto-Deploy
- Push to main
- Railway auto-deploys
- Zero friction

### 4. Monitor Logs
```bash
railway logs -f
```

### 5. Separate Environments
```bash
myapp-prod
myapp-staging
myapp-dev
```

---

## 🎉 Summary

### What You Can Do Now

1. **Deploy any app** with one command
2. **Auto-detects** project type
3. **Auto-configures** everything
4. **Auto-deploys** to Railway
5. **Auto-returns** live URL

### Commands Available

```bash
# Deploy any app
deploy-to-railway.sh

# Or use CLI
railway-deploy init
railway-deploy deploy

# GitHub auto-deploy (set up once)
git push  # Auto-deploys!
```

---

## 🚀 Ready to Deploy?

### Deploy This Example App

```bash
# Create test app
mkdir test-app && cd test-app
echo '<h1>Hello Railway!</h1>' > index.html

# Deploy
~/deploy-to-railway.sh

# Get URL
cat .railway-url
```

### Deploy Your Own App

```bash
cd /path/to/your/app
~/deploy-to-railway.sh
```

**That's it!** Your app will be live in seconds. 🎯

---

**You now have universal deployment automation for ANY web app you build!** 🚀
