import React, { useState } from 'react';
import {
  ScrollView,
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  TextInput,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MaterialIcons } from '@expo/vector-icons';
import DailySpendHeatmap from '@/components/charts/DailySpendHeatmap';
import MonthlySpendChart from '@/components/charts/MonthlySpendChart';
import CategoryBreakdownChart from '@/components/charts/CategoryBreakdownChart';
import { Colors, Fonts } from '@/constants/theme';
import { useTransactionStore } from '@/store/useTransactionStore';
import { useCategoryStore } from '@/store/useCategoryStore';
import { TransactionRow } from '@/api/db';

export default function InsightsScreen() {
  const { transactions, updateTransaction, deleteTransaction } = useTransactionStore();
  const { categories } = useCategoryStore();
  const [selectedTx, setSelectedTx] = useState<TransactionRow | null>(null);
  const [editing, setEditing] = useState(false);
  const [editNote, setEditNote] = useState('');
  const [editAmount, setEditAmount] = useState('');

  const getCategory = (categoryId: number | null) => {
    if (categoryId == null) return null;
    return categories.find(c => c.id === categoryId) ?? null;
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView style={styles.container} contentContainerStyle={styles.content}>
        <Text style={styles.screenTitle}>Insights</Text>
        <CategoryBreakdownChart />
        <DailySpendHeatmap />
        <MonthlySpendChart />

        <View style={styles.transactionsSection}>
          <Text style={styles.sectionTitle}>Transactions</Text>
          {transactions.length === 0 ? (
            <View style={styles.emptyStateBody}>
              <Text style={styles.emptyStateText}>
                No transactions yet. Add some activity on Home to see details here.
              </Text>
            </View>
          ) : (
            transactions.map(tx => {
              const category = getCategory(tx.category_id ?? null);
              const name = category?.name ?? 'Uncategorized';
              const iconName = (category?.icon_name as any) || 'category';
              const amountText = `${tx.type === 'income' ? '+' : '-'}${(
                tx.amount / 100
              ).toFixed(2)} ${tx.currency}`;

              return (
                <TouchableOpacity
                  key={tx.id}
                  style={styles.row}
                  onPress={() => setSelectedTx(tx)}
                >
                  <View style={styles.rowLeft}>
                    <View style={styles.iconPill}>
                      <MaterialIcons
                        name={iconName}
                        size={20}
                        color={Colors.accent.gold}
                      />
                    </View>
                    <View style={styles.textContainer}>
                      <Text style={styles.primaryText} numberOfLines={1}>
                        {tx.note || name}
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
                        color:
                          tx.currency === 'USD'
                            ? Colors.accent.blue
                            : Colors.accent.gold,
                      },
                    ]}
                  >
                    {amountText}
                  </Text>
                </TouchableOpacity>
              );
            })
          )}
        </View>
      </ScrollView>

      {selectedTx && (
        <View style={styles.detailOverlay}>
          <View style={styles.detailCard}>
            <Text style={styles.detailTitle}>Transaction Details</Text>

            <Text style={styles.detailLabel}>Amount</Text>
            {editing ? (
              <TextInput
                style={styles.editInput}
                value={editAmount}
                onChangeText={setEditAmount}
                keyboardType="numeric"
                placeholderTextColor={Colors.accent.blue}
              />
            ) : (
              <Text style={styles.detailValue}>
                {(selectedTx.amount / 100).toFixed(2)} {selectedTx.currency}
              </Text>
            )}

            <Text style={styles.detailLabel}>Type</Text>
            <Text style={styles.detailValue}>{selectedTx.type}</Text>

            <Text style={styles.detailLabel}>Category</Text>
            <Text style={styles.detailValue}>
              {getCategory(selectedTx.category_id ?? null)?.name ?? 'Uncategorized'}
            </Text>

            <Text style={styles.detailLabel}>Note</Text>
            {editing ? (
              <TextInput
                style={styles.editInput}
                value={editNote}
                onChangeText={setEditNote}
                placeholder="Note"
                placeholderTextColor={Colors.accent.blue}
              />
            ) : (
              <Text style={styles.detailValue}>{selectedTx.note || 'N/A'}</Text>
            )}

            <Text style={styles.detailLabel}>Payment method</Text>
            <Text style={styles.detailValue}>
              {selectedTx.payment_method || 'N/A'}
            </Text>

            <Text style={styles.detailLabel}>Rate</Text>
            <Text style={styles.detailValue}>{selectedTx.rate ?? 'N/A'}</Text>

            <Text style={styles.detailLabel}>Date</Text>
            <Text style={styles.detailValue}>
              {new Date(selectedTx.timestamp).toLocaleString()}
            </Text>

            <View style={styles.detailActions}>
              {editing ? (
                <TouchableOpacity
                  style={styles.saveButton}
                  onPress={() => {
                    const parsed = parseFloat(editAmount);
                    if (isNaN(parsed) || parsed <= 0) {
                      Alert.alert('Invalid amount', 'Enter a valid positive number.');
                      return;
                    }
                    updateTransaction({
                      ...selectedTx,
                      amount: Math.round(parsed * 100),
                      note: editNote,
                    });
                    setEditing(false);
                    setSelectedTx(null);
                  }}
                >
                  <Text style={styles.closeButtonText}>Save</Text>
                </TouchableOpacity>
              ) : (
                <TouchableOpacity
                  style={styles.editButton}
                  onPress={() => {
                    setEditAmount((selectedTx.amount / 100).toFixed(2));
                    setEditNote(selectedTx.note ?? '');
                    setEditing(true);
                  }}
                >
                  <Text style={styles.closeButtonText}>Edit</Text>
                </TouchableOpacity>
              )}

              <TouchableOpacity
                style={styles.deleteButton}
                onPress={() => {
                  Alert.alert('Delete', 'Are you sure you want to delete this transaction?', [
                    { text: 'Cancel', style: 'cancel' },
                    {
                      text: 'Delete',
                      style: 'destructive',
                      onPress: () => {
                        deleteTransaction(selectedTx.id);
                        setSelectedTx(null);
                        setEditing(false);
                      },
                    },
                  ]);
                }}
              >
                <Text style={styles.deleteButtonText}>Delete</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.closeButton}
                onPress={() => { setSelectedTx(null); setEditing(false); }}
              >
                <Text style={styles.closeButtonText}>Close</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      )}
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
    backgroundColor: Colors.background,
  },
  content: {
    padding: 16,
    paddingBottom: 24,
  },
  screenTitle: {
    fontFamily: Fonts.heading,
    fontSize: 20,
    color: '#F9FAFB',
    marginBottom: 16,
    paddingTop: 12,
  },
  transactionsSection: {
    marginTop: 24,
  },
  sectionTitle: {
    fontFamily: Fonts.heading,
    fontSize: 18,
    color: '#F9FAFB',
    marginBottom: 8,
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
    marginBottom: 8,
  },
  rowLeft: {
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
  detailOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0,0,0,0.6)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  detailCard: {
    width: '100%',
    borderRadius: 16,
    backgroundColor: '#020617',
    padding: 20,
  },
  detailTitle: {
    fontFamily: Fonts.heading,
    fontSize: 18,
    color: '#F9FAFB',
    marginBottom: 12,
  },
  detailLabel: {
    fontFamily: Fonts.body,
    fontSize: 12,
    color: '#9CA3AF',
    marginTop: 8,
  },
  detailValue: {
    fontFamily: Fonts.body,
    fontSize: 14,
    color: '#E5E7EB',
    marginTop: 2,
  },
  detailActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 16,
    gap: 8,
  },
  editButton: {
    flex: 1,
    paddingVertical: 10,
    borderRadius: 999,
    backgroundColor: Colors.accent.blue,
    alignItems: 'center',
  },
  saveButton: {
    flex: 1,
    paddingVertical: 10,
    borderRadius: 999,
    backgroundColor: Colors.accent.gold,
    alignItems: 'center',
  },
  deleteButton: {
    flex: 1,
    paddingVertical: 10,
    borderRadius: 999,
    backgroundColor: '#DC2626',
    alignItems: 'center',
  },
  deleteButtonText: {
    fontFamily: Fonts.heading,
    fontSize: 14,
    color: '#FFFFFF',
  },
  closeButton: {
    flex: 1,
    paddingVertical: 10,
    borderRadius: 999,
    backgroundColor: Colors.accent.gold,
    alignItems: 'center',
  },
  closeButtonText: {
    fontFamily: Fonts.heading,
    fontSize: 14,
    color: '#0B1120',
  },
  editInput: {
    backgroundColor: '#0F172A',
    color: '#F9FAFB',
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: Colors.accent.blue,
    fontFamily: Fonts.body,
    fontSize: 14,
    marginTop: 4,
  },
});
