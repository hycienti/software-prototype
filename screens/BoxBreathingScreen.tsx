import React, { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Dimensions, Platform } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { Audio } from 'expo-av';
import * as Haptics from 'expo-haptics';
import Animated, {
  useAnimatedStyle,
  withTiming,
  useSharedValue,
  Easing,
  interpolate,
  Extrapolate,
} from 'react-native-reanimated';
import { Icon } from '@/components/ui/Icon';
import { useBoxBreathingSettings } from '@/store/BoxBreathingSettingsContext';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

const BOX_SIZE = Math.min(380, SCREEN_WIDTH - 100);
const BOX_RADIUS = 32;
const DOT_SIZE = 12;

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
  const dotProgress = useSharedValue(0);
  const pathProgress = useSharedValue(0);

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

    // Animate orb scale
    if (currentPhase === 'inhale') {
      orbScale.value = withTiming(1.3, { duration, easing: Easing.inOut(Easing.ease) });
    } else if (currentPhase === 'exhale') {
      orbScale.value = withTiming(0.85, { duration, easing: Easing.inOut(Easing.ease) });
    } else {
      orbScale.value = withTiming(orbScale.value, { duration });
    }

    // Calculate phase index for dot animation
    const phaseIndex =
      currentPhase === 'inhale'
        ? 0
        : currentPhase === 'hold1'
          ? 1
          : currentPhase === 'exhale'
            ? 2
            : 3;

    // Animate dot progress
    dotProgress.value = withTiming(phaseIndex + 1, {
      duration,
      easing: Easing.linear,
    });

    // Animate path progress
    pathProgress.value = 0;
    pathProgress.value = withTiming(1, { duration, easing: Easing.linear });

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
    dotProgress.value = 0;
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

  // Active path glow styles - only show the current side
  const activePathTopStyle = useAnimatedStyle(() => {
    const side = Math.floor(dotProgress.value);
    const isActive = side === 0;
    return {
      opacity: isActive ? 1 : 0,
    };
  });

  const activePathRightStyle = useAnimatedStyle(() => {
    const side = Math.floor(dotProgress.value);
    const isActive = side === 1;
    return {
      opacity: isActive ? pathProgress.value : 0,
    };
  });

  const activePathBottomStyle = useAnimatedStyle(() => {
    const side = Math.floor(dotProgress.value);
    const isActive = side === 2;
    return {
      opacity: isActive ? 1 : 0,
    };
  });

  const activePathLeftStyle = useAnimatedStyle(() => {
    const side = Math.floor(dotProgress.value);
    const isActive = side === 3;
    return {
      opacity: isActive ? pathProgress.value : 0,
    };
  });

  const dotStyle = useAnimatedStyle(() => {
    const side = Math.floor(dotProgress.value);
    const progress = dotProgress.value - side;
    const half = BOX_SIZE / 2;

    let x = 0;
    let y = 0;

    if (side === 0) {
      x = interpolate(progress, [0, 1], [-half, half], Extrapolate.CLAMP);
      y = -half - DOT_SIZE / 2;
    } else if (side === 1) {
      x = half + DOT_SIZE / 2;
      y = interpolate(progress, [0, 1], [-half, half], Extrapolate.CLAMP);
    } else if (side === 2) {
      x = interpolate(progress, [0, 1], [half, -half], Extrapolate.CLAMP);
      y = half + DOT_SIZE / 2;
    } else {
      x = -half - DOT_SIZE / 2;
      y = interpolate(progress, [0, 1], [half, -half], Extrapolate.CLAMP);
    }

    return { transform: [{ translateX: x }, { translateY: y }] };
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
          {/* Box Border with Glow */}
          <View style={styles.boxBorder} />

          {/* Active Path Indicators - Glowing borders on current side */}
          <Animated.View style={[styles.activePathContainer, activePathTopStyle]}>
            <View style={styles.activePathTop} />
          </Animated.View>
          <Animated.View style={[styles.activePathContainer, activePathRightStyle]}>
            <View style={styles.activePathRight} />
          </Animated.View>
          <Animated.View style={[styles.activePathContainer, activePathBottomStyle]}>
            <View style={styles.activePathBottom} />
          </Animated.View>
          <Animated.View style={[styles.activePathContainer, activePathLeftStyle]}>
            <View style={styles.activePathLeft} />
          </Animated.View>

          {/* Traveler Dot */}
          <Animated.View style={[styles.travelerDot, dotStyle]}>
            <View style={styles.dotGlow} />
          </Animated.View>

          {/* Breathing Orb - with overflow hidden to prevent scaling out */}
          <View style={styles.orbWrapper}>
            <Animated.View style={[styles.orb, orbStyle]}>
              <LinearGradient
                colors={['rgba(25,179,230,0.2)', 'rgba(25,179,230,0.1)', 'rgba(52,211,153,0.05)']}
                style={StyleSheet.absoluteFill}
              />
              <View style={styles.innerGlow} />

              <View style={styles.orbContent}>
                <Text style={styles.phaseText}>{phaseText}</Text>
                <View style={styles.countRow}>
                  <Text style={styles.count}>{count}</Text>
                  <Text style={styles.unit}>s</Text>
                </View>
              </View>
            </Animated.View>
          </View>

          {/* Labels */}
          <Text style={[styles.label, styles.labelTop]}>INHALE</Text>
          <Text style={[styles.label, styles.labelRight]}>HOLD</Text>
          <Text style={[styles.label, styles.labelBottom]}>EXHALE</Text>
          <Text style={[styles.label, styles.labelLeft]}>HOLD</Text>
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
  boxBorder: {
    ...StyleSheet.absoluteFillObject,
    borderRadius: BOX_RADIUS,
    borderWidth: 2,
    borderColor: 'rgba(255,255,255,0.05)',
    shadowColor: '#19b3e6',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.15,
    shadowRadius: 30,
    elevation: 10,
  },
  activePathContainer: {
    ...StyleSheet.absoluteFillObject,
    borderRadius: BOX_RADIUS,
    overflow: 'hidden',
  },
  activePathTop: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: 2,
    borderTopLeftRadius: BOX_RADIUS,
    borderTopRightRadius: BOX_RADIUS,
    backgroundColor: '#19b3e6',
    shadowColor: '#19b3e6',
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.8,
    shadowRadius: 25,
    elevation: 15,
  },
  activePathRight: {
    position: 'absolute',
    top: 0,
    right: 0,
    bottom: 0,
    width: 2,
    borderTopRightRadius: BOX_RADIUS,
    borderBottomRightRadius: BOX_RADIUS,
    backgroundColor: '#19b3e6',
    shadowColor: '#19b3e6',
    shadowOffset: { width: -4, height: 0 },
    shadowOpacity: 0.8,
    shadowRadius: 25,
    elevation: 15,
  },
  activePathBottom: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: 2,
    borderBottomLeftRadius: BOX_RADIUS,
    borderBottomRightRadius: BOX_RADIUS,
    backgroundColor: '#19b3e6',
    shadowColor: '#19b3e6',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.8,
    shadowRadius: 25,
    elevation: 15,
  },
  activePathLeft: {
    position: 'absolute',
    top: 0,
    left: 0,
    bottom: 0,
    width: 2,
    borderTopLeftRadius: BOX_RADIUS,
    borderBottomLeftRadius: BOX_RADIUS,
    backgroundColor: '#19b3e6',
    shadowColor: '#19b3e6',
    shadowOffset: { width: 4, height: 0 },
    shadowOpacity: 0.8,
    shadowRadius: 25,
    elevation: 15,
  },

  travelerDot: {
    position: 'absolute',
    width: DOT_SIZE,
    height: DOT_SIZE,
    borderRadius: DOT_SIZE / 2,
    backgroundColor: '#fff',
    zIndex: 10,
  },
  dotGlow: {
    ...StyleSheet.absoluteFillObject,
    borderRadius: DOT_SIZE / 2,
    shadowColor: '#fff',
    shadowOpacity: 0.8,
    shadowRadius: 15,
  },

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
    borderColor: 'rgba(255,255,255,0.05)',
    shadowColor: '#19b3e6',
    shadowOpacity: 0.15,
    shadowRadius: 100,
    overflow: 'hidden',
  },
  innerGlow: {
    ...StyleSheet.absoluteFillObject,
    margin: 16,
    borderRadius: 999,
    backgroundColor: 'rgba(25,179,230,0.35)',
  },

  orbContent: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  phaseText: {
    fontSize: 20,
    letterSpacing: 2,
    textTransform: 'uppercase',
    color: '#19b3e6',
    marginBottom: 8,
  },
  countRow: { flexDirection: 'row', alignItems: 'flex-start' },
  count: {
    fontSize: 80,
    fontWeight: '200',
    letterSpacing: -1.5,
    color: '#fff',
  },
  unit: {
    fontSize: 24,
    color: 'rgba(255,255,255,0.5)',
    marginTop: 18,
    marginLeft: 4,
  },

  label: {
    position: 'absolute',
    fontSize: 12,
    letterSpacing: 1,
    color: 'rgba(255,255,255,0.2)',
  },
  labelTop: { top: -30, color: 'rgba(25,179,230,0.6)' },
  labelBottom: { bottom: -30 },
  labelLeft: { left: -40, transform: [{ rotate: '-90deg' }] },
  labelRight: { right: -40, transform: [{ rotate: '90deg' }] },

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
