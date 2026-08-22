/**
 * Screen Component
 * Base screen wrapper with safe area and keyboard handling
 */

import React from 'react';
import {
  View,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  ViewStyle,
  StyleSheet,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTheme } from '../../hooks';

export interface ScreenProps {
  children: React.ReactNode;
  scrollable?: boolean;
  keyboardAware?: boolean;
  padding?: keyof typeof import('../../theme').spacing;
  style?: ViewStyle;
  contentContainerStyle?: ViewStyle;
}

export const Screen: React.FC<ScreenProps> = ({
  children,
  scrollable = false,
  keyboardAware = true,
  padding = 0,
  style,
  contentContainerStyle,
}) => {
  const theme = useTheme();

  const baseStyle: ViewStyle = {
    flex: 1,
    backgroundColor: theme.colors.background.primary,
  };

  const paddingStyle: ViewStyle = padding
    ? { padding: theme.spacing[padding] }
    : {};

  const content = scrollable ? (
    <ScrollView
      style={[styles.scrollView]}
      contentContainerStyle={[paddingStyle, contentContainerStyle]}
      keyboardShouldPersistTaps="handled"
      showsVerticalScrollIndicator={true}
    >
      {children}
    </ScrollView>
  ) : (
    <View style={[styles.content, paddingStyle, contentContainerStyle]}>
      {children}
    </View>
  );

  if (keyboardAware) {
    return (
      <SafeAreaView style={[baseStyle, style]} edges={['top', 'left', 'right']}>
        <KeyboardAvoidingView
          style={styles.keyboardView}
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 20}
        >
          {content}
        </KeyboardAvoidingView>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={[baseStyle, style]} edges={['top', 'left', 'right']}>
      {content}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  scrollView: {
    flex: 1,
  },
  content: {
    flex: 1,
  },
  keyboardView: {
    flex: 1,
  },
});
