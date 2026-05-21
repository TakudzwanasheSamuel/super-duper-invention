import { openLegacyDatabase } from '@/api/sqliteCompat';
import { ReactNode } from 'react';
import { getDefaultIconForCategory } from '@/constants/categories';

// --- TypeScript Interfaces ---
export interface TransactionRow {
  id: number;
  type: 'income' | 'expense';
  amount: number; // Stored in cents
  currency: 'USD' | 'ZiG';
  rate: number;
  /**
   * Nullable so Quick Add / widget-driven entries can record an
   * "Uncategorized" transaction when the user hasn't created or selected a
   * category yet. Consumers must treat null as "Uncategorized".
   */
  category_id: number | null;
  note: string;
  payment_method: 'card' | 'cash';
  timestamp: number;
}

export interface CategoryRow {
  id: number;
  name: string;
  icon_name: string;
  type: 'income' | 'expense';
}

export interface RateHistoryRow {
  id: number;
  rate: number;
  timestamp: number;
}

export interface GroceryItemRow {
  id: number;
  name: string;
  default_price: number; // Stored in cents
  currency: 'USD' | 'ZiG';
  is_checked: boolean;
}

export interface SubscriptionRow {
  id: number;
  service_name: string;
  amount: number; // Stored in cents
  currency: 'USD' | 'ZiG';
  billing_day: number;
  category_id: number | null;
}

export interface SavingsGoalRow {
  id: number;
  month: string; // Format: YYYY-MM
  is_met: boolean;
}

// --- Database Connection ---
const db = openLegacyDatabase('dark-luxury.db');

// --- Seeding Function ---
const seedCategories = () => {
    db.transaction(tx => {
        tx.executeSql(
            'SELECT COUNT(*) as count FROM categories',
            [],
            (_, { rows }) => {
                if (rows._array[0].count === 0) {
                    const defaultCategories: { name: string; type: 'income' | 'expense' }[] = [
                        { name: 'Groceries', type: 'expense' },
                        { name: 'Tech', type: 'expense' },
                        { name: 'Subscriptions', type: 'expense' },
                        { name: 'Transport', type: 'expense' },
                        { name: 'Income', type: 'income' },
                        { name: 'Savings', type: 'expense' },
                    ];

                    defaultCategories.forEach(cat => {
                        tx.executeSql(
                          'INSERT INTO categories (name, icon_name, type) VALUES (?, ?, ?)',
                          [cat.name, getDefaultIconForCategory(cat.name), cat.type],
                        );
                    });
                }
            }
        );
    });
};

// --- Migrations ---
/**
 * SQLite-level migration system using PRAGMA user_version.
 *
 * Each entry runs ONCE when the on-disk DB version is below its index + 1.
 * Append new migrations to the end of the array — NEVER edit or reorder
 * existing ones, or installed users will skip steps.
 *
 * Index 0 (target version 1) is the initial schema. Subsequent indexes are
 * incremental ALTER / CREATE statements.
 */
const MIGRATIONS: ReadonlyArray<(tx: any) => void> = [
  // v1 — initial schema
  (tx) => {
    tx.executeSql(
      'CREATE TABLE IF NOT EXISTS users (id INTEGER PRIMARY KEY NOT NULL, userName TEXT NOT NULL, primaryCurrency TEXT NOT NULL);'
    );
    tx.executeSql(
      'CREATE TABLE IF NOT EXISTS settings (id INTEGER PRIMARY KEY NOT NULL, isFirstLaunch INTEGER NOT NULL);'
    );
    tx.executeSql(
      `CREATE TABLE IF NOT EXISTS categories (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT NOT NULL,
        icon_name TEXT,
        type TEXT NOT NULL CHECK(type IN ('income', 'expense'))
      );`
    );
    tx.executeSql(
      `CREATE TABLE IF NOT EXISTS transactions (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        type TEXT NOT NULL CHECK(type IN ('income', 'expense')),
        amount INTEGER NOT NULL,
        currency TEXT NOT NULL CHECK(currency IN ('USD', 'ZiG')),
        rate REAL,
        category_id INTEGER,
        note TEXT,
        payment_method TEXT CHECK(payment_method IN ('card', 'cash')),
        timestamp INTEGER NOT NULL,
        FOREIGN KEY (category_id) REFERENCES categories(id)
      );`
    );
    tx.executeSql(
      `CREATE TABLE IF NOT EXISTS rates_history (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        rate REAL NOT NULL,
        timestamp INTEGER NOT NULL
      );`
    );
    tx.executeSql(
      `CREATE TABLE IF NOT EXISTS grocery_items (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT NOT NULL,
        default_price INTEGER NOT NULL,
        currency TEXT NOT NULL CHECK(currency IN ('USD', 'ZiG')),
        is_checked INTEGER NOT NULL DEFAULT 0
      );`
    );
    tx.executeSql(
      `CREATE TABLE IF NOT EXISTS subscriptions (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        service_name TEXT NOT NULL,
        amount INTEGER NOT NULL,
        currency TEXT NOT NULL CHECK(currency IN ('USD', 'ZiG')),
        billing_day INTEGER NOT NULL,
        category_id INTEGER,
        FOREIGN KEY (category_id) REFERENCES categories(id)
      );`
    );
    tx.executeSql(
      `CREATE TABLE IF NOT EXISTS savings_goals (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        month TEXT NOT NULL UNIQUE,
        is_met INTEGER NOT NULL DEFAULT 0
      );`
    );
  },

  // v2 — performance: index transactions by timestamp (insights queries / list ORDER BY)
  (tx) => {
    tx.executeSql(
      'CREATE INDEX IF NOT EXISTS idx_transactions_timestamp ON transactions(timestamp);'
    );
    tx.executeSql(
      'CREATE INDEX IF NOT EXISTS idx_transactions_category ON transactions(category_id);'
    );
  },
];

/**
 * Reads PRAGMA user_version, runs any pending migrations, and bumps the
 * stored version. Safe to call on every app start.
 */
const runMigrations = (onDone?: () => void) => {
  db.transaction(
    (tx: any) => {
      tx.executeSql(
        'PRAGMA user_version;',
        [],
        (_: any, { rows }: any) => {
          const current: number = rows._array?.[0]?.user_version ?? 0;
          const target = MIGRATIONS.length;

          if (current >= target) return;

          // Apply each pending migration in order, then stamp the new version.
          for (let i = current; i < target; i++) {
            MIGRATIONS[i](tx);
          }
          // user_version doesn't accept parametrized binding — interpolate the
          // integer literal directly. target is hard-coded above, not user input.
          tx.executeSql(`PRAGMA user_version = ${target};`);
        }
      );
    },
    (error: unknown) => {
      if (__DEV__) console.error('Database migration error:', error);
    },
    () => {
      onDone?.();
    }
  );
};

// --- Initialization Function ---
export const initDB = () => {
  runMigrations(() => {
    seedCategories();
  });
};


// --- DatabaseProvider Component ---
interface DatabaseProviderProps {
    children: ReactNode;
}

export const DatabaseProvider = ({ children }: DatabaseProviderProps) => {
    return children;
};
