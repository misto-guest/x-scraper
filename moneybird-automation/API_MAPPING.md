# API Field Mapping

## PayPal → Moneybird

### Transaction Mapping

| PayPal Field | Moneybird Field | Notes |
|-------------|-----------------|-------|
| `id` | `reference` | Store PayPal transaction ID |
| `amount.total` | `amount` | Amount in invoice currency |
| `transaction_unit.currency_code` | `currency` | Currency code (USD, EUR, etc.) |
| `create_time` | `payment_date` | ISO 8601 date |
| `custom_id` | `reference` | If invoice number is stored here |
| `item_list.items[0].name` | `description` | Payment description |
| `transaction_fee.value` | Not synced | Store separately for reference |

### Amount Calculation

```typescript
// Moneybird requires payment amount (net of fees)
moneybirdAmount = paypalAmount - paypalFee
```

### Matching Strategy

1. **Primary:** Match by `custom_id` (if contains invoice number)
2. **Secondary:** Match by amount + date (within 3 days)
3. **Fallback:** Fuzzy match on description

## Wise → Moneybird

### Transfer Mapping

| Wise Field | Moneybird Field | Notes |
|------------|-----------------|-------|
| `id` | `reference` | Wise transfer ID |
| `amount` | `amount` | Target amount |
| `targetCurrency` | `currency` | Currency of payment |
| `createdOn` | `payment_date` | Transfer creation date |
| `reference` (customer) | `reference` | Customer reference (invoice #) |
| `details.reference` | `description` | Payment description |
| `fee` | Not synced | Store separately |

### Multi-Currency Handling

```typescript
// Convert to Moneybird invoice currency if needed
if (wiseCurrency !== invoiceCurrency) {
  // Get Wise's rate or fetch market rate
  convertedAmount = convert(wiseAmount, wiseCurrency, invoiceCurrency, wiseDate);
}
```

### Matching Strategy

1. **Primary:** Match by `reference` field (customer reference)
2. **Secondary:** Match by converted amount + date
3. **Currency:** Always convert to invoice currency before matching

## Payoneer → Moneybird

### Payment Mapping

| Payoneer Field | Moneybird Field | Notes |
|----------------|-----------------|-------|
| `transaction_id` | `reference` | Payoneer transaction ID |
| `amount` | `amount` | Payment amount |
| `currency` | `currency` | Currency code |
| `payment_date` | `payment_date` | Payment date |
| `description` | `description` | Payment description |
| `client_name` | Contact lookup | Find contact by name |

**Note:** Payoneer API availability unclear - may need CSV import

## Amex CSV → Moneybird

### CSV Format (Typical)

```csv
Date,Description,Amount,Reference,Card_Number
2026-03-01,"AMAZON EU SARL",125.50,"",1234
```

### Field Mapping

| CSV Column | Moneybird Field | Notes |
|-----------|-----------------|-------|
| `Date` | `payment_date` | Parse CSV date format |
| `Amount` | `amount` | May need sign flip (-) |
| `Reference` | `reference` | Transaction reference |
| `Description` | `description` | Merchant name/description |

### CSV Import Process

1. Parse CSV with validation
2. Show preview to user
3. Match to invoices (auto or manual)
4. Confirm and register payments
5. Mark as synced

## Generic Matching Algorithm

```typescript
interface MatchScore {
  invoiceId: string;
  score: number;  // 0-100
  reasons: string[];
}

function calculateMatchScore(
  payment: ProviderTransaction,
  invoice: MoneybirdInvoice
): MatchScore {
  let score = 0;
  const reasons: string[] = [];

  // Amount match (40 points)
  if (payment.amount === invoice.totalAmount) {
    score += 40;
    reasons.push('exact_amount');
  } else if (Math.abs(payment.amount - invoice.totalAmount) < 0.01) {
    score += 35;
    reasons.push('amount_close');
  }

  // Date match (30 points)
  const daysDiff = daysBetween(payment.paymentDate, invoice.invoiceDate);
  if (daysDiff <= 1) {
    score += 30;
    reasons.push(`date_match_${daysDiff}_days`);
  } else if (daysDiff <= 7) {
    score += 20;
    reasons.push(`date_within_week`);
  }

  // Reference match (30 points)
  if (payment.reference && payment.reference === invoice.invoiceNumber) {
    score += 30;
    reasons.push('reference_match');
  }

  // Description contains invoice number (10 points)
  if (payment.description?.includes(invoice.invoiceNumber)) {
    score += 10;
    reasons.push('invoice_in_description');
  }

  // Currency match (required)
  if (payment.currency !== invoice.currency) {
    score = 0;  // Disqualify
    reasons.push('currency_mismatch');
  }

  return { invoiceId: invoice.id, score, reasons };
}

// Match decision logic
function decideMatch(
  scores: MatchScore[]
): { type: 'exact' | 'multiple' | 'none' | 'low_confidence', match?: MatchScore } {
  if (scores.length === 0) {
    return { type: 'none' };
  }

  const sorted = scores.sort((a, b) => b.score - a.score);
  const top = sorted[0];

  if (top.score >= 90) {
    return { type: 'exact', match: top };
  }

  if (top.score >= 70 && top.score > sorted[1]?.score + 20) {
    return { type: 'exact', match: top };
  }

  if (sorted.filter(s => s.score >= 50).length > 1) {
    return { type: 'multiple' };
  }

  if (top.score >= 50) {
    return { type: 'low_confidence', match: top };
  }

  return { type: 'none' };
}
```

## Currency Conversion

When payment and invoice currencies differ:

```typescript
interface ExchangeRate {
  from: string;
  to: string;
  rate: number;
  date: Date;
  source: 'wise' | 'payment_provider' | 'market';
}

async function getExchangeRate(
  from: string,
  to: string,
  date: Date
): Promise<number> {
  // Priority:
  // 1. Use provider's rate (if available)
  // 2. Fetch historical rate from external API
  // 3. Use fallback rate (with warning)
}

async function convertToInvoiceCurrency(
  payment: ProviderTransaction,
  invoice: MoneybirdInvoice
): Promise<number> {
  if (payment.currency === invoice.currency) {
    return payment.amount;
  }

  const rate = await getExchangeRate(
    payment.currency,
    invoice.currency,
    payment.paymentDate
  );

  return payment.amount * rate;
}
```

## Error Mapping

| Provider Error | Moneybird Action | User Message |
|----------------|------------------|--------------|
| `INVALID_CREDENTIALS` | Retry after alert | API credentials expired |
| `RATE_LIMIT_EXCEEDED` | Queue for retry | Too many requests, retrying |
| `TRANSACTION_NOT_FOUND` | Skip | Transaction no longer exists |
| `INVOICE_NOT_FOUND` | Flag for review | Invoice not found in Moneybird |
| `DUPLICATE_PAYMENT` | Skip | Payment already registered |
| `CURRENCY_MISMATCH` | Flag for review | Currency doesn't match invoice |
| `AMOUNT_MISMATCH` | Flag for review | Amount doesn't match invoice |

## Webhook Event Mapping

### Moneybird → Application

| Moneybird Event | Application Action |
|-----------------|-------------------|
| `sales_invoice_created` | Check for pending payments |
| `sales_invoice_updated` | Re-check matching |
| `sales_invoice_paid` | Mark payment as synced |
| `contact_created` | Update contact cache |
| `contact_updated` | Update contact cache |

### Application → External (Optional)

| Application Event | Notification Target |
|-------------------|---------------------|
| `payment_matched` | Dashboard alert |
| `payment_synced` | Audit log |
| `sync_failed` | Error alert |
| `unmatched_payment` | Review queue |

---

*Last updated: 2026-03-04*
