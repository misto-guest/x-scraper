#!/usr/bin/env node

import { GoogleAuth } from 'google-auth-library';
import { drive_v3, google } from 'googleapis';
import fs from 'fs';
import path from 'path';
import mime from 'mime-types';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const SERVICE_ACCOUNT_PATH = path.join(__dirname, 'service-account.json');

// Check if service account file exists
if (!fs.existsSync(SERVICE_ACCOUNT_PATH)) {
  console.error('❌ Service account file not found!');
  console.error(`Expected location: ${SERVICE_ACCOUNT_PATH}`);
  console.error('\nPlease save your Google Cloud service account JSON as:');
  console.error('  ~/clawd-dmitry/scripts/drive-uploader/service-account.json');
  process.exit(1);
}

// Load service account credentials
const credentials = JSON.parse(fs.readFileSync(SERVICE_ACCOUNT_PATH, 'utf-8'));

// Authenticate
const auth = new GoogleAuth({
  credentials: credentials,
  scopes: ['https://www.googleapis.com/auth/drive']
});

// Initialize Drive API
const drive = google.drive({ version: 'v3', auth });

/**
 * Upload a file to Google Drive
 * @param {string} filePath - Path to file to upload
 * @param {object} options - Upload options
 * @returns {Promise<object>} - File metadata with shareable link
 */
async function uploadFile(filePath, options = {}) {
  const {
    folderName = 'OpenClaw-Uploads',
    parentFolderId = null
  } = options;

  // Check file exists
  if (!fs.existsSync(filePath)) {
    throw new Error(`File not found: ${filePath}`);
  }

  // Check file size (100 MB limit)
  const stats = fs.statSync(filePath);
  const maxSize = 100 * 1024 * 1024; // 100 MB
  if (stats.size > maxSize) {
    throw new Error(`File too large: ${(stats.size / 1024 / 1024).toFixed(2)} MB (max: 100 MB)`);
  }

  const fileName = path.basename(filePath);
  const mimeType = mime.lookup(filePath) || 'application/octet-stream';

  console.log(`📤 Uploading: ${fileName} (${(stats.size / 1024 / 1024).toFixed(2)} MB)`);

  try {
    // If parent folder is provided, upload directly to it
    // Otherwise, find or create folder in root
    let folderId = parentFolderId;
    
    if (!folderId) {
      folderId = await findOrCreateFolder(folderName);
    }

    // Upload file
    const fileMetadata = {
      name: fileName,
      parents: [folderId]
    };

    const media = {
      mimeType: mimeType,
      body: fs.createReadStream(filePath)
    };

    const response = await drive.files.create({
      resource: fileMetadata,
      media: media,
      fields: 'id, name, webViewLink, size'
    });

    const file = response.data;

    // Make file shareable (anyone with link can view)
    await drive.permissions.create({
      fileId: file.id,
      requestBody: {
        role: 'reader',
        type: 'anyone'
      }
    });

    console.log(`✅ Upload complete!`);
    console.log(`   File ID: ${file.id}`);
    console.log(`   Size: ${(file.size / 1024 / 1024).toFixed(2)} MB`);

    return {
      id: file.id,
      name: file.name,
      size: file.size,
      url: file.webViewLink,
      directDownload: `https://drive.google.com/uc?export=download&id=${file.id}`
    };

  } catch (error) {
    if (error.code === 401) {
      throw new Error('Authentication failed. Check service account permissions.');
    }
    throw error;
  }
}

/**
 * Find or create a folder in Google Drive
 * @param {string} folderName - Name of folder
 * @returns {Promise<string>} - Folder ID
 */
async function findOrCreateFolder(folderName, parentFolderId = null) {
  try {
    // Search for existing folder
    const searchOptions = {
      q: `name='${folderName}' and mimeType='application/vnd.google-apps.folder' and trashed=false`,
      spaces: 'drive',
      fields: 'files(id, name)',
      supportsAllDrives: true
    };

    const search = await drive.files.list(searchOptions);

    if (search.data.files.length > 0) {
      return search.data.files[0].id;
    }

    // Create new folder
    const folderOptions = {
      resource: {
        name: folderName,
        mimeType: 'application/vnd.google-apps.folder'
      },
      fields: 'id',
      supportsAllDrives: true
    };

    const folder = await drive.files.create(folderOptions);

    return folder.data.id;

  } catch (error) {
    throw new Error(`Failed to find/create folder: ${error.message}`);
  }
}

/**
 * List files in the uploads folder
 */
async function listUploads(parentFolderId = null) {
  try {
    if (!parentFolderId) {
      throw new Error('No folder ID specified. Use --folder <FOLDER_ID> list');
    }

    const listOptions = {
      q: `'${parentFolderId}' in parents and trashed=false`,
      orderBy: 'createdTime desc',
      fields: 'files(id, name, size, createdTime, webViewLink)',
      supportsAllDrives: true,
      includeItemsFromAllDrives: true
    };

    const response = await drive.files.list(listOptions);

    return response.data.files.map(f => ({
      name: f.name,
      size: f.size ? `${(f.size / 1024 / 1024).toFixed(2)} MB` : 'N/A',
      created: new Date(f.createdTime).toLocaleString(),
      url: f.webViewLink
    }));

  } catch (error) {
    throw new Error(`Failed to list uploads: ${error.message}`);
  }
}

// CLI interface
async function main() {
  const args = process.argv.slice(2);

  // Parse options
  const options = {};
  let fileArg = null;

  // Check for environment variables (FOLDER_ID takes precedence)
  if (process.env.DRIVE_UPLOADER_FOLDER_ID) {
    options.parentFolderId = process.env.DRIVE_UPLOADER_FOLDER_ID;
  } else if (process.env.DRIVE_UPLOADER_DRIVE_ID) {
    options.parentFolderId = process.env.DRIVE_UPLOADER_DRIVE_ID;
  }

  for (let i = 0; i < args.length; i++) {
    if (args[i] === '--folder' && args[i + 1]) {
      options.parentFolderId = args[i + 1];
      i++;
    } else if (args[i] === '--drive' && args[i + 1]) {
      options.parentFolderId = args[i + 1];
      i++;
    } else if (!args[i].startsWith('--')) {
      fileArg = args[i];
    }
  }

  if (args.length === 0 || args.includes('--help') || args.includes('-h')) {
    console.log(`
📤 Drive Uploader - Upload files to Google Drive

USAGE:
  drive-upload --folder <FOLDER_ID> <file-path>   Upload a file
  drive-upload --folder <FOLDER_ID> list          List recent uploads

Or set DRIVE_UPLOADER_FOLDER_ID environment variable to skip --folder flag.

Examples:
  export DRIVE_UPLOADER_FOLDER_ID="1Q_wBbz1a-m0ZFlElQv9JJ4lGgZinuZBh"
  drive-upload ./archive.zip
  drive-upload ~/Documents/report.pdf
  drive-upload list

Setup:
  1. Create a folder in Google Drive
  2. Share it with: openclaw-drive-service-account@openclaw-file-upload.iam.gserviceaccount.com
  3. Copy folder ID from URL and use with --folder flag

Configuration:
  Service account: ~/clawd-dmitry/scripts/drive-uploader/service-account.json
  Upload folder: OpenClaw-Uploads (auto-created if using parent folder)
  Max file size: 100 MB

See SETUP.md for detailed setup instructions.
    `);
    return;
  }

  if (fileArg === 'list') {
    const files = await listUploads(options.parentFolderId);
    if (files.length === 0) {
      console.log('📭 No uploads yet');
    } else {
      console.log(`\n📁 Recent uploads (${files.length}):\n`);
      files.forEach((f, i) => {
        console.log(`${i + 1}. ${f.name}`);
        console.log(`   Size: ${f.size}`);
        console.log(`   Created: ${f.created}`);
        console.log(`   URL: ${f.url}\n`);
      });
    }
    return;
  }

  if (!fileArg) {
    console.error('❌ No file specified');
    console.error('Use: drive-upload <file-path>');
    console.error('Run: drive-upload --help');
    process.exit(1);
  }

  // Check if folder ID is available
  if (!options.parentFolderId && fileArg !== 'list') {
    console.error('\n❌ No folder ID specified!\n');
    console.error('You need to provide a folder ID where files will be uploaded.');
    console.error('\nQuick setup:');
    console.error('  1. Create a folder in Google Drive');
    console.error('  2. Share it with: openclaw-drive-service-account@openclaw-file-upload.iam.gserviceaccount.com');
    console.error('  3. Copy the folder ID from the URL');
    console.error('  4. Use: drive-upload --folder <FOLDER_ID> <file>');
    console.error('\nOr set environment variable:');
    console.error('  export DRIVE_UPLOADER_FOLDER_ID="<folder-id>"\n');
    console.error('See SETUP.md for detailed instructions.\n');
    process.exit(1);
  }

  // Upload file
  const filePath = fileArg.replace(/^~/, process.env.HOME);
  const absolutePath = path.resolve(filePath);

  try {
    const result = await uploadFile(absolutePath, options);
    console.log(`\n🔗 Shareable link: ${result.url}`);
    console.log(`📥 Direct download: ${result.directDownload}`);
  } catch (error) {
    console.error(`\n❌ Upload failed: ${error.message}`);
    process.exit(1);
  }
}

main();
