import { create } from 'zustand';
import * as SQLite from 'expo-sqlite';
import { useUserStore } from './useUserStore';
import { useRateStore } from './useRateStore';

const db = SQLite.openDatabase('dark-luxury.db');

type DailySpending = {
  day: string;
  total: number;
};

type MonthlySpending = {
  month: string;
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
};

// Helper to get last 6 months string
const getLastSixMonths = () => {
  const months = [];
  const date = new Date();
  for (let i = 0; i < 6; i++) {
    const month = date.getMonth() - i;
    const year = date.getFullYear();
    const newDate = new Date(year, month, 1);
    months.push(`${newDate.getFullYear()}-${String(newDate.getMonth() + 1).padStart(2, '0')}`);
  }
  return months.reverse();
};

export const useInsightsStore = create<State & Actions>((set, get) => ({
  dailySpending: [],
  monthlySpending: [],
  categorySpending: [],
  totalSpent: 0,

  fetchDailySpending: () => {
    const { primaryCurrency } = useUserStore.getState();
    const { lastRate } = useRateStore.getState();

    db.transaction(tx => {
      tx.executeSql(
        `SELECT
          CASE CAST(strftime('%w', timestamp / 1000, 'unixepoch') AS INTEGER)
            WHEN 0 THEN 'Sun' WHEN 1 THEN 'Mon' WHEN 2 THEN 'Tue' WHEN 3 THEN 'Wed'
            WHEN 4 THEN 'Thu' WHEN 5 THEN 'Fri' ELSE 'Sat'
          END as day_of_week,
          SUM(CASE WHEN currency = ? THEN amount ELSE amount * ? END) as total_spent
        FROM transactions
        WHERE type = 'expense'
        GROUP BY day_of_week
        ORDER BY day_of_week;`,
        [primaryCurrency, primaryCurrency === 'USD' ? 1 / lastRate : lastRate],
        (_, { rows }) => {
          const data: DailySpending[] = rows._array.map(row => ({
            day: row.day_of_week,
            total: row.total_spent / 100,
          }));
          set({ dailySpending: data });
        },
        (_, error) => {
          console.error('Error fetching daily spending:', error);
          return true;
        }
      );
    });
  },

  fetchMonthlySpending: () => {
    const { primaryCurrency } = useUserStore.getState();
    const { lastRate } = useRateStore.getState();
    const sixMonthsAgo = new Date();
    sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);

    db.transaction(tx => {
      tx.executeSql(
        `SELECT
          strftime('%Y-%m', timestamp / 1000, 'unixepoch') as month,
          SUM(CASE WHEN currency = ? THEN amount ELSE amount * ? END) as total_spent
        FROM transactions
        WHERE type = 'expense' AND timestamp >= ?
        GROUP BY month
        ORDER BY month;`,
        [primaryCurrency, primaryCurrency === 'USD' ? 1 / lastRate : lastRate, sixMonthsAgo.getTime()],
        (_, { rows }) => {
          const monthOrder = getLastSixMonths();
          const data: MonthlySpending[] = monthOrder.map(month => {
            const found = rows._array.find(r => r.month === month);
            return { month, total: found ? found.total_spent / 100 : 0 };
          });
          set({ monthlySpending: data });
        },
        (_, error) => {
          console.error('Error fetching monthly spending:', error);
          return true;
        }
      );
    });
  },

  fetchCategorySpending: () => {
    const { primaryCurrency } = useUserStore.getState();
    const { lastRate } = useRateStore.getState();
    const firstDayOfMonth = new Date();
    firstDayOfMonth.setDate(1);
    firstDayOfMonth.setHours(0, 0, 0, 0);

    db.transaction(tx => {
      tx.executeSql(
        `SELECT
          category,
          SUM(CASE WHEN currency = ? THEN amount ELSE amount * ? END) as total_spent
        FROM transactions
        WHERE type = 'expense' AND timestamp >= ?
        GROUP BY category;`,
        [primaryCurrency, primaryCurrency === 'USD' ? 1 / lastRate : lastRate, firstDayOfMonth.getTime()],
        (_, { rows }) => {
          const data: CategorySpending[] = rows._array.map(row => ({
            category: row.category,
            total: row.total_spent / 100,
          }));
          const total = data.reduce((acc, curr) => acc + curr.total, 0);
          set({ categorySpending: data, totalSpent: total });
        },
        (_, error) => {
          console.error('Error fetching category spending:', error);
          return true;
        }
      );
    });
  },
}));
