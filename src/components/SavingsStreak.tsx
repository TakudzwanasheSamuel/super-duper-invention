import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import ConfettiCannon from 'react-native-confetti-cannon';
import { useSavingsStore } from '@/store/useSavingsStore';
import { Colors, Fonts } from '@/constants/theme';

export default function SavingsStreak() {
  const { streak, hasCheckedIn, fetchStreak, checkIn } = useSavingsStore();
  const [showConfetti, setShowConfetti] = useState(false);

  useEffect(() => {
    fetchStreak();
  }, [fetchStreak]);

  const handleCheckIn = () => {
    checkIn();
    setShowConfetti(true);
  };

  return (
    <View style={styles.container}>
      <View style={styles.streakContainer}>
        <Ionicons name="flame" size={40} color={Colors.accent.orange} />
        <Text style={styles.streakText}>{streak} Month Streak</Text>
      </View>
      <TouchableOpacity
        style={[styles.checkInButton, hasCheckedIn && styles.checkInButtonDisabled]}
        onPress={handleCheckIn}
        disabled={hasCheckedIn}
      >
        <Text style={styles.checkInButtonText}>{hasCheckedIn ? 'Checked In!' : 'Meet Monthly Goal ($20)'}</Text>
      </TouchableOpacity>
      {showConfetti && <ConfettiCannon count={200} origin={{ x: -10, y: 0 }} onAnimationEnd={() => setShowConfetti(false)} />}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    marginVertical: 20,
  },
  streakContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
  },
  streakText: {
    fontFamily: Fonts.heading,
    fontSize: 24,
    color: 'white',
    marginLeft: 10,
  },
  checkInButton: {
    backgroundColor: Colors.accent.gold,
    paddingVertical: 15,
    paddingHorizontal: 30,
    borderRadius: 25,
  },
  checkInButtonDisabled: {
    backgroundColor: '#555',
  },
  checkInButtonText: {
    fontFamily: Fonts.body,
    fontSize: 18,
    color: 'black',
    fontWeight: 'bold',
  },
});
