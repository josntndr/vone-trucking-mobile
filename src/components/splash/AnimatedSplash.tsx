/**
 * Animated Splash Screen - Vone Trucking
 * Smooth, high-fidelity introduction using the login page emblem and brand identity:
 * - Ambient night highway with illuminated speed lines and telemetry radar waves
 * - Animated vector truck driving in smoothly with headlights & rotating wheels
 * - Iconic Login Page Emblem (`#0A1220` rounded container with `#0EA5E9` `truck-fast` icon)
 * - Exact "VONE TRUCKING" brand typography & "Fleet & Logistics Operations" status pill
 * - Real-time telemetry diagnostics and smooth progress bar
 * - Seamless handoff to LoginScreen with instant skip support
 */

import React, { useEffect, useRef, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Animated,
  Easing,
  Dimensions,
  TouchableOpacity,
  StatusBar,
  Platform,
} from 'react-native';
import { MaterialCommunityIcons, Ionicons, FontAwesome5 } from '@expo/vector-icons';
import Svg, {
  Defs,
  LinearGradient as SvgLinearGradient,
  RadialGradient as SvgRadialGradient,
  Stop,
  Rect,
  Circle,
  Path,
  Polygon,
  Line,
} from 'react-native-svg';

interface AnimatedSplashProps {
  onComplete: () => void;
}

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

export default function AnimatedSplash({ onComplete }: AnimatedSplashProps) {
  const isFinishedRef = useRef(false);

  // ==================== ANIMATION VALUES ====================
  // 1. Scene & Environment
  const sceneFadeAnim = useRef(new Animated.Value(0)).current;
  const radarPulseAnim = useRef(new Animated.Value(0)).current;
  const roadDashAnim = useRef(new Animated.Value(0)).current;
  const particlesAnim = useRef(new Animated.Value(0)).current;

  // 2. Truck Motion
  const truckDriveInAnim = useRef(new Animated.Value(0)).current; // 0 = left, 1 = center
  const truckBounceAnim = useRef(new Animated.Value(0)).current; // gentle suspension
  const wheelRotateAnim = useRef(new Animated.Value(0)).current; // rolling tires
  const headlightBeamAnim = useRef(new Animated.Value(0)).current; // headlight illumination

  // 3. Telemetry & Progress
  const hudFadeAnim = useRef(new Animated.Value(0)).current;
  const hudSlideAnim = useRef(new Animated.Value(15)).current;
  const [odometerValue, setOdometerValue] = useState(0);
  const [telemetryPhase, setTelemetryPhase] = useState(0); // 0: Power, 1: GPS, 2: Fleet 100%

  // 4. Login Page Emblem & Brand Reveal
  const emblemScaleAnim = useRef(new Animated.Value(0.7)).current;
  const emblemFadeAnim = useRef(new Animated.Value(0)).current;
  const emblemGlowAnim = useRef(new Animated.Value(0)).current;
  const brandTitleFadeAnim = useRef(new Animated.Value(0)).current;
  const brandTitleSlideAnim = useRef(new Animated.Value(12)).current;
  const statusPillFadeAnim = useRef(new Animated.Value(0)).current;
  const progressBarAnim = useRef(new Animated.Value(0)).current;
  const exitFadeAnim = useRef(new Animated.Value(1)).current;
  const exitScaleAnim = useRef(new Animated.Value(1)).current;

  const handleFinish = () => {
    if (isFinishedRef.current) return;
    isFinishedRef.current = true;

    // Smooth exit transition into Login
    Animated.parallel([
      Animated.timing(exitFadeAnim, {
        toValue: 0,
        duration: 320,
        easing: Easing.in(Easing.cubic),
        useNativeDriver: true,
      }),
      Animated.timing(exitScaleAnim, {
        toValue: 1.05,
        duration: 320,
        easing: Easing.out(Easing.cubic),
        useNativeDriver: true,
      }),
    ]).start(() => {
      onComplete();
    });
  };

  useEffect(() => {
    // ----------------------------------------------------
    // Continuous loops for environment dynamics
    // ----------------------------------------------------
    const roadLoop = Animated.loop(
      Animated.timing(roadDashAnim, {
        toValue: 1,
        duration: 500,
        easing: Easing.linear,
        useNativeDriver: true,
      })
    );
    roadLoop.start();

    const particlesLoop = Animated.loop(
      Animated.timing(particlesAnim, {
        toValue: 1,
        duration: 1400,
        easing: Easing.linear,
        useNativeDriver: true,
      })
    );
    particlesLoop.start();

    const radarLoop = Animated.loop(
      Animated.sequence([
        Animated.timing(radarPulseAnim, {
          toValue: 1,
          duration: 2000,
          easing: Easing.out(Easing.quad),
          useNativeDriver: true,
        }),
        Animated.timing(radarPulseAnim, {
          toValue: 0,
          duration: 0,
          useNativeDriver: true,
        }),
      ])
    );
    radarLoop.start();

    const wheelLoop = Animated.loop(
      Animated.timing(wheelRotateAnim, {
        toValue: 1,
        duration: 320,
        easing: Easing.linear,
        useNativeDriver: true,
      })
    );
    wheelLoop.start();

    const bounceLoop = Animated.loop(
      Animated.sequence([
        Animated.timing(truckBounceAnim, {
          toValue: -2,
          duration: 140,
          easing: Easing.inOut(Easing.quad),
          useNativeDriver: true,
        }),
        Animated.timing(truckBounceAnim, {
          toValue: 1.5,
          duration: 160,
          easing: Easing.inOut(Easing.quad),
          useNativeDriver: true,
        }),
        Animated.timing(truckBounceAnim, {
          toValue: 0,
          duration: 120,
          easing: Easing.inOut(Easing.quad),
          useNativeDriver: true,
        }),
      ])
    );
    bounceLoop.start();

    // ----------------------------------------------------
    // Storyboard Sequence
    // ----------------------------------------------------
    // 1. Scene Fade In (0ms)
    Animated.timing(sceneFadeAnim, {
      toValue: 1,
      duration: 350,
      useNativeDriver: true,
    }).start();

    // 2. Headlight & Drive In (100ms - 800ms)
    Animated.parallel([
      Animated.timing(headlightBeamAnim, {
        toValue: 1,
        duration: 500,
        delay: 100,
        useNativeDriver: true,
      }),
      Animated.spring(truckDriveInAnim, {
        toValue: 1,
        tension: 65,
        friction: 8,
        useNativeDriver: true,
      }),
    ]).start();

    // 3. Telemetry HUD pop in (600ms - 1200ms)
    Animated.parallel([
      Animated.timing(hudFadeAnim, {
        toValue: 1,
        duration: 400,
        delay: 600,
        useNativeDriver: true,
      }),
      Animated.spring(hudSlideAnim, {
        toValue: 0,
        tension: 80,
        friction: 8,
        delay: 600,
        useNativeDriver: true,
      }),
    ]).start();

    // Odometer & diagnostic phases
    const odoInterval = setInterval(() => {
      setOdometerValue((prev) => {
        if (prev >= 100) {
          clearInterval(odoInterval);
          return 100;
        }
        return prev + Math.floor(Math.random() * 15 + 8);
      });
    }, 85);

    const stepTimer1 = setTimeout(() => setTelemetryPhase(1), 650);
    const stepTimer2 = setTimeout(() => setTelemetryPhase(2), 1100);

    // 4. Login Emblem & Brand Title Reveal (1000ms - 1800ms)
    Animated.parallel([
      Animated.spring(emblemScaleAnim, {
        toValue: 1,
        tension: 70,
        friction: 6,
        delay: 950,
        useNativeDriver: true,
      }),
      Animated.timing(emblemFadeAnim, {
        toValue: 1,
        duration: 400,
        delay: 950,
        useNativeDriver: true,
      }),
      Animated.timing(emblemGlowAnim, {
        toValue: 1,
        duration: 500,
        delay: 1100,
        useNativeDriver: true,
      }),
      Animated.timing(brandTitleFadeAnim, {
        toValue: 1,
        duration: 450,
        delay: 1150,
        useNativeDriver: true,
      }),
      Animated.spring(brandTitleSlideAnim, {
        toValue: 0,
        tension: 90,
        friction: 8,
        delay: 1150,
        useNativeDriver: true,
      }),
      Animated.timing(statusPillFadeAnim, {
        toValue: 1,
        duration: 450,
        delay: 1300,
        useNativeDriver: true,
      }),
      Animated.timing(progressBarAnim, {
        toValue: 1,
        duration: 1700,
        delay: 350,
        easing: Easing.out(Easing.cubic),
        useNativeDriver: false,
      }),
    ]).start();

    // Auto complete
    const masterTimer = setTimeout(() => {
      handleFinish();
    }, 2700);

    return () => {
      roadLoop.stop();
      particlesLoop.stop();
      radarLoop.stop();
      wheelLoop.stop();
      bounceLoop.stop();
      clearInterval(odoInterval);
      clearTimeout(stepTimer1);
      clearTimeout(stepTimer2);
      clearTimeout(masterTimer);
    };
  }, []);

  // Interpolations
  const truckTranslateX = truckDriveInAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [-SCREEN_WIDTH * 0.85, 0],
  });

  const truckScale = truckDriveInAnim.interpolate({
    inputRange: [0, 0.7, 1],
    outputRange: [0.8, 1.04, 1],
  });

  const wheelRotationDeg = wheelRotateAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '360deg'],
  });

  const roadDashesTranslate = roadDashAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [0, -60],
  });

  const particleTranslateX = particlesAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [SCREEN_WIDTH * 0.5, -SCREEN_WIDTH * 0.5],
  });

  const radarScale = radarPulseAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [0.5, 2.2],
  });

  const radarOpacity = radarPulseAnim.interpolate({
    inputRange: [0, 0.3, 1],
    outputRange: [0.7, 0.35, 0],
  });

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#0B1120" translucent />

      {/* Main Animated Scene Wrapper */}
      <Animated.View
        style={[
          styles.mainScene,
          {
            opacity: Animated.multiply(sceneFadeAnim, exitFadeAnim),
            transform: [{ scale: exitScaleAnim }],
          },
        ]}
      >
        {/* ================= BACKGROUND TECH GRID & RADAR ================= */}
        <View style={StyleSheet.absoluteFill} pointerEvents="none">
          <Svg height={SCREEN_HEIGHT} width={SCREEN_WIDTH} style={StyleSheet.absoluteFill}>
            <Defs>
              <SvgRadialGradient id="bgGrad" cx="50%" cy="40%" r="65%">
                <Stop offset="0%" stopColor="#111C33" stopOpacity="0.8" />
                <Stop offset="55%" stopColor="#0B1120" stopOpacity="0.95" />
                <Stop offset="100%" stopColor="#060A14" stopOpacity="1" />
              </SvgRadialGradient>
              <SvgLinearGradient id="beamGrad" x1="0%" y1="0%" x2="100%" y2="0%">
                <Stop offset="0%" stopColor="#38BDF8" stopOpacity="0.5" />
                <Stop offset="45%" stopColor="#0EA5E9" stopOpacity="0.2" />
                <Stop offset="100%" stopColor="#0EA5E9" stopOpacity="0" />
              </SvgLinearGradient>
            </Defs>
            <Rect x="0" y="0" width={SCREEN_WIDTH} height={SCREEN_HEIGHT} fill="url(#bgGrad)" />

            {/* Subtle Horizon / Grid lines */}
            {[0.25, 0.35, 0.45, 0.55, 0.65].map((yRatio, idx) => (
              <Line
                key={`grid-h-${idx}`}
                x1="0"
                y1={SCREEN_HEIGHT * yRatio}
                x2={SCREEN_WIDTH}
                y2={SCREEN_HEIGHT * yRatio}
                stroke="#1E3A8A"
                strokeOpacity={0.1 + idx * 0.03}
                strokeWidth={1}
                strokeDasharray="4 6"
              />
            ))}
          </Svg>

          {/* Glowing Sonar / Radar Waves */}
          <View style={styles.radarCenterAnchor}>
            <Animated.View
              style={[
                styles.radarRing,
                {
                  transform: [{ scale: radarScale }],
                  opacity: radarOpacity,
                },
              ]}
            />
          </View>

          {/* Ambient Speed Particles */}
          <Animated.View
            style={[
              styles.particleField,
              {
                transform: [{ translateX: particleTranslateX }],
              },
            ]}
          >
            <View style={[styles.speedStar, { top: 100, left: 60, width: 30 }]} />
            <View style={[styles.speedStar, { top: 200, left: 220, width: 45, opacity: 0.8 }]} />
            <View style={[styles.speedStar, { top: 320, left: 100, width: 25, opacity: 0.5 }]} />
            <View style={[styles.speedStar, { top: 480, left: 260, width: 40, opacity: 0.7 }]} />
          </Animated.View>
        </View>

        {/* ================= TOP HUD BADGE ================= */}
        <Animated.View
          style={[
            styles.topHudContainer,
            {
              opacity: hudFadeAnim,
              transform: [{ translateY: hudSlideAnim }],
            },
          ]}
        >
          <View style={styles.topHudPill}>
            <View style={styles.liveBeaconDot} />
            <Text style={styles.topHudPillText}>FLEET OPERATIONS OS • ONLINE</Text>
          </View>
        </Animated.View>

        {/* ================= CENTER STAGE: EXACT LOGIN LOGO & BRAND ================= */}
        <View style={styles.centerStage}>
          {/* Exact Login Page Emblem Container */}
          <Animated.View
            style={[
              styles.emblemContainerWrapper,
              {
                opacity: emblemFadeAnim,
                transform: [{ scale: emblemScaleAnim }],
              },
            ]}
          >
            {/* Ambient Glow */}
            <Animated.View
              style={[
                styles.emblemGlowBackdrop,
                {
                  opacity: emblemGlowAnim,
                },
              ]}
            />

            {/* Exact Login Emblem */}
            <View style={styles.emblemContainer}>
              <MaterialCommunityIcons
                name="truck-fast"
                size={46}
                color="#0EA5E9"
              />
            </View>
          </Animated.View>

          {/* Brand Title: VONE TRUCKING */}
          <Animated.View
            style={[
              styles.brandTitleContainer,
              {
                opacity: brandTitleFadeAnim,
                transform: [{ translateY: brandTitleSlideAnim }],
              },
            ]}
          >
            <Text style={styles.brandTitle}>VONE TRUCKING</Text>

            {/* Exact Login Page Status Pill */}
            <Animated.View
              style={[
                styles.statusPill,
                {
                  opacity: statusPillFadeAnim,
                },
              ]}
            >
              <View style={styles.statusLiveDot} />
              <Text style={styles.statusText}>Fleet & Logistics Operations</Text>
            </Animated.View>
          </Animated.View>

          {/* ================= ANIMATED TRUCK RIG ================= */}
          <Animated.View
            style={[
              styles.truckRigContainer,
              {
                transform: [
                  { translateX: truckTranslateX },
                  { scale: truckScale },
                  { translateY: truckBounceAnim },
                ],
              },
            ]}
          >
            {/* Headlight Beam */}
            <Animated.View
              style={[
                styles.headlightBeamWrapper,
                {
                  opacity: headlightBeamAnim,
                },
              ]}
            >
              <Svg width={160} height={80} viewBox="0 0 160 80">
                <Polygon points="0,30 160,0 160,80 0,50" fill="url(#beamGrad)" />
              </Svg>
            </Animated.View>

            {/* Vector Truck */}
            <View style={styles.truckBody}>
              <Svg width={160} height={64} viewBox="0 0 160 64">
                <Defs>
                  <SvgLinearGradient id="cabGrad" x1="0%" y1="0%" x2="100%" y2="0%">
                    <Stop offset="0%" stopColor="#0284C7" />
                    <Stop offset="100%" stopColor="#0EA5E9" />
                  </SvgLinearGradient>
                  <SvgLinearGradient id="trailerGrad" x1="0%" y1="0%" x2="0%" y2="100%">
                    <Stop offset="0%" stopColor="#1E293B" />
                    <Stop offset="100%" stopColor="#0F172A" />
                  </SvgLinearGradient>
                </Defs>

                {/* Cargo Trailer */}
                <Rect x="6" y="8" width="88" height="40" rx="4" fill="url(#trailerGrad)" stroke="#334155" strokeWidth="1.5" />
                <Line x1="28" y1="10" x2="28" y2="48" stroke="#475569" strokeWidth="1" strokeDasharray="3 3" />
                <Line x1="52" y1="10" x2="52" y2="48" stroke="#475569" strokeWidth="1" strokeDasharray="3 3" />
                <Line x1="74" y1="10" x2="74" y2="48" stroke="#475569" strokeWidth="1" strokeDasharray="3 3" />
                <Rect x="8" y="42" width="84" height="2.5" fill="#F59E0B" />

                {/* Truck Cabin */}
                <Path
                  d="M96 20 L120 20 L136 30 L150 33 L150 48 L96 48 Z"
                  fill="url(#cabGrad)"
                  stroke="#0369A1"
                  strokeWidth="1"
                />

                {/* Windshield */}
                <Polygon points="118,22 133,30 118,30" fill="#E0F2FE" opacity="0.9" />

                {/* Bumper */}
                <Rect x="146" y="36" width="5" height="11" rx="1" fill="#CBD5E1" />
                {/* Headlight lamp */}
                <Circle cx="149" cy="38" r="2.5" fill="#FEF08A" />
              </Svg>

              {/* Animated Wheels */}
              <View style={[styles.wheelContainer, { left: 18 }]}>
                <Animated.View style={{ transform: [{ rotate: wheelRotationDeg }] }}>
                  <MaterialCommunityIcons name="tire" size={22} color="#0F172A" />
                </Animated.View>
                <View style={styles.wheelHub} />
              </View>

              <View style={[styles.wheelContainer, { left: 48 }]}>
                <Animated.View style={{ transform: [{ rotate: wheelRotationDeg }] }}>
                  <MaterialCommunityIcons name="tire" size={22} color="#0F172A" />
                </Animated.View>
                <View style={styles.wheelHub} />
              </View>

              <View style={[styles.wheelContainer, { left: 120 }]}>
                <Animated.View style={{ transform: [{ rotate: wheelRotationDeg }] }}>
                  <MaterialCommunityIcons name="tire" size={22} color="#0F172A" />
                </Animated.View>
                <View style={styles.wheelHub} />
              </View>
            </View>
          </Animated.View>

          {/* ================= HIGHWAY ROAD ================= */}
          <View style={styles.roadPerspectiveContainer}>
            <View style={styles.roadGlowLine} />
            <View style={styles.asphaltSurface}>
              <Animated.View
                style={[
                  styles.dashedStripesRow,
                  {
                    transform: [{ translateX: roadDashesTranslate }],
                  },
                ]}
              >
                {Array.from({ length: 14 }).map((_, i) => (
                  <View key={`dash-${i}`} style={styles.roadDash} />
                ))}
              </Animated.View>
            </View>
            <View style={styles.roadGlowLine} />
          </View>
        </View>

        {/* ================= BOTTOM HUD & PROGRESS ================= */}
        <Animated.View
          style={[
            styles.bottomHudSection,
            {
              opacity: hudFadeAnim,
            },
          ]}
        >
          {/* Diagnostics Tiles */}
          <View style={styles.diagnosticsRow}>
            <View style={[styles.diagTile, telemetryPhase >= 0 && styles.diagTileActive]}>
              <FontAwesome5 name="bolt" size={12} color={telemetryPhase >= 0 ? '#38BDF8' : '#64748B'} />
              <Text style={styles.diagLabel}>POWER</Text>
              <Text style={styles.diagValue}>100%</Text>
            </View>

            <View style={[styles.diagTile, telemetryPhase >= 1 && styles.diagTileActive]}>
              <Ionicons name="navigate" size={12} color={telemetryPhase >= 1 ? '#10B981' : '#64748B'} />
              <Text style={styles.diagLabel}>GPS</Text>
              <Text style={[styles.diagValue, { color: '#10B981' }]}>
                {telemetryPhase >= 1 ? 'LOCKED' : 'SYNC'}
              </Text>
            </View>

            <View style={[styles.diagTile, telemetryPhase >= 2 && styles.diagTileActive]}>
              <MaterialCommunityIcons
                name="signal-cellular-3"
                size={14}
                color={telemetryPhase >= 2 ? '#F59E0B' : '#64748B'}
              />
              <Text style={styles.diagLabel}>FLEET</Text>
              <Text style={[styles.diagValue, { color: '#F59E0B' }]}>READY</Text>
            </View>
          </View>

          {/* Progress Bar */}
          <View style={styles.progressContainer}>
            <View style={styles.progressBarTrack}>
              <Animated.View
                style={[
                  styles.progressBarFill,
                  {
                    width: progressBarAnim.interpolate({
                      inputRange: [0, 1],
                      outputRange: ['0%', '100%'],
                    }),
                  },
                ]}
              />
            </View>
            <View style={styles.progressInfoRow}>
              <Text style={styles.progressStatusText}>
                {odometerValue < 50
                  ? 'CONNECTING TO FLEET NETWORK...'
                  : odometerValue < 90
                  ? 'SYNCHRONIZING TELEMETRY...'
                  : 'READY. ENTERING WORKSPACE...'}
              </Text>
              <Text style={styles.progressPercentText}>{Math.min(odometerValue, 100)}%</Text>
            </View>
          </View>

          {/* Interactive Fast Forward */}
          <TouchableOpacity
            style={styles.skipButton}
            onPress={handleFinish}
            activeOpacity={0.7}
          >
            <Text style={styles.skipButtonText}>TAP TO CONTINUE</Text>
            <Ionicons name="chevron-forward" size={13} color="#94A3B8" />
          </TouchableOpacity>
        </Animated.View>
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0B1120',
    justifyContent: 'center',
    alignItems: 'center',
  },
  mainScene: {
    flex: 1,
    width: '100%',
    height: '100%',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: Platform.OS === 'ios' ? 56 : 40,
    paddingHorizontal: 20,
  },

  /* Radar & Ambient Elements */
  radarCenterAnchor: {
    position: 'absolute',
    top: '36%',
    left: '50%',
    marginLeft: -90,
    marginTop: -90,
    width: 180,
    height: 180,
    justifyContent: 'center',
    alignItems: 'center',
  },
  radarRing: {
    position: 'absolute',
    width: 160,
    height: 160,
    borderRadius: 80,
    borderWidth: 1.5,
    borderColor: '#0EA5E9',
    backgroundColor: 'rgba(14, 165, 233, 0.04)',
  },
  particleField: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
  speedStar: {
    position: 'absolute',
    height: 2,
    backgroundColor: '#38BDF8',
    borderRadius: 1,
  },

  /* Top HUD Badge */
  topHudContainer: {
    width: '100%',
    alignItems: 'center',
    marginTop: 8,
  },
  topHudPill: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(15, 23, 42, 0.85)',
    borderWidth: 1,
    borderColor: 'rgba(56, 189, 248, 0.3)',
    borderRadius: 20,
    paddingHorizontal: 12,
    paddingVertical: 5,
  },
  liveBeaconDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#10B981',
    marginRight: 6,
  },
  topHudPillText: {
    color: '#CBD5E1',
    fontSize: 10,
    fontWeight: '700',
    letterSpacing: 1,
  },

  /* Center Stage */
  centerStage: {
    alignItems: 'center',
    justifyContent: 'center',
    width: '100%',
    marginVertical: 'auto',
  },
  emblemContainerWrapper: {
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
  },
  emblemGlowBackdrop: {
    position: 'absolute',
    width: 100,
    height: 100,
    borderRadius: 30,
    backgroundColor: 'rgba(14, 165, 233, 0.25)',
    shadowColor: '#0EA5E9',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.8,
    shadowRadius: 20,
  },
  /* Exact Login Page Emblem */
  emblemContainer: {
    width: 80,
    height: 80,
    backgroundColor: '#0A1220',
    borderWidth: 1.5,
    borderColor: 'rgba(14, 165, 233, 0.4)',
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 8,
    elevation: 4,
  },

  /* Exact Login Brand Title */
  brandTitleContainer: {
    alignItems: 'center',
    marginBottom: 14,
  },
  brandTitle: {
    fontSize: 26,
    fontWeight: '900',
    color: '#FFFFFF',
    letterSpacing: 2,
    marginBottom: 8,
  },
  /* Exact Login Status Pill */
  statusPill: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.12)',
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 20,
  },
  statusLiveDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#10B981',
    marginRight: 6,
  },
  statusText: {
    fontSize: 12,
    fontWeight: '500',
    color: '#94A3B8',
    letterSpacing: 0.2,
  },

  /* Truck Rig & Road */
  truckRigContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 10,
    position: 'relative',
    height: 70,
    width: 240,
  },
  truckBody: {
    position: 'relative',
    width: 160,
    height: 64,
    alignItems: 'center',
  },
  wheelContainer: {
    position: 'absolute',
    bottom: 2,
    width: 22,
    height: 22,
    justifyContent: 'center',
    alignItems: 'center',
  },
  wheelHub: {
    position: 'absolute',
    width: 7,
    height: 7,
    borderRadius: 3.5,
    backgroundColor: '#94A3B8',
  },
  headlightBeamWrapper: {
    position: 'absolute',
    left: 175,
    top: 6,
  },

  /* Highway Road */
  roadPerspectiveContainer: {
    width: SCREEN_WIDTH * 0.88,
    alignItems: 'center',
    marginTop: 8,
  },
  asphaltSurface: {
    width: '100%',
    height: 22,
    backgroundColor: '#0F172A',
    borderRadius: 4,
    overflow: 'hidden',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#1E293B',
  },
  roadGlowLine: {
    width: '100%',
    height: 1.5,
    backgroundColor: '#0EA5E9',
    opacity: 0.6,
  },
  dashedStripesRow: {
    flexDirection: 'row',
    width: SCREEN_WIDTH * 1.6,
  },
  roadDash: {
    width: 24,
    height: 2.5,
    backgroundColor: '#F59E0B',
    marginRight: 20,
    borderRadius: 1,
  },

  /* Bottom Telemetry HUD */
  bottomHudSection: {
    width: '100%',
    alignItems: 'center',
    marginBottom: 6,
  },
  diagnosticsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
    marginBottom: 14,
    gap: 8,
  },
  diagTile: {
    flex: 1,
    backgroundColor: 'rgba(15, 23, 42, 0.65)',
    borderWidth: 1,
    borderColor: '#1E293B',
    borderRadius: 12,
    paddingVertical: 8,
    paddingHorizontal: 6,
    alignItems: 'center',
  },
  diagTileActive: {
    borderColor: 'rgba(14, 165, 233, 0.35)',
    backgroundColor: 'rgba(15, 23, 42, 0.9)',
  },
  diagLabel: {
    color: '#64748B',
    fontSize: 9,
    fontWeight: '800',
    letterSpacing: 0.6,
    marginTop: 3,
  },
  diagValue: {
    color: '#F8FAFC',
    fontSize: 11,
    fontWeight: '800',
    marginTop: 2,
  },

  /* Progress Bar */
  progressContainer: {
    width: '100%',
    marginBottom: 12,
  },
  progressBarTrack: {
    width: '100%',
    height: 5,
    backgroundColor: '#1E293B',
    borderRadius: 2.5,
    overflow: 'hidden',
  },
  progressBarFill: {
    height: '100%',
    backgroundColor: '#0EA5E9',
    borderRadius: 2.5,
  },
  progressInfoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 5,
  },
  progressStatusText: {
    color: '#64748B',
    fontSize: 10,
    fontWeight: '600',
    letterSpacing: 0.4,
  },
  progressPercentText: {
    color: '#38BDF8',
    fontSize: 10,
    fontWeight: '800',
  },

  /* Skip Button */
  skipButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 4,
    paddingHorizontal: 10,
  },
  skipButtonText: {
    color: '#64748B',
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 0.8,
    marginRight: 4,
  },
});
