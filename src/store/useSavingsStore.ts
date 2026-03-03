import { create } from 'zustand';
import * as SQLite from 'expo-sqlite';
import { SavingsGoalRow } from '@/api/db';
import { useTransactionStore } from './useTransactionStore';

const db = SQLite.openDatabase('dark-luxury.db');

type State = {
  streak: number;
  hasCheckedIn: boolean;
};

type Actions = {
  fetchStreak: () => void;
  checkIn: () => void;
};

export const useSavingsStore = create<State & Actions>((set, get) => ({
  streak: 0,
  hasCheckedIn: false,

  fetchStreak: () => {
    db.transaction(tx => {
      tx.executeSql(
        'SELECT * FROM savings_goals ORDER BY month DESC',
        [],
        (_, { rows }) => {
          const goals: SavingsGoalRow[] = rows._array;
          let currentStreak = 0;
          const today = new Date();
          let month = today.getMonth();
          let year = today.getFullYear();

          for (const goal of goals) {
            const [goalYear, goalMonth] = goal.month.split('-').map(Number);

            if (goalYear === year && goalMonth === month + 1 && goal.is_met) {
              currentStreak++;
              month--;
              if (month < 0) {
                month = 11;
                year--;
              }
            } else {
              break;
            }
          }

          const currentMonthStr = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}`;
          const hasCheckedIn = goals.some(g => g.month === currentMonthStr && g.is_met);

          set({ streak: currentStreak, hasCheckedIn });
        },
        (_, error) => {
          console.error('Error fetching savings streak:', error);
          return true;
        }
      );
    });
  },

  checkIn: () => {
    const today = new Date();
    const monthStr = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}`;

    db.transaction(tx => {
      tx.executeSql(
        'INSERT OR IGNORE INTO savings_goals (month, is_met) VALUES (?, ?)',
        [monthStr, 0],
        () => {
          tx.executeSql(
            'UPDATE savings_goals SET is_met = 1 WHERE month = ?',
            [monthStr],
            () => {
              useTransactionStore.getState().addTransaction({
                type: 'expense',
                amount: 2000, // $20 in cents
                currency: 'USD',
                rate: 1,
                category_id: 6, // Savings category
                note: 'Monthly Savings Goal',
                payment_method: 'cash',
                timestamp: Date.now(),
              });
              get().fetchStreak();
            },
            (_, error) => {
              console.error('Error updating savings goal:', error);
              return true;
            }
          );
        },
        (_, error) => {
          console.error('Error inserting savings goal:', error);
          return true;
        }
      );
    });
  },
}));
