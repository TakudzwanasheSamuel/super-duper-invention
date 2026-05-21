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
import { formatCurrency } from '@/utils/finance';

type Currency = 'USD' | 'ZiG';
type TxType = 'income' | 'expense';
type PaymentMethod = 'card' | 'cash';

type EditDraft = {
  amount: string;
  note: string;
  currency: Currency;
  type: TxType;
  payment_method: PaymentMethod;
  category_id: number | null;
  timestamp: number;
};

function formatLocalDateTime(ts: number) {
  const d = new Date(ts);
  const pad = (n: number) => String(n).padStart(2, '0');
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())} ${pad(d.getHours())}:${pad(d.getMinutes())}`;
}

function parseLocalDateTime(input: string): number | null {
  const trimmed = input.trim().replace('T', ' ');
  const match = trimmed.match(/^(\d{4})-(\d{2})-(\d{2})[ ](\d{2}):(\d{2})$/);
  if (!match) return null;
  const [, y, mo, d, h, mi] = match;
  const date = new Date(
    Number(y),
    Number(mo) - 1,
    Number(d),
    Number(h),
    Number(mi),
  );
  if (isNaN(date.getTime())) return null;
  return date.getTime();
}

export default function InsightsScreen() {
  const { transactions, updateTransaction, deleteTransaction } = useTransactionStore();
  const { categories } = useCategoryStore();
  const [selectedTx, setSelectedTx] = useState<TransactionRow | null>(null);
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState<EditDraft | null>(null);
  const [dateInput, setDateInput] = useState('');

  const getCategory = (categoryId: number | null) => {
    if (categoryId == null) return null;
    return categories.find(c => c.id === categoryId) ?? null;
  };

  const beginEditing = (tx: TransactionRow) => {
    setDraft({
      amount: (tx.amount / 100).toFixed(2),
      note: tx.note ?? '',
      currency: tx.currency,
      type: tx.type,
      payment_method: tx.payment_method ?? 'cash',
      category_id: tx.category_id ?? null,
      timestamp: tx.timestamp,
    });
    setDateInput(formatLocalDateTime(tx.timestamp));
    setEditing(true);
  };

  const closeOverlay = () => {
    setSelectedTx(null);
    setEditing(false);
    setDraft(null);
    setDateInput('');
  };

  const handleSave = () => {
    if (!selectedTx || !draft) return;

    const parsed = parseFloat(draft.amount);
    if (isNaN(parsed) || parsed <= 0) {
      Alert.alert('Invalid amount', 'Enter a valid positive number.');
      return;
    }

    const parsedTimestamp = parseLocalDateTime(dateInput);
    if (!parsedTimestamp) {
      Alert.alert(
        'Invalid date',
        'Use format YYYY-MM-DD HH:MM (24h), e.g. 2026-05-21 14:30.',
      );
      return;
    }

    updateTransaction({
      ...selectedTx,
      amount: Math.round(parsed * 100),
      note: draft.note,
      currency: draft.currency,
      type: draft.type,
      payment_method: draft.payment_method,
      category_id: draft.category_id ?? (null as any),
      timestamp: parsedTimestamp,
    });

    closeOverlay();
  };

  const filteredCategories = draft
    ? categories.filter(c => c.type === draft.type)
    : categories;

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
              const signed = (tx.amount / 100) * (tx.type === 'income' ? 1 : -1);
              const amountText = formatCurrency(signed, tx.currency, { showSign: true });

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
          <ScrollView style={styles.detailScroll} contentContainerStyle={styles.detailCard}>
            <Text style={styles.detailTitle}>
              {editing ? 'Edit Transaction' : 'Transaction Details'}
            </Text>

            <Text style={styles.detailLabel}>Amount</Text>
            {editing && draft ? (
              <TextInput
                style={styles.editInput}
                value={draft.amount}
                onChangeText={text => setDraft({ ...draft, amount: text })}
                keyboardType="numeric"
                placeholderTextColor={Colors.accent.blue}
              />
            ) : (
              <Text style={styles.detailValue}>
                {formatCurrency(selectedTx.amount / 100, selectedTx.currency)}
              </Text>
            )}

            <Text style={styles.detailLabel}>Currency</Text>
            {editing && draft ? (
              <View style={styles.pillRow}>
                {(['USD', 'ZiG'] as Currency[]).map(c => {
                  const active = draft.currency === c;
                  return (
                    <TouchableOpacity
                      key={c}
                      style={[styles.pill, active && styles.pillActive]}
                      onPress={() => setDraft({ ...draft, currency: c })}
                    >
                      <Text style={[styles.pillText, active && styles.pillTextActive]}>
                        {c}
                      </Text>
                    </TouchableOpacity>
                  );
                })}
              </View>
            ) : (
              <Text style={styles.detailValue}>{selectedTx.currency}</Text>
            )}

            <Text style={styles.detailLabel}>Type</Text>
            {editing && draft ? (
              <View style={styles.pillRow}>
                {(['expense', 'income'] as TxType[]).map(t => {
                  const active = draft.type === t;
                  return (
                    <TouchableOpacity
                      key={t}
                      style={[styles.pill, active && styles.pillActive]}
                      onPress={() =>
                        setDraft({ ...draft, type: t, category_id: null })
                      }
                    >
                      <Text style={[styles.pillText, active && styles.pillTextActive]}>
                        {t}
                      </Text>
                    </TouchableOpacity>
                  );
                })}
              </View>
            ) : (
              <Text style={styles.detailValue}>{selectedTx.type}</Text>
            )}

            <Text style={styles.detailLabel}>Category</Text>
            {editing && draft ? (
              <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={styles.categoryRow}
              >
                <TouchableOpacity
                  style={[
                    styles.pill,
                    draft.category_id === null && styles.pillActive,
                  ]}
                  onPress={() => setDraft({ ...draft, category_id: null })}
                >
                  <Text
                    style={[
                      styles.pillText,
                      draft.category_id === null && styles.pillTextActive,
                    ]}
                  >
                    Uncategorized
                  </Text>
                </TouchableOpacity>
                {filteredCategories.map(c => {
                  const active = draft.category_id === c.id;
                  return (
                    <TouchableOpacity
                      key={c.id}
                      style={[styles.pill, active && styles.pillActive]}
                      onPress={() => setDraft({ ...draft, category_id: c.id })}
                    >
                      <Text style={[styles.pillText, active && styles.pillTextActive]}>
                        {c.name}
                      </Text>
                    </TouchableOpacity>
                  );
                })}
              </ScrollView>
            ) : (
              <Text style={styles.detailValue}>
                {getCategory(selectedTx.category_id ?? null)?.name ?? 'Uncategorized'}
              </Text>
            )}

            <Text style={styles.detailLabel}>Note</Text>
            {editing && draft ? (
              <TextInput
                style={styles.editInput}
                value={draft.note}
                onChangeText={text => setDraft({ ...draft, note: text })}
                placeholder="Note"
                placeholderTextColor={Colors.accent.blue}
              />
            ) : (
              <Text style={styles.detailValue}>{selectedTx.note || 'N/A'}</Text>
            )}

            <Text style={styles.detailLabel}>Payment method</Text>
            {editing && draft ? (
              <View style={styles.pillRow}>
                {(['card', 'cash'] as PaymentMethod[]).map(p => {
                  const active = draft.payment_method === p;
                  return (
                    <TouchableOpacity
                      key={p}
                      style={[styles.pill, active && styles.pillActive]}
                      onPress={() => setDraft({ ...draft, payment_method: p })}
                    >
                      <Text style={[styles.pillText, active && styles.pillTextActive]}>
                        {p}
                      </Text>
                    </TouchableOpacity>
                  );
                })}
              </View>
            ) : (
              <Text style={styles.detailValue}>
                {selectedTx.payment_method || 'N/A'}
              </Text>
            )}

            <Text style={styles.detailLabel}>Rate</Text>
            <Text style={styles.detailValue}>{selectedTx.rate ?? 'N/A'}</Text>

            <Text style={styles.detailLabel}>Date</Text>
            {editing && draft ? (
              <>
                <TextInput
                  style={styles.editInput}
                  value={dateInput}
                  onChangeText={setDateInput}
                  placeholder="YYYY-MM-DD HH:MM"
                  placeholderTextColor={Colors.accent.blue}
                />
                <TouchableOpacity
                  style={styles.useTodayButton}
                  onPress={() => setDateInput(formatLocalDateTime(Date.now()))}
                >
                  <Text style={styles.useTodayText}>Use now</Text>
                </TouchableOpacity>
              </>
            ) : (
              <Text style={styles.detailValue}>
                {new Date(selectedTx.timestamp).toLocaleString()}
              </Text>
            )}

            <View style={styles.detailActions}>
              {editing ? (
                <TouchableOpacity style={styles.saveButton} onPress={handleSave}>
                  <Text style={styles.closeButtonText}>Save</Text>
                </TouchableOpacity>
              ) : (
                <TouchableOpacity
                  style={styles.editButton}
                  onPress={() => beginEditing(selectedTx)}
                >
                  <Text style={styles.closeButtonText}>Edit</Text>
                </TouchableOpacity>
              )}

              <TouchableOpacity
                style={styles.deleteButton}
                onPress={() => {
                  Alert.alert(
                    'Delete',
                    'Are you sure you want to delete this transaction?',
                    [
                      { text: 'Cancel', style: 'cancel' },
                      {
                        text: 'Delete',
                        style: 'destructive',
                        onPress: () => {
                          deleteTransaction(selectedTx.id);
                          closeOverlay();
                        },
                      },
                    ],
                  );
                }}
              >
                <Text style={styles.deleteButtonText}>Delete</Text>
              </TouchableOpacity>

              <TouchableOpacity style={styles.closeButton} onPress={closeOverlay}>
                <Text style={styles.closeButtonText}>Close</Text>
              </TouchableOpacity>
            </View>
          </ScrollView>
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
  detailScroll: {
    width: '100%',
    maxHeight: '90%',
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
  pillRow: {
    flexDirection: 'row',
    gap: 8,
    marginTop: 4,
  },
  pill: {
    paddingVertical: 8,
    paddingHorizontal: 14,
    borderRadius: 999,
    borderWidth: 1,
    borderColor: Colors.accent.blue,
  },
  pillActive: {
    backgroundColor: Colors.accent.blue,
  },
  pillText: {
    fontFamily: Fonts.body,
    color: '#E5E7EB',
    fontSize: 13,
  },
  pillTextActive: {
    color: '#0B1120',
    fontFamily: Fonts.heading,
  },
  categoryRow: {
    flexDirection: 'row',
    gap: 8,
    paddingVertical: 6,
  },
  useTodayButton: {
    alignSelf: 'flex-start',
    marginTop: 6,
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 999,
    borderWidth: 1,
    borderColor: Colors.accent.gold,
  },
  useTodayText: {
    color: Colors.accent.gold,
    fontFamily: Fonts.body,
    fontSize: 12,
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
