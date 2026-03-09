import React, { useState } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, TextInput, Alert } from 'react-native';
import { useGroceryStore } from '@/store/useGroceryStore';
import { CheckBox } from 'react-native-elements';
import { Colors, Fonts } from '@/constants/theme';
import { GroceryItemRow } from '@/api/db';

export default function GroceryList() {
  const { groceryItems, fetchGroceryItems, addGroceryItem, updateGroceryItem, resetList, finalizeShopping } = useGroceryStore();
  const [editingItem, setEditingItem] = useState<GroceryItemRow | null>(null);
  const [newName, setNewName] = useState('');
  const [newPrice, setNewPrice] = useState('');
  const [addName, setAddName] = useState('');
  const [addPrice, setAddPrice] = useState('');

  React.useEffect(() => {
    fetchGroceryItems();
  }, []);

  const handlePriceUpdate = (item: GroceryItemRow) => {
    Alert.alert(
      'Update Template',
      'Update template with this new price?',
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'OK', onPress: () => {
          const updatedItem = { ...item, default_price: Math.round(parseFloat(newPrice) * 100) };
          updateGroceryItem(updatedItem);
          setEditingItem(null);
        } },
      ]
    );
  };

  const renderItem = ({ item }: { item: GroceryItemRow }) => (
    <View style={styles.itemContainer}>
      <CheckBox
        checked={item.is_checked}
        onPress={() => updateGroceryItem({ ...item, is_checked: !item.is_checked })}
      />
      <View style={styles.itemDetails}>
        <TextInput
          style={styles.itemName}
          defaultValue={item.name}
          onBlur={() => updateGroceryItem({ ...item, name: newName || item.name })}
          onChangeText={setNewName}
        />
        <TextInput
          style={styles.itemPrice}
          defaultValue={(item.default_price / 100).toFixed(2)}
          keyboardType="numeric"
          onBlur={() => handlePriceUpdate(item)}
          onChangeText={setNewPrice}
        />
      </View>
    </View>
  );

  const handleAddItem = () => {
    const trimmed = addName.trim();
    if (!trimmed) {
      Alert.alert('Name required', 'Enter a grocery item name.');
      return;
    }
    const price = parseFloat(addPrice) || 0;
    addGroceryItem({ name: trimmed, default_price: Math.round(price * 100), currency: 'USD' });
    setAddName('');
    setAddPrice('');
  };

  return (
    <View style={styles.container}>
      <Text style={styles.header}>Standard Monthly List</Text>

      <View style={styles.addRow}>
        <TextInput
          style={styles.addInput}
          placeholder="Item name"
          placeholderTextColor={Colors.accent.blue}
          value={addName}
          onChangeText={setAddName}
        />
        <TextInput
          style={[styles.addInput, { width: 80 }]}
          placeholder="Price"
          placeholderTextColor={Colors.accent.blue}
          keyboardType="numeric"
          value={addPrice}
          onChangeText={setAddPrice}
        />
        <TouchableOpacity style={styles.addItemButton} onPress={handleAddItem}>
          <Text style={styles.addItemButtonText}>+</Text>
        </TouchableOpacity>
      </View>

      <FlatList
        data={groceryItems}
        renderItem={renderItem}
        keyExtractor={(item) => item.id.toString()}
        scrollEnabled={false}
      />
      <View style={styles.buttonContainer}>
        <TouchableOpacity style={styles.button} onPress={resetList}>
          <Text style={styles.buttonText}>Reset List</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.button} onPress={finalizeShopping}>
          <Text style={styles.buttonText}>Finalize Shopping</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    fontFamily: Fonts.heading,
    fontSize: 24,
    color: 'white',
    textAlign: 'center',
    marginVertical: 20,
  },
  itemContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 10,
    borderBottomWidth: 1,
    borderBottomColor: Colors.secondary,
  },
  itemDetails: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  itemName: {
    color: 'white',
    fontFamily: Fonts.body,
    fontSize: 16,
  },
  itemPrice: {
    color: 'white',
    fontFamily: Fonts.body,
    fontSize: 16,
  },
  addRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 12,
  },
  addInput: {
    flex: 1,
    backgroundColor: '#0A0A0A',
    color: '#F9FAFB',
    paddingVertical: 8,
    paddingHorizontal: 10,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: Colors.accent.blue,
    fontFamily: Fonts.body,
    fontSize: 14,
  },
  addItemButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: Colors.accent.gold,
    alignItems: 'center',
    justifyContent: 'center',
  },
  addItemButtonText: {
    fontSize: 20,
    color: '#0B1120',
    fontWeight: '700',
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginVertical: 20,
  },
  button: {
    backgroundColor: Colors.secondary,
    padding: 15,
    borderRadius: 10,
  },
  buttonText: {
    color: 'white',
    fontFamily: Fonts.heading,
    fontSize: 16,
  },
});
