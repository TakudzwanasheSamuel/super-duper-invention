import { Stack } from 'expo-router';
import { useUserStore } from '@/store/useUserStore';
import { useEffect, useState } from 'react';
import { ActivityIndicator, View } from 'react-native';
import { DatabaseProvider, initDB } from '@/api/db';
import { useCategoryStore } from '@/store/useCategoryStore';
import { useTransactionStore } from '@/store/useTransactionStore';
import { openLegacyDatabase } from '@/api/sqliteCompat';
import { Colors } from '@/constants/theme';

const db = openLegacyDatabase('dark-luxury.db');

export default function RootLayout() {
  const { isFirstLaunch, setIsFirstLaunch, setUserName, setPrimaryCurrency } = useUserStore();
  const fetchCategories = useCategoryStore(state => state.fetchCategories);
  const fetchTransactions = useTransactionStore(state => state.fetchTransactions);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    initDB();

    db.transaction(tx => {
      tx.executeSql(
        'SELECT isFirstLaunch FROM settings ORDER BY id DESC LIMIT 1',
        [],
        (_, { rows }) => {
          if (rows._array.length > 0 && rows._array[0].isFirstLaunch === 0) {
            setIsFirstLaunch(false);
          }
        },
      );

      tx.executeSql(
        'SELECT userName, primaryCurrency FROM users ORDER BY id DESC LIMIT 1',
        [],
        (_, { rows }) => {
          if (rows._array.length > 0) {
            const user = rows._array[0];
            if (user.userName) setUserName(user.userName);
            if (user.primaryCurrency) setPrimaryCurrency(user.primaryCurrency);
          }
          fetchCategories();
          fetchTransactions();
          setReady(true);
        },
        () => {
          fetchCategories();
          fetchTransactions();
          setReady(true);
          return true;
        },
      );
    });
  }, []);

  if (!ready) {
    return (
      <View style={{ flex: 1, backgroundColor: Colors.background, justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator size="large" color={Colors.accent.gold} />
      </View>
    );
  }

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
