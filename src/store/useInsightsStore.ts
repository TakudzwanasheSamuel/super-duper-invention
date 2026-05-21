import { create } from 'zustand';
import { useUserStore } from './useUserStore';
import { useRateStore } from './useRateStore';
import { useTransactionStore } from './useTransactionStore';
import { useCategoryStore } from './useCategoryStore';
import {
  convertAmountCents,
  isNonSpendCategoryName,
  startOfCurrentMonth,
} from '@/utils/finance';

type DailySpending = {
  day: string;
  total: number;
};

type MonthlySpending = {
  month: string; // YYYY-MM
  total: number;
};

type CategorySpending = {
  category: string;
  total: number;
};

type State = {
  dailySpending: DailySpending[];
  monthlySpending: MonthlySpending[];
  categorySpending: CategorySpending[];
  totalSpent: number;
};

type Actions = {
  fetchDailySpending: () => void;
  fetchMonthlySpending: () => void;
  fetchCategorySpending: () => void;
  recomputeAll: () => void;
};

const DAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'] as const;

function getLastSixMonthKeys(): string[] {
  const months: string[] = [];
  const now = new Date();
  for (let i = 0; i < 6; i++) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
    months.push(
      `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`,
    );
  }
  return months.reverse();
}

/**
 * Compute insights state from in-memory transactions so the charts always
 * agree with the recent-transactions list and refresh whenever the user
 * adds, edits, or deletes a transaction.
 *
 * Savings / transfer categories are intentionally excluded — they drain your
 * balance but aren't "spending", so they shouldn't dominate the breakdown.
 */
function computeInsights(): State {
  const { transactions } = useTransactionStore.getState();
  const { primaryCurrency } = useUserStore.getState();
  const { lastRate } = useRateStore.getState();
  const { categories } = useCategoryStore.getState();

  const rate = lastRate && lastRate > 0 ? lastRate : 1;

  const categoryById = new Map<number, string>();
  categories.forEach(c => categoryById.set(c.id, c.name));

  const expenseTransactions = transactions.filter(t => {
    if (t.type !== 'expense') return false;
    const name = t.category_id != null ? categoryById.get(t.category_id) : undefined;
    return !isNonSpendCategoryName(name);
  });

  // --- Daily (by weekday, all-time) ---
  const dailyTotalsCents = new Array(7).fill(0) as number[];
  for (const t of expenseTransactions) {
    const weekday = new Date(t.timestamp).getDay();
    dailyTotalsCents[weekday] += convertAmountCents(
      t.amount,
      t.currency,
      primaryCurrency,
      rate,
    );
  }
  const dailySpending: DailySpending[] = DAYS.map((day, i) => ({
    day,
    total: dailyTotalsCents[i] / 100,
  }));

  // --- Monthly (last 6 months) ---
  const monthOrder = getLastSixMonthKeys();
  const sixMonthsAgo = new Date();
  sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);
  const sixMonthsCutoff = sixMonthsAgo.getTime();

  const monthlyTotalsCents = new Map<string, number>();
  monthOrder.forEach(m => monthlyTotalsCents.set(m, 0));
  for (const t of expenseTransactions) {
    if (t.timestamp < sixMonthsCutoff) continue;
    const d = new Date(t.timestamp);
    const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
    if (!monthlyTotalsCents.has(key)) continue;
    monthlyTotalsCents.set(
      key,
      (monthlyTotalsCents.get(key) ?? 0) +
        convertAmountCents(t.amount, t.currency, primaryCurrency, rate),
    );
  }
  const monthlySpending: MonthlySpending[] = monthOrder.map(month => ({
    month,
    total: (monthlyTotalsCents.get(month) ?? 0) / 100,
  }));

  // --- Category breakdown (current month) ---
  const monthStart = startOfCurrentMonth();
  const categoryTotalsCents = new Map<string, number>();
  for (const t of expenseTransactions) {
    if (t.timestamp < monthStart) continue;
    const name =
      (t.category_id != null && categoryById.get(t.category_id)) ||
      'Uncategorized';
    categoryTotalsCents.set(
      name,
      (categoryTotalsCents.get(name) ?? 0) +
        convertAmountCents(t.amount, t.currency, primaryCurrency, rate),
    );
  }
  const categorySpending: CategorySpending[] = Array.from(
    categoryTotalsCents.entries(),
  ).map(([category, totalCents]) => ({
    category,
    total: totalCents / 100,
  }));
  const totalSpent = categorySpending.reduce((acc, c) => acc + c.total, 0);

  return { dailySpending, monthlySpending, categorySpending, totalSpent };
}

export const useInsightsStore = create<State & Actions>((set) => ({
  dailySpending: [],
  monthlySpending: [],
  categorySpending: [],
  totalSpent: 0,

  recomputeAll: () => {
    set(computeInsights());
  },

  // Kept for backward compatibility with chart components that call these on mount.
  fetchDailySpending: () => {
    set(computeInsights());
  },
  fetchMonthlySpending: () => {
    set(computeInsights());
  },
  fetchCategorySpending: () => {
    set(computeInsights());
  },
}));

// Recompute insights any time the underlying data changes. The work is cheap
// (≤50 in-memory transactions) so we don't bother diffing specific slices —
// zustand v5's basic subscribe(listener) works without extra middleware.
const triggerRecompute = () => {
  useInsightsStore.getState().recomputeAll();
};
useTransactionStore.subscribe(triggerRecompute);
useRateStore.subscribe(triggerRecompute);
useUserStore.subscribe(triggerRecompute);
useCategoryStore.subscribe(triggerRecompute);
