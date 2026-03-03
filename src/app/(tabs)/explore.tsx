import Ionicons from '@expo/vector-icons/Ionicons';
import { StyleSheet, Image, Platform } from 'react-native';

import { Collapsible } from '@/components/Collapsible';
import { ExternalLink } from '@/components/ExternalLink';
import ParallaxScrollView from '@/components/ParallaxScrollView';
import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';

export default function TabTwoScreen() {
  return (
    <ParallaxScrollView
      headerBackgroundColor={{ light: '#D0D0D0', dark: '#353636' }}
      headerImage={<Ionicons size={310} name="code-slash" style={styles.headerImage} />}>
      <ThemedView style={styles.titleContainer}>
        <ThemedText type="title">Explore</ThemedText>
      </ThemedView>
      <ThemedText>This app includes example code to help you get started.</ThemedText>
      <Collapsible title="File-based routing">
        <ThemedText>
          This starter app uses file-based routing. You can learn more about this topic in the{' '}
          <ExternalLink href="https://docs.expo.dev/router/introduction/">
            <ThemedText type="link">Expo Router documentation</ThemedText>
          </ExternalLink>
          .
        </ThemedText>
      </Collapsible>
      <Collapsible title="Android, iOS, and web support">
        <ThemedText>
          You can open this project on Android, iOS, and the web. To open the web version, press{' '}
          <ThemedText type="defaultSemiBold">w</ThemedText> in the terminal running this project.
        </ThemedText>
      </Collapsible>
      <Collapsible title="Images">
        <ThemedText>
          For static images, you can use the <ThemedText type="defaultSemiBold">@/assets/images</ThemedText> directory. For dynamic images, you can use the{' '}
          <ExternalLink href="https://docs.expo.dev/versions/latest/sdk/image/">
            <ThemedText type="link">Image</ThemedText>
          </ExternalLink>
          component.
        </ThemedText>
        <Image source={require('@/assets/images/react-logo.png')} style={{ alignSelf: 'center' }} />
      </Collapsible>
      <Collapsible title="Custom fonts">
        <ThemedText>
          This starter template includes an example of loading a custom font. The{' '}
          <ThemedText type="defaultSemiBold">useFonts</ThemedText> hook in{' '}
          <ThemedText type="defaultSemiBold">app/_layout.tsx</ThemedText> loads the space mono font.
        </ThemedText>
      </Collapsible>
      <Collapsible title="Light and dark mode support">
        <ThemedText>
          This starter template has light and dark mode support. The <ThemedText type="defaultSemiBold">useColorScheme()</ThemedText> hook lets you inspect
          what the user's current color scheme is, and so you can adjust UI colors accordingly.
        </ThemedText>
      </Collapsible>
      <Collapsible title="Animations">
        <ThemedText>
          This starter template includes an example of an animated component. The{' '}
          <ThemedText type="defaultSemiBold">components/HelloWave.tsx</ThemedText> component uses the powerful <ThemedText type="defaultSemiBold">react-native-reanimated</ThemedText> library
          to create a waving hand animation.
        </ThemedText>
      </Collapsible>
    </ParallaxScrollView>
  );
}

const styles = StyleSheet.create({
  headerImage: {
    color: '#808080',
    bottom: -90,
    left: -35,
    position: 'absolute',
  },
  titleContainer: {
    flexDirection: 'row',
    gap: 8,
  },
});
