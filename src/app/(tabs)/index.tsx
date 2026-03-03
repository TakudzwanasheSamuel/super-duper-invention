import React, { useEffect } from 'react';
import { StyleSheet, View } from 'react-native';
import TransactionList from '@/components/TransactionList';
import { useTransactionStore } from '@/store/useTransactionStore';
import { useCategoryStore } from '@/store/useCategoryStore';
import BudgetSummary from '@/components/BudgetSummary';

export default function HomeScreen() {
  const { transactions, fetchTransactions } = useTransactionStore();
  const { fetchCategories } = useCategoryStore();

  useEffect(() => {
    fetchTransactions();
    fetchCategories();
  }, [fetchTransactions, fetchCategories]);

  return (
    <View style={styles.container}>
      <BudgetSummary />
      <TransactionList transactions={transactions} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
  },
});
