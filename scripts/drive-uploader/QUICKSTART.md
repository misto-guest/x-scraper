# Drive Uploader - Quick Reference

## ✅ Bug Fixed!

Clear error messages now show when no Shared Drive ID is provided.

## 🚀 Quick Start (3 steps)

### 1. Create Shared Drive
- Go to: https://drive.google.com/drive/u/0/folders/shared-drives
- Click "New" → "Shared Drive"
- Name it: "OpenClaw Files"

### 2. Add Service Account
- In the Shared Drive, click "Share"
- Add: `openclaw-drive-service-account@openclaw-file-upload.iam.gserviceaccount.com`
- Role: "Contributor"

### 3. Get Drive ID
- Look at the URL: `https://drive.google.com/drive/folders/<DRIVE_ID>`
- Copy the ID (e.g., `0AEd3EhGff9SaUk9PVA`)

## 📤 Usage

### Option A: Use --drive flag
```bash
cd ~/clawd-dmitry/scripts/drive-uploader

node upload.js --drive <DRIVE_ID> /path/to/file.zip
node upload.js --drive <DRIVE_ID> list
```

### Option B: Set environment variable (recommended)
```bash
# Add to ~/.zshrc
export DRIVE_UPLOADER_DRIVE_ID="<YOUR_DRIVE_ID>"

# Then use simply
node upload.js /path/to/file.zip
node upload.js list
```

## ✨ What You Get

After uploading:
```
📤 Uploading: archive.zip (15.23 MB)
✅ Upload complete!
   File ID: 1abc123...
   Size: 15.23 MB

🔗 Shareable link: https://drive.google.com/file/d/1abc123.../view
📥 Direct download: https://drive.google.com/uc?export=download&id=1abc123...
```

## 🔧 SEO Automation Example

```bash
# Upload monthly backlink export
node upload.js --drive <DRIVE_ID> \
  ~/clawd-dmitry/seo-backlinks-search/results/monthly-export.zip

# Returns shareable link that you can post to Telegram
```

## 📚 Full Documentation

- `README.md` - Complete documentation
- `SETUP.md` - Detailed setup guide
- `SUMMARY.md` - Project overview

## 🐛 Troubleshooting

**"No Shared Drive ID specified"**
→ Create a Shared Drive and use `--drive <DRIVE_ID>`

**"Not authorized to access this drive"**
→ Add service account email as member in Shared Drive settings

**"File not found"**
→ Check the file path is correct

Need help? Check `SETUP.md` for detailed instructions.
