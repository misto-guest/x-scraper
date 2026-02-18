#!/bin/bash
# Test script to verify error handling

echo "🧪 Testing Drive Uploader error handling..."
echo ""

cd /Users/northsea/clawd-dmitry/scripts/drive-uploader

echo "Test 1: No arguments (should show help)"
node upload.js
echo ""
echo "---"
echo ""

echo "Test 2: Upload without --drive flag (should show clear error)"
node upload.js test-upload.txt 2>&1 | head -20
echo ""
echo "---"
echo ""

echo "Test 3: Help flag (should show usage)"
node upload.js --help | head -15
echo ""

echo "✅ Error handling tests complete!"
echo ""
echo "Next: Create a Shared Drive and test actual upload"
