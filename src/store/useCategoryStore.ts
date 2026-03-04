import { create } from 'zustand';
import { openLegacyDatabase } from '@/api/sqliteCompat';
import { CategoryRow } from '@/api/db';

const db = openLegacyDatabase('dark-luxury.db');

type State = {
  categories: CategoryRow[];
};

type Actions = {
  fetchCategories: () => void;
};

export const useCategoryStore = create<State & Actions>((set) => ({
  categories: [],

  fetchCategories: () => {
    db.transaction(tx => {
      tx.executeSql(
        'SELECT * FROM categories',
        [],
        (_, { rows }) => {
          set({ categories: rows._array });
        },
        (_, error) => {
          console.error('Error fetching categories:', error);
          return true;
        }
      );
    });
  },
}));
