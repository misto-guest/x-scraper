#!/bin/bash
# Drive Uploader Installation Script

echo "📦 Installing Drive Uploader..."

# Check if node is available
if ! command -v node &> /dev/null; then
    echo "❌ Node.js not found. Please install Node.js first."
    exit 1
fi

# Install dependencies
echo "📥 Installing dependencies..."
cd /Users/northsea/clawd-dmitry/scripts/drive-uploader
npm install --silent

# Make scripts executable
chmod +x upload.js drive-upload

echo "✅ Installation complete!"
echo ""
echo "🚀 To use from anywhere, add this to your ~/.zshrc:"
echo ""
echo "   # Drive Uploader"
echo "   alias drive-upload='bash /Users/northsea/clawd-dmitry/scripts/drive-uploader/drive-upload'"
echo ""
echo "Then run: source ~/.zshrc"
echo ""
echo "Or use directly:"
echo "   bash /Users/northsea/clawd-dmitry/scripts/drive-uploader/drive-upload <file>"
