import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import LuxuryCard from './LuxuryCard';
import { useInsightsStore } from '@/store/useInsightsStore';
import { useUserStore } from '@/store/useUserStore';
import { Colors, Fonts } from '@/constants/theme';
import { formatCurrency } from '@/utils/finance';

const DAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

export default function DailySpendHeatmap() {
  const { dailySpending, fetchDailySpending } = useInsightsStore();
  const { primaryCurrency } = useUserStore();

  React.useEffect(() => {
    fetchDailySpending();
  }, [fetchDailySpending]);

  const data = DAYS.map(day => {
    const found = dailySpending.find(d => d.day === day);
    const total = found && Number.isFinite(found.total) ? found.total : 0;
    return { day, total };
  });

  const maxTotal = Math.max(...data.map(d => d.total), 1);
  const hasAnyData = data.some(d => d.total > 0);
  const peakDay = hasAnyData
    ? data.reduce((a, b) => (a.total > b.total ? a : b)).day
    : null;

  return (
    <LuxuryCard>
      <Text style={styles.title}>Daily Spending Density</Text>
      <Text style={styles.subtitle}>
        {hasAnyData
          ? `Average by weekday · highest on ${peakDay}`
          : 'Average by weekday'}
      </Text>

      {data.map((item) => {
        const widthPercent = (item.total / maxTotal) * 100;
        const isMax = hasAnyData && item.total > 0 && item.total === maxTotal;
        return (
          <View key={item.day} style={styles.row}>
            <Text style={[styles.dayLabel, isMax && styles.dayLabelMax]}>
              {item.day}
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
              {formatCurrency(item.total, primaryCurrency)}
            </Text>
          </View>
        );
      })}

      {!hasAnyData && (
        <Text style={styles.emptyText}>
          No daily spending data yet. Add some transactions to see activity.
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
  dayLabel: {
    width: 36,
    fontFamily: Fonts.body,
    fontSize: 12,
    color: '#9CA3AF',
  },
  dayLabelMax: {
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
    width: 92,
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
