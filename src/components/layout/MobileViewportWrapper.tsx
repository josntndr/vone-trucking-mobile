/**
 * Mobile Viewport Wrapper (Native)
 * Pass-through component for iOS and Android
 * Only the .web.tsx version applies mobile viewport styling
 */

import React, { ReactNode } from 'react';
import { View, StyleSheet } from 'react-native';
import { PortalProvider } from '../../contexts/PortalContext';

interface MobileViewportWrapperProps {
  children: ReactNode;
}

export default function MobileViewportWrapper({ children }: MobileViewportWrapperProps) {
  // On native platforms, wrap with PortalProvider at app root
  return (
    <View style={styles.container}>
      <PortalProvider>
        {children}
      </PortalProvider>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});
