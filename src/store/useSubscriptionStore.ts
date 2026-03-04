import { create } from 'zustand';
import { openLegacyDatabase } from '@/api/sqliteCompat';
import { SubscriptionRow } from '@/api/db';
import { useUserStore } from './useUserStore';
import { useTransactionStore } from './useTransactionStore';

const db = openLegacyDatabase('dark-luxury.db');

type State = {
  subscriptions: SubscriptionRow[];
};

type Actions = {
  fetchSubscriptions: () => void;
  addSubscription: (subscription: Omit<SubscriptionRow, 'id'>) => void;
  getMonthlyDigitalBurn: () => number;
  scheduleSubscriptionNotifications: () => void;
};

export const useSubscriptionStore = create<State & Actions>((set, get) => ({
  subscriptions: [],

  fetchSubscriptions: () => {
    db.transaction(tx => {
      tx.executeSql(
        'SELECT * FROM subscriptions',
        [],
        (_, { rows }) => {
          set({ subscriptions: rows._array });
        },
        (_, error) => {
          console.error('Error fetching subscriptions:', error);
          return true;
        }
      );
    });
  },

  addSubscription: (subscription) => {
    db.transaction(tx => {
      tx.executeSql(
        'INSERT INTO subscriptions (service_name, amount, currency, billing_day, category_id) VALUES (?, ?, ?, ?, ?)',
        [subscription.service_name, subscription.amount, subscription.currency, subscription.billing_day, subscription.category_id],
        () => {
          get().fetchSubscriptions();
        },
        (_, error) => {
          console.error('Error adding subscription:', error);
          return true;
        }
      );
    });
  },

  getMonthlyDigitalBurn: () => {
    const { subscriptions } = get();
    const { primaryCurrency } = useUserStore.getState();
    const { currentExchangeRate } = useTransactionStore.getState();

    const totalInCents = subscriptions.reduce((total, sub) => {
      let amountInCents = sub.amount;
      if (sub.currency !== primaryCurrency) {
        if (primaryCurrency === 'USD') {
          amountInCents = Math.round(sub.amount / currentExchangeRate);
        } else {
          amountInCents = Math.round(sub.amount * currentExchangeRate);
        }
      }
      return total + amountInCents;
    }, 0);

    return totalInCents / 100;
  },

  scheduleSubscriptionNotifications: () => {
    // No-op in Expo Go: remote push notifications are not supported here.
  },
}));
