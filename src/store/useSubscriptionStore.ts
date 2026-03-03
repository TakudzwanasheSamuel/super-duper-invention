import { create } from 'zustand';
import * as SQLite from 'expo-sqlite';
import * as Notifications from 'expo-notifications';
import { SubscriptionRow } from '@/api/db';
import { useUserStore } from './useUserStore';
import { useTransactionStore } from './useTransactionStore';

const db = SQLite.openDatabase('dark-luxury.db');

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: false,
    shouldSetBadge: false,
  }),
});

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
          get().scheduleSubscriptionNotifications();
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

  scheduleSubscriptionNotifications: async () => {
    await Notifications.cancelAllScheduledNotificationsAsync();

    const { subscriptions } = get();
    const now = new Date();

    for (const sub of subscriptions) {
      const billingDate = new Date(now.getFullYear(), now.getMonth(), sub.billing_day);

      if (now > billingDate) {
        billingDate.setMonth(billingDate.getMonth() + 1);
      }

      const notificationDate = new Date(billingDate.getTime() - 24 * 60 * 60 * 1000);

      if (notificationDate > now) {
        await Notifications.scheduleNotificationAsync({
          content: {
            title: 'Upcoming Subscription Payment',
            body: `${sub.service_name} payment of ${sub.amount / 100} ${sub.currency} is due tomorrow.`,
          },
          trigger: notificationDate,
        });
      }
    }
  },
}));
