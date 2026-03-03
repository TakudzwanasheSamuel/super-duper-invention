import React from 'react';
import { ScrollView, StyleSheet, View, Text, TextInput, TouchableOpacity } from 'react-native';
import RateHistoryChart from '@/components/charts/RateHistoryChart';
import { Colors, Fonts } from '@/constants/theme';
import { useRateStore } from '@/store/useRateStore';
import * as Haptics from 'expo-haptics';

export default function UtilityScreen() {
  const { lastRate, updateRate, fetchLastRate } = useRateStore();
  const [newRate, setNewRate] = React.useState('');

  React.useEffect(() => {
    fetchLastRate();
  }, []);

  const handleUpdateRate = () => {
    const rateValue = parseFloat(newRate);
    if (!isNaN(rateValue) && rateValue > 0) {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      updateRate(rateValue);
      setNewRate('');
    } else {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
    }
  };

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.header}>Utilities</Text>

      <View style={styles.rateUpdateContainer}>
        <Text style={styles.currentRateLabel}>Current Rate (USD to ZiG)</Text>
        <Text style={styles.currentRate}>{lastRate.toFixed(2)}</Text>
        <TextInput
          style={styles.input}
          placeholder="Enter New Market Rate"
          placeholderTextColor={Colors.secondary}
          keyboardType="numeric"
          value={newRate}
          onChangeText={setNewRate}
        />
        <TouchableOpacity style={styles.updateButton} onPress={handleUpdateRate}>
          <Text style={styles.updateButtonText}>Update Rate</Text>
        </TouchableOpacity>
      </View>

      <RateHistoryChart />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
    padding: 15,
  },
  header: {
    fontFamily: Fonts.heading,
    fontSize: 32,
    color: 'white',
    textAlign: 'center',
    marginVertical: 20,
  },
  rateUpdateContainer: {
    backgroundColor: '#1A1A24',
    borderRadius: 15,
    padding: 20,
    marginBottom: 20,
    alignItems: 'center',
  },
  currentRateLabel: {
    fontFamily: Fonts.body,
    fontSize: 16,
    color: Colors.secondary,
  },
  currentRate: {
    fontFamily: Fonts.heading,
    fontSize: 48,
    color: Colors.accent.gold,
    marginVertical: 10,
  },
  input: {
    backgroundColor: '#0A0A0A',
    color: 'white',
    width: '100%',
    padding: 15,
    borderRadius: 10,
    fontFamily: Fonts.body,
    fontSize: 16,
    textAlign: 'center',
    marginTop: 10,
    borderWidth: 1,
    borderColor: '#333',
  },
  updateButton: {
    backgroundColor: Colors.accent.gold,
    paddingVertical: 15,
    paddingHorizontal: 30,
    borderRadius: 10,
    marginTop: 15,
  },
  updateButtonText: {
    color: '#000',
    fontFamily: Fonts.heading,
    fontSize: 18,
  },
});
