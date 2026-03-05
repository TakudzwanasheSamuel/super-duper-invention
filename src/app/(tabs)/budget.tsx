import React from 'react';
import { View, StyleSheet, Text } from 'react-native';
import GroceryList from '@/components/GroceryList';
import SubscriptionManager from '@/components/SubscriptionManager';
import SpendSplitVisual from '@/components/SpendSplitVisual';
import SavingsStreak from '@/components/SavingsStreak';
import { Colors, Fonts } from '@/constants/theme';

export default function BudgetScreen() {
  return (
    <View style={styles.container}>
      <Text style={styles.screenTitle}>Budget & Utilities</Text>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Savings Streak</Text>
        <View style={styles.card}>
          <SavingsStreak />
        </View>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Spend Split</Text>
        <View style={styles.card}>
          <SpendSplitVisual />
        </View>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Subscription Manager</Text>
        <View style={styles.card}>
          <SubscriptionManager />
        </View>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Grocery Template</Text>
        <View style={styles.card}>
          <GroceryList />
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
    padding: 16,
  },
  screenTitle: {
    fontFamily: Fonts.heading,
    fontSize: 20,
    color: '#F9FAFB',
    marginBottom: 16,
  },
  section: {
    marginBottom: 16,
  },
  sectionTitle: {
    fontFamily: Fonts.heading,
    fontSize: 14,
    color: '#9CA3AF',
    marginBottom: 8,
  },
  card: {
    backgroundColor: Colors.secondary,
    borderRadius: 16,
    padding: 16,
  },
});
