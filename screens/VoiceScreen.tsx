import React from 'react';
import { View, Text, SafeAreaView, TouchableOpacity } from 'react-native';
import Animated, {
  useAnimatedStyle,
  withRepeat,
  withTiming,
  interpolate,
  useSharedValue,
} from 'react-native-reanimated';
import { Icon } from '@/components/ui/Icon';
import { cn } from '@/utils/cn';

export const VoiceScreen: React.FC = () => {
  const scale = useSharedValue(1);
  const rotation = useSharedValue(0);

  React.useEffect(() => {
    scale.value = withRepeat(
      withTiming(1.05, { duration: 2000 }),
      -1,
      true
    );
    rotation.value = withRepeat(
      withTiming(360, { duration: 10000 }),
      -1,
      false
    );
  }, []);

  const blobStyle = useAnimatedStyle(() => {
    return {
      transform: [
        { scale: scale.value },
        { rotate: `${rotation.value}deg` },
      ],
    };
  });

  return (
    <SafeAreaView className="flex-1 bg-background-dark">
      <View className="absolute inset-0">
        <View className="absolute top-0 left-0 right-0 h-[80%] bg-gradient-to-b from-indigo-950/40 via-slate-900/20 to-transparent" />
        <View className="absolute -top-[20%] -left-[10%] w-[600px] h-[600px] bg-primary/10 rounded-full blur-[100px]" />
        <View className="absolute bottom-[10%] -right-[10%] w-[500px] h-[500px] bg-purple-900/20 rounded-full blur-[120px]" />
      </View>

      <View className="relative z-10 pt-12 pb-4 px-6 items-center">
        <View className="flex-row items-center gap-2 px-4 py-1.5 rounded-full bg-white/5 border border-white/5">
          <View className="relative h-2 w-2">
            <View className="absolute inset-0 rounded-full bg-primary opacity-75" />
            <View className="absolute inset-0 rounded-full bg-primary" />
          </View>
          <Text className="text-xs font-medium tracking-wide text-gray-300 uppercase">
            Live Session
          </Text>
        </View>
        <Text className="mt-4 text-2xl font-light tracking-wide text-white/90">
          I'm listening...
        </Text>
      </View>

      <View className="flex-1 items-center justify-center relative z-10">
        <View className="relative w-64 h-64 md:w-80 md:h-80">
          <Animated.View
            style={[
              blobStyle,
              {
                width: '100%',
                height: '100%',
                borderRadius: 100,
                backgroundColor: 'rgba(25, 179, 230, 0.2)',
                borderWidth: 1,
                borderColor: 'rgba(255, 255, 255, 0.1)',
              },
            ]}
          />
        </View>
      </View>

      <View className="relative z-10 pb-10 px-6">
        <View className="max-w-md mx-auto">
          <View className="bg-black/30 backdrop-blur-xl rounded-full p-2 flex-row items-center justify-between">
            <TouchableOpacity className="h-14 w-14 items-center justify-center rounded-full active:bg-white/10">
              <Icon name="keyboard" size={24} color="#d1d5db" />
            </TouchableOpacity>
            <View className="flex-1 h-12 flex-row items-center justify-center gap-1 mx-4 opacity-50">
              {[1, 2, 3, 4, 5].map((i) => (
                <View
                  key={i}
                  className="w-1 bg-primary rounded-full"
                  style={{ height: 12 + i * 4 }}
                />
              ))}
            </View>
            <TouchableOpacity className="h-14 w-14 items-center justify-center rounded-full bg-red-500/10 border border-red-500/20 active:bg-red-500/20">
              <Icon name="close" size={24} color="#f87171" />
            </TouchableOpacity>
          </View>
          <Text className="text-center text-white/20 text-[10px] mt-6 font-medium tracking-widest uppercase">
            Haven Voice Interface
          </Text>
        </View>
      </View>
    </SafeAreaView>
  );
};
