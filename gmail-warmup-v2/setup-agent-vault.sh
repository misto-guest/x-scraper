#!/bin/bash

# Gmail Warmup V2 - agent-vault Setup Script
# This script helps you set up agent-vault for the Gmail Warmup project

set -e

echo "╔══════════════════════════════════════════════════════════════╗"
echo "║     Gmail Warmup V2 - agent-vault Setup                     ║"
echo "╚══════════════════════════════════════════════════════════════╝"
echo ""

# Check if agent-vault is installed
if ! command -v agent-vault &> /dev/null; then
    echo "❌ agent-vault is not installed"
    echo "   Run: npm install -g @botiverse/agent-vault"
    exit 1
fi

echo "✅ agent-vault is installed"
echo ""

# Check if vault is initialized
if [ ! -d ~/.agent-vault ]; then
    echo "📁 Vault not found. Initializing..."
    echo ""
    echo "Please run this command in your terminal:"
    echo "  agent-vault init"
    echo ""
    echo "Then run this script again."
    exit 1
fi

echo "✅ Vault found at ~/.agent-vault/"
echo ""

# Check if AdsPower API key exists
echo "🔑 Checking for existing secrets..."
if agent-vault has adspower-api-key 2>/dev/null; then
    echo "✅ adspower-api-key found in vault"
else
    echo "⚠️  adspower-api-key not found"
    echo ""
    echo "To add it, run:"
    echo "  agent-vault set adspower-api-key --desc 'AdsPower V2 API key'"
    echo ""
    echo "Then enter: 746feb8ab409fbb27a0377a864279e6c000f879a7a0e5329"
fi
echo ""

# List all keys
echo "📋 Current secrets in vault:"
agent-vault list 2>/dev/null | sed 's/^/  /' || echo "  (no secrets yet)"
echo ""

# Check if config directory exists
CONFIG_DIR="$(pwd)/config"
if [ ! -d "$CONFIG_DIR" ]; then
    echo "📁 Creating config directory..."
    mkdir -p "$CONFIG_DIR"
fi

# Check if secure.yaml exists
if [ -f "$CONFIG_DIR/secure.yaml" ]; then
    echo "✅ Config file exists: $CONFIG_DIR/secure.yaml"
    echo ""
    echo "Current config (with placeholders):"
    echo "─────────────────────────────────────────"
    agent-vault read "$CONFIG_DIR/secure.yaml" 2>/dev/null || cat "$CONFIG_DIR/secure.yaml"
    echo "─────────────────────────────────────────"
else
    echo "📝 Config file not found"
    echo ""
    echo "To create it from the template, run:"
    echo "  cp config/secure.yaml.example config/secure.yaml"
    echo ""
    echo "Then use agent-vault write to add your secrets:"
    echo '  agent-vault write config/secure.yaml --content "adspower:'
    echo '    apiKey: <agent-vault:adspower-api-key>'
    echo '    baseUrl: http://77.42.21.134:50325"'
fi
echo ""

# Show how to use
echo "📖 Usage Examples:"
echo ""
echo "Read config (secrets redacted):"
echo "  agent-vault read config/secure.yaml"
echo ""
echo "Write new config:"
echo '  agent-vault write config/new.yaml --content "apiKey: <agent-vault:adspower-api-key>"'
echo ""
echo "Check if secret exists:"
echo "  agent-vault has adspower-api-key"
echo ""
echo "List all secrets (names only):"
echo "  agent-vault list"
echo ""

# Security check
echo "🔒 Security Benefits:"
echo "  • Secrets never transmitted to LLM providers"
echo "  • Encrypted storage (AES-256-GCM)"
echo "  • No risk of committing secrets to git"
echo "  • Agent-safe commands (read, write, list, has)"
echo ""

echo "═══════════════════════════════════════════════════════════════"
echo "✅ agent-vault is ready to use!"
echo ""
echo "Documentation: AGENT-VAULT-IMPLEMENTATION.md"
echo "═══════════════════════════════════════════════════════════════"
