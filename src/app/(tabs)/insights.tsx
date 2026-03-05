import React from 'react';
import { ScrollView, StyleSheet, Text } from 'react-native';
import DailySpendHeatmap from '@/components/charts/DailySpendHeatmap';
import MonthlySpendChart from '@/components/charts/MonthlySpendChart';
import CategoryBreakdownChart from '@/components/charts/CategoryBreakdownChart';
import { Colors, Fonts } from '@/constants/theme';

export default function InsightsScreen() {
  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <Text style={styles.screenTitle}>Insights</Text>
      <CategoryBreakdownChart />
      <DailySpendHeatmap />
      <MonthlySpendChart />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  content: {
    padding: 16,
    paddingBottom: 24,
  },
  screenTitle: {
    fontFamily: Fonts.heading,
    fontSize: 20,
    color: '#F9FAFB',
    marginBottom: 16,
  },
});
