import React, { useState, useEffect, useRef } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Dimensions } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import Animated, {
  useAnimatedStyle,
  withTiming,
  useSharedValue,
  Easing,
  interpolate,
  Extrapolate,
} from 'react-native-reanimated';
import { Icon } from '@/components/ui/Icon';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

const BOX_SIZE = Math.min(380, SCREEN_WIDTH - 48);
const BOX_RADIUS = 32;
const DOT_SIZE = 12;

type BreathingPhase = 'inhale' | 'hold1' | 'exhale' | 'hold2';

const PHASE_DURATIONS: Record<BreathingPhase, number> = {
  inhale: 4000,
  hold1: 4000,
  exhale: 4000,
  hold2: 4000,
};

export const BoxBreathingScreen: React.FC<{ onBack?: () => void }> = ({ onBack }) => {
  const [isPaused, setIsPaused] = useState(false);
  const [currentPhase, setCurrentPhase] = useState<BreathingPhase>('inhale');
  const [count, setCount] = useState(4);
  const [cycle, setCycle] = useState(1);
  const [isMuted, setIsMuted] = useState(false);
  const totalCycles = 5;
  const [remainingTime, setRemainingTime] = useState(270);

  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  const orbScale = useSharedValue(1);
  const dotProgress = useSharedValue(0);
  const pathProgress = useSharedValue(0);

  /* ---------------------- Breathing Logic ---------------------- */

  useEffect(() => {
    if (!isPaused) startPhase();
  }, [currentPhase, isPaused]);

  const startPhase = () => {
    const duration = PHASE_DURATIONS[currentPhase];

    if (currentPhase === 'inhale') {
      orbScale.value = withTiming(1.3, { duration, easing: Easing.inOut(Easing.ease) });
    } else if (currentPhase === 'exhale') {
      orbScale.value = withTiming(0.85, { duration, easing: Easing.inOut(Easing.ease) });
    } else {
      orbScale.value = withTiming(orbScale.value, { duration });
    }

    const phaseIndex =
      currentPhase === 'inhale'
        ? 0
        : currentPhase === 'hold1'
          ? 1
          : currentPhase === 'exhale'
            ? 2
            : 3;

    dotProgress.value = withTiming(phaseIndex + 1, {
      duration,
      easing: Easing.linear,
    });

    pathProgress.value = 0;
    pathProgress.value = withTiming(1, { duration, easing: Easing.linear });

    let c = 4;
    setCount(4);
    const timer = setInterval(() => {
      if (!isPaused) {
        c -= 1;
        if (c > 0) setCount(c);
      }
    }, 1000);

    const timeout = setTimeout(() => {
      clearInterval(timer);
      if (!isPaused) {
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

    return () => {
      clearTimeout(timeout);
      clearInterval(timer);
    };
  };

  /* ---------------------- Remaining Time ---------------------- */

  useEffect(() => {
    if (!isPaused && remainingTime > 0) {
      intervalRef.current = setInterval(() => {
        setRemainingTime((t) => Math.max(0, t - 1));
      }, 1000);
    }
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [isPaused, remainingTime]);

  /* ---------------------- Animated Styles ---------------------- */

  const orbStyle = useAnimatedStyle(() => ({
    transform: [{ scale: orbScale.value }],
  }));

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

  const formatTime = (s: number) =>
    `${String(Math.floor(s / 60)).padStart(2, '0')}:${String(s % 60).padStart(2, '0')}`;

  const phaseText =
    currentPhase === 'inhale' ? 'Breathe In' : currentPhase === 'exhale' ? 'Breathe Out' : 'Hold';

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
        <TouchableOpacity style={styles.headerBtn}>
          <Icon name="settings" size={28} color="rgba(255,255,255,0.8)" />
        </TouchableOpacity>
      </View>

      {/* Main */}
      <View style={styles.main}>
        <View style={[styles.box, { width: BOX_SIZE, height: BOX_SIZE }]}>
          <View style={styles.boxBorder} />

          <Animated.View style={[styles.travelerDot, dotStyle]}>
            <View style={styles.dotGlow} />
          </Animated.View>

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
          <TouchableOpacity style={styles.iconBtn}>
            <Icon name="restart_alt" size={28} color="rgba(255,255,255,0.4)" />
          </TouchableOpacity>

          <TouchableOpacity style={styles.playBtn} onPress={() => setIsPaused(!isPaused)}>
            {!isPaused && <View style={styles.playGlow} />}
            <Icon name={isPaused ? 'play_arrow' : 'pause'} size={40} color="#fff" />
          </TouchableOpacity>

          <TouchableOpacity style={styles.iconBtn} onPress={() => setIsMuted(!isMuted)}>
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

  box: { alignItems: 'center', justifyContent: 'center' },
  boxBorder: {
    ...StyleSheet.absoluteFillObject,
    borderRadius: BOX_RADIUS,
    borderWidth: 2,
    borderColor: 'rgba(255,255,255,0.05)',
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
  },
  orb: {
    width: '100%',
    height: '100%',
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

  footer: { padding: 32, gap: 32 },
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

  controls: { flexDirection: 'row', gap: 32, alignItems: 'center' },
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
