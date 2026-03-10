# Quick Start Implementation Guide

## Week 1: Foundation

### Day 1-2: Project Setup

```bash
# Initialize TypeScript project
npm init -y
npm install -D typescript @types/node tsx tsup
npm install express prisma @prisma/client
npm install zod pino

# Configure TypeScript
npx tsc --init

# Initialize Prisma
npx prisma init --datasource-provider postgresql

# Set up Railway
railway init
railway add postgresql
railway add redis
```

### Day 3-4: Moneybird Client

Create `src/services/moneybird/client.ts`:

```typescript
import axios from 'axios';

export class MoneybirdClient {
  private client;

  constructor(
    private apiToken: string,
    private administrationId: string
  ) {
    this.client = axios.create({
      baseURL: 'https://moneybird.com/api/v2',
      headers: {
        'Authorization': `Bearer ${apiToken}`,
        'Content-Type': 'application/json'
      }
    });
  }

  async getInvoices(params?: {
    filter?: string;
    state?: string;
  }) {
    const { data } = await this.client.get(
      `/${this.administrationId}/sales_invoices`,
      { params }
    );
    return data;
  }

  async getInvoiceById(id: string) {
    const { data } = await this.client.get(
      `/${this.administrationId}/sales_invoices/${id}`
    );
    return data;
  }

  async registerPayment(invoiceId: string, payment: {
    payment_date: string;
    amount: string;
    description?: string;
  }) {
    const { data } = await this.client.post(
      `/${this.administrationId}/sales_invoice_payments`,
      {
        sales_invoice_payment: {
          ...payment,
          price_type: 'manual'
        }
      }
    );
    return data;
  }
}
```

### Day 5: Basic Server

Create `src/server.ts`:

```typescript
import express from 'express';
import { MoneybirdClient } from './services/moneybird/client';

const app = express();
app.use(express.json());

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Manual trigger
app.post('/api/sync', async (req, res) => {
  try {
    // TODO: Implement sync
    res.json({ message: 'Sync triggered' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
```

### Day 6-7: Testing

Create `tests/moneybird.test.ts`:

```typescript
import { MoneybirdClient } from '../src/services/moneybird/client';
import { describe, it, expect } from 'vitest';

describe('Moneybird Client', () => {
  const client = new MoneybirdClient(
    process.env.MONEYBIRD_API_TOKEN!,
    process.env.MONEYBIRD_ADMINISTRATION_ID!
  );

  it('should fetch invoices', async () => {
    const invoices = await client.getInvoices();
    expect(Array.isArray(invoices)).toBe(true);
  });

  it('should find invoice by number', async () => {
    const invoices = await client.getInvoices();
    if (invoices.length > 0) {
      const invoice = await client.getInvoiceById(invoices[0].id);
      expect(invoice).toBeDefined();
    }
  });
});
```

## Week 2: PayPal Integration

### PayPal Client

Create `src/services/providers/paypal/client.ts`:

```typescript
import axios from 'axios';

export class PayPalClient {
  private accessToken: string | null = null;
  private tokenExpiresAt: number = 0;

  constructor(
    private clientId: string,
    private clientSecret: string,
    private mode: 'sandbox' | 'live' = 'sandbox'
  ) {
    this.client = axios.create({
      baseURL: mode === 'sandbox'
        ? 'https://api-m.sandbox.paypal.com'
        : 'https://api-m.paypal.com'
    });
  }

  async authenticate() {
    const auth = Buffer.from(
      `${this.clientId}:${this.clientSecret}`
    ).toString('base64');

    const { data } = await this.client.post('/v1/oauth2/token',
      'grant_type=client_credentials',
      {
        headers: {
          'Authorization': `Basic ${auth}`,
          'Content-Type': 'application/x-www-form-urlencoded'
        }
      }
    );

    this.accessToken = data.access_token;
    this.tokenExpiresAt = Date.now() + (data.expires_in * 1000);
  }

  async getTransactions(startDate: Date, endDate: Date) {
    if (!this.accessToken || Date.now() > this.tokenExpiresAt) {
      await this.authenticate();
    }

    const { data } = await this.client.post(
      '/v1/reporting/transactions',
      {
        start_date: startDate.toISOString(),
        end_date: endDate.toISOString(),
        fields: 'all'
      },
      {
        headers: {
          'Authorization': `Bearer ${this.accessToken}`
        }
      }
    );

    return data.transaction_details || [];
  }
}
```

### Sync Engine

Create `src/services/sync/engine.ts`:

```typescript
import { PayPalClient } from '../providers/paypal/client';
import { MoneybirdClient } from '../moneybird/client';

export class SyncEngine {
  constructor(
    private paypal: PayPalClient,
    private moneybird: MoneybirdClient
  ) {}

  async syncPayPalToMoneybird(startDate: Date, endDate: Date) {
    // 1. Fetch PayPal transactions
    const transactions = await this.paypal.getTransactions(startDate, endDate);

    // 2. Filter completed payments
    const payments = transactions.filter(
      (t: any) => t.transaction_info.transaction_status === 'P'
    );

    // 3. For each payment, try to match to invoice
    const results = [];
    for (const payment of payments) {
      const invoice = await this.findMatchingInvoice(payment);
      if (invoice) {
        const registered = await this.moneybird.registerPayment(
          invoice.id,
          {
            payment_date: payment.transaction_info.transaction_initiation_date,
            amount: payment.transaction_info.transaction_amount.value,
            description: `PayPal payment: ${payment.transaction_info.transaction_id}`
          }
        );
        results.push({ status: 'synced', invoice, registered });
      } else {
        results.push({ status: 'unmatched', payment });
      }
    }

    return results;
  }

  private async findMatchingInvoice(payment: any) {
    // TODO: Implement matching logic
    return null;
  }
}
```

## Week 3: Webhooks

### Webhook Handler

Create `src/api/routes/webhooks.ts`:

```typescript
import express from 'express';
import crypto from 'crypto';

const router = express.Router();

// Moneybird webhook
router.post('/moneybird', express.raw({ type: 'application/json' }), (req, res) => {
  const signature = req.headers['x-moneybird-webhook-signature'] as string;
  const secret = process.env.MONEYBIRD_WEBHOOK_SECRET!;

  // Verify signature
  const hmac = crypto.createHmac('sha256', secret);
  hmac.update(req.body);
  const digest = hmac.digest('base64');

  if (signature !== digest) {
    return res.status(401).json({ error: 'Invalid signature' });
  }

  const event = JSON.parse(req.body.toString());

  // Handle event
  console.log('Received Moneybird event:', event);

  res.status(200).json({ received: true });
});

// PayPal webhook
router.post('/paypal', async (req, res) => {
  // PayPal webhook verification
  console.log('Received PayPal event:', req.body);

  res.status(200).json({ received: true });
});

export default router;
```

## Cron Jobs

### Daily Sync

Create `src/jobs/daily-sync.ts`:

```typescript
import cron from 'node-cron';

export function startDailySync() {
  // Run every day at 2 AM
  cron.schedule('0 2 * * *', async () => {
    console.log('Starting daily sync...');

    const endDate = new Date();
    const startDate = new Date(endDate);
    startDate.setDate(startDate.getDate() - 1);

    // Sync PayPal
    // Sync Wise
    // etc.

    console.log('Daily sync complete');
  });
}
```

## Database Models

Update `prisma/schema.prisma`:

```prisma
generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}

model PaymentTransaction {
  id              String   @id @default(cuid())
  provider        String
  providerTxId    String   @unique
  amount          Decimal
  currency        String
  status          String
  paymentDate     DateTime
  reference       String?

  syncedToMoneybird Boolean @default(false)
  moneybirdPaymentId String?

  createdAt       DateTime @default(now())
  updatedAt       DateTime @updatedAt

  @@index([provider, paymentDate])
}
```

## Deployment

### Railway Config

Create `railway.json`:

```json
{
  "$schema": "https://railway.app/railway.schema.json",
  "build": {
    "builder": "NIXPACKS"
  },
  "deploy": {
    "healthcheckPath": "/health",
    "healthcheckTimeout": 100,
    "restartPolicyType": "ON_FAILURE",
    "restartPolicyMaxRetries": 10
  }
}
```

### Procfile

```
web: pnpm start
```

## Next Steps After Foundation

1. **Implement matching logic** - Auto-match payments to invoices
2. **Add error handling** - Retry failed syncs
3. **Build dashboard** - View unmatched items
4. **Add Wise integration** - Repeat PayPal pattern
5. **CSV import** - Handle Amex and manual uploads

---

*Last updated: 2026-03-04*
