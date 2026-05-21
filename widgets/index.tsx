/**
 * Android widget entrypoint.
 *
 * NOTE: This file is currently stubbed.
 *
 * The original implementation was written against an old API
 * (`registerWidget`, `openApp`, `a`) that no longer exists in
 * `react-native-android-widget@0.20.x`. The current version exports
 * declarative widget components (`FlexWidget`, `TextWidget`, `IconWidget`,
 * `ImageWidget`, etc.) and uses a widget-task-handler registration pattern.
 *
 * The widget config plugin in `app.json` still declares `SmallWidget` and
 * `MediumWidget` so the install/uninstall flow stays consistent. When we're
 * ready to ship widgets we'll rewrite this file against the v0.20 API.
 *
 * Until then, this module exposes the pure data-helpers we want the widget to
 * eventually use, so the rewrite is mechanical.
 */
import { useUserStore } from '@/store/useUserStore';
import { useTransactionStore } from '@/store/useTransactionStore';
import { useRateStore } from '@/store/useRateStore';
import { useCategoryStore } from '@/store/useCategoryStore';
import {
  computeNetBalance,
  computeTodaySpend,
  formatCurrency,
} from '@/utils/finance';

export function getNetBalanceText(): string {
  const { primaryCurrency } = useUserStore.getState();
  const { transactions } = useTransactionStore.getState();
  const { lastRate } = useRateStore.getState();
  const balance = computeNetBalance(transactions, primaryCurrency, lastRate);
  return formatCurrency(balance, primaryCurrency);
}

export function getTodaySpendText(): string {
  const { primaryCurrency } = useUserStore.getState();
  const { transactions } = useTransactionStore.getState();
  const { lastRate } = useRateStore.getState();
  const todaySpend = computeTodaySpend(transactions, primaryCurrency, lastRate);
  return formatCurrency(todaySpend, primaryCurrency);
}

export function getLastTransactionLabel(): string {
  const { transactions } = useTransactionStore.getState();
  const { categories } = useCategoryStore.getState();

  if (transactions.length === 0) return 'No recent transactions';

  const sorted = [...transactions].sort((a, b) => b.timestamp - a.timestamp);
  const last = sorted[0];
  const category =
    last.category_id != null ? categories.find(c => c.id === last.category_id) : undefined;
  const label = last.note?.trim() || category?.name || 'Transaction';
  return `${label}: ${formatCurrency(last.amount / 100, last.currency)}`;
}

export const WIDGET_DEEP_LINK = 'mybudget://budget';
