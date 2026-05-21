import React from 'react';
import { View, Text, FlatList, StyleSheet } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { TransactionRow } from '@/api/db';
import { Colors, Fonts } from '@/constants/theme';
import { useCategoryStore } from '@/store/useCategoryStore';
import { formatCurrency } from '@/utils/finance';

type TransactionListProps = {
  transactions: TransactionRow[];
  // FlatList's ListFooterComponent only accepts elements/components, not
  // arbitrary ReactNode (no raw strings/numbers). Restrict accordingly.
  footer?: React.ReactElement | null;
};

export default function TransactionList({ transactions, footer }: TransactionListProps) {
  const { categories } = useCategoryStore();

  const getCategory = (categoryId: number | null) => {
    if (categoryId == null) return null;
    return categories.find(c => c.id === categoryId) ?? null;
  };

  const renderItem = ({ item }: { item: TransactionRow }) => {
    const category = getCategory(item.category_id);
    const name = category?.name ?? 'Uncategorized';
    const iconName = (category?.icon_name as any) || 'category';

    const signedAmount = (item.amount / 100) * (item.type === 'income' ? 1 : -1);
    const amountText = formatCurrency(signedAmount, item.currency, { showSign: true });

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
      ListEmptyComponent={
        <View style={styles.emptyStateContainer}>
          <View style={styles.emptyStateBody}>
            <Text style={styles.emptyStateText}>
              No recent transactions yet. Use Quick Add below to start.
            </Text>
          </View>
        </View>
      }
      ListFooterComponent={footer ?? null}
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
    fontWeight: '700',
    marginBottom: 8,
  },
  emptyStateContainer: {
    paddingTop: 8,
    paddingBottom: 16,
    paddingHorizontal: 16,
  },
  emptyStateBody: {
    marginTop: 8,
    paddingVertical: 24,
    paddingHorizontal: 16,
    borderRadius: 12,
    backgroundColor: Colors.secondary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyStateText: {
    fontFamily: Fonts.body,
    fontSize: 14,
    color: '#9CA3AF',
    textAlign: 'center',
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
