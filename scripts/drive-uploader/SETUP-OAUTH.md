# OAuth Setup Guide for Drive Uploader

Service accounts can't upload to My Drive folders. **Use OAuth to upload to your personal Google Drive.**

## What is OAuth?

OAuth lets the uploader act as **you** (your personal Google account) instead of a service account. This means:
- ✅ Full access to your Drive
- ✅ Can upload to any folder you own
- ✅ One-time authorization (stores token)

## Setup (5 minutes)

### Step 1: Create OAuth Credentials

1. Go to: https://console.cloud.google.com/apis/credentials
2. Select project: **openclaw-file-upload**
3. Click **"Create Credentials"** → **"OAuth client ID"**
4. If you see a consent screen prompt:
   - Click "Configure Consent Screen"
   - Choose "External" → "Create"
   - Add app name: "Drive Uploader"
   - Add your email as developer contact
   - Scopes: Add `https://www.googleapis.com/auth/drive.file`
   - Test users: Add your email
   - Save and go back to create credentials
5. **Application type:** Desktop app
6. **Name:** Drive Uploader
7. Click **"Create"**
8. **Download the JSON file**

### Step 2: Save Credentials

```bash
# Move the downloaded JSON to the uploader directory
mv ~/Downloads/client_*.json ~/clawd-dmitry/scripts/drive-uploader/oauth-credentials.json
```

### Step 3: Test Upload

```bash
cd ~/clawd-dmitry/scripts/drive-uploader

# Test with your existing folder
node oauth-upload.js --folder 1Q_wBbz1a-m0ZFlElQv9JJ4lGgZinuZBh test-upload.txt
```

### Step 4: Authorize

1. A URL will be printed in the terminal
2. Open it in your browser
3. Sign in with your Google account
4. Grant permissions
5. You'll be redirected to localhost (authorization success)
6. Return to terminal — upload proceeds

**Token is saved for future use!** No need to re-authorize.

## Usage

### After setup:
```bash
# Set your folder ID (optional, add to ~/.zshrc)
export DRIVE_UPLOADER_FOLDER_ID="1Q_wBbz1a-m0ZFlElQv9JJ4lGgZinuZBh"

# Upload files
node oauth-upload.js /path/to/file.zip

# List files
node oauth-upload.js list
```

### Add to shell (optional):
```bash
# In ~/.zshrc
export DRIVE_UPLOADER_FOLDER_ID="1Q_wBbz1a-m0ZFlElQv9JJ4lGgZinuZBh"
alias drive-upload='node /Users/northsea/clawd-dmitry/scripts/drive-uploader/oauth-upload.js'

# Then use simply
drive-upload ./file.zip
drive-upload list
```

## SEO Automation Example

```bash
# Upload monthly backlink export
node oauth-upload.js \
  ~/clawd-dmitry/seo-backlinks-search/results/monthly-export.zip

# Returns shareable link for Telegram
```

## Security

- Token is stored locally (only on your Mac mini)
- Token never leaves your machine
- Can be revoked anytime from: https://myaccount.google.com/permissions
- Scopes limited to `drive.file` (access only to files this app creates)

## Troubleshooting

**"OAuth credentials not found"**
→ Download credentials JSON from Google Cloud Console and save as `oauth-credentials.json`

**"Authorization required" / URL printed**
→ Open the URL in browser and authorize

**"Token expired"**
→ Token auto-refreshes. If it fails, delete `oauth-token.json` and re-authorize

**"consent screen required"**
→ You need to configure OAuth consent screen (see Step 1)

**Upload fails with 403**
→ Check that folder ID is correct and you have access

## Files Created

```
~/clawd-dmitry/scripts/drive-uploader/
├── oauth-upload.js          # OAuth uploader
├── oauth-credentials.json   # OAuth client credentials (you download)
├── oauth-token.json         # Saved auth token (auto-created)
└── test-upload.txt          # Test file
```

## Why OAuth Over Service Account?

| Feature | Service Account | OAuth (Your Account) |
|---------|----------------|---------------------|
| Upload to My Drive | ❌ No quota | ✅ Works |
| Upload to Shared Drive | ✅ Works | ✅ Works |
| Setup | JSON key file | One-time browser auth |
| Authorization | None required | One-time setup |
| Storage | Google's (0 MB) | Your Google Drive (15 GB+) |

For your use case (uploading to personal folder), **OAuth is the right choice**.
