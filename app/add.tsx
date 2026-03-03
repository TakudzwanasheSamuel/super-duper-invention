import React, { useMemo, useRef } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import BottomSheet from '@gorhom/bottom-sheet';
import { Colors, Fonts } from '@/constants/theme';

export default function AddScreen() {
  const bottomSheetRef = useRef<BottomSheet>(null);

  const snapPoints = useMemo(() => ['25%', '50%', '90%'], []);

  return (
    <View style={styles.container}>
      <BottomSheet
        ref={bottomSheetRef}
        index={1}
        snapPoints={snapPoints}
        backgroundStyle={{ backgroundColor: Colors.background }}
        handleIndicatorStyle={{ backgroundColor: 'white' }}
      >
        <View style={styles.contentContainer}>
          <Text style={styles.title}>Quick Add</Text>
          {/* Add your form components here */}
        </View>
      </BottomSheet>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
  },
  contentContainer: {
    flex: 1,
    alignItems: 'center',
    padding: 20,
  },
  title: {
    fontSize: 24,
    fontFamily: Fonts.heading,
    color: 'white',
    marginBottom: 20,
  },
});
