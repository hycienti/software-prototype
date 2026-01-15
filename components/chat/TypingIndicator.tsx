import React from 'react';
import { View } from 'react-native';
import Animated, {
  useAnimatedStyle,
  withRepeat,
  withTiming,
  interpolate,
} from 'react-native-reanimated';
import { cn } from '@/utils/cn';

export const TypingIndicator: React.FC = () => {
  const dots = [0, 1, 2];

  return (
    <View className="flex-row items-end gap-3">
      <View className="w-8 h-8 rounded-full bg-gray-300 dark:bg-gray-700 mb-1" />
      <View className="bg-sky-50 dark:bg-bubble-haven/50 px-4 py-3 rounded-2xl rounded-bl-sm">
        <View className="flex-row items-center gap-1 h-5">
          {dots.map((index) => (
            <AnimatedDot key={index} delay={index * 100} />
          ))}
        </View>
      </View>
    </View>
  );
};

const AnimatedDot: React.FC<{ delay: number }> = ({ delay }) => {
  const animatedStyle = useAnimatedStyle(() => {
    return {
      transform: [
        {
          translateY: withRepeat(
            withTiming(-4, { duration: 600 }),
            -1,
            true
          ),
        },
      ],
    };
  });

  return (
    <Animated.View
      style={[
        animatedStyle,
        {
          width: 8,
          height: 8,
          borderRadius: 4,
          backgroundColor: 'rgba(25, 179, 230, 0.4)',
        },
      ]}
    />
  );
};
