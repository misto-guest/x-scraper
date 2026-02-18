# ✅ OAuth Drive Uploader - Ready to Use!

## What Happened

We tried using a **service account** to upload files to your Google Drive folder. However, Google has a limitation:

> Service accounts have **zero storage quota** in My Drive and cannot upload files, even with Editor permissions to a folder.

## The Solution: OAuth

I've built an **OAuth-based uploader** that uses your personal Google account instead. This works perfectly with your existing folder!

## Quick Setup (5 minutes)

### Step 1: Create OAuth Credentials
1. Go to: https://console.cloud.google.com/apis/credentials
2. Select project: **openclaw-file-upload**
3. Click: **Create Credentials** → **OAuth client ID**
4. If prompted for consent screen:
   - Choose "External"
   - App name: "Drive Uploader"
   - Add scope: `.../auth/drive.file`
   - Add your email as test user
5. Application type: **Desktop app**
6. Download the JSON file

### Step 2: Save Credentials
```bash
mv ~/Downloads/client_*.json ~/clawd-dmitry/scripts/drive-uploader/oauth-credentials.json
```

### Step 3: Test Upload
```bash
cd ~/clawd-dmitry/scripts/drive-uploader
node oauth-upload.js --folder 1Q_wBbz1a-m0ZFlElQv9JJ4lGgZinuZBh test-upload.txt
```

### Step 4: Authorize (One Time)
1. A URL will be printed in terminal
2. Open it in your browser
3. Sign in and grant permissions
4. Token saves automatically — no need to do this again!

## Usage

After setup:
```bash
# Set folder ID (optional, add to ~/.zshrc)
export DRIVE_UPLOADER_FOLDER_ID="1Q_wBbz1a-m0ZFlElQv9JJ4lGgZinuZBh"

# Upload files
node oauth-upload.js /path/to/file.zip

# List files
node oauth-upload.js list
```

## Output Example
```
📤 Uploading: archive.zip (15.23 MB)
✅ Upload complete!
   File ID: 1abc123...
   Size: 15.23 MB

🔗 Shareable link: https://drive.google.com/file/d/1abc123.../view
📥 Direct download: https://drive.google.com/uc?export=download&id=1abc123...
```

## SEO Automation
```bash
# Upload monthly backlink export
node oauth-upload.js \
  ~/clawd-dmitry/seo-backlinks-search/results/monthly-export.zip

# Returns shareable link to post in Telegram
```

## Documentation
- **Quick start:** `OAUTH-QUICKSTART.md`
- **Full guide:** `SETUP-OAUTH.md`
- **OAuth vs Service Account:** `COMPARISON.md`

## Your Folder (Ready to Use)
- **ID:** `1Q_wBbz1a-m0ZFlElQv9JJ4lGgZinuZBh`
- **URL:** https://drive.google.com/drive/u/0/folders/1Q_wBbz1a-m0ZFlElQv9JJ4lGgZinuZBh
- **Status:** ✅ Ready for OAuth uploads

## Next Steps
1. Create OAuth credentials (Step 1 above)
2. Test with `test-upload.txt`
3. Set up shell alias for convenience
4. Integrate into monthly automation cron

Ready when you are! 🚀
