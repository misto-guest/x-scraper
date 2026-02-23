#!/bin/bash

# Gmail Warmup V2 - Quick Start Script

echo "🔥 Gmail Warmup V2 - Quick Start"
echo "================================"
echo ""

# Check if node_modules exists
if [ ! -d "node_modules" ]; then
    echo "📦 Installing dependencies..."
    npm install
fi

# Create necessary directories
echo "📁 Creating directories..."
mkdir -p data logs screenshots ui

# Check if AdsPower is configured
if [ ! -f "config/secure.yaml" ]; then
    echo "⚠️  Warning: config/secure.yaml not found"
    echo "   Creating from example..."
    mkdir -p config
    cp config/secure.yaml.example config/secure.yaml
    echo "   Please edit config/secure.yaml with your AdsPower credentials"
fi

# Find available port
PORT=3456
while lsof -Pi :$PORT -sTCP:LISTEN -t >/dev/null 2>&1 ; do
    echo "⚠️  Port $PORT is in use, trying next port..."
    PORT=$((PORT + 1))
done

echo ""
echo "🚀 Starting server on port $PORT..."
echo "📊 Dashboard: http://localhost:$PORT"
echo "🔌 API: http://localhost:$PORT/api"
echo ""
echo "Press Ctrl+C to stop"
echo ""

# Start server
PORT=$PORT npm start
