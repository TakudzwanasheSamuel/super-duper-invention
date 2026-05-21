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
import { MaterialIcons } from '@expo/vector-icons';
import { Colors, Fonts } from '@/constants/theme';
import { useCategoryStore } from '@/store/useCategoryStore';
import { CategoryRow } from '@/api/db';
import {
  CategoryIconOptions,
  DEFAULT_CATEGORY_ICON,
  getDefaultIconForCategory,
} from '@/constants/categories';

type EditDraft = {
  name: string;
  type: 'income' | 'expense';
  icon_name: string;
};

export default function CategoryManager() {
  const { categories, addCategory, updateCategory, deleteCategory } = useCategoryStore();
  const [newName, setNewName] = useState('');
  const [newType, setNewType] = useState<'income' | 'expense'>('expense');
  const [newIcon, setNewIcon] = useState<string>(DEFAULT_CATEGORY_ICON);
  const [editing, setEditing] = useState<Record<number, EditDraft>>({});

  const handleAdd = () => {
    const trimmed = newName.trim();
    if (!trimmed) {
      Alert.alert('Name required', 'Please enter a category name.');
      return;
    }
    const icon =
      newIcon && newIcon !== DEFAULT_CATEGORY_ICON
        ? newIcon
        : getDefaultIconForCategory(trimmed);
    addCategory(trimmed, newType, icon);
    setNewName('');
    setNewIcon(DEFAULT_CATEGORY_ICON);
  };

  const startEditing = (cat: CategoryRow) => {
    setEditing(prev => ({
      ...prev,
      [cat.id]: {
        name: cat.name,
        type: cat.type,
        icon_name: cat.icon_name || getDefaultIconForCategory(cat.name),
      },
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
    updateCategory({
      ...cat,
      name: trimmed,
      type: draft.type,
      icon_name: draft.icon_name || getDefaultIconForCategory(trimmed),
    });
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

  const renderIconPicker = (
    selected: string,
    onSelect: (icon: string) => void,
  ) => (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      contentContainerStyle={styles.iconRow}
    >
      {CategoryIconOptions.map(opt => {
        const active = selected === opt.name;
        return (
          <TouchableOpacity
            key={opt.name}
            style={[styles.iconPill, active && styles.iconPillActive]}
            onPress={() => onSelect(opt.name)}
          >
            <MaterialIcons
              name={opt.name as any}
              size={20}
              color={active ? '#0B1120' : Colors.accent.gold}
            />
            <Text
              style={[
                styles.iconPillText,
                active && styles.iconPillTextActive,
              ]}
            >
              {opt.label}
            </Text>
          </TouchableOpacity>
        );
      })}
    </ScrollView>
  );

  const renderRow = (cat: CategoryRow) => {
    const draft = editing[cat.id];
    const name = draft ? draft.name : cat.name;
    const type = draft ? draft.type : cat.type;
    const iconName =
      draft?.icon_name || cat.icon_name || getDefaultIconForCategory(cat.name);

    return (
      <View key={cat.id} style={styles.row}>
        <View style={styles.rowHeader}>
          <View style={styles.categoryIconBadge}>
            <MaterialIcons
              name={(iconName as any) || DEFAULT_CATEGORY_ICON}
              size={20}
              color={Colors.accent.gold}
            />
          </View>
          <TextInput
            style={styles.nameInput}
            value={name}
            onChangeText={(text) => {
              if (draft) {
                setEditing(prev => ({
                  ...prev,
                  [cat.id]: { ...draft, name: text },
                }));
              } else {
                startEditing({ ...cat, name: text });
              }
            }}
            placeholder="Category name"
            placeholderTextColor="#6B7280"
          />
        </View>

        <View style={styles.typePills}>
          <TouchableOpacity
            style={[styles.typePill, type === 'expense' && styles.typePillActive]}
            onPress={() => {
              const base: EditDraft = draft ?? {
                name,
                type,
                icon_name: iconName,
              };
              setEditing(prev => ({
                ...prev,
                [cat.id]: { ...base, type: 'expense' },
              }));
            }}
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
            style={[styles.typePill, type === 'income' && styles.typePillActive]}
            onPress={() => {
              const base: EditDraft = draft ?? {
                name,
                type,
                icon_name: iconName,
              };
              setEditing(prev => ({
                ...prev,
                [cat.id]: { ...base, type: 'income' },
              }));
            }}
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

        {renderIconPicker(iconName, icon => {
          const base: EditDraft = draft ?? { name, type, icon_name: iconName };
          setEditing(prev => ({
            ...prev,
            [cat.id]: { ...base, icon_name: icon },
          }));
        })}

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
        Create, rename, choose an icon, and change the type of your categories.
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
            style={[styles.typePill, newType === 'expense' && styles.typePillActive]}
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
            style={[styles.typePill, newType === 'income' && styles.typePillActive]}
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
        {renderIconPicker(newIcon, setNewIcon)}
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
  iconRow: {
    gap: 8,
    paddingVertical: 8,
  },
  iconPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 999,
    borderWidth: 1,
    borderColor: Colors.accent.gold,
    backgroundColor: '#0A0A0A',
  },
  iconPillActive: {
    backgroundColor: Colors.accent.gold,
  },
  iconPillText: {
    fontFamily: Fonts.body,
    fontSize: 12,
    color: '#E5E7EB',
  },
  iconPillTextActive: {
    color: '#0B1120',
    fontFamily: Fonts.heading,
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
    maxHeight: 320,
    marginTop: 4,
  },
  row: {
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#1F2937',
  },
  rowHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginBottom: 6,
  },
  categoryIconBadge: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#0F172A',
    alignItems: 'center',
    justifyContent: 'center',
  },
  nameInput: {
    flex: 1,
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
    marginTop: 6,
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
