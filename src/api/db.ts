import * as SQLite from 'expo-sqlite';
import React, { ReactNode, useEffect } from 'react';

// --- TypeScript Interfaces ---
export interface TransactionRow {
  id: number;
  type: 'income' | 'expense';
  amount: number; // Stored in cents
  currency: 'USD' | 'ZiG';
  rate: number;
  category_id: number;
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
  category_id: number;
}

export interface SavingsGoalRow {
  id: number;
  month: string; // Format: YYYY-MM
  is_met: boolean;
}

// --- Database Connection ---
const db = SQLite.openDatabase('dark-luxury.db');

// --- Seeding Function ---
const seedCategories = () => {
    db.transaction(tx => {
        tx.executeSql(
            'SELECT COUNT(*) as count FROM categories',
            [],
            (_, { rows }) => {
                if (rows._array[0].count === 0) {
                    const defaultCategories = [
                        { name: 'Groceries', icon_name: 'food', type: 'expense' },
                        { name: 'Tech', icon_name: 'laptop', type: 'expense' },
                        { name: 'Subscriptions', icon_name: 'credit-card', type: 'expense' },
                        { name: 'Transport', icon_name: 'car', type: 'expense' },
                        { name: 'Income', icon_name: 'dollar-sign', type: 'income' },
                        { name: 'Savings', icon_name: 'save', type: 'expense' },
                    ];

                    defaultCategories.forEach(cat => {
                        tx.executeSql('INSERT INTO categories (name, icon_name, type) VALUES (?, ?, ?)', [cat.name, cat.icon_name, cat.type]);
                    });
                }
            }
        );
    });
};

// --- Initialization Function ---
export const initDB = () => {
  db.transaction(tx => {
    // Create Tables
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
  (error) => {
    console.error("Database initialization error:", error);
  },
  () => {
    // Success callback
    seedCategories();
  });
};


// --- DatabaseProvider Component ---
interface DatabaseProviderProps {
    children: ReactNode;
}

export const DatabaseProvider = ({ children }: DatabaseProviderProps) => {
    useEffect(() => {
        initDB();
    }, []);

    return <>{children}</>;
};
