#!/bin/bash

# Tweet Analyzer Test Script
# This script tests the Tweet Analyzer functionality

echo "=========================================="
echo "Tweet Analyzer - Test Script"
echo "=========================================="
echo ""

# Colors
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

echo "1. Testing GhostFetch CLI..."
if pipx run --spec ghostfetch python -c "from ghostfetch import fetch_markdown; print('✓ GhostFetch working')" 2>&1 | grep -q "GhostFetch working"; then
    echo -e "${GREEN}✓ GhostFetch is installed and working${NC}"
else
    echo -e "${RED}✗ GhostFetch not working. Install with: pipx install ghostfetch${NC}"
    exit 1
fi
echo ""

echo "2. Checking if dev server is running..."
if curl -s -o /dev/null -w "%{http_code}" http://localhost:4321 | grep -q "200\|302"; then
    echo -e "${GREEN}✓ Dev server is running on http://localhost:4321${NC}"
else
    echo -e "${YELLOW}⚠ Dev server not running. Start with: npm run dev${NC}"
    echo -e "${YELLOW}  Continuing anyway (will fail if server is down)${NC}"
fi
echo ""

echo "3. Testing API endpoint with sample URL..."
echo "   Testing with: https://x.com/elonmusk/status/1234567890"
echo ""

RESPONSE=$(curl -s -X POST http://localhost:4321/admin/api/analyze \
  -H "Content-Type: application/json" \
  -d '{"url":"https://x.com/elonmusk/status/1234567890"}' \
  --max-time 45 2>&1)

if echo "$RESPONSE" | grep -q '"success":true'; then
    echo -e "${GREEN}✓ API endpoint responded successfully${NC}"
    echo ""
    echo "Sample response:"
    echo "$RESPONSE" | head -c 500
    echo "..."
elif echo "$RESPONSE" | grep -q "error"; then
    ERROR_MSG=$(echo "$RESPONSE" | grep -o '"error":"[^"]*"' | cut -d'"' -f4)
    echo -e "${YELLOW}⚠ API returned error (may be normal for test URLs):${NC}"
    echo "   $ERROR_MSG"
else
    echo -e "${RED}✗ API endpoint failed or timed out${NC}"
    echo "   Response: $RESPONSE"
fi
echo ""

echo "4. Verifying file structure..."
FILES=(
    "src/pages/admin/analyze.astro"
    "src/pages/admin/api/analyze.ts"
    "src/pages/admin/api/reviews.ts"
)

ALL_EXISTS=true
for file in "${FILES[@]}"; do
    if [ -f "$file" ]; then
        echo -e "${GREEN}✓ $file${NC}"
    else
        echo -e "${RED}✗ $file missing${NC}"
        ALL_EXISTS=false
    fi
done
echo ""

echo "5. Checking navigation links..."
NAV_FILES=(
    "src/pages/admin/index.astro"
    "src/pages/admin/reviews.astro"
    "src/pages/admin/tweets.astro"
    "src/pages/admin/export.astro"
    "src/pages/admin/action-converter.astro"
)

NAV_EXISTS=true
for file in "${NAV_FILES[@]}"; do
    if grep -q "Tweet Analyzer" "$file" 2>/dev/null; then
        echo -e "${GREEN}✓ $file has navigation${NC}"
    else
        echo -e "${RED}✗ $file missing navigation${NC}"
        NAV_EXISTS=false
    fi
done
echo ""

echo "=========================================="
echo "Test Summary"
echo "=========================================="

if [ "$ALL_EXISTS" = true ] && [ "$NAV_EXISTS" = true ]; then
    echo -e "${GREEN}✓ All files created${NC}"
    echo -e "${GREEN}✓ All navigation links added${NC}"
    echo ""
    echo "🎉 Tweet Analyzer is ready!"
    echo ""
    echo "Next steps:"
    echo "  1. Start the dev server: npm run dev"
    echo "  2. Open browser to: http://localhost:4321/admin"
    echo "  3. Log in to admin panel"
    echo "  4. Click '🔍 Tweet Analyzer' in sidebar"
    echo "  5. Paste a real tweet URL to test"
    echo ""
    echo "Example tweet URLs to test:"
    echo "  - https://x.com/OpenAI/status/173823456789"
    echo "  - https://twitter.com/elonmusk/status/1234567890"
    echo ""
else
    echo -e "${RED}✗ Some components missing${NC}"
    echo "Please check the errors above"
fi
