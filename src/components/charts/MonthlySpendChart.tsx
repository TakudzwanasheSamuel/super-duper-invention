import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import LuxuryCard from './LuxuryCard';
import { useInsightsStore } from '@/store/useInsightsStore';
import { useUserStore } from '@/store/useUserStore';
import { Colors, Fonts } from '@/constants/theme';
import { formatCurrency } from '@/utils/finance';

function parseMonthLabel(month: string | number): string {
  if (typeof month === 'string') {
    // Expecting YYYY-MM format from the store.
    const match = month.match(/^(\d{4})-(\d{2})$/);
    if (match) {
      const date = new Date(Number(match[1]), Number(match[2]) - 1, 1);
      return date.toLocaleString('default', { month: 'short' });
    }
  }
  const parsed = new Date(month as any);
  if (isNaN(parsed.getTime())) return '';
  return parsed.toLocaleString('default', { month: 'short' });
}

export default function MonthlySpendChart() {
  const { monthlySpending, fetchMonthlySpending } = useInsightsStore();
  const { primaryCurrency } = useUserStore();

  React.useEffect(() => {
    fetchMonthlySpending();
  }, [fetchMonthlySpending]);

  const lastSix = monthlySpending.slice(-6);
  const maxTotal = Math.max(...lastSix.map(m => m.total), 1);
  const totalSixMonths = lastSix.reduce((acc, m) => acc + m.total, 0);
  const average = lastSix.length > 0 ? totalSixMonths / lastSix.length : 0;
  const hasAnyData = lastSix.some(m => m.total > 0);

  return (
    <LuxuryCard>
      <Text style={styles.title}>Last 6 Months Spend</Text>
      {hasAnyData && (
        <Text style={styles.subtitle}>
          Avg {formatCurrency(average, primaryCurrency)} / month · Total{' '}
          {formatCurrency(totalSixMonths, primaryCurrency)}
        </Text>
      )}

      {lastSix.map((m) => {
        const widthPercent = (m.total / maxTotal) * 100;
        const isMax = m.total > 0 && m.total === maxTotal;
        return (
          <View key={String(m.month)} style={styles.row}>
            <Text style={[styles.monthLabel, isMax && styles.monthLabelMax]}>
              {parseMonthLabel(m.month)}
            </Text>
            <View style={styles.barTrack}>
              <View
                style={[
                  styles.barFill,
                  { width: `${widthPercent}%` },
                  isMax && styles.barFillMax,
                ]}
              />
            </View>
            <Text style={styles.amountText}>
              {formatCurrency(m.total, primaryCurrency)}
            </Text>
          </View>
        );
      })}

      {!hasAnyData && (
        <Text style={styles.emptyText}>
          No monthly spending data yet. Add some transactions to see trends.
        </Text>
      )}
    </LuxuryCard>
  );
}

const styles = StyleSheet.create({
  title: {
    color: '#F9FAFB',
    fontFamily: Fonts.heading,
    fontSize: 16,
    textAlign: 'center',
    marginBottom: 4,
  },
  subtitle: {
    fontFamily: Fonts.body,
    fontSize: 11,
    color: '#9CA3AF',
    textAlign: 'center',
    marginBottom: 12,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  monthLabel: {
    width: 44,
    fontFamily: Fonts.body,
    fontSize: 12,
    color: '#9CA3AF',
  },
  monthLabelMax: {
    color: Colors.accent.gold,
    fontFamily: Fonts.heading,
  },
  barTrack: {
    flex: 1,
    height: 10,
    borderRadius: 5,
    backgroundColor: '#0F172A',
    marginHorizontal: 8,
    overflow: 'hidden',
  },
  barFill: {
    height: '100%',
    borderRadius: 5,
    backgroundColor: Colors.accent.blue,
  },
  barFillMax: {
    backgroundColor: Colors.accent.gold,
  },
  amountText: {
    fontFamily: 'JetBrainsMono_400Regular',
    fontSize: 12,
    color: '#F9FAFB',
    width: 96,
    textAlign: 'right',
  },
  emptyText: {
    marginTop: 8,
    fontFamily: Fonts.body,
    fontSize: 12,
    color: '#9CA3AF',
    textAlign: 'center',
  },
});
