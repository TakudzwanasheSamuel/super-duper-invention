import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useRateStore } from '@/store/useRateStore';
import LuxuryCard from './LuxuryCard';
import { Colors, Fonts } from '@/constants/theme';

export default function RateHistoryChart() {
  const { rateHistory, fetchRateHistory } = useRateStore();

  React.useEffect(() => {
    fetchRateHistory();
  }, [fetchRateHistory]);

  const sorted = [...rateHistory].sort((a, b) => a.timestamp - b.timestamp);
  const latest = sorted[sorted.length - 1];
  const recent = sorted.slice(-5).reverse();

  return (
    <LuxuryCard>
      <Text style={styles.title}>ZiG Rate History</Text>
      {latest ? (
        <>
          <View style={styles.currentRow}>
            <View>
              <Text style={styles.currentLabel}>Latest rate</Text>
              <Text style={styles.currentValue}>{latest.rate.toFixed(2)}</Text>
            </View>
            <Text style={styles.currentDate}>
              {new Date(latest.timestamp).toLocaleDateString()}
            </Text>
          </View>

          <View style={styles.divider} />

          {recent.map(entry => (
            <View key={entry.id ?? entry.timestamp} style={styles.historyRow}>
              <Text style={styles.historyDate}>
                {new Date(entry.timestamp).toLocaleDateString('en-US', {
                  month: 'short',
                  day: 'numeric',
                })}
              </Text>
              <Text style={styles.historyRate}>{entry.rate.toFixed(2)}</Text>
            </View>
          ))}
        </>
      ) : (
        <View style={styles.placeholderContainer}>
          <Text style={styles.placeholderText}>
            No rate history yet. Update the rate above to start tracking.
          </Text>
        </View>
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
  currentRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
    marginBottom: 12,
  },
  currentLabel: {
    fontFamily: Fonts.body,
    fontSize: 12,
    color: '#9CA3AF',
  },
  currentValue: {
    fontFamily: 'JetBrainsMono_400Regular',
    fontSize: 28,
    color: Colors.accent.gold,
  },
  currentDate: {
    fontFamily: Fonts.body,
    fontSize: 12,
    color: '#9CA3AF',
  },
  divider: {
    height: 1,
    backgroundColor: '#1F2937',
    marginBottom: 8,
  },
  historyRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 4,
  },
  historyDate: {
    fontFamily: Fonts.body,
    fontSize: 13,
    color: '#D1D5DB',
  },
  historyRate: {
    fontFamily: 'JetBrainsMono_400Regular',
    fontSize: 13,
    color: '#E5E7EB',
  },
  placeholderContainer: {
    minHeight: 80,
    justifyContent: 'center',
    alignItems: 'center',
  },
  placeholderText: {
    color: '#9CA3AF',
    fontFamily: Fonts.body,
    fontSize: 13,
    textAlign: 'center',
  },
});
