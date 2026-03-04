import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Image } from 'expo-image';
import * as SecureStore from 'expo-secure-store';
import * as Haptics from 'expo-haptics';
import { Colors, Fonts } from '@/constants/theme';
import { Stack, useRouter } from 'expo-router';

const PIN_KEY = 'user_pin';

export default function PinSetupScreen() {
  const [pin, setPin] = useState('');
  const router = useRouter();

  const handlePinInput = async (num: string) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    if (pin.length < 4) {
      const newPin = pin + num;
      setPin(newPin);
      if (newPin.length === 4) {
        await SecureStore.setItemAsync(PIN_KEY, newPin);
        setPin('');
        router.replace('/(tabs)');
      }
    }
  };

  const renderPinDots = () => {
    return Array(4)
      .fill(0)
      .map((_, i) => (
        <View key={i} style={[styles.pinDot, pin.length > i && styles.pinDotFilled]} />
      ));
  };

  const renderNumPad = () => {
    const numbers = ['1', '2', '3', '4', '5', '6', '7', '8', '9', '', '0', '<|'];
    return numbers.map((num) => (
      <TouchableOpacity
        key={num}
        style={styles.numButton}
        onPress={() => (num === '<|' ? setPin(pin.slice(0, -1)) : handlePinInput(num))}
      >
        <Text style={styles.numText}>{num}</Text>
      </TouchableOpacity>
    ));
  };

  return (
    <View style={styles.container}>
      <Stack.Screen options={{ headerShown: true, title: 'Create PIN' }} />
      <View style={styles.logoContainer}>
        <Image
          source={require('../../../assets/images/logo.png')}
          style={styles.logo}
          contentFit="contain"
        />
      </View>
      <Text style={styles.title}>Create Your PIN</Text>
      <View style={styles.pinContainer}>{renderPinDots()}</View>
      <View style={styles.numPadContainer}>{renderNumPad()}</View>
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
    fontSize: 24,
    color: 'white',
    marginBottom: 30,
  },
  pinContainer: {
    flexDirection: 'row',
    marginBottom: 40,
  },
  pinDot: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: Colors.secondary,
    margin: 10,
  },
  pinDotFilled: {
    backgroundColor: Colors.accent.gold,
    borderColor: Colors.accent.gold,
  },
  numPadContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    width: '80%',
    justifyContent: 'center',
  },
  numButton: {
    width: '33.33%',
    padding: 20,
    alignItems: 'center',
  },
  numText: {
    fontFamily: Fonts.body,
    fontSize: 24,
    color: 'white',
  },
});
