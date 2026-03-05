import React from 'react';
import {
  View,
  ScrollView,
  StyleSheet,
  Text,
  Image,
  TouchableOpacity,
  Linking,
} from 'react-native';
import { Colors, Fonts } from '@/constants/theme';
import LuxuryCard from '@/components/charts/LuxuryCard';

export default function ExploreScreen() {
  const openLink = (url: string) => {
    Linking.openURL(url).catch(() => {});
  };

  return (
    <View style={styles.container}>
      <ScrollView
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.header}>
          <Image
            source={require('../../../assets/images/logo.png')}
            style={styles.logo}
          />
          <View>
            <Text style={styles.title}>Explore myBudget</Text>
            <Text style={styles.subtitle}>
              Tips, examples, and resources to get the most out of your setup.
            </Text>
          </View>
        </View>

        <LuxuryCard>
          <Text style={styles.cardTitle}>Learn the basics</Text>
          <Text style={styles.cardBody}>
            myBudget is built on Expo Router, React Native, and SQLite. Use this screen as your
            launchpad for exploring how everything fits together.
          </Text>
          <TouchableOpacity
            onPress={() => openLink('https://docs.expo.dev/router/introduction/')}
            style={styles.linkButton}
          >
            <Text style={styles.linkText}>Read Expo Router guide</Text>
          </TouchableOpacity>
        </LuxuryCard>

        <LuxuryCard>
          <Text style={styles.cardTitle}>Design system</Text>
          <Text style={styles.cardBody}>
            This app uses the Dark Luxury Utility palette: deep slate backgrounds, gold accents,
            and card-based layouts. Reuse these patterns when adding new screens or components.
          </Text>
        </LuxuryCard>

        <LuxuryCard>
          <Text style={styles.cardTitle}>Data & persistence</Text>
          <Text style={styles.cardBody}>
            Transactions, budgets, and insights are stored locally with SQLite. Start by exploring
            the stores and hooks under the `src` folder when extending the data model.
          </Text>
        </LuxuryCard>

        <LuxuryCard>
          <Text style={styles.cardTitle}>More resources</Text>
          <TouchableOpacity
            onPress={() => openLink('https://reactnative.dev/docs/getting-started')}
            style={styles.linkButton}
          >
            <Text style={styles.linkText}>React Native docs</Text>
          </TouchableOpacity>
          <TouchableOpacity
            onPress={() => openLink('https://docs.expo.dev/')}
            style={styles.linkButton}
          >
            <Text style={styles.linkText}>Expo documentation</Text>
          </TouchableOpacity>
        </LuxuryCard>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  content: {
    padding: 16,
    paddingBottom: 32,
    gap: 16,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
  },
  logo: {
    width: 72,
    height: 72,
    borderRadius: 20,
  },
  title: {
    fontFamily: Fonts.heading,
    fontSize: 20,
    color: '#F9FAFB',
  },
  subtitle: {
    marginTop: 4,
    fontFamily: Fonts.body,
    fontSize: 13,
    color: '#9CA3AF',
  },
  cardTitle: {
    fontFamily: Fonts.heading,
    fontSize: 16,
    color: '#F9FAFB',
    marginBottom: 6,
  },
  cardBody: {
    fontFamily: Fonts.body,
    fontSize: 13,
    color: '#D1D5DB',
  },
  linkButton: {
    marginTop: 10,
  },
  linkText: {
    fontFamily: Fonts.body,
    fontSize: 13,
    color: Colors.accent.gold,
  },
});
