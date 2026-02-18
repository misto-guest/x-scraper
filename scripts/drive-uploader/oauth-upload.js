#!/usr/bin/env node

/**
 * OAuth-based Google Drive Uploader
 * Uploads to your personal Google Drive using OAuth2
 */

import { google } from 'googleapis';
import fs from 'fs';
import path from 'path';
import http from 'http';
import mime from 'mime-types';
import { fileURLToPath } from 'url';
import { readFile } from 'fs/promises';

const __dirname = path.dirname(fileURLToPath(import.meta.filename));
const TOKEN_PATH = path.join(__dirname, 'oauth-token.json');
const CREDENTIALS_PATH = path.join(__dirname, 'oauth-credentials.json');

// OAuth2 configuration from your Google Cloud Console
// You need to create OAuth 2.0 credentials (Desktop app)
const SCOPES = ['https://www.googleapis.com/auth/drive.file'];

/**
 * Load or request OAuth2 credentials
 */
async function getCredentials() {
  if (fs.existsSync(CREDENTIALS_PATH)) {
    return JSON.parse(fs.readFileSync(CREDENTIALS_PATH, 'utf-8'));
  }
  
  console.error('\n❌ OAuth credentials not found!');
  console.error('\nTo set up OAuth credentials:');
  console.error('1. Go to: https://console.cloud.google.com/apis/credentials');
  console.error('2. Select project: openclaw-file-upload');
  console.error('3. Click "Create Credentials" → "OAuth client ID"');
  console.error('4. Application type: Desktop app');
  console.error('5. Name: "Drive Uploader"');
  console.error('6. Download JSON and save to:');
  console.error(`   ${CREDENTIALS_PATH}\n`);
  throw new Error('OAuth credentials required');
}

/**
 * Load saved token or authorize
 */
async function getAccessToken(oauth2Client) {
  if (fs.existsSync(TOKEN_PATH)) {
    const token = JSON.parse(fs.readFileSync(TOKEN_PATH, 'utf-8'));
    oauth2Client.setCredentials(token);
    
    // Check if token is expired and refresh if needed
    if (token.expiry_date && Date.now() > token.expiry_date) {
      try {
        const { credentials } = await oauth2Client.refreshAccessToken();
        fs.writeFileSync(TOKEN_PATH, JSON.stringify(credentials));
        oauth2Client.setCredentials(credentials);
        console.log('🔄 Token refreshed');
      } catch (err) {
        console.log('⚠️  Token refresh failed, need to re-authorize');
        return false;
      }
    }
    
    return true;
  }
  return false;
}

/**
 * Generate authorization URL and start local server for callback
 */
function authorize(oauth2Client) {
  return new Promise((resolve, reject) => {
    const authUrl = oauth2Client.generateAuthUrl({
      access_type: 'offline',
      scope: SCOPES,
      prompt: 'consent'
    });

    console.log('\n🔐 Authorization required');
    console.log('\n1. Open this URL in your browser:\n');
    console.log(authUrl);
    console.log('\n2. Sign in with your Google account');
    console.log('3. Grant permissions to access Google Drive');
    console.log('4. You will be redirected to a localhost page\n');

    // Start a simple HTTP server to catch the redirect
    const server = http.createServer((req, res) => {
      const url = new URL(req.url, `http://${req.headers.host}`);
      
      if (url.pathname === '/oauth2callback') {
        const code = url.searchParams.get('code');
        
        res.writeHead(200, { 'Content-Type': 'text/html' });
        res.end('<html><body><h1>✅ Authorization successful!</h1><p>You can close this window and return to the terminal.</p></body></html>');
        
        server.close();
        resolve(code);
      }
    });

    server.listen(3000, () => {
      console.log('⏳ Waiting for authorization on http://localhost:3000/oauth2callback');
      console.log('   (The server will close automatically after authorization)\n');
    });

    // Timeout after 5 minutes
    setTimeout(() => {
      server.close();
      reject(new Error('Authorization timed out'));
    }, 5 * 60 * 1000);
  });
}

/**
 * Upload a file to Google Drive
 */
async function uploadFile(filePath, folderId) {
  if (!fs.existsSync(filePath)) {
    throw new Error(`File not found: ${filePath}`);
  }

  const stats = fs.statSync(filePath);
  const maxSize = 100 * 1024 * 1024; // 100 MB
  if (stats.size > maxSize) {
    throw new Error(`File too large: ${(stats.size / 1024 / 1024).toFixed(2)} MB (max: 100 MB)`);
  }

  const fileName = path.basename(filePath);
  const mimeType = mime.lookup(filePath) || 'application/octet-stream';

  console.log(`📤 Uploading: ${fileName} (${(stats.size / 1024 / 1024).toFixed(2)} MB)`);

  const credentials = await getCredentials();
  const { client_secret, client_id, redirect_uris } = credentials.installed || credentials.web;
  
  const oauth2Client = new google.auth.OAuth2(
    client_id,
    client_secret,
    redirect_uris[0] || 'http://localhost:3000/oauth2callback'
  );

  // Check if we have a saved token
  const hasToken = await getAccessToken(oauth2Client);
  
  if (!hasToken) {
    // Need to authorize
    const code = await authorize(oauth2Client);
    const { tokens } = await oauth2Client.getToken(code);
    oauth2Client.setCredentials(tokens);
    fs.writeFileSync(TOKEN_PATH, JSON.stringify(tokens));
    console.log('✅ Token saved for future use\n');
  }

  const drive = google.drive({ version: 'v3', auth: oauth2Client });

  try {
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
      // Token might be expired, delete it and try again
      fs.unlinkSync(TOKEN_PATH);
      console.log('🔄 Token expired, please run again to re-authorize');
    }
    throw error;
  }
}

/**
 * List files in a folder
 */
async function listFiles(folderId) {
  const credentials = await getCredentials();
  const { client_secret, client_id, redirect_uris } = credentials.installed || credentials.web;
  
  const oauth2Client = new google.auth.OAuth2(
    client_id,
    client_secret,
    redirect_uris[0] || 'http://localhost:3000/oauth2callback'
  );

  const hasToken = await getAccessToken(oauth2Client);
  if (!hasToken) {
    throw new Error('Not authorized. Please upload a file first to authorize.');
  }

  const drive = google.drive({ version: 'v3', auth: oauth2Client });

  const response = await drive.files.list({
    q: `'${folderId}' in parents and trashed=false`,
    orderBy: 'createdTime desc',
    fields: 'files(id, name, size, createdTime, webViewLink)'
  });

  return response.data.files.map(f => ({
    name: f.name,
    size: f.size ? `${(f.size / 1024 / 1024).toFixed(2)} MB` : 'N/A',
    created: new Date(f.createdTime).toLocaleString(),
    url: f.webViewLink
  }));
}

// CLI interface
async function main() {
  const args = process.argv.slice(2);

  if (args.length === 0 || args.includes('--help') || args.includes('-h')) {
    console.log(`
📤 Drive Uploader (OAuth) - Upload files to your Google Drive

USAGE:
  node oauth-upload.js --folder <FOLDER_ID> <file-path>   Upload a file
  node oauth-upload.js --folder <FOLDER_ID> list          List files in folder

Or set environment variable:
  export DRIVE_UPLOADER_FOLDER_ID="<folder-id>"

Examples:
  export DRIVE_UPLOADER_FOLDER_ID="1Q_wBbz1a-m0ZFlElQv9JJ4lGgZinuZBh"
  node oauth-upload.js ./archive.zip
  node oauth-upload.js list

Setup:
  1. Create OAuth credentials in Google Cloud Console
  2. Save as oauth-credentials.json in this directory
  3. Run upload command - browser will open for authorization
  4. Token is saved for future use (no need to re-authorize)

Configuration:
  OAuth credentials: ~/clawd-dmitry/scripts/drive-uploader/oauth-credentials.json
  Token file: ~/clawd-dmitry/scripts/drive-uploader/oauth-token.json
  Max file size: 100 MB
    `);
    return;
  }

  // Parse options
  const options = {};
  let fileArg = null;

  if (process.env.DRIVE_UPLOADER_FOLDER_ID) {
    options.folderId = process.env.DRIVE_UPLOADER_FOLDER_ID;
  }

  for (let i = 0; i < args.length; i++) {
    if (args[i] === '--folder' && args[i + 1]) {
      options.folderId = args[i + 1];
      i++;
    } else if (!args[i].startsWith('--')) {
      fileArg = args[i];
    }
  }

  if (!fileArg) {
    console.error('❌ No file specified');
    console.error('Use: node oauth-upload.js --folder <FOLDER_ID> <file>');
    console.error('Run: node oauth-upload.js --help');
    process.exit(1);
  }

  if (!options.folderId) {
    console.error('\n❌ No folder ID specified!\n');
    console.error('Use: --folder <FOLDER_ID>');
    console.error('Or set environment variable: export DRIVE_UPLOADER_FOLDER_ID="<id>"\n');
    process.exit(1);
  }

  if (fileArg === 'list') {
    const files = await listFiles(options.folderId);
    if (files.length === 0) {
      console.log('📭 No files in folder');
    } else {
      console.log(`\n📁 Files in folder (${files.length}):\n`);
      files.forEach((f, i) => {
        console.log(`${i + 1}. ${f.name}`);
        console.log(`   Size: ${f.size}`);
        console.log(`   Created: ${f.created}`);
        console.log(`   URL: ${f.url}\n`);
      });
    }
    return;
  }

  // Upload file
  const filePath = fileArg.replace(/^~/, process.env.HOME);
  const absolutePath = path.resolve(filePath);

  try {
    const result = await uploadFile(absolutePath, options.folderId);
    console.log(`\n🔗 Shareable link: ${result.url}`);
    console.log(`📥 Direct download: ${result.directDownload}`);
  } catch (error) {
    console.error(`\n❌ Upload failed: ${error.message}`);
    if (error.message.includes('credentials')) {
      console.error('\n⚠️  OAuth credentials not found.');
      console.error('See SETUP-OAUTH.md for setup instructions.\n');
    }
    process.exit(1);
  }
}

main();
