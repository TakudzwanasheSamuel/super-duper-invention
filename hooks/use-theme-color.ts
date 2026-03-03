import { useColorScheme } from '@/hooks/use-color-scheme';
import { useUserStore } from '@/store/useUserStore';
import { Colors } from '@/constants/theme';
import { StandardTheme } from '@/constants/standardTheme';

export function useThemeColor(
  props: { light?: string; dark?: string },
  colorName: keyof typeof Colors.light & keyof typeof Colors.dark
) {
  const theme = useColorScheme();
  const { themeMode } = useUserStore();

  const colorScheme = theme ?? 'light';

  const colorFromProps = props[colorScheme];

  if (colorFromProps) {
    return colorFromProps;
  }

  if (themeMode === 'Standard') {
    return StandardTheme[colorScheme][colorName];
  }

  return Colors[colorScheme][colorName];
}
