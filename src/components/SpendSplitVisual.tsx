import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Svg, Circle, G, Text as SvgText } from 'react-native-svg';
import { useTransactionStore } from '@/store/useTransactionStore';
import { useUserStore } from '@/store/useUserStore';
import { Colors, Fonts } from '@/constants/theme';

export default function SpendSplitVisual() {
  const { getCardSpend, getCashSpend, paymentMethodFilter, setPaymentMethodFilter } = useTransactionStore();
  const { primaryCurrency } = useUserStore();

  const cardSpend = getCardSpend();
  const cashSpend = getCashSpend();
  const totalSpend = cardSpend + cashSpend;

  if (totalSpend === 0) {
    return (
      <View style={styles.container}>
        <Text style={styles.noDataText}>No spending data available</Text>
      </View>
    );
  }

  const cardPercentage = totalSpend > 0 ? (cardSpend / totalSpend) * 100 : 0;

  const radius = 80;
  const circumference = 2 * Math.PI * radius;

  return (
    <View style={styles.container}>
      <Svg height={200} width={200} viewBox="0 0 200 200">
        <G rotation="-90" origin="100, 100">
          <Circle
            cx="100"
            cy="100"
            r={radius}
            stroke={Colors.accent.green} // Cash
            strokeWidth="20"
            fill="transparent"
          />
          <Circle
            cx="100"
            cy="100"
            r={radius}
            stroke={Colors.accent.blue} // Card
            strokeWidth="20"
            fill="transparent"
            strokeDasharray={circumference}
            strokeDashoffset={circumference - (circumference * cardPercentage) / 100}
          />
        </G>
        <SvgText
          x="100"
          y="95"
          textAnchor="middle"
          alignmentBaseline="middle"
          fill="white"
          fontSize={24}
          fontFamily={Fonts.heading}
        >
          {totalSpend.toFixed(2)}
        </SvgText>
        <SvgText
          x="100"
          y="120"
          textAnchor="middle"
          alignmentBaseline="middle"
          fill={Colors.secondary}
          fontSize={14}
          fontFamily={Fonts.body}
        >
          {`Total Spend (${primaryCurrency})`}
        </SvgText>
      </Svg>
      <View style={styles.legend}>
        <View style={styles.legendItem}>
          <View style={[styles.legendColor, { backgroundColor: Colors.accent.blue }]} />
          <Text style={styles.legendText}>Card: ${cardSpend.toFixed(2)}</Text>
        </View>
        <View style={styles.legendItem}>
          <View style={[styles.legendColor, { backgroundColor: Colors.accent.green }]} />
          <Text style={styles.legendText}>Cash: ${cashSpend.toFixed(2)}</Text>
        </View>
      </View>
      <View style={styles.toggleContainer}>
        <TouchableOpacity
          style={[styles.toggleButton, paymentMethodFilter === 'all' && styles.toggleButtonActive]}
          onPress={() => setPaymentMethodFilter('all')}
        >
          <Text style={styles.toggleButtonText}>All</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.toggleButton, paymentMethodFilter === 'card' && styles.toggleButtonActive]}
          onPress={() => setPaymentMethodFilter('card')}
        >
          <Text style={styles.toggleButtonText}>Card Only</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.toggleButton, paymentMethodFilter === 'cash' && styles.toggleButtonActive]}
          onPress={() => setPaymentMethodFilter('cash')}
        >
          <Text style={styles.toggleButtonText}>Cash Only</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
    marginVertical: 20,
  },
  noDataText: {
    color: Colors.secondary,
    fontFamily: Fonts.body,
    fontSize: 16,
  },
  legend: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    width: '100%',
    marginTop: 20,
  },
  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  legendColor: {
    width: 15,
    height: 15,
    borderRadius: 8,
    marginRight: 10,
  },
  legendText: {
    color: 'white',
    fontFamily: Fonts.body,
    fontSize: 16,
  },
  toggleContainer: {
    flexDirection: 'row',
    marginTop: 20,
    backgroundColor: '#222',
    borderRadius: 10,
  },
  toggleButton: {
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 10,
  },
  toggleButtonActive: {
    backgroundColor: Colors.accent.blue,
  },
  toggleButtonText: {
    color: 'white',
    fontFamily: Fonts.body,
  },
});
