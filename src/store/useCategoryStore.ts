import { create } from 'zustand';
import { openLegacyDatabase } from '@/api/sqliteCompat';
import { CategoryRow } from '@/api/db';
import { getDefaultIconForCategory } from '@/constants/categories';

const db = openLegacyDatabase('dark-luxury.db');

type State = {
  categories: CategoryRow[];
};

type Actions = {
  fetchCategories: () => void;
  addCategory: (name: string, type: CategoryRow['type'], iconName?: string) => void;
  updateCategory: (category: CategoryRow) => void;
  deleteCategory: (id: number) => void;
};

export const useCategoryStore = create<State & Actions>((set, get) => ({
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

  addCategory: (name, type, iconName) => {
    const trimmed = name.trim();
    if (!trimmed) return;

    const icon = iconName || getDefaultIconForCategory(trimmed);

    db.transaction(tx => {
      tx.executeSql(
        'INSERT INTO categories (name, icon_name, type) VALUES (?, ?, ?)',
        [trimmed, icon, type],
        () => {
          get().fetchCategories();
        },
        (_, error) => {
          console.error('Error adding category:', error);
          return true;
        }
      );
    });
  },

  updateCategory: (category) => {
    db.transaction(tx => {
      tx.executeSql(
        'UPDATE categories SET name = ?, icon_name = ?, type = ? WHERE id = ?',
        [category.name, category.icon_name, category.type, category.id],
        () => {
          get().fetchCategories();
        },
        (_, error) => {
          console.error('Error updating category:', error);
          return true;
        }
      );
    });
  },

  deleteCategory: (id) => {
    db.transaction(tx => {
      tx.executeSql(
        'DELETE FROM categories WHERE id = ?',
        [id],
        () => {
          get().fetchCategories();
        },
        (_, error) => {
          console.error('Error deleting category:', error);
          return true;
        }
      );
    });
  },
}));
