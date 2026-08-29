/**
 * Mobile Viewport Wrapper (Web Only)
 * Displays app in centered mobile viewport during localhost testing
 * Does NOT affect native iOS/Android
 */

import React, { ReactNode, useState } from 'react';
import { View, StyleSheet, ScrollView, TouchableOpacity, Text } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { PortalProvider } from '../../contexts/PortalContext';

interface MobileViewportWrapperProps {
  children: ReactNode;
}

type DeviceSize = '320' | '360' | '390' | '430';

const DEVICE_SIZES = {
  '320': { width: 320, height: 568, label: 'Small (320px)' },
  '360': { width: 360, height: 640, label: 'Compact (360px)' },
  '390': { width: 390, height: 844, label: 'Standard (390px)' },
  '430': { width: 430, height: 932, label: 'Large (430px)' },
};

export default function MobileViewportWrapper({ children }: MobileViewportWrapperProps) {
  const [deviceSize, setDeviceSize] = useState<DeviceSize>('390');
  const [showSelector, setShowSelector] = useState(false);
  
  const isDevelopment = process.env.NODE_ENV === 'development';
  const device = DEVICE_SIZES[deviceSize];

  return (
    <View style={styles.outerContainer}>
      {/* Development Device Selector */}
      {isDevelopment && (
        <View style={styles.devToolbar}>
          <TouchableOpacity
            style={styles.selectorButton}
            onPress={() => setShowSelector(!showSelector)}
            accessibilityLabel="Toggle device size selector"
          >
            <MaterialCommunityIcons name="cellphone" size={16} color="#666" />
            <Text style={styles.selectorButtonText}>{device.label}</Text>
            <MaterialCommunityIcons 
              name={showSelector ? "chevron-up" : "chevron-down"} 
              size={16} 
              color="#666" 
            />
          </TouchableOpacity>

          {showSelector && (
            <View style={styles.selectorDropdown}>
              {(Object.keys(DEVICE_SIZES) as DeviceSize[]).map((size) => (
                <TouchableOpacity
                  key={size}
                  style={[
                    styles.sizeOption,
                    deviceSize === size && styles.sizeOptionActive,
                  ]}
                  onPress={() => {
                    setDeviceSize(size);
                    setShowSelector(false);
                  }}
                >
                  <Text
                    style={[
                      styles.sizeOptionText,
                      deviceSize === size && styles.sizeOptionTextActive,
                    ]}
                  >
                    {DEVICE_SIZES[size].label}
                  </Text>
                  <Text style={styles.sizeOptionSubtext}>
                    {DEVICE_SIZES[size].width} × {DEVICE_SIZES[size].height}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          )}
        </View>
      )}

      {/* Mobile Viewport Container */}
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        style={styles.scrollContainer}
      >
        <View
          style={[
            styles.mobileViewport,
            {
              width: device.width,
              minHeight: device.height,
            },
          ]}
        >
          <PortalProvider>
            {children}
          </PortalProvider>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  outerContainer: {
    flex: 1,
    backgroundColor: '#e0e0e0',
  },
  devToolbar: {
    backgroundColor: '#ffffff',
    borderBottomWidth: 1,
    borderBottomColor: '#ddd',
    paddingVertical: 8,
    paddingHorizontal: 16,
    alignItems: 'center',
    zIndex: 1000,
  },
  selectorButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 6,
    backgroundColor: '#f5f5f5',
  },
  selectorButtonText: {
    fontSize: 13,
    color: '#333',
    fontWeight: '500',
  },
  selectorDropdown: {
    position: 'absolute',
    top: 42,
    backgroundColor: '#ffffff',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#ddd',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
    minWidth: 200,
    zIndex: 1001,
  },
  sizeOption: {
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  sizeOptionActive: {
    backgroundColor: '#E8EAF6',
  },
  sizeOptionText: {
    fontSize: 14,
    color: '#333',
    fontWeight: '500',
    marginBottom: 2,
  },
  sizeOptionTextActive: {
    color: '#1A237E',
    fontWeight: '600',
  },
  sizeOptionSubtext: {
    fontSize: 12,
    color: '#999',
  },
  scrollContainer: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    justifyContent: 'flex-start',
    alignItems: 'center',
    paddingVertical: 20,
  },
  mobileViewport: {
    backgroundColor: '#ffffff',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 8,
    overflow: 'hidden',
    position: 'relative', // Create positioning context for absolute children
  },
});
