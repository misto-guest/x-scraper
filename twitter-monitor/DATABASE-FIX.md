# Database Configuration Fix

## ✅ Completed Steps

1. **Updated Prisma Schema** ✓
   - Changed from `sqlite` to `postgresql`
   - File: `prisma/schema.prisma`
   - Committed and pushed to GitHub

2. **Vercel Deployment** ✓
   - Successfully redeployed
   - Prisma client regenerated
   - Build completed successfully

## ⚠️ Current Issue

The DATABASE_URL environment variable points to an inaccessible database:
```
postgres://...@db.prisma.io:5432/postgres
```

**Error**: Can't reach database server

## 🔧 Fix Instructions

### Option 1: Vercel Postgres (Recommended - Free)

1. **Create Vercel Postgres Database**
   - Go to: https://vercel.com
   - Open: `twitter-monitor` project
   - Click: **Storage** tab (left sidebar)
   - Click: **Create Database**
   - Select: **Postgres** → **Hobby** (Free plan)
   - Click: **Continue** → **Create**

2. **Connect to Project**
   - Select: `twitter-monitor` project
   - Vercel will automatically:
     - Update `DATABASE_URL` environment variable
     - Create a `.env.local` file
     - Set up the database

3. **Verify**
   ```bash
   # Pull new environment variables
   vercel env pull .env.local

   # Check DATABASE_URL updated
   grep DATABASE_URL .env.local
   ```

4. **Done!** - No code changes needed, Vercel handles the rest

### Option 2: Supabase (Alternative - Free)

1. **Create Supabase Project**
   - Go to: https://supabase.com
   - Click: **Start your project**
   - Sign up/login
   - Create new project (wait ~2 min for setup)

2. **Get Connection String**
   - Go to: **Project Settings** → **Database**
   - Find: **Connection string** → **URI** format
   - Copy the connection string
   - Format: `postgres://postgres:[YOUR-PASSWORD]@db.[PROJECT-REF].supabase.co:5432/postgres`

3. **Update Vercel Environment Variable**
   ```bash
   # Via Vercel CLI
   vercel env add DATABASE_URL

   # Paste your Supabase connection string
   # Select: All environments (Development, Preview, Production)
   ```

4. **Redeploy**
   ```bash
   vercel --prod
   ```

### Option 3: Neon (Alternative - Free)

1. **Create Neon Database**
   - Go to: https://neon.tech
   - Click: **Sign in** → **Create a project**
   - Choose: Free plan
   - Copy the connection string

2. **Update Vercel**
   ```bash
   vercel env rm DATABASE_URL
   vercel env add DATABASE_URL
   # Paste Neon connection string
   ```

3. **Redeploy**
   ```bash
   vercel --prod
   ```

## 🧪 Verify Database Connection

After updating DATABASE_URL, test the connection:

```bash
# Test locally with production database
DATABASE_URL="postgres://..." npx prisma db push

# Or test via API
curl https://twitter-monitor-lac.vercel.app/api/profiles
```

Expected output: `[]` (empty array, not an error)

## 📊 What Changed

### Before:
```prisma
datasource db {
  provider = "sqlite"
  url      = env("DATABASE_URL")
}
```
DATABASE_URL: `file:./dev.db` (SQLite - doesn't work on Vercel)

### After:
```prisma
datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}
```
DATABASE_URL: `postgres://...` (PostgreSQL - works on Vercel)

## 🎯 Why This Fix?

**Problem**: Vercel's serverless functions don't support SQLite because:
- File system is read-only (except /tmp)
- Each function invocation is stateless
- Database files don't persist between invocations

**Solution**: Use PostgreSQL (Vercel Postgres, Supabase, Neon, etc.)
- Fully managed database service
- Persists across deployments
- Scales automatically
- Works with serverless functions

## 🚀 Next Steps

1. ✅ Create PostgreSQL database (Option 1, 2, or 3)
2. ✅ Update DATABASE_URL environment variable
3. ✅ Vercel will auto-redeploy
4. ✅ Test API endpoints
5. ✅ Add Twitter profiles and start monitoring!

## 📖 Resources

- [Vercel Postgres Docs](https://vercel.com/docs/storage/vercel-postgres)
- [Prisma PostgreSQL Guide](https://www.prisma.io/docs/concepts/database-connectors/postgresql)
- [Supabase Docs](https://supabase.com/docs)
- [Neon Docs](https://neon.tech/docs)

---

**Status**: Waiting for database creation
**Deployment**: ✅ Ready
**Code**: ✅ Fixed
**Database**: ⏳ Needs PostgreSQL connection
