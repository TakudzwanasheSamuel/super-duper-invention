import React from 'react';
import { View, Text, Switch, StyleSheet } from 'react-native';
import { useUserStore } from '@/store/useUserStore';
import { Colors, Fonts } from '@/constants/theme';

export default function SettingsScreen() {
  const { themeMode, setThemeMode } = useUserStore();

  const isHachiMode = themeMode === 'Hachi';

  const toggleTheme = () => {
    setThemeMode(isHachiMode ? 'Standard' : 'Hachi');
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Theme</Text>
      <View style={styles.optionContainer}>
        <Text style={styles.optionText}>Hachi Mode</Text>
        <Switch
          value={isHachiMode}
          onValueChange={toggleTheme}
          trackColor={{ false: '#767577', true: Colors.primary }}
          thumbColor={isHachiMode ? Colors.secondary : '#f4f3f4'}
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: Colors.background,
  },
  title: {
    fontSize: 24,
    fontFamily: Fonts.heading,
    color: 'white',
    marginBottom: 20,
  },
  optionContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 10,
  },
  optionText: {
    fontSize: 18,
    fontFamily: Fonts.body,
    color: 'white',
  },
});
