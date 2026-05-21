import { useEffect, useState } from 'react';
import * as SecureStore from 'expo-secure-store';
import { initDB } from '@/api/db';
import { openLegacyDatabase } from '@/api/sqliteCompat';
import { useUserStore } from '@/store/useUserStore';
import { useCategoryStore } from '@/store/useCategoryStore';
import { useTransactionStore } from '@/store/useTransactionStore';
import { useRateStore } from '@/store/useRateStore';
import { useSubscriptionStore } from '@/store/useSubscriptionStore';
import { useGroceryStore } from '@/store/useGroceryStore';
import { useInsightsStore } from '@/store/useInsightsStore';
import { PIN_KEY } from '@/constants/auth';

const db = openLegacyDatabase('dark-luxury.db');

/**
 * Centralized startup hook.
 * - Initializes the database (creates tables, seeds default categories).
 * - Restores user, primary currency, isFirstLaunch from SQLite.
 * - Hydrates every store so the rest of the app doesn't render with empty data.
 * - Syncs currentExchangeRate from lastRate so balances/widgets match.
 *
 * Returns `ready` once the minimum data (settings + user + categories + transactions + rate)
 * is loaded. Insights are fetched fire-and-forget after ready to avoid a slow startup.
 */
export function useAppBootstrap() {
  const [ready, setReady] = useState(false);
  const [hasPin, setHasPin] = useState(false);

  const setIsFirstLaunch = useUserStore(s => s.setIsFirstLaunch);
  const setUserName = useUserStore(s => s.setUserName);
  const setPrimaryCurrency = useUserStore(s => s.setPrimaryCurrency);

  useEffect(() => {
    initDB();

    SecureStore.getItemAsync(PIN_KEY).then(stored => {
      setHasPin(!!stored);
    });

    // Load settings + user, then hydrate stores in a stable order.
    db.transaction(tx => {
      tx.executeSql(
        'SELECT isFirstLaunch FROM settings ORDER BY id DESC LIMIT 1',
        [],
        (_, { rows }) => {
          if (rows._array.length > 0 && rows._array[0].isFirstLaunch === 0) {
            setIsFirstLaunch(false);
          }
        },
      );

      tx.executeSql(
        'SELECT userName, primaryCurrency FROM users ORDER BY id DESC LIMIT 1',
        [],
        (_, { rows }) => {
          if (rows._array.length > 0) {
            const user = rows._array[0];
            if (user.userName) setUserName(user.userName);
            if (user.primaryCurrency) setPrimaryCurrency(user.primaryCurrency);
          }
          hydrateStores();
        },
        () => {
          hydrateStores();
          return true;
        },
      );
    });

    function hydrateStores() {
      useCategoryStore.getState().fetchCategories();
      useTransactionStore.getState().fetchTransactions();
      useRateStore.getState().fetchLastRate();
      useRateStore.getState().fetchRateHistory();
      useSubscriptionStore.getState().fetchSubscriptions();
      useGroceryStore.getState().fetchGroceryItems();

      // Sync the transaction store's working rate with the latest persisted rate.
      const lastRate = useRateStore.getState().lastRate;
      if (lastRate && lastRate > 0) {
        useTransactionStore.setState({ currentExchangeRate: lastRate });
      }

      setReady(true);

      // Insights aren't blocking — kick them off after ready.
      const insights = useInsightsStore.getState();
      insights.fetchCategorySpending();
      insights.fetchDailySpending();
      insights.fetchMonthlySpending();
    }
  }, [setIsFirstLaunch, setUserName, setPrimaryCurrency]);

  return { ready, hasPin };
}
