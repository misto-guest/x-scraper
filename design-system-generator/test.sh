#!/bin/bash
# Test script for Design System Generator

echo "🧪 Testing Design System Generator"
echo "===================================="
echo ""

# Test 1: List themes
echo "Test 1: List all themes"
node bin/cli.js list
echo ""

# Test 2: Generate brutalist theme
echo "Test 2: Generate Brutalist theme"
node bin/cli.js generate brutalist
echo ""

# Test 3: Generate luxury theme
echo "Test 3: Generate Luxury theme"
node bin/cli.js generate luxury
echo ""

# Test 4: Generate playful theme
echo "Test 4: Generate Playful theme"
node bin/cli.js generate playful
echo ""

# Verify outputs
echo "Verification: Checking generated files..."
for theme in brutalist luxury playful; do
  echo ""
  echo "📁 $theme-design-system:"
  if [ -d "../outputs/$theme-design-system" ]; then
    ls -la "../outputs/$theme-design-system" | grep -E "\.(css|js|html|md)$"
  fi
done

echo ""
echo "✅ All tests completed!"
echo ""
echo "📝 To view the generated design systems:"
echo "   open ../outputs/brutalist-design-system/preview.html"
echo "   open ../outputs/luxury-design-system/preview.html"
echo "   open ../outputs/playful-design-system/preview.html"
