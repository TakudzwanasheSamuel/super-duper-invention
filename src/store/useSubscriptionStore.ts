import { create } from 'zustand';
import { Platform } from 'react-native';
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
  scheduleSubscriptionNotifications: () => Promise<void>;
};

/**
 * Best-effort local notifications for upcoming subscription billing days.
 * - In Expo Go (`appOwnership === 'expo'`), notifications are not supported and
 *   we no-op silently to avoid crashes.
 * - In a dev build / EAS build, we lazily import `expo-notifications` and
 *   `expo-constants`, request permissions, then schedule a monthly reminder
 *   per subscription on its billing day.
 */
async function scheduleNotificationsSafely(subscriptions: SubscriptionRow[]) {
  let Constants: any;
  let Notifications: any;
  try {
    Constants = require('expo-constants').default;
    Notifications = require('expo-notifications');
  } catch {
    // Modules not available in this build — silently skip.
    return;
  }

  // Expo Go drops support for remote/local push notifications in SDK 53+.
  if (Constants?.appOwnership === 'expo') return;

  try {
    const settings = await Notifications.getPermissionsAsync();
    let granted = settings.granted || settings.status === 'granted';
    if (!granted) {
      const req = await Notifications.requestPermissionsAsync();
      granted = req.granted || req.status === 'granted';
    }
    if (!granted) return;

    // Android 8+ requires a channel before notifications can be posted.
    // Must match the `defaultChannel` declared in app.json's expo-notifications plugin config.
    if (Platform.OS === 'android') {
      await Notifications.setNotificationChannelAsync('default', {
        name: 'Subscription reminders',
        importance: Notifications.AndroidImportance?.DEFAULT ?? 3,
        vibrationPattern: [0, 250, 250, 250],
        lightColor: '#D4AF37',
      });
    }

    // Clear previously scheduled myBudget reminders to avoid duplicates.
    await Notifications.cancelAllScheduledNotificationsAsync();

    for (const sub of subscriptions) {
      const day = Math.min(Math.max(sub.billing_day, 1), 28);
      await Notifications.scheduleNotificationAsync({
        content: {
          title: 'Upcoming subscription',
          body: `${sub.service_name} renews today (${sub.currency} ${(sub.amount / 100).toFixed(2)}).`,
        },
        trigger: {
          day,
          hour: 9,
          minute: 0,
          repeats: true,
          channelId: 'default',
        },
      });
    }
  } catch (error) {
    // Swallow scheduling failures — UI shouldn't crash because reminders failed.
    if (__DEV__) console.warn('Subscription notification scheduling skipped:', error);
  }
}

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
          // Re-schedule reminders whenever subscriptions change.
          get().scheduleSubscriptionNotifications();
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
    const { subscriptions } = get();
    await scheduleNotificationsSafely(subscriptions);
  },
}));
