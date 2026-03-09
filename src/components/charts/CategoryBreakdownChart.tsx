import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import LuxuryCard from './LuxuryCard';
import { useInsightsStore } from '@/store/useInsightsStore';
import { useUserStore } from '@/store/useUserStore';
import { Colors, Fonts } from '@/constants/theme';

export default function CategoryBreakdownChart() {
  const { categorySpending, totalSpent, fetchCategorySpending } = useInsightsStore();
  const { primaryCurrency } = useUserStore();

  React.useEffect(() => {
    fetchCategorySpending();
  }, [fetchCategorySpending]);

  const topCategories = [...categorySpending]
    .sort((a, b) => b.total - a.total)
    .slice(0, 4);

  return (
    <LuxuryCard>
      <Text style={styles.title}>Category Breakdown (Current Month)</Text>
      <Text style={styles.totalText}>
        Total Spent: <Text style={styles.totalValue}>
          {primaryCurrency} {totalSpent.toFixed(2)}
        </Text>
      </Text>
      <View style={styles.list}>
        {topCategories.map((item) => (
          <View key={item.category} style={styles.row}>
            <View style={styles.dot} />
            <Text style={styles.categoryText}>{item.category}</Text>
            <Text style={styles.amountText}>
              {primaryCurrency} {item.total.toFixed(2)}
            </Text>
          </View>
        ))}
        {topCategories.length === 0 && (
          <Text style={styles.emptyText}>
            No category data yet. Start adding transactions to see insights.
          </Text>
        )}
      </View>
    </LuxuryCard>
  );
}

const styles = StyleSheet.create({
  title: {
    color: '#F9FAFB',
    fontFamily: Fonts.heading,
    fontSize: 16,
    textAlign: 'center',
    marginBottom: 12,
  },
  totalText: {
    fontFamily: Fonts.body,
    fontSize: 12,
    color: '#9CA3AF',
    textAlign: 'center',
    marginBottom: 12,
  },
  totalValue: {
    fontFamily: 'JetBrainsMono_400Regular',
    color: Colors.accent.gold,
  },
  list: {
    marginTop: 4,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: Colors.accent.blue,
    marginRight: 8,
  },
  categoryText: {
    flex: 1,
    fontFamily: Fonts.body,
    fontSize: 14,
    color: '#F9FAFB',
  },
  amountText: {
    fontFamily: 'JetBrainsMono_400Regular',
    fontSize: 14,
    color: Colors.accent.gold,
  },
  emptyText: {
    fontFamily: Fonts.body,
    fontSize: 12,
    color: '#9CA3AF',
    textAlign: 'center',
    marginTop: 8,
  },
});
