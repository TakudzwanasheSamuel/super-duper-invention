import React, { useMemo } from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { useTransactionStore } from '@/store/useTransactionStore';
import { useUserStore } from '@/store/useUserStore';
import { useRateStore } from '@/store/useRateStore';
import { useCategoryStore } from '@/store/useCategoryStore';
import { Colors, Fonts } from '@/constants/theme';
import {
  convertAmountCents,
  formatCurrency,
  isNonSpendCategoryName,
  startOfCurrentMonth,
} from '@/utils/finance';

export default function BudgetSummary() {
  const transactions = useTransactionStore(s => s.transactions);
  const getConvertedBalance = useTransactionStore(s => s.getConvertedBalance);
  const primaryCurrency = useUserStore(s => s.primaryCurrency);
  const lastRate = useRateStore(s => s.lastRate);
  const categories = useCategoryStore(s => s.categories);

  const remainingBalance = getConvertedBalance();

  // Use the real persisted rate. Fall back to 1.0 only if no rate has ever been
  // recorded — that way the two currency columns at least don't divide-by-zero.
  const rate = lastRate && lastRate > 0 ? lastRate : 1;

  const usdBalance =
    primaryCurrency === 'USD' ? remainingBalance : remainingBalance / rate;
  const zigBalance =
    primaryCurrency === 'ZiG' ? remainingBalance : remainingBalance * rate;

  const { monthCardSpend, monthCashSpend, monthSaved } = useMemo(() => {
    const monthStart = startOfCurrentMonth();
    const categoryById = new Map<number, string>();
    categories.forEach(c => categoryById.set(c.id, c.name));

    let cardCents = 0;
    let cashCents = 0;
    let savedCents = 0;

    for (const t of transactions) {
      if (t.timestamp < monthStart) continue;
      if (t.type !== 'expense') continue;

      const name = t.category_id != null ? categoryById.get(t.category_id) : undefined;
      const converted = convertAmountCents(t.amount, t.currency, primaryCurrency, rate);

      if (isNonSpendCategoryName(name)) {
        savedCents += converted;
      } else if (t.payment_method === 'card') {
        cardCents += converted;
      } else if (t.payment_method === 'cash') {
        cashCents += converted;
      }
    }

    return {
      monthCardSpend: cardCents / 100,
      monthCashSpend: cashCents / 100,
      monthSaved: savedCents / 100,
    };
  }, [transactions, categories, primaryCurrency, rate]);

  const monthTotalSpend = monthCardSpend + monthCashSpend;

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
                {formatCurrency(usdBalance, 'USD')}
              </Text>
            </View>
            <View style={styles.balanceColumn}>
              <Text style={styles.balanceLabel}>ZiG</Text>
              <Text style={[styles.balanceValue, styles.zigValue]}>
                {formatCurrency(zigBalance, 'ZiG')}
              </Text>
            </View>
          </View>
          <Text style={styles.cardFootnote}>
            Rate: 1 USD = {rate.toFixed(2)} ZiG
          </Text>
        </View>

        <View style={styles.card}>
          <Text style={styles.cardTitle}>Spending Split (This Month)</Text>
          <View style={styles.splitRow}>
            <View style={styles.splitColumn}>
              <Text style={styles.balanceLabel}>Card</Text>
              <Text style={[styles.balanceValue, styles.usdValue]}>
                {formatCurrency(monthCardSpend, primaryCurrency)}
              </Text>
            </View>
            <View style={styles.splitColumn}>
              <Text style={styles.balanceLabel}>Cash</Text>
              <Text style={[styles.balanceValue, styles.zigValue]}>
                {formatCurrency(monthCashSpend, primaryCurrency)}
              </Text>
            </View>
          </View>
          <Text style={styles.cardFootnote}>
            Total spent: {formatCurrency(monthTotalSpend, primaryCurrency)}
          </Text>
        </View>

        <View style={styles.card}>
          <Text style={styles.cardTitle}>Activity (This Month)</Text>
          <View style={styles.splitRow}>
            <View style={styles.splitColumn}>
              <Text style={styles.balanceLabel}>Spent</Text>
              <Text style={[styles.balanceValue, styles.spentValue]}>
                {formatCurrency(monthTotalSpend, primaryCurrency)}
              </Text>
            </View>
            <View style={styles.splitColumn}>
              <Text style={styles.balanceLabel}>Saved</Text>
              <Text style={[styles.balanceValue, styles.savedValue]}>
                {formatCurrency(monthSaved, primaryCurrency)}
              </Text>
            </View>
          </View>
          <Text style={styles.cardFootnote}>
            Savings excluded from spending charts
          </Text>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginBottom: 16,
  },
  scrollContent: {
    paddingVertical: 4,
    paddingHorizontal: 16,
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
  spentValue: {
    color: '#F87171',
  },
  savedValue: {
    color: '#34D399',
  },
  cardFootnote: {
    fontFamily: Fonts.body,
    fontSize: 11,
    color: '#9CA3AF',
    marginTop: 10,
  },
});
