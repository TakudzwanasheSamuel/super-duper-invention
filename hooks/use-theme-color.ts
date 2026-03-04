import { useColorScheme } from '@/hooks/use-color-scheme';
import { useUserStore } from '@/store/useUserStore';
import { Colors as BaseColors } from '../constants/theme';
import { StandardTheme } from '../src/constants/standardTheme';

export function useThemeColor(
  props: { light?: string; dark?: string },
  colorName: keyof typeof BaseColors.light & keyof typeof BaseColors.dark
) {
  const scheme = useColorScheme(); // 'light' | 'dark'
  const { themeMode } = useUserStore();

  const colorScheme = scheme ?? 'light';
  const colorFromProps = props[colorScheme];

  if (colorFromProps) {
    return colorFromProps;
  }

  if (themeMode === 'Standard') {
    return StandardTheme[colorScheme][colorName];
  }

  return BaseColors[colorName as keyof typeof BaseColors.light];
}
