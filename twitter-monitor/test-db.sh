#!/bin/bash

# Database Connection Test Script
# Usage: ./test-db.sh

set -e

echo "🔍 Twitter Monitor - Database Connection Test"
echo ""

# Check if .env.local exists
if [ ! -f .env.local ]; then
    echo "❌ Error: .env.local not found"
    echo ""
    echo "Run: vercel env pull .env.local"
    exit 1
fi

# Load DATABASE_URL
source .env.local
if [ -z "$DATABASE_URL" ]; then
    echo "❌ Error: DATABASE_URL not set in .env.local"
    exit 1
fi

echo "✅ Environment variables loaded"
echo ""
echo "📍 Database URL:"
echo "$DATABASE_URL" | sed 's/:[^:]*@/:****@/' # Hide password
echo ""

# Test 1: Prisma Client Generation
echo "📦 Test 1: Generating Prisma Client..."
if npx prisma generate > /dev/null 2>&1; then
    echo "✅ Prisma Client generated successfully"
else
    echo "❌ Failed to generate Prisma Client"
    exit 1
fi
echo ""

# Test 2: Database Connection
echo "🔗 Test 2: Testing database connection..."
if npx prisma db push --skip-generate > /tmp/db-push.log 2>&1; then
    echo "✅ Database connection successful!"
    echo "✅ Schema pushed to database"
else
    echo "❌ Database connection failed"
    echo ""
    echo "Error log:"
    cat /tmp/db-push.log
    exit 1
fi
echo ""

# Test 3: Query Database
echo "📊 Test 3: Querying database..."
RESULT=$(npx prisma db execute --stdin <<EOF
SELECT COUNT(*) as count FROM "_prisma_migrations";
EOF
2>&1)

if echo "$RESULT" | grep -q "count"; then
    echo "✅ Database query successful!"
else
    echo "❌ Database query failed"
    echo "$RESULT"
    exit 1
fi
echo ""

# Summary
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "✅ All database tests passed!"
echo ""
echo "Your database is ready to use."
echo ""
echo "Next steps:"
echo "  1. Deploy to Vercel: vercel --prod"
echo "  2. Test API: curl https://twitter-monitor-lac.vercel.app/api/profiles"
echo "  3. Add a profile: See README.md"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
