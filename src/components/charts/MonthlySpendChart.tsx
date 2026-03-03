import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { VictoryBar, VictoryChart, VictoryAxis, VictoryTooltip } from 'victory-native';
import { useInsightsStore } from '@/store/useInsightsStore';
import { ChartTheme } from './ChartTheme';
import LuxuryCard from './LuxuryCard';
import { useUserStore } from '@/store/useUserStore';
import * as Haptics from 'expo-haptics';

export default function MonthlySpendChart() {
  const { monthlySpending, fetchMonthlySpending } = useInsightsStore();
  const { primaryCurrency } = useUserStore();

  React.useEffect(() => {
    fetchMonthlySpending();
  }, []);

  const data = monthlySpending.map(m => ({
    x: m.month,
    y: m.total,
  }));

  return (
    <LuxuryCard>
      <Text style={styles.title}>Last 6 Months Spend</Text>
      <VictoryChart
        theme={ChartTheme}
        domainPadding={{ x: 20 }}
        height={300}
      >
        <VictoryAxis tickFormat={(t) => new Date(t).toLocaleString('default', { month: 'short' })} />
        <VictoryBar
          data={data}
          labels={({ datum }) => `${primaryCurrency} ${datum.y.toFixed(2)}`}
          labelComponent={<VictoryTooltip renderInPortal={false} />}
          events={[{
            target: 'data',
            eventHandlers: {
              onPressIn: () => {
                Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                return [];
              }
            }
          }]}
        />
      </VictoryChart>
    </LuxuryCard>
  );
}

const styles = StyleSheet.create({
  title: {
    color: 'white',
    fontFamily: 'JetBrainsMono-Bold',
    fontSize: 18,
    textAlign: 'center',
    marginBottom: 10,
  },
});
