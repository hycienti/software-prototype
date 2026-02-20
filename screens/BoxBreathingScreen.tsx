import React, { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Dimensions, Platform } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { Audio } from 'expo-av';
import * as Haptics from 'expo-haptics';
import Animated, {
  useAnimatedStyle,
  withTiming,
  withRepeat,
  useSharedValue,
  Easing,
  interpolate,
  Extrapolate,
} from 'react-native-reanimated';
import Svg, { Path, Defs, LinearGradient as SvgLinearGradient, Stop, Circle } from 'react-native-svg';
import { Icon } from '@/components/ui/Icon';
import { useBoxBreathingSettings } from '@/store/BoxBreathingSettingsContext';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

const BOX_SIZE = Math.min(380, SCREEN_WIDTH - 100);
const BOX_RADIUS = 32;

// Smooth, flowy easing (custom cubic)
const FLOW_EASING = Easing.bezier(0.33, 0.66, 0.33, 1);

// Orb visible size (for galaxy/wave layout): 90% of box minus padding
const ORB_SIZE = Math.round(0.9 * (BOX_SIZE - 64));

// Data-stream band path (viewBox 0 0 300 100)
const WAVE_PATH_D =
  'M 0,45 Q 37.5,30 75,45 Q 112.5,60 150,45 Q 187.5,30 225,45 Q 262.5,60 300,45 L 300,55 Q 262.5,70 225,55 Q 187.5,40 150,55 Q 112.5,70 75,55 Q 37.5,40 0,55 Z';

// Neural/node positions (percent) for AI-driven feel
const NODE_POSITIONS = [
  { cx: 22, cy: 28 },
  { cx: 72, cy: 18 },
  { cx: 85, cy: 55 },
  { cx: 38, cy: 78 },
  { cx: 58, cy: 42 },
  { cx: 12, cy: 65 },
  { cx: 90, cy: 32 },
  { cx: 45, cy: 15 },
  { cx: 50, cy: 50 },
];

// Hexagon path for HUD overlay (viewBox 0 0 100 100, centered)
const HEX_PATH = 'M 50 5 L 93 27.5 L 93 72.5 L 50 95 L 7 72.5 L 7 27.5 Z';

type BreathingPhase = 'inhale' | 'hold1' | 'exhale' | 'hold2';

export const BoxBreathingScreen: React.FC<{ onBack?: () => void; onSettings?: () => void }> = ({
  onBack,
  onSettings,
}) => {
  const { settings } = useBoxBreathingSettings();
  const [isPaused, setIsPaused] = useState(false);
  const [currentPhase, setCurrentPhase] = useState<BreathingPhase>('inhale');
  const [count, setCount] = useState(settings.inhaleDuration);
  const [cycle, setCycle] = useState(1);
  const [isMuted, setIsMuted] = useState(!settings.enableMusic);
  const totalCycles = 5;
  const [remainingTime, setRemainingTime] = useState(270);

  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const soundRef = useRef<Audio.Sound | null>(null);
  const phaseTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const countdownTimerRef = useRef<NodeJS.Timeout | null>(null);
  const isUnmountingRef = useRef(false);

  const orbScale = useSharedValue(1);
  const pathProgress = useSharedValue(0);
  const ambientPhase = useSharedValue(0);

  // Get phase durations from settings - memoized
  const getPhaseDuration = useCallback(
    (phase: BreathingPhase): number => {
      switch (phase) {
        case 'inhale':
          return settings.inhaleDuration * 1000;
        case 'hold1':
          return settings.holdDuration * 1000;
        case 'exhale':
          return settings.exhaleDuration * 1000;
        case 'hold2':
          return settings.holdDuration * 1000;
        default:
          return 4000;
      }
    },
    [settings.inhaleDuration, settings.holdDuration, settings.exhaleDuration]
  );

  // Ambient pulse for futuristic core/nodes (continuous)
  useEffect(() => {
    ambientPhase.value = withRepeat(
      withTiming(1, { duration: 4000, easing: Easing.inOut(Easing.ease) }),
      -1,
      true
    );
  }, [ambientPhase]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      isUnmountingRef.current = true;
      cleanup();
    };
  }, []);

  // Cleanup function
  const cleanup = useCallback(async () => {
    // Clear all timers
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
    if (phaseTimeoutRef.current) {
      clearTimeout(phaseTimeoutRef.current);
      phaseTimeoutRef.current = null;
    }
    if (countdownTimerRef.current) {
      clearInterval(countdownTimerRef.current);
      countdownTimerRef.current = null;
    }

    // Stop and unload audio safely
    await stopBackgroundMusic();
    
    // Stop any ongoing speech
    if (Platform.OS === 'web' && typeof window !== 'undefined' && 'speechSynthesis' in window) {
      window.speechSynthesis.cancel();
    } else {
      // Try to stop expo-speech if available
      try {
        // eslint-disable-next-line @typescript-eslint/no-require-imports
        const Speech = require('expo-speech');
        if (Speech && typeof Speech.stop === 'function') {
          Speech.stop();
        }
      } catch (error) {
        // Ignore if expo-speech is not available
      }
    }
  }, []);

  // Load and play background music
  useEffect(() => {
    if (settings.enableMusic && !isMuted) {
      loadBackgroundMusic();
    } else {
      stopBackgroundMusic();
    }
    return () => {
      stopBackgroundMusic();
    };
  }, [settings.enableMusic, settings.selectedMusic, isMuted]);

  const loadBackgroundMusic = useCallback(async () => {
    // Stop existing sound first
    await stopBackgroundMusic();

    try {
      // Set audio mode for better playback
      await Audio.setAudioModeAsync({
        playsInSilentModeIOS: true,
        staysActiveInBackground: false,
        shouldDuckAndroid: true,
      });

      // In production, use actual audio files based on selectedMusic
      // For now, using a placeholder
      const musicUrls: Record<string, string> = {
        rain: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3',
        forest: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-2.mp3',
        zen: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-3.mp3',
      };

      const { sound } = await Audio.Sound.createAsync(
        { uri: musicUrls[settings.selectedMusic] || musicUrls.rain },
        {
          shouldPlay: true,
          isLooping: true,
          volume: 0.3,
        }
      );

      soundRef.current = sound;
    } catch (error) {
      // Silently fail - don't interrupt user experience
      if (__DEV__) {
        console.warn('Error loading background music:', error);
      }
    }
  }, [settings.selectedMusic]);

  const stopBackgroundMusic = useCallback(async () => {
    if (!soundRef.current) return;

    try {
      const status = await soundRef.current.getStatusAsync();
      
      // Only stop if actually playing
      if (status.isLoaded) {
        if (status.isPlaying) {
          await soundRef.current.stopAsync();
        }
        // Wait a bit before unloading to avoid "Seeking interrupted" error
        await new Promise((resolve) => setTimeout(resolve, 100));
        await soundRef.current.unloadAsync();
      }
    } catch (error) {
      // Ignore errors during cleanup - they're usually harmless
      if (__DEV__ && !isUnmountingRef.current) {
        console.warn('Error stopping background music:', error);
      }
    } finally {
      soundRef.current = null;
    }
  }, []);

  // Haptic feedback - memoized
  const triggerHaptic = useCallback(() => {
    if (!settings.hapticFeedback) return;

    try {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    } catch (error) {
      // Silently fail - haptics not critical
      if (__DEV__) {
        console.warn('Haptic feedback error:', error);
      }
    }
  }, [settings.hapticFeedback]);

  // Voice guidance - memoized
  const speakPhase = useCallback(
    async (phase: BreathingPhase) => {
      if (!settings.voiceGuidance) return;

      const phaseText =
        phase === 'inhale'
          ? 'Breathe in'
          : phase === 'exhale'
            ? 'Breathe out'
            : phase === 'hold1'
              ? 'Hold'
              : 'Hold';

      try {
        // Use Web Speech API (works on web and can be polyfilled on native)
        if (Platform.OS === 'web' && typeof window !== 'undefined' && 'speechSynthesis' in window) {
          // Cancel any ongoing speech
          window.speechSynthesis.cancel();
          const utterance = new (window as any).SpeechSynthesisUtterance(phaseText);
          utterance.rate = 0.8;
          utterance.volume = 0.7;
          (window as any).speechSynthesis.speak(utterance);
        } else {
          // For native platforms, try to use expo-speech if available
          // Using require with try-catch to handle module resolution gracefully
          try {
            // eslint-disable-next-line @typescript-eslint/no-require-imports
            const Speech = require('expo-speech');
            if (Speech && typeof Speech.stop === 'function' && typeof Speech.speak === 'function') {
              Speech.stop(); // Stop any ongoing speech
              await Speech.speak(phaseText, {
                rate: 0.8,
                pitch: 1.0,
                volume: 0.7,
                language: 'en',
              });
            }
          } catch (speechError) {
            // expo-speech not available - voice guidance will be silent on native
            // This is acceptable as it's an optional feature
            if (__DEV__) {
              console.warn('Voice guidance not available on this platform');
            }
          }
        }
      } catch (error) {
        // Silently fail - voice guidance not critical
        if (__DEV__) {
          console.warn('Voice guidance error:', error);
        }
      }
    },
    [settings.voiceGuidance]
  );

  /* ---------------------- Breathing Logic ---------------------- */

  const startPhase = useCallback(() => {
    if (isUnmountingRef.current) return;

    // Clear any existing timers
    if (countdownTimerRef.current) {
      clearInterval(countdownTimerRef.current);
      countdownTimerRef.current = null;
    }
    if (phaseTimeoutRef.current) {
      clearTimeout(phaseTimeoutRef.current);
      phaseTimeoutRef.current = null;
    }

    const duration = getPhaseDuration(currentPhase);
    const countdown = Math.floor(duration / 1000);

    // Trigger haptic and voice guidance at phase start
    triggerHaptic();
    speakPhase(currentPhase);

    // Animate orb scale with fluid easing
    if (currentPhase === 'inhale') {
      orbScale.value = withTiming(1.3, { duration, easing: FLOW_EASING });
    } else if (currentPhase === 'exhale') {
      orbScale.value = withTiming(0.85, { duration, easing: FLOW_EASING });
    } else {
      orbScale.value = withTiming(orbScale.value, { duration, easing: FLOW_EASING });
    }

    pathProgress.value = 0;
    pathProgress.value = withTiming(1, { duration, easing: FLOW_EASING });

    // Start countdown
    let c = countdown;
    setCount(countdown);

    countdownTimerRef.current = setInterval(() => {
      if (!isPaused && !isUnmountingRef.current) {
        c -= 1;
        if (c > 0) {
          setCount(c);
          triggerHaptic(); // Light haptic on each second
        }
      }
    }, 1000);

    // Schedule next phase transition
    phaseTimeoutRef.current = setTimeout(() => {
      if (countdownTimerRef.current) {
        clearInterval(countdownTimerRef.current);
        countdownTimerRef.current = null;
      }

      if (!isPaused && !isUnmountingRef.current) {
        const next: BreathingPhase =
          currentPhase === 'inhale'
            ? 'hold1'
            : currentPhase === 'hold1'
              ? 'exhale'
              : currentPhase === 'exhale'
                ? 'hold2'
                : 'inhale';

        if (next === 'inhale') {
          setCycle((p) => Math.min(p + 1, totalCycles));
        }

        setCurrentPhase(next);
      }
    }, duration);
  }, [
    currentPhase,
    isPaused,
    getPhaseDuration,
    triggerHaptic,
    speakPhase,
  ]);

  useEffect(() => {
    if (!isPaused && !isUnmountingRef.current) {
      startPhase();
    }
    return () => {
      if (countdownTimerRef.current) {
        clearInterval(countdownTimerRef.current);
        countdownTimerRef.current = null;
      }
      if (phaseTimeoutRef.current) {
        clearTimeout(phaseTimeoutRef.current);
        phaseTimeoutRef.current = null;
      }
    };
  }, [currentPhase, isPaused, startPhase]);

  // Reset function - memoized
  const handleReset = useCallback(() => {
    setIsPaused(true);

    // Clear all timers
    if (phaseTimeoutRef.current) {
      clearTimeout(phaseTimeoutRef.current);
      phaseTimeoutRef.current = null;
    }
    if (countdownTimerRef.current) {
      clearInterval(countdownTimerRef.current);
      countdownTimerRef.current = null;
    }
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }

    // Reset state
    setCurrentPhase('inhale');
    setCount(settings.inhaleDuration);
    setCycle(1);
    setRemainingTime(270);

    // Reset animations immediately
    orbScale.value = 1;
    pathProgress.value = 0;

    // Trigger haptic feedback
    triggerHaptic();

    // Restart after a brief pause
    setTimeout(() => {
      if (!isUnmountingRef.current) {
        setIsPaused(false);
      }
    }, 100);
  }, [settings.inhaleDuration, triggerHaptic]);

  /* ---------------------- Remaining Time ---------------------- */

  useEffect(() => {
    if (!isPaused && remainingTime > 0 && !isUnmountingRef.current) {
      intervalRef.current = setInterval(() => {
        setRemainingTime((t) => Math.max(0, t - 1));
      }, 1000);
    } else {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    }
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    };
  }, [isPaused, remainingTime]);

  // Update count when phase changes or settings change
  useEffect(() => {
    if (!isUnmountingRef.current) {
      const duration = getPhaseDuration(currentPhase);
      const countdown = Math.floor(duration / 1000);
      setCount(countdown);
    }
  }, [currentPhase, getPhaseDuration]);

  /* ---------------------- Animated Styles ---------------------- */

  const orbStyle = useAnimatedStyle(() => ({
    transform: [{ scale: orbScale.value }],
  }));

  // Data-stream / scan wave: moves left-to-right in sync with pathProgress
  const waveStyle = useAnimatedStyle(() => {
    const tx = interpolate(pathProgress.value, [0, 1], [-ORB_SIZE, ORB_SIZE], Extrapolate.CLAMP);
    return {
      transform: [{ translateX: tx }],
    };
  });

  // Futuristic core pulse (subtle)
  const corePulseStyle = useAnimatedStyle(() => {
    const opacity = interpolate(ambientPhase.value, [0, 1], [0.2, 0.4], Extrapolate.CLAMP);
    return { opacity };
  });

  // Neural nodes subtle pulse
  const nodesPulseStyle = useAnimatedStyle(() => {
    const opacity = interpolate(ambientPhase.value, [0, 1], [0.35, 0.65], Extrapolate.CLAMP);
    return { opacity };
  });

  /* ---------------------- Helpers ---------------------- */

  const formatTime = useCallback((s: number) => {
    const minutes = Math.floor(s / 60);
    const seconds = s % 60;
    return `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
  }, []);

  const phaseText = useMemo(() => {
    return currentPhase === 'inhale'
      ? 'Breathe In'
      : currentPhase === 'exhale'
        ? 'Breathe Out'
        : 'Hold';
  }, [currentPhase]);

  // Handle mute toggle
  const handleMuteToggle = useCallback(() => {
    const newMutedState = !isMuted;
    setIsMuted(newMutedState);
    if (newMutedState) {
      stopBackgroundMusic();
    } else if (settings.enableMusic) {
      loadBackgroundMusic();
    }
  }, [isMuted, settings.enableMusic, stopBackgroundMusic, loadBackgroundMusic]);

  /* ---------------------- Render ---------------------- */

  return (
    <SafeAreaView style={styles.container}>
      {/* Ambient Background */}
      <LinearGradient colors={['rgba(25,179,230,0.05)', 'transparent']} style={styles.topGlow} />
      <LinearGradient colors={['transparent', '#111d21']} style={styles.bottomGlow} />

      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={onBack} style={styles.headerBtn}>
          <Icon name="close" size={28} color="rgba(255,255,255,0.8)" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Box Breathing</Text>
        <TouchableOpacity style={styles.headerBtn} onPress={onSettings} activeOpacity={0.7}>
          <Icon name="settings" size={28} color="rgba(255,255,255,0.8)" />
        </TouchableOpacity>
      </View>

      {/* Main */}
      <View style={styles.main}>
        <View style={[styles.box, { width: BOX_SIZE, height: BOX_SIZE }]}>
          {/* Breathing Orb - with overflow hidden to prevent scaling out */}
          <View style={styles.orbWrapper}>
            <Animated.View style={[styles.orb, orbStyle]}>
              {/* Deep void background - out-of-space */}
              <LinearGradient
                colors={['#050510', '#0a0a1a', '#0d0d24', '#050510']}
                start={{ x: 0.5, y: 0 }}
                end={{ x: 0.5, y: 1 }}
                style={StyleSheet.absoluteFill}
              />
              {/* Subtle hex HUD overlay */}
              <View style={styles.hudOverlay} pointerEvents="none">
                <Svg width="100%" height="100%" viewBox="0 0 100 100" preserveAspectRatio="xMidYMid meet" style={StyleSheet.absoluteFill}>
                  <Path d={HEX_PATH} fill="none" stroke="rgba(6,182,212,0.08)" strokeWidth="0.4" />
                </Svg>
              </View>
              {/* AI core glow - pulsed */}
              <Animated.View style={[styles.coreGlow, corePulseStyle]} />

              {/* Neural nodes - AI-driven network feel */}
              <Animated.View style={[styles.nodesContainer, nodesPulseStyle]} pointerEvents="none">
                <Svg width="100%" height="100%" viewBox="0 0 100 100" preserveAspectRatio="xMidYMid meet" style={StyleSheet.absoluteFill}>
                  {NODE_POSITIONS.map((node, i) => (
                    <Circle
                      key={i}
                      cx={node.cx}
                      cy={node.cy}
                      r={i === NODE_POSITIONS.length - 1 ? 3 : 1.5}
                      fill={i === NODE_POSITIONS.length - 1 ? 'rgba(6,182,212,0.6)' : 'rgba(168,85,247,0.5)'}
                    />
                  ))}
                </Svg>
              </Animated.View>

              {/* Data-stream scan - moves with breath */}
              <View style={styles.waveContainer} pointerEvents="none">
                <Animated.View style={[styles.waveStrip, waveStyle]}>
                  <Svg
                    width={ORB_SIZE * 3}
                    height={ORB_SIZE}
                    viewBox="0 0 300 100"
                    preserveAspectRatio="none"
                  >
                    <Defs>
                      <SvgLinearGradient id="waveGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                        <Stop offset="0%" stopColor="rgba(6,182,212,0)" />
                        <Stop offset="30%" stopColor="rgba(6,182,212,0.25)" />
                        <Stop offset="50%" stopColor="rgba(255,255,255,0.5)" />
                        <Stop offset="70%" stopColor="rgba(168,85,247,0.25)" />
                        <Stop offset="100%" stopColor="rgba(168,85,247,0)" />
                      </SvgLinearGradient>
                    </Defs>
                    <Path d={WAVE_PATH_D} fill="url(#waveGradient)" />
                  </Svg>
                </Animated.View>
              </View>

              <View style={styles.orbContent}>
                <Text style={styles.phaseText}>{phaseText}</Text>
                <View style={styles.countRow}>
                  <Text style={styles.count}>{count}</Text>
                  <Text style={styles.unit}>s</Text>
                </View>
              </View>
            </Animated.View>
          </View>
        </View>
      </View>

      {/* Footer */}
      <View style={styles.footer}>
        <View style={styles.progressBlock}>
          <View style={styles.progressHeader}>
            <Text style={styles.progressText}>
              Cycle {cycle} of {totalCycles}
            </Text>
            <Text style={styles.time}>{formatTime(remainingTime)} remaining</Text>
          </View>

          <View style={styles.progressBar}>
            <LinearGradient
              colors={['#19b3e6', '#34d399']}
              style={[styles.progressFill, { width: `${(cycle / totalCycles) * 100}%` }]}
            />
          </View>
        </View>

        <View style={styles.controls}>
          <TouchableOpacity style={styles.iconBtn} onPress={handleReset} activeOpacity={0.7}>
            <Icon name="restart_alt" size={28} color="rgba(255,255,255,0.4)" />
          </TouchableOpacity>

          <TouchableOpacity style={styles.playBtn} onPress={() => setIsPaused(!isPaused)}>
            {!isPaused && <View style={styles.playGlow} />}
            <Icon name={isPaused ? 'play_arrow' : 'pause'} size={40} color="#fff" />
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.iconBtn}
            onPress={handleMuteToggle}
            activeOpacity={0.7}
          >
            <Icon
              name={isMuted ? 'volume_off' : 'volume_up'}
              size={28}
              color="rgba(255,255,255,0.4)"
            />
          </TouchableOpacity>
        </View>
      </View>
    </SafeAreaView>
  );
};

/* ---------------------- Styles ---------------------- */

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#111d21' },

  topGlow: {
    position: 'absolute',
    top: 0,
    height: '33%',
    width: '100%',
  },
  bottomGlow: {
    position: 'absolute',
    bottom: 0,
    height: '25%',
    width: '100%',
  },

  header: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 24,
  },
  headerBtn: { padding: 8, borderRadius: 999 },
  headerTitle: {
    flex: 1,
    textAlign: 'center',
    fontSize: 16,
    fontWeight: '600',
    letterSpacing: 0.5,
    color: 'rgba(255,255,255,0.8)',
  },

  main: { flex: 1, alignItems: 'center', justifyContent: 'center' },

  box: { alignItems: 'center', justifyContent: 'center', position: 'relative' },
  orbWrapper: {
    width: '100%',
    height: '100%',
    padding: 32,
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
    borderRadius: BOX_RADIUS,
  },
  orb: {
    width: '90%',
    height: '90%',
    borderRadius: 999,
    borderWidth: 1,
    borderColor: 'rgba(6,182,212,0.25)',
    shadowColor: '#06b6d4',
    shadowOpacity: 0.25,
    shadowRadius: 24,
    overflow: 'hidden',
  },
  hudOverlay: {
    ...StyleSheet.absoluteFillObject,
  },
  coreGlow: {
    ...StyleSheet.absoluteFillObject,
    margin: 20,
    borderRadius: 999,
    backgroundColor: 'rgba(6,182,212,0.25)',
  },
  nodesContainer: {
    ...StyleSheet.absoluteFillObject,
  },
  waveContainer: {
    ...StyleSheet.absoluteFillObject,
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  },
  waveStrip: {
    position: 'absolute',
    left: -ORB_SIZE,
    width: ORB_SIZE * 3,
    height: ORB_SIZE,
  },
  orbContent: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  phaseText: {
    fontSize: 18,
    letterSpacing: 4,
    textTransform: 'uppercase',
    color: '#06b6d4',
    marginBottom: 8,
    textShadowColor: 'rgba(6,182,212,0.5)',
    textShadowOffset: { width: 0, height: 0 },
    textShadowRadius: 8,
  },
  countRow: { flexDirection: 'row', alignItems: 'flex-start' },
  count: {
    fontSize: 72,
    fontWeight: '300',
    letterSpacing: 0,
    color: '#fff',
    textShadowColor: 'rgba(6,182,212,0.4)',
    textShadowOffset: { width: 0, height: 0 },
    textShadowRadius: 12,
  },
  unit: {
    fontSize: 22,
    color: 'rgba(255,255,255,0.6)',
    marginTop: 18,
    marginLeft: 4,
    letterSpacing: 2,
  },

  footer: { padding: 32, gap: 32,  width: '100%' },
  progressBlock: { gap: 12 },
  progressHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  progressText: { color: 'rgba(255,255,255,0.6)' },
  time: { color: 'rgba(255,255,255,0.4)', fontSize: 12 },

  progressBar: {
    height: 6,
    backgroundColor: 'rgba(255,255,255,0.1)',
    borderRadius: 3,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    borderRadius: 3,
  },

  controls: { flexDirection: 'row', gap: 32, alignItems: 'center', justifyContent: 'center', width: '100%' },
  iconBtn: { padding: 12 },

  playBtn: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: 'rgba(255,255,255,0.05)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  playGlow: {
    ...StyleSheet.absoluteFillObject,
    borderRadius: 40,
    backgroundColor: 'rgba(25,179,230,0.15)',
    shadowColor: '#19b3e6',
    shadowOpacity: 0.6,
    shadowRadius: 40,
  },
});
