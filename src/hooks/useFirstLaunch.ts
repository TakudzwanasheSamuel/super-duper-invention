import { useUserStore } from '@/store/useUserStore';
import { openLegacyDatabase } from '@/api/sqliteCompat';

const db = openLegacyDatabase('dark-luxury.db');

export const useFirstLaunch = () => {
  const { setIsFirstLaunch } = useUserStore();

  const finalizeOnboarding = () => {
    setIsFirstLaunch(false);
    db.transaction(tx => {
      tx.executeSql('INSERT INTO settings (isFirstLaunch) VALUES (0);');
    });
  };

  return { finalizeOnboarding };
};