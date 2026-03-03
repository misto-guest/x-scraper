#!/bin/bash
# AdsPower Server Diagnostic Tool
# Checks if AdsPower API is accessible from external connections

echo "🔍 AdsPower Server Diagnostics"
echo "================================"
echo ""

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Configuration
ADSPOWER_PORT=50325
ADSPOWER_IP=$(hostname -I | awk '{print $1}')
API_KEY="746feb8ab409fbb27a0377a864279e6c000f879a7a0e5329"

echo "📊 Server Information:"
echo "   IP Address: $ADSPOWER_IP"
echo "   Port: $ADSPOWER_PORT"
echo ""

# Test 1: Check if AdsPower process is running
echo "🔍 Test 1: Checking AdsPower process..."
if pgrep -f "adspower" > /dev/null || pgrep -f "AdsPower" > /dev/null; then
    echo -e "   ${GREEN}✅ AdsPower is running${NC}"
else
    echo -e "   ${RED}❌ AdsPower process not found${NC}"
    echo -e "   ${YELLOW}⚠️  Start AdsPower and try again${NC}"
fi
echo ""

# Test 2: Check if port is listening
echo "🔍 Test 2: Checking if port $ADSPOWER_PORT is listening..."
if sudo netstat -tlnp 2>/dev/null | grep ":$ADSPOWER_PORT " > /dev/null; then
    echo -e "   ${GREEN}✅ Port $ADSPOWER_PORT is listening${NC}"
    sudo netstat -tlnp 2>/dev/null | grep ":$ADSPOWER_PORT " | head -2
else
    echo -e "   ${RED}❌ Port $ADSPOWER_PORT is not listening${NC}"
    echo -e "   ${YELLOW}⚠️  Check if AdsPower is configured to use this port${NC}"
fi
echo ""

# Test 3: Check firewall status
echo "🔍 Test 3: Checking firewall rules..."

# Check UFW
if command -v ufw &> /dev/null; then
    echo "   Firewall: UFW detected"
    if sudo ufw status | grep "$ADSPOWER_PORT" > /dev/null; then
        echo -e "   ${GREEN}✅ UFW rule exists for port $ADSPOWER_PORT${NC}"
        sudo ufw status | grep "$ADSPOWER_PORT"
    else
        echo -e "   ${RED}❌ No UFW rule for port $ADSPOWER_PORT${NC}"
        echo -e "   ${YELLOW}Run: sudo ufw allow $ADSPOWER_PORT/tcp${NC}"
    fi
# Check firewalld
elif command -v firewall-cmd &> /dev/null; then
    echo "   Firewall: firewalld detected"
    if sudo firewall-cmd --list-ports | grep "$ADSPOWER_PORT" > /dev/null; then
        echo -e "   ${GREEN}✅ firewalld rule exists for port $ADSPOWER_PORT${NC}"
        sudo firewall-cmd --list-ports
    else
        echo -e "   ${RED}❌ No firewalld rule for port $ADSPOWER_PORT${NC}"
        echo -e "   ${YELLOW}Run: sudo firewall-cmd --permanent --add-port=$ADSPOWER_PORT/tcp${NC}"
        echo -e "   ${YELLOW}Then: sudo firewall-cmd --reload${NC}"
    fi
# Check iptables
elif command -v iptables &> /dev/null; then; then
    echo "   Firewall: iptables detected"
    if sudo iptables -L -n | grep "$ADSPOWER_PORT" > /dev/null; then
        echo -e "   ${GREEN}✅ iptables rule exists for port $ADSPOWER_PORT${NC}"
    else
        echo -e "   ${RED}❌ No iptables rule for port $ADSPOWER_PORT${NC}"
        echo -e "   ${YELLOW}Run: sudo iptables -I INPUT -p tcp --dport $ADSPOWER_PORT -j ACCEPT${NC}"
    fi
else
    echo -e "   ${YELLOW}⚠️  No standard firewall detected (UFW/firewalld/iptables)${NC}"
fi
echo ""

# Test 4: Test local API connection
echo "🔍 Test 4: Testing local API connection..."
API_TEST=$(curl -s --max-time 5 "http://localhost:$ADSPOWER_PORT/api/v2/user/info?api_key=$API_KEY" 2>&1)
if echo "$API_TEST" | grep -q "user_id\|code"; then
    echo -e "   ${GREEN}✅ Local API connection successful${NC}"
    echo "$API_TEST" | head -3
else
    echo -e "   ${RED}❌ Local API connection failed${NC}"
    echo "   Response: $API_TEST"
fi
echo ""

# Test 5: Check for common issues
echo "🔍 Test 5: Checking for common configuration issues..."

# Check if AdsPower is bound to localhost only
if sudo netstat -tlnp 2>/dev/null | grep ":$ADSPOWER_PORT " | grep "127.0.0.1" > /dev/null; then
    echo -e "   ${RED}❌ AdsPower is bound to localhost only (127.0.0.1)${NC}"
    echo -e "   ${YELLOW}⚠️  External connections cannot reach it${NC}"
    echo -e "   ${YELLOW}⚠️  Reconfigure AdsPower to bind to 0.0.0.0 or all interfaces${NC}"
else
    echo -e "   ${GREEN}✅ AdsPower is accessible from external connections${NC}"
fi

# Check Docker (if AdsPower is running in Docker)
if command -v docker &> /dev/null; then
    if docker ps | grep -i adspower > /dev/null 2>&1; then
        echo -e "   ${YELLOW}⚠️  AdsPower running in Docker${NC}"
        echo -e "   ${YELLOW}⚠️  Make sure port is exposed: -p $ADSPOWER_PORT:$ADSPOWER_PORT${NC}"
    fi
fi
echo ""

# Summary
echo "================================"
echo "📋 Summary"
echo "================================"
echo ""
echo "If all tests pass, your server is ready for Railway!"
echo ""
echo "Next steps:"
echo "1. If any test failed, fix the issue shown above"
echo "2. Run this script again to verify"
echo "3. Reply 'done' in Telegram and Railway will connect"
echo ""
echo "To manually open firewall (if needed):"
if command -v ufw &> /dev/null; then
    echo "  sudo ufw allow $ADSPOWER_PORT/tcp"
elif command -v firewall-cmd &> /dev/null; then
    echo "  sudo firewall-cmd --permanent --add-port=$ADSPOWER_PORT/tcp"
    echo "  sudo firewall-cmd --reload"
fi
echo ""
