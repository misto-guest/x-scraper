const { google } = require('googleapis');
const fs = require('fs');
const path = require('path');

const SERVICE_ACCOUNT_FILE = './service-account.json';
const FILE_PATH = './query-manager.zip';

async function uploadFile() {
  try {
    const auth = new google.auth.GoogleAuth({
      keyFile: SERVICE_ACCOUNT_FILE,
      scopes: ['https://www.googleapis.com/auth/drive.file'],
    });

    const drive = google.drive({ version: 'v3', auth });

    const fileMetadata = {
      name: path.basename(FILE_PATH),
    };
    const media = {
      mimeType: 'application/zip',
      body: fs.createReadStream(FILE_PATH),
    };

    const response = await drive.files.create({
      resource: fileMetadata,
      media: media,
      fields: 'id, webViewLink',
    });

    console.log('File uploaded successfully!');
    console.log('File ID:', response.data.id);
    console.log('File view link:', response.data.webViewLink);

  } catch (error) {
    console.error('Error uploading file:', error.message);
  }
}

uploadFile();
