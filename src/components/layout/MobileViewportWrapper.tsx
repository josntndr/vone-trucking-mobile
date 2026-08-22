/**
 * Mobile Viewport Wrapper (Native)
 * Pass-through component for iOS and Android
 * Only the .web.tsx version applies mobile viewport styling
 */

import React, { ReactNode } from 'react';
import { View, StyleSheet } from 'react-native';

interface MobileViewportWrapperProps {
  children: ReactNode;
}

export default function MobileViewportWrapper({ children }: MobileViewportWrapperProps) {
  // On native platforms, just render children directly with flex: 1
  return <View style={styles.container}>{children}</View>;
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});
