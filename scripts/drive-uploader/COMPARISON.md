# Drive Uploader - OAuth vs Service Account

## Quick Decision Guide

**Need to upload to My Drive folder?** → Use **OAuth** ✅
**Can use Shared Drive?** → Use **Service Account** ✅

## Comparison

|  | OAuth (Personal Account) | Service Account |
|---|---|---|
| **Upload to My Drive** | ✅ Yes | ❌ No (0 MB quota) |
| **Upload to Shared Drive** | ✅ Yes | ✅ Yes |
| **Setup** | One-time browser auth (5 min) | JSON key file |
| **Authorization** | Token stored locally | No auth needed |
| **Best for** | Personal folders, automation | Shared drives, service integration |

## What We Built

### 1. Service Account Version (`upload.js`)
- ❌ Cannot upload to My Drive folders
- ✅ Works with Shared Drives
- File: `~/clawd-dmitry/scripts/drive-uploader/upload.js`
- Creds: `service-account.json`

### 2. OAuth Version (`oauth-upload.js`) ⭐
- ✅ Uploads to your personal Drive
- ✅ Works with your existing folder
- ✅ One-time authorization
- File: `~/clawd-dmitry/scripts/drive-uploader/oauth-upload.js`
- Creds: `oauth-credentials.json` (you download)

## Recommendation

**Use OAuth** for your use case:
- You already have the folder set up
- Service accounts can't upload to My Drive
- OAuth is simple (one-time browser auth)
- Token persists for future uploads

## Next Steps

1. **Create OAuth credentials** (2 min): https://console.cloud.google.com/apis/credentials
2. **Download JSON** and save as `oauth-credentials.json`
3. **Test upload:** `node oauth-upload.js --folder 1Q_wBbz1a-m0ZFlElQv9JJ4lGgZinuZBh test-upload.txt`
4. **Done!** Token saves for future uploads

Full instructions: `SETUP-OAUTH.md`

## Your Folder

Your existing folder is ready:
- **Name:** OpenClaw Drive Uploads
- **ID:** `1Q_wBbz1a-m0ZFlElQv9JJ4lGgZinuZBh`
- **URL:** https://drive.google.com/drive/u/0/folders/1Q_wBbz1a-m0ZFlElQv9JJ4lGgZinuZBh

No changes needed — OAuth uploads to this folder directly.
