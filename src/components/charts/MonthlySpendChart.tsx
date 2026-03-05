import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import LuxuryCard from './LuxuryCard';
import { useInsightsStore } from '@/store/useInsightsStore';
import { useUserStore } from '@/store/useUserStore';
import { Colors, Fonts } from '@/constants/theme';

export default function MonthlySpendChart() {
  const { monthlySpending, fetchMonthlySpending } = useInsightsStore();
  const { primaryCurrency } = useUserStore();

  React.useEffect(() => {
    fetchMonthlySpending();
  }, [fetchMonthlySpending]);

  const lastSix = monthlySpending.slice(-6);
  const maxTotal = Math.max(...lastSix.map(m => m.total), 1);

  return (
    <LuxuryCard>
      <Text style={styles.title}>Last 6 Months Spend</Text>
      {lastSix.map((m) => {
        const widthPercent = (m.total / maxTotal) * 100;
        const monthLabel =
          typeof m.month === 'string' || typeof m.month === 'number'
            ? new Date(m.month).toLocaleString('default', { month: 'short' })
            : '';

        return (
          <View key={String(m.month)} style={styles.row}>
            <Text style={styles.monthLabel}>{monthLabel}</Text>
            <View style={styles.barTrack}>
              <View
                style={[
                  styles.barFill,
                  { width: `${widthPercent}%` },
                ]}
              />
            </View>
            <Text style={styles.amountText}>
              {primaryCurrency} {m.total.toFixed(2)}
            </Text>
          </View>
        );
      })}
      {!lastSix.length && (
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
    marginBottom: 12,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  monthLabel: {
    width: 40,
    fontFamily: Fonts.body,
    fontSize: 12,
    color: '#9CA3AF',
  },
  barTrack: {
    flex: 1,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#0F172A',
    marginHorizontal: 8,
    overflow: 'hidden',
  },
  barFill: {
    height: '100%',
    borderRadius: 4,
    backgroundColor: Colors.accent.gold,
  },
  amountText: {
    fontFamily: 'JetBrainsMono_400Regular',
    fontSize: 12,
    color: '#F9FAFB',
  },
  emptyText: {
    marginTop: 8,
    fontFamily: Fonts.body,
    fontSize: 12,
    color: '#9CA3AF',
    textAlign: 'center',
  },
});
