import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import LuxuryCard from './LuxuryCard';
import { useInsightsStore } from '@/store/useInsightsStore';
import { useUserStore } from '@/store/useUserStore';
import { Colors, Fonts } from '@/constants/theme';
import { formatCurrency } from '@/utils/finance';

const SLICE_COLORS = [
  Colors.accent.gold,
  Colors.accent.blue,
  '#22C55E',
  '#F97316',
  '#A855F7',
  '#EC4899',
];

export default function CategoryBreakdownChart() {
  const { categorySpending, totalSpent, fetchCategorySpending } = useInsightsStore();
  const { primaryCurrency } = useUserStore();

  React.useEffect(() => {
    fetchCategorySpending();
  }, [fetchCategorySpending]);

  const sorted = [...categorySpending].sort((a, b) => b.total - a.total);
  const top = sorted.slice(0, 5);
  const rest = sorted.slice(5);
  const restTotal = rest.reduce((acc, c) => acc + c.total, 0);
  const series = restTotal > 0 ? [...top, { category: 'Other', total: restTotal }] : top;
  const denom = totalSpent > 0 ? totalSpent : 1;

  return (
    <LuxuryCard>
      <Text style={styles.title}>Category Breakdown (Current Month)</Text>
      <Text style={styles.totalText}>
        Total Spent:{' '}
        <Text style={styles.totalValue}>
          {formatCurrency(totalSpent, primaryCurrency)}
        </Text>
      </Text>

      {series.length > 0 && (
        <View style={styles.stackedTrack}>
          {series.map((item, i) => {
            const widthPercent = (item.total / denom) * 100;
            return (
              <View
                key={item.category}
                style={{
                  width: `${widthPercent}%`,
                  backgroundColor: SLICE_COLORS[i % SLICE_COLORS.length],
                  height: '100%',
                }}
              />
            );
          })}
        </View>
      )}

      <View style={styles.list}>
        {series.map((item, i) => {
          const percent = totalSpent > 0 ? (item.total / totalSpent) * 100 : 0;
          return (
            <View key={item.category} style={styles.row}>
              <View
                style={[
                  styles.dot,
                  { backgroundColor: SLICE_COLORS[i % SLICE_COLORS.length] },
                ]}
              />
              <Text style={styles.categoryText}>{item.category}</Text>
              <Text style={styles.percentText}>{percent.toFixed(0)}%</Text>
              <Text style={styles.amountText}>
                {formatCurrency(item.total, primaryCurrency)}
              </Text>
            </View>
          );
        })}
        {series.length === 0 && (
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
  stackedTrack: {
    flexDirection: 'row',
    height: 10,
    borderRadius: 6,
    backgroundColor: '#0F172A',
    overflow: 'hidden',
    marginBottom: 14,
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
    width: 10,
    height: 10,
    borderRadius: 5,
    marginRight: 8,
  },
  categoryText: {
    flex: 1,
    fontFamily: Fonts.body,
    fontSize: 14,
    color: '#F9FAFB',
  },
  percentText: {
    fontFamily: 'JetBrainsMono_400Regular',
    fontSize: 12,
    color: '#9CA3AF',
    width: 40,
    textAlign: 'right',
    marginRight: 8,
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
