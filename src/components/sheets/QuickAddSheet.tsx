import React, { useState } from 'react';
import { View, Text, StyleSheet, TextInput, TouchableOpacity, ScrollView, Alert } from 'react-native';
import { Colors, Fonts } from '@/constants/theme';
import * as Haptics from 'expo-haptics';
import { useTransactionStore } from '@/store/useTransactionStore';
import { useCategoryStore } from '@/store/useCategoryStore';
import { MaterialIcons } from '@expo/vector-icons';

export default function QuickAddSheet() {
  const [amount, setAmount] = useState('');
  const [currency, setCurrency] = useState<'USD' | 'ZiG'>('USD');
  const [type, setType] = useState<'income' | 'expense'>('expense');
  const [rate, setRate] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<number | null>(null);
  const { addTransaction, currentExchangeRate } = useTransactionStore();
  const { categories } = useCategoryStore();

  const handleLogTransaction = () => {
    const trimmedAmount = amount.trim();
    const parsedAmount = parseFloat(trimmedAmount.replace(/,/g, ''));

    if (!trimmedAmount || isNaN(parsedAmount) || parsedAmount <= 0) {
      Alert.alert('Amount required', 'Please enter a valid amount greater than 0.');
      return;
    }

    if (selectedCategory == null) {
      Alert.alert('Select a category', 'Please choose a category for this transaction.');
      return;
    }

    const amountInCents = Math.round(parsedAmount * 100);
    const effectiveRate =
      currency === 'ZiG'
        ? (parseFloat(rate) > 0 ? parseFloat(rate) : currentExchangeRate)
        : currentExchangeRate;

    const transaction = {
      amount: amountInCents,
      currency,
      type,
      rate: effectiveRate,
      category_id: selectedCategory as number,
      note: '', // You can add a note field if you want
      payment_method: 'cash', // Default or from another input
      timestamp: Date.now(),
    };
    addTransaction(transaction);
    // Clear inputs after logging
    setAmount('');
    setRate('');
    setSelectedCategory(null);
    Alert.alert('Saved', 'Your transaction has been logged.');
  };

  const toggleType = (newType: 'income' | 'expense') => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setType(newType);
  };

  const buttonColor = currency === 'ZiG' ? Colors.accent.gold : Colors.accent.blue;

  return (
    <View style={styles.sheetContainer}>
      <View style={styles.contentContainer}>
        <Text style={styles.sheetTitle}>Quick Add</Text>
        <TextInput
          style={styles.amountInput}
          placeholder="$0.00"
          keyboardType="numeric"
          value={amount}
          onChangeText={setAmount}
        />
        <View style={styles.currencyToggle}>
          <TouchableOpacity
            style={[styles.toggleButton, currency === 'USD' && styles.activeButton]}
            onPress={() => setCurrency('USD')}
          >
            <Text style={[styles.toggleText, currency === 'USD' && styles.activeText]}>USD</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.toggleButton, currency === 'ZiG' && styles.activeButton]}
            onPress={() => setCurrency('ZiG')}
          >
            <Text style={[styles.toggleText, currency === 'ZiG' && styles.activeText]}>ZiG</Text>
          </TouchableOpacity>
        </View>
        {currency === 'ZiG' && (
          <TextInput
            style={styles.rateInput}
            placeholder={`Current Market Rate? (Default: ${currentExchangeRate})`}
            keyboardType="numeric"
            value={rate}
            onChangeText={setRate}
          />
        )}
        <View style={styles.typeToggle}>
          <TouchableOpacity
            style={[styles.toggleButton, type === 'expense' && styles.activeButton]}
            onPress={() => toggleType('expense')}
          >
            <Text style={[styles.toggleText, type === 'expense' && styles.activeText]}>Expense</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.toggleButton, type === 'income' && styles.activeButton]}
            onPress={() => toggleType('income')}
          >
            <Text style={[styles.toggleText, type === 'income' && styles.activeText]}>Income</Text>
          </TouchableOpacity>
        </View>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.categoryScroller}>
          {categories.filter(c => c.type === type).map(category => (
            <TouchableOpacity
              key={category.id}
              style={[styles.categoryChip, selectedCategory === category.id && styles.activeCategory]}
              onPress={() => setSelectedCategory(category.id)}
            >
              <MaterialIcons
                name={category.icon_name as any}
                size={24}
                color={selectedCategory === category.id ? 'white' : Colors.secondary}
              />
              <Text style={styles.categoryText}>{category.name}</Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
        <TouchableOpacity
          style={[styles.logButton, { backgroundColor: buttonColor }]}
          onPress={handleLogTransaction}
        >
          <Text style={styles.logButtonText}>Log Transaction</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  sheetContainer: {
    backgroundColor: Colors.background,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    paddingTop: 12,
  },
  contentContainer: {
    flex: 1,
    alignItems: 'center',
    padding: 20,
  },
  sheetTitle: {
    fontFamily: Fonts.heading,
    fontSize: 16,
    color: '#F9FAFB',
    marginBottom: 8,
  },
  amountInput: {
    fontSize: 64,
    fontFamily: Fonts.heading,
    color: 'white',
    borderBottomWidth: 0,
  },
  currencyToggle: {
    flexDirection: 'row',
    marginVertical: 20,
  },
  toggleButton: {
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: Colors.secondary,
    marginHorizontal: 10,
  },
  activeButton: {
    backgroundColor: Colors.secondary,
  },
  toggleText: {
    color: 'white',
    fontFamily: Fonts.body,
  },
  activeText: {
    color: Colors.background,
  },
  rateInput: {
    width: '80%',
    padding: 10,
    borderBottomWidth: 1,
    borderColor: Colors.secondary,
    color: 'white',
    textAlign: 'center',
    marginVertical: 10,
  },
  typeToggle: {
    flexDirection: 'row',
    marginBottom: 20,
  },
  categoryScroller: {
    maxHeight: 100,
  },
  categoryChip: {
    alignItems: 'center',
    marginHorizontal: 15,
  },
  activeCategory: {
    // Add some highlight for active category
  },
  categoryText: {
    color: Colors.secondary,
    marginTop: 5,
  },
  logButton: {
    width: '90%',
    padding: 15,
    borderRadius: 20,
    alignItems: 'center',
    marginTop: 20,
  },
  logButtonText: {
    color: 'white',
    fontFamily: Fonts.heading,
    fontSize: 18,
  },
});
