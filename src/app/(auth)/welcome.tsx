import { useState, useEffect } from 'react';
import { View, Text, TextInput, StyleSheet, TouchableOpacity } from 'react-native';
import { Image } from 'expo-image';
import { useRouter } from 'expo-router';
import { useUserStore } from '@/store/useUserStore';
import { Colors, Fonts } from '@/constants/theme';
import { openLegacyDatabase } from '@/api/sqliteCompat';

const db = openLegacyDatabase('dark-luxury.db');

export default function WelcomeScreen() {
  const [name, setName] = useState('');
  const [typedText, setTypedText] = useState('');
  const router = useRouter();
  const { setUserName } = useUserStore();
  const fullText = 'What should we call you?';

  useEffect(() => {
    let index = 0;
    const interval = setInterval(() => {
      setTypedText((prev) => prev + fullText[index]);
      index++;
      if (index === fullText.length - 1) {
        clearInterval(interval);
      }
    }, 100);
    return () => clearInterval(interval);
  }, []);

  const handleContinue = () => {
    if (name.trim()) {
      setUserName(name);
      db.transaction(tx => {
        tx.executeSql('INSERT INTO users (userName, primaryCurrency) VALUES (?, ?)', [name, 'USD']);
      });
      router.push('/(auth)/currency');
    }
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
      <Text style={styles.title}>{typedText}</Text>
      <TextInput
        style={styles.input}
        placeholder="Your Name"
        placeholderTextColor={Colors.secondary}
        value={name}
        onChangeText={setName}
      />
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
    marginBottom: 32,
  },
  logo: {
    width: 160,
    height: 160,
  },
  title: {
    fontFamily: Fonts.heading,
    fontSize: 36,
    color: 'white',
    marginBottom: 40,
  },
  input: {
    fontFamily: Fonts.body,
    fontSize: 18,
    color: '#000000',
    backgroundColor: '#FFFFFF',
    width: '80%',
    padding: 15,
    borderRadius: 10,
    marginBottom: 20,
    textAlign: 'center',
    borderWidth: 2,
    borderColor: Colors.accent.gold,
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
