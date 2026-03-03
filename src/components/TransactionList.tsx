import React from 'react';
import { View, Text, FlatList, StyleSheet } from 'react-native';
import { TransactionRow } from '@/api/db';
import { Colors, Fonts } from '@/constants/theme';
import { useCategoryStore } from '@/store/useCategoryStore';

type TransactionListProps = {
  transactions: TransactionRow[];
};

export default function TransactionList({ transactions }: TransactionListProps) {
  const { categories } = useCategoryStore();

  const getCategoryName = (categoryId: number) => {
    const category = categories.find(c => c.id === categoryId);
    return category ? category.name : 'Uncategorized';
  };

  const renderItem = ({ item }: { item: TransactionRow }) => (
    <View style={styles.transactionItem}>
      <View>
        <Text style={styles.transactionNote}>{item.note || getCategoryName(item.category_id)}</Text>
        <Text style={styles.transactionCategory}>{getCategoryName(item.category_id)}</Text>
      </View>
      <Text style={[styles.transactionAmount, { color: item.type === 'income' ? Colors.accent.green : 'white' }]}>
        {item.type === 'income' ? '+' : '-'}${(item.amount / 100).toFixed(2)} {item.currency}
      </Text>
    </View>
  );

  return (
    <FlatList
      data={transactions}
      renderItem={renderItem}
      keyExtractor={(item) => item.id.toString()}
    />
  );
}

const styles = StyleSheet.create({
  transactionItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#333',
  },
  transactionNote: {
    fontFamily: Fonts.body,
    fontSize: 16,
    color: 'white',
  },
  transactionCategory: {
    fontFamily: Fonts.body,
    fontSize: 12,
    color: Colors.secondary,
  },
  transactionAmount: {
    fontFamily: Fonts.heading,
    fontSize: 16,
  },
});
