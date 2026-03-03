import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { VictoryBar, VictoryChart, VictoryAxis, VictoryTooltip } from 'victory-native';
import { useInsightsStore } from '@/store/useInsightsStore';
import { ChartTheme } from './ChartTheme';
import LuxuryCard from './LuxuryCard';
import { useUserStore } from '@/store/useUserStore';
import * as Haptics from 'expo-haptics';

export default function DailySpendHeatmap() {
  const { dailySpending, fetchDailySpending } = useInsightsStore();
  const { primaryCurrency } = useUserStore();

  React.useEffect(() => {
    fetchDailySpending();
  }, []);

  const daysOfWeek = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
  const data = daysOfWeek.map(day => {
    const found = dailySpending.find(d => d.day === day);
    return { x: day, y: found ? found.total : 0 };
  });

  return (
    <LuxuryCard>
      <Text style={styles.title}>Daily Spending Density</Text>
      <VictoryChart
        theme={ChartTheme}
        domainPadding={{ x: 20 }}
        height={250}
      >
        <VictoryAxis />
        <VictoryBar
          horizontal
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
