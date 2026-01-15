import React, { useState } from 'react';
import { View, Text, SafeAreaView, TouchableOpacity } from 'react-native';
import Animated, {
  useAnimatedStyle,
  withRepeat,
  withTiming,
  useSharedValue,
} from 'react-native-reanimated';
import { Icon } from '@/components/ui/Icon';
import { cn } from '@/utils/cn';

export const BoxBreathingScreen: React.FC = () => {
  const [isPaused, setIsPaused] = useState(false);
  const [currentPhase, setCurrentPhase] = useState<'inhale' | 'hold' | 'exhale' | 'hold2'>('inhale');
  const [count, setCount] = useState(4);
  const [cycle, setCycle] = useState(2);
  const [totalCycles] = useState(5);

  const scale = useSharedValue(1);

  React.useEffect(() => {
    if (!isPaused) {
      scale.value = withRepeat(
        withTiming(1.2, { duration: 4000 }),
        -1,
        true
      );
    }
  }, [isPaused]);

  const animatedStyle = useAnimatedStyle(() => {
    return {
      transform: [{ scale: scale.value }],
    };
  });

  return (
    <SafeAreaView className="flex-1 bg-background-dark">
      <View className="absolute top-0 left-0 right-0 h-1/3" style={{ backgroundColor: 'rgba(25, 179, 230, 0.05)' }} />
      <View className="absolute bottom-0 left-0 right-0 h-1/4 bg-background-dark" />

      <View className="flex-row items-center p-6 z-20">
        <TouchableOpacity className="p-2 rounded-full active:bg-white/5">
          <Icon name="close" size={28} color="rgba(255,255,255,0.8)" />
        </TouchableOpacity>
        <Text className="text-white text-base font-semibold tracking-wide flex-1 text-center opacity-80">
          Box Breathing
        </Text>
        <TouchableOpacity className="p-2 rounded-full active:bg-white/5">
          <Icon name="settings" size={28} color="rgba(255,255,255,0.8)" />
        </TouchableOpacity>
      </View>

      <View className="flex-1 items-center justify-center p-6">
        <View className="relative aspect-square w-full max-w-[320px] items-center justify-center">
          <View className="absolute inset-0 rounded-[2rem] border-2 border-white/5" />
          <View className="absolute top-0 left-0 w-full h-full rounded-[2rem] border-t-2 border-primary" />
          <View className="absolute -top-[5px] left-1/2 -translate-x-1/2 w-3 h-3 bg-white rounded-full" />
          <View className="relative w-full h-full p-8 items-center justify-center z-10">
            <Animated.View
              style={[
                animatedStyle,
                {
                  width: '100%',
                  height: '100%',
                  borderRadius: 9999,
                  backgroundColor: 'rgba(25, 179, 230, 0.2)',
                  borderWidth: 1,
                  borderColor: 'rgba(255, 255, 255, 0.05)',
                },
              ]}
            >
              <View className="absolute inset-4 rounded-full bg-primary/20 blur-2xl" />
              <View className="relative z-20 items-center justify-center flex-1">
                <Text className="text-primary font-medium text-xl tracking-widest uppercase mb-2">
                  Breathe In
                </Text>
                <Text className="text-white text-[5rem] font-thin leading-none tracking-tight tabular-nums">
                  {count}
                  <Text className="text-3xl font-light text-white/50 ml-1">s</Text>
                </Text>
              </View>
            </Animated.View>
          </View>
        </View>
      </View>

      <View className="w-full p-8 pb-10 items-center gap-8 z-20 bg-gradient-to-t from-background-dark to-transparent">
        <View className="w-full max-w-sm flex-col gap-3">
          <View className="flex-row justify-between items-end px-1">
            <Text className="text-white/60 text-sm font-medium tracking-wide">
              Cycle {cycle} of {totalCycles}
            </Text>
            <Text className="text-white/40 text-xs font-medium">04:30 remaining</Text>
          </View>
          <View className="h-1.5 w-full bg-white/10 rounded-full overflow-hidden">
            <View
              className="h-full bg-gradient-to-r from-primary to-secondary-green rounded-full"
              style={{ width: `${(cycle / totalCycles) * 100}%` }}
            />
          </View>
        </View>

        <View className="flex-row items-center gap-8">
          <TouchableOpacity className="p-3 rounded-full active:bg-white/5">
            <Icon name="restart_alt" size={28} color="rgba(255,255,255,0.4)" />
          </TouchableOpacity>
          <TouchableOpacity
            onPress={() => setIsPaused(!isPaused)}
            className="w-20 h-20 rounded-full bg-white/5 border border-white/10 items-center justify-center active:bg-white/10"
          >
            <Icon
              name={isPaused ? 'play_arrow' : 'pause'}
              size={40}
              color="#fff"
            />
          </TouchableOpacity>
          <TouchableOpacity className="p-3 rounded-full active:bg-white/5">
            <Icon name="volume_up" size={28} color="rgba(255,255,255,0.4)" />
          </TouchableOpacity>
        </View>
      </View>
    </SafeAreaView>
  );
};
