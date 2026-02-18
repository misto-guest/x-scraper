# Quick Start: Setting Up Shared Drive for Drive Uploader

Service accounts need a Shared Drive to upload files. Here's how to set it up in 2 minutes:

## Step 1: Create a Shared Drive

1. Go to: https://drive.google.com/drive/u/0/folders/shared-drives
2. Click **"New"** (top left) → **"Shared Drive"**
3. Name it: **`OpenClaw Files`**
4. Click **"Create"**

## Step 2: Get the Drive ID

After creating, you'll see the URL:
```
https://drive.google.com/drive/folders/0AEd3EhGff9SaUk9PVA
                                    ^^^^^^^^^^^^^^^^^^^^
                                    This is your Drive ID
```

Copy the Drive ID (e.g., `0AEd3EhGff9SaUk9PVA`).

## Step 3: Add Service Account as Member

1. In the Shared Drive, click **"Share"** (top right)
2. Click **"Manage members"**
3. Click **"Add members"**
4. Enter this email:
   ```
   openclaw-drive-service-account@openclaw-file-upload.iam.gserviceaccount.com
   ```
5. Set role: **"Contributor"** (can upload/edit files)
6. Click **"Send"**

## Step 4: Test the Uploader

```bash
cd ~/clawd-dmitry/scripts/drive-uploader

# Test upload
node upload.js --drive YOUR_DRIVE_ID test-upload.txt
```

Replace `YOUR_DRIVE_ID` with the ID from Step 2.

## Step 5: Set Up Convenience Alias (Optional)

Add to `~/.zshrc`:

```bash
# Drive Uploader
export DRIVE_UPLOADER_DRIVE_ID="0AEd3EhGff9SaUk9PVA"
alias drive-upload='node /Users/northsea/clawd-dmitry/scripts/drive-uploader/upload.js'
```

Then:
```bash
source ~/.zshrc

# Now you can use simply:
drive-upload ./file.zip
drive-upload list
```

## That's It!

Your service account can now upload files up to 100 MB to the Shared Drive.

## FAQ

**Q: Why can't I upload to My Drive?**
A: Service accounts have no storage quota. Shared Drives bypass this limitation.

**Q: Is my data private?**
A: Yes. Only you and the service account have access to the Shared Drive. Uploaded files can optionally be made shareable via link.

**Q: Can I use my existing Shared Drive?**
A: Yes! Just add the service account email as a member and use its Drive ID.
