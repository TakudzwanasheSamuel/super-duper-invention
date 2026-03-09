import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  Alert,
  ScrollView,
} from 'react-native';
import { Colors, Fonts } from '@/constants/theme';
import { useCategoryStore } from '@/store/useCategoryStore';
import { CategoryRow } from '@/api/db';

export default function CategoryManager() {
  const { categories, addCategory, updateCategory, deleteCategory } = useCategoryStore();
  const [newName, setNewName] = useState('');
  const [newType, setNewType] = useState<'income' | 'expense'>('expense');
  const [editing, setEditing] = useState<Record<number, { name: string; type: 'income' | 'expense' }>>({});

  const handleAdd = () => {
    const trimmed = newName.trim();
    if (!trimmed) {
      Alert.alert('Name required', 'Please enter a category name.');
      return;
    }
    addCategory(trimmed, newType);
    setNewName('');
  };

  const startEditing = (cat: CategoryRow) => {
    setEditing(prev => ({
      ...prev,
      [cat.id]: { name: cat.name, type: cat.type },
    }));
  };

  const handleSaveEdit = (cat: CategoryRow) => {
    const draft = editing[cat.id];
    if (!draft) return;
    const trimmed = draft.name.trim();
    if (!trimmed) {
      Alert.alert('Name required', 'Please enter a category name.');
      return;
    }
    updateCategory({ ...cat, name: trimmed, type: draft.type });
    setEditing(prev => {
      const copy = { ...prev };
      delete copy[cat.id];
      return copy;
    });
  };

  const handleDelete = (cat: CategoryRow) => {
    Alert.alert(
      'Delete category',
      `Are you sure you want to delete "${cat.name}"?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: () => deleteCategory(cat.id),
        },
      ],
    );
  };

  const renderRow = (cat: CategoryRow) => {
    const draft = editing[cat.id];
    const name = draft ? draft.name : cat.name;
    const type = draft ? draft.type : cat.type;

    return (
      <View key={cat.id} style={styles.row}>
        <View style={styles.rowMain}>
          <TextInput
            style={styles.nameInput}
            value={name}
            onChangeText={(text) =>
              setEditing(prev => ({
                ...prev,
                [cat.id]: { name: text, type },
              }))
            }
            placeholder="Category name"
            placeholderTextColor="#6B7280"
          />
          <View style={styles.typePills}>
            <TouchableOpacity
              style={[
                styles.typePill,
                type === 'expense' && styles.typePillActive,
              ]}
              onPress={() =>
                setEditing(prev => ({
                  ...prev,
                  [cat.id]: { name, type: 'expense' },
                }))
              }
            >
              <Text
                style={[
                  styles.typePillText,
                  type === 'expense' && styles.typePillTextActive,
                ]}
              >
                Expense
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[
                styles.typePill,
                type === 'income' && styles.typePillActive,
              ]}
              onPress={() =>
                setEditing(prev => ({
                  ...prev,
                  [cat.id]: { name, type: 'income' },
                }))
              }
            >
              <Text
                style={[
                  styles.typePillText,
                  type === 'income' && styles.typePillTextActive,
                ]}
              >
                Income
              </Text>
            </TouchableOpacity>
          </View>
        </View>
        <View style={styles.rowActions}>
          <TouchableOpacity
            style={styles.smallButton}
            onPress={() => handleSaveEdit(cat)}
          >
            <Text style={styles.smallButtonText}>Save</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.smallButton, styles.deleteButton]}
            onPress={() => handleDelete(cat)}
          >
            <Text style={styles.smallButtonText}>Delete</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  };

  return (
    <View>
      <Text style={styles.sectionTitle}>Categories</Text>
      <Text style={styles.helperText}>
        Create, rename, and change the type of your categories.
      </Text>

      <View style={styles.addRow}>
        <TextInput
          style={styles.input}
          placeholder="New category name"
          placeholderTextColor="#6B7280"
          value={newName}
          onChangeText={setNewName}
        />
        <View style={styles.typePills}>
          <TouchableOpacity
            style={[
              styles.typePill,
              newType === 'expense' && styles.typePillActive,
            ]}
            onPress={() => setNewType('expense')}
          >
            <Text
              style={[
                styles.typePillText,
                newType === 'expense' && styles.typePillTextActive,
              ]}
            >
              Expense
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[
              styles.typePill,
              newType === 'income' && styles.typePillActive,
            ]}
            onPress={() => setNewType('income')}
          >
            <Text
              style={[
                styles.typePillText,
                newType === 'income' && styles.typePillTextActive,
              ]}
            >
              Income
            </Text>
          </TouchableOpacity>
        </View>
      </View>
      <TouchableOpacity style={styles.addButton} onPress={handleAdd}>
        <Text style={styles.addButtonText}>Add Category</Text>
      </TouchableOpacity>

      <ScrollView
        style={styles.list}
        nestedScrollEnabled
        contentContainerStyle={{ paddingVertical: 8 }}
      >
        {categories.map(renderRow)}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  sectionTitle: {
    fontFamily: Fonts.heading,
    fontSize: 16,
    color: '#F9FAFB',
    marginBottom: 4,
  },
  helperText: {
    fontFamily: Fonts.body,
    fontSize: 12,
    color: '#9CA3AF',
    marginBottom: 12,
  },
  addRow: {
    marginBottom: 8,
  },
  input: {
    backgroundColor: '#0A0A0A',
    color: '#F9FAFB',
    paddingVertical: 8,
    paddingHorizontal: 10,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: Colors.accent.blue,
    fontFamily: Fonts.body,
    fontSize: 14,
  },
  typePills: {
    flexDirection: 'row',
    gap: 8,
    marginTop: 8,
  },
  typePill: {
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 999,
    borderWidth: 1,
    borderColor: Colors.accent.blue,
  },
  typePillActive: {
    backgroundColor: Colors.accent.blue,
  },
  typePillText: {
    fontFamily: Fonts.body,
    fontSize: 12,
    color: '#E5E7EB',
  },
  typePillTextActive: {
    color: '#0B1120',
  },
  addButton: {
    marginTop: 8,
    marginBottom: 8,
    paddingVertical: 10,
    borderRadius: 999,
    backgroundColor: Colors.accent.gold,
    alignItems: 'center',
  },
  addButtonText: {
    fontFamily: Fonts.heading,
    fontSize: 14,
    color: '#0B1120',
  },
  list: {
    maxHeight: 260,
    marginTop: 4,
  },
  row: {
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#1F2937',
  },
  rowMain: {
    marginBottom: 6,
  },
  nameInput: {
    backgroundColor: '#020617',
    color: '#F9FAFB',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 8,
    fontFamily: Fonts.body,
    fontSize: 14,
    borderWidth: 1,
    borderColor: '#1F2937',
  },
  rowActions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: 8,
  },
  smallButton: {
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 999,
    backgroundColor: '#111827',
    borderWidth: 1,
    borderColor: '#4B5563',
  },
  deleteButton: {
    borderColor: '#DC2626',
  },
  smallButtonText: {
    fontFamily: Fonts.body,
    fontSize: 12,
    color: '#E5E7EB',
  },
});

