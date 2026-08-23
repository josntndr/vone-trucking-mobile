/**
 * Application Entry Coordinator
 * Private login-only system for Vone Trucking
 * Flow: splash → MANDATORY login → dashboard
 * Security: All users must authenticate on every app launch
 */

import React, { useState } from 'react';
import AnimatedSplash from '../src/components/splash/AnimatedSplash';
import { useRouter } from 'expo-router';
import { demoSignOut } from '../src/services/demo/demoAuth.service';

export default function EntryScreen() {
  const router = useRouter();
  const [checkingAuth, setCheckingAuth] = useState(true);

  const handleSplashComplete = async () => {
    // Force login on every app launch
    // This ensures all users must authenticate before entering the application
    
    // Clear any existing session
    await demoSignOut();
    
    setCheckingAuth(false);
    router.replace('/(auth)/login');
  };

  return <AnimatedSplash onComplete={handleSplashComplete} />;
}
