import React, { useState } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, TextInput, Alert } from 'react-native';
import { useSubscriptionStore } from '@/store/useSubscriptionStore';
import { useCategoryStore } from '@/store/useCategoryStore';
import { useRateStore } from '@/store/useRateStore';
import { useUserStore } from '@/store/useUserStore';
import { Colors, Fonts } from '@/constants/theme';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { formatCurrency } from '@/utils/finance';

type Currency = 'USD' | 'ZiG';

export default function SubscriptionManager() {
  const { subscriptions, addSubscription, getMonthlyDigitalBurn } = useSubscriptionStore();
  const { categories } = useCategoryStore();
  const { lastRate } = useRateStore();
  const { primaryCurrency } = useUserStore();

  const [serviceName, setServiceName] = useState('');
  const [amount, setAmount] = useState('');
  const [billingDay, setBillingDay] = useState('');
  const [currency, setCurrency] = useState<Currency>(primaryCurrency);

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

    if (isNaN(billingDayValue) || billingDayValue < 1 || billingDayValue > 31) {
      Alert.alert('Billing day invalid', 'Please enter a day between 1 and 31.');
      return;
    }

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
      currency,
      billing_day: billingDayValue,
      category_id: subscriptionsCategory.id,
    });

    setServiceName('');
    setAmount('');
    setBillingDay('');
    setCurrency(primaryCurrency);
  };

  const renderItem = ({ item }: { item: typeof subscriptions[number] }) => {
    const amountText = formatCurrency(item.amount / 100, item.currency);
    const projectedCurrency: Currency = item.currency === 'USD' ? 'ZiG' : 'USD';
    const projected =
      item.currency === 'USD'
        ? (item.amount / 100) * (lastRate || 1)
        : (item.amount / 100) / (lastRate || 1);

    return (
      <View style={styles.card}>
        <MaterialCommunityIcons name="play-circle" size={40} color={Colors.accent.gold} />
        <View style={styles.cardDetails}>
          <Text style={styles.cardServiceName}>{item.service_name}</Text>
          <Text style={styles.cardAmount}>{amountText}</Text>
          <Text style={styles.projectedCost}>
            Projected: {formatCurrency(projected, projectedCurrency)}
          </Text>
        </View>
        <Text style={styles.cardBillingDay}>Day: {item.billing_day}</Text>
      </View>
    );
  };

  return (
    <View style={styles.container}>
      <View style={styles.headerContainer}>
        <Text style={styles.header}>Monthly Digital Burn</Text>
        <Text style={styles.burnAmount}>
          {formatCurrency(getMonthlyDigitalBurn(), primaryCurrency)}
        </Text>
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
        <View style={styles.currencyRow}>
          {(['USD', 'ZiG'] as Currency[]).map(c => {
            const active = currency === c;
            return (
              <TouchableOpacity
                key={c}
                style={[styles.currencyPill, active && styles.currencyPillActive]}
                onPress={() => setCurrency(c)}
              >
                <Text style={[styles.currencyPillText, active && styles.currencyPillTextActive]}>
                  {c}
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>
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
    backgroundColor: '#0A0A0A',
    color: '#F9FAFB',
    padding: 15,
    borderRadius: 10,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: Colors.accent.blue,
    fontFamily: Fonts.body,
  },
  currencyRow: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 10,
  },
  currencyPill: {
    flex: 1,
    paddingVertical: 10,
    borderRadius: 999,
    borderWidth: 1,
    borderColor: Colors.accent.blue,
    alignItems: 'center',
  },
  currencyPillActive: {
    backgroundColor: Colors.accent.blue,
  },
  currencyPillText: {
    fontFamily: Fonts.body,
    color: '#E5E7EB',
    fontSize: 14,
  },
  currencyPillTextActive: {
    color: '#0B1120',
    fontFamily: Fonts.heading,
  },
  addButton: {
    backgroundColor: Colors.accent.gold,
    padding: 15,
    borderRadius: 10,
    alignItems: 'center',
  },
  addButtonText: {
    color: '#0B1120',
    fontFamily: Fonts.heading,
    fontSize: 18,
  },
});
