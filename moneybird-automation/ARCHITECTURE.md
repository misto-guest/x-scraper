# Technical Architecture

## System Design

### Component Diagram

```
┌────────────────────────────────────────────────────────────────────┐
│                        External Layer                             │
│                                                                   │
│  ┌──────────┐  ┌────────┐  ┌──────┐  ┌────────┐  ┌────────────┐  │
│  │ Moneybird│  │ PayPal │  │ Wise │  │Payoneer│  │ Amex CSV   │  │
│  │   API    │  │  API   │  │ API  │  │  API   │  │   Upload   │  │
│  └─────┬────┘  └───┬────┘  └──┬───┘  └────┬───┘  └─────┬──────┘  │
│        │           │          │           │            │         │
└────────┼───────────┼──────────┼───────────┼────────────┼─────────┘
         │           │          │           │            │
         └───────────┴──────────┴───────────┴────────────┘
                           │ HTTPS
                           ▼
┌────────────────────────────────────────────────────────────────────┐
│                      Application Layer (Railway)                   │
│                                                                   │
│  ┌──────────────────────────────────────────────────────────────┐ │
│  │                    API Gateway (Express)                      │ │
│  │  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌──────────────┐ │ │
│  │  │Webhook   │  │Cron      │  │Manual    │  │Health/Admin  │ │ │
│  │  │Routes    │  │Scheduler │  │Triggers  │  │Endpoints     │ │ │
│  │  └─────┬────┘  └────┬─────┘  └────┬─────┘  └──────┬───────┘ │ │
│  └────────┼────────────┼─────────────┼───────────────┼─────────┘ │
│           │            │             │               │           │
│  ┌────────┴────────────┴─────────────┴───────────────┴─────────┐ │
│  │                     Service Layer                           │ │
│  │  ┌───────────────┐  ┌───────────────┐  ┌─────────────────┐ │ │
│  │  │ SyncEngine    │  │ Matcher       │  │ Registrar       │ │ │
│  │  │ ┌───────────┐ │  │ ┌───────────┐ │  │ ┌─────────────┐ │ │ │
│  │  │ │Orchestrat.│ │  │ │Fuzzy Match│ │  │ │Payment Reg. │ │ │ │
│  │  │ └───────────┘ │  │ └───────────┘ │  │ └─────────────┘ │ │ │
│  │  └───────────────┘  └───────────────┘  └─────────────────┘ │ │
│  │  ┌───────────────┐  ┌───────────────┐  ┌─────────────────┐ │ │
│  │  │ Providers     │  │ Moneybird     │  │ Import/Export   │ │ │
│  │  │ ┌───────────┐ │  │ ┌───────────┐ │  │ ┌─────────────┘ │ │ │
│  │  │ │PayPal     │ │  │ │Invoices   │ │  │ │ CSV Parser   │ │ │
│  │  │ │Wise       │ │  │ │Payments   │ │  │ └─────────────┘ │ │ │
│  │  │ │Payoneer   │ │  │ │Webhooks   │ │  │                 │ │ │
│  │  │ │CSV        │ │  │ └───────────┘ │  │                 │ │ │
│  │  │ └───────────┘ │  └───────────────┘  │                 │ │ │
│  │  └───────────────┘                     └─────────────────┘ │ │
│  └──────────────────────────────────────────────────────────────┘ │
│                                                                   │
│  ┌──────────────────────────────────────────────────────────────┐ │
│  │                     Data Access Layer                        │ │
│  │  ┌──────────────┐  ┌──────────────┐  ┌──────────────────┐  │ │
│  │  │ Prisma ORM   │  │ Redis Client │  │ File System      │  │ │
│  │  │ ┌──────────┐ │  │ ┌──────────┐ │  │ ┌──────────────┐ │  │ │
│  │  │ │PostgreSQL│ │  │ │Cache     │ │  │ │CSV Uploads   │ │  │ │
│  │  │ │ Models   │ │  │ │Queue     │ │  │ │Exports       │ │  │ │
│  │  │ └──────────┘ │  │ └──────────┘ │  │ └──────────────┘ │  │ │
│  │  └──────────────┘  └──────────────┘  └──────────────────┘  │ │
│  └──────────────────────────────────────────────────────────────┘ │
└────────────────────────────────────────────────────────────────────┘
                           │
                           ▼
┌────────────────────────────────────────────────────────────────────┐
│                      Data Layer (Railway)                          │
│                                                                   │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────────────────┐ │
│  │ PostgreSQL   │  │ Redis        │  │ Volume Storage           │ │
│  │ - Transactions│  │ - Cache      │  │ - Temporary files        │ │
│  │ - InvoiceMap │  │ - Job Queue  │  │ - CSV uploads            │ │
│  │ - SyncState  │  │ - Rate Limit │  │ - Exports                │ │
│  │ - AuditLog   │  │ - Locks      │  │                          │ │
│  └──────────────┘  └──────────────┘  └──────────────────────────┘ │
└────────────────────────────────────────────────────────────────────┘
```

## Data Model

### Core Entities

```prisma
// Payment Transaction (from external provider)
model PaymentTransaction {
  id              String    @id @default(cuid())
  provider        String    // 'paypal', 'wise', 'payoneer', 'amex'
  providerTxId    String    @unique
  amount          Decimal
  currency        String
  status          String    // 'completed', 'pending', 'failed'
  paymentDate     DateTime
  description     String?
  reference       String?   // External reference/invoice number
  feeAmount       Decimal?
  feeCurrency     String?

  // Matching
  matchedInvoiceId String?
  matchedInvoice   MoneybirdInvoice? @relation(fields: [matchedInvoiceId], references: [id])
  matchConfidence  Float?    // 0-1 score
  matchMethod      String?   // 'reference', 'amount_date', 'fuzzy', 'manual'

  // Processing
  syncedToMoneybird Boolean  @default(false)
  moneybirdPaymentId String?
  syncAttemptedAt   DateTime?
  syncedAt          DateTime?
  syncError         String?

  // Audit
  createdAt       DateTime  @default(now())
  updatedAt       DateTime  @updatedAt
  rawResponse     Json      // Full API response for debugging

  @@index([provider, paymentDate])
  @@index([matchedInvoiceId])
  @@index([syncedToMoneybird])
}

// Moneybird Invoice (cached subset)
model MoneybirdInvoice {
  id              String    @id
  administrationId String
  invoiceId       String    // Moneybird's internal ID
  invoiceType     String    // 'sales' or 'purchase'
  contactId       String?
  contactName     String?
  invoiceNumber   String    @unique
  currency        String
  totalAmount     Decimal
  amountPaid      Decimal   @default(0)
  outstandingAmount Decimal
  status          String    // 'draft', 'open', 'paid', 'late'
  invoiceDate     DateTime
  dueDate         DateTime?

  // Matching
  payments        PaymentTransaction[]

  // Metadata
  createdAt       DateTime
  updatedAt       DateTime

  @@index([invoiceNumber])
  @@index([status])
  @@index([invoiceDate])
}

// Sync State (track last sync per provider)
model SyncState {
  id              String    @id @default(cuid())
  provider        String    @unique
  lastSyncAt      DateTime?
  lastSyncStatus  String    // 'success', 'partial', 'failed'
  lastSyncError   String?
  lastTxnTimestamp DateTime? // Last transaction timestamp synced
  retryCount      Int       @default(0)
  nextRetryAt     DateTime?

  createdAt       DateTime  @default(now())
  updatedAt       DateTime  @updatedAt

  @@index([provider])
}

// Unmatched Queue (manual review items)
model UnmatchedItem {
  id              String    @id @default(cuid())
  type            String    // 'payment' or 'invoice'
  paymentTxId     String?
  invoiceId       String?

  reason          String    // 'no_match', 'multiple_matches', 'low_confidence'
  suggestedMatch  String?   // Invoice/Payment ID if fuzzy match exists
  confidence      Float?    // 0-1

  status          String    // 'pending', 'reviewed', 'resolved', 'ignored'
  resolvedAt      DateTime?
  resolvedBy      String?   // User who resolved

  createdAt       DateTime  @default(now())
  updatedAt       DateTime  @updatedAt

  @@index([status])
  @@index([type])
}

// Audit Log
model AuditLog {
  id              String    @id @default(cuid())
  entityType      String    // 'payment', 'invoice', 'sync'
  entityId        String
  action          String    // 'created', 'matched', 'synced', 'failed'
  oldValues       Json?
  newValues       Json?
  userId          String?   // If action by user
  metadata        Json?

  createdAt       DateTime  @default(now())

  @@index([entityType, entityId])
  @@index([createdAt])
}

// Job Log (for cron jobs)
model JobLog {
  id              String    @id @default(cuid())
  jobName         String    // 'daily_sync', 'retry_failed', etc.
  status          String    // 'started', 'completed', 'failed'
  startedAt       DateTime  @default(now())
  completedAt     DateTime?
  duration        Int?      // milliseconds
  resultSummary   Json?     // {processed: 10, matched: 8, failed: 2}
  errorMessage    String?

  @@index([jobName])
  @@index([startedAt])
}
```

## API Service Interfaces

### Moneybird Service

```typescript
interface MoneybirdService {
  // Invoices
  getInvoices(filters: InvoiceFilters): Promise<MoneybirdInvoice[]>
  getInvoiceById(id: string): Promise<MoneybirdInvoice | null>
  findInvoiceByNumber(invoiceNumber: string): Promise<MoneybirdInvoice | null>
  findInvoicesByAmountAndDate(amount: number, date: Date, rangeDays: number): Promise<MoneybirdInvoice[]>

  // Payments
  registerPayment(invoiceId: string, payment: PaymentRequest): Promise<MoneybirdPayment>
  getInvoicePayments(invoiceId: string): Promise<MoneybirdPayment[]>

  // Webhooks
  createWebhook(url: string, events: string[]): Promise<Webhook>
  deleteWebhook(webhookId: string): Promise<void>
  verifyWebhookSignature(payload: string, signature: string): boolean

  // Administration
  getAdministrationId(): string;
}

interface InvoiceFilters {
  status?: 'draft' | 'open' | 'paid' | 'late';
  period?: { from: Date; to: Date };
  contactId?: string;
}

interface PaymentRequest {
  paymentDate: string;
  amount: number;
  priceType?: 'manual';
  description?: string;
  reference?: string;
}

interface MoneybirdPayment {
  id: string;
  invoiceId: string;
  amount: number;
  paymentDate: string;
  createdAt: string;
}
```

### Provider Service Interface

```typescript
interface PaymentProvider {
  name: string;
  fetchTransactions(options: FetchOptions): Promise<ProviderTransaction[]>;
  authenticate(credentials: Credentials): Promise<boolean>;
  validateWebhook(signature: string, payload: any): boolean;
}

interface FetchOptions {
  startDate: Date;
  endDate: Date;
  status?: string[];
  limit?: number;
}

interface ProviderTransaction {
  id: string;
  amount: number;
  currency: string;
  status: 'completed' | 'pending' | 'failed';
  paymentDate: Date;
  description?: string;
  reference?: string; // Invoice number or other identifier
  fee?: {
    amount: number;
    currency: string;
  };
  payer?: {
    name?: string;
    email?: string;
    id?: string;
  };
  raw: any; // Original API response
}

// Example: PayPal Service
class PayPalService implements PaymentProvider {
  name = 'paypal';

  constructor(private config: PayPalConfig) {}

  async fetchTransactions(options: FetchOptions): Promise<ProviderTransaction[]> {
    // Implementation
  }

  async authenticate(credentials: Credentials): Promise<boolean> {
    // OAuth flow implementation
  }

  validateWebhook(signature: string, payload: any): boolean {
    // PayPal webhook verification
  }
}
```

### Matching Engine

```typescript
interface MatchingEngine {
  matchPaymentToInvoices(payment: ProviderTransaction): Promise<MatchResult>;
  matchMultiplePayments(payments: ProviderTransaction[]): Promise<MatchResult[]>;
}

interface MatchResult {
  payment: ProviderTransaction;
  match: MatchType;
  confidence: number;
  invoice?: MoneybirdInvoice;
  method: 'reference' | 'exact_amount' | 'fuzzy' | 'manual';
  reason?: string;
}

type MatchType =
  | { type: 'exact'; invoice: MoneybirdInvoice }
  | { type: 'multiple'; invoices: MoneybirdInvoice[] }
  | { type: 'none' }
  | { type: 'low_confidence'; invoices: MoneybirdInvoice[] };

// Matching strategies
interface MatchingStrategy {
  match(payment: ProviderTransaction, invoices: MoneybirdInvoice[]): Promise<MatchResult>;
}

class ReferenceNumberStrategy implements MatchingStrategy {
  async match(payment: ProviderTransaction, invoices: MoneybirdInvoice[]): Promise<MatchResult> {
    // Match by invoice number in reference/description
  }
}

class AmountAndDateStrategy implements MatchingStrategy {
  async match(payment: ProviderTransaction, invoices: MoneybirdInvoice[]): Promise<MatchResult> {
    // Match by amount + date range (within 3 days)
  }
}

class FuzzyMatchStrategy implements MatchingStrategy {
  async match(payment: ProviderTransaction, invoices: MoneybirdInvoice[]): Promise<MatchResult> {
    // Fuzzy matching on description, amount, date
  }
}
```

## Webhook Handling

### Incoming Webhooks (Moneybird)

```typescript
// Webhook Types
type MoneybirdWebhook =
  | { event: 'sales_invoice_created'; administrationId: string; invoice: MoneybirdInvoice }
  | { event: 'sales_invoice_updated'; administrationId: string; invoice: MoneybirdInvoice }
  | { event: 'sales_invoice_paid'; administrationId: string; invoice: MoneybirdInvoice }
  | { event: 'contact_created'; administrationId: string; contact: Contact }
  | { event: 'contact_updated'; administrationId: string; contact: Contact };

// Handler
async function handleMoneybirdWebhook(payload: MoneybirdWebhook): Promise<void> {
  switch (payload.event) {
    case 'sales_invoice_created':
    case 'sales_invoice_updated':
      // Check if payment exists in our system
      await checkForPendingPayments(payload.invoice);
      break;

    case 'sales_invoice_paid':
      // Sync payment status back
      await markPaymentAsSynced(payload.invoice);
      break;

    case 'contact_created':
    case 'contact_updated':
      // Update contact cache
      await syncContact(payload.contact);
      break;
  }
}
```

### Outgoing Webhooks (Optional)

Send notifications to external systems:

```typescript
interface WebhookNotifier {
  notify(event: {
    type: 'payment_matched' | 'payment_synced' | 'sync_failed';
    data: any;
  }): Promise<void>;
}
```

## Error Handling

### Error Classification

```typescript
enum ErrorType {
  TRANSIENT = 'transient',        // Retry with backoff
  CONFIGURATION = 'config',       // Fatal - requires config change
  DATA = 'data',                  // Manual review required
  AUTHENTICATION = 'auth',        // Credentials expired
  RATE_LIMIT = 'rate_limit',      // Wait and retry
  VALIDATION = 'validation',      // Data format error
}

class SyncError extends Error {
  constructor(
    public type: ErrorType,
    public provider: string,
    message: string,
    public retryable: boolean = false,
    public context?: any
  ) {
    super(message);
    this.name = 'SyncError';
  }
}
```

### Retry Strategy

```typescript
interface RetryPolicy {
  maxAttempts: number;
  initialDelay: number;  // milliseconds
  maxDelay: number;
  backoffMultiplier: number;
}

const DEFAULT_RETRY_POLICY: RetryPolicy = {
  maxAttempts: 3,
  initialDelay: 1000,  // 1 second
  maxDelay: 60000,     // 1 minute
  backoffMultiplier: 2,
};

async function retryWithBackoff<T>(
  fn: () => Promise<T>,
  policy: RetryPolicy = DEFAULT_RETRY_POLICY
): Promise<T> {
  let lastError: Error;
  let delay = policy.initialDelay;

  for (let attempt = 1; attempt <= policy.maxAttempts; attempt++) {
    try {
      return await fn();
    } catch (error) {
      lastError = error;

      if (error instanceof SyncError && !error.retryable) {
        throw error;  // Don't retry non-retryable errors
      }

      if (attempt < policy.maxAttempts) {
        await sleep(delay);
        delay = Math.min(delay * policy.backoffMultiplier, policy.maxDelay);
      }
    }
  }

  throw lastError;
}
```

## Scheduled Jobs

### Job Types

```typescript
// Daily Sync Job
async function dailySyncJob(): Promise<JobResult> {
  const providers = ['paypal', 'wise', 'payoneer'];
  const results = {
    total: 0,
    processed: 0,
    matched: 0,
    failed: 0,
  };

  for (const provider of providers) {
    try {
      const service = getProviderService(provider);
      const syncResult = await syncProvider(service);
      results.processed += syncResult.processed;
      results.matched += syncResult.matched;
      results.failed += syncResult.failed;
      results.total += syncResult.total;

      // Update sync state
      await updateSyncState(provider, syncResult);
    } catch (error) {
      logger.error(`Failed to sync ${provider}:`, error);
      results.failed++;
    }
  }

  return results;
}

// Retry Failed Transactions
async function retryFailedPaymentsJob(): Promise<void> {
  const failedPayments = await db.paymentTransaction.findMany({
    where: {
      syncedToMoneybird: false,
      syncError: { not: null },
      syncAttemptedAt: {
        lt: new Date(Date.now() - 60 * 60 * 1000), // Last attempt > 1 hour ago
      },
    },
    take: 100,
  });

  for (const payment of failedPayments) {
    try {
      await syncPaymentToMoneybird(payment);
    } catch (error) {
      logger.error(`Retry failed for payment ${payment.id}:`, error);
    }
  }
}

// Invoice Matching Job
async function matchUnpaidInvoicesJob(): Promise<void> {
  // Find open invoices with no payment attempts
  const openInvoices = await moneybird.getInvoices({
    status: 'open',
    period: { from: new Date(Date.now() - 90 * 24 * 60 * 60 * 1000), to: new Date() }
  });

  for (const invoice of openInvoices) {
    // Check if we have any unmatched payments
    const unmatchedPayments = await findPotentialPayments(invoice);
    if (unmatchedPayments.length > 0) {
      await attemptMatch(invoice, unmatchedPayments);
    }
  }
}
```

## Security Considerations

### API Credentials Management

```typescript
// Use Railway environment variables for sensitive data
interface Config {
  moneybird: {
    apiToken: string;
    administrationId: string;
    webhookUrl: string;
  };
  paypal: {
    clientId: string;
    clientSecret: string;
    webhookId?: string;
  };
  wise: {
    apiKey: string;
    profileId?: string;
  };
  database: {
    url: string;
  };
  redis: {
    url: string;
  };
}

// Never log sensitive data
const sanitizeConfig = (config: Config) => {
  return {
    ...config,
    moneybird: { ...config.moneybird, apiToken: '***' },
    paypal: { ...config.paypal, clientSecret: '***' },
    wise: { ...config.wise, apiKey: '***' },
  };
};
```

### Webhook Signature Verification

```typescript
// Moneybird uses HMAC signatures
function verifyMoneybirdWebhook(
  payload: string,
  signature: string,
  secret: string
): boolean {
  const hmac = crypto.createHmac('sha256', secret);
  hmac.update(payload);
  const digest = hmac.digest('base64');
  return crypto.timingSafeEqual(
    Buffer.from(signature),
    Buffer.from(digest)
  );
}
```

### Rate Limiting

```typescript
import RateLimit from 'express-rate-limit';
import RedisStore from 'rate-limit-redis';

const apiLimiter = RateLimit({
  store: new RedisStore({ client: redis }),
  windowMs: 60 * 1000, // 1 minute
  max: 100, // 100 requests per minute
  standardHeaders: true,
  legacyHeaders: false,
});
```

## Monitoring & Observability

### Logging Strategy

```typescript
import pino from 'pino';

const logger = pino({
  level: process.env.LOG_LEVEL || 'info',
  formatters: {
    level: (label) => ({ level: label }),
  },
  serializers: {
    error: pino.stdSerializers.err,
    req: pino.stdSerializers.req,
    res: pino.stdSerializers.res,
  },
});

// Structured logging
logger.info({
  msg: 'Payment synced to Moneybird',
  paymentId: payment.id,
  invoiceId: invoice.id,
  amount: payment.amount,
  provider: payment.provider,
});

// Error logging with context
logger.error({
  msg: 'Failed to sync payment',
  paymentId: payment.id,
  error: error.message,
  stack: error.stack,
  context: { attempt: 3, provider: 'paypal' },
});
```

### Metrics (Optional - for production)

```typescript
// Track key metrics
interface Metrics {
  // Counters
  paymentsFetched: Counter;
  paymentsMatched: Counter;
  paymentsSynced: Counter;
  syncErrors: Counter;

  // Histograms
  syncDuration: Histogram;
  matchingLatency: Histogram;

  // Gauges
  queueSize: Gauge;
  unmatchedPayments: Gauge;
}

// Example metric emission
metrics.paymentsSynced.inc({ provider: 'paypal' });
metrics.syncDuration.observe(Date.now() - startTime);
```

---

*Last updated: 2026-03-04*
