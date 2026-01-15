import React from 'react';
import { View, Image, StyleSheet } from 'react-native';
import Animated, {
  useAnimatedStyle,
  withRepeat,
  withTiming,
  Easing,
} from 'react-native-reanimated';

const typingAvatar = 'https://lh3.googleusercontent.com/aida-public/AB6AXuAe8RFfY736d1qSC7thn6DYIe8U1E7BqMCz1GYgbyFQMXGC_4OmwQ3n9ISRgGL7_t7Rrob7jmyLjO1p3-UA8PP7PSp2q0nLv633JPzCSJQ_5VUq_093DSHghXJe-uftMRmM2mp_7MnDOWMNtWTsnHxCiuhW-VZGXeyTDRvFRBDy5HY5A_7ZfgjrGkXKFEh2z6Hx7oQIU4GzxUjzClFlzv9uvKORvXmytJSieF0W2IYyhKTNRa-0ZJJXAlu9X64tnVSBv5_SeVjdu_4';

export const TypingIndicator: React.FC = () => {
  const dots = [0, 1, 2];

  return (
    <View style={styles.container}>
      <Image
        source={{ uri: typingAvatar }}
        style={styles.avatar}
        resizeMode="cover"
      />
      <View style={styles.bubble}>
        <View style={styles.dotsContainer}>
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
            withTiming(-4, { duration: 1200, easing: Easing.inOut(Easing.ease) }),
            -1,
            true
          ),
        },
      ],
    };
  });

  React.useEffect(() => {
    // Delay animation start
    const timer = setTimeout(() => {
      // Animation will start automatically
    }, delay);
    return () => clearTimeout(timer);
  }, [delay]);

  return (
    <Animated.View
      style={[
        animatedStyle,
        styles.dot,
      ]}
    />
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    gap: 12,
  },
  avatar: {
    width: 32,
    height: 32,
    borderRadius: 16,
    marginBottom: 4,
    flexShrink: 0,
  },
  bubble: {
    backgroundColor: 'rgba(30, 58, 69, 0.5)',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 16,
    borderBottomLeftRadius: 4,
  },
  dotsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    height: 20,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: 'rgba(25, 179, 230, 0.4)',
  },
});
