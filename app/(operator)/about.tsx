/**
 * About Screen
 * Displays app information, version, and company details
 */

import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Linking,
  Image,
} from 'react-native';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import Constants from 'expo-constants';
import { Screen } from '../../src/components';
import { useThemeContext } from '../../src/contexts/ThemeContext';

export default function AboutScreen() {
  const { colors, spacing, fontSizes, fontWeights, borderRadius } = useThemeContext();

  // Get version info from app config
  const appVersion = Constants.expoConfig?.version || '1.0.0';
  const nativeAppVersion = Constants.nativeAppVersion || appVersion;
  const nativeBuildVersion = Constants.nativeBuildVersion || 'N/A';

  const handleSupportContact = async () => {
    const email = 'support@vonetrucking.com';
    const subject = 'Vone Trucking Support Request';
    const url = `mailto:${email}?subject=${encodeURIComponent(subject)}`;

    try {
      const canOpen = await Linking.canOpenURL(url);
      if (canOpen) {
        await Linking.openURL(url);
      }
    } catch (error) {
      console.error('Failed to open email:', error);
    }
  };

  const infoItems = [
    {
      label: 'Version',
      value: appVersion,
      icon: 'information-circle-outline',
    },
    {
      label: 'Build Number',
      value: nativeBuildVersion,
      icon: 'code-outline',
    },
    {
      label: 'Platform',
      value: Constants.platform?.ios
        ? 'iOS'
        : Constants.platform?.android
        ? 'Android'
        : 'Web',
      icon: 'phone-portrait-outline',
    },
  ];

  return (
    <Screen style={{ backgroundColor: colors.background }}>
      <ScrollView
        style={styles.container}
        contentContainerStyle={{ paddingBottom: spacing[8] }}
        showsVerticalScrollIndicator={false}
      >
        {/* Header */}
        <View
          style={[
            styles.header,
            {
              paddingHorizontal: spacing[4],
              paddingTop: spacing[4],
              paddingBottom: spacing[5],
            },
          ]}
        >
          <TouchableOpacity
            onPress={() => router.back()}
            style={[
              styles.backButton,
              {
                width: 44,
                height: 44,
                borderRadius: 22,
                backgroundColor: colors.surface,
                marginBottom: spacing[4],
              },
            ]}
            accessibilityRole="button"
            accessibilityLabel="Go back"
            accessibilityHint="Returns to More screen"
          >
            <Ionicons name="arrow-back" size={24} color={colors.text} />
          </TouchableOpacity>

          <Text
            style={[
              styles.title,
              {
                color: colors.text,
                fontSize: 28,
                fontWeight: fontWeights.bold,
                marginBottom: spacing[2],
              },
            ]}
          >
            About Vone Trucking
          </Text>
        </View>

        {/* App Logo */}
        <View
          style={[
            styles.logoContainer,
            {
              paddingHorizontal: spacing[4],
              paddingVertical: spacing[6],
              alignItems: 'center',
            },
          ]}
        >
          <View
            style={[
              styles.logo,
              {
                width: 96,
                height: 96,
                borderRadius: 24,
                backgroundColor: colors.primary,
                marginBottom: spacing[4],
                justifyContent: 'center',
                alignItems: 'center',
              },
            ]}
          >
            <Ionicons name="business" size={48} color={colors.white} />
          </View>
          <Text
            style={[
              styles.appName,
              {
                color: colors.text,
                fontSize: 24,
                fontWeight: fontWeights.bold,
                marginBottom: spacing[2],
              },
            ]}
          >
            Vone Trucking
          </Text>
          <Text
            style={[
              styles.appDescription,
              {
                color: colors.textSecondary,
                fontSize: fontSizes.base,
                textAlign: 'center',
                lineHeight: 22,
              },
            ]}
          >
            Private management system for Vone Trucking operations.
          </Text>
        </View>

        {/* Version Info */}
        <View
          style={[
            styles.section,
            {
              paddingHorizontal: spacing[4],
              marginBottom: spacing[5],
            },
          ]}
        >
          <Text
            style={[
              styles.sectionTitle,
              {
                color: colors.textSecondary,
                fontSize: fontSizes.xs,
                fontWeight: fontWeights.bold,
                textTransform: 'uppercase',
                marginBottom: spacing[3],
                marginLeft: spacing[1],
              },
            ]}
          >
            Application Information
          </Text>

          <View
            style={[
              styles.infoCard,
              {
                backgroundColor: colors.surface,
                borderRadius: borderRadius.lg,
              },
            ]}
          >
            {infoItems.map((item, index) => (
              <View
                key={index}
                style={[
                  styles.infoItem,
                  {
                    paddingVertical: spacing[3],
                    paddingHorizontal: spacing[4],
                    minHeight: 56,
                  },
                  index < infoItems.length - 1 && {
                    borderBottomWidth: 1,
                    borderBottomColor: colors.border,
                  },
                ]}
              >
                <View style={styles.infoItemContent}>
                  <View
                    style={[
                      styles.infoIcon,
                      {
                        width: 36,
                        height: 36,
                        borderRadius: 18,
                        backgroundColor: colors.primary + '10',
                        marginRight: spacing[3],
                      },
                    ]}
                  >
                    <Ionicons name={item.icon as any} size={18} color={colors.primary} />
                  </View>
                  <View style={{ flex: 1 }}>
                    <Text
                      style={[
                        styles.infoLabel,
                        {
                          color: colors.textSecondary,
                          fontSize: fontSizes.sm,
                          marginBottom: 2,
                        },
                      ]}
                    >
                      {item.label}
                    </Text>
                    <Text
                      style={[
                        styles.infoValue,
                        {
                          color: colors.text,
                          fontSize: fontSizes.base,
                          fontWeight: fontWeights.medium,
                        },
                      ]}
                    >
                      {item.value}
                    </Text>
                  </View>
                </View>
              </View>
            ))}
          </View>
        </View>

        {/* Company Info */}
        <View
          style={[
            styles.section,
            {
              paddingHorizontal: spacing[4],
              marginBottom: spacing[5],
            },
          ]}
        >
          <Text
            style={[
              styles.sectionTitle,
              {
                color: colors.textSecondary,
                fontSize: fontSizes.xs,
                fontWeight: fontWeights.bold,
                textTransform: 'uppercase',
                marginBottom: spacing[3],
                marginLeft: spacing[1],
              },
            ]}
          >
            Company
          </Text>

          <View
            style={[
              styles.companyCard,
              {
                backgroundColor: colors.surface,
                borderRadius: borderRadius.lg,
                padding: spacing[4],
              },
            ]}
          >
            <Text
              style={[
                styles.companyText,
                {
                  color: colors.text,
                  fontSize: fontSizes.base,
                  lineHeight: 22,
                  marginBottom: spacing[3],
                },
              ]}
            >
              Vone Trucking is a professional fleet management and logistics system designed
              specifically for internal operations. This application provides operators, drivers,
              and support staff with the tools needed to manage trips, trucks, employees, and
              operational workflows efficiently.
            </Text>
            <Text
              style={[
                styles.companyNote,
                {
                  color: colors.textSecondary,
                  fontSize: fontSizes.sm,
                  fontStyle: 'italic',
                },
              ]}
            >
              For authorized use by Vone Trucking employees only.
            </Text>
          </View>
        </View>

        {/* Support Contact */}
        <View
          style={[
            styles.section,
            {
              paddingHorizontal: spacing[4],
              marginBottom: spacing[5],
            },
          ]}
        >
          <Text
            style={[
              styles.sectionTitle,
              {
                color: colors.textSecondary,
                fontSize: fontSizes.xs,
                fontWeight: fontWeights.bold,
                textTransform: 'uppercase',
                marginBottom: spacing[3],
                marginLeft: spacing[1],
              },
            ]}
          >
            Support
          </Text>

          <TouchableOpacity
            style={[
              styles.supportButton,
              {
                backgroundColor: colors.surface,
                borderRadius: borderRadius.lg,
                paddingVertical: spacing[4],
                paddingHorizontal: spacing[4],
                minHeight: 64,
              },
            ]}
            onPress={handleSupportContact}
            activeOpacity={0.7}
            accessibilityRole="button"
            accessibilityLabel="Contact support"
            accessibilityHint="Opens email to support"
          >
            <View style={styles.supportContent}>
              <View
                style={[
                  styles.supportIcon,
                  {
                    width: 44,
                    height: 44,
                    borderRadius: 22,
                    backgroundColor: colors.primary + '10',
                    marginRight: spacing[3],
                  },
                ]}
              >
                <Ionicons name="mail-outline" size={22} color={colors.primary} />
              </View>
              <View style={{ flex: 1 }}>
                <Text
                  style={[
                    styles.supportLabel,
                    {
                      color: colors.text,
                      fontSize: fontSizes.base,
                      fontWeight: fontWeights.semibold,
                      marginBottom: 2,
                    },
                  ]}
                >
                  Contact Support
                </Text>
                <Text
                  style={[
                    styles.supportEmail,
                    {
                      color: colors.textSecondary,
                      fontSize: fontSizes.sm,
                    },
                  ]}
                >
                  support@vonetrucking.com
                </Text>
              </View>
              <Ionicons name="chevron-forward" size={20} color={colors.textTertiary} />
            </View>
          </TouchableOpacity>
        </View>

        {/* Copyright */}
        <View
          style={[
            styles.footer,
            {
              paddingHorizontal: spacing[4],
              paddingVertical: spacing[4],
              alignItems: 'center',
            },
          ]}
        >
          <Text
            style={[
              styles.copyright,
              {
                color: colors.textTertiary,
                fontSize: fontSizes.xs,
                textAlign: 'center',
              },
            ]}
          >
            © {new Date().getFullYear()} Vone Trucking. All rights reserved.
          </Text>
        </View>
      </ScrollView>
    </Screen>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {},
  backButton: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  title: {},
  logoContainer: {},
  logo: {},
  appName: {},
  appDescription: {},
  section: {},
  sectionTitle: {},
  infoCard: {},
  infoItem: {},
  infoItemContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  infoIcon: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  infoLabel: {},
  infoValue: {},
  companyCard: {},
  companyText: {},
  companyNote: {},
  supportButton: {},
  supportContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  supportIcon: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  supportLabel: {},
  supportEmail: {},
  footer: {},
  copyright: {},
});
