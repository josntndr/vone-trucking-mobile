/**
 * Root Layout - Simplified
 * Main navigation layout with mobile viewport wrapper for web testing
 */

import React from 'react';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import MobileViewportWrapper from '../src/components/layout/MobileViewportWrapper';
import { ThemeProvider } from '../src/contexts/ThemeContext';

export default function RootLayout() {
  return (
    <ThemeProvider>
      <MobileViewportWrapper>
        <StatusBar style="light" />
        <Stack
          screenOptions={{
            headerShown: false,
            contentStyle: {
              backgroundColor: '#0B1120',
            },
          }}
        >
          <Stack.Screen name="index" />
        </Stack>
      </MobileViewportWrapper>
    </ThemeProvider>
  );
}

