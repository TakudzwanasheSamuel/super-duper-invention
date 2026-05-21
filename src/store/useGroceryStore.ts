import { create } from 'zustand';
import { openLegacyDatabase } from '@/api/sqliteCompat';
import { GroceryItemRow } from '@/api/db';
import { useTransactionStore } from './useTransactionStore';
import { useCategoryStore } from './useCategoryStore';
import { useUserStore } from './useUserStore';
import { useRateStore } from './useRateStore';

const db = openLegacyDatabase('dark-luxury.db');

type State = {
  groceryItems: GroceryItemRow[];
};

type Actions = {
  fetchGroceryItems: () => void;
  addGroceryItem: (item: Omit<GroceryItemRow, 'id' | 'is_checked'>) => void;
  updateGroceryItem: (item: GroceryItemRow) => void;
  deleteGroceryItem: (id: number) => void;
  resetList: () => void;
  finalizeShopping: () => void;
};

export const useGroceryStore = create<State & Actions>((set, get) => ({
  groceryItems: [],

  fetchGroceryItems: () => {
    db.transaction(tx => {
      tx.executeSql(
        'SELECT * FROM grocery_items',
        [],
        (_, { rows }) => {
          set({ groceryItems: rows._array.map(item => ({ ...item, is_checked: !!item.is_checked })) });
        },
        (_, error) => {
          console.error('Error fetching grocery items:', error);
          return true;
        }
      );
    });
  },

  addGroceryItem: (item) => {
    db.transaction(tx => {
      tx.executeSql(
        'INSERT INTO grocery_items (name, default_price, currency) VALUES (?, ?, ?)',
        [item.name, item.default_price, item.currency],
        () => {
          get().fetchGroceryItems();
        },
        (_, error) => {
          console.error('Error adding grocery item:', error);
          return true;
        }
      );
    });
  },

  updateGroceryItem: (item) => {
    db.transaction(tx => {
      tx.executeSql(
        'UPDATE grocery_items SET name = ?, default_price = ?, currency = ?, is_checked = ? WHERE id = ?',
        [item.name, item.default_price, item.currency, item.is_checked ? 1 : 0, item.id],
        () => {
          get().fetchGroceryItems();
        },
        (_, error) => {
          console.error('Error updating grocery item:', error);
          return true;
        }
      );
    });
  },

  deleteGroceryItem: (id) => {
    db.transaction(tx => {
      tx.executeSql(
        'DELETE FROM grocery_items WHERE id = ?',
        [id],
        () => {
          get().fetchGroceryItems();
        },
        (_, error) => {
          console.error('Error deleting grocery item:', error);
          return true;
        }
      );
    });
  },

  resetList: () => {
    db.transaction(tx => {
      tx.executeSql(
        'UPDATE grocery_items SET is_checked = 0',
        [],
        () => {
          get().fetchGroceryItems();
        },
        (_, error) => {
          console.error('Error resetting grocery list:', error);
          return true;
        }
      );
    });
  },

  finalizeShopping: () => {
    const { groceryItems } = get();
    const { addTransaction } = useTransactionStore.getState();
    const { categories } = useCategoryStore.getState();
    const { primaryCurrency } = useUserStore.getState();
    const { lastRate } = useRateStore.getState();

    const checkedItems = groceryItems.filter(item => item.is_checked);
    if (checkedItems.length === 0) {
      return; // No items to log
    }

    const total = checkedItems.reduce((sum, item) => sum + item.default_price, 0);

    const groceriesCategory =
      categories.find(c => c.name === 'Groceries' && c.type === 'expense') ??
      categories.find(c => c.type === 'expense') ??
      null;

    addTransaction({
      type: 'expense',
      amount: total,
      currency: primaryCurrency,
      rate: lastRate || 1.0,
      category_id: groceriesCategory ? groceriesCategory.id : null,
      note: 'Grocery Shopping',
      payment_method: 'cash', // Or allow user to select
      timestamp: Date.now(),
    });

    get().resetList(); // Uncheck all items after finalizing
  },
}));
