import React, { useEffect } from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { BlurView } from 'expo-blur';
import Animated, {
  useAnimatedStyle,
  withRepeat,
  withTiming,
  interpolate,
  useSharedValue,
  Easing,
} from 'react-native-reanimated';
import { Icon } from '@/components/ui/Icon';
import { cn } from '@/utils/cn';

interface VoiceScreenProps {
  onBack?: () => void;
  onKeyboardPress?: () => void;
}

export const VoiceScreen: React.FC<VoiceScreenProps> = ({
  onBack,
  onKeyboardPress,
}) => {
  // Blob animation values
  const blobProgress = useSharedValue(0);
  const innerGlowOpacity = useSharedValue(0.3);
  
  // Ping animation for live dot
  const pingScale = useSharedValue(1);
  const pingOpacity = useSharedValue(0.75);
  
  // Listening text pulse
  const listeningOpacity = useSharedValue(0.9);
  
  // Ripple animation values
  const ripple1 = useSharedValue(0.8);
  const ripple2 = useSharedValue(0.8);
  const ripple3 = useSharedValue(0.8);
  
  // Visualizer bar animations
  const bar1 = useSharedValue(0.3);
  const bar2 = useSharedValue(0.5);
  const bar3 = useSharedValue(0.8);
  const bar4 = useSharedValue(0.4);
  const bar5 = useSharedValue(0.3);

  useEffect(() => {
    // Blob morphing animation (10s infinite alternate)
    blobProgress.value = withRepeat(
      withTiming(1, { duration: 10000, easing: Easing.inOut(Easing.ease) }),
      -1,
      true
    );

    // Inner glow pulse (4s slow pulse)
    innerGlowOpacity.value = withRepeat(
      withTiming(0.6, { duration: 4000, easing: Easing.inOut(Easing.ease) }),
      -1,
      true
    );

    // Ping animation for live dot
    pingScale.value = withRepeat(
      withTiming(2, { duration: 2000, easing: Easing.out(Easing.ease) }),
      -1,
      false
    );
    pingOpacity.value = withRepeat(
      withTiming(0, { duration: 2000, easing: Easing.out(Easing.ease) }),
      -1,
      false
    );

    // Listening text pulse
    listeningOpacity.value = withRepeat(
      withTiming(1, { duration: 2000, easing: Easing.inOut(Easing.ease) }),
      -1,
      true
    );

    // Ripple animations (3s each with delays)
    const startRipple1 = () => {
      ripple1.value = 0.8;
      ripple1.value = withRepeat(
        withTiming(2.5, { duration: 3000, easing: Easing.linear }),
        -1,
        false
      );
    };
    const startRipple2 = () => {
      ripple2.value = 0.8;
      ripple2.value = withRepeat(
        withTiming(2.5, { duration: 3000, easing: Easing.linear }),
        -1,
        false
      );
    };
    const startRipple3 = () => {
      ripple3.value = 0.8;
      ripple3.value = withRepeat(
        withTiming(2.5, { duration: 3000, easing: Easing.linear }),
        -1,
        false
      );
    };
    
    startRipple1();
    setTimeout(startRipple2, 1000);
    setTimeout(startRipple3, 2000);

    // Visualizer bar pulses (different timings)
    bar1.value = withRepeat(
      withTiming(1, { duration: 1000, easing: Easing.inOut(Easing.ease) }),
      -1,
      true
    );
    bar2.value = withRepeat(
      withTiming(1, { duration: 1200, easing: Easing.inOut(Easing.ease) }),
      -1,
      true
    );
    bar3.value = withRepeat(
      withTiming(1, { duration: 800, easing: Easing.inOut(Easing.ease) }),
      -1,
      true
    );
    bar4.value = withRepeat(
      withTiming(1, { duration: 1500, easing: Easing.inOut(Easing.ease) }),
      -1,
      true
    );
    bar5.value = withRepeat(
      withTiming(1, { duration: 1100, easing: Easing.inOut(Easing.ease) }),
      -1,
      true
    );
  }, []);

  // Blob border-radius morphing animation
  // Note: React Native doesn't support complex border-radius strings, so we approximate with simpler values
  const blobStyle = useAnimatedStyle(() => {
    const borderRadius = interpolate(blobProgress.value, [0, 0.5, 1], [80, 50, 80]);
    const scale = interpolate(blobProgress.value, [0, 0.5, 1], [1, 1.05, 1]);
    const rotation = interpolate(blobProgress.value, [0, 0.5, 1], [0, 180, 360]);

    return {
      borderRadius,
      transform: [
        { scale },
        { rotate: `${rotation}deg` },
      ],
    };
  });

  const pingStyle = useAnimatedStyle(() => ({
    transform: [{ scale: pingScale.value }],
    opacity: pingOpacity.value,
  }));

  const listeningTextStyle = useAnimatedStyle(() => ({
    opacity: listeningOpacity.value,
  }));

  const innerGlowStyle = useAnimatedStyle(() => ({
    opacity: innerGlowOpacity.value,
  }));

  // Ripple styles
  const ripple1Style = useAnimatedStyle(() => ({
    transform: [{ scale: ripple1.value }],
    opacity: interpolate(ripple1.value, [0.8, 2.5], [1, 0]),
  }));

  const ripple2Style = useAnimatedStyle(() => ({
    transform: [{ scale: ripple2.value }],
    opacity: interpolate(ripple2.value, [0.8, 2.5], [1, 0]),
  }));

  const ripple3Style = useAnimatedStyle(() => ({
    transform: [{ scale: ripple3.value }],
    opacity: interpolate(ripple3.value, [0.8, 2.5], [1, 0]),
  }));

  // Visualizer bar styles (heights: 3px, 5px, 8px, 4px, 3px base)
  const bar1Style = useAnimatedStyle(() => ({
    height: interpolate(bar1.value, [0, 1], [12, 15]), // ~3px to 4px
  }));
  const bar2Style = useAnimatedStyle(() => ({
    height: interpolate(bar2.value, [0, 1], [20, 25]), // ~5px to 6px
  }));
  const bar3Style = useAnimatedStyle(() => ({
    height: interpolate(bar3.value, [0, 1], [32, 40]), // ~8px to 10px
  }));
  const bar4Style = useAnimatedStyle(() => ({
    height: interpolate(bar4.value, [0, 1], [16, 20]), // ~4px to 5px
  }));
  const bar5Style = useAnimatedStyle(() => ({
    height: interpolate(bar5.value, [0, 1], [12, 15]), // ~3px to 4px
  }));

  return (
    <SafeAreaView className="flex-1 bg-background-dark">
      {/* Immersive Background Layers */}
      <View style={StyleSheet.absoluteFill} className="bg-background-dark">
        <LinearGradient
          colors={[
            'rgba(30, 41, 59, 0.4)', // indigo-950/40
            'rgba(15, 23, 42, 0.2)', // slate-900/20
            'transparent',
          ]}
          locations={[0, 0.5, 1]}
          style={[StyleSheet.absoluteFill, { height: '80%' }]}
        />
        <View 
          style={[
            styles.backgroundBlob1,
            { backgroundColor: 'rgba(25, 179, 230, 0.1)' }
          ]} 
        />
        <View 
          style={[
            styles.backgroundBlob2,
            { backgroundColor: 'rgba(88, 28, 135, 0.2)' }
          ]} 
        />
      </View>

      {/* Header Status */}
      <View className="relative z-10 pt-12 pb-4 px-6 items-center">
        <View className="flex-row items-center gap-2 px-4 py-1.5 rounded-full bg-white/5 border border-white/5">
          <View className="relative h-2 w-2 items-center justify-center">
            <Animated.View 
              style={[
                styles.pingDot,
                pingStyle,
                { backgroundColor: '#19b3e6' }
              ]} 
            />
            <View 
              style={[
                styles.liveDot,
                { backgroundColor: '#19b3e6' }
              ]} 
            />
          </View>
          <Text className="text-xs font-medium tracking-wide text-gray-300 uppercase">
            Live Session
          </Text>
        </View>
        <Animated.Text 
          style={[styles.listeningText, listeningTextStyle]}
          className="mt-4 text-2xl font-light tracking-wide text-white/90"
        >
          I'm listening...
        </Animated.Text>
      </View>

      {/* Main Content: The Blob */}
      <View className="flex-1 items-center justify-center relative z-10">
        <View className="relative w-64 h-64 items-center justify-center">
          {/* Ripple Effects */}
          <View style={styles.rippleContainer}>
            <Animated.View style={[styles.ripple, ripple1Style, { borderColor: 'rgba(25, 179, 230, 0.2)' }]} />
            <Animated.View style={[styles.ripple, ripple2Style, { borderColor: 'rgba(25, 179, 230, 0.1)' }]} />
            <Animated.View style={[styles.ripple, ripple3Style, { borderColor: 'rgba(25, 179, 230, 0.05)' }]} />
          </View>

          {/* The Core Blob */}
          <View className="relative w-64 h-64">
            {/* Inner Glow */}
            <Animated.View 
              style={[
                styles.innerGlow,
                innerGlowStyle,
                { backgroundColor: 'rgba(25, 179, 230, 0.2)' }
              ]} 
            />
            
            {/* Main Animated Shape */}
            <Animated.View style={[styles.blob, blobStyle]}>
              <LinearGradient
                colors={[
                  'rgba(25, 179, 230, 0.8)',
                  'rgba(76, 29, 149, 0.6)',
                  'rgba(17, 29, 33, 0.1)',
                ]}
                start={{ x: 0.3, y: 0.3 }}
                end={{ x: 1, y: 1 }}
                style={StyleSheet.absoluteFill}
              />
            </Animated.View>
          </View>
        </View>
      </View>

      {/* Bottom Controls */}
      <View className="relative z-10 pb-10 px-6">
        <View className="max-w-md mx-auto">
          {/* Glass Control Bar */}
          <BlurView intensity={80} tint="dark" style={styles.glassPanel}>
            {/* Switch to Text */}
            <TouchableOpacity
              onPress={onKeyboardPress}
              style={styles.controlButton}
              activeOpacity={0.7}
            >
              <Icon name="keyboard" size={24} color="#d1d5db" />
            </TouchableOpacity>

            {/* Visualizer Placeholder (Center) */}
            <View style={styles.visualizerContainer} className="flex-1 h-12 flex-row items-center justify-center gap-1 mx-4 opacity-50">
              <Animated.View style={[styles.visualizerBar, bar1Style]} />
              <Animated.View style={[styles.visualizerBar, bar2Style]} />
              <Animated.View style={[styles.visualizerBar, bar3Style]} />
              <Animated.View style={[styles.visualizerBar, bar4Style]} />
              <Animated.View style={[styles.visualizerBar, bar5Style]} />
            </View>

            {/* End Session */}
            <TouchableOpacity
              onPress={onBack}
              style={styles.endButton}
              activeOpacity={0.7}
            >
              <Icon name="close" size={24} color="#f87171" />
            </TouchableOpacity>
          </BlurView>
          
          <Text className="text-center text-white/20 text-[10px] mt-6 font-medium tracking-widest uppercase">
            Haven Voice Interface
          </Text>
        </View>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  backgroundBlob1: {
    position: 'absolute',
    top: '-20%',
    left: '-10%',
    width: 600,
    height: 600,
    borderRadius: 300,
    opacity: 0.5,
  },
  backgroundBlob2: {
    position: 'absolute',
    bottom: '10%',
    right: '-10%',
    width: 500,
    height: 500,
    borderRadius: 250,
    opacity: 0.5,
  },
  pingDot: {
    position: 'absolute',
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#19b3e6',
  },
  liveDot: {
    position: 'absolute',
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#19b3e6',
  },
  listeningText: {
    opacity: 0.9,
  },
  rippleContainer: {
    position: 'absolute',
    width: 192,
    height: 192,
    alignItems: 'center',
    justifyContent: 'center',
  },
  ripple: {
    position: 'absolute',
    width: 192,
    height: 192,
    borderRadius: 96,
    borderWidth: 1,
  },
  innerGlow: {
    position: 'absolute',
    width: 256,
    height: 256,
    borderRadius: 128,
    top: -32,
    left: -32,
  },
  blob: {
    width: 256,
    height: 256,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
    shadowColor: '#19b3e6',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.3,
    shadowRadius: 40,
    elevation: 10,
  },
  glassPanel: {
    borderRadius: 9999,
    padding: 8,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: 'rgba(17, 29, 33, 0.6)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.08)',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.5,
    shadowRadius: 20,
    elevation: 20,
  },
  controlButton: {
    height: 56,
    width: 56,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 28,
  },
  visualizerContainer: {
    borderRadius: 9999,
  },
  visualizerBar: {
    width: 4,
    backgroundColor: '#19b3e6',
    borderRadius: 2,
    minHeight: 12,
  },
  endButton: {
    height: 56,
    width: 56,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 28,
    backgroundColor: 'rgba(239, 68, 68, 0.1)',
    borderWidth: 1,
    borderColor: 'rgba(239, 68, 68, 0.2)',
  },
});
