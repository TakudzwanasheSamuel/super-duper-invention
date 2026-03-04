import { create } from 'zustand';
import { openLegacyDatabase } from '@/api/sqliteCompat';

const db = openLegacyDatabase('dark-luxury.db');

type RateEntry = {
  id: number;
  rate: number;
  timestamp: number;
};

type State = {
  rateHistory: RateEntry[];
  lastRate: number;
};

type Actions = {
  fetchRateHistory: () => void;
  fetchLastRate: () => void;
  updateRate: (newRate: number) => void;
};

export const useRateStore = create<State & Actions>((set, get) => ({
  rateHistory: [],
  lastRate: 1, // Default to 1 to avoid division by zero

  fetchRateHistory: () => {
    db.transaction(tx => {
      tx.executeSql(
        'SELECT id, rate, timestamp FROM rates_history ORDER BY timestamp ASC',
        [],
        (_, { rows }) => {
          set({ rateHistory: rows._array });
        },
        (_, error) => {
          console.error('Error fetching rate history:', error);
          return true;
        }
      );
    });
  },

  fetchLastRate: () => {
    db.transaction(tx => {
      tx.executeSql(
        'SELECT rate FROM rates_history ORDER BY timestamp DESC LIMIT 1',
        [],
        (_, { rows }) => {
          if (rows.length > 0) {
            set({ lastRate: rows._array[0].rate });
          }
        },
        (_, error) => {
          console.error('Error fetching last rate:', error);
          return true;
        }
      );
    });
  },

  updateRate: (newRate: number) => {
    const timestamp = Date.now();
    db.transaction(tx => {
      tx.executeSql(
        'INSERT INTO rates_history (rate, timestamp) VALUES (?, ?)',
        [newRate, timestamp],
        () => {
          set({ lastRate: newRate });
          get().fetchRateHistory(); // Refresh history after update
        },
        (_, error) => {
          console.error('Error updating rate:', error);
          return true;
        }
      );
    });
  },
}));
