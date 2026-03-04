import { useEffect } from 'react';
import { View, Text, StyleSheet, ActivityIndicator } from 'react-native';
import { Image } from 'expo-image';
import { useRouter } from 'expo-router';
import { useFirstLaunch } from '@/hooks/useFirstLaunch';
import { Colors, Fonts } from '@/constants/theme';

export default function FinalizeScreen() {
  const router = useRouter();
  const { finalizeOnboarding } = useFirstLaunch();

  useEffect(() => {
    finalizeOnboarding();
    setTimeout(() => {
      router.replace('/(auth)/pin-setup');
    }, 2000);
  }, []);

  return (
    <View style={styles.container}>
      <View style={styles.logoContainer}>
        <Image
          source={require('../../../assets/images/logo.png')}
          style={styles.logo}
          contentFit="contain"
        />
      </View>
      <Text style={styles.title}>Let's build something</Text>
      <ActivityIndicator size="large" color={Colors.accent.gold} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
    alignItems: 'center',
    justifyContent: 'center',
  },
  logoContainer: {
    alignItems: 'center',
    marginBottom: 24,
  },
  logo: {
    width: 140,
    height: 140,
  },
  title: {
    fontFamily: Fonts.heading,
    fontSize: 36,
    color: 'white',
    marginBottom: 40,
  },
});
