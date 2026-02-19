#!/bin/bash
# DroidClaw Runner
# Run DroidClaw from the correct directory with proper environment

cd /Users/northsea/clawd-dmitry/DROIDCLAW/droidclaw

# Check if dependencies are installed
if [ ! -d "node_modules" ]; then
    echo "📦 Installing dependencies..."
    bun install
fi

# Run the kernel with provided input or prompt for goal
if [ -n "$1" ]; then
    echo "$1" | bun src/kernel.ts
else
    bun src/kernel.ts
fi
