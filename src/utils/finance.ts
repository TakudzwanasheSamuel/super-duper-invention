import { TransactionRow } from '@/api/db';

type Currency = 'USD' | 'ZiG';

/**
 * Locale-aware currency formatter. Used everywhere we display money to the user
 * so the format is consistent (thousands separators, NaN-safe, ZiG symbol that
 * isn't a real ISO code).
 *
 * Example: formatCurrency(1234.5, 'USD') -> "$1,234.50"
 *          formatCurrency(1234.5, 'ZiG') -> "Z1,234.50"
 */
const NUMBER_FORMATTER = new Intl.NumberFormat('en-US', {
  minimumFractionDigits: 2,
  maximumFractionDigits: 2,
});

export function formatCurrency(
  amount: number,
  currency: Currency,
  options?: { showSign?: boolean },
): string {
  const safe = Number.isFinite(amount) ? amount : 0;
  const symbol = currency === 'USD' ? '$' : 'Z';
  const abs = Math.abs(safe);
  const body = `${symbol}${NUMBER_FORMATTER.format(abs)}`;
  if (options?.showSign) {
    if (safe < 0) return `-${body}`;
    if (safe > 0) return `+${body}`;
  } else if (safe < 0) {
    return `-${body}`;
  }
  return body;
}

/**
 * Shorter formatter for compact contexts (e.g. chart axis labels).
 * 1,234.56 -> "1.2k", 1,234,567 -> "1.2M"
 */
export function formatCompactNumber(amount: number): string {
  const safe = Number.isFinite(amount) ? amount : 0;
  const abs = Math.abs(safe);
  if (abs >= 1_000_000) return `${(safe / 1_000_000).toFixed(1)}M`;
  if (abs >= 1_000) return `${(safe / 1_000).toFixed(1)}k`;
  return safe.toFixed(0);
}

/**
 * Categories that represent transfers / savings rather than real spending.
 * Excluded from spending charts and "Monthly Spend" stats so that money you
 * set aside doesn't look like money you spent.
 */
export const NON_SPEND_CATEGORY_NAMES: ReadonlySet<string> = new Set([
  'savings',
  'savings goal',
  'transfer',
]);

export function isNonSpendCategoryName(categoryName: string | undefined | null): boolean {
  if (!categoryName) return false;
  return NON_SPEND_CATEGORY_NAMES.has(categoryName.trim().toLowerCase());
}

export function startOfCurrentMonth(): number {
  const d = new Date();
  d.setDate(1);
  d.setHours(0, 0, 0, 0);
  return d.getTime();
}

/**
 * Convert a raw transaction amount (in cents) to the given primary currency.
 * Uses the same rule the rest of the app applies in getConvertedBalance:
 * - If the transaction is already in the primary currency, no conversion.
 * - Else if primary is USD, divide by rate (ZiG -> USD).
 * - Else (primary is ZiG), multiply by rate (USD -> ZiG).
 */
export function convertAmountCents(
  amountCents: number,
  fromCurrency: Currency,
  primaryCurrency: Currency,
  rate: number,
): number {
  if (fromCurrency === primaryCurrency) return amountCents;
  if (!rate || rate <= 0) return amountCents;
  if (primaryCurrency === 'USD') return Math.round(amountCents / rate);
  return Math.round(amountCents * rate);
}

/**
 * Net balance across all transactions, expressed in primary currency (whole units).
 * Income adds, expense subtracts.
 */
export function computeNetBalance(
  transactions: TransactionRow[],
  primaryCurrency: Currency,
  rate: number,
): number {
  const totalCents = transactions.reduce((acc, t) => {
    const converted = convertAmountCents(t.amount, t.currency, primaryCurrency, rate);
    return acc + (t.type === 'income' ? converted : -converted);
  }, 0);
  return totalCents / 100;
}

/**
 * Total spend for today (expenses only) in primary currency (whole units).
 */
export function computeTodaySpend(
  transactions: TransactionRow[],
  primaryCurrency: Currency,
  rate: number,
): number {
  const today = new Date().toDateString();
  const totalCents = transactions
    .filter(t => t.type === 'expense' && new Date(t.timestamp).toDateString() === today)
    .reduce((acc, t) => acc + convertAmountCents(t.amount, t.currency, primaryCurrency, rate), 0);
  return totalCents / 100;
}
