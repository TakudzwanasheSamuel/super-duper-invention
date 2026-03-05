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
  }, [fetchLastRate]);

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
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <Text style={styles.screenTitle}>Utility</Text>

      <View style={styles.card}>
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

      <View style={styles.card}>
        <RateHistoryChart />
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  content: {
    padding: 16,
    paddingBottom: 24,
    gap: 16,
  },
  screenTitle: {
    fontFamily: Fonts.heading,
    fontSize: 20,
    color: '#F9FAFB',
  },
  card: {
    backgroundColor: Colors.secondary,
    borderRadius: 16,
    padding: 16,
  },
  currentRateLabel: {
    fontFamily: Fonts.body,
    fontSize: 14,
    color: '#9CA3AF',
  },
  currentRate: {
    fontFamily: 'JetBrainsMono_400Regular',
    fontSize: 32,
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
