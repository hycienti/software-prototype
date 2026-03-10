import { useEffect } from 'react';
import Animated, {
  useAnimatedStyle,
  withRepeat,
  withTiming,
  interpolate,
  useSharedValue,
  Easing,
} from 'react-native-reanimated';
import type { VoiceState } from '@/screens/voice/voiceScreenTypes';

export interface VoiceAnimationsResult {
  blobStyle: ReturnType<typeof useAnimatedStyle>;
  pingStyle: ReturnType<typeof useAnimatedStyle>;
  listeningTextStyle: ReturnType<typeof useAnimatedStyle>;
  innerGlowStyle: ReturnType<typeof useAnimatedStyle>;
  ripple1Style: ReturnType<typeof useAnimatedStyle>;
  ripple2Style: ReturnType<typeof useAnimatedStyle>;
  ripple3Style: ReturnType<typeof useAnimatedStyle>;
  bar1Style: ReturnType<typeof useAnimatedStyle>;
  bar2Style: ReturnType<typeof useAnimatedStyle>;
  bar3Style: ReturnType<typeof useAnimatedStyle>;
  bar4Style: ReturnType<typeof useAnimatedStyle>;
  bar5Style: ReturnType<typeof useAnimatedStyle>;
}

export function useVoiceAnimations(voiceState: VoiceState, audioLevel: number): VoiceAnimationsResult {
  const blobProgress = useSharedValue(0);
  const innerGlowOpacity = useSharedValue(0.3);
  const pingScale = useSharedValue(1);
  const pingOpacity = useSharedValue(0.75);
  const listeningOpacity = useSharedValue(0.9);
  const ripple1 = useSharedValue(0.8);
  const ripple2 = useSharedValue(0.8);
  const ripple3 = useSharedValue(0.8);
  const bar1 = useSharedValue(0.3);
  const bar2 = useSharedValue(0.5);
  const bar3 = useSharedValue(0.8);
  const bar4 = useSharedValue(0.4);
  const bar5 = useSharedValue(0.3);

  useEffect(() => {
    blobProgress.value = withRepeat(
      withTiming(1, { duration: 10000, easing: Easing.inOut(Easing.ease) }),
      -1,
      true
    );
    innerGlowOpacity.value = withRepeat(
      withTiming(0.6, { duration: 4000, easing: Easing.inOut(Easing.ease) }),
      -1,
      true
    );
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
    listeningOpacity.value = withRepeat(
      withTiming(1, { duration: 2000, easing: Easing.inOut(Easing.ease) }),
      -1,
      true
    );

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
    const t2 = setTimeout(startRipple2, 1000);
    const t3 = setTimeout(startRipple3, 2000);

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

    return () => {
      clearTimeout(t2);
      clearTimeout(t3);
    };
  }, []);

  useEffect(() => {
    if (voiceState === 'listening') {
      const updateBars = () => {
        if (voiceState === 'listening' && audioLevel > 0) {
          const baseLevel = audioLevel;
          bar1.value = withTiming(baseLevel * 0.8, { duration: 100 });
          bar2.value = withTiming(baseLevel * 1.0, { duration: 100 });
          bar3.value = withTiming(baseLevel * 1.2, { duration: 100 });
          bar4.value = withTiming(baseLevel * 0.9, { duration: 100 });
          bar5.value = withTiming(baseLevel * 0.7, { duration: 100 });
        }
      };
      const interval = setInterval(updateBars, 100);
      return () => clearInterval(interval);
    }
    if (voiceState === 'speaking') {
      bar1.value = withRepeat(
        withTiming(1, { duration: 500, easing: Easing.inOut(Easing.ease) }),
        -1,
        true
      );
      bar2.value = withRepeat(
        withTiming(1, { duration: 600, easing: Easing.inOut(Easing.ease) }),
        -1,
        true
      );
      bar3.value = withRepeat(
        withTiming(1, { duration: 400, easing: Easing.inOut(Easing.ease) }),
        -1,
        true
      );
      bar4.value = withRepeat(
        withTiming(1, { duration: 750, easing: Easing.inOut(Easing.ease) }),
        -1,
        true
      );
      bar5.value = withRepeat(
        withTiming(1, { duration: 550, easing: Easing.inOut(Easing.ease) }),
        -1,
        true
      );
    } else {
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
    }
  }, [voiceState, audioLevel]);

  const blobStyle = useAnimatedStyle(() => {
    const borderRadius = interpolate(blobProgress.value, [0, 0.5, 1], [80, 50, 80]);
    const scale = interpolate(blobProgress.value, [0, 0.5, 1], [1, 1.05, 1]);
    const rotation = interpolate(blobProgress.value, [0, 0.5, 1], [0, 180, 360]);
    return {
      borderRadius,
      transform: [{ scale }, { rotate: `${rotation}deg` }],
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

  const bar1Style = useAnimatedStyle(() => ({
    height: interpolate(bar1.value, [0, 1], [12, 15]),
  }));
  const bar2Style = useAnimatedStyle(() => ({
    height: interpolate(bar2.value, [0, 1], [20, 25]),
  }));
  const bar3Style = useAnimatedStyle(() => ({
    height: interpolate(bar3.value, [0, 1], [32, 40]),
  }));
  const bar4Style = useAnimatedStyle(() => ({
    height: interpolate(bar4.value, [0, 1], [16, 20]),
  }));
  const bar5Style = useAnimatedStyle(() => ({
    height: interpolate(bar5.value, [0, 1], [12, 15]),
  }));

  return {
    blobStyle,
    pingStyle,
    listeningTextStyle,
    innerGlowStyle,
    ripple1Style,
    ripple2Style,
    ripple3Style,
    bar1Style,
    bar2Style,
    bar3Style,
    bar4Style,
    bar5Style,
  };
}
