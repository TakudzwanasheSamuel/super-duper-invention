import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import LuxuryCard from './LuxuryCard';
import { useInsightsStore } from '@/store/useInsightsStore';
import { useUserStore } from '@/store/useUserStore';
import { Colors, Fonts } from '@/constants/theme';

export default function DailySpendHeatmap() {
  const { dailySpending, fetchDailySpending } = useInsightsStore();
  const { primaryCurrency } = useUserStore();

  React.useEffect(() => {
    fetchDailySpending();
  }, [fetchDailySpending]);

  const daysOfWeek = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
  const data = daysOfWeek.map(day => {
    const found = dailySpending.find(d => d.day === day);
    return { day, total: found ? found.total : 0 };
  });

  const maxTotal = Math.max(...data.map(d => d.total), 1);

  return (
    <LuxuryCard>
      <Text style={styles.title}>Daily Spending Density</Text>
      {data.map((item) => {
        const widthPercent = (item.total / maxTotal) * 100;
        return (
          <View key={item.day} style={styles.row}>
            <Text style={styles.dayLabel}>{item.day}</Text>
            <View style={styles.barTrack}>
              <View
                style={[
                  styles.barFill,
                  { width: `${widthPercent}%` },
                ]}
              />
            </View>
            <Text style={styles.amountText}>
              {primaryCurrency} {item.total.toFixed(2)}
            </Text>
          </View>
        );
      })}
      {!dailySpending.length && (
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
    marginBottom: 12,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  dayLabel: {
    width: 32,
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
    backgroundColor: Colors.accent.blue,
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
