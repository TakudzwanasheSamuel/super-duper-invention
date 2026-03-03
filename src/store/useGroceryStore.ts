import { create } from 'zustand';
import * as SQLite from 'expo-sqlite';
import { GroceryItemRow } from '@/api/db';
import { useTransactionStore } from './useTransactionStore';
import { useCategoryStore } from './useCategoryStore';

const db = SQLite.openDatabase('dark-luxury.db');

type State = {
  groceryItems: GroceryItemRow[];
};

type Actions = {
  fetchGroceryItems: () => void;
  addGroceryItem: (item: Omit<GroceryItemRow, 'id' | 'is_checked'>) => void;
  updateGroceryItem: (item: GroceryItemRow) => void;
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

    const checkedItems = groceryItems.filter(item => item.is_checked);
    if (checkedItems.length === 0) {
      return; // No items to log
    }

    const total = checkedItems.reduce((sum, item) => sum + item.default_price, 0);

    const groceriesCategory = categories.find(c => c.name === 'Groceries');
    if (!groceriesCategory) {
      console.error('Groceries category not found!');
      return;
    }

    addTransaction({
      type: 'expense',
      amount: total,
      currency: 'USD', // Assuming all grocery items are in the primary currency for now
      rate: 1.0,
      category_id: groceriesCategory.id,
      note: 'Grocery Shopping',
      payment_method: 'cash', // Or allow user to select
      timestamp: Date.now(),
    });

    get().resetList(); // Uncheck all items after finalizing
  },
}));
