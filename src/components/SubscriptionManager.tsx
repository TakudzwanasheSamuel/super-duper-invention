import React, { useState } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, TextInput, Alert } from 'react-native';
import { useSubscriptionStore } from '@/store/useSubscriptionStore';
import { useCategoryStore } from '@/store/useCategoryStore';
import { useRateStore } from '@/store/useRateStore';
import { Colors, Fonts } from '@/constants/theme';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';

export default function SubscriptionManager() {
  const { subscriptions, fetchSubscriptions, addSubscription, getMonthlyDigitalBurn } = useSubscriptionStore();
  const { categories } = useCategoryStore();
  const { lastRate } = useRateStore();
  const [serviceName, setServiceName] = useState('');
  const [amount, setAmount] = useState('');
  const [billingDay, setBillingDay] = useState('');

  React.useEffect(() => {
    fetchSubscriptions();
  }, []);

  const handleAddSubscription = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);

    const trimmedName = serviceName.trim();
    const amountValue = parseFloat(amount);
    const billingDayValue = parseInt(billingDay, 10);

    if (!trimmedName) {
      Alert.alert('Service name required', 'Please enter the subscription/service name.');
      return;
    }

    if (isNaN(amountValue) || amountValue <= 0) {
      Alert.alert('Amount required', 'Please enter a valid positive amount.');
      return;
    }

    if (
      isNaN(billingDayValue) ||
      billingDayValue < 1 ||
      billingDayValue > 31
    ) {
      Alert.alert('Billing day invalid', 'Please enter a day between 1 and 31.');
      return;
    }

    // Prefer a dedicated "Subscriptions" expense category; otherwise fall back
    const subscriptionsCategory =
      categories.find(c => c.name === 'Subscriptions' && c.type === 'expense') ??
      categories.find(c => c.type === 'expense') ??
      null;

    if (!subscriptionsCategory) {
      Alert.alert(
        'No expense categories',
        'Please create at least one expense category in the Utility → Categories section before adding subscriptions.',
      );
      return;
    }

    addSubscription({
      service_name: trimmedName,
      amount: Math.round(amountValue * 100),
      currency: 'USD',
      billing_day: billingDayValue,
      category_id: subscriptionsCategory.id,
    });

    setServiceName('');
    setAmount('');
    setBillingDay('');
  };

  const renderItem = ({ item }) => {
    const projectedZigCost = (item.amount / 100) * lastRate;

    return (
      <View style={styles.card}>
        <MaterialCommunityIcons name="netflix" size={40} color="#E50914" />
        <View style={styles.cardDetails}>
          <Text style={styles.cardServiceName}>{item.service_name}</Text>
          <Text style={styles.cardAmount}>${(item.amount / 100).toFixed(2)}</Text>
          <Text style={styles.projectedCost}>Projected ZiG: ZWL {projectedZigCost.toFixed(2)}</Text>
        </View>
        <Text style={styles.cardBillingDay}>Day: {item.billing_day}</Text>
      </View>
    );
  };

  return (
    <View style={styles.container}>
      <View style={styles.headerContainer}>
        <Text style={styles.header}>Monthly Digital Burn</Text>
        <Text style={styles.burnAmount}>${getMonthlyDigitalBurn().toFixed(2)}</Text>
      </View>
      <FlatList
        data={subscriptions}
        renderItem={renderItem}
        keyExtractor={(item) => item.id.toString()}
        style={styles.list}
        scrollEnabled={false}
      />
      <View style={styles.addForm}>
        <TextInput
          style={styles.input}
          placeholder="Service Name (e.g., Netflix)"
          placeholderTextColor={Colors.accent.blue}
          value={serviceName}
          onChangeText={setServiceName}
        />
        <TextInput
          style={styles.input}
          placeholder="Amount"
          placeholderTextColor={Colors.accent.blue}
          keyboardType="numeric"
          value={amount}
          onChangeText={setAmount}
        />
        <TextInput
          style={styles.input}
          placeholder="Billing Day (1-31)"
          placeholderTextColor={Colors.accent.blue}
          keyboardType="numeric"
          value={billingDay}
          onChangeText={setBillingDay}
        />
        <TouchableOpacity style={styles.addButton} onPress={handleAddSubscription}>
          <Text style={styles.addButtonText}>Add Subscription</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  headerContainer: {
    alignItems: 'center',
    marginBottom: 20,
  },
  header: {
    fontFamily: Fonts.heading,
    fontSize: 24,
    color: 'white',
  },
  burnAmount: {
    fontFamily: Fonts.heading,
    fontSize: 36,
    color: Colors.accent.blue,
  },
  list: {
    flex: 1,
  },
  card: {
    backgroundColor: Colors.secondary,
    borderRadius: 12,
    padding: 12,
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 15,
  },
  cardDetails: {
    flex: 1,
    marginLeft: 15,
  },
  cardServiceName: {
    fontFamily: Fonts.heading,
    fontSize: 18,
    color: 'white',
  },
  cardAmount: {
    fontFamily: Fonts.body,
    fontSize: 16,
    color: '#E5E7EB',
  },
  projectedCost: {
    fontFamily: Fonts.body,
    fontSize: 14,
    color: Colors.accent.blue,
  },
  cardBillingDay: {
    fontFamily: Fonts.body,
    fontSize: 14,
    color: '#9CA3AF',
  },
  addForm: {
    marginTop: 20,
  },
  input: {
    backgroundColor: '#333',
    color: 'white',
    padding: 15,
    borderRadius: 10,
    marginBottom: 10,
    fontFamily: Fonts.body,
  },
  addButton: {
    backgroundColor: Colors.accent.blue,
    padding: 15,
    borderRadius: 10,
    alignItems: 'center',
  },
  addButtonText: {
    color: 'white',
    fontFamily: Fonts.heading,
    fontSize: 18,
  },
});
