import React from 'react';
import { View, StyleSheet } from 'react-native';
import { Colors } from '@/constants/theme';

interface LuxuryCardProps {
  children: React.ReactNode;
}

export default function LuxuryCard({ children }: LuxuryCardProps) {
  return <View style={styles.card}>{children}</View>;
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#0A0A0A',
    borderRadius: 15,
    padding: 20,
    borderWidth: 1,
    borderColor: '#1A1A24',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 10,
    },
    shadowOpacity: 0.5,
    shadowRadius: 15,
    elevation: 5,
    marginVertical: 10,
  },
});
