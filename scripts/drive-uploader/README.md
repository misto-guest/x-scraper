# Drive Uploader

Simple CLI tool to upload files to Google Drive from OpenClaw (Mac mini).

## Features

- ✅ Upload files up to 100 MB
- 🔗 Automatic shareable link generation
- 📁 Auto-organized in "OpenClaw-Uploads" folder
- 📋 List recent uploads
- 🔐 Service account authentication (no OAuth needed)
- 🏢 Shared Drive support (bypasses service account storage limits)

## Installation

```bash
cd ~/clawd-dmitry/scripts/drive-uploader
npm install
```

Add to PATH (optional, in `~/.zshrc`):
```bash
alias drive-upload='node /Users/northsea/clawd-dmitry/scripts/drive-uploader/upload.js'
```

## Usage

### Upload a file
```bash
# Basic upload (requires Shared Drive ID)
drive-upload --drive <DRIVE_ID> /path/to/file.zip
```

Output:
```
📤 Uploading: archive.zip (15.23 MB)
✅ Upload complete!
   File ID: 1abc123...
   Size: 15.23 MB

🔗 Shareable link: https://drive.google.com/file/d/1abc123.../view
📥 Direct download: https://drive.google.com/uc?export=download&id=1abc123...
```

### List recent uploads
```bash
drive-upload --drive <DRIVE_ID> list
```

### Help
```bash
drive-upload --help
```

## ⚠️ Important: Shared Drive Setup

Service accounts **cannot upload to My Drive** (no storage quota). You **must use a Shared Drive**.

### Creating a Shared Drive

1. Go to: https://drive.google.com/drive/u/0/folders/shared-drives
2. Click "New" → "Shared Drive"
3. Name it: `OpenClaw Files` (or any name)
4. Click "Create"

### Adding Service Account to Shared Drive

1. Open the Shared Drive
2. Click "Share" → copy the **Drive ID** from URL:
   - URL format: `https://drive.google.com/drive/folders/<DRIVE_ID>`
   - Example: `0AEd3EhGff9SaUk9PVA`
3. Click "Manage members" → Add members
4. Enter service account email:
   - `openclaw-drive-service-account@openclaw-file-upload.iam.gserviceaccount.com`
5. Set role: "Contributor" or "Manager"
6. Click "Send"

### Using the Drive ID

Once the service account is added, use the Drive ID:
```bash
drive-upload --drive 0AEd3EhGff9SaUk9PVA ./file.zip
```

You can save the Drive ID in an environment variable:
```bash
# In ~/.zshrc
export DRIVE_UPLOADER_DRIVE_ID="0AEd3EhGff9SaUk9PVA"

# Then use simply
drive-upload ./file.zip  # Will read from env var
```

## Configuration

- **Service account:** `~/clawd-dmitry/scripts/drive-uploader/service-account.json`
- **Upload folder:** `OpenClaw-Uploads` (auto-created in Shared Drive)
- **Max file size:** 100 MB
- **Permissions:** Anyone with link can view (auto-set for non-Shared Drive files)

## Examples for SEO Automation

```bash
# Upload monthly backlink export
drive-upload --drive 0AEd3EhGff9SaUk9PVA \\
  /Users/northsea/clawd-dmitry/seo-backlinks-search/results/monthly-export.zip

# Upload master database
drive-upload --drive 0AEd3EhGff9SaUk9PVA \\
  /Users/northsea/clawd-dmitry/seo-backlinks-search/data/master-urls.json
```

## Troubleshooting

**"Service Accounts do not have storage quota"**
- You're trying to upload to My Drive
- **Solution:** Use a Shared Drive with `--drive <DRIVE_ID>`

**"Not authorized to access this drive"**
- Service account isn't a member of the Shared Drive
- **Solution:** Add the service account email as a member in Shared Drive settings

**File not found / Authentication failed**
- Verify `service-account.json` exists and is valid
- Check that Drive API is enabled in Google Cloud Console

**Upload fails**
- Check internet connection
- Verify file path is correct
- Ensure file isn't open in another application
