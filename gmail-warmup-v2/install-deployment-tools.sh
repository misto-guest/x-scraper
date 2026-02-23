#!/bin/bash

# Master Installation Script
# Sets up universal Railway deployment automation on your system

set -e

echo "🚀 Setting up Railway Deployment Automation"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

# Installation directory
INSTALL_DIR="$HOME/.railway-deploy"
BIN_DIR="$HOME/.local/bin"

# Create directories
mkdir -p "$INSTALL_DIR"
mkdir -p "$BIN_DIR"

echo "📁 Installation directory: $INSTALL_DIR"

# Copy deployment script
echo "📦 Installing deployment script..."
cp /Users/northsea/clawd-dmitry/gmail-warmup-v2/deploy-to-railway.sh "$INSTALL_DIR/"
chmod +x "$INSTALL_DIR/deploy-to-railway.sh"

# Copy CLI tool
echo "📦 Installing CLI tool..."
cp /Users/northsea/clawd-dmitry/gmail-warmup-v2/railway-deploy.cjs "$INSTALL_DIR/"
chmod +x "$INSTALL_DIR/railway-deploy.cjs"

# Create symlinks
echo "🔗 Creating command symlinks..."
ln -sf "$INSTALL_DIR/deploy-to-railway.sh" "$BIN_DIR/deploy-to-railway"
ln -sf "$INSTALL_DIR/railway-deploy.cjs" "$BIN_DIR/railway-deploy"

# Add to PATH if not already
if [[ ":$PATH:" != *":$BIN_DIR:"* ]]; then
    echo ""
    echo "⚠️  Adding $BIN_DIR to PATH..."

    # Detect shell
    if [ -n "$ZSH_VERSION" ]; then
        SHELL_CONFIG="$HOME/.zshrc"
    elif [ -n "$BASH_VERSION" ]; then
        SHELL_CONFIG="$HOME/.bashrc"
    else
        SHELL_CONFIG="$HOME/.profile"
    fi

    echo "export PATH=\"$BIN_DIR:\$PATH\"" >> "$SHELL_CONFIG"
    echo "✅ Added to $SHELL_CONFIG"
    echo ""
    echo "⚠️  Run: source $SHELL_CONFIG"
fi

echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "✅ Installation complete!"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
echo "Available commands:"
echo "  • deploy-to-railway   - Universal deployment script"
echo "  • railway-deploy      - Interactive CLI tool"
echo ""
echo "Quick start:"
echo "  cd /path/to/your/app"
echo "  deploy-to-railway"
echo ""
echo "Or:"
echo "  railway-deploy init"
echo "  railway-deploy deploy"
echo ""
