/**
 * First-Time Onboarding Screens
 * Three-screen introduction with modern design
 */

import React, { useRef, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Dimensions,
  TouchableOpacity,
  ScrollView,
  FlatList,
  ViewToken,
} from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useTheme } from '../../theme/ThemeProvider';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

interface OnboardingScreen {
  id: string;
  icon: keyof typeof MaterialCommunityIcons.glyphMap;
  headline: string;
  description: string;
}

const ONBOARDING_DATA: OnboardingScreen[] = [
  {
    id: '1',
    icon: 'truck-delivery-outline',
    headline: 'Every delivery, organised in one place.',
    description: 'Manage schedules, assignments, delivery progress, and trip records from one mobile application.',
  },
  {
    id: '2',
    icon: 'map-marker-path',
    headline: 'Stay connected to every active truck.',
    description: 'Monitor active trips, truck locations, delays, and delivery updates as they happen.',
  },
  {
    id: '3',
    icon: 'chart-line',
    headline: 'Track expenses, employees, and earnings.',
    description: 'Review fuel expenses, employee earnings, cash advances, and trip performance without relying on scattered records.',
  },
];

interface OnboardingScreensProps {
  onComplete: () => void;
  onSkip: () => void;
}

export default function OnboardingScreens({ onComplete, onSkip }: OnboardingScreensProps) {
  const { colors, fontSizes, fontWeights, lineHeights, spacing, borderRadius  } = useTheme();
  const [currentIndex, setCurrentIndex] = useState(0);
  const flatListRef = useRef<FlatList>(null);

  const handleViewableItemsChanged = useRef(
    ({ viewableItems }: { viewableItems: ViewToken[] }) => {
      if (viewableItems.length > 0) {
        setCurrentIndex(viewableItems[0].index || 0);
      }
    }
  ).current;

  const viewabilityConfig = useRef({
    itemVisiblePercentThreshold: 50,
  }).current;

  const handleNext = () => {
    if (currentIndex < ONBOARDING_DATA.length - 1) {
      flatListRef.current?.scrollToIndex({
        index: currentIndex + 1,
        animated: true,
      });
    } else {
      onComplete();
    }
  };

  const handleBack = () => {
    if (currentIndex > 0) {
      flatListRef.current?.scrollToIndex({
        index: currentIndex - 1,
        animated: true,
      });
    }
  };

  const renderItem = ({ item }: { item: OnboardingScreen }) => (
    <View style={[styles.slide, { width: SCREEN_WIDTH }]}>
      <View style={styles.content}>
        {/* Icon Container */}
        <View
          style={[
            styles.iconContainer,
            {
              backgroundColor: colors.accent + '15',
              borderRadius: borderRadius.xl,
              marginBottom: spacing[8],
            },
          ]}
        >
          <MaterialCommunityIcons 
            name={item.icon} 
            size={80} 
            color={colors.accent} 
          />
        </View>

        {/* Headline */}
        <Text
          style={[
            styles.headline,
            {
              color: colors.text,
              fontSize: fontSizes['3xl'],
              fontWeight: fontWeights.heavy,
              lineHeight: fontSizes['3xl'] * lineHeights.tight,
              marginBottom: spacing[4],
            },
          ]}
        >
          {item.headline}
        </Text>

        {/* Description */}
        <Text
          style={[
            styles.description,
            {
              color: colors.textSecondary,
              fontSize: fontSizes.lg,
              lineHeight: fontSizes.lg * lineHeights.relaxed,
            },
          ]}
        >
          {item.description}
        </Text>
      </View>
    </View>
  );

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      {/* Top Bar */}
      <View style={[styles.topBar, { paddingTop: spacing[8], paddingHorizontal: spacing[5] }]}>
        <TouchableOpacity onPress={onSkip} hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}>
          <Text
            style={[
              styles.skipText,
              {
                color: colors.textSecondary,
                fontSize: fontSizes.base,
                fontWeight: fontWeights.medium,
              },
            ]}
          >
            Skip
          </Text>
        </TouchableOpacity>
      </View>

      {/* Onboarding Screens */}
      <FlatList
        ref={flatListRef}
        data={ONBOARDING_DATA}
        renderItem={renderItem}
        keyExtractor={(item) => item.id}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        onViewableItemsChanged={handleViewableItemsChanged}
        viewabilityConfig={viewabilityConfig}
        bounces={false}
      />

      {/* Bottom Controls */}
      <View style={[styles.bottomContainer, { paddingHorizontal: spacing[5], paddingBottom: spacing[8] }]}>
        {/* Progress Indicators */}
        <View style={[styles.indicators, { marginBottom: spacing[6] }]}>
          {ONBOARDING_DATA.map((_, index) => (
            <View
              key={index}
              style={[
                styles.indicator,
                {
                  backgroundColor: index === currentIndex ? colors.primary : colors.border,
                  borderRadius: borderRadius.full,
                },
                index === currentIndex && styles.indicatorActive,
              ]}
            />
          ))}
        </View>

        {/* Navigation Buttons */}
        <View style={styles.navigationButtons}>
          {currentIndex > 0 && (
            <TouchableOpacity
              style={[
                styles.backButton,
                {
                  backgroundColor: colors.surface,
                  borderRadius: borderRadius.md,
                  paddingVertical: spacing[4],
                  paddingHorizontal: spacing[6],
                  borderWidth: 1,
                  borderColor: colors.border,
                },
              ]}
              onPress={handleBack}
            >
              <Text
                style={[
                  styles.backButtonText,
                  {
                    color: colors.text,
                    fontSize: fontSizes.base,
                    fontWeight: fontWeights.semibold,
                  },
                ]}
              >
                Back
              </Text>
            </TouchableOpacity>
          )}

          <TouchableOpacity
            style={[
              styles.nextButton,
              {
                backgroundColor: colors.primary,
                borderRadius: borderRadius.md,
                paddingVertical: spacing[4],
                paddingHorizontal: spacing[8],
              },
              currentIndex === 0 && styles.nextButtonFull,
            ]}
            onPress={handleNext}
            activeOpacity={0.8}
          >
            <Text
              style={[
                styles.nextButtonText,
                {
                  color: colors.textInverse,
                  fontSize: fontSizes.base,
                  fontWeight: fontWeights.semibold,
                },
              ]}
            >
              {currentIndex === ONBOARDING_DATA.length - 1 ? 'Get Started' : 'Continue'}
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  topBar: {
    alignItems: 'flex-end',
  },
  skipText: {},
  slide: {
    flex: 1,
    justifyContent: 'center',
  },
  content: {
    paddingHorizontal: 32,
    alignItems: 'center',
  },
  iconContainer: {
    width: 160,
    height: 160,
    justifyContent: 'center',
    alignItems: 'center',
  },
  headline: {
    textAlign: 'center',
    maxWidth: 320,
  },
  description: {
    textAlign: 'center',
    maxWidth: 300,
  },
  bottomContainer: {},
  indicators: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 8,
  },
  indicator: {
    width: 8,
    height: 8,
  },
  indicatorActive: {
    width: 32,
  },
  navigationButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 12,
  },
  backButton: {
    flex: 1,
    alignItems: 'center',
  },
  backButtonText: {},
  nextButton: {
    flex: 2,
    alignItems: 'center',
  },
  nextButtonFull: {
    flex: 1,
  },
  nextButtonText: {},
});
