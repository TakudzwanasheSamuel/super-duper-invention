import { Stack } from 'expo-router';
import { useUserStore } from '@/store/useUserStore';
import { useEffect } from 'react';
import { DatabaseProvider } from '@/api/db';
import { useCategoryStore } from '@/store/useCategoryStore';
import { useTransactionStore } from '@/store/useTransactionStore';

export default function RootLayout() {
  const { isFirstLaunch } = useUserStore();
  const fetchCategories = useCategoryStore(state => state.fetchCategories);
  const fetchTransactions = useTransactionStore(state => state.fetchTransactions);

  useEffect(() => {
    fetchCategories();
    fetchTransactions();
  }, [fetchCategories, fetchTransactions]);

  return (
    <DatabaseProvider>
      {isFirstLaunch ? (
        <Stack>
          <Stack.Screen name="(auth)" options={{ headerShown: false }} />
        </Stack>
      ) : (
        <Stack>
          <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
          <Stack.Screen name="(auth)" options={{ headerShown: false }} />
        </Stack>
      )}
    </DatabaseProvider>
  );
}
