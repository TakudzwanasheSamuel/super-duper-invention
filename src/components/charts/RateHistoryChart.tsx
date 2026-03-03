import React from 'react';
import { View, Text, StyleSheet, Dimensions } from 'react-native';
import { VictoryLine, VictoryChart, VictoryAxis, VictoryArea, VictoryVoronoiContainer, VictoryTooltip } from 'victory-native';
import { useRateStore } from '@/store/useRateStore';
import { ChartTheme } from './ChartTheme';
import LuxuryCard from './LuxuryCard';
import { LinearGradient, Stop } from 'react-native-svg';
import { Colors } from '@/constants/theme';
import * as Haptics from 'expo-haptics';

const { width } = Dimensions.get('window');

export default function RateHistoryChart() {
  const { rateHistory, fetchRateHistory } = useRateStore();

  React.useEffect(() => {
    fetchRateHistory();
  }, []);

  const data = rateHistory.map(entry => ({
    x: new Date(entry.timestamp),
    y: entry.rate,
    label: `Rate: ${entry.rate.toFixed(2)}\nDate: ${new Date(entry.timestamp).toLocaleDateString()}`,
  }));

  return (
    <LuxuryCard>
      <Text style={styles.title}>ZiG Rate History</Text>
      {data.length > 1 ? (
        <VictoryChart
          theme={ChartTheme}
          width={width - 60}
          height={250}
          containerComponent={
            <VictoryVoronoiContainer
              voronoiDimension="x"
              labels={({ datum }) => datum.label}
              labelComponent={
                <VictoryTooltip
                  cornerRadius={5}
                  flyoutStyle={{ fill: Colors.background, stroke: Colors.accent.gold, strokeWidth: 1 }}
                  style={{ fill: 'white', fontFamily: 'JetBrainsMono-Regular' }}
                />
              }
            />
          }
        >
          <VictoryAxis
            tickFormat={(t) => new Date(t).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
            fixLabelOverlap
          />
          <VictoryAxis dependentAxis />
          <VictoryArea
            data={data}
            style={{
              data: { stroke: Colors.accent.gold, strokeWidth: 2, fill: 'url(#goldGradient)' },
            }}
            interpolation="natural"
          />
          <LinearGradient id="goldGradient">
            <Stop offset="0%" stopColor={Colors.accent.gold} stopOpacity={0.3} />
            <Stop offset="100%" stopColor={Colors.accent.gold} stopOpacity={0} />
          </LinearGradient>
        </VictoryChart>
      ) : (
        <View style={styles.placeholderContainer}>
          <Text style={styles.placeholderText}>Not enough data to display chart. Please add at least two rate entries.</Text>
        </View>
      )}
    </LuxuryCard>
  );
}

const styles = StyleSheet.create({
  title: {
    color: 'white',
    fontFamily: 'JetBrainsMono-Bold',
    fontSize: 18,
    textAlign: 'center',
    marginBottom: 20,
  },
  placeholderContainer: {
    height: 200,
    justifyContent: 'center',
    alignItems: 'center',
  },
  placeholderText: {
    color: Colors.secondary,
    fontFamily: 'JetBrainsMono-Regular',
    textAlign: 'center',
    paddingHorizontal: 20,
  },
});
