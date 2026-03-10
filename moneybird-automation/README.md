# Moneybird Automation Research

## Project Overview

**Goal:** Automate Moneybird bookkeeping workflows by integrating multiple payment sources and processing transactions automatically.

**Current Pain Points:**
- Manual processing of bank transactions in Moneybird
- Manual entry of payments from multiple sources (Amex, PayPal, Payoneer, etc.)
- Time-consuming reconciliation process
- Risk of human error in data entry

**Target Stack:**
- Runtime: Node.js/TypeScript
- Deployment: Railway
- Version Control: GitHub
- Architecture: Microservices with webhooks + scheduled jobs

---

## Table of Contents

1. [Moneybird API Research](#01-moneybird-api-research)
2. [Payment Provider APIs](#02-payment-provider-apis)
3. [Proposed Architecture](#03-proposed-architecture)
4. [Implementation Phases](#04-implementation-phases)
5. [Data Flow Design](#05-data-flow-design)
6. [Development Effort Estimate](#06-development-effort-estimate)
7. [Priority Recommendations](#07-priority-recommendations)
8. [Next Steps](#08-next-steps)

---

## 1. Moneybird API Research

### API Overview

**Base URL:** `https://moneybird.com/api/v2/`
**Documentation:** https://developer.moneybird.com/
**Authentication:** Bearer token (API Token from Moneybird administration)

### Key API Endpoints

#### Sales Invoices
```
GET    /api/v2/:administration_id/sales_invoices
POST   /api/v2/:administration_id/sales_invoices
GET    /api/v2/:administration_id/sales_invoices/:id
PATCH  /api/v2/:administration_id/sales_invoices/:id
DELETE /api/v2/:administration_id/sales_invoices/:id
```

#### Payments (Transaction Registration)
```
POST   /api/v2/:administration_id/sales_invoice_payments
POST   /api/v2/:administration_id/purchase_invoice_payments
```

#### Bank Transactions
```
GET    /api/v2/:administration_id/bank_transactions
POST   /api/v2/:administration_id/bank_transactions
GET    /api/v2/:administration_id/bank_transactions/:id
PATCH  /api/v2/:administration_id/bank_transactions/:id
```

#### Webhooks
```
GET    /api/v2/:administration_id/webhooks
POST   /api/v2/:administration_id/webhooks
DELETE /api/v2/:administration_id/webhooks/:id
```

### Webhook Events

Moneybird supports webhooks for:
- `sales_invoice_created`
- `sales_invoice_updated`
- `sales_invoice_paid`
- `purchase_invoice_created`
- `purchase_invoice_updated`
- `purchase_invoice_paid`
- `bank_transaction_created`
- `bank_transaction_updated`
- `contact_created`
- `contact_updated`

### API Capabilities

✅ **Fully Supported:**
- Create/update sales invoices
- Register payments on invoices
- Create bank transactions
- Query transactions and invoices
- Set up webhooks for real-time updates
- Multiple administrations support

⚠️ **Limitations:**
- Rate limiting: ~100 requests/minute (approximate)
- No bulk import endpoints for payments
- Payment registration requires invoice ID lookup first
- Webhooks require HTTPS endpoint

### Authentication Pattern

```typescript
const moneybirdClient = axios.create({
  baseURL: 'https://moneybird.com/api/v2',
  headers: {
    'Authorization': `Bearer ${API_TOKEN}`,
    'Content-Type': 'application/json'
  }
});
```

---

## 2. Payment Provider APIs

### PayPal API

**Documentation:** https://developer.paypal.com/api/rest/

**Key Endpoints:**
- `/v1/reporting/transactions` - Transaction history
- `/v1/notifications/webhooks` - Webhooks for payment events

**Authentication:** OAuth 2.0 (Client ID + Secret)

**Availability:** ✅ Well-documented, mature API

**Data Available:**
- Transaction ID, amount, currency, date
- Payer information
- Payment status (completed, pending, refunded)
- Fee information
- Invoice tracking (if linked)

---

### Payoneer API

**Documentation:** https://developer.payoneer.com/

**Key Capabilities:**
- Account balance
- Transaction history
- Payment notifications

**Authentication:** API Key + Partner ID

**Availability:** ⚠️ Limited public documentation
- May require partner account
- Some endpoints may require special approval

**Workaround Consideration:** CSV export option if API is limited

---

### Wise API (formerly TransferWise)

**Documentation:** https://wise.com/api-docs/

**Key Endpoints:**
- `/v1/transfers` - Transfer history
- `/v1/profiles/:profile_id/balance` - Balance statements
- `/v1/accounts/:account_id/statement` - Account statements

**Authentication:** OAuth 2.0 or API tokens

**Availability:** ✅ Good API, but requires business account

**Data Available:**
- Transfer details (amount, fees, status)
- Recipient/sender information
- Timestamps
- Currency conversion details

---

### American Express (Amex)

**Documentation:** https://developer.americanexpress.com/

**Availability:** ❌ Limited public API
- No general transaction history API for small businesses
- May require enterprise partnership
- APIs typically focus on card benefits, offers, etc.

**Workaround Options:**
1. Manual CSV export (monthly)
2. Bank feed if Amex is linked to bank that syncs to Moneybird
3. Email parsing (if Amex sends transaction notifications)

**Recommendation:** Check if Amex → Bank → Moneybird flow is possible

---

### Carddate

**Status:** ❓ Unknown - Requires research

**Possible Scenarios:**
- Payment processor (similar to Stripe)
- Prepaid card provider
- Expense management tool
- Dutch payment service

**Action Required:** Clarify what Carddate is and investigate API availability

---

### Vincas Accounts

**Status:** ❓ Unknown - Likely internal/niche system

**Assumption:** Internal accounting system or payment gateway

**Action Required:** Investigate if API exists or if CSV export is available

---

### BCH Invoices

**Likely Meaning:** Bitcoin Cash payment invoices

**Options:**
1. If using a payment processor (e.g., BitPay, Coinbase Commerce)
   - Check processor API
2. If direct BCH payments
   - May need blockchain explorer API integration
   - Consider manual entry for low volume

**Recommendation:** Investigate payment processor used

---

## 3. Proposed Architecture

### High-Level Design

```
┌─────────────────────────────────────────────────────────────────┐
│                     Railway Deployment                          │
│                                                                   │
│  ┌───────────────────────────────────────────────────────────┐  │
│  │              API Gateway / Express Server                  │  │
│  │  ┌─────────────┐  ┌─────────────┐  ┌─────────────────┐    │  │
│  │  │ Webhook     │  │ Scheduler   │  │ Manual Trigger  │    │  │
│  │  │ Handlers    │  │ (Cron Jobs) │  │ Endpoints       │    │  │
│  │  └──────┬──────┘  └──────┬──────┘  └────────┬────────┘    │  │
│  └─────────┼────────────────┼──────────────────┼─────────────┘  │
│            │                │                   │               │
│  ┌─────────┼────────────────┼──────────────────┼─────────────┐  │
│  │         │      ┌─────────▼─────────┐       │               │  │
│  │         │      │  Service Layer    │       │               │  │
│  │         │      │  ┌──────────────┐ │       │               │  │
│  │         │      │  │ Moneybird    │ │       │               │  │
│  │         │      │  │ Service      │ │       │               │  │
│  │         │      │  └───────┬──────┘ │       │               │  │
│  │         │      │  ┌───────▼──────┐ │       │               │  │
│  │         │      │  │ PayPal       │ │       │               │  │
│  │         │      │  │ Service      │ │       │               │  │
│  │         │      │  └───────┬──────┘ │       │               │  │
│  │         │      │  ┌───────▼──────┐ │       │               │  │
│  │         │      │  │ Wise         │ │       │               │  │
│  │         │      │  │ Service      │ │       │               │  │
│  │         │      │  └───────┬──────┘ │       │               │  │
│  │         │      │  ┌───────▼──────┐ │       │               │  │
│  │         │      │  │ CSV Import   │ │       │               │  │
│  │         │      │  │ Service      │ │       │               │  │
│  │         │      │  └───────┬──────┘ │       │               │  │
│  │         │      └──────────┼────────┘       │               │  │
│  └─────────┼─────────────────┼────────────────┼───────────────┘  │
│            │                 │                 │                 │
│  ┌─────────▼─────────────────▼─────────────────▼─────────────┐  │
│  │                    Data Access Layer                       │  │
│  │  ┌─────────────┐  ┌─────────────┐  ┌─────────────────┐    │  │
│  │  │ PostgreSQL  │  │ Redis       │  │ File Storage    │    │  │
│  │  │ (Railway)   │  │ (Cache)     │  │ (CSV uploads)   │    │  │
│  │  └─────────────┘  └─────────────┘  └─────────────────┘    │  │
│  └───────────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────────┘
                           │
                           │ HTTPS/Webhooks
                           ▼
┌─────────────────────────────────────────────────────────────────┐
│                     External Services                           │
│                                                                   │
│  ┌──────────┐  ┌────────┐  ┌──────┐  ┌────────┐  ┌─────────┐   │
│  │Moneybird │  │ PayPal │  │ Wise │  │Payoneer│  │Amex CSV │   │
│  │   API    │  │  API   │  │ API  │  │  API   │  │ Upload  │   │
│  └──────────┘  └────────┘  └──────┘  └────────┘  └─────────┘   │
└─────────────────────────────────────────────────────────────────┘
```

### Core Components

#### 1. API Gateway (Express/Fastify)
- Routes webhooks from Moneybird
- Exposes manual trigger endpoints
- Health check endpoints
- Authentication middleware

#### 2. Moneybird Service
- Invoice matching logic
- Payment registration
- Transaction reconciliation
- Webhook setup/management

#### 3. Provider Services (modular)
- PayPalService - Fetch transactions
- WiseService - Fetch transfers
- PayoneerService - Fetch payments
- CSVImportService - Manual upload handling
- AmexCSVService - Parse Amex exports

#### 4. Scheduler (node-cron)
- Daily sync jobs
- Retry failed transactions
- Reconciliation tasks

#### 5. Data Layer
- PostgreSQL: Transaction logs, invoice mappings, sync state
- Redis: Rate limiting, caching, job locks
- File Storage: Temporary CSV uploads

### Directory Structure

```
moneybird-automation/
├── src/
│   ├── api/
│   │   ├── routes/
│   │   │   ├── webhooks.ts
│   │   │   ├── manual.ts
│   │   │   └── health.ts
│   │   └── server.ts
│   ├── services/
│   │   ├── moneybird/
│   │   │   ├── client.ts
│   │   │   ├── invoices.ts
│   │   │   ├── payments.ts
│   │   │   └── webhooks.ts
│   │   ├── providers/
│   │   │   ├── paypal/
│   │   │   │   ├── client.ts
│   │   │   │   └── transactions.ts
│   │   │   ├── wise/
│   │   │   │   ├── client.ts
│   │   │   │   └── transfers.ts
│   │   │   ├── payoneer/
│   │   │   │   └── client.ts
│   │   │   └── csv/
│   │   │       ├── parser.ts
│   │   │       └── amex.ts
│   │   ├── sync/
│   │   │   ├── invoice-matcher.ts
│   │   │   ├── payment-registrar.ts
│   │   │   └── reconciler.ts
│   │   └── jobs/
│   │       ├── daily-sync.ts
│   │       ├── retry-failed.ts
│   │       └── reconciliation.ts
│   ├── db/
│   │   ├── models/
│   │   │   ├── transaction.ts
│   │   │   ├── invoice-map.ts
│   │   │   └── sync-state.ts
│   │   └── client.ts
│   ├── types/
│   │   ├── moneybird.ts
│   │   ├── providers.ts
│   │   └── config.ts
│   ├── utils/
│   │   ├── logger.ts
│   │   ├── errors.ts
│   │   └── cache.ts
│   └── index.ts
├── tests/
│   ├── unit/
│   ├── integration/
│   └── fixtures/
├── railway/
│   ├── config.json
│   └── Procfile
├── docs/
│   ├── API.md
│   ├── DEPLOYMENT.md
│   └── TROUBLESHOOTING.md
├── .env.example
├── package.json
├── tsconfig.json
└── README.md
```

---

## 4. Implementation Phases

### Phase 1: Foundation (Week 1-2) ✅

**Goal:** Set up core infrastructure and Moneybird integration

**Tasks:**
1. Initialize TypeScript project
2. Set up Railway deployment
3. Configure PostgreSQL + Redis
4. Implement Moneybird API client
5. Implement webhook receiver
6. Test invoice retrieval
7. Test payment registration

**Deliverables:**
- Deployed app skeleton
- Working Moneybird client
- Webhook endpoint (health check)

**Success Criteria:**
- Can fetch invoices from Moneybird
- Can register a payment on an invoice
- Webhook endpoint is reachable

---

### Phase 2: PayPal Integration (Week 3) 🚀

**Goal:** First live payment provider integration

**Tasks:**
1. Implement PayPal OAuth flow
2. Build transaction fetcher
3. Map PayPal transactions to Moneybird payments
4. Handle currency conversion
5. Build payment matching logic
6. Implement error handling + retry

**Deliverables:**
- Working PayPal integration
- Automatic payment registration
- Transaction history sync

**Success Criteria:**
- PayPal payments auto-sync to Moneybird
- Invoices marked as paid correctly
- Failed syncs are logged/retried

---

### Phase 3: CSV Import Framework (Week 4) 📊

**Goal:** Handle providers without APIs (Amex, etc.)

**Tasks:**
1. Build CSV upload endpoint
2. Create CSV parser library
3. Implement Amex CSV parser
4. Add validation + error reporting
5. Build preview/match confirmation UI (optional)

**Deliverables:**
- CSV upload functionality
- Amex payment import
- Generic CSV import framework

**Success Criteria:**
- Can upload and parse Amex CSV
- Payments are matched to invoices
- Clear error messages for invalid data

---

### Phase 4: Wise Integration (Week 5) 💰

**Goal:** Add Wise API integration

**Tasks:**
1. Implement Wise API client
2. Fetch transfer history
3. Handle multi-currency transactions
4. Map to Moneybird payments
5. Add currency conversion tracking

**Deliverables:**
- Working Wise integration
- Multi-currency support

**Success Criteria:**
- Wise transfers auto-sync
- Currency handling is correct
- Fees are properly recorded

---

### Phase 5: Payoneer + Specialized Cases (Week 6) 🏦

**Goal:** Complete provider coverage

**Tasks:**
1. Research Payoneer API access
2. Implement Payoneer client (if available) OR CSV import
3. Handle Carddate (clarify requirements)
4. Handle Vincas accounts (clarify requirements)
5. Handle BCH invoices (clarify processor)

**Deliverables:**
- Payoneer integration
- Documentation for specialized cases

**Success Criteria:**
- All identified providers have integration path
- Manual fallbacks documented

---

### Phase 6: Smart Features (Week 7-8) 🧠

**Goal:** Add intelligence and automation

**Tasks:**
1. **Automatic Invoice Matching**
   - Match payments by amount + date
   - Use reference numbers when available
   - Fuzzy matching for near-matches

2. **Categorization**
   - Auto-categorize by description patterns
   - Learn from user corrections (optional ML)

3. **Reconciliation Dashboard**
   - Show unmatched payments
   - Show unmatched invoices
   - Manual match interface

4. **Notification System**
   - Alert on payment failures
   - Daily summary emails
   - Unusual transaction detection

**Deliverables:**
- Smart matching algorithm
- Categorization system
- Dashboard/notifications

**Success Criteria:**
- 80%+ auto-match rate
- Clear visibility into unmatched items
- Proactive error alerts

---

### Phase 7: Production Hardening (Week 9) 🔒

**Goal:** Ready for production use

**Tasks:**
1. Add comprehensive logging
2. Implement rate limiting
3. Add monitoring + alerting
4. Security audit
5. Load testing
6. Documentation completion
7. Backup/restore procedures

**Deliverables:**
- Production-ready system
- Complete documentation
- Monitoring dashboard

**Success Criteria:**
- Passes security review
- Handles expected load
- Clear runbooks for incidents

---

## 5. Data Flow Design

### Payment Sync Flow

```
┌──────────────┐
│  Scheduled   │
│   Trigger    │
│  (Daily)     │
└──────┬───────┘
       │
       ▼
┌─────────────────────────────────────────────────┐
│  1. Fetch Recent Transactions                   │
│     - PayPal API (last 24h)                     │
│     - Wise API (last 24h)                       │
│     - Payoneer API (last 24h)                   │
└──────────────────┬──────────────────────────────┘
                   │
                   ▼
┌─────────────────────────────────────────────────┐
│  2. Filter New/Updated Transactions             │
│     - Check against sync_state table            │
│     - Flag transactions needing processing      │
└──────────────────┬──────────────────────────────┘
                   │
                   ▼
┌─────────────────────────────────────────────────┐
│  3. Match to Moneybird Invoices                 │
│     - Search by reference number                │
│     - Match by amount + date range              │
│     - Flag for manual review if no match        │
└──────────────────┬──────────────────────────────┘
                   │
        ┌──────────┴──────────┐
        ▼                     ▼
┌───────────────┐      ┌──────────────┐
│   Matched     │      │  Unmatched   │
│   Payments    │      │  Payments    │
└───────┬───────┘      └──────┬───────┘
        │                     │
        ▼                     ▼
┌──────────────────┐   ┌──────────────────┐
│ Register Payment │   │ Store in Queue   │
│  in Moneybird    │   │ for Review       │
└────────┬─────────┘   └──────────────────┘
         │
         ▼
┌──────────────────┐
│  Update State    │
│  (mark synced)   │
└──────────────────┘
```

### Webhook Flow (Real-time)

```
┌──────────────┐
│  Moneybird   │
│  Webhook     │
└──────┬───────┘
       │
       ▼
┌─────────────────────────────────────────────────┐
│  Webhook Handler                                │
│  - Verify signature                             │
│  - Parse event type                             │
│  - Extract entity data                          │
└──────────────────┬──────────────────────────────┘
                   │
       ┌───────────┴───────────┐
       ▼                       ▼
┌─────────────┐         ┌─────────────┐
│ Invoice     │         │ Transaction │
│ Created     │        │ Created     │
└──────┬──────┘         └──────┬──────┘
       │                       │
       ▼                       ▼
┌──────────────────┐   ┌──────────────────┐
│ Check Payment    │   │ Auto-categorize  │
│ Providers        │   │ if configured    │
└──────────────────┘   └──────────────────┘
```

### Error Handling Strategy

```
┌─────────────────────────────────────────────────┐
│  Error Classification                           │
│  ┌─────────────┐ ┌─────────────┐ ┌───────────┐│
│  │ Transient   │ │ Config      │ │ Data      ││
│  │ (retry)     │ │ (fatal)     │ │ (manual)  ││
│  └──────┬──────┘ └──────┬──────┘ └─────┬─────┘│
└─────────┼─────────────────┼──────────────┼─────┘
          │                 │              │
          ▼                 ▼              ▼
    ┌─────────┐       ┌─────────┐    ┌─────────┐
    │ Retry   │       │ Alert   │    │ Queue   │
    │ (exp    │       │ Admin   │    │ for     │
    │ backoff)│       │         │    │ Review  │
    └─────────┘       └─────────┘    └─────────┘
```

---

## 6. Development Effort Estimate

### Time Breakdown

| Phase | Duration | Developer Days |
|-------|----------|----------------|
| Phase 1: Foundation | 2 weeks | 10 |
| Phase 2: PayPal | 1 week | 5 |
| Phase 3: CSV Framework | 1 week | 5 |
| Phase 4: Wise | 1 week | 5 |
| Phase 5: Payoneer + Specialized | 1 week | 5 |
| Phase 6: Smart Features | 2 weeks | 10 |
| Phase 7: Production Hardening | 1 week | 5 |
| **Total** | **9 weeks** | **45 days** |

### Resource Requirements

**Development:**
- 1 Full-stack Developer (9 weeks)
- OR 1 Senior Developer + 1 Junior Developer (6 weeks)

**Infrastructure (Railway):**
- Starter plan: ~$5-20/month
  - 1x Service (API)
  - 1x PostgreSQL
  - 1x Redis
- Overages possible with high transaction volume

**Third-party APIs:**
- PayPal: Free (standard rate limits)
- Wise: Free (business account required)
- Payoneer: TBD (may require partnership)
- Moneybird: Free (included in subscription)

---

## 7. Priority Recommendations

### High Priority (Start Immediately) 🚨

1. **PayPal Integration**
   - Well-documented API
   - Likely high transaction volume
   - Quick win to demonstrate value

2. **CSV Import Framework**
   - Handles Amex (no API)
   - Future-proofs for other providers
   - Manual fallback for all systems

3. **Moneybird Webhook Setup**
   - Enables real-time processing
   - Reduces polling overhead
   - Better user experience

### Medium Priority (Phase 2) ⚠️

4. **Wise Integration**
   - Good API available
   - Multi-currency support important
   - Common for international businesses

5. **Smart Matching Algorithm**
   - Reduces manual work
   - Improves accuracy
   - Scales well

### Low Priority (Phase 3) 📝

6. **Payoneer Integration**
   - API access unclear
   - May require partnership
   - Can start with CSV import

7. **Carddate / Vincas / BCH**
   - Clarify requirements first
   - May not need full automation
   - Evaluate volume vs. effort

### Not Recommended ❌

8. **Amex API**
   - No suitable API available
   - CSV import is better path
   - Consider bank feed workaround

---

## 8. Next Steps

### Immediate Actions (This Week)

1. **API Access Verification**
   - [ ] Obtain Moneybird API token
   - [ ] Verify PayPal API credentials
   - [ ] Check Wise API access
   - [ ] Confirm Payoneer API availability

2. **Environment Setup**
   - [ ] Create GitHub repository
   - [ ] Initialize Railway project
   - [ ] Set up development environment
   - [ ] Configure TypeScript + linting

3. **Clarification Questions**
   - [ ] What is Carddate? Payment processor or card provider?
   - [ ] What are Vincas accounts? Internal system or external provider?
   - [ ] How are BCH invoices processed? Which payment processor?
   - [ ] What is the monthly transaction volume per provider?
   - [ ] Are there reference numbers shared between payment providers and Moneybird?

4. **Proof of Concept**
   - [ ] Build Moneybird client proof-of-concept
   - [ ] Test payment registration manually
   - [ ] Validate webhook setup

### First Sprint Goals (2 Weeks)

**Deliverable:** Working Moneybird integration that can:
- Fetch open invoices
- Register a payment
- Handle basic webhooks

**Demo:** Show PayPal payment → Moneybird invoice payment flow

---

## Appendix

### Key URLs

- Moneybird API: https://developer.moneybird.com/
- PayPal API: https://developer.paypal.com/api/rest/
- Wise API: https://wise.com/api-docs/
- Payoneer: https://developer.payoneer.com/
- Railway: https://railway.app/

### Technology Choices

| Component | Choice | Rationale |
|-----------|--------|-----------|
| Runtime | Node.js 20+ | Team familiar, good async support |
| Language | TypeScript | Type safety, better DX |
| Framework | Express or Fastify | Widely used, good ecosystem |
| ORM | Prisma | Type-safe, great migrations |
| Queue | Bull (Redis) | Robust job queue |
| Cache | Redis | Fast, already needed for Bull |
| Deployment | Railway | Simple, managed, good scaling |
| Monitoring | Sentry (errors), Railway logs | Error tracking + visibility |

### Risk Factors

| Risk | Impact | Mitigation |
|------|--------|------------|
| Payoneer API unavailable | Medium | CSV import fallback |
| Amex no API | Low | CSV import works well |
| Rate limiting | Medium | Implement queuing, batching |
| Payment matching errors | High | Manual review queue, audit logs |
| Moneybird API changes | Medium | Version locking, upgrade path |

---

*Document created: 2026-03-04*
*Last updated: 2026-03-04*
*Author: Moneybird Automation Research Subagent*
