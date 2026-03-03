import React, { useState, useMemo } from 'react';
import { View, Text, StyleSheet, TextInput, TouchableOpacity, ScrollView } from 'react-native';
import BottomSheet from '@gorhom/bottom-sheet';
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

  const snapPoints = useMemo(() => ['50%', '85%'], []);

  const handleLogTransaction = () => {
    const amountInCents = Math.round(parseFloat(amount) * 100);
    const transaction = {
      amount: amountInCents,
      currency,
      type,
      rate: currency === 'ZiG' ? parseFloat(rate) || currentExchangeRate : currentExchangeRate,
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
  };

  const toggleType = (newType: 'income' | 'expense') => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setType(newType);
  };

  const buttonColor = currency === 'ZiG' ? Colors.accent.gold : Colors.accent.blue;

  return (
    <BottomSheet index={-1} snapPoints={snapPoints} style={styles.sheetContainer}>
      <View style={styles.contentContainer}>
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
              <MaterialIcons name={category.icon_name as any} size={24} color={selectedCategory === category.id ? 'white' : Colors.secondary} />
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
    </BottomSheet>
  );
}

const styles = StyleSheet.create({
  sheetContainer: {
    backgroundColor: Colors.background,
  },
  contentContainer: {
    flex: 1,
    alignItems: 'center',
    padding: 20,
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
