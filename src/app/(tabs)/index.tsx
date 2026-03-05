import React, { useEffect } from 'react';
import { StyleSheet, View, Text, TouchableOpacity } from 'react-native';
import { Image } from 'expo-image';
import { Ionicons } from '@expo/vector-icons';
import TransactionList from '@/components/TransactionList';
import { useTransactionStore } from '@/store/useTransactionStore';
import { useCategoryStore } from '@/store/useCategoryStore';
import BudgetSummary from '@/components/BudgetSummary';
import QuickAddSheet from '@/components/sheets/QuickAddSheet';
import { Colors, Fonts, FontSize } from '@/constants/theme';
import { useUserStore } from '@/store/useUserStore';

export default function HomeScreen() {
  const { transactions, fetchTransactions } = useTransactionStore();
  const { fetchCategories } = useCategoryStore();
  const { userName } = useUserStore();

  useEffect(() => {
    fetchTransactions();
    fetchCategories();
  }, [fetchTransactions, fetchCategories]);

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Image
          source={require('../../../assets/images/logo.png')}
          style={styles.logo}
          contentFit="contain"
        />
        <Text style={styles.greetingText}>Hi, {userName || 'there'}</Text>
        <Text style={styles.greetingSubText}>Here’s your financial overview.</Text>
      </View>

      <BudgetSummary />
      <TransactionList
        transactions={transactions}
        footer={<QuickAddSheet />}
      />

      <TouchableOpacity style={styles.fab}>
        <Ionicons name="add" size={28} color="#FFFFFF" />
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    backgroundColor: Colors.background,
  },
  header: {
    alignItems: 'center',
    marginBottom: 16,
  },
  logo: {
    width: 88,
    height: 88,
  },
  greetingText: {
    fontFamily: Fonts.heading,
    fontSize: FontSize.lg,
    color: '#F9FAFB',
    fontWeight: '700',
    marginTop: 12,
  },
  greetingSubText: {
    fontFamily: Fonts.body,
    fontSize: FontSize.base,
    color: '#9CA3AF',
    marginTop: 4,
  },
  fab: {
    position: 'absolute',
    right: 24,
    bottom: 32,
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: Colors.accent.gold,
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 6,
    zIndex: 10,
    shadowColor: '#000',
    shadowOpacity: 0.3,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 3 },
  },
});
