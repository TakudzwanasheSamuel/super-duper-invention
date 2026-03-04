import { useColorScheme as useDeviceColorScheme } from 'react-native';

// Simple hook that returns the current color scheme as 'light' or 'dark'.
// More advanced theming (Standard vs Hachi) is handled in useThemeColor.
export function useColorScheme() {
  return useDeviceColorScheme() ?? 'light';
}
