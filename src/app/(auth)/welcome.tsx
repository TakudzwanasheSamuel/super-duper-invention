import { useState, useEffect } from 'react';
import { View, Text, TextInput, StyleSheet, TouchableOpacity } from 'react-native';
import { useRouter } from 'expo-router';
import { useUserStore } from '@/store/useUserStore';
import { Colors, Fonts } from '@/constants/theme';
import * as SQLite from 'expo-sqlite';

const db = SQLite.openDatabase('dark-luxury.db');

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
  title: {
    fontFamily: Fonts.heading,
    fontSize: 36,
    color: 'white',
    marginBottom: 40,
  },
  input: {
    fontFamily: Fonts.body,
    fontSize: 18,
    color: 'white',
    backgroundColor: Colors.secondary,
    width: '80%',
    padding: 15,
    borderRadius: 10,
    marginBottom: 20,
    textAlign: 'center',
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
