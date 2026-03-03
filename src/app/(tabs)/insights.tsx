import React from 'react';
import { ScrollView, StyleSheet, View, Text } from 'react-native';
import DailySpendHeatmap from '@/components/charts/DailySpendHeatmap';
import MonthlySpendChart from '@/components/charts/MonthlySpendChart';
import CategoryBreakdownChart from '@/components/charts/CategoryBreakdownChart';
import { Colors, Fonts } from '@/constants/theme';

export default function InsightsScreen() {
  return (
    <ScrollView style={styles.container}>
      <Text style={styles.header}>Spending Insights</Text>
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
    padding: 15,
  },
  header: {
    fontFamily: Fonts.heading,
    fontSize: 32,
    color: 'white',
    textAlign: 'center',
    marginVertical: 20,
  },
});
