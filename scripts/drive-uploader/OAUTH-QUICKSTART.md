# Quick Start: OAuth Drive Uploader

**Switch to OAuth** — Upload to your personal Google Drive folder!

## What Changed

Service accounts can't upload to My Drive folders. **OAuth solves this** by using your personal Google account.

## 5-Minute Setup

### 1. Create OAuth Credentials

- Go to: https://console.cloud.google.com/apis/credentials
- Project: **openclaw-file-upload**
- Click: **Create Credentials** → **OAuth client ID**
- Type: **Desktop app**
- Download the JSON file

### 2. Save Credentials

```bash
mv ~/Downloads/client_*.json ~/clawd-dmitry/scripts/drive-uploader/oauth-credentials.json
```

### 3. Upload & Authorize

```bash
cd ~/clawd-dmitry/scripts/drive-uploader
node oauth-upload.js --folder 1Q_wBbz1a-m0ZFlElQv9JJ4lGgZinuZBh test-upload.txt
```

A URL will appear — open it, sign in, grant permissions. Token saves automatically for future uploads.

## That's It!

Now you can upload to your folder:
```bash
node oauth-upload.js /path/to/file.zip
node oauth-upload.js list
```

Set an alias for convenience:
```bash
# In ~/.zshrc
export DRIVE_UPLOADER_FOLDER_ID="1Q_wBbz1a-m0ZFlElQv9JJ4lGgZinuZBh"
alias drive-upload='node /Users/northsea/clawd-dmitry/scripts/drive-uploader/oauth-upload.js'

source ~/.zshrc

# Use simply
drive-upload ./file.zip
```

Full guide: `SETUP-OAUTH.md`
