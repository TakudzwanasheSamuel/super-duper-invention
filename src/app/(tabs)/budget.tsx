import React from 'react';
import { View, StyleSheet, ScrollView, Text } from 'react-native';
import GroceryList from '@/components/GroceryList';
import SubscriptionManager from '@/components/SubscriptionManager';
import SpendSplitVisual from '@/components/SpendSplitVisual';
import SavingsStreak from '@/components/SavingsStreak';
import { Colors, Fonts } from '@/constants/theme';

export default function BudgetScreen() {
  return (
    <ScrollView style={styles.container}>
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Savings Streak</Text>
        <SavingsStreak />
      </View>
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Spend Split</Text>
        <SpendSplitVisual />
      </View>
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Subscription Manager</Text>
        <SubscriptionManager />
      </View>
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Grocery Template</Text>
        <GroceryList />
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  section: {
    marginBottom: 30,
  },
  sectionTitle: {
    fontFamily: Fonts.heading,
    fontSize: 28,
    color: 'white',
    textAlign: 'center',
    marginVertical: 20,
  },
});
