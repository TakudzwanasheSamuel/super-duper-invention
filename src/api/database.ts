import { openLegacyDatabase } from '@/api/sqliteCompat';

const db = openLegacyDatabase('dark-luxury.db');

export const initDB = () => {
  db.transaction(tx => {
    tx.executeSql(
      'CREATE TABLE IF NOT EXISTS users (id INTEGER PRIMARY KEY NOT NULL, userName TEXT NOT NULL, primaryCurrency TEXT NOT NULL);'
    );
    tx.executeSql(
      'CREATE TABLE IF NOT EXISTS settings (id INTEGER PRIMARY KEY NOT NULL, isFirstLaunch INTEGER NOT NULL);'
    );
  });
};
