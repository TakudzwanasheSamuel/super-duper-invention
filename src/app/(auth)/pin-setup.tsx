import { View, Text, StyleSheet } from 'react-native';
import { Colors, Fonts } from '@/constants/theme';
import { Stack } from 'expo-router';

export default function PinSetupScreen() {
  return (
    <View style={styles.container}>
      <Stack.Screen options={{ headerShown: true, title: 'Create PIN' }} />
      <Text style={styles.title}>Create Your PIN</Text>
      {/* PIN input and logic will go here */}
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
    marginBottom: 20,
  },
});
