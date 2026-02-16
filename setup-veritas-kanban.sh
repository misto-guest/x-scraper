#!/bin/bash
# setup-veritas-kanban.sh
# Setup script for Veritas Kanban integration

echo "=== Veritas Kanban Setup Script ==="
echo ""

# Check if Node.js is installed
if ! command -v node &> /dev/null; then
    echo "❌ Node.js is not installed. Please install Node.js first."
    echo "Visit: https://nodejs.org/"
    exit 1
fi

echo "✅ Node.js version: $(node -v)"
echo "✅ npm version: $(npm -v)"
echo ""

# Check if Veritas Kanban directory exists
VK_DIR="/Users/northsea/veritas-kanban"
if [ -d "$VK_DIR" ]; then
    echo "✅ Veritas Kanban directory found at $VK_DIR"
else
    echo "❌ Veritas Kanban directory not found at $VK_DIR"
    echo "Please clone/install Veritas Kanban first:"
    echo "  git clone https://github.com/your-repo/veritas-kanban.git $VK_DIR"
    exit 1
fi

# Navigate to directory
cd "$VK_DIR" || exit 1

# Check if node_modules exists
if [ ! -d "node_modules" ]; then
    echo "📦 Installing dependencies..."
    npm install
    echo "✅ Dependencies installed"
else
    echo "✅ Dependencies already installed"
fi

echo ""
echo "=== Veritas Kanban Setup Complete ==="
echo ""
echo "To start the server, run:"
echo "  cd $VK_DIR"
echo "  npm start"
echo ""
echo "The API will be available at: http://localhost:3002"
echo "The dashboard will be available at: http://localhost:3002/dashboard"
echo ""
echo "API Key: vk_agent123"
echo ""

# Create a test task (if server is running)
echo "Testing API connection..."
TEST_TASK=$(curl -X POST "http://localhost:3002/api/tasks" \
  -H "X-API-Key: vk_agent123" \
  -H "Content-Type: application/json" \
  -d '{"title": "Integration Test Task", "description": "Test task to verify Veritas Kanban API integration", "tag": "coder", "priority": "low"}' \
  -s 2>/dev/null)

if [ $? -eq 0 ] && [ -n "$TEST_TASK" ]; then
    echo "✅ API connection successful!"
    echo "Created test task:"
    echo "$TEST_TASK" | jq '.' 2>/dev/null || echo "$TEST_TASK"
else
    echo "❌ API connection failed or server not running"
    echo "Please start the server first with: npm start"
fi
