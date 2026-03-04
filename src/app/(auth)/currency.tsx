import { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Image } from 'expo-image';
import { useRouter } from 'expo-router';
import { useUserStore } from '@/store/useUserStore';
import { Colors, Fonts } from '@/constants/theme';
import { openLegacyDatabase } from '@/api/sqliteCompat';

const db = openLegacyDatabase('dark-luxury.db');

export default function CurrencyScreen() {
  const router = useRouter();
  const { primaryCurrency, setPrimaryCurrency, userName } = useUserStore();
  const [selectedCurrency, setSelectedCurrency] = useState(primaryCurrency);

  const handleSelectCurrency = (currency: 'USD' | 'ZiG') => {
    setSelectedCurrency(currency);
  };

  const handleContinue = () => {
    setPrimaryCurrency(selectedCurrency);
    db.transaction(tx => {
      tx.executeSql('UPDATE users SET primaryCurrency = ? WHERE userName = ?', [selectedCurrency, userName]);
    });
    router.push('/(auth)/finalize');
  };

  return (
    <View style={styles.container}>
      <View style={styles.logoContainer}>
        <Image
          source={require('../../../assets/images/logo.png')}
          style={styles.logo}
          contentFit="contain"
        />
      </View>
      <Text style={styles.title}>Primary Currency</Text>
      <View style={styles.toggleContainer}>
        <TouchableOpacity
          style={[
            styles.toggleButton,
            selectedCurrency === 'USD' && { backgroundColor: Colors.accent.blue },
          ]}
          onPress={() => handleSelectCurrency('USD')}>
          <Text style={styles.toggleText}>USD</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[
            styles.toggleButton,
            selectedCurrency === 'ZiG' && { backgroundColor: Colors.accent.gold },
          ]}
          onPress={() => handleSelectCurrency('ZiG')}>
          <Text style={styles.toggleText}>ZiG</Text>
        </TouchableOpacity>
      </View>
      <TouchableOpacity style={styles.button} onPress={handleContinue}>
        <Text style={styles.buttonText}>Continue</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
    alignItems: 'center',
    justifyContent: 'center',
  },
  logoContainer: {
    alignItems: 'center',
    marginBottom: 24,
  },
  logo: {
    width: 140,
    height: 140,
  },
  title: {
    fontFamily: Fonts.heading,
    fontSize: 36,
    color: 'white',
    marginBottom: 40,
  },
  toggleContainer: {
    flexDirection: 'row',
    marginBottom: 40,
  },
  toggleButton: {
    paddingVertical: 15,
    paddingHorizontal: 40,
    borderRadius: 30,
    marginHorizontal: 10,
    backgroundColor: Colors.secondary,
  },
  toggleText: {
    fontFamily: Fonts.heading,
    fontSize: 18,
    color: 'white',
  },
  button: {
    backgroundColor: Colors.accent.gold,
    padding: 15,
    borderRadius: 10,
  },
  buttonText: {
    fontFamily: Fonts.heading,
    fontSize: 18,
    color: Colors.background,
  },
});
