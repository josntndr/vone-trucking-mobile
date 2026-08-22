/**
 * Application Entry Coordinator
 * Manages splash → onboarding → welcome → auth flow
 */

import React, { useState, useEffect } from 'react';
import { View } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import AnimatedSplash from '../src/components/splash/AnimatedSplash';
import OnboardingScreens from '../src/components/onboarding/OnboardingScreens';
import WelcomeScreen from '../src/components/welcome/WelcomeScreen';
import { useRouter } from 'expo-router';

const ONBOARDING_KEY = '@vone_trucking_onboarding_completed';

type AppState = 'splash' | 'onboarding' | 'welcome';

export default function EntryScreen() {
  const router = useRouter();
  const [appState, setAppState] = useState<AppState>('splash');

  useEffect(() => {
    // Check if onboarding was completed
    checkOnboardingStatus();
  }, []);

  const checkOnboardingStatus = async () => {
    try {
      const completed = await AsyncStorage.getItem(ONBOARDING_KEY);
      // Will be set after splash completes
    } catch (error) {
      console.error('Error checking onboarding status:', error);
    }
  };

  const handleSplashComplete = async () => {
    try {
      const completed = await AsyncStorage.getItem(ONBOARDING_KEY);
      if (completed === 'true') {
        setAppState('welcome');
      } else {
        setAppState('onboarding');
      }
    } catch (error) {
      // If error, show onboarding to be safe
      setAppState('onboarding');
    }
  };

  const handleOnboardingComplete = async () => {
    try {
      await AsyncStorage.setItem(ONBOARDING_KEY, 'true');
      setAppState('welcome');
    } catch (error) {
      console.error('Error saving onboarding status:', error);
      setAppState('welcome');
    }
  };

  const handleOnboardingSkip = async () => {
    try {
      await AsyncStorage.setItem(ONBOARDING_KEY, 'true');
      setAppState('welcome');
    } catch (error) {
      console.error('Error saving onboarding status:', error);
      setAppState('welcome');
    }
  };

  const handleLogin = () => {
    router.push('/(auth)/login');
  };

  const handleRegister = () => {
    router.push('/(auth)/register');
  };

  if (appState === 'splash') {
    return <AnimatedSplash onComplete={handleSplashComplete} />;
  }

  if (appState === 'onboarding') {
    return (
      <OnboardingScreens
        onComplete={handleOnboardingComplete}
        onSkip={handleOnboardingSkip}
      />
    );
  }

  return (
    <WelcomeScreen
      onLogin={handleLogin}
      onRegister={handleRegister}
    />
  );
}
