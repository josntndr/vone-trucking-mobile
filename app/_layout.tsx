/**
 * Root Layout - Simplified
 * Main navigation layout with mobile viewport wrapper for web testing
 */

import React from 'react';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import MobileViewportWrapper from '../src/components/layout/MobileViewportWrapper';

export default function RootLayout() {
  return (
    <MobileViewportWrapper>
      <StatusBar style="auto" />
      <Stack
        screenOptions={{
          headerShown: false,
          contentStyle: {
            backgroundColor: '#f5f5f5',
          },
        }}
      >
        <Stack.Screen name="index" />
      </Stack>
    </MobileViewportWrapper>
  );
}

