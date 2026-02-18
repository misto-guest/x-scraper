# Drive Uploader - Summary

## ✅ What's Been Created

A simple, production-ready file uploader for Google Drive:

### Files Created
```
~/clawd-dmitry/scripts/drive-uploader/
├── package.json           # Node.js dependencies
├── upload.js              # Main uploader script
├── drive-upload           # Bash wrapper
├── service-account.json   # Google credentials (saved)
├── install.sh             # Installation helper
├── README.md              # Full documentation
├── SETUP.md               # Quick start guide
└── test-upload.txt        # Test file
```

### Features
- ✅ Upload files up to 100 MB
- ✅ Automatic shareable links
- ✅ Shared Drive support (bypasses service account limits)
- ✅ List recent uploads
- ✅ Simple CLI interface
- ✅ Production-ready

## ⚠️ Required Setup (2 minutes)

The uploader needs a **Shared Drive** to work. Service accounts can't upload to My Drive.

### Quick Setup:

1. **Create Shared Drive**
   - Go to: https://drive.google.com/drive/u/0/folders/shared-drives
   - Click "New" → "Shared Drive"
   - Name it: "OpenClaw Files"

2. **Get Drive ID**
   - After creating, copy ID from URL:
   - `https://drive.google.com/drive/folders/<DRIVE_ID>`

3. **Add Service Account**
   - In Shared Drive, click "Share" → "Manage members"
   - Add: `openclaw-drive-service-account@openclaw-file-upload.iam.gserviceaccount.com`
   - Role: "Contributor"

4. **Test**
   ```bash
   cd ~/clawd-dmitry/scripts/drive-uploader
   node upload.js --drive <DRIVE_ID> test-upload.txt
   ```

Full instructions: `SETUP.md`

## 🚀 Usage Examples

### After setup:
```bash
cd ~/clawd-dmitry/scripts/drive-uploader

# Upload file
node upload.js --drive <DRIVE_ID> /path/to/file.zip

# List uploads
node upload.js --drive <DRIVE_ID> list

# Get help
node upload.js --help
```

### For SEO automation:
```bash
# Upload monthly export
node upload.js --drive <DRIVE_ID> \
  ~/clawd-dmitry/seo-backlinks-search/results/monthly-export.zip

# Upload master database
node upload.js --drive <DRIVE_ID> \
  ~/clawd-dmitry/seo-backlinks-search/data/master-urls.json
```

## 📋 Next Steps

1. Create the Shared Drive (2 min)
2. Test with test file
3. Add alias to `~/.zshrc` for convenience
4. Integrate into monthly automation cron

## 🔧 Dependencies Installed
- googleapis@144.0.0
- mime-types@2.1.35
- google-auth-library (via googleapis)

All set! Just create the Shared Drive and you're ready to upload.
