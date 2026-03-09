import React, { useState } from 'react';
import {
  View,
  StyleSheet,
  Text,
  TextInput,
  ScrollView,
  TouchableOpacity,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import GroceryList from '@/components/GroceryList';
import SubscriptionManager from '@/components/SubscriptionManager';
import SpendSplitVisual from '@/components/SpendSplitVisual';
import SavingsStreak from '@/components/SavingsStreak';
import { Colors, Fonts } from '@/constants/theme';
import { useTransactionStore } from '@/store/useTransactionStore';
import { useCategoryStore } from '@/store/useCategoryStore';
import { useUserStore } from '@/store/useUserStore';
import { MaterialIcons } from '@expo/vector-icons';

export default function BudgetScreen() {
  const { addTransaction, currentExchangeRate } = useTransactionStore();
  const { categories } = useCategoryStore();
  const { primaryCurrency } = useUserStore();

  const [amount, setAmount] = useState('');
  const [currency, setCurrency] = useState<'USD' | 'ZiG'>(primaryCurrency || 'USD');
  const [type, setType] = useState<'income' | 'expense'>('expense');
  const [paymentMethod, setPaymentMethod] = useState<'cash' | 'card'>('cash');
  const [rate, setRate] = useState('');
  const [note, setNote] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<number | null>(null);

  const handleSave = () => {
    const trimmedAmount = amount.trim();
    const parsedAmount = parseFloat(trimmedAmount.replace(/,/g, ''));

    if (!trimmedAmount || isNaN(parsedAmount) || parsedAmount <= 0) {
      Alert.alert('Amount required', 'Please enter a valid amount greater than 0.');
      return;
    }

    let categoryId = selectedCategory;
    if (categoryId == null) {
      const fallbackCategory = categories.find(c => c.type === type);
      categoryId = fallbackCategory ? fallbackCategory.id : null;
    }

    const amountInCents = Math.round(parsedAmount * 100);
    const effectiveRate =
      currency === 'ZiG'
        ? (parseFloat(rate) > 0 ? parseFloat(rate) : currentExchangeRate)
        : currentExchangeRate;

    addTransaction({
      amount: amountInCents,
      currency,
      type,
      rate: effectiveRate,
      category_id: categoryId,
      note: note.trim(),
      payment_method: paymentMethod,
      timestamp: Date.now(),
    });

    setAmount('');
    setRate('');
    setNote('');
    setSelectedCategory(null);

    Alert.alert('Saved', 'Your transaction has been added.');
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          <Text style={styles.screenTitle}>Budget & Utilities</Text>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Add Transaction</Text>
          <View style={styles.card}>
            <TextInput
              style={styles.amountInput}
              placeholder="$0.00"
              placeholderTextColor={Colors.accent.blue}
              keyboardType="numeric"
              value={amount}
              onChangeText={setAmount}
            />

            <View style={styles.row}>
              <View style={styles.pillGroup}>
                <Text style={styles.pillLabel}>Currency</Text>
                <View style={styles.pills}>
                  <TouchableOpacity
                    style={[
                      styles.pill,
                      currency === 'USD' && styles.pillActive,
                    ]}
                    onPress={() => setCurrency('USD')}
                  >
                    <Text
                      style={[
                        styles.pillText,
                        currency === 'USD' && styles.pillTextActive,
                      ]}
                    >
                      USD
                    </Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={[
                      styles.pill,
                      currency === 'ZiG' && styles.pillActive,
                    ]}
                    onPress={() => setCurrency('ZiG')}
                  >
                    <Text
                      style={[
                        styles.pillText,
                        currency === 'ZiG' && styles.pillTextActive,
                      ]}
                    >
                      ZiG
                    </Text>
                  </TouchableOpacity>
                </View>
              </View>

              <View style={styles.pillGroup}>
                <Text style={styles.pillLabel}>Type</Text>
                <View style={styles.pills}>
                  <TouchableOpacity
                    style={[
                      styles.pill,
                      type === 'expense' && styles.pillActive,
                    ]}
                    onPress={() => setType('expense')}
                  >
                    <Text
                      style={[
                        styles.pillText,
                        type === 'expense' && styles.pillTextActive,
                      ]}
                    >
                      Expense
                    </Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={[
                      styles.pill,
                      type === 'income' && styles.pillActive,
                    ]}
                    onPress={() => setType('income')}
                  >
                    <Text
                      style={[
                        styles.pillText,
                        type === 'income' && styles.pillTextActive,
                      ]}
                    >
                      Income
                    </Text>
                  </TouchableOpacity>
                </View>
              </View>
            </View>

            <View style={styles.pillGroup}>
              <Text style={styles.pillLabel}>Payment method</Text>
              <View style={styles.pills}>
                <TouchableOpacity
                  style={[
                    styles.pill,
                    paymentMethod === 'cash' && styles.pillActive,
                  ]}
                  onPress={() => setPaymentMethod('cash')}
                >
                  <Text
                    style={[
                      styles.pillText,
                      paymentMethod === 'cash' && styles.pillTextActive,
                    ]}
                  >
                    Cash
                  </Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[
                    styles.pill,
                    paymentMethod === 'card' && styles.pillActive,
                  ]}
                  onPress={() => setPaymentMethod('card')}
                >
                  <Text
                    style={[
                      styles.pillText,
                      paymentMethod === 'card' && styles.pillTextActive,
                    ]}
                  >
                    Card
                  </Text>
                </TouchableOpacity>
              </View>
            </View>

            {currency === 'ZiG' && (
              <TextInput
                style={styles.rateInput}
                placeholder={`Market rate (default: ${currentExchangeRate})`}
                placeholderTextColor={Colors.accent.blue}
                keyboardType="numeric"
                value={rate}
                onChangeText={setRate}
              />
            )}

            <TextInput
              style={styles.noteInput}
              placeholder="Add a note (optional)"
              placeholderTextColor="#9CA3AF"
              value={note}
              onChangeText={setNote}
            />

            <Text style={styles.pillLabel}>Category</Text>
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              style={styles.categoryScroller}
            >
              {categories
                .filter(c => c.type === type)
                .map(category => {
                  const isActive = selectedCategory === category.id;
                  return (
                    <TouchableOpacity
                      key={category.id}
                      style={[
                        styles.categoryChip,
                        isActive && styles.activeCategory,
                      ]}
                      onPress={() => setSelectedCategory(category.id)}
                    >
                      <MaterialIcons
                        name={category.icon_name as any}
                        size={22}
                        color={isActive ? '#FFFFFF' : Colors.accent.blue}
                      />
                      <Text
                        style={[
                          styles.categoryText,
                          isActive && styles.activeCategoryText,
                        ]}
                      >
                        {category.name}
                      </Text>
                    </TouchableOpacity>
                  );
                })}
            </ScrollView>

            <TouchableOpacity
              style={styles.saveButton}
              onPress={handleSave}
            >
              <Text style={styles.saveButtonText}>Save Transaction</Text>
            </TouchableOpacity>
          </View>
        </View>

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
        </ScrollView>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  container: {
    flex: 1,
  },
  scrollContent: {
    padding: 16,
  },
  screenTitle: {
    fontFamily: Fonts.heading,
    fontSize: 20,
    color: '#F9FAFB',
    marginBottom: 16,
    paddingTop: 12,
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
  amountInput: {
    fontSize: 40,
    fontFamily: Fonts.heading,
    color: '#F9FAFB',
    marginBottom: 12,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 12,
    marginBottom: 12,
  },
  pillGroup: {
    flex: 1,
  },
  pillLabel: {
    fontFamily: Fonts.body,
    fontSize: 12,
    color: '#9CA3AF',
    marginBottom: 4,
  },
  pills: {
    flexDirection: 'row',
    gap: 8,
  },
  pill: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 999,
    borderWidth: 1,
    borderColor: Colors.accent.blue,
  },
  pillActive: {
    backgroundColor: Colors.accent.blue,
  },
  pillText: {
    fontFamily: Fonts.body,
    fontSize: 12,
    color: '#E5E7EB',
  },
  pillTextActive: {
    color: '#0B1120',
  },
  rateInput: {
    marginTop: 8,
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderColor: Colors.accent.blue,
    color: '#F9FAFB',
    fontFamily: Fonts.body,
    fontSize: 14,
  },
  noteInput: {
    marginTop: 12,
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderColor: '#1F2937',
    color: '#F9FAFB',
    fontFamily: Fonts.body,
    fontSize: 14,
  },
  categoryScroller: {
    marginTop: 8,
    paddingVertical: 4,
  },
  categoryChip: {
    alignItems: 'center',
    marginRight: 12,
  },
  activeCategory: {
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 16,
    backgroundColor: '#1E293B',
  },
  categoryText: {
    marginTop: 4,
    fontFamily: Fonts.body,
    fontSize: 12,
    color: '#E5E7EB',
  },
  activeCategoryText: {
    color: '#FFFFFF',
  },
  saveButton: {
    marginTop: 16,
    paddingVertical: 12,
    borderRadius: 999,
    backgroundColor: Colors.accent.gold,
    alignItems: 'center',
  },
  saveButtonText: {
    fontFamily: Fonts.heading,
    fontSize: 16,
    color: '#0B1120',
  },
});
