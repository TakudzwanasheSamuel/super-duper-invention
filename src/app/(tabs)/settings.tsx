import React, { useState } from 'react';
import {
  View,
  Text,
  Switch,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useUserStore } from '@/store/useUserStore';
import { Colors, Fonts } from '@/constants/theme';
import * as SecureStore from 'expo-secure-store';
import { openLegacyDatabase } from '@/api/sqliteCompat';

const db = openLegacyDatabase('dark-luxury.db');
const PIN_KEY = 'user_pin';

export default function SettingsScreen() {
  const { themeMode, setThemeMode, userName, setUserName } = useUserStore();
  const [nameInput, setNameInput] = useState(userName);
  const [currentPin, setCurrentPin] = useState('');
  const [newPin, setNewPin] = useState('');
  const [confirmPin, setConfirmPin] = useState('');

  const isHachiMode = themeMode === 'Hachi';

  const toggleTheme = () => {
    setThemeMode(isHachiMode ? 'Standard' : 'Hachi');
  };

  const handleSaveName = () => {
    const trimmed = nameInput.trim();
    if (!trimmed) {
      Alert.alert('Name required', 'Please enter a valid name.');
      return;
    }

    setUserName(trimmed);

    db.transaction(tx => {
      tx.executeSql(
        'UPDATE users SET userName = ? WHERE id = (SELECT id FROM users ORDER BY id DESC LIMIT 1)',
        [trimmed]
      );
    });

    Alert.alert('Updated', 'Your name has been updated.');
  };

  const handleChangePin = async () => {
    if (currentPin.length !== 4 || newPin.length !== 4 || confirmPin.length !== 4) {
      Alert.alert('4‑digit PIN required', 'Please enter 4 digits for each PIN field.');
      return;
    }

    if (newPin !== confirmPin) {
      Alert.alert('PIN mismatch', 'New PIN and confirmation do not match.');
      return;
    }

    const storedPin = await SecureStore.getItemAsync(PIN_KEY);
    if (!storedPin || storedPin !== currentPin) {
      Alert.alert('Incorrect PIN', 'Your current PIN is incorrect.');
      return;
    }

    await SecureStore.setItemAsync(PIN_KEY, newPin);
    setCurrentPin('');
    setNewPin('');
    setConfirmPin('');
    Alert.alert('PIN changed', 'Your PIN has been updated successfully.');
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        <Text style={styles.title}>Theme</Text>
        <View style={styles.optionRow}>
          <Text style={styles.optionText}>Hachi Mode</Text>
          <Switch
            value={isHachiMode}
            onValueChange={toggleTheme}
            trackColor={{ false: '#767577', true: Colors.accent.gold }}
            thumbColor={isHachiMode ? Colors.accent.gold : '#f4f3f4'}
          />
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Profile</Text>
          <Text style={styles.label}>Name</Text>
          <TextInput
            style={styles.input}
            placeholder="Your name"
            placeholderTextColor={Colors.accent.blue}
            value={nameInput}
            onChangeText={setNameInput}
          />
          <TouchableOpacity style={styles.button} onPress={handleSaveName}>
            <Text style={styles.buttonText}>Save Name</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Security</Text>
          <Text style={styles.label}>Current PIN</Text>
          <TextInput
            style={styles.input}
            placeholder="Current 4‑digit PIN"
            placeholderTextColor={Colors.accent.blue}
            keyboardType="numeric"
            secureTextEntry
            maxLength={4}
            value={currentPin}
            onChangeText={setCurrentPin}
          />
          <Text style={styles.label}>New PIN</Text>
          <TextInput
            style={styles.input}
            placeholder="New 4‑digit PIN"
            placeholderTextColor={Colors.accent.blue}
            keyboardType="numeric"
            secureTextEntry
            maxLength={4}
            value={newPin}
            onChangeText={setNewPin}
          />
          <Text style={styles.label}>Confirm New PIN</Text>
          <TextInput
            style={styles.input}
            placeholder="Confirm new PIN"
            placeholderTextColor={Colors.accent.blue}
            keyboardType="numeric"
            secureTextEntry
            maxLength={4}
            value={confirmPin}
            onChangeText={setConfirmPin}
          />
          <TouchableOpacity style={styles.button} onPress={handleChangePin}>
            <Text style={styles.buttonText}>Change PIN</Text>
          </TouchableOpacity>
        </View>
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
    padding: 20,
    backgroundColor: Colors.background,
  },
  title: {
    fontSize: 24,
    fontFamily: Fonts.heading,
    color: 'white',
    marginBottom: 20,
    paddingTop: 12,
  },
  optionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 10,
  },
  optionText: {
    fontSize: 18,
    fontFamily: Fonts.body,
    color: 'white',
  },
  section: {
    marginTop: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontFamily: Fonts.heading,
    color: '#F9FAFB',
    marginBottom: 8,
  },
  label: {
    fontSize: 14,
    fontFamily: Fonts.body,
    color: '#9CA3AF',
    marginTop: 8,
    marginBottom: 4,
  },
  input: {
    backgroundColor: '#0A0A0A',
    color: '#F9FAFB',
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: Colors.accent.blue,
    fontFamily: Fonts.body,
    fontSize: 16,
  },
  button: {
    marginTop: 12,
    paddingVertical: 12,
    borderRadius: 999,
    backgroundColor: Colors.accent.gold,
    alignItems: 'center',
  },
  buttonText: {
    fontFamily: Fonts.heading,
    fontSize: 16,
    color: '#0B1120',
  },
});
