import { SQLiteDatabase, openDatabaseSync } from 'expo-sqlite';

type LegacyRows<T = any> = {
  _array: T[];
};

type LegacyResult<T = any> = {
  rows: LegacyRows<T>;
};

type ExecSuccess<T = any> = (tx: LegacyTransaction<T>, result: LegacyResult<T>) => void;
type ExecError = (tx: LegacyTransaction, error: unknown) => boolean | void;

export type LegacyTransaction<T = any> = {
  executeSql: (
    sql: string,
    params?: any[],
    successCallback?: ExecSuccess<T>,
    errorCallback?: ExecError
  ) => void;
};

function createTransaction<T = any>(db: SQLiteDatabase): LegacyTransaction<T> {
  return {
    executeSql(sql, params = [], successCallback, errorCallback) {
      try {
        const trimmed = sql.trim().toUpperCase();

        if (trimmed.startsWith('SELECT')) {
          const rowsArray = db.getAllSync<T>(sql, params);
          successCallback?.(this, { rows: { _array: rowsArray } });
        } else {
          db.runSync(sql, params);
          successCallback?.(this, { rows: { _array: [] as T[] } });
        }
      } catch (error) {
        const handled = errorCallback?.(this, error);
        if (!handled) {
          // eslint-disable-next-line no-console
          console.error('SQLite executeSql error:', error);
        }
      }
    },
  };
}

export function openLegacyDatabase(name: string): {
  transaction: (
    cb: (tx: LegacyTransaction) => void,
    errorCb?: (error: unknown) => void,
    successCb?: () => void,
  ) => void;
} {
  const db = openDatabaseSync(name);

  return {
    transaction(callback, errorCb?, successCb?) {
      try {
        const tx = createTransaction(db);
        callback(tx);
        successCb?.();
      } catch (error) {
        errorCb?.(error);
      }
    },
  };
}

