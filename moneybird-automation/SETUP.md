# Development Setup Guide

## Prerequisites

- Node.js 20+ (LTS)
- pnpm (recommended) or npm
- Git
- Railway CLI (optional, for deployment)
- Moneybird account with API access
- PayPal Developer account
- Wise Business account

## Local Development Setup

### 1. Clone and Initialize

```bash
# Clone repository
git clone https://github.com/your-org/moneybird-automation.git
cd moneybird-automation

# Install dependencies
pnpm install

# Copy environment template
cp .env.example .env
```

### 2. Environment Configuration

Create `.env` file:

```bash
# Application
NODE_ENV=development
PORT=3000
LOG_LEVEL=debug

# Moneybird
MONEYBIRD_API_TOKEN=your_token_here
MONEYBIRD_ADMINISTRATION_ID=your_admin_id
MONEYBIRD_WEBHOOK_SECRET=your_webhook_secret

# PayPal
PAYPAL_CLIENT_ID=your_client_id
PAYPAL_CLIENT_SECRET=your_client_secret
PAYPAL_MODE=sandbox  # or 'live'

# Wise
WISE_API_KEY=your_api_key
WISE_PROFILE_ID=your_profile_id

# Database (Railway provides these)
DATABASE_URL=postgresql://user:pass@localhost:5432/moneybird

# Redis (Railway provides these)
REDIS_URL=redis://localhost:6379

# App
WEBHOOK_SECRET=random_string_here
JWT_SECRET=random_jwt_secret
ENCRYPTION_KEY=32_char_encryption_key
```

### 3. Database Setup

```bash
# Generate Prisma client
pnpm prisma generate

# Run migrations
pnpm prisma migrate dev --name init

# Seed database (optional)
pnpm prisma db seed
```

### 4. Development Server

```bash
# Start development server
pnpm dev

# Run in watch mode
pnpm dev --watch

# With debugging
pnpm dev --inspect
```

Visit: http://localhost:3000/health

## Railway Deployment

### 1. Install Railway CLI

```bash
npm install -g @railway/cli
railway login
```

### 2. Create Project

```bash
# Initialize project
railway init

# Add plugins
railway add postgresql
railway add redis

# Set environment variables
railway variables set MONEYBIRD_API_TOKEN=your_token
railway variables set PAYPAL_CLIENT_ID=your_client_id
railway variables set PAYPAL_CLIENT_SECRET=your_client_secret
# ... set all variables from .env
```

### 3. Deploy

```bash
# Deploy to Railway
railway up

# View logs
railway logs

# Open live app
railway domain
```

### 4. Webhook Configuration

Once deployed:

1. Get your Railway URL:
   ```bash
   railway domain
   ```

2. Configure Moneybird webhook:
   - URL: `https://your-app.railway.app/webhooks/moneybird`
   - Events: `sales_invoice_created`, `sales_invoice_updated`, `sales_invoice_paid`

3. Configure PayPal webhook (if using):
   - URL: `https://your-app.railway.app/webhooks/paypal`
   - Events: `PAYMENT.CAPTURE.COMPLETED`, `PAYMENT.SALE.COMPLETED`

## Obtaining API Credentials

### Moneybird API Token

1. Log in to Moneybird
2. Go to Settings → API → Webhooks
3. Click "New token"
4. Copy the token
5. Note your Administration ID (in URL: `/administrations/{id}`)

### PayPal API Credentials

1. Log in to https://developer.paypal.com/
2. Go to Dashboard → Apps & Credentials
3. Create a new app (or use existing)
4. Copy Client ID and Secret
5. For sandbox, use sandbox credentials
6. For production, create live app and use live credentials

### Wise API Token

1. Log in to Wise
2. Go to Settings → API tokens
3. Generate new token
4. Note your Profile ID (in account settings)

## Testing

### Unit Tests

```bash
# Run all tests
pnpm test

# Run with coverage
pnpm test:coverage

# Watch mode
pnpm test:watch
```

### Integration Tests

```bash
# Run integration tests (requires test database)
pnpm test:integration

# Run specific test file
pnpm test services/moneybird.test.ts
```

### Manual Testing

```bash
# Test Moneybird connection
pnpm test:connection moneybird

# Test PayPal connection
pnpm test:connection paypal

# Test matching logic
pnpm test:matching
```

## Troubleshooting

### Common Issues

**Problem: Prisma migrations fail**
```bash
# Reset database (WARNING: deletes data)
pnpm prisma migrate reset

# Or create new migration
pnpm prisma migrate dev --name fix
```

**Problem: Railway deployment fails**
```bash
# Check build logs
railway logs

# Rebuild without cache
railway up --verbose
```

**Problem: Webhooks not received**
- Check Railway URL is correct
- Verify webhook URL is reachable (use webhook.site for testing)
- Check webhook signature verification

**Problem: PayPal API authentication fails**
- Verify credentials match sandbox/live mode
- Check token hasn't expired
- Ensure API permissions are correct

## Development Workflow

### Feature Development

```bash
# Create feature branch
git checkout -b feature/paypal-integration

# Make changes
# ...

# Test changes
pnpm test
pnpm lint
pnpm type-check

# Commit and push
git add .
git commit -m "feat: add PayPal integration"
git push origin feature/paypal-integration

# Create PR on GitHub
```

### Code Quality

```bash
# Lint code
pnpm lint

# Auto-fix lint issues
pnpm lint:fix

# Type checking
pnpm type-check

# Format code
pnpm format
```

## Useful Commands

```bash
# Database
pnpm prisma studio              # Open Prisma Studio
pnpm prisma migrate dev         # Create migration
pnpm prisma migrate deploy      # Deploy migrations (production)

# Testing
pnpm test                       # All tests
pnpm test:unit                  # Unit tests only
pnpm test:e2e                   # End-to-end tests

# Development
pnpm dev                        # Start dev server
pnpm build                      # Build for production
pnpm start                      # Start production server

# Utilities
pnpm clean                      # Clean build artifacts
pnpm lint                       # Check code quality
pnpm format                     # Format code with Prettier
```

---

*Last updated: 2026-03-04*
