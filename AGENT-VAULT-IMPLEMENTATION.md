# agent-vault Implementation Guide for Gmail Warmup V2

## What is agent-vault?

agent-vault keeps secrets hidden from AI agents. When agents help you, secrets like API keys flow through LLM servers. agent-vault prevents this by:

- Storing secrets in encrypted vault (~/.agent-vault/)
- Replacing secrets with `<agent-vault:key>` placeholders
- Agents **never see** your actual secrets

---

## Setup (You Need to Run These)

### Step 1: Initialize the Vault
```bash
agent-vault init
```

### Step 2: Store Your Secrets

**AdsPower API Key:**
```bash
agent-vault set adspower-api-key --desc "AdsPower V2 API key"
# Enter value when prompted: 746feb8ab409fbb27a0377a864279e6c000f879a7a0e5329
```

**Railway Token (if needed):**
```bash
agent-vault set railway-api-token --desc "Railway API token"
```

**Gmail Credentials (if needed):**
```bash
agent-vault set gmail-app-password --desc "Gmail app password for warmup"
```

---

## Secure Configuration Files

### Example: Gmail Warmup V2 Config

**What the agent sees (placeholders):**
```yaml
# config.yaml
adspower:
  apiKey: <agent-vault:adspower-api-key>
  baseUrl: http://77.42.21.134:50325

railway:
  token: <agent-vault:railway-api-token>
  project: e28de789-eac6-40cf-9965-fb0561578955
```

**What's actually on disk (real values):**
```yaml
# config.yaml (after agent-vault write)
adspower:
  apiKey: 746feb8ab409fbb27a0377a864279e6c000f879a7a0e5329
  baseUrl: http://77.42.21.134:50325

railway:
  token: your_railway_token_here
  project: e28de789-eac6-40cf-9965-fb0561578955
```

---

## Updated Gmail Warmup V2 Code

### New Secure Config Structure

Create `config/secure.yaml.example`:

```yaml
# Gmail Warmup V2 - Secure Configuration Template
# Copy this to config/secure.yaml after running agent-vault set commands

adspower:
  apiKey: <agent-vault:adspower-api-key>
  baseUrl: http://77.42.21.134:50325

server:
  port: 3000

data:
  directory: ./data
  screenshots: ./screenshots

logging:
  level: info
  file: ./logs/warmup.log
```

### Updated index.js to Use agent-vault

```javascript
// index.js - With agent-vault integration
const YAML = require('yaml');
const { execSync } = require('child_process');

function loadConfig() {
    // Check if config uses agent-vault
    const configPath = path.join(__dirname, 'config/secure.yaml');

    // Use agent-vault read to get config with placeholders
    const configContent = execSync(`agent-vault read ${configPath}`, {
        encoding: 'utf8'
    });

    // Parse YAML
    let config = YAML.parse(configContent);

    // Write config with real secrets to temp file for runtime use
    const tempConfig = path.join(__dirname, 'config/runtime.json');
    execSync(`agent-vault write ${tempConfig} --content '${JSON.stringify(config)}'`, {
        encoding: 'utf8'
    });

    // Load real config
    const runtimeConfig = JSON.parse(require('fs').readFileSync(tempConfig));

    // Clean up temp file
    require('fs').unlinkSync(tempConfig);

    return runtimeConfig;
}

// Use in initialization
const CONFIG = loadConfig();
```

---

## Agent-Safe Commands

### Reading Files (Safe for Agents)

```bash
# Agent can read files with placeholders
agent-vault read config/secure.yaml
# Output shows <agent-vault:adspower-api-key> instead of real key
```

### Writing Files (Safe for Agents)

```bash
# Agent can write files with placeholders
agent-vault write config/new-service.yaml --content '
apiKey: <agent-vault:adspower-api-key>
url: https://api.example.com
'
```

### Checking if Secrets Exist

```bash
# Agent can check if secrets exist
agent-vault has adspower-api-key  # returns true/false
agent-vault has adspower-api-key railway-api-token --json  # JSON output
```

### Listing Keys

```bash
# Agent can list key names (not values)
agent-vault list  # Shows only key names
```

---

## Commands You Must Run (Not Agents)

### Setting Secrets

```bash
# Interactive - agent CANNOT run this
agent-vault set adspower-api-key

# From environment variable
agent-vault set adspower-api-key --from-env ADSPOWER_API_KEY

# From stdin
echo "secret_value" | agent-vault set adspower-api-key --stdin
```

### Viewing Secrets

```bash
# You must run this - agent CANNOT
agent-vault get adspower-api-key --reveal
```

### Removing Secrets

```bash
# You must run this - agent CANNOT
agent-vault rm old-key
```

---

## Integration with Existing Projects

### Gmail Warmup V2

Update the existing code to use agent-vault:

```javascript
// lib/adspower-v2-client.js
class AdsPowerV2Client {
    constructor(config) {
        this.apiKey = config.apiKey; // Already loaded securely
        this.baseUrl = config.baseUrl;
    }
}
```

The agent-vault magic happens at config load time, not in the runtime code.

### Railway Deployment

Create `railway-secrets.sh`:

```bash
#!/bin/bash
# Deploy to Railway with agent-vault

# Check if secrets exist
if agent-vault has adspower-api-key; then
    echo "✅ AdsPower API key found in vault"
else
    echo "❌ AdsPower API key not found. Run: agent-vault set adspower-api-key"
    exit 1
fi

# Get Railway URL
RAILWAY_URL=$(railway domain --quiet)

# Set environment variables via Railway CLI
railway variables set ADSPOWER_API_KEY=$(agent-vault get adspower-api-key --reveal 2>/dev/null)
railway variables set ADSPOWER_BASE_URL=http://77.42.21.134:50325

echo "✅ Secrets deployed to Railway"
```

---

## Migration Guide

### Step 1: Install agent-vault
```bash
npm install -g @botiverse/agent-vault
```

### Step 2: Initialize vault
```bash
agent-vault init
```

### Step 3: Import existing secrets
```bash
# From .env file
agent-vault import .env

# Manual import
agent-vault set adspower-api-key --desc "AdsPower V2 API key"
# Paste: 746feb8ab409fbb27a0377a864279e6c000f879a7a0e5329
```

### Step 4: Update config files
Replace real values with placeholders:

**Before:**
```yaml
apiKey: 746feb8ab409fbb27a0377a864279e6c000f879a7a0e5329
```

**After:**
```yaml
apiKey: <agent-vault:adspower-api-key>
```

### Step 5: Use agent-vault commands
Replace `cat` with `agent-vault read` for secret-bearing files.

---

## Benefits

✅ **Security**: Secrets never transmitted to LLM providers
✅ **Convenience**: One vault for all projects
✅ **Version Control**: No risk of committing secrets
✅ **Agent Safety**: TTY protection prevents agents from accessing secrets
✅ **Auto-Redaction**: High-entropy strings automatically detected
✅ **Encrypted**: AES-256-GCM encryption at rest

---

## File Structure

```
~/.agent-vault/
├── vault.json      # Encrypted secrets
└── vault.key       # Master encryption key

project/
├── config/
│   ├── secure.yaml.example  # Template with placeholders
│   └── secure.yaml          # Actual config (uses placeholders)
├── lib/
│   └── config-loader.js     # Loads config via agent-vault
└── scripts/
    └── deploy-secrets.sh     # Deployment with vault
```

---

## Next Steps

1. Run `agent-vault init`
2. Run `agent-vault set adspower-api-key` with your API key
3. Update config files to use placeholders
4. Modify code to use `agent-vault read` when loading configs
5. Never commit real secrets to git again!

---

**Status:** agent-vault installed and ready to use!

Run the setup commands above to secure your Gmail Warmup V2 secrets.
