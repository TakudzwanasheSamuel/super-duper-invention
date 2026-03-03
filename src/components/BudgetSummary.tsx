
import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useTransactionStore } from '@/store/useTransactionStore';
import { useUserStore } from '@/store/useUserStore';
import { Colors, Fonts } from '@/constants/theme';

export default function BudgetSummary() {
  const { getConvertedBalance, getCardSpend, getCashSpend } = useTransactionStore();
  const { primaryCurrency } = useUserStore();

  const remainingBalance = getConvertedBalance();
  const cardSpend = getCardSpend();
  const cashSpend = getCashSpend();

  return (
    <View style={styles.container}>
      <View style={styles.summaryItem}>
        <Text style={styles.summaryLabel}>Remaining Budget</Text>
        <Text style={styles.summaryValue}>${remainingBalance.toFixed(2)} {primaryCurrency}</Text>
      </View>
      <View style={styles.summaryItem}>
        <Text style={styles.summaryLabel}>Card Spend</Text>
        <Text style={styles.summaryValue}>${cardSpend.toFixed(2)} {primaryCurrency}</Text>
      </View>
      <View style={styles.summaryItem}>
        <Text style={styles.summaryLabel}>Cash Spend</Text>
        <Text style={styles.summaryValue}>${cashSpend.toFixed(2)} {primaryCurrency}</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 20,
    backgroundColor: '#1C1C1E',
    borderRadius: 15,
  },
  summaryItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 10,
  },
  summaryLabel: {
    fontFamily: Fonts.body,
    fontSize: 16,
    color: Colors.secondary,
  },
  summaryValue: {
    fontFamily: Fonts.heading,
    fontSize: 18,
    color: 'white',
  },
});
