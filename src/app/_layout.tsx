import { useEffect } from 'react';
import { Stack, useRouter } from 'expo-router';
import { ActivityIndicator, View } from 'react-native';
import { DatabaseProvider } from '@/api/db';
import { useUserStore } from '@/store/useUserStore';
import { useAppBootstrap } from '@/hooks/useAppBootstrap';
import { useAutoLock } from '@/hooks/useAutoLock';
import { Colors } from '@/constants/theme';

export default function RootLayout() {
  const { ready, hasPin } = useAppBootstrap();
  const isFirstLaunch = useUserStore(s => s.isFirstLaunch);
  const isUnlocked = useUserStore(s => s.isUnlocked);
  const router = useRouter();

  const needsPinUnlock = ready && !isFirstLaunch && hasPin && !isUnlocked;

  // Re-lock the app after PIN_LOCK_TIMEOUT_MS of background time. Only enabled
  // once the user has a PIN AND has finished onboarding; otherwise there's
  // nothing to lock against.
  useAutoLock(ready && !isFirstLaunch && hasPin);

  useEffect(() => {
    if (needsPinUnlock) {
      router.replace('/(auth)/pin-lock');
    }
  }, [needsPinUnlock, router]);

  if (!ready) {
    return (
      <View
        style={{
          flex: 1,
          backgroundColor: Colors.background,
          justifyContent: 'center',
          alignItems: 'center',
        }}
      >
        <ActivityIndicator size="large" color={Colors.accent.gold} />
      </View>
    );
  }

  return (
    <DatabaseProvider>
      {isFirstLaunch ? (
        <Stack screenOptions={{ headerShown: false }}>
          <Stack.Screen name="(auth)" />
        </Stack>
      ) : (
        <Stack screenOptions={{ headerShown: false }}>
          <Stack.Screen name="(tabs)" />
          <Stack.Screen name="(auth)" />
        </Stack>
      )}
    </DatabaseProvider>
  );
}
