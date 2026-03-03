#!/bin/bash
# Open Firewall for AdsPower API on Railway
# Run this on your AdsPower server (95.217.224.154)

echo "🔓 Opening firewall for AdsPower API..."
echo ""

# Check which firewall is active
if command -v ufw &> /dev/null; then
    echo "✅ Using UFW firewall"
    sudo ufw allow 50325/tcp comment 'AdsPower API for Railway'
    sudo ufw reload
    echo "✅ Port 50325 opened via UFW"
elif command -v firewall-cmd &> /dev/null; then
    echo "✅ Using firewalld"
    sudo firewall-cmd --permanent --add-port=50325/tcp
    sudo firewall-cmd --reload
    echo "✅ Port 50325 opened via firewalld"
else
    echo "⚠️  No standard firewall found. Trying iptables..."
    sudo iptables -I INPUT -p tcp --dport 50325 -j ACCEPT
    sudo iptables-save > /etc/iptables/rules.v4 2>/dev/null || echo "⚠️  Rules not persistent across reboot"
    echo "✅ Port 50325 opened via iptables"
fi

echo ""
echo "🔍 Checking if port is listening..."
sudo netstat -tlnp | grep 50325 || echo "⚠️  Port 50325 not showing in netstat (might be using docker/namespace)"

echo ""
echo "🌐 Testing local connection..."
curl -s http://localhost:50325/api/v2/user/info?api_key=746feb8ab409fbb27a0377a864279e6c000f879a7a0e5329 | head -20 || echo "⚠️  Local test failed"

echo ""
echo "✅ Firewall configuration complete!"
echo ""
echo "📝 Next: Test from Railway by running the import again"
