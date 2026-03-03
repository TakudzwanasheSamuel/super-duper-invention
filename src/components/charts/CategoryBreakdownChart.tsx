import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { VictoryPie, VictoryLabel } from 'victory-native';
import { useNavigation } from '@react-navigation/native';
import Animated, { useSharedValue, withTiming, useAnimatedProps } from 'react-native-reanimated';
import { Svg, Text as SvgText } from 'react-native-svg';
import { useInsightsStore } from '@/store/useInsightsStore';
import { ChartTheme } from './ChartTheme';
import LuxuryCard from './LuxuryCard';
import { useUserStore } from '@/store/useUserStore';
import { Colors, Fonts } from '@/constants/theme';
import { CategoryIcons } from '@/constants/categories';

const AnimatedSvgText = Animated.createAnimatedComponent(SvgText);

export default function CategoryBreakdownChart() {
  const { categorySpending, totalSpent, fetchCategorySpending } = useInsightsStore();
  const { primaryCurrency } = useUserStore();
  const navigation = useNavigation();

  const animatedTotal = useSharedValue(0);

  React.useEffect(() => {
    const unsubscribe = navigation.addListener('focus', () => {
      fetchCategorySpending();
    });
    return unsubscribe;
  }, [navigation]);

  React.useEffect(() => {
    animatedTotal.value = withTiming(totalSpent, { duration: 1000 });
  }, [totalSpent]);

  const animatedProps = useAnimatedProps(() => {
    return {
      children: `${primaryCurrency} ${animatedTotal.value.toFixed(2)}`,
    };
  });

  const colorScale = [
    Colors.accent.blue,
    Colors.accent.gold,
    Colors.accent.green,
    '#FF6384',
    '#36A2EB',
    '#FFCE56',
    '#4BC0C0',
  ];

  const data = categorySpending.map(c => ({
    x: c.category,
    y: c.total,
  }));

  return (
    <LuxuryCard>
      <Text style={styles.title}>Category Breakdown (Current Month)</Text>
      <View style={styles.container}>
        <View style={styles.chartContainer}>
          <Svg viewBox="0 0 250 250">
            <VictoryPie
              standalone={false}
              width={250} height={250}
              data={data}
              innerRadius={70}
              labelRadius={100}
              style={{ labels: { display: 'none' } }}
              colorScale={colorScale}
            />
            <VictoryLabel
              textAnchor="middle"
              style={{ fontSize: 20, fill: 'white', fontFamily: Fonts.heading }}
              x={125} y={115}
              text="Total Spent"
            />
            <AnimatedSvgText
              x={125}
              y={140}
              textAnchor="middle"
              style={{ fontSize: 22, fill: Colors.accent.gold, fontFamily: Fonts.heading }}
              animatedProps={animatedProps}
            />
          </Svg>
        </View>
        <View style={styles.legendContainer}>
          {data.map((item, index) => (
            <View key={index} style={styles.legendItem}>
              <View style={[styles.legendColor, { backgroundColor: colorScale[index % colorScale.length] }]} />
              <Text style={styles.legendText}>{`${item.x}: ${primaryCurrency} ${item.y.toFixed(2)}`}</Text>
            </View>
          ))}
        </View>
      </View>
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
  container: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  chartContainer: {
    flex: 1,
  },
  legendContainer: {
    flex: 1,
    paddingLeft: 20,
  },
  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  legendColor: {
    width: 15,
    height: 15,
    borderRadius: 8,
    marginRight: 10,
  },
  legendText: {
    color: 'white',
    fontFamily: 'JetBrainsMono-Regular',
    fontSize: 14,
  },
});
