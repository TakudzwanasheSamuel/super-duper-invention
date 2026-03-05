import React, { useState } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, TextInput, Alert } from 'react-native';
import { useGroceryStore } from '@/store/useGroceryStore';
import { CheckBox } from 'react-native-elements';
import { Colors, Fonts } from '@/constants/theme';
import { GroceryItemRow } from '@/api/db';

export default function GroceryList() {
  const { groceryItems, fetchGroceryItems, updateGroceryItem, resetList, finalizeShopping } = useGroceryStore();
  const [editingItem, setEditingItem] = useState<GroceryItemRow | null>(null);
  const [newName, setNewName] = useState('');
  const [newPrice, setNewPrice] = useState('');

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

  return (
    <View style={styles.container}>
      <FlatList
        data={groceryItems}
        renderItem={renderItem}
        keyExtractor={(item) => item.id.toString()}
        ListHeaderComponent={() => <Text style={styles.header}>Standard Monthly List</Text>}
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
