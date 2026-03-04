import React from 'react';
import { View, Text, FlatList, StyleSheet } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { TransactionRow } from '@/api/db';
import { Colors, Fonts } from '@/constants/theme';
import { useCategoryStore } from '@/store/useCategoryStore';

type TransactionListProps = {
  transactions: TransactionRow[];
};

export default function TransactionList({ transactions }: TransactionListProps) {
  const { categories } = useCategoryStore();

  const getCategory = (categoryId: number) => {
    return categories.find(c => c.id === categoryId) ?? null;
  };

  const renderItem = ({ item }: { item: TransactionRow }) => {
    const category = getCategory(item.category_id);
    const name = category?.name ?? 'Uncategorized';
    const iconName = (category?.icon_name as any) || 'category';

    const amountText = `${item.type === 'income' ? '+' : '-'}${(item.amount / 100).toFixed(2)} ${
      item.currency
    }`;

    return (
      <View style={styles.row}>
        <View style={styles.left}>
          <View style={styles.iconPill}>
            <MaterialIcons name={iconName} size={20} color={Colors.accent.gold} />
          </View>
          <View style={styles.textContainer}>
            <Text style={styles.primaryText} numberOfLines={1}>
              {item.note || name}
            </Text>
            <Text style={styles.secondaryText} numberOfLines={1}>
              {name}
            </Text>
          </View>
        </View>
        <Text
          style={[
            styles.amountText,
            {
              color: item.currency === 'USD' ? Colors.accent.blue : Colors.accent.gold,
            },
          ]}
        >
          {amountText}
        </Text>
      </View>
    );
  };

  return (
    <FlatList
      data={transactions}
      renderItem={renderItem}
      keyExtractor={(item) => item.id.toString()}
      ItemSeparatorComponent={() => <View style={{ height: 8 }} />}
      ListHeaderComponent={
        <Text style={styles.sectionTitle}>Recent Transactions</Text>
      }
      contentContainerStyle={styles.listContent}
    />
  );
}

const styles = StyleSheet.create({
  listContent: {
    paddingTop: 8,
    paddingBottom: 16,
  },
  sectionTitle: {
    fontFamily: Fonts.heading,
    fontSize: 18,
    color: '#F9FAFB',
    marginBottom: 8,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: Colors.secondary,
    borderRadius: 12,
  },
  left: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    marginRight: 12,
  },
  iconPill: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#0F172A',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  textContainer: {
    flex: 1,
  },
  primaryText: {
    fontFamily: Fonts.body,
    fontSize: 14,
    color: '#F9FAFB',
  },
  secondaryText: {
    fontFamily: Fonts.body,
    fontSize: 12,
    color: '#9CA3AF',
    marginTop: 2,
  },
  amountText: {
    fontFamily: 'JetBrainsMono_400Regular',
    fontSize: 14,
  },
});
