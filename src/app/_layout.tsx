import { Stack, useRouter, useSegments } from 'expo-router';
import { useUserStore } from '@/store/useUserStore';
import { useEffect } from 'react';
import { DatabaseProvider } from '@/api/db';
import { useCategoryStore } from '@/store/useCategoryStore';
import { useTransactionStore } from '@/store/useTransactionStore';

export default function RootLayout() {
  const { isFirstLaunch } = useUserStore();
  const router = useRouter();
  const segments = useSegments();
  const fetchCategories = useCategoryStore(state => state.fetchCategories);
  const fetchTransactions = useTransactionStore(state => state.fetchTransactions);

  useEffect(() => {
    fetchCategories();
    fetchTransactions();
    const inAuthGroup = segments[0] === '(auth)';

    if (!isFirstLaunch && !inAuthGroup) {
      router.replace('/(auth)/pin-lock');
    } else if (isFirstLaunch && !inAuthGroup) {
      router.replace('/(auth)/welcome');
    }
  }, [isFirstLaunch, segments, fetchCategories, fetchTransactions]);

  return (
    <DatabaseProvider>
      <Stack>
        <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
        <Stack.Screen name="(auth)" options={{ headerShown: false }} />
      </Stack>
    </DatabaseProvider>
  );
}
