import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, AppState } from 'react-native';
import * as SecureStore from 'expo-secure-store';
import * as Haptics from 'expo-haptics';
import * as LocalAuthentication from 'expo-local-authentication';
import { Colors, Fonts } from '@/constants/theme';
import { useRouter } from 'expo-router';

const PIN_KEY = 'user_pin';
const LAST_ACTIVE_TIMESTAMP_KEY = 'last_active_timestamp';

export default function PinLockScreen() {
  const [pin, setPin] = useState('');
  const [isPinSet, setIsPinSet] = useState(false);
  const router = useRouter();

  useEffect(() => {
    checkPinSet();
    handleBiometricAuth();
    const subscription = AppState.addEventListener('change', handleAppStateChange);

    return () => {
      subscription.remove();
    };
  }, []);

  const checkPinSet = async () => {
    const storedPin = await SecureStore.getItemAsync(PIN_KEY);
    setIsPinSet(!!storedPin);
  };

  const handleBiometricAuth = async () => {
    const hasHardware = await LocalAuthentication.hasHardwareAsync();
    if (hasHardware) {
      const isEnrolled = await LocalAuthentication.isEnrolledAsync();
      if (isEnrolled) {
        const result = await LocalAuthentication.authenticateAsync();
        if (result.success) {
          router.replace('/(tabs)');
        }
      }
    }
  };

  const handlePinInput = async (num: string) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    if (pin.length < 4) {
      const newPin = pin + num;
      setPin(newPin);
      if (newPin.length === 4) {
        if (isPinSet) {
          verifyPin(newPin);
        } else {
          await SecureStore.setItemAsync(PIN_KEY, newPin);
          router.replace('/(tabs)');
        }
        setPin('');
      }
    }
  };

  const verifyPin = async (enteredPin: string) => {
    const storedPin = await SecureStore.getItemAsync(PIN_KEY);
    if (enteredPin === storedPin) {
      router.replace('/(tabs)');
    } else {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      setPin('');
    }
  };

  const handleAppStateChange = async (nextAppState: any) => {
    if (nextAppState === 'background') {
      await SecureStore.setItemAsync(LAST_ACTIVE_TIMESTAMP_KEY, Date.now().toString());
    } else if (nextAppState === 'active') {
      const lastActive = await SecureStore.getItemAsync(LAST_ACTIVE_TIMESTAMP_KEY);
      if (lastActive && Date.now() - parseInt(lastActive) > 2 * 60 * 1000) {
        router.replace('/(auth)/pin-lock');
      }
    }
  };

  const renderPinDots = () => {
    return Array(4).fill(0).map((_, i) => (
      <View key={i} style={[styles.pinDot, pin.length > i && styles.pinDotFilled]} />
    ));
  };

  const renderNumPad = () => {
    const numbers = ['1', '2', '3', '4', '5', '6', '7', '8', '9', '', '0', '<|'];
    return numbers.map((num) => (
      <TouchableOpacity key={num} style={styles.numButton} onPress={() => num === '<|' ? setPin(pin.slice(0, -1)) : handlePinInput(num)}>
        <Text style={styles.numText}>{num}</Text>
      </TouchableOpacity>
    ));
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>{isPinSet ? 'Enter PIN' : 'Create PIN'}</Text>
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
  title: {
    fontFamily: Fonts.heading,
    fontSize: 24,
    color: 'white',
    marginBottom: 40,
  },
  pinContainer: {
    flexDirection: 'row',
    marginBottom: 60,
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
