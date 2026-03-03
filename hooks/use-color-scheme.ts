import { useColorScheme as useDeviceColorScheme } from 'react-native';
import { useUserStore } from '@/store/useUserStore';
import { Colors } from '@/constants/theme';
import { StandardTheme } from '@/constants/standardTheme';

export function useColorScheme() {
  const { themeMode } = useUserStore();
  const deviceColorScheme = useDeviceColorScheme();

  if (themeMode === 'Standard') {
    return deviceColorScheme === 'dark' ? StandardTheme.dark : StandardTheme.light;
  }

  return deviceColorScheme === 'dark' ? Colors.dark : Colors.light;
}
