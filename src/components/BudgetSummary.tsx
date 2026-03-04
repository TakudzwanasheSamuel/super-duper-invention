
import React from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { useTransactionStore } from '@/store/useTransactionStore';
import { useUserStore } from '@/store/useUserStore';
import { Colors, Fonts } from '@/constants/theme';

export default function BudgetSummary() {
  const { getConvertedBalance, getCardSpend, getCashSpend } = useTransactionStore();
  const { primaryCurrency } = useUserStore();

  const remainingBalance = getConvertedBalance();
  const cardSpend = getCardSpend();
  const cashSpend = getCashSpend();

  const totalCardLabel = 'Monthly Card Spend';
  const totalCashLabel = 'Monthly Cash Spend';

  const usdBalance =
    primaryCurrency === 'USD' ? remainingBalance : remainingBalance /  getUsdRateFallback();
  const zigBalance =
    primaryCurrency === 'ZiG' ? remainingBalance : remainingBalance * getUsdRateFallback();

  return (
    <View style={styles.container}>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Total Balance</Text>
          <View style={styles.balanceRow}>
            <View style={styles.balanceColumn}>
              <Text style={styles.balanceLabel}>USD</Text>
              <Text style={[styles.balanceValue, styles.usdValue]}>
                ${usdBalance.toFixed(2)}
              </Text>
            </View>
            <View style={styles.balanceColumn}>
              <Text style={styles.balanceLabel}>ZiG</Text>
              <Text style={[styles.balanceValue, styles.zigValue]}>
                ${zigBalance.toFixed(2)}
              </Text>
            </View>
          </View>
        </View>

        <View style={styles.card}>
          <Text style={styles.cardTitle}>Spending Split</Text>
          <View style={styles.splitRow}>
            <View style={styles.splitColumn}>
              <Text style={styles.balanceLabel}>{totalCardLabel}</Text>
              <Text style={[styles.balanceValue, styles.usdValue]}>
                ${cardSpend.toFixed(2)}
              </Text>
            </View>
            <View style={styles.splitColumn}>
              <Text style={styles.balanceLabel}>{totalCashLabel}</Text>
              <Text style={[styles.balanceValue, styles.zigValue]}>
                ${cashSpend.toFixed(2)}
              </Text>
            </View>
          </View>
        </View>
      </ScrollView>
    </View>
  );
}

// Fallback rate if no FX logic is available in this context
function getUsdRateFallback() {
  return 1;
}

const styles = StyleSheet.create({
  container: {
    marginBottom: 16,
  },
  scrollContent: {
    paddingVertical: 4,
    paddingHorizontal: 0,
    gap: 12,
  },
  card: {
    width: 260,
    backgroundColor: Colors.secondary,
    borderRadius: 18,
    padding: 16,
    marginRight: 12,
  },
  cardTitle: {
    fontFamily: Fonts.heading,
    fontSize: 14,
    color: '#F9FAFB',
    marginBottom: 12,
  },
  balanceRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  balanceColumn: {
    flex: 1,
  },
  splitRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  splitColumn: {
    flex: 1,
  },
  balanceLabel: {
    fontFamily: Fonts.body,
    fontSize: 12,
    color: '#9CA3AF',
    marginBottom: 4,
  },
  balanceValue: {
    fontFamily: 'JetBrainsMono_400Regular',
    fontSize: 18,
  },
  usdValue: {
    color: Colors.accent.blue,
  },
  zigValue: {
    color: Colors.accent.gold,
  },
});
