import React, { useState, useEffect, useRef } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Dimensions } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { BlurView } from 'expo-blur';
import Animated, {
  useAnimatedStyle,
  withRepeat,
  withTiming,
  useSharedValue,
  withSequence,
  Easing,
  interpolate,
  Extrapolate,
} from 'react-native-reanimated';
import { Icon } from '@/components/ui/Icon';
import { cn } from '@/utils/cn';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const BOX_SIZE = Math.min(320, SCREEN_WIDTH - 48);
const BOX_RADIUS = 32; // rounded-[2rem] = 32px
const DOT_SIZE = 12; // w-3 h-3 = 12px
const BOX_PERIMETER = (BOX_SIZE - DOT_SIZE) * 4; // Approximate perimeter

interface BoxBreathingScreenProps {
  onBack?: () => void;
}

type BreathingPhase = 'inhale' | 'hold1' | 'exhale' | 'hold2';

const PHASE_DURATIONS = {
  inhale: 4000,
  hold1: 4000,
  exhale: 4000,
  hold2: 4000,
};

export const BoxBreathingScreen: React.FC<BoxBreathingScreenProps> = ({
  onBack,
}) => {
  const [isPaused, setIsPaused] = useState(false);
  const [currentPhase, setCurrentPhase] = useState<BreathingPhase>('inhale');
  const [count, setCount] = useState(4);
  const [cycle, setCycle] = useState(1);
  const [isMuted, setIsMuted] = useState(false);
  const [totalCycles] = useState(5);
  const [remainingTime, setRemainingTime] = useState(270); // 4:30 in seconds
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  // Breathing orb scale animation
  const orbScale = useSharedValue(1);
  // Dot position around the box (0-4 represents the 4 sides)
  const dotProgress = useSharedValue(0);
  // Active path progress (0-1)
  const pathProgress = useSharedValue(0);
  // Phase progress (0-1 for current phase)
  const phaseProgress = useSharedValue(0);

  // Start breathing cycle on mount
  useEffect(() => {
    startBreathingCycle();
  }, []);

  useEffect(() => {
    if (!isPaused) {
      startBreathingCycle();
    }
  }, [isPaused, currentPhase]);

  const startBreathingCycle = () => {
    const duration = PHASE_DURATIONS[currentPhase];
    const isInhale = currentPhase === 'inhale';
    const isExhale = currentPhase === 'exhale';

    // Orb breathing animation
    if (isInhale) {
      orbScale.value = withTiming(1.3, {
        duration,
        easing: Easing.inOut(Easing.ease),
      });
    } else if (isExhale) {
      orbScale.value = withTiming(0.85, {
        duration,
        easing: Easing.inOut(Easing.ease),
      });
    } else {
      // Hold phases - maintain current scale
      orbScale.value = withTiming(orbScale.value, { duration });
    }

    // Dot movement around box (0 = top start, 1 = top end, 2 = right end, 3 = bottom end, 4 = left end)
    const phaseIndex = currentPhase === 'inhale' ? 0 : currentPhase === 'hold1' ? 1 : currentPhase === 'exhale' ? 2 : 3;
    const startProgress = phaseIndex;
    const targetProgress = phaseIndex + 1;
    
    dotProgress.value = startProgress;
    dotProgress.value = withTiming(targetProgress, {
      duration,
      easing: Easing.linear,
    });

    // Path progress (reset and animate)
    pathProgress.value = 0;
    pathProgress.value = withTiming(1, {
      duration,
      easing: Easing.linear,
    });

    // Countdown timer
    let currentCount = 4;
    setCount(4);
    const countInterval = setInterval(() => {
      if (!isPaused) {
        currentCount--;
        if (currentCount > 0) {
          setCount(currentCount);
        } else {
          clearInterval(countInterval);
        }
      }
    }, 1000);

    // Phase transition
    const phaseTimeout = setTimeout(() => {
      if (!isPaused) {
        const nextPhase: BreathingPhase =
          currentPhase === 'inhale'
            ? 'hold1'
            : currentPhase === 'hold1'
            ? 'exhale'
            : currentPhase === 'exhale'
            ? 'hold2'
            : 'inhale';

        if (nextPhase === 'inhale') {
          setCycle((prev) => Math.min(prev + 1, totalCycles));
        }

        setCurrentPhase(nextPhase);
        setCount(4);
      }
    }, duration);

    return () => {
      clearInterval(countInterval);
      clearTimeout(phaseTimeout);
    };
  };

  // Remaining time countdown
  useEffect(() => {
    if (!isPaused && remainingTime > 0) {
      intervalRef.current = setInterval(() => {
        setRemainingTime((prev) => Math.max(0, prev - 1));
      }, 1000);
    } else {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    }
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [isPaused, remainingTime]);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
  };

  const getPhaseText = () => {
    switch (currentPhase) {
      case 'inhale':
        return 'Breathe In';
      case 'hold1':
        return 'Hold';
      case 'exhale':
        return 'Breathe Out';
      case 'hold2':
        return 'Hold';
      default:
        return 'Breathe In';
    }
  };

  // Orb animation style
  const orbAnimatedStyle = useAnimatedStyle(() => {
    return {
      transform: [{ scale: orbScale.value }],
    };
  });

  // Dot position animation (moves around box perimeter)
  const dotAnimatedStyle = useAnimatedStyle(() => {
    const side = Math.floor(dotProgress.value);
    const progressOnSide = dotProgress.value - side;
    const halfSize = BOX_SIZE / 2;
    const borderWidth = 2; // Match border-2

    let x = 0;
    let y = 0;

    // Top side (0-1): left to right
    if (side === 0) {
      x = interpolate(
        progressOnSide,
        [0, 1],
        [-halfSize + borderWidth, halfSize - borderWidth],
        Extrapolate.CLAMP
      );
      y = -halfSize - DOT_SIZE / 2;
    }
    // Right side (1-2): top to bottom
    else if (side === 1) {
      x = halfSize + DOT_SIZE / 2;
      y = interpolate(
        progressOnSide,
        [0, 1],
        [-halfSize + borderWidth, halfSize - borderWidth],
        Extrapolate.CLAMP
      );
    }
    // Bottom side (2-3): right to left
    else if (side === 2) {
      x = interpolate(
        progressOnSide,
        [0, 1],
        [halfSize - borderWidth, -halfSize + borderWidth],
        Extrapolate.CLAMP
      );
      y = halfSize + DOT_SIZE / 2;
    }
    // Left side (3-4): bottom to top
    else if (side === 3) {
      x = -halfSize - DOT_SIZE / 2;
      y = interpolate(
        progressOnSide,
        [0, 1],
        [halfSize - borderWidth, -halfSize + borderWidth],
        Extrapolate.CLAMP
      );
    }

    return {
      transform: [{ translateX: x }, { translateY: y }],
    };
  });

  // Active path animation - only highlight the current side being performed
  const pathAnimatedStyleTop = useAnimatedStyle(() => {
    const side = Math.floor(dotProgress.value);
    // Only show top side when on top (0)
    return { opacity: side === 0 ? 1 : 0 };
  });

  const pathAnimatedStyleRight = useAnimatedStyle(() => {
    const side = Math.floor(dotProgress.value);
    // Only show right side when on right (1)
    return { opacity: side === 1 ? pathProgress.value : 0 };
  });

  const pathAnimatedStyleBottom = useAnimatedStyle(() => {
    const side = Math.floor(dotProgress.value);
    // Only show bottom side when on bottom (2)
    return { opacity: side === 2 ? 1 : 0 };
  });

  const pathAnimatedStyleLeft = useAnimatedStyle(() => {
    const side = Math.floor(dotProgress.value);
    // Only show left side when on left (3)
    return { opacity: side === 3 ? pathProgress.value : 0 };
  });

  // Reset function
  const handleReset = () => {
    setIsPaused(true);
    setCurrentPhase('inhale');
    setCount(4);
    setCycle(1);
    dotProgress.value = 0;
    pathProgress.value = 0;
    orbScale.value = 1;
    setTimeout(() => {
      setIsPaused(false);
    }, 100);
  };

  // Toggle mute function
  const handleToggleMute = () => {
    setIsMuted(!isMuted);
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* Background Gradients */}
      <LinearGradient
        colors={['rgba(25, 179, 230, 0.05)', 'transparent']}
        start={{ x: 0, y: 0 }}
        end={{ x: 0, y: 1 }}
        style={styles.topGradient}
      />
      <LinearGradient
        colors={['transparent', '#111d21', '#111d21']}
        locations={[0, 0.5, 1]}
        start={{ x: 0, y: 0 }}
        end={{ x: 0, y: 1 }}
        style={styles.bottomGradient}
      />

      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity
          onPress={onBack}
          style={styles.headerButton}
          activeOpacity={0.7}
        >
          <Icon name="close" size={28} color="rgba(255,255,255,0.8)" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Box Breathing</Text>
        <TouchableOpacity style={styles.headerButton} activeOpacity={0.7}>
          <Icon name="settings" size={28} color="rgba(255,255,255,0.8)" />
        </TouchableOpacity>
      </View>

      {/* Main Content: Breathing Visualization */}
      <View style={styles.mainContent}>
        <View style={[styles.boxContainer, { width: BOX_SIZE, height: BOX_SIZE }]}>
          {/* The Path Trace (Subtle Square Border) */}
          <View style={styles.boxBorder} />

          {/* Active Path Indicator - Simple border highlight on current side */}
          {/* Top */}
          <Animated.View style={[styles.activePathTop, pathAnimatedStyleTop]}>
            <View style={styles.activePathBorderTop} />
          </Animated.View>
          {/* Right */}
          <Animated.View style={[styles.activePathRight, pathAnimatedStyleRight]}>
            <View style={styles.activePathBorderRight} />
          </Animated.View>
          {/* Bottom */}
          <Animated.View style={[styles.activePathBottom, pathAnimatedStyleBottom]}>
            <View style={styles.activePathBorderBottom} />
          </Animated.View>
          {/* Left */}
          <Animated.View style={[styles.activePathLeft, pathAnimatedStyleLeft]}>
            <View style={styles.activePathBorderLeft} />
          </Animated.View>

          {/* The Traveller Dot */}
          <Animated.View style={[styles.travelerDot, dotAnimatedStyle]}>
            <View style={styles.dotGlow} />
          </Animated.View>

          {/* The Breathing Orb */}
          <View style={styles.orbContainer}>
            <Animated.View style={[styles.breathingOrb, orbAnimatedStyle]}>
              <LinearGradient
                colors={[
                  'rgba(25, 179, 230, 0.2)',
                  'rgba(25, 179, 230, 0.1)',
                  'rgba(52, 211, 153, 0.05)',
                ]}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={StyleSheet.absoluteFill}
              />
              {/* Inner Core Glow */}
              <View style={styles.innerGlow}>
                <LinearGradient
                  colors={['rgba(25, 179, 230, 0.3)', 'rgba(52, 211, 153, 0.2)']}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 1 }}
                  style={StyleSheet.absoluteFill}
                />
              </View>
              {/* Text Content */}
              <View style={styles.orbContent}>
                <Text style={styles.phaseText}>{getPhaseText()}</Text>
                <View style={styles.countContainer}>
                  <Text style={styles.countText}>{count}</Text>
                  <Text style={styles.countUnit}>s</Text>
                </View>
              </View>
            </Animated.View>
          </View>

          {/* Label Hints for the Box */}
          <Text style={[styles.boxLabel, styles.labelTop]}>INHALE</Text>
          <Text style={[styles.boxLabel, styles.labelRight]}>HOLD</Text>
          <Text style={[styles.boxLabel, styles.labelBottom]}>EXHALE</Text>
          <Text style={[styles.boxLabel, styles.labelLeft]}>HOLD</Text>
        </View>
      </View>

      {/* Footer: Progress & Controls */}
      <View style={styles.footer}>
        <LinearGradient
          colors={['#111d21', 'rgba(17, 29, 33, 0.8)', 'transparent']}
          locations={[0, 0.5, 1]}
          style={StyleSheet.absoluteFill}
        />
        {/* Progress Section */}
        <View style={styles.progressSection}>
          <View style={styles.progressHeader}>
            <Text style={styles.progressLabel}>
              Cycle {cycle} of {totalCycles}
            </Text>
            <Text style={styles.timeRemaining}>{formatTime(remainingTime)} remaining</Text>
          </View>
          {/* Progress Bar */}
          <View style={styles.progressBarContainer}>
            <LinearGradient
              colors={['#19b3e6', '#34d399']}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
              style={[styles.progressBarFill, { width: `${(cycle / totalCycles) * 100}%` }]}
            />
          </View>
        </View>

        {/* Controls */}
        <View style={styles.controls}>
          <TouchableOpacity 
            onPress={handleReset}
            style={styles.controlButton} 
            activeOpacity={0.7}
          >
            <Icon name="restart_alt" size={28} color="rgba(255,255,255,0.4)" />
          </TouchableOpacity>
          <TouchableOpacity
            onPress={() => setIsPaused(!isPaused)}
            style={styles.playPauseButton}
            activeOpacity={0.8}
          >
            <View style={styles.playPauseGlow} />
            <Icon
              name={isPaused ? 'play_arrow' : 'pause'}
              size={40}
              color="#ffffff"
            />
          </TouchableOpacity>
          <TouchableOpacity 
            onPress={handleToggleMute}
            style={styles.controlButton} 
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

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#111d21',
  },
  topGradient: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: '33%',
    pointerEvents: 'none',
  },
  bottomGradient: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: '25%',
    pointerEvents: 'none',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 24,
    zIndex: 20,
  },
  headerButton: {
    padding: 8,
    borderRadius: 9999,
  },
  headerTitle: {
    flex: 1,
    textAlign: 'center',
    fontSize: 16,
    fontWeight: '600',
    letterSpacing: 0.5,
    color: 'rgba(255, 255, 255, 0.8)',
  },
  mainContent: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
  },
  boxContainer: {
    position: 'relative',
    alignItems: 'center',
    justifyContent: 'center',
  },
  boxBorder: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    borderRadius: BOX_RADIUS,
    borderWidth: 2,
    borderColor: 'rgba(255, 255, 255, 0.05)',
  },
  activePathTop: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    borderRadius: BOX_RADIUS,
    overflow: 'hidden',
  },
  activePathRight: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    borderRadius: BOX_RADIUS,
    overflow: 'hidden',
  },
  activePathBottom: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    borderRadius: BOX_RADIUS,
    overflow: 'hidden',
  },
  activePathLeft: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    borderRadius: BOX_RADIUS,
    overflow: 'hidden',
  },
  activePathBorderTop: {
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
    shadowOpacity: 0.5,
    shadowRadius: 20,
    elevation: 10,
  },
  activePathBorderRight: {
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
    shadowOpacity: 0.5,
    shadowRadius: 20,
    elevation: 10,
  },
  activePathBorderBottom: {
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
    shadowOpacity: 0.5,
    shadowRadius: 20,
    elevation: 10,
  },
  activePathBorderLeft: {
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
    shadowOpacity: 0.5,
    shadowRadius: 20,
    elevation: 10,
  },
  travelerDot: {
    position: 'absolute',
    top: -5, // -top-[5px] from HTML
    left: '50%',
    width: DOT_SIZE,
    height: DOT_SIZE,
    borderRadius: DOT_SIZE / 2,
    backgroundColor: '#ffffff',
    zIndex: 10,
    marginLeft: -DOT_SIZE / 2, // Center the dot
  },
  dotGlow: {
    ...StyleSheet.absoluteFillObject,
    borderRadius: DOT_SIZE / 2,
    backgroundColor: '#ffffff',
    shadowColor: '#ffffff',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.8,
    shadowRadius: 15,
    elevation: 10,
  },
  orbContainer: {
    width: '100%',
    height: '100%',
    padding: 32,
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 10,
  },
  breathingOrb: {
    width: '100%',
    height: '100%',
    borderRadius: 9999,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.05)',
    shadowColor: '#19b3e6',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.15,
    shadowRadius: 100,
    elevation: 20,
    overflow: 'hidden',
  },
  innerGlow: {
    position: 'absolute',
    top: 16,
    left: 16,
    right: 16,
    bottom: 16,
    borderRadius: 9999,
  },
  orbContent: {
    position: 'relative',
    zIndex: 20,
    alignItems: 'center',
    justifyContent: 'center',
    flex: 1,
  },
  phaseText: {
    fontSize: 20,
    fontWeight: '500',
    letterSpacing: 2,
    textTransform: 'uppercase',
    color: '#19b3e6',
    marginBottom: 8,
    textShadowColor: 'rgba(0, 0, 0, 0.5)',
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 4,
  },
  countContainer: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  countText: {
    fontSize: 80,
    fontWeight: '300',
    lineHeight: 96,
    letterSpacing: -2,
    color: '#ffffff',
    fontVariant: ['tabular-nums'],
    textShadowColor: 'rgba(0, 0, 0, 0.5)',
    textShadowOffset: { width: 0, height: 4 },
    textShadowRadius: 8,
  },
  countUnit: {
    fontSize: 24,
    fontWeight: '300',
    color: 'rgba(255, 255, 255, 0.5)',
    marginLeft: 4,
    marginTop: 16,
  },
  boxLabel: {
    position: 'absolute',
    fontSize: 12,
    fontWeight: '500',
    letterSpacing: 1,
    zIndex: 5,
  },
  labelTop: {
    top: -30,
    left: '50%',
    transform: [{ translateX: -30 }],
    color: 'rgba(25, 179, 230, 0.6)',
  },
  labelRight: {
    right: -50,
    top: '50%',
    transform: [{ translateY: -6 }, { rotate: '90deg' }],
    color: 'rgba(255, 255, 255, 0.2)',
  },
  labelBottom: {
    bottom: -30,
    left: '50%',
    transform: [{ translateX: -30 }],
    color: 'rgba(255, 255, 255, 0.2)',
  },
  labelLeft: {
    left: -50,
    top: '50%',
    transform: [{ translateY: -6 }, { rotate: '-90deg' }],
    color: 'rgba(255, 255, 255, 0.2)',
  },
  footer: {
    width: '100%',
    padding: 32,
    paddingBottom: 40,
    alignItems: 'center',
    gap: 32,
    zIndex: 20,
    position: 'relative',
  },
  progressSection: {
    width: '100%',
    maxWidth: 384,
    gap: 12,
  },
  progressHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
    paddingHorizontal: 4,
  },
  progressLabel: {
    fontSize: 14,
    fontWeight: '500',
    letterSpacing: 0.5,
    color: 'rgba(255, 255, 255, 0.6)',
  },
  timeRemaining: {
    fontSize: 12,
    fontWeight: '500',
    color: 'rgba(255, 255, 255, 0.4)',
  },
  progressBarContainer: {
    height: 6,
    width: '100%',
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 3,
    overflow: 'hidden',
  },
  progressBarFill: {
    height: '100%',
    borderRadius: 3,
    shadowColor: '#19b3e6',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.5,
    shadowRadius: 10,
    elevation: 5,
  },
  controls: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 32,
  },
  controlButton: {
    padding: 12,
    borderRadius: 9999,
  },
  playPauseButton: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
    overflow: 'hidden',
  },
  playPauseGlow: {
    position: 'absolute',
    top: -20,
    left: -20,
    right: -20,
    bottom: -20,
    borderRadius: 40,
    backgroundColor: 'rgba(25, 179, 230, 0.1)',
    opacity: 0,
  },
});
