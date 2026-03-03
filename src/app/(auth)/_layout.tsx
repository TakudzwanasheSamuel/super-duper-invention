import { Stack } from 'expo-router';

export default function AuthLayout() {
  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="welcome" />
      <Stack.Screen name="currency" />
      <Stack.Screen name="finalize" />
      <Stack.Screen name="pin-setup" />
      <Stack.Screen name="pin-lock" />
    </Stack>
  );
}
