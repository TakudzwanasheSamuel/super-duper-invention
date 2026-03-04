import { create } from 'zustand';
import { openLegacyDatabase } from '@/api/sqliteCompat';
import { TransactionRow } from '@/api/db';
import { useUserStore } from './useUserStore';

const db = openLegacyDatabase('dark-luxury.db');

type PaymentMethod = 'all' | 'card' | 'cash';

type State = {
  transactions: TransactionRow[];
  currentExchangeRate: number;
  paymentMethodFilter: PaymentMethod;
};

type Actions = {
  addTransaction: (transaction: Omit<TransactionRow, 'id'>) => void;
  fetchTransactions: () => void;
  updateRate: (newRate: number) => void;
  getConvertedBalance: () => number;
  setPaymentMethodFilter: (filter: PaymentMethod) => void;
  getCardSpend: () => number;
  getCashSpend: () => number;
};

export const useTransactionStore = create<State & Actions>((set, get) => ({
  transactions: [],
  currentExchangeRate: 1.0, // Default rate
  paymentMethodFilter: 'all',

  fetchTransactions: () => {
    const { paymentMethodFilter } = get();
    let query = 'SELECT * FROM transactions';
    const params = [];

    if (paymentMethodFilter !== 'all') {
      query += ' WHERE payment_method = ?';
      params.push(paymentMethodFilter);
    }

    query += ' ORDER BY timestamp DESC LIMIT 50';

    db.transaction(tx => {
      tx.executeSql(
        query,
        params,
        (_, { rows }) => {
          set({ transactions: rows._array });
        },
        (_, error) => {
          console.error('Error fetching transactions:', error);
          return true;
        }
      );
    });
  },

  addTransaction: (transaction) => {
    db.transaction(tx => {
      tx.executeSql(
        'INSERT INTO transactions (type, amount, currency, rate, category_id, note, payment_method, timestamp) VALUES (?, ?, ?, ?, ?, ?, ?, ?)',
        [
          transaction.type,
          transaction.amount,
          transaction.currency,
          transaction.rate,
          transaction.category_id,
          transaction.note,
          transaction.payment_method,
          transaction.timestamp,
        ],
        () => {
          get().fetchTransactions();
        },
        (_, error) => {
          console.error('Error adding transaction:', error);
          return true;
        }
      );
    });
  },

  updateRate: (newRate) => {
    const timestamp = Date.now();
    db.transaction(tx => {
      tx.executeSql(
        'INSERT INTO rates_history (rate, timestamp) VALUES (?, ?)',
        [newRate, timestamp],
        () => {
          set({ currentExchangeRate: newRate });
        },
        (_, error) => {
          console.error('Error updating rate:', error);
          return true;
        }
      );
    });
  },

  getConvertedBalance: () => {
    const { transactions, currentExchangeRate } = get();
    const { primaryCurrency } = useUserStore.getState();

    const totalInCents = transactions.reduce((total, trans) => {
      let amountInCents = trans.amount;

      if (trans.currency !== primaryCurrency) {
        if (primaryCurrency === 'USD') {
          amountInCents = Math.round(trans.amount / currentExchangeRate);
        } else {
          amountInCents = Math.round(trans.amount * currentExchangeRate);
        }
      }

      return total + (trans.type === 'income' ? amountInCents : -amountInCents);
    }, 0);

    return totalInCents / 100;
  },

  setPaymentMethodFilter: (filter: PaymentMethod) => {
    set({ paymentMethodFilter: filter });
    get().fetchTransactions();
  },

  getCardSpend: () => {
    const { transactions, currentExchangeRate } = get();
    const { primaryCurrency } = useUserStore.getState();

    const cardSpend = transactions
      .filter(t => t.payment_method === 'card' && t.type === 'expense')
      .reduce((total, trans) => {
        let amountInCents = trans.amount;
        if (trans.currency !== primaryCurrency) {
          if (primaryCurrency === 'USD') {
            amountInCents = Math.round(trans.amount / currentExchangeRate);
          } else {
            amountInCents = Math.round(trans.amount * currentExchangeRate);
          }
        }
        return total + amountInCents;
      }, 0);

    return cardSpend / 100;
  },

  getCashSpend: () => {
    const { transactions, currentExchangeRate } = get();
    const { primaryCurrency } = useUserStore.getState();

    const cashSpend = transactions
      .filter(t => t.payment_method === 'cash' && t.type === 'expense')
      .reduce((total, trans) => {
        let amountInCents = trans.amount;
        if (trans.currency !== primaryCurrency) {
          if (primaryCurrency === 'USD') {
            amountInCents = Math.round(trans.amount / currentExchangeRate);
          } else {
            amountInCents = Math.round(trans.amount * currentExchangeRate);
          }
        }
        return total + amountInCents;
      }, 0);

    return cashSpend / 100;
  },
}));
