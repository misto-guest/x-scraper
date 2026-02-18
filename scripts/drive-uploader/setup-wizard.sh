#!/bin/bash

# Google Drive OAuth Setup Wizard

echo "🔧 Google Drive Uploader - Setup Wizard"
echo "========================================"
echo ""

# Check if credentials already exist
if [ -f "oauth-credentials.json" ]; then
    echo "✅ oauth-credentials.json already exists!"
    echo ""
    read -p "Do you want to re-setup? (y/N): " -n 1 -r
    echo
    if [[ ! $REPLY =~ ^[Yy]$ ]]; then
        echo "Exiting setup."
        exit 0
    fi
fi

echo "📋 Step-by-Step Setup Instructions"
echo ""
echo "You need to create OAuth credentials in Google Cloud Console."
echo "I'll open the page for you and guide you through each step."
echo ""
read -p "Press Enter to continue..."
echo ""

# Step 1: Open Google Cloud Console
echo "🌐 Step 1/4: Open Google Cloud Console"
echo "--------------------------------------"
echo "Opening: https://console.cloud.google.com/apis/credentials"
echo ""
echo "What to do:"
echo "  1. Sign in to your Google account"
echo "  2. Select project: 'openclaw-file-upload'"
echo "  3. At the top, click: 'Create Credentials' → 'OAuth client ID'"
echo ""
read -p "Press Enter when you're on the credentials page..."

# Try to open the URL (macOS only)
if [[ "$OSTYPE" == "darwin"* ]]; then
    open "https://console.cloud.google.com/apis/credentials" 2>/dev/null || \
    echo "⚠️  Couldn't open browser automatically. Please open the URL manually."
fi

echo ""
echo "✋ Wait! If you see a 'Consent Screen' prompt:"
echo "   - Click 'Configure Consent Screen'"
echo "   - Choose 'External'"
echo "   - App name: 'Drive Uploader'"
echo "   - Add your email as developer contact"
echo "   - Add scope: https://www.googleapis.com/auth/drive.file"
echo "   - Save and return to credentials page"
echo ""
read -p "Press Enter after you clicked 'Create Credentials' → 'OAuth client ID'..."

# Step 2: Choose application type
echo ""
echo "📱 Step 2/4: Choose Application Type"
echo "-------------------------------------"
echo "Select: 'Desktop app'"
echo "Name: 'Drive Uploader'"
echo "Click: 'Create'"
echo ""
read -p "Press Enter after clicking 'Create'..."

# Step 3: Download
echo ""
echo "⬇️  Step 3/4: Download Credentials"
echo "-----------------------------------"
echo "1. Click the 'Download JSON' button"
echo "2. The file will be named something like 'client_secret_XXX.json'"
echo "3. Save it to your Downloads folder"
echo ""
read -p "Press Enter after downloading the file..."

# Step 4: Move file
echo ""
echo "📁 Step 4/4: Move File to Correct Location"
echo "------------------------------------------"
echo ""

# Find the downloaded file
CREDENTIALS_FILE=$(find ~/Downloads -name "client_secret_*.json" -o -name "client_*.json" 2>/dev/null | head -n 1)

if [ -n "$CREDENTIALS_FILE" ]; then
    echo "✅ Found: $CREDENTIALS_FILE"
    echo ""
    cp "$CREDENTIALS_FILE" oauth-credentials.json
    echo "✅ Copied to: oauth-credentials.json"
    echo ""

    # Test upload
    echo "🧪 Testing upload..."
    echo ""
    if [ -f "test-upload.txt" ]; then
        node oauth-upload.js --folder 1Q_wBbz1a-m0ZFlElQv9JJ4lGgZinuZBh test-upload.txt
    else
        echo "⚠️  test-upload.txt not found. Creating it..."
        echo "Test file for Drive Uploader" > test-upload.txt
        node oauth-upload.js --folder 1Q_wBbz1a-m0ZFlElQv9JJ4lGgZinuZBh test-upload.txt
    fi

else
    echo "❌ Couldn't find the downloaded file automatically."
    echo ""
    echo "Please move it manually:"
    echo "  mv ~/Downloads/client_secret_XXX.json oauth-credentials.json"
    echo ""
    echo "Replace 'XXX' with the actual filename from Downloads."
    echo "Then run: node oauth-upload.js --folder 1Q_wBbz1a-m0ZFlElQv9JJ4lGgZinuZBh test-upload.txt"
fi

echo ""
echo "✅ Setup complete!"
echo ""
echo "Next time, you can upload files with:"
echo "  node oauth-upload.js /path/to/file.zip"
